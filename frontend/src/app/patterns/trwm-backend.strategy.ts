import { Injectable } from '@angular/core';
import { BackendStrategy, BackendType } from './backend-strategy';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TrwmBackendStrategy implements BackendStrategy {
  readonly type: BackendType = 'trwm';
  readonly label = 'TRWM';

  getBaseUrl(): string {
    return environment.trwmApiUrl;
  }
}
