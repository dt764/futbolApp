import { Component, Prop, Element, State, Event, EventEmitter, h, Watch } from '@stencil/core';
import * as L from 'leaflet';

// Fix for Leaflet marker icons
const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
const iconUrl = 'assets/leaflet/marker-icon.png';
const shadowUrl = 'assets/leaflet/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

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
  @Element() el: HTMLElement;
  @Prop() player?: Player | null;
  @Prop() comments: Comment[] = [];
  @Prop() isAdmin = false;
  @Prop() loading = false;
  @Prop() commentLoading = false;
  @Prop() error = '';
  @Prop() loggedInUser?: string;

  @Event() addComment: EventEmitter<{
    author: string;
    text: string;
    rating: number;
    location?: { lat: number; lng: number };
  }>;
  @Event() deleteComment: EventEmitter<string>;
  @Event() editPlayer: EventEmitter<void>;
  @Event() deletePlayer: EventEmitter<void>;

  @State() commentAuthor = '';
  @State() commentText = '';
  @State() commentRating = 3;
  @State() hoverRating = 0;
  @State() commentLocation: { lat: number; lng: number } | null = null;
  @State() locationLoading = false;
  @State() commentTextError = '';
  @State() commentAuthorError = '';

  private map?: L.Map;

  @Watch('player')
  handlePlayerChange() {
    this.initMap();
  }

  componentDidLoad() {
    this.initMap();
  }

  private initMap() {
    const p = this.player;
    if (!p || !this.hasValidLocation(p.location)) {
      if (this.map) {
        this.map.remove();
        this.map = undefined;
      }
      return;
    }

    setTimeout(() => {
      const mapContainer = this.el.querySelector('#map-detail') as HTMLElement;
      if (!mapContainer) return;

      if (this.map) {
        this.map.remove();
      }

      this.map = L.map(mapContainer).setView([p.location!.lat, p.location!.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      L.marker([p.location!.lat, p.location!.lng]).addTo(this.map)
        .bindPopup(this.playerName)
        .openPopup();
    }, 200);
  }

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
    this.locationLoading = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.commentLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        this.locationLoading = false;
      },
      () => {
        this.locationLoading = false;
      },
    );
  }

  handleSubmit(e: Event) {
    e.preventDefault();
    this.commentTextError = '';
    this.commentAuthorError = '';

    const author = (this.loggedInUser || this.commentAuthor).trim();
    const text = this.commentText.trim();
    let valid = true;

    if (!author) {
      this.commentAuthorError = 'El nombre es obligatorio';
      valid = false;
    }
    if (!text) {
      this.commentTextError = 'El comentario no puede estar vacío';
      valid = false;
    } else if (text.length < 3) {
      this.commentTextError = 'El comentario debe tener al menos 3 caracteres';
      valid = false;
    }
    if (!valid) return;

    this.addComment.emit({
      author,
      text,
      rating: this.commentRating,
      location: this.commentLocation || undefined,
    });

    this.commentText = '';
    this.commentRating = 5;
    this.commentTextError = '';
    this.commentAuthorError = '';
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
        {/* Player Header + Physical Data */}
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
            {(p.birthDate || p.height || p.weight) && (
              <div class="player-physical">
                {p.birthDate && (
                  <span class="physical-item"><ion-icon name="calendar-outline"></ion-icon> {p.birthDate}</span>
                )}
                {p.height && (
                  <span class="physical-item"><ion-icon name="resize-outline"></ion-icon> {p.height} cm</span>
                )}
                {p.weight && (
                  <span class="physical-item"><ion-icon name="fitness-outline"></ion-icon> {p.weight} kg</span>
                )}
              </div>
            )}
            {this.isAdmin && (
              <div class="admin-buttons">
                <ion-button
                  expand="block"
                  fill="solid"
                  color="tertiary"
                  onClick={() => this.editPlayer.emit()}
                >
                  <ion-icon name="create-outline" slot="start" />
                  Editar
                </ion-button>
                <ion-button
                  expand="block"
                  fill="solid"
                  color="danger"
                  onClick={() => this.deletePlayer.emit()}
                >
                  <ion-icon name="trash-outline" slot="start" />
                  Eliminar
                </ion-button>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        {this.hasValidLocation(p.location) && (
          <ion-card>
            <ion-card-header>
              <ion-card-title>Ubicación</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              {p.location?.address && <p>{p.location.address}</p>}
              <div id="map-detail" class="map-detail"></div>
              <ion-button
                fill="clear"
                color="tertiary"
                href={this.mapsUrl(p.location!.lat, p.location!.lng)}
                target="_blank"
                class="ion-margin-top"
              >
                <ion-icon name="map-outline" slot="start" />
                Abrir en Google Maps
              </ion-button>
            </ion-card-content>
          </ion-card>
        )}

        {/* Comments wrapper */}
        <div class="comments-wrapper">
        {/* Add Comment */}
        <ion-card>
          <ion-card-header>
            <ion-card-title>Añadir comentario</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form onSubmit={(e) => this.handleSubmit(e)}>
              {this.loggedInUser ? (
                <ion-item>
                  <ion-label>Tu nombre</ion-label>
                  <p class="author-display">{this.loggedInUser}</p>
                </ion-item>
              ) : (
                <ion-item class={{ 'item-has-error': !!this.commentAuthorError }}>
                  <ion-input
                    label="Tu nombre"
                    labelPlacement="floating"
                    value={this.commentAuthor}
                    onIonInput={(e: any) => {
                      this.commentAuthor = e.target.value;
                      this.commentAuthorError = '';
                    }}
                    required
                  />
                </ion-item>
              )}
              {!this.loggedInUser && this.commentAuthorError && (
                <ion-note color="danger" class="field-error">{this.commentAuthorError}</ion-note>
              )}
              <ion-item class={{ 'item-has-error': !!this.commentTextError }}>
                <ion-textarea
                  label="Comentario"
                  labelPlacement="floating"
                  value={this.commentText}
                  onIonInput={(e: any) => {
                    this.commentText = e.target.value;
                    this.commentTextError = '';
                  }}
                  rows={3}
                  maxlength={1000}
                  required
                />
              </ion-item>
              {this.commentTextError && (
                <ion-note color="danger" class="field-error">{this.commentTextError}</ion-note>
              )}
              <ion-item>
                <ion-label>Valoración</ion-label>
                <div class="rating-input">
                  {this.stars(5).map((s) => (
                    <span
                      class={{ 'star-btn': true, 'star-filled': s <= (this.hoverRating || this.commentRating) }}
                      onClick={() => (this.commentRating = s)}
                      onMouseEnter={() => (this.hoverRating = s)}
                      onMouseLeave={() => (this.hoverRating = 0)}
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
                  color="tertiary"
                  disabled={this.locationLoading}
                  onClick={() => this.useCurrentLocation()}
                >
                  {this.locationLoading ? (
                    <ion-spinner slot="start" />
                  ) : (
                    <ion-icon name="location-outline" slot="start" />
                  )}
                  {this.locationLoading
                    ? 'Obteniendo ubicación...'
                    : this.commentLocation
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
                disabled={(!this.loggedInUser && !this.commentAuthor.trim()) || !this.commentText.trim() || this.commentLoading}
              >
                {this.commentLoading && <ion-spinner slot="start" />}
                Publicar comentario
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>

        {/* Comments */}
        <ion-card>
          <ion-card-header>
            <ion-card-title>Comentarios</ion-card-title>
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
                        <span class="comment-meta">
                          {new Date(c.createdAt).toLocaleString()}
                          {this.hasValidLocation(c.location) && (
                            <span> · {c.location!.lat.toFixed(4)}, {c.location!.lng.toFixed(4)}</span>
                          )}
                        </span>
                      </div>
                      <p class="comment-text">{c.text}</p>
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
        </div>
      </div>
    );
  }
}
