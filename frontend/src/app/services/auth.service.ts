import { inject, Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { from, map, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private firebaseApp = initializeApp(environment.firebase);
  private auth = getAuth(this.firebaseApp);

  private _token: string | null = null;
  private _appUser: AppUser | null = null;

  get token() { return this._token; }
  get appUser() { return this._appUser; }
  get isLoggedIn() { return !!this._token; }

  user$ = new Observable<User | null>((observer) => {
    const unsubscribe = onAuthStateChanged(this.auth, observer);
    return unsubscribe;
  });

  private api = inject(ApiService);

  login(email: string, password: string): Observable<AppUser> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((cred) => from(cred.user.getIdToken())),
      tap((idToken) => { this._token = idToken; }),
      switchMap(() => this.api.get<{ user: AppUser }>('/api/auth/me')),
      map((res) => {
        this._appUser = res.user;
        return res.user;
      }),
    );
  }

  register(email: string, password: string): Observable<AppUser> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((cred) => from(cred.user.getIdToken())),
      tap((idToken) => { this._token = idToken; }),
      switchMap(() => this.api.get<{ user: AppUser }>('/api/auth/me')),
      map((res) => {
        this._appUser = res.user;
        return res.user;
      }),
    );
  }

  logout(): Observable<void> {
    this._token = null;
    this._appUser = null;
    return from(signOut(this.auth));
  }
}
