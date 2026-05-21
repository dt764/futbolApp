import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BackendToggleService } from '../patterns/backend-toggle.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private toggle = inject(BackendToggleService);

  private get baseUrl() { return this.toggle.baseUrl(); }

  private headers(token?: string) {
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) h = h.set('Authorization', `Bearer ${token}`);
    return h;
  }

  get<T>(path: string, token?: string) {
    return this.http.get<T>(`${this.baseUrl}${path}`, { headers: this.headers(token) });
  }

  post<T>(path: string, body: unknown, token?: string) {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, { headers: this.headers(token) });
  }

  put<T>(path: string, body: unknown, token?: string) {
    return this.http.put<T>(`${this.baseUrl}${path}`, body, { headers: this.headers(token) });
  }

  delete<T>(path: string, token?: string) {
    return this.http.delete<T>(`${this.baseUrl}${path}`, { headers: this.headers(token) });
  }
}
