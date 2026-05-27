import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { AdminBadgeComponent } from '../admin-badge/admin-badge.component';
import { validatePasswordStrength, mapFirebaseError } from '../validators';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, AuthHeaderComponent, AdminBadgeComponent],
})
export class ProfilePage {
  protected auth = inject(AuthService);
  ready = this.auth.ready;

  editing = false;
  saving = false;
  editName = '';
  saveError = '';

  passwordCurrent = '';
  passwordNew = '';
  passwordConfirm = '';
  savingPassword = false;
  passwordError = '';
  passwordSuccess = false;
  showPasswordCurrent = false;
  showPasswordNew = false;
  showPasswordConfirm = false;

  startEdit() {
    this.editName = this.auth.appUser()?.displayName || this.auth.appUser()?.email || '';
    this.editing = true;
    this.saveError = '';
  }

  cancelEdit() {
    this.editing = false;
    this.saveError = '';
  }

  saveName() {
    const name = this.editName.trim();
    if (!name) return;
    this.saving = true;
    this.saveError = '';
    this.auth.updateProfile(name).subscribe({
      next: () => {
        this.saving = false;
        this.editing = false;
      },
      error: () => {
        this.saving = false;
        this.saveError = 'Error al guardar el nombre';
      },
    });
  }

  changePassword() {
    this.passwordError = '';
    this.passwordSuccess = false;

    if (!this.passwordCurrent) {
      this.passwordError = 'Introduce la contraseña actual';
      return;
    }
    const strength = validatePasswordStrength(this.passwordNew);
    if (!strength.valid) {
      this.passwordError = 'Debe cumplir: ' + strength.errors.join(', ');
      return;
    }
    if (this.passwordNew !== this.passwordConfirm) {
      this.passwordError = 'Las contraseñas no coinciden';
      return;
    }

    this.savingPassword = true;
    this.auth.changePassword(this.passwordCurrent, this.passwordNew).subscribe({
      next: () => {
        this.savingPassword = false;
        this.passwordSuccess = true;
        this.passwordCurrent = '';
        this.passwordNew = '';
        this.passwordConfirm = '';
      },
      error: (err) => {
        this.savingPassword = false;
        this.passwordError = mapFirebaseError(err);
      },
    });
  }
}
