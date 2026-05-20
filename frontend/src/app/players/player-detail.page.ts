import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';

interface Player {
  _id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  nationality?: string;
  position?: string;
  birthDate?: string;
  height?: string;
  weight?: string;
  photo?: string;
  team?: string;
  league?: string;
  location?: { lat: number; lng: number; address?: string };
}

interface Comment {
  _id: string;
  author: string;
  text: string;
  rating: number;
  createdAt: string;
  location?: { lat: number; lng: number };
}

interface CommentsResponse {
  comments: Comment[];
}

@Component({
  selector: 'app-player-detail',
  templateUrl: 'player-detail.page.html',
  styleUrls: ['player-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule],
})
export class PlayerDetailPage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  player: Player | null = null;
  comments: Comment[] = [];
  loading = true;
  commentLoading = false;
  error = '';

  commentForm = {
    author: '',
    text: '',
    rating: 5,
    location: null as { lat: number; lng: number } | null,
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadPlayer(id);
    this.loadComments(id);
  }

  private loadPlayer(id: string) {
    this.api.get<{ player: Player }>(`/api/players/${id}`).subscribe({
      next: (res) => {
        this.player = res.player;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el jugador';
        this.loading = false;
      },
    });
  }

  private loadComments(id: string) {
    this.api.get<CommentsResponse>(`/api/comments/player/${id}`).subscribe({
      next: (res) => { this.comments = res.comments; },
      error: () => {},
    });
  }

  get averageRating(): number {
    if (this.comments.length === 0) return 0;
    const sum = this.comments.reduce((a, c) => a + c.rating, 0);
    return Math.round((sum / this.comments.length) * 10) / 10;
  }

  getPlayerName(): string {
    if (!this.player) return '';
    const p = this.player;
    if (p.firstname && p.lastname) return `${p.firstname} ${p.lastname}`;
    return p.name;
  }

  stars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  hasValidLocation(loc?: { lat: number; lng: number } | null): boolean {
    return !!loc && (loc.lat !== 0 || loc.lng !== 0);
  }

  mapsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  useCurrentLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.commentForm.location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      },
      () => {},
    );
  }

  addComment() {
    const { author, text, rating, location } = this.commentForm;
    if (!author.trim() || !text.trim()) return;

    this.commentLoading = true;
    const body: any = { author: author.trim(), text: text.trim(), rating };
    if (location) body.location = location;

    this.api.post<{ comment: Comment }>(`/api/comments/player/${this.player!._id}`, body)
      .subscribe({
        next: (res) => {
          this.comments.unshift(res.comment);
          this.commentForm.text = '';
          this.commentForm.rating = 5;
          this.commentLoading = false;
        },
        error: () => { this.commentLoading = false; },
      });
  }
}
