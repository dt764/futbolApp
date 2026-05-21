import { Injectable } from '@angular/core';
import { BackendStrategy, BackendType } from './backend-strategy';

@Injectable({ providedIn: 'root' })
export class TrwmBackendStrategy implements BackendStrategy {
  readonly type: BackendType = 'trwm';
  readonly label = 'TRWM';

  getBaseUrl(): string {
    return 'http://localhost:3000';
  }
}
