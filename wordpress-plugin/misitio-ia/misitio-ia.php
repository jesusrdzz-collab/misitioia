<?php
/**
 * Plugin Name:       MiSitio IA — Victoria + Auditoría AEO
 * Plugin URI:        https://misitio.site/instalar
 * Description:        Agrega el asistente de ventas Victoria a tu sitio de WordPress y corre una auditoría AEO (para buscadores e IA). No modifica tu contenido: solo inserta el widget y analiza tu página.
 * Version:           1.0.0
 * Author:            MiSitio IA
 * Author URI:        https://misitio.site
 * License:           GPL-2.0-or-later
 * Text Domain:       misitio-ia
 *
 * Es un envoltorio (wrapper) del mismo snippet universal que se sirve desde
 * https://misitio.site/embed/v1.js. El plugin solo administra el token del sitio
 * y encola ese script en el pie de página con el atributo data-site.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Sin acceso directo.
}

define( 'MISITIO_IA_VERSION', '1.0.0' );
define( 'MISITIO_IA_HANDLE', 'misitio-ia-embed' );

/**
 * Base del snippet. Se puede sobreescribir con el filtro 'misitio_ia_base_url'
 * (por si el dominio de la plataforma cambia).
 */
function misitio_ia_base_url() {
	return apply_filters( 'misitio_ia_base_url', 'https://misitio.site' );
}

/** Token configurado por el dueño del sitio. */
function misitio_ia_token() {
	return trim( (string) get_option( 'misitio_ia_token', '' ) );
}

/* -------------------------------------------------------------------------
 *  Encolar el snippet en el frontend
 * ---------------------------------------------------------------------- */

add_action( 'wp_enqueue_scripts', 'misitio_ia_enqueue' );
function misitio_ia_enqueue() {
	$token = misitio_ia_token();
	if ( empty( $token ) ) {
		return; // Sin token no se carga nada.
	}
	$src = misitio_ia_base_url() . '/embed/v1.js';
	wp_enqueue_script( MISITIO_IA_HANDLE, $src, array(), MISITIO_IA_VERSION, true );
}

/**
 * Agrega data-site y async a la etiqueta <script> del snippet.
 * WordPress no expone atributos arbitrarios en wp_enqueue_script, así que se
 * inyectan filtrando la etiqueta generada.
 */
add_filter( 'script_loader_tag', 'misitio_ia_script_attrs', 10, 3 );
function misitio_ia_script_attrs( $tag, $handle, $src ) {
	if ( MISITIO_IA_HANDLE !== $handle ) {
		return $tag;
	}
	$token = esc_attr( misitio_ia_token() );
	$tag   = '<script src="' . esc_url( $src ) . '" data-site="' . $token . '" async></script>' . "\n";
	return $tag;
}

/* -------------------------------------------------------------------------
 *  Pantalla de ajustes (Ajustes → MiSitio IA)
 * ---------------------------------------------------------------------- */

add_action( 'admin_menu', 'misitio_ia_admin_menu' );
function misitio_ia_admin_menu() {
	add_options_page(
		'MiSitio IA',
		'MiSitio IA',
		'manage_options',
		'misitio-ia',
		'misitio_ia_settings_page'
	);
}

add_action( 'admin_init', 'misitio_ia_register_settings' );
function misitio_ia_register_settings() {
	register_setting(
		'misitio_ia_settings',
		'misitio_ia_token',
		array(
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
			'default'           => '',
		)
	);
}

function misitio_ia_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$token = misitio_ia_token();
	?>
	<div class="wrap">
		<h1>MiSitio IA</h1>
		<p>
			Pega el <strong>token</strong> de tu sitio (lo obtienes en
			<a href="<?php echo esc_url( misitio_ia_base_url() . '/instalar' ); ?>" target="_blank" rel="noopener">misitio.site/instalar</a>).
			Con eso se activa el asistente <strong>Victoria</strong> y la auditoría AEO de tu página.
		</p>
		<form method="post" action="options.php">
			<?php settings_fields( 'misitio_ia_settings' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="misitio_ia_token">Token del sitio</label></th>
					<td>
						<input
							name="misitio_ia_token"
							id="misitio_ia_token"
							type="text"
							value="<?php echo esc_attr( $token ); ?>"
							placeholder="mst_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
							class="regular-text"
						/>
						<p class="description">Empieza con <code>mst_</code>. No lo compartas públicamente.</p>
					</td>
				</tr>
			</table>
			<?php submit_button( 'Guardar token' ); ?>
		</form>

		<?php if ( ! empty( $token ) ) : ?>
			<div class="notice notice-success inline"><p>
				Victoria está activa en tu sitio. Abre tu página y revisa la burbuja de chat abajo a la derecha.
			</p></div>
		<?php else : ?>
			<div class="notice notice-warning inline"><p>
				Todavía no has puesto tu token, así que el widget no se carga.
			</p></div>
		<?php endif; ?>
	</div>
	<?php
}

/** Enlace directo a Ajustes desde la lista de plugins. */
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'misitio_ia_action_links' );
function misitio_ia_action_links( $links ) {
	$settings = '<a href="' . esc_url( admin_url( 'options-general.php?page=misitio-ia' ) ) . '">Ajustes</a>';
	array_unshift( $links, $settings );
	return $links;
}
