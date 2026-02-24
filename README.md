# pedidos-front

Angular 16 order management system for "Libros Mario" bookstore. Manages orders, clients, and a book catalog.

## Prerequisites

- Node.js v18+
- npm

## Setup

```bash
npm install
```

## Running

```bash
npm start
```

The app runs at http://localhost:4200/.

## Configuration

Set the backend URL in `src/config.json`:

```json
{
    "baseUrl": "http://localhost:8080"
}
```

## Docker / Nginx Deployment

The Dockerfile builds the Angular app and serves it with Nginx. However, the Nginx configuration is **not** baked into the image — it must be volume-mounted on the server.

1. Copy `deploy/data/nginx/default.conf` to the server (e.g. `/path/to/data/nginx/default.conf`)
2. Mount it as a volume in your docker-compose or docker run command:

```yaml
# docker-compose example
pedidos-fo:
  image: sergioseva/pedidos-front:remitos_users_v1
  volumes:
    - /path/to/data/nginx/default.conf:/etc/nginx/conf.d/default.conf
```

This config handles proxying `/api/` requests to the backend container (`pedidos-app:8080`). If you add new backend endpoints under a new `/api/<prefix>/` path, you must add a corresponding `location` block in `default.conf` to prevent the catch-all `/api/` rule from stripping the `/api` prefix.

The `deploy/config/config.json` file should also be mounted to `/usr/share/nginx/html/config.json` if you need to override the default backend URL.

## CI/CD

Automated via GitHub Actions (`.github/workflows/release.yml`):

- **Push to `master`** → builds and pushes `ghcr.io/sergioseva/pedidos-front:master` → deploys to staging (`test.librosmario.store`)
- **Push tag `v*`** → builds and pushes `:v1.0.0` + `:latest` → deploys to production (`pedidos.librosmario.store`)

### Rollback

Go to **Actions > Rollback > Run workflow**, pick the version tag (e.g. `v1.0.0`) and environment.

### Version check

The running version is available at:

```bash
curl https://pedidos.librosmario.store/version.json
# {"version":"v1.0.0"}
```

On staging the version shows `master`.

## Other Commands

- **Build**: `ng build` (production: `ng build --configuration production`)
- **Unit tests**: `ng test`
- **Lint**: `ng lint`
