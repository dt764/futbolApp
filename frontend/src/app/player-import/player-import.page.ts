import { Component, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ApiPlayer, ApiSearchResponse } from '../models/player.models';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { AdminBadgeComponent } from '../admin-badge/admin-badge.component';
import { forkJoin, catchError, of } from 'rxjs';
import { sanitizeError } from '../validators';
import { PlayerState } from '../services/player.state';

@Component({
  selector: 'app-player-import',
  templateUrl: 'player-import.page.html',
  styleUrls: ['player-import.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule, AuthHeaderComponent, AdminBadgeComponent],
})
export class PlayerImportPage {
  private api = inject(ApiService);
  private playerState = inject(PlayerState);

  search = { name: '', team: '', league: '' };
  results: ApiPlayer[] = [];
  loading = false;
  searched = false;
  error = '';

  nameError = '';
  teamError = '';

  selectedIds = new Set<number>();
  importingId: number | null = null;
  bulkImporting = false;
  importError = '';
  importSuccess = '';

  allSelected = signal(false);
  selectedCount = signal(0);

  private updateSelectionStats() {
    this.allSelected.set(this.results.length > 0 && this.selectedIds.size === this.results.length);
    this.selectedCount.set(this.selectedIds.size);
  }

  toggleSelection(id: number) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
    this.updateSelectionStats();
  }

  toggleAll() {
    if (this.allSelected()) this.selectedIds.clear();
    else this.results.forEach((p) => this.selectedIds.add(p.player.id));
    this.updateSelectionStats();
  }

  doSearch() {
    this.nameError = !this.search.name.trim() ? 'El nombre es obligatorio' : '';
    this.teamError = !this.search.team.trim() ? 'El equipo es obligatorio' : '';
    if (this.nameError || this.teamError) return;

    const name = this.search.name.trim();
    const team = this.search.team.trim();

    this.loading = true;
    this.searched = true;
    this.error = '';
    this.results = [];
    this.importError = '';
    this.importSuccess = '';
    this.selectedIds.clear();
    this.updateSelectionStats();

    const params = new URLSearchParams({ name });
    if (team) params.set('team', team);
    if (this.search.league.trim()) params.set('league', this.search.league.trim());

    this.api.get<ApiSearchResponse>(`/api/players/search/external?${params}`).subscribe({
      next: (res) => {
        this.results = res.response || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = sanitizeError(err);
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

  importSelected() {
    const toImport = this.results.filter((p) => this.selectedIds.has(p.player.id));
    if (toImport.length === 0) return;

    this.bulkImporting = true;
    this.importError = '';
    this.importSuccess = '';
    this.importingId = toImport[0].player.id;

    const requests = toImport.map((p) =>
      this.api.post<{ player: any }>('/api/players/import', {
        player: p.player,
        statistics: p.statistics,
        team: this.getTeam(p) || undefined,
        league: this.getLeague(p) || undefined,
      }).pipe(catchError(() => of(null))),
    );

    forkJoin(requests).subscribe((results) => {
      const successful = results.filter((r) => r !== null).length;
      const failed = results.length - successful;
      const importedIds = new Set(toImport.map((p) => p.player.id));
      this.results = this.results.filter((r) => !importedIds.has(r.player.id));
      this.selectedIds.clear();
      this.updateSelectionStats();
      this.bulkImporting = false;
      this.importingId = null;
      if (failed > 0 && successful === 0) {
        this.importError = 'Error al importar los jugadores';
      } else {
        let msg = `${successful} jugador${successful !== 1 ? 'es' : ''} importado${successful !== 1 ? 's' : ''} correctamente`;
        if (failed > 0) msg += `. ${failed} fallaron (posiblemente ya existen)`;
        this.importSuccess = msg;
        this.playerState.refreshPlayers();
      }
    });
  }
}
