import { CUSTOM_ELEMENTS_SCHEMA, Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PlayerState } from '../services/player.state';
import { ApiService } from '../services/api.service';
import { Comment, CommentsResponse } from '../models/comment.models';

@Component({
  selector: 'app-player-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/players"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ getPlayerName() }}</ion-title>
        <ion-buttons slot="end">
          <ion-button
            *ngIf="auth.appUser?.role === 'admin'"
            [routerLink]="'/players/' + playerId + '/edit'"
            color="primary"
          >
            <ion-icon name="create-outline" slot="start"></ion-icon>
            Editar
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <player-detail
        [player]="player()"
        [comments]="comments"
        [isAdmin]="auth.appUser?.role === 'admin'"
        [loading]="loading()"
        [commentLoading]="commentLoading"
        [error]="error"
        (addComment)="handleAddComment($any($event))"
        (deleteComment)="handleDeleteComment($any($event))"
      ></player-detail>
    </ion-content>
  `,
  styleUrls: ['player-detail.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, CommonModule, RouterModule],
})
export class PlayerDetailPage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  protected auth = inject(AuthService);
  private playerState = inject(PlayerState);

  playerId = '';

  readonly player = this.playerState.selectedPlayer;
  readonly loading = this.playerState.selectedPlayerLoading;

  comments: Comment[] = [];
  commentLoading = false;
  error = '';

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

  getPlayerName(): string {
    const p = this.player();
    if (!p) return '';
    if (p.firstname && p.lastname) return `${p.firstname} ${p.lastname}`;
    return p.name;
  }

  handleAddComment(event: CustomEvent<{ author: string; text: string; rating: number; location?: { lat: number; lng: number } }>) {
    const { author, text, rating, location } = event.detail;
    this.commentLoading = true;
    this.error = '';

    const body: any = { author, text, rating };
    if (location) body.location = location;

    const p = this.player();
    if (!p) return;

    this.api.post<{ comment: Comment }>(`/api/comments/player/${p._id}`, body)
      .subscribe({
        next: (res) => {
          this.comments.unshift(res.comment);
          this.commentLoading = false;
        },
        error: () => { this.commentLoading = false; },
      });
  }

  handleDeleteComment(event: CustomEvent<string>) {
    const commentId = event.detail;
    this.api.delete(`/api/comments/${commentId}`).subscribe({
      next: () => {
        this.comments = this.comments.filter((c) => c._id !== commentId);
      },
      error: () => {
        this.error = 'Error al eliminar el comentario';
      },
    });
  }
}
