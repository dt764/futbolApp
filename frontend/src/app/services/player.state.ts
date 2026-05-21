import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Player, PlayersResponse } from '../models/player.models';

@Injectable({ providedIn: 'root' })
export class PlayerState {
  private api = inject(ApiService);

  private playersList = signal<Player[]>([]);
  private totalCount = signal(0);
  private currentPage = signal(1);
  private totalPages = signal(1);
  private isLoading = signal(false);
  private listError = signal<string | null>(null);
  private searchFilters = signal<{ name: string; team: string; league: string }>({ name: '', team: '', league: '' });

  readonly players = this.playersList.asReadonly();
  readonly total = this.totalCount.asReadonly();
  readonly page = this.currentPage.asReadonly();
  readonly pages = this.totalPages.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly error = this.listError.asReadonly();
  readonly filters = this.searchFilters.asReadonly();

  readonly hasMorePages = computed(() => this.currentPage() < this.totalPages());

  private currentRequest = 0;

  loadPlayers(append = false, event?: any) {
    this.isLoading.set(true);
    this.listError.set(null);

    if (!append) {
      this.playersList.set([]);
      this.currentPage.set(1);
    }

    const params = new URLSearchParams();
    const f = this.searchFilters();
    params.set('page', this.currentPage().toString());
    params.set('limit', '20');
    if (f.name) params.set('name', f.name);
    if (f.team) params.set('team', f.team);
    if (f.league) params.set('league', f.league);

    const requestId = ++this.currentRequest;

    this.api.get<PlayersResponse>(`/api/players?${params}`).subscribe({
      next: (res) => {
        if (requestId !== this.currentRequest) return;
        this.playersList.update((list) => append ? [...list, ...res.players] : res.players);
        this.currentPage.set(res.page);
        this.totalPages.set(res.pages);
        this.totalCount.set(res.total);
        this.isLoading.set(false);
        if (event) event.target.complete();
      },
      error: (err) => {
        if (requestId !== this.currentRequest) return;
        this.listError.set(err.message || 'Error al cargar jugadores');
        this.isLoading.set(false);
        if (event) event.target.complete();
      },
    });
  }

  setFilters(filters: { name: string; team: string; league: string }) {
    this.searchFilters.set(filters);
  }

  loadMore(event: any) {
    if (this.hasMorePages()) {
      this.currentPage.update((p) => p + 1);
      this.loadPlayers(true, event);
    } else {
      event.target.complete();
    }
  }

  refreshPlayers() {
    this.loadPlayers();
  }

  getPlayerById(id: string) {
    return this.api.get<{ player: Player }>(`/api/players/${id}`);
  }

  createPlayer(body: Record<string, unknown>) {
    return this.api.post<{ player: Player }>('/api/players/manual', body);
  }

  updatePlayer(id: string, body: Record<string, unknown>) {
    return this.api.put<{ player: Player }>(`/api/players/${id}`, body);
  }

  deletePlayer(id: string) {
    return this.api.delete<{ message: string }>(`/api/players/${id}`);
  }

  private selected = signal<Player | null>(null);
  private selectedLoading = signal(false);

  readonly selectedPlayer = this.selected.asReadonly();
  readonly selectedPlayerLoading = this.selectedLoading.asReadonly();

  loadSelectedPlayer(id: string) {
    this.selectedLoading.set(true);
    this.getPlayerById(id).subscribe({
      next: (res) => {
        this.selected.set(res.player);
        this.selectedLoading.set(false);
      },
      error: () => {
        this.selected.set(null);
        this.selectedLoading.set(false);
      },
    });
  }

  setSelectedPlayer(player: Player | null) {
    this.selected.set(player);
  }
}
