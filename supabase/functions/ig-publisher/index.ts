// Edge function: ig-publisher
// Reads next pending row from public.ig_publish_queue, creates the IG media
// container, and (once the container is FINISHED) publishes it.
//
// Called every 5 minutes by pg_cron -> net.http_post.
// verify_jwt = false; the function is idempotent and only reads/writes its own table.
//
// Token is stored in vault (secret name = 'ig_page_token') and read via the
// SECURITY DEFINER function public.get_ig_page_token() with service_role privs.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const IG_USER_ID = "17841425238793372"; // @jrdigutal
const V = "v24.0";
const MAX_ATTEMPTS = 5;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (_req: Request) => {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const t0 = Date.now();

  // 1. Get token from vault
  const { data: tokRow, error: tokErr } = await admin.rpc("get_ig_page_token");
  if (tokErr || !tokRow) {
    return json({ ok: false, error: "no_token", detail: tokErr?.message }, 500);
  }
  const PT: string = tokRow as unknown as string;

  const nowIso = new Date().toISOString();

  // 2. Get all rows we can act on (pending due, or container_pending)
  const { data: rows, error } = await admin
    .from("ig_publish_queue")
    .select("*")
    .in("status", ["pending", "container_pending"])
    .lte("scheduled_at", nowIso)
    .order("scheduled_at", { ascending: true })
    .limit(3); // do at most 3 per invocation to stay under function timeout

  if (error) return json({ ok: false, error: error.message }, 500);
  if (!rows || rows.length === 0) {
    return json({ ok: true, processed: 0, elapsed_ms: Date.now() - t0 });
  }

  const results: unknown[] = [];
  for (const row of rows) {
    const r = await handleRow(admin, PT, row);
    results.push(r);
  }

  return json({ ok: true, processed: rows.length, results, elapsed_ms: Date.now() - t0 });
});

// -----------------------------------------------------------------------------
async function handleRow(admin: ReturnType<typeof createClient>, PT: string, row: any) {
  const rowId: number = row.id;
  try {
    let creationId: string | null = row.creation_id;

    // Phase 1: create the container if it doesn't exist yet
    if (row.status === "pending" || !creationId) {
      const created = await createContainer(PT, row);
      if ("error" in created) {
        await markAttempt(admin, row, redact(PT, JSON.stringify(created.error)));
        return { id: rowId, phase: "create_container", error: created.error };
      }
      creationId = created.id;
      await admin
        .from("ig_publish_queue")
        .update({
          creation_id: creationId,
          status: "container_pending",
          container_created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", rowId);
    }

    // Phase 2: check container status
    const statusUrl =
      `https://graph.facebook.com/${V}/${creationId}?fields=status_code,status&access_token=${encodeURIComponent(PT)}`;
    const statusRes = await fetch(statusUrl);
    const statusData = await statusRes.json();
    const code = statusData.status_code;

    if (code === "ERROR") {
      await markAttempt(admin, row, redact(PT, JSON.stringify(statusData)));
      return { id: rowId, phase: "status_check", status_code: code };
    }
    if (code !== "FINISHED") {
      // Not ready. Return; next cron cycle will retry.
      return { id: rowId, phase: "status_check", status_code: code, waiting: true };
    }

    // Phase 3: publish the container
    const pubForm = new URLSearchParams({ creation_id: creationId!, access_token: PT });
    const pubRes = await fetch(`https://graph.facebook.com/${V}/${IG_USER_ID}/media_publish`, {
      method: "POST",
      body: pubForm,
    });
    const pubData = await pubRes.json();
    if (pubData.error) {
      await markAttempt(admin, row, redact(PT, JSON.stringify(pubData.error)));
      return { id: rowId, phase: "publish", error: pubData.error };
    }

    await admin
      .from("ig_publish_queue")
      .update({
        published_id: pubData.id,
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", rowId);

    return { id: rowId, phase: "published", published_id: pubData.id };
  } catch (e) {
    await markAttempt(admin, row, redact(PT, String(e)));
    return { id: rowId, phase: "exception", error: String(e) };
  }
}

async function createContainer(PT: string, row: any) {
  const params: Record<string, string> = {
    access_token: PT,
    caption: row.caption,
  };
  if (row.kind === "photo") {
    params.image_url = row.media_url;
  } else {
    params.media_type = "REELS";
    params.video_url = row.media_url;
    params.share_to_feed = "true";
  }
  const form = new URLSearchParams(params);
  const url = `https://graph.facebook.com/${V}/${IG_USER_ID}/media`;
  const res = await fetch(url, { method: "POST", body: form });
  return await res.json();
}

async function markAttempt(admin: any, row: any, error: string) {
  const attempts = (row.attempts ?? 0) + 1;
  const next: Record<string, unknown> = {
    attempts,
    error: error.slice(0, 4000),
    updated_at: new Date().toISOString(),
  };
  if (attempts >= MAX_ATTEMPTS) next.status = "failed";
  await admin.from("ig_publish_queue").update(next).eq("id", row.id);
}

function redact(PT: string, s: string): string {
  return s.split(PT).join("***");
}

function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
