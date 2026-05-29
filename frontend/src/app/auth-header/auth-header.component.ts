import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule, IonPopover } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

  @ViewChild('userPopover') userPopover!: IonPopover;

  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly appUser = this.auth.appUser;

  get isAdmin() { return this.auth.appUser()?.role === 'admin'; }

  logout() {
    this.userPopover.dismiss();
    this.auth.logout().subscribe(() => {
      window.location.href = '/home';
    });
  }
}
