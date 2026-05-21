import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PlayerState } from '../services/player.state';
import { GeoLocation } from '../models/player.models';

@Component({
  selector: 'app-player-create',
  templateUrl: 'player-create.page.html',
  styleUrls: ['player-create.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule],
})
export class PlayerCreatePage {
  private state = inject(PlayerState);

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
  submitting = false;
  error = '';
  success = false;

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
    this.success = false;

    const body: Record<string, unknown> = {
      name: this.form.name.trim(),
    };
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

    this.state.createPlayer(body).subscribe({
      next: () => {
        this.submitting = false;
        this.success = true;
        this.state.refreshPlayers();
        this.resetForm();
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.error || err.message || 'Error al crear el jugador';
      },
    });
  }

  private resetForm() {
    this.form = {
      name: '', firstname: '', lastname: '', nationality: '',
      position: '', birthDate: '', height: '', weight: '',
      team: '', league: '', photo: '',
      location: null,
    };
    this.photoPreview = null;
  }
}
