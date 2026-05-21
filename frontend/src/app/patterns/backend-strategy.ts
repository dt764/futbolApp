export type BackendType = 'trwm' | 'dwsc';

export interface BackendStrategy {
  readonly type: BackendType;
  readonly label: string;
  getBaseUrl(): string;
}
