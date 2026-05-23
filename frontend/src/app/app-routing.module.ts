import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

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
    path: 'players/create',
    canActivate: [AuthGuard],
    loadComponent: () => import('./player-create/player-create.page').then((m) => m.PlayerCreatePage),
  },
  {
    path: 'players/import',
    canActivate: [AuthGuard],
    loadComponent: () => import('./player-import/player-import.page').then((m) => m.PlayerImportPage),
  },
  {
    path: 'players/:id/edit',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./player-edit/player-edit.page').then((m) => m.PlayerEditPage),
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
    path: 'ideal-team',
    canActivate: [AuthGuard],
    loadComponent: () => import('./ideal-team/ideal-team.page').then((m) => m.IdealTeamPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
