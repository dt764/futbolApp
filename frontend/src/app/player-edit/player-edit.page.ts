import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PlayerState } from '../services/player.state';
import { GeoLocation } from '../models/player.models';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { AdminBadgeComponent } from '../admin-badge/admin-badge.component';
import { sanitizeError } from '../validators';

function positiveNum(v: string): boolean {
  return v !== '' && !isNaN(Number(v)) && Number(v) > 0;
}

function validCoord(v: string): boolean {
  return v !== '' && !isNaN(Number(v));
}

@Component({
  selector: 'app-player-edit',
  templateUrl: 'player-edit.page.html',
  styleUrls: ['player-edit.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule, AuthHeaderComponent, AdminBadgeComponent],
})
export class PlayerEditPage implements OnInit {
  private state = inject(PlayerState);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

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

  photoPreview: SafeResourceUrl | string | null = null;
  private pendingPhotoData: string | null = null;
  loading = true;
  submitting = false;
  loadingLocation = false;
  error = '';
  success = false;

  nameError = '';
  heightError = '';
  weightError = '';
  latError = '';
  lngError = '';

  private clearErrors() {
    this.error = '';
    this.nameError = '';
    this.heightError = '';
    this.weightError = '';
    this.latError = '';
    this.lngError = '';
  }

  validateField(field: string) {
    switch (field) {
      case 'name':
        this.nameError = !this.form.name.trim() ? 'El nombre es obligatorio' : '';
        break;
      case 'height':
        this.heightError = this.form.height !== '' && !positiveNum(this.form.height) ? 'Debe ser un número positivo' : '';
        break;
      case 'weight':
        this.weightError = this.form.weight !== '' && !positiveNum(this.form.weight) ? 'Debe ser un número positivo' : '';
        break;
      case 'lat':
        this.latError = (this.form.location && !validCoord(String(this.form.location.lat))) ? 'Latitud no válida' : '';
        break;
      case 'lng':
        this.lngError = (this.form.location && !validCoord(String(this.form.location.lng))) ? 'Longitud no válida' : '';
        break;
    }
  }

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

  async takePhoto() {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 80,
      });
      if (photo.webPath) {
        this.photoPreview = this.sanitizer.bypassSecurityTrustResourceUrl(photo.webPath);
        this.pendingPhotoData = photo.webPath;
        this.form.photo = '';
      }
    } catch {}
  }

  async pickFromGallery() {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 80,
      });
      if (photo.webPath) {
        this.photoPreview = this.sanitizer.bypassSecurityTrustResourceUrl(photo.webPath);
        this.pendingPhotoData = photo.webPath;
        this.form.photo = '';
      }
    } catch {}
  }

  usePhotoUrl() {
    this.pendingPhotoData = null;
    if (this.form.photo) {
      this.photoPreview = this.form.photo;
    } else {
      this.photoPreview = null;
    }
  }

  clearPhoto() {
    this.photoPreview = null;
    this.pendingPhotoData = null;
    this.form.photo = '';
  }

  private async webPathToBase64(webPath: string): Promise<string> {
    const response = await fetch(webPath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async useCurrentLocation() {
    this.loadingLocation = true;
    try {
      const pos = await Geolocation.getCurrentPosition();
      this.form.location = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
    } catch {}
    this.loadingLocation = false;
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

  async submit() {
    this.clearErrors();

    this.nameError = !this.form.name.trim() ? 'El nombre es obligatorio' : '';
    this.heightError = this.form.height !== '' && !positiveNum(this.form.height) ? 'Debe ser un número positivo' : '';
    this.weightError = this.form.weight !== '' && !positiveNum(this.form.weight) ? 'Debe ser un número positivo' : '';
    if (this.form.location) {
      this.latError = !validCoord(String(this.form.location.lat)) ? 'Latitud no válida' : '';
      this.lngError = !validCoord(String(this.form.location.lng)) ? 'Longitud no válida' : '';
    }
    if (this.nameError || this.heightError || this.weightError || this.latError || this.lngError) return;

    this.submitting = true;
    this.error = '';

    if (this.pendingPhotoData) {
      try {
        this.form.photo = await this.webPathToBase64(this.pendingPhotoData);
      } catch {
        this.form.photo = this.pendingPhotoData;
      }
      this.pendingPhotoData = null;
    }

    const body: Record<string, unknown> = {};
    body['name'] = this.form.name.trim();
    if (this.form.firstname.trim()) body['firstname'] = this.form.firstname.trim();
    if (this.form.lastname.trim()) body['lastname'] = this.form.lastname.trim();
    if (this.form.nationality.trim()) body['nationality'] = this.form.nationality.trim();
    if (this.form.position.trim()) body['position'] = this.form.position.trim();
    if (this.form.birthDate) body['birthDate'] = this.form.birthDate;
    if (this.form.height != null && String(this.form.height).trim()) body['height'] = String(this.form.height).trim();
    if (this.form.weight != null && String(this.form.weight).trim()) body['weight'] = String(this.form.weight).trim();
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
        this.error = sanitizeError(err);
      },
    });
  }
}
