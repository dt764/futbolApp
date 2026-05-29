import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { IdealTeamPlayer, IdealTeamResponse } from '../models/player.models';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { AdminBadgeComponent } from '../admin-badge/admin-badge.component';
import { sanitizeError } from '../validators';

@Component({
  selector: 'app-ideal-team',
  templateUrl: 'ideal-team.page.html',
  styleUrls: ['ideal-team.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule, AuthHeaderComponent, AdminBadgeComponent],
})
export class IdealTeamPage {
  private api = inject(ApiService);

  formations = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'];
  selectedFormation = '';
  source: 'database' | 'fantasy' = 'database';

  loading = false;
  error = '';
  team: IdealTeamPlayer[] | null = null;
  teamFormation = '';
  reasoning = '';

  positionOrder: Record<string, number> = {
    'Portero': 0,
    'Defensa': 1,
    'Centrocampista': 2,
    'Delantero': 3,
  };

  generate() {
    this.loading = true;
    this.error = '';
    this.team = null;

    const body: Record<string, unknown> = { source: this.source };
    if (this.selectedFormation) body['formation'] = this.selectedFormation;

    this.api.post<IdealTeamResponse>('/api/ideal-team', body).subscribe({
      next: (res) => {
        this.team = res.team.players;
        this.teamFormation = res.team.formation;
        this.reasoning = res.team.reasoning || '';
        this.loading = false;
      },
      error: (err) => {
        this.error = sanitizeError(err);
        this.loading = false;
      },
    });
  }

  sortedTeam(): IdealTeamPlayer[] {
    if (!this.team) return [];
    return [...this.team].sort((a, b) => {
      const orderA = this.positionOrder[a.position] ?? 99;
      const orderB = this.positionOrder[b.position] ?? 99;
      return orderA - orderB;
    });
  }

  positionAbbr(pos: string): string {
    const lower = pos.toLowerCase();
    if (lower.includes('portero') || lower.includes('goal')) return 'POR';
    if (lower.includes('defensa') || lower.includes('def') || lower.includes('back')) return 'DEF';
    if (lower.includes('centrocampista') || lower.includes('medio') || lower.includes('mid')) return 'MED';
    if (lower.includes('delantero') || lower.includes('del') || lower.includes('forward')) return 'DEL';
    return pos.substring(0, 3).toUpperCase();
  }
}
