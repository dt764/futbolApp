import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'players',
    loadComponent: () => import('./players/players.page').then((m) => m.PlayersPage),
  },
  {
    path: 'players/import',
    canActivate: [AuthGuard],
    loadComponent: () => import('./player-import/player-import.page').then((m) => m.PlayerImportPage),
  },
  {
    path: 'players/:id',
    loadComponent: () => import('./player-detail/player-detail.page').then((m) => m.PlayerDetailPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
