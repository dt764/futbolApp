import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-badge',
  template: '@if (isAdmin) { <span class="admin-badge">Admin</span> }',
  styles: [`
    .admin-badge {
      display: inline-block;
      background: #c09630;
      color: #000;
      font-size: 10px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 8px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      vertical-align: middle;
      margin-left: 8px;
      line-height: 1.4;
    }
  `],
  standalone: true,
  imports: [CommonModule],
})
export class AdminBadgeComponent {
  private auth = inject(AuthService);
  get isAdmin() { return this.auth.appUser()?.role === 'admin'; }
}
