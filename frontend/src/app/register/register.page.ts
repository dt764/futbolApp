import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { AdminBadgeComponent } from '../admin-badge/admin-badge.component';
import { validateEmail, validatePasswordStrength } from '../validators';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule, AuthHeaderComponent, AdminBadgeComponent],
})
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  loading = false;

  emailError = '';
  passwordError = '';
  confirmPasswordError = '';
  passwordStrengthErrors: string[] = [];
  showPassword = false;
  showConfirmPassword = false;

  private clearErrors() {
    this.error = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.passwordStrengthErrors = [];
  }

  validateField(field: string) {
    switch (field) {
      case 'email':
        this.emailError = this.email ? (validateEmail(this.email) || '') : '';
        break;
      case 'password':
        this.passwordError = '';
        this.passwordStrengthErrors = [];
        if (!this.password) {
          this.passwordError = 'La contraseña es obligatoria';
        } else {
          const result = validatePasswordStrength(this.password);
          if (!result.valid) this.passwordStrengthErrors = result.errors;
        }
        break;
      case 'confirmPassword':
        this.confirmPasswordError = '';
        if (!this.confirmPassword) {
          this.confirmPasswordError = 'Confirma la contraseña';
        } else if (this.password !== this.confirmPassword) {
          this.confirmPasswordError = 'Las contraseñas no coinciden';
        }
        break;
    }
  }

  register() {
    this.clearErrors();

    this.emailError = validateEmail(this.email) || '';
    if (!this.password) {
      this.passwordError = 'La contraseña es obligatoria';
    } else {
      const result = validatePasswordStrength(this.password);
      if (!result.valid) this.passwordStrengthErrors = result.errors;
    }
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Confirma la contraseña';
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Las contraseñas no coinciden';
    }
    if (this.emailError || this.passwordError || this.confirmPasswordError || this.passwordStrengthErrors.length) return;

    this.loading = true;
    this.auth.register(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Error al registrarse';
      },
    });
  }
}
