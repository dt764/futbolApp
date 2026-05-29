import { Injectable } from '@angular/core';
import { BackendStrategy, BackendType } from './backend-strategy';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DwscBackendStrategy implements BackendStrategy {
  readonly type: BackendType = 'dwsc';
  readonly label = 'DWSC';

  getBaseUrl(): string {
    return environment.dwscApiUrl;
  }
}
