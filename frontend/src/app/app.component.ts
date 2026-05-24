import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule],
})
export class AppComponent {
  private auth = inject(AuthService);

  get isLoggedIn() { return this.auth.isLoggedIn(); }

  menuPages = [
    { title: 'Inicio', url: '/home', icon: 'home-outline' },
    { title: 'Jugadores', url: '/players', icon: 'people-outline' },
    { title: 'Equipo Ideal', url: '/ideal-team', icon: 'trophy-outline', auth: true },
    { title: 'Añadir Jugador', url: '/players/create', icon: 'person-add-outline', auth: true },
    { title: 'Importar', url: '/players/import', icon: 'cloud-download-outline', auth: true },
    { title: 'Perfil', url: '/profile', icon: 'settings-outline', auth: true },
  ];

  authPages = [
    { title: 'Iniciar sesión', url: '/login', icon: 'log-in-outline' },
    { title: 'Registrarse', url: '/register', icon: 'person-add-outline' },
  ];

  logout() {
    this.auth.logout().subscribe(() => {
      window.location.href = '/home';
    });
  }
}
