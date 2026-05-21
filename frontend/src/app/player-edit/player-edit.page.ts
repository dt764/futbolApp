import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PlayerState } from '../services/player.state';
import { GeoLocation } from '../models/player.models';

@Component({
  selector: 'app-player-edit',
  templateUrl: 'player-edit.page.html',
  styleUrls: ['player-edit.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule],
})
export class PlayerEditPage implements OnInit {
  private state = inject(PlayerState);
  private route = inject(ActivatedRoute);

  playerId = '';

  form = {
    name: '',
    firstname: '',
    lastname: '',
    nationality: '',
    position: '',
    birthDate: '',
    height: '',
    weight: '',
    team: '',
    league: '',
    photo: '',
    location: null as GeoLocation | null,
  };

  photoPreview: string | null = null;
  loading = true;
  submitting = false;
  error = '';
  success = false;

  ngOnInit() {
    this.playerId = this.route.snapshot.paramMap.get('id')!;
    this.loadPlayer();
  }

  private loadPlayer() {
    this.state.getPlayerById(this.playerId).subscribe({
      next: (res) => {
        const p = res.player;
        this.form = {
          name: p.name || '',
          firstname: p.firstname || '',
          lastname: p.lastname || '',
          nationality: p.nationality || '',
          position: p.position || '',
          birthDate: p.birthDate || '',
          height: p.height || '',
          weight: p.weight || '',
          team: p.team || '',
          league: p.league || '',
          photo: p.photo || '',
          location: p.location || null,
        };
        this.photoPreview = p.photo || null;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el jugador';
        this.loading = false;
      },
    });
  }

  takePhoto() {
    Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 80,
    }).then((photo) => {
      this.photoPreview = photo.dataUrl!;
      this.form.photo = photo.dataUrl!;
    }).catch(() => {});
  }

  pickFromGallery() {
    Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      quality: 80,
    }).then((photo) => {
      this.photoPreview = photo.dataUrl!;
      this.form.photo = photo.dataUrl!;
    }).catch(() => {});
  }

  usePhotoUrl() {
    this.photoPreview = this.form.photo || null;
  }

  clearPhoto() {
    this.photoPreview = null;
    this.form.photo = '';
  }

  useCurrentLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.form.location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      },
      () => {},
    );
  }

  clearLocation() {
    this.form.location = null;
  }

  hasValidLocation(): boolean {
    return !!this.form.location && (this.form.location.lat !== 0 || this.form.location.lng !== 0);
  }

  mapsUrl(): string {
    if (!this.form.location) return '';
    return `https://www.google.com/maps?q=${this.form.location.lat},${this.form.location.lng}`;
  }

  submit() {
    if (!this.form.name.trim()) return;

    this.submitting = true;
    this.error = '';

    const body: Record<string, unknown> = {};
    body['name'] = this.form.name.trim();
    if (this.form.firstname.trim()) body['firstname'] = this.form.firstname.trim();
    if (this.form.lastname.trim()) body['lastname'] = this.form.lastname.trim();
    if (this.form.nationality.trim()) body['nationality'] = this.form.nationality.trim();
    if (this.form.position.trim()) body['position'] = this.form.position.trim();
    if (this.form.birthDate) body['birthDate'] = this.form.birthDate;
    if (this.form.height.trim()) body['height'] = this.form.height.trim();
    if (this.form.weight.trim()) body['weight'] = this.form.weight.trim();
    if (this.form.team.trim()) body['team'] = this.form.team.trim();
    if (this.form.league.trim()) body['league'] = this.form.league.trim();
    if (this.form.photo) body['photo'] = this.form.photo;
    if (this.form.location) body['location'] = this.form.location;

    this.state.updatePlayer(this.playerId, body).subscribe({
      next: (res) => {
        this.submitting = false;
        this.success = true;
        this.state.setSelectedPlayer(res.player);
        this.state.refreshPlayers();
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.error || err.message || 'Error al actualizar el jugador';
      },
    });
  }
}
