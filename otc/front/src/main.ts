import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environmentReady } from './environments/otc-env';

environmentReady
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err));
