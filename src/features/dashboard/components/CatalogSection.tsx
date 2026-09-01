'use client'

import { useState, useTransition } from 'react'
import type { SiteProduct } from '@/lib/types/site'
import { upsertProduct, deleteProduct, listProducts, type ProductInput } from '../actions'
import { Banner, Card, inputClass, labelClass, type Feedback } from './ui'

/** Catálogo de productos: alta/edición/borrado con Server Actions. */

const emptyDraft: ProductInput = {
  name: '',
  description: '',
  price: null,
  currency: 'MXN',
  category: '',
  is_active: true,
}

export function CatalogSection({ siteId, initial }: { siteId: string; initial: SiteProduct[] }) {
  const [products, setProducts] = useState<SiteProduct[]>(initial)
  const [draft, setDraft] = useState<ProductInput>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [pending, startTransition] = useTransition()

  async function refresh() {
    const fresh = await listProducts(siteId)
    setProducts(fresh)
  }

  function startEdit(p: SiteProduct) {
    setEditingId(p.id)
    setDraft({
      id: p.id,
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      currency: p.currency || 'MXN',
      category: p.category ?? '',
      image_url: p.image_url ?? '',
      is_active: p.is_active,
      sort_order: p.sort_order,
    })
  }
  function cancelEdit() {
    setEditingId(null)
    setDraft(emptyDraft)
  }

  function submit() {
    setFeedback(null)
    if (!draft.name.trim()) {
      setFeedback({ kind: 'error', text: 'El producto necesita un nombre.' })
      return
    }
    const payload: ProductInput = {
      ...draft,
      name: draft.name.trim(),
      description: (draft.description ?? '').toString().trim() || null,
      category: (draft.category ?? '').toString().trim() || null,
      image_url: (draft.image_url ?? '').toString().trim() || null,
      currency: draft.currency || 'MXN',
    }
    startTransition(async () => {
      const res = await upsertProduct(siteId, payload)
      if (res.ok) {
        await refresh()
        cancelEdit()
        setFeedback({ kind: 'ok', text: 'Producto guardado.' })
      } else {
        setFeedback({ kind: 'error', text: res.error ?? 'No se pudo guardar.' })
      }
    })
  }

  function remove(id: string) {
    setFeedback(null)
    startTransition(async () => {
      const res = await deleteProduct(siteId, id)
      if (res.ok) {
        await refresh()
        if (editingId === id) cancelEdit()
        setFeedback({ kind: 'ok', text: 'Producto eliminado.' })
      } else {
        setFeedback({ kind: 'error', text: res.error ?? 'No se pudo eliminar.' })
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <Banner feedback={feedback} />
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          {editingId ? 'Editar producto' : 'Agregar producto'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nombre</label>
            <input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Minisplit 1 ton" />
          </div>
          <div>
            <label className={labelClass}>Precio</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              value={draft.price ?? ''}
              onChange={(e) => setDraft({ ...draft, price: e.target.value === '' ? null : Number(e.target.value) })}
              placeholder="6500"
            />
          </div>
          <div>
            <label className={labelClass}>Moneda</label>
            <input className={inputClass} value={draft.currency ?? 'MXN'} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} placeholder="MXN" maxLength={8} />
          </div>
          <div>
            <label className={labelClass}>Categoría</label>
            <input className={inputClass} value={draft.category ?? ''} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Minisplits" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-700 pb-2.5">
              <input
                type="checkbox"
                checked={draft.is_active ?? true}
                onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Visible en el sitio
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Descripción</label>
            <textarea className={`${inputClass} resize-y`} rows={2} value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Detalle del producto (opcional)" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={submit}
            disabled={pending}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar al catálogo'}
          </button>
          {editingId && (
            <button onClick={cancelEdit} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Productos ({products.length})</h3>
        {products.length === 0 ? (
          <p className="text-sm text-gray-400">Tu catálogo está vacío. Agrega tu primer producto arriba.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 pr-3 font-medium">Producto</th>
                  <th className="pb-2 pr-3 font-medium">Precio</th>
                  <th className="pb-2 pr-3 font-medium">Categoría</th>
                  <th className="pb-2 pr-3 font-medium">Estado</th>
                  <th className="pb-2 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="py-2.5 pr-3 font-medium text-gray-900">{p.name}</td>
                    <td className="py-2.5 pr-3 text-gray-600 whitespace-nowrap">
                      {p.price != null ? `$${p.price.toLocaleString('es-MX')} ${p.currency}` : '—'}
                    </td>
                    <td className="py-2.5 pr-3 text-gray-500">{p.category || '—'}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_active ? 'Visible' : 'Oculto'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <button onClick={() => startEdit(p)} className="text-blue-600 hover:underline font-medium mr-3">Editar</button>
                      <button onClick={() => remove(p.id)} disabled={pending} className="text-red-600 hover:underline font-medium disabled:opacity-50">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
