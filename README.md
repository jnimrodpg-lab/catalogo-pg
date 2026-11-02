# Catálogo Visual

Catálogo para clientes alimentado desde Google Sheets. Corre en **Cloudflare Pages + Functions + D1**.

- **Admin**: vincula un Sheet, mapea columnas, importa productos, configura qué ve el cliente y genera el link público.
- **Cliente** (`/viewer/<token>`) o **viewer**: busca, filtra, ve variantes y arma una solicitud por WhatsApp. Solo lectura.

## Estructura

```
public/                 Frontend estático (lo que publica Pages)
functions/api/[[path]].js  Router de la API
lib/                    Lógica: auth, catálogo (SQL), Google Sheets, configuración, esquema
migrations/             SQL para D1 (la API también crea las tablas sola)
tests/                  Servidor local con D1 simulado + pruebas de la API
```

## Despliegue

1. Cloudflare Pages → Build command: vacío · Output directory: `public` · binding D1: `DB`.
2. Contraseña del admin inicial (solo se usa con la base vacía):
   ```bash
   npx wrangler pages secret put ADMIN_PASSWORD
   ```
3. Opcional: aplicar migraciones manualmente con `npm run db:migrate`.

> **Si ya tienes el sitio publicado:** el usuario `admin` existente conserva su contraseña. Si sigue siendo `admin123`, cámbiala desde *Configuración → Seguridad de la cuenta*; la app avisa al iniciar sesión.

### Variables (`wrangler.toml`)
| Variable | Uso |
|---|---|
| `ADMIN_USERNAME` | Usuario admin inicial |
| `ADMIN_PASSWORD` | **Secreto.** Contraseña del admin inicial |
| `ALLOW_PUBLIC_REGISTER` | `"false"` desactiva el registro público de cuentas |
| `PBKDF2_ITERATIONS` | Coste del hash de contraseñas (máx. 100000) |

## Desarrollo local

Con Cloudflare: `npm install && npm run dev`.

Sin Cloudflare (Node 22+, sin dependencias): servidor con D1 simulado sobre SQLite y un Sheet de ejemplo con 3.000 filas.
```bash
npm run test:server      # http://localhost:8788  (admin / admin123)
npm run test:api         # en otra terminal: 56 pruebas de la API
```

## API principal

| Método y ruta | Acceso |
|---|---|
| `POST /api/login`, `/viewer-login`, `/register`, `/logout`, `/password` | — |
| `GET/PUT /api/settings` (`ui_config`, `branding`, `business.whatsapp`, `business.sync_hours`) | sesión / admin |
| `GET /api/branches` · `POST` · `PUT/DELETE /api/branches/:id` | sesión / admin |
| `GET /api/branches/:id/products?q=&brand=&category=&size=&color=&audience=&page=&limit=&group_by=name` | sesión |
| `GET /api/branches/:id/catalog-index` | sesión |
| `GET/POST /api/branches/:id/sheet` · `POST /api/branches/:id/import` | admin |
| `POST /api/branches/:id/view-link` (`{"rotate":true}` para regenerar) | admin |
| `GET /api/view-links/:token`, `/products`, `/catalog-index` | público |
| `GET /api/sheets/probe?url=&sheet=` | admin |

## Sincronización automática

En *Vincular Sheet* elige la frecuencia. Cuando alguien abre el catálogo y la última importación es más antigua que esa frecuencia, el servidor reimporta en segundo plano. Si nadie visita el catálogo, no se sincroniza (no hay costo); la próxima visita lo actualiza. El cliente que dispara la sincronización ve todavía los datos anteriores; los siguientes ven los nuevos.

Historial: ver [CHANGELOG.md](CHANGELOG.md).
