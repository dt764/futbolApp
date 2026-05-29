import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlayerState } from '../services/player.state';
import { Player } from '../models/player.models';
import { AuthService } from '../services/auth.service';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { AdminBadgeComponent } from '../admin-badge/admin-badge.component';

@Component({
  selector: 'app-players',
  templateUrl: 'players.page.html',
  styleUrls: ['players.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule, AuthHeaderComponent, AdminBadgeComponent],
})
export class PlayersPage {
  private state = inject(PlayerState);
  private auth = inject(AuthService);

  readonly players = this.state.players;
  readonly total = this.state.total;
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly filters = this.state.filters;

  filterForm = { ...this.filters() };
  filterMode: 'all' | 'mine' = 'all';
  maxDate = new Date().toISOString().split('T')[0];
  mobileTab: 'search' | 'add' = 'search';

  get isLoggedIn() { return this.auth.isLoggedIn(); }

  ionViewWillEnter() {
    if (this.state.players().length === 0) {
      this.state.setFilters({ ...this.filterForm });
      this.state.loadPlayers();
    }
  }

  onTabChange(event: CustomEvent) {
    this.mobileTab = event.detail.value as 'search' | 'add';
  }

  onFilterChange(event: CustomEvent) {
    const mode = event.detail.value as 'all' | 'mine';
    this.filterMode = mode;
    this.filterForm.createdBy = mode === 'mine' ? this.auth.appUser()?.uid : undefined;
    this.search();
  }

  search() {
    this.state.setFilters({ ...this.filterForm });
    this.state.loadPlayers();
  }

  loadMore(event: any) {
    this.state.loadMore(event);
  }

  getPlayerName(p: Player): string {
    if (p.firstname && p.lastname) return `${p.firstname} ${p.lastname}`;
    return p.name;
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
