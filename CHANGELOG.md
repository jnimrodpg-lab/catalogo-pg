# Historial de cambios

## v74 — Ajustes desde modo visualizador
- Si un visualizador (o alguien sin sesión) pulsa ⚙ Ajustes, ahora se abre el acceso de administrador en vez de oscurecer la pantalla sin mostrar nada. Al ingresar como admin, la sesión de visualizador se reemplaza.

## v73 — Informe de importación
- Al importar se muestra cuántas filas se leyeron del Sheet, cuántas se importaron y cuántas se omitieron y por qué (sin nombre/SKU/código de barras, o encabezados repetidos), con ejemplos de número de fila y las columnas usadas para identificar productos.
- Probado con un Sheet de 10.000 filas: importación completa y consultas en ~15 ms (entorno local).

## v72 — Sincronización automática y WhatsApp del negocio
- **Sincronización automática del Sheet** (Vincular Sheet → Sincronización automática: cada 1, 3, 6, 12 o 24 h). Pages no tiene tareas programadas, así que la consulta que detecta un catálogo vencido lanza la reimportación en segundo plano (`waitUntil`): el visitante no espera. Si el Sheet falla, se reintenta a los 30 minutos.
- Se muestra la fecha de la última importación.
- **WhatsApp del negocio** (Configuración → Identidad): la solicitud del cliente llega directo a ese número y saluda con el nombre de la tienda.
- **Búsqueda del cliente sin ubicación ni almacén**: los clientes ya no encuentran productos escribiendo un código de ubicación (salvo que el dueño haga visibles esos campos).
- Chip "Público: Mujer/Niño…" en los filtros aplicados, con su ×.
- **Reindexado automático**: cuando cambia la forma de indexar, cada catálogo se reindexa solo desde sus productos guardados, sin volver a leer el Sheet ni cambiar la fecha de importación. Así las correcciones de v71 se aplican sin reimportar.
- Bloqueo por sucursal: dos importaciones a la vez ya no compiten; la segunda recibe "importación en curso".
- Las celdas con el nombre del campo como valor ("Color", "Talla"…) también se limpian al reindexar.

## v71 — Correcciones de datos
- Los productos sin nombre ya no aparecen primero: van al final y se muestran como "Marca · SKU …" en vez de "Sin nombre".
- Las celdas que repiten el nombre de su columna (p. ej. "Color" en la columna Color) se ignoran al importar; también las filas de encabezado repetidas dentro del Sheet.
- Textos en singular cuando corresponde ("1 talla · 1 color").
- La API usaba 1 resultado por página si no se enviaba `limit`; ahora usa el valor por defecto.

## v70 — Seguridad, configuración en servidor y consultas SQL

### Seguridad
- `GET /api/app-state` ya no responde sin sesión; `POST /api/app-state` exige admin (antes un visitante anónimo podía sobrescribirlo).
- `/api/sheets/*` exige sesión de administrador; `/api/drive-video` exige sesión o un link público activo (`?t=`), y ya no envía CORS `*`.
- Contraseñas con PBKDF2-SHA256 (100k iteraciones) y comparación en tiempo constante. Los hashes antiguos se migran solos al iniciar sesión.
- Límite de intentos en login (8 por usuario/15 min), registro (5 por IP/hora) y cambio de contraseña.
- La contraseña del admin ya no está en `wrangler.toml`: se define como secreto `ADMIN_PASSWORD`.
- Clientes y viewers reciben productos **sin** ubicación, almacén, stock, precio ni SKU salvo que el dueño los habilite. El link público ya no expone la URL del Google Sheet ni el mapeo de columnas.
- Las escrituras desde otro origen se rechazan (CSRF). Los errores ya no devuelven rutas ni detalles internos.
- Validación de URLs de imagen/video/logo en el frontend (solo `http(s)` o `data:image`).
- Cabeceras de seguridad en `public/_headers`.

### Errores corregidos
- La configuración del dueño (campos visibles, nombre y logo) se guardaba en el navegador del admin y **nunca llegaba a los clientes**. Ahora vive en D1 (`company_settings`).
- Borrar una sucursal dejaba sus productos y su link público funcionando. Ahora borra en cascada y desactiva los links.
- Elegir una categoría por público (Mujer, Niño…) no filtraba por público. Ahora sí (`audience`).
- Los links `/viewer/<token>` cargaban CSS/JS con rutas relativas que se resolvían mal. Ahora son absolutas.
- Diseño móvil: la barra de filtros tapaba la lista y el visor de producto se veía recortado.

### Rendimiento
- Nueva tabla `catalog_products` con columnas normalizadas e índices: filtros, búsqueda, agrupación y paginación se hacen en SQL. Antes cada búsqueda leía y parseaba todo el catálogo.
- Facets, resumen e índice de categorías se precalculan al importar (`catalog_meta`).
- El explorador de categorías usa ese índice en vez de descargar hasta 5.000 familias con todas sus variantes.
- Importación hecha por el servidor (`POST /api/branches/:id/import`): el navegador ya no descarga 50.000 filas para volver a subirlas. Se insertan con `json_each` (pocas sentencias) en staging y se intercambian en un batch transaccional, así un fallo nunca deja el catálogo a medias.
- Las sesiones solo se renuevan cuando les queda menos de la mitad del tiempo (antes, una escritura por request). Limpieza ocasional de sesiones vencidas.
- El esquema se aplica una vez por versión, no en cada arranque.
- Búsqueda mientras se escribe (350 ms) y cancelación de respuestas viejas.

### Nuevo
- Regenerar el link de cliente (invalida el anterior).
- Cambio de contraseña en Configuración → Seguridad de la cuenta, con aviso si la contraseña es débil.
- El logo se reduce a 256 px antes de guardarse.

### Mantenimiento
- Backend separado en módulos (`lib/`). Se eliminaron las copias duplicadas de `index.html` y `assets/` de la raíz y el `public/README.md` (se publicaba).
- `package.json` con scripts reales; pruebas en `tests/`.
- Los catálogos existentes se migran solos a la tabla nueva la primera vez que se consultan.

---

## Versiones anteriores



V6
- Corrige jerarquía visual del visor: la card del producto seleccionado queda al frente y las tarjetas Anterior / Siguiente quedan detrás.


V7
- Corrige de forma forzada la jerarquía del visor: la card principal se monta temporalmente en el body y usa z-index superior al overlay y a las cards Anterior/Siguiente.
- Verificado con `node --check` en `public/assets/app-main.js`.

V10
- Ajusta proporción del visor usando como referencia el ZIP v14 proporcionado.
- Imagen/video ocupa todo el alto del área izquierda del card.
- Panel de información queda compacto y sin scroll interno en escritorio.
- Mejora contraste y lectura de chips de color.


V12
- Ajusta el visor para acercarlo al diseño de referencia: card 16:9, media full-bleed y panel derecho glass overlay interno.

## V14 UX/UI
- Se separa mejor la experiencia Admin vs Viewer.
- Viewer público/cliente abre sin sidebar administrativo, con topbar limpia y buscador principal.
- Resultados agrupados por producto con CTA visual "Ver producto".
- Configuración de propietario para elegir qué campos aparecen en la card del cliente.
- Botón WhatsApp opcional para compartir producto.
- Checklist de publicación: sucursal, Sheet, productos y link cliente.


V15
- Limpia el panel de información del visor: oculta ubicación/almacén para cliente, elimina botones redundantes y deja un único CTA “Solicitar ahora”.
- Ajusta tamaños, espaciados y distribución para evitar que tallas, colores y botones se monten.

V17
- Agrega flujo de solicitud/mini carrito para clientes.
- Reemplaza el CTA principal por “Agregar a solicitud” con estado “Agregado ✓”.
- Agrega panel flotante para revisar, quitar, copiar y enviar la solicitud.
- Limpia la vista viewer con resultados tipo cards compactas y sin campos internos como ubicación/almacén.
- Mantiene configuración de campos visibles para propietario y comportamiento solo lectura para viewer.


V19
- Ajusta offset del panel de información del visor a 6px arriba, abajo y derecha.
- Oculta etiqueta Producto y texto de familia agrupada.
- Reubica botón de cierre visualmente dentro del panel de información.

## v43 fix
Esta versión sincroniza los cambios Champagne Luxury también dentro de /public, que es la carpeta usada por Cloudflare Pages. Incluye:
- Paleta Champagne Luxury aplicada.
- Botón "Buscar por categoría" en la misma fila del buscador.
- Opción "Categorías" removida de la barra lateral izquierda.
- Filtro de categoría oculto del panel lateral, manteniendo compatibilidad interna.


Actualización v53:
- Se agregó el selector de Categoría dentro del panel lateral de Filtros, justo debajo del encabezado y manteniendo también el botón Categoría junto al buscador.


Actualización v58:
- Se agregó un botón flotante de engranaje visible en Vincular Sheet y Configuración.
- El engranaje permite reabrir el panel de opciones sin recargar ni volver al catálogo.
- Se mantiene oculto en vista catálogo para no duplicar el botón de Ajustes del lateral.


Actualización v67:
- Viewer puede entrar sin usuario/contraseña desde el selector de acceso.
- Lista central en 2 columnas de productos.
- Se ocultó el contador de variantes dentro de cada card/listado.
