# pedidos-front

Angular 7 order management system for "Libros Mario" bookstore. Manages orders, clients, and a book catalog.

## Prerequisites

- Node.js (v14–v16 recommended)
- npm

## Setup

```bash
npm install
```

## Running

```bash
# Node 14–16
npm start

# Node 17+ (requires OpenSSL legacy provider)
npm run start:legacy
```

The app runs at http://localhost:4200/.

## Configuration

Set the backend URL in `src/config.json`:

```json
{
    "baseUrl": "http://localhost:8080"
}
```

## Other Commands

- **Build**: `ng build` (production: `ng build --prod`)
- **Unit tests**: `ng test`
- **Lint**: `ng lint`
- **E2E tests**: `ng e2e`
