import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-header',
  templateUrl: 'auth-header.component.html',
  styleUrls: ['auth-header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink],
})
export class AuthHeaderComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  get isLoggedIn() { return this.auth.isLoggedIn(); }
  get isAdmin() { return this.auth.appUser()?.role === 'admin'; }
  get appUser() { return this.auth.appUser(); }

  async logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigateByUrl('/home');
    });
  }
}
