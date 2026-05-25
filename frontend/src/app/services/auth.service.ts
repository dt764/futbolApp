import { inject, Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { from, map, Observable, switchMap, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
import { mapFirebaseError } from '../validators';

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

  private tokenSignal = signal<string | null>(null);
  private appUserSignal = signal<AppUser | null>(null);
  readonly ready: Promise<void>;
  readonly isLoggedIn = signal(false);

  readonly token = this.tokenSignal.asReadonly();
  readonly appUser = this.appUserSignal.asReadonly();

  private api = inject(ApiService);
  private registering = false;

  private async syncUser(user: import('firebase/auth').User | null) {
    if (this.registering) return;
    if (user) {
      try {
        const idToken = await user.getIdToken();
        this.tokenSignal.set(idToken);
        this.isLoggedIn.set(true);
        this.api.get<{ user: AppUser }>('/api/auth/me?_=' + Date.now()).subscribe({
          next: (res) => { if (res) this.appUserSignal.set(res.user); },
          error: () => this.appUserSignal.set(null),
        });
      } catch {
        this.tokenSignal.set(null);
        this.appUserSignal.set(null);
        this.isLoggedIn.set(false);
      }
    } else {
      this.tokenSignal.set(null);
      this.appUserSignal.set(null);
      this.isLoggedIn.set(false);
    }
  }

  constructor() {
    this.ready = this.auth.authStateReady().then(() => this.syncUser(this.auth.currentUser));
    onAuthStateChanged(this.auth, (user) => this.syncUser(user));
  }

  login(email: string, password: string): Observable<AppUser> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((cred) => from(cred.user.getIdToken())),
      tap((idToken) => {
        this.tokenSignal.set(idToken);
        this.isLoggedIn.set(true);
      }),
      switchMap(() => this.api.get<{ user: AppUser }>('/api/auth/me?_=' + Date.now())),
      map((res) => {
        if (res) this.appUserSignal.set(res.user);
        return this.appUserSignal()!;
      }),
      catchError((err) => throwError(() => (err.code?.startsWith('auth/') ? new Error(mapFirebaseError(err)) : err))),
    );
  }

  register(email: string, password: string): Observable<AppUser> {
    this.registering = true;
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((cred) => from(cred.user.getIdToken())),
      tap((idToken) => {
        this.tokenSignal.set(idToken);
        this.isLoggedIn.set(true);
      }),
      switchMap(() => this.api.get<{ user: AppUser }>('/api/auth/me?_=' + Date.now())),
      map((res) => {
        this.registering = false;
        if (res) this.appUserSignal.set(res.user);
        return this.appUserSignal()!;
      }),
      catchError((err) => {
        this.registering = false;
        return throwError(() => (err.code?.startsWith('auth/') ? new Error(mapFirebaseError(err)) : err));
      }),
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error('Usuario no autenticado');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    return from(reauthenticateWithCredential(user, credential).then(() =>
      updatePassword(user, newPassword),
    )).pipe(
      catchError((err) => throwError(() => (err.code?.startsWith('auth/') ? new Error(mapFirebaseError(err)) : err))),
    );
  }

  updateProfile(displayName: string): Observable<AppUser> {
    return this.api.put<{ user: AppUser }>('/api/auth/me', { displayName }).pipe(
      map((res) => {
        if (res) this.appUserSignal.set(res.user);
        return this.appUserSignal()!;
      }),
    );
  }

  logout(): Observable<void> {
    this.tokenSignal.set(null);
    this.appUserSignal.set(null);
    this.isLoggedIn.set(false);
    return from(signOut(this.auth));
  }
}
