import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ApiPlayer, ApiSearchResponse } from '../models/player.models';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';

@Component({
  selector: 'app-player-import',
  templateUrl: 'player-import.page.html',
  styleUrls: ['player-import.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule, AuthHeaderComponent],
})
export class PlayerImportPage {
  private api = inject(ApiService);

  search = { name: '', team: '', league: '' };
  results: ApiPlayer[] = [];
  loading = false;
  searched = false;
  error = '';

  importingId: number | null = null;
  importError = '';

  doSearch() {
    const name = this.search.name.trim();
    const team = this.search.team.trim();
    if (!name || !team) return;

    this.loading = true;
    this.searched = true;
    this.error = '';
    this.results = [];
    this.importError = '';

    const params = new URLSearchParams({ name });
    if (this.search.team.trim()) params.set('team', this.search.team.trim());
    if (this.search.league.trim()) params.set('league', this.search.league.trim());

    this.api.get<ApiSearchResponse>(`/api/players/search/external?${params}`).subscribe({
      next: (res) => {
        this.results = res.response || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al buscar en la API externa';
        this.loading = false;
      },
    });
  }

  getPlayerName(p: ApiPlayer): string {
    return `${p.player.firstname} ${p.player.lastname}`;
  }

  getPosition(p: ApiPlayer): string {
    return p.statistics?.[0]?.games?.position || '';
  }

  getTeam(p: ApiPlayer): string {
    return p.statistics?.[0]?.team?.name || '';
  }

  getLeague(p: ApiPlayer): string {
    return p.statistics?.[0]?.league?.name || '';
  }

  importPlayer(p: ApiPlayer) {
    this.importingId = p.player.id;
    this.importError = '';

    this.api.post<{ player: any }>('/api/players/import', {
      player: p.player,
      statistics: p.statistics,
      team: this.getTeam(p) || undefined,
      league: this.getLeague(p) || undefined,
    }).subscribe({
      next: () => {
        this.importingId = null;
        this.results = this.results.filter((r) => r.player.id !== p.player.id);
      },
      error: (err) => {
        this.importingId = null;
        this.importError = err.error?.error || 'Error al importar el jugador';
      },
    });
  }
}
