import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlayerState } from '../services/player.state';
import { Player } from '../models/player.models';

@Component({
  selector: 'app-players',
  templateUrl: 'players.page.html',
  styleUrls: ['players.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule],
})
export class PlayersPage {
  private state = inject(PlayerState);

  readonly players = this.state.players;
  readonly total = this.state.total;
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly filters = this.state.filters;

  filterForm = { ...this.filters() };

  ionViewWillEnter() {
    if (this.state.players().length === 0) {
      this.state.setFilters({ ...this.filterForm });
      this.state.loadPlayers();
    }
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
}
