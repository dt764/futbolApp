import { Component, Prop, State, Event, EventEmitter, h } from '@stencil/core';

export interface Player {
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

export interface Comment {
  _id: string;
  author: string;
  text: string;
  rating: number;
  createdAt: string;
  location?: { lat: number; lng: number };
}

@Component({
  tag: 'player-detail',
  styleUrl: 'player-detail.css',
  shadow: false,
})
export class PlayerDetail {
  @Prop() player?: Player | null;
  @Prop() comments: Comment[] = [];
  @Prop() isAdmin = false;
  @Prop() loading = false;
  @Prop() commentLoading = false;
  @Prop() error = '';

  @Event() addComment: EventEmitter<{
    author: string;
    text: string;
    rating: number;
    location?: { lat: number; lng: number };
  }>;
  @Event() deleteComment: EventEmitter<string>;

  @State() commentAuthor = '';
  @State() commentText = '';
  @State() commentRating = 5;
  @State() commentLocation: { lat: number; lng: number } | null = null;

  get averageRating(): number {
    if (this.comments.length === 0) return 0;
    const sum = this.comments.reduce((a, c) => a + c.rating, 0);
    return Math.round((sum / this.comments.length) * 10) / 10;
  }

  get playerName(): string {
    const p = this.player;
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
        this.commentLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      },
      () => {},
    );
  }

  handleSubmit(e: Event) {
    e.preventDefault();
    const author = this.commentAuthor.trim();
    const text = this.commentText.trim();
    if (!author || !text) return;

    this.addComment.emit({
      author,
      text,
      rating: this.commentRating,
      location: this.commentLocation || undefined,
    });

    this.commentText = '';
    this.commentRating = 5;
  }

  handleDelete(commentId: string) {
    this.deleteComment.emit(commentId);
  }

  render() {
    const p = this.player;

    if (this.loading) {
      return (
        <div class="center-spinner">
          <div class="spinner" />
        </div>
      );
    }

    if (!p) return null;

    return (
      <div class="player-detail">
        {/* Player Header */}
        <div class="player-header">
          <ion-avatar class="player-photo">
            {p.photo ? (
              <img src={p.photo} alt={p.name} />
            ) : (
              <div class="avatar-placeholder-lg">{p.name.charAt(0)}</div>
            )}
          </ion-avatar>
          <div class="player-basic">
            <h1>{this.playerName}</h1>
            {p.position && <p class="position">{p.position}</p>}
            {(p.team || p.league) && (
              <p class="team-league">
                {p.team}
                {p.team && p.league && ' · '}
                {p.league}
              </p>
            )}
            {p.nationality && <p class="nationality">{p.nationality}</p>}
          </div>
        </div>

        {/* Physical Data */}
        {(p.birthDate || p.height || p.weight) && (
          <ion-card>
            <ion-card-header>
              <ion-card-title>Datos físicos</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                {p.birthDate && (
                  <ion-item>
                    <ion-label>Fecha de nacimiento</ion-label>
                    <ion-note slot="end">{p.birthDate}</ion-note>
                  </ion-item>
                )}
                {p.height && (
                  <ion-item>
                    <ion-label>Altura</ion-label>
                    <ion-note slot="end">{p.height} cm</ion-note>
                  </ion-item>
                )}
                {p.weight && (
                  <ion-item>
                    <ion-label>Peso</ion-label>
                    <ion-note slot="end">{p.weight} kg</ion-note>
                  </ion-item>
                )}
              </ion-list>
            </ion-card-content>
          </ion-card>
        )}

        {/* Location */}
        {this.hasValidLocation(p.location) && (
          <ion-card>
            <ion-card-header>
              <ion-card-title>Ubicación</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              {p.location?.address && <p>{p.location.address}</p>}
              <ion-button
                fill="clear"
                href={this.mapsUrl(p.location!.lat, p.location!.lng)}
                target="_blank"
              >
                <ion-icon name="map-outline" slot="start" />
                Abrir en Google Maps
              </ion-button>
            </ion-card-content>
          </ion-card>
        )}

        {/* Comments */}
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              Comentarios
              {this.comments.length > 0 && (
                <ion-note class="avg-rating">{this.averageRating}</ion-note>
              )}
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            {this.comments.length > 0 ? (
              <ion-list>
                {this.comments.map((c) => (
                  <ion-item class="comment-item">
                    <ion-label>
                      <div class="comment-header">
                        <strong>{c.author}</strong>
                        <span class="comment-stars">
                          {this.stars(c.rating).map((s) => (
                            <span class={{ 'star-filled': s <= c.rating }}>★</span>
                          ))}
                        </span>
                      </div>
                      <p>{c.text}</p>
                      {this.hasValidLocation(c.location) && (
                        <ion-button
                          fill="clear"
                          size="small"
                          href={this.mapsUrl(c.location!.lat, c.location!.lng)}
                          target="_blank"
                        >
                          <ion-icon name="map-outline" slot="start" />
                          {c.location!.lat}, {c.location!.lng}
                        </ion-button>
                      )}
                      <ion-note>{new Date(c.createdAt).toLocaleString()}</ion-note>
                    </ion-label>
                    {this.isAdmin && (
                      <ion-button
                        slot="end"
                        fill="clear"
                        color="danger"
                        size="small"
                        onClick={() => this.handleDelete(c._id)}
                      >
                        <ion-icon name="trash-outline" />
                      </ion-button>
                    )}
                  </ion-item>
                ))}
              </ion-list>
            ) : (
              <ion-note class="ion-padding-top">
                No hay comentarios aún. ¡Sé el primero en opinar!
              </ion-note>
            )}
          </ion-card-content>
        </ion-card>

        {/* Add Comment */}
        <ion-card>
          <ion-card-header>
            <ion-card-title>Añadir comentario</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form onSubmit={(e) => this.handleSubmit(e)}>
              <ion-item>
                <ion-label position="floating">Tu nombre</ion-label>
                <ion-input
                  value={this.commentAuthor}
                  onIonInput={(e: any) => (this.commentAuthor = e.target.value)}
                  required
                />
              </ion-item>
              <ion-item>
                <ion-label position="floating">Comentario</ion-label>
                <ion-textarea
                  value={this.commentText}
                  onIonInput={(e: any) => (this.commentText = e.target.value)}
                  rows={3}
                  maxlength={1000}
                  required
                />
              </ion-item>
              <ion-item>
                <ion-label>Valoración</ion-label>
                <div class="rating-input">
                  {this.stars(5).map((s) => (
                    <span
                      class={{ 'star-btn': true, 'star-filled': s <= this.commentRating }}
                      onClick={() => (this.commentRating = s)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </ion-item>
              <ion-item>
                <ion-label>Ubicación</ion-label>
                <ion-button
                  fill="outline"
                  size="small"
                  type="button"
                  onClick={() => this.useCurrentLocation()}
                >
                  <ion-icon name="location-outline" slot="start" />
                  {this.commentLocation
                    ? `${this.commentLocation.lat.toFixed(4)}, ${this.commentLocation.lng.toFixed(4)}`
                    : 'Añadir ubicación'}
                </ion-button>
              </ion-item>
              {(this.error) && (
                <ion-note color="danger" class="ion-padding-top">
                  {this.error}
                </ion-note>
              )}
              <ion-button
                type="submit"
                expand="block"
                class="ion-margin-top"
                disabled={!this.commentAuthor.trim() || !this.commentText.trim() || this.commentLoading}
              >
                {this.commentLoading && <ion-spinner slot="start" />}
                Publicar comentario
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </div>
    );
  }
}
