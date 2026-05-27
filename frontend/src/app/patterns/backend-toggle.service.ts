import { computed, inject, Injectable, signal } from '@angular/core';
import { BackendFactory } from './backend-factory';
import { BackendStrategy, BackendType } from './backend-strategy';

const STORAGE_KEY = 'futbolapp_backend';

@Injectable({ providedIn: 'root' })
export class BackendToggleService {
  private factory = inject(BackendFactory);

  private currentType = signal<BackendType>(this.loadSaved());

  readonly current = computed(() => this.currentType());
  readonly strategy = computed<BackendStrategy>(() =>
    this.factory.getStrategy(this.currentType()),
  );
  readonly baseUrl = computed(() => this.strategy().getBaseUrl());
  readonly label = computed(() => this.strategy().label);
  readonly all = this.factory.getAll();

  toggle() {
    const next: BackendType = this.currentType() === 'trwm' ? 'dwsc' : 'trwm';
    this.set(next);
  }

  set(type: BackendType) {
    this.currentType.set(type);
    localStorage.setItem(STORAGE_KEY, type);
  }

  reset() {
    this.set('trwm');
  }

  private loadSaved(): BackendType {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'trwm' || saved === 'dwsc') return saved;
    return 'trwm';
  }
}
