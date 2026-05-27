import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { AdminBadgeComponent } from '../admin-badge/admin-badge.component';
import { validateEmail, sanitizeError } from '../validators';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule, AuthHeaderComponent, AdminBadgeComponent],
})
export class LoginPage {
  private auth = inject(AuthService);
  email = '';
  password = '';
  error = '';
  loading = false;
  emailError = '';
  passwordError = '';
  showPassword = false;

  validateField() {
    this.emailError = this.email ? (validateEmail(this.email) || '') : '';
    this.passwordError = !this.password.trim() ? 'La contraseña es obligatoria' : '';
  }

  login() {
    this.error = '';
    this.emailError = validateEmail(this.email) || '';
    this.passwordError = !this.password.trim() ? 'La contraseña es obligatoria' : '';
    if (this.emailError || this.passwordError) return;

    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        window.location.href = '/home';
      },
      error: (err) => {
        this.loading = false;
        this.error = sanitizeError(err);
      },
    });
  }
}
