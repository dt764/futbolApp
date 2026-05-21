import { Injectable } from '@angular/core';
import { BackendStrategy, BackendType } from './backend-strategy';
import { TrwmBackendStrategy } from './trwm-backend.strategy';
import { DwscBackendStrategy } from './dwsc-backend.strategy';

@Injectable({ providedIn: 'root' })
export class BackendFactory {
  private strategies = new Map<BackendType, BackendStrategy>();

  constructor(
    private trwm: TrwmBackendStrategy,
    private dwsc: DwscBackendStrategy,
  ) {
    this.strategies.set('trwm', this.trwm);
    this.strategies.set('dwsc', this.dwsc);
  }

  getStrategy(type: BackendType): BackendStrategy {
    const s = this.strategies.get(type);
    if (!s) throw new Error(`Unknown backend type: ${type}`);
    return s;
  }

  getAll(): BackendStrategy[] {
    return [this.trwm, this.dwsc];
  }
}
