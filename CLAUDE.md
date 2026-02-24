# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 16 order management system for a bookstore ("Libros Mario"). Manages orders (pedidos), clients, and a book catalog with ISBN lookup via OpenLibrary. Spanish-language codebase.

## Commands

- **Dev server**: `npm start` (requires Node 18+)
- **Build**: `ng build` (production: `ng build --configuration production`)
- **Unit tests**: `ng test`
- **Single test**: modify the spec file's `describe`/`it` to `fdescribe`/`fit`, then `ng test`
- **Lint**: `ng lint`

## Configuration

Backend URL is configured in `src/config.json`. Fallback URL (if config fails to load) is in `src/app/app.module.ts` inside the `APP_INITIALIZER` `catchError` block.

## Architecture

**Single-module Angular app** — all components eagerly loaded in `AppModule` (`src/app/app.module.ts`). No lazy loading or feature modules.

### Key directories under `src/app/`

- **`components/`** — Feature components: `pedido/` (single order), `pedidos/` (order list), `pedido-distribuidora/` (distributor orders), `cliente/`/`clientes/`, `libros/`, `login/`, `registro/`, `home/`, `impresiones/` (print)
- **`providers/`** — Domain services (despite the folder name, these are Angular services): `pedidos.service`, `clientes-service.service`, `libros.service`, `pedido-items.service`, `distribuidora.service`, `pedido-distribuidora.service`, `config.service`, `print-pedido.service`
- **`services/`** — Core infrastructure: `auth.service` (JWT auth), `custom-http-client.service` (HTTP wrapper adding Bearer token)
- **`models/`** — TypeScript classes: `PedidoModel`, `ClienteModel`, `LibroModel`, `PedidoItemModel`, `UsuarioModel`, `DistribuidoraModel`
- **`guards/`** — `AuthGuard` protecting all routes except `/login` and `/registro`
- **`pipes/`** — `PedidoLibrosPipe`, `LibroImagenPipe`
- **`directives/`** — `DisableControlDirective`

### Routing

Defined in `src/app/app.routes.ts`. All authenticated routes use `AuthGuard`. A named outlet `'print'` handles print views via `PrintLayoutComponent`/`PedidoImpresoComponent`.

### State Management

No NgRx/Redux. Services use RxJS `BehaviorSubject` for reactive state:
- `PedidosService` — current order state
- `AuthService` — login status

### API Communication

`CustomHttpClientService` wraps Angular `HttpClient`, automatically injecting JWT Bearer tokens from `localStorage`. All domain services use this wrapper. Base URL comes from `ConfigService` (loaded from `src/config.json`). Some API responses use HAL/HATEOAS format (`_embedded` property).

### Authentication

JWT tokens stored in `localStorage` (`'token'` and `'expira'` keys). Token decoded with `jwt-decode`. `AuthGuard` checks expiration before allowing route access.

### Models

`PedidoModel` has business logic methods: `calcularTotal()`, `addPedidoItem()`, `removePedidoItem()`.

## Linting Rules

ESLint with `@angular-eslint` and `@typescript-eslint`. Config in `.eslintrc.json`.
- Single quotes, semicolons required, triple-equals enforced
- Max line length: 140 characters
- Component prefix: `app-`

## Deployment

Multi-stage Dockerfile: Node 18 builder → Nginx Alpine. Output goes to `dist/libreria/`.
