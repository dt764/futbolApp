import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PlayerState } from '../services/player.state';
import { ApiService } from '../services/api.service';
import { Comment, CommentsResponse } from '../models/comment.models';

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
  protected auth = inject(AuthService);
  private playerState = inject(PlayerState);

  private playerId = '';

  readonly player = this.playerState.selectedPlayer;
  readonly loading = this.playerState.selectedPlayerLoading;

  comments: Comment[] = [];
  commentLoading = false;
  error = '';

  commentForm = {
    author: '',
    text: '',
    rating: 5,
    location: null as { lat: number; lng: number } | null,
  };

  ngOnInit() {
    this.playerId = this.route.snapshot.paramMap.get('id')!;
    this.playerState.loadSelectedPlayer(this.playerId);
    this.loadComments();
  }

  private loadComments() {
    this.api.get<CommentsResponse>(`/api/comments/player/${this.playerId}`).subscribe({
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
    const p = this.player();
    if (!p) return '';
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

  deleteComment(commentId: string) {
    const alert = document.createElement('ion-alert');
    alert.header = 'Eliminar comentario';
    alert.message = '¿Estás seguro de que quieres eliminar este comentario?';
    alert.buttons = [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        handler: () => {
          this.api.delete(`/api/comments/${commentId}`).subscribe({
            next: () => {
              this.comments = this.comments.filter((c) => c._id !== commentId);
            },
            error: () => {
              this.error = 'Error al eliminar el comentario';
            },
          });
        },
      },
    ];
    document.body.appendChild(alert);
    alert.present();
  }

  addComment() {
    const { author, text, rating, location } = this.commentForm;
    if (!author.trim() || !text.trim()) return;

    this.commentLoading = true;
    const body: any = { author: author.trim(), text: text.trim(), rating };
    if (location) body.location = location;

    const p = this.player();
    if (!p) return;

    this.api.post<{ comment: Comment }>(`/api/comments/player/${p._id}`, body)
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
