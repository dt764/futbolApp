import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  async canActivate(): Promise<boolean | UrlTree> {
    await this.auth.ready;
    if (this.auth.isLoggedIn) return true;
    return this.router.parseUrl('/login');
  }
}
