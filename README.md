# Catálogo Visual Cliente · v4 Modelo 1

App Cloudflare Pages + Functions + D1 para consulta de productos desde Google Sheets.

## Cambios v4
- Interfaz adaptada al Modelo 1 de búsqueda.
- Buscador simple y visible para cliente.
- Resultados agrupados por nombre de producto/marca.
- Lista con miniatura, variantes, colores y tallas.
- Panel derecho de producto seleccionado dentro del modo búsqueda.
- Click en producto o en `Abrir visor` para abrir card expandida.
- Modo Admin conserva edición, vinculación Sheet, importación y generación de link cliente.
- Modo Viewer queda solo lectura: buscar, seleccionar y visualizar productos.

## Cloudflare Pages
- Build command: vacío
- Build output directory: `public`
- D1 binding: `DB`


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
