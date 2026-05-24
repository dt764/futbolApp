import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { BackendToggleService } from '../patterns/backend-toggle.service';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, AuthHeaderComponent],
})
export class ProfilePage {
  protected auth = inject(AuthService);
  protected toggleService = inject(BackendToggleService);
  ready = this.auth.ready;
}
