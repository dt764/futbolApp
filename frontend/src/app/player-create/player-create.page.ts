import { Component, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PlayerState } from '../services/player.state';
import { GeoLocation } from '../models/player.models';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { AdminBadgeComponent } from '../admin-badge/admin-badge.component';
import { sanitizeError } from '../validators';
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

function positiveNum(v: string): boolean {
  return v !== '' && !isNaN(Number(v)) && Number(v) > 0;
}

function validCoord(v: string): boolean {
  return v !== '' && !isNaN(Number(v));
}

@Component({
  selector: 'app-player-create',
  templateUrl: 'player-create.page.html',
  styleUrls: ['player-create.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule, AuthHeaderComponent, AdminBadgeComponent],
})
export class PlayerCreatePage implements AfterViewInit, OnDestroy {
  private state = inject(PlayerState);
  private sanitizer = inject(DomSanitizer);

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
  submitting = false;
  loadingLocation = false;
  error = '';
  success = false;

  nameError = '';
  heightError = '';
  weightError = '';
  latError = '';
  lngError = '';

  private map?: L.Map;
  private marker?: L.Marker;

  ngAfterViewInit() {
    // If the form already contains a location (e.g. pre-filled), initialize the map.
    if (this.form.location) {
      this.initMap(this.form.location.lat, this.form.location.lng);
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(lat: number, lng: number) {
    if (this.map) {
      this.map.setView([lat, lng], 13);
      this.updateMarker(lat, lng);
      return;
    }

    setTimeout(() => {
      const container = document.getElementById('map-create');
      if (!container) return;

      this.map = L.map('map-create').setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.updateMarker(lat, lng);

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.form.location = {
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };
        this.updateMarker(e.latlng.lat, e.latlng.lng);
      });
    }, 100);
  }

  private updateMarker(lat: number, lng: number) {
    if (!this.map) return;
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const position = this.marker!.getLatLng();
        this.form.location = {
          lat: position.lat,
          lng: position.lng
        };
      });
    }
  }

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
      this.initMap(this.form.location.lat, this.form.location.lng);
    } catch {}
    this.loadingLocation = false;
  }

  clearLocation() {
    this.form.location = null;
    if (this.map) {
      this.map.remove();
      this.map = undefined;
      this.marker = undefined;
    }
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
    this.success = false;

    if (this.pendingPhotoData) {
      try {
        this.form.photo = await this.webPathToBase64(this.pendingPhotoData);
      } catch {
        this.form.photo = this.pendingPhotoData;
      }
      this.pendingPhotoData = null;
    }

    const body: Record<string, unknown> = {
      name: this.form.name.trim(),
    };
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

    this.state.createPlayer(body).subscribe({
      next: () => {
        this.submitting = false;
        this.success = true;
        this.state.refreshPlayers();
        this.resetForm();
      },
      error: (err) => {
        this.submitting = false;
        this.error = sanitizeError(err);
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
