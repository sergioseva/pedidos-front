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

- **`components/`** — Feature components: `pedido/` (single order), `pedidos/` (order list), `pedido-distribuidora/` (distributor orders), `cliente/`/`clientes/`, `libros/`, `venta/`/`ventas/`, `remito/`/`remitos/`, `comercio/`/`comercios/`, `estado-cuenta-consignacion/`, `login/`, `registro/`, `home/`, `impresiones/` (print)
- **`providers/`** — Domain services (despite the folder name, these are Angular services): `pedidos.service`, `clientes-service.service`, `libros.service`, `pedido-items.service`, `distribuidora.service`, `pedido-distribuidora.service`, `remitos.service`, `comercio.service`, `ventas.service`, `config.service`, `print-pedido.service`, `print-remito.service`
- **`services/`** — Core infrastructure: `auth.service` (JWT auth), `custom-http-client.service` (HTTP wrapper adding Bearer token)
- **`models/`** — TypeScript classes: `PedidoModel`, `ClienteModel`, `LibroModel`, `PedidoItemModel`, `UsuarioModel`, `DistribuidoraModel`, `RemitoModel`, `ComercioModel`, `ReciboModel`, `LiquidacionModel`
- **`guards/`** — `AuthGuard` protecting all routes except `/login` and `/registro`
- **`pipes/`** — `PedidoLibrosPipe`, `LibroImagenPipe`
- **`directives/`** — `DisableControlDirective`

### Routing

Defined in `src/app/app.routes.ts`. All authenticated routes use `AuthGuard`; admin-only screens use `AdminGuard`. A named outlet `'print'` handles print views via `PrintLayoutComponent` and its children (`printpedido`, `printremito`, `printrecibo`, `printestadocuenta`).

### Remitos and consignment

`RemitoComponent` and `RemitosComponent` are **shared by every remito type** and read `data.tipo` from the route (`remito`/`remitos` for returns to distributors, `remito-consignacion`/`remitos-consignacion` for consignment). Duplicating them was rejected: the delta is the destinatario, the labels and the printout, everything else is identical and would have drifted apart.

The consignment list asks the backend for a shop's **three** movement types at once (`CONSIGNACION,RETIRO,VENTA_CONSIGNACION`), otherwise the remitos produced by a settlement are invisible and cannot be reprinted. It also filters by type, by shop and by unpaid, and collects deferred payments — a sale remito with no receipt is money still owed.

`RemitosService.addRemitoItem` identifies a book by **ISBN and title together** (`claveLibro`), the same key the backend uses for balances. Matching on ISBN alone fails twice over in this catalog: many books have no ISBN at all, so every click added a fresh line instead of incrementing, and many others share a scientific-notation ISBN, so different titles would be merged into one. The key trims and lowercases, since catalog titles routinely carry leading spaces. Quantities are editable in the items grid and never drop below 1 — removing a book is what the delete button is for.

Its ten-column grid overflowed its `.container` by 27px with Bootstrap's default `.table` padding — enough for a permanent, annoying horizontal scrollbar and no more. The component tightens the cell padding and caps the column widths rather than hiding columns; the container keeps `overflow-x: auto` as a fallback for genuinely narrow screens. Measured at 0 overflow from 1280px up (`.container` caps at 1140px, so the figure does not change with the viewport).

Prices are editable per row there, saved on blur rather than on every keystroke, and rolled back on screen if the server rejects them. A per-shop button pulls current prices from the catalog and says how many titles found no ISBN match, since those still need editing by hand.

`EstadoCuentaConsignacionComponent` — shown to users as **"Consignaciones Actuales"** (route `consignaciones-actuales`) — is where copies are marked sold/returned and settled. The class and the backend endpoint still say *estado de cuenta*; the UI wording was changed because it read like a cash statement. After settling it **re-reads the balance from the server** rather than subtracting locally, and the server validates against the real balance anyway.

### Printing

Print views render into the named `print` outlet, which sits **beside** the primary outlet in `app.component.html`. A screen hides itself by putting `[class.isPrinting]="printService.isPrinting"` on its **outermost** element; `@media print` in `styles.css` hides that element's direct children, while `app-print-layout` — a sibling, not a child — stays visible.

Three rules here were each paid for with a real bug:

1. **The print rules carry `!important`.** `bootstrap.min.css` loads *after* `styles.css` (see the `styles` array in `angular.json`) and several of its display rules tie with `.isPrinting > *` at 0,1,0 specificity — `.card` declares `display: flex`. On a tie the later sheet wins, so without `!important` any screen whose direct children are cards printed its whole list behind the document. The older printing screens repeat the block in their component CSS, which Angular injects after Bootstrap; that local copy is now redundant.

2. **Teardown waits for `afterprint`.** Clearing the outlet as soon as `window.print()` returns removes the document from the DOM while the `isPrinting` class that hides the screen only lifts on the next change-detection pass. A 60s timer is the fallback so a browser that never fires the event cannot strand the app behind a hidden screen.

3. **Never print from a dialog, or right after closing one.** Printing from inside an ngx-bootstrap modal yields a blank sheet even though `.modal` is hidden by the print rules, and a SweetAlert whose promise resolves mid-teardown does the same. The root cause is not pinned; Bootstrap's own `@media print` block forces `@page{size:a3}` and `min-width:992px!important` on `body` and `.container`, which makes the interaction hard to predict. Printing from a plain screen works. So the settlement flow closes its modal and offers the documents from a panel on the page, and payment confirmation is a non-blocking toast with the printing left to the row's own button.

The shop detail can also be downloaded as `.xlsx`. The bytes are fetched through `CustomHttpClientService.getBlob` and saved with a temporary object URL, because a plain anchor link cannot carry the JWT header — same approach as the ventas report.

Multi-copy documents put `page-break-before: always` on every copy **but the first** (`.remito-page + .remito-page`). Using `page-break-after` on all of them makes the browser open one extra sheet that comes out blank — invisible on distributor returns, where the box label happened to fill it, but plainly wrong everywhere else.

`PrintLayoutComponent` picks its heading from the outlet URL — every new print route needs its case there, or the document prints titled "NOTA DE PEDIDO" with the order footer.

### State Management

No NgRx/Redux. Services use RxJS `BehaviorSubject` for reactive state:
- `PedidosService` — current order state
- `AuthService` — login status

### API Communication

`CustomHttpClientService` wraps Angular `HttpClient`, automatically injecting JWT Bearer tokens from `localStorage`. All domain services use this wrapper. Base URL comes from `ConfigService` (loaded from `src/config.json`). Some API responses use HAL/HATEOAS format (`_embedded` property).

### Authentication

JWT tokens stored in `localStorage` (`'token'` and `'expira'` keys). Token decoded with `jwt-decode`. `AuthGuard` checks expiration before allowing route access.

### Models

`PedidoModel` has business logic methods: `calcularTotal()`, `addPedidoItem()`, `removePedidoItem()`. `RemitoModel` carries `re_tipo` and both possible destinatarios.

Note that list responses arrive as **plain JSON, not model instances**, so the getters defined on a model are unavailable there — screens that render a list compute those values with their own helper methods.

## Tests

`ng test` (Karma/Jasmine). On this machine:

```bash
CHROME_BIN=/usr/bin/google-chrome npx ng test --watch=false --browsers=ChromeHeadless
```

Build expectations from dates in **local** time, never `toISOString()` — the components format with `DatePipe`, which is local by design (a till report's "Hoy" must mean today in the shop). Comparing a local value against a UTC expectation makes tests fail every evening after 21:00 in UTC-3.

## Remito drafts

A remito in progress is persisted to `localStorage` so closing the screen does not cost the whole load — these can run to dozens of books. `RemitosService` hooks the persistence to the `currentRemito` emission rather than to each mutation: every change already flows through there, so adding, removing and quantity edits are covered without remembering to call anything.

What gets stored is the rule that drives the whole lifecycle: an empty or finalized remito **erases** its draft, so saving and starting over clean up on their own with no extra code. Drafts are keyed by `re_tipo`, otherwise walking into the consignment screen would restore a devolución.

Recovery is announced on screen with a discard button. Restoring silently would leave the operator unsure whether the items are stale, and reiniciar now asks before throwing away a loaded remito. Storage failures are swallowed: the draft is a convenience and must never block the load.

## Dates

The API sends dates as ISO instants with an explicit offset (`2026-08-23T00:30:00.000+00:00`), so the `date` pipe must be given **`'-0300'`** — Argentina is UTC−3. Every template said `'+0300'`, which rendered six hours ahead: anything created after 21:00 showed the next day's date, and the screens that print a time (ventas, clientes) showed the wrong hour outright. It went unnoticed for a long time because with only a date on screen it is wrong just a few hours a day.

The remito and pedido lists show date **and** time (`dd/MM/yyyy HH:mm`): one day can hold a shop's delivery, pickup and sale, and without the hour there is no way to tell what happened first. Both `pe_fecha` and `re_fecha` store a real timestamp, so the hour is meaningful and not a row of `00:00`.

## Forms that create records

`ComercioComponent`, `DistribuidoraComponent` and `ClienteComponent` guard against double submission with a `guardando` flag that both disables the button and short-circuits a re-entrant `onSubmit`. Without it the button was only disabled by an invalid form, never while the request was in flight, so two clicks — or Enter followed by the button — created two records. It never showed up locally because the response comes back instantly; over the network that window is hundreds of milliseconds and there was no spinner to suggest anything was happening. Any new create form needs the same guard.

`UsuarioComponent` is safe by accident: it opens a blocking SweetAlert before firing. `ConfiguracionRemitoComponent` updates a single row, so it cannot duplicate.

## Linting Rules

ESLint with `@angular-eslint` and `@typescript-eslint`. Config in `.eslintrc.json`.
- Single quotes, semicolons required, triple-equals enforced
- Max line length: 140 characters
- Component prefix: `app-`

## Deployment

Multi-stage Dockerfile: Node 18 builder → Nginx Alpine. Output goes to `dist/libreria/`.
