import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';

interface Player {
  _id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  nationality?: string;
  position?: string;
  team?: string;
  league?: string;
  photo?: string;
}

interface PlayersResponse {
  players: Player[];
  total: number;
  page: number;
  pages: number;
}

@Component({
  selector: 'app-players',
  templateUrl: 'players.page.html',
  styleUrls: ['players.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule],
})
export class PlayersPage implements OnInit {
  private api = inject(ApiService);

  players: Player[] = [];
  page = 1;
  pages = 1;
  total = 0;
  loading = false;
  error = '';

  filters = {
    name: '',
    team: '',
    league: '',
  };

  ngOnInit() {
    this.loadPlayers();
  }

  search() {
    this.page = 1;
    this.players = [];
    this.loadPlayers();
  }

  loadPlayers(event?: any) {
    this.loading = true;
    this.error = '';

    const params = new URLSearchParams();
    params.set('page', this.page.toString());
    params.set('limit', '20');
    if (this.filters.name) params.set('name', this.filters.name);
    if (this.filters.team) params.set('team', this.filters.team);
    if (this.filters.league) params.set('league', this.filters.league);

    this.api.get<PlayersResponse>(`/api/players?${params}`).subscribe({
      next: (res) => {
        this.players = [...this.players, ...res.players];
        this.page = res.page;
        this.pages = res.pages;
        this.total = res.total;
        this.loading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar jugadores';
        this.loading = false;
        if (event) event.target.complete();
      },
    });
  }

  loadMore(event: any) {
    if (this.page < this.pages) {
      this.page++;
      this.loadPlayers(event);
    } else {
      event.target.complete();
    }
  }

  getPlayerName(p: Player): string {
    if (p.firstname && p.lastname) return `${p.firstname} ${p.lastname}`;
    return p.name;
  }
}
