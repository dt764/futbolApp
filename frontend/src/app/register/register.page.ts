import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule],
})
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = '';
  password = '';
  confirmPassword = '';
  error = '';

  register() {
    this.error = '';

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.auth.register(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/home'),
      error: (err) => {
        this.error = err.message || 'Error al registrarse';
      },
    });
  }
}
