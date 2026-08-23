import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Sentry from '@sentry/angular-ivy';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

async function initSentry(): Promise<void> {
  try {
    const res = await fetch('./config.json', { cache: 'no-store' });
    if (!res.ok) return;
    const cfg = await res.json();
    if (!cfg?.sentryDsn) return;
    Sentry.init({
      dsn: cfg.sentryDsn,
      environment: cfg.sentryEnvironment ?? (environment.production ? 'production' : 'local'),
      tracesSampleRate: 0,
      sendDefaultPii: false,
    });
  } catch {
    // No Sentry if config can't be read — fall through silently.
  }
}

initSentry().finally(() => {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
});
