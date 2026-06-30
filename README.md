WMS Industrial v84

Mejoras aplicadas en vanos:
- Vanos representados como hueco real en 3D, sin sólido fantasma.
- En layout 2D la abertura queda embebida en el muro y el muro se dibuja con corte real.
- Selección y movimiento del vano mejorados con hit area sobre la abertura.
- Inspector actualizado con ancho, alto, alféizar, profundidad y posición.
- ZIP limpio con solo archivos necesarios de la app.


Actualización v89 FORCE:
- Esta versión parte del ZIP v84 que seguía cargando el modelo antiguo con rombos.
- Reemplacé directamente el renderer viejo de puertas en assets/app-main.runtimefix.js.
- Mantengo los nombres antiguos app-main.runtimefix.js/app.css y también agrego copias v89 para evitar que se cargue otra versión.
- Las puertas ahora se dibujan como panel rectangular técnico del modelo imagen 2.

Actualización v90:
- Corrección forzada de puertas: el renderer ya no debe mostrar el modelo delgado con rombos.
- Botón visible “Guardar layout” agregado en la barra superior y como botón flotante dentro del canvas.
- Badge visible: “v90 puertas modelo 2” para confirmar que se cargó el ZIP correcto.
- Solo quedan app-main.runtimefix.js y app.css para evitar que se cargue un asset duplicado.


Actualización v91 - auditoría completa:
- Falla encontrada: wrangler.toml publica desde public/, pero el ZIP no incluía carpeta public/. En Cloudflare podía no desplegar los cambios reales.
- Se agregó public/ con index, assets y _redirects, manteniendo también archivos en raíz para apertura local.
- Se eliminó la representación vieja tipo línea/rombos de los vanos y se fuerza el render rectangular modelo imagen 2 para todos los vanos.
- Se reemplazaron los rombos de aristas por círculos para que no parezcan puertas antiguas.
- Botón Guardar layout visible en barra superior y flotante.
- Badge visible v91 puertas modelo 2 para validar la versión cargada.


Actualización v92:
- El ancho visual de la abertura ahora usa el espesor del muro como máximo.
- El ancho visual mínimo es la mitad del espesor del muro.
- La cota superior del vano muestra ese ancho visual corregido.


Actualización v93:
- La puerta ahora se alinea a los extremos reales de la pared usando las caras del muro ya dibujadas.
- Ya no debe sobresalir por fuera del espesor visible del muro.
- El ancho visual y la cota superior siguen limitados por el espesor del muro.


Actualización v94:
- La puerta ahora toma como centro el centro real del muro.
- En muros automáticos, el centro se calcula desde la línea base más la mitad del espesor.
- Ya no debe quedar corrida por fuera del muro.

Actualización v95:
- El panel derecho de edición de layout conserva su scroll al cambiar propiedades.
- La pantalla activa se guarda en localStorage para no volver a Empresa/Admin al cambiar o recargar.
- El campo Ancho del vano/puerta ahora cambia la dimensión visible de la puerta sobre el muro.
- Se mantiene el ancho transversal de la abertura limitado por el espesor del muro.

Actualización v96:
- El zoom ya no reconstruye toda la vista de layout en cada paso.
- El zoom actualiza solo el viewport SVG, evitando el rebote de acercar/alejar.
- Se bloqueó el auto-fit durante unos milisegundos después de cada zoom para que no compita con el zoom manual.

Actualización v97:
- Se bloqueó el auto-fit al hacer clic en botones del layout.
- Los botones de zoom ya no reconstruyen la pantalla ni disparan reajuste automático.
- La vista se ajusta automáticamente solo al primer render o al usar el botón de ajustar vista.
