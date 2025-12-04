import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
//import { roleGuard } from './core/guards/role-guard';
import { FonctionUser } from './pages/users/fonctions';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/layout').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] }
      },
      // Routes Utilisateurs
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then(m => m.UsersComponent),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN] }
      },
      {
        path: 'users/create',
        loadComponent: () => import('./pages/users/users-create/users-create').then(m => m.UsersCreateComponent),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN] }
      },
      {
        path: 'users/edit',
        loadComponent: () => import('./pages/users/users-edit/users-edit').then(m => m.UsersEditComponent),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN] }
      },
      // Routes Projets
      {
        path: 'projets',
        loadComponent: () => import('./pages/projets/projets').then(m => m.ProjetsComponent),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] }
      },
      {
        path: 'projets/create',
        loadComponent: () => import('./pages/projets/projets-add/projets-add').then(m => m.ProjetsAdd),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] }
      },
      {
        path: 'projets/edit',
        loadComponent: () => import('./pages/projets/projets-edit/projets-edit').then(m => m.ProjetsEdit),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] }
      },
      // Routes Clients
      {
        path: 'clients',
        loadComponent: () => import('./pages/clients/clients').then(m => m.ClientsComponent),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] }
      },
      {
        path: 'clients/create',
        loadComponent: () => import('./pages/clients/clients-add/clients-add').then(m => m.ClientsAdd),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] }
      },
      {
        path: 'clients/edit',
        loadComponent: () => import('./pages/clients/clients-edit/clients-edit').then(m => m.ClientsEdit),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] }
      },
      // Routes Paramètres
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsComponent),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD] }
      },
      // Routes Natures
      {
        path: 'natures',
        loadComponent: () => import('./pages/natures/natures').then(m => m.Natures),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD] }
      },
      {
        path: 'natures/create',
        loadComponent: () => import('./pages/natures/natures-add/natures-add').then(m => m.NaturesAdd),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD] }
      },
      {
        path: 'natures/edit',
        loadComponent: () => import('./pages/natures/natures-edit/natures-edit').then(m => m.NaturesEdit),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD] }
      },
      // Routes Sous-Natures
      {
        path: 'sous-natures',
        loadComponent: () => import('./pages/sous-natures/sous-natures').then(m => m.SousNatures),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD] }
      },
      {
        path: 'sous-natures/create',
        loadComponent: () => import('./pages/sous-natures/sous-nature-add/sous-nature-add').then(m => m.SousNatureAdd),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD] }
      },
      {
        path: 'sous-natures/edit',
        loadComponent: () => import('./pages/sous-natures/sous-nature-edit/sous-nature-edit').then(m => m.SousNatureEdit),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD] }
      },
      // Routes Regle calcul
      {
        path: 'regle-calculs',
        loadComponent: () => import('./pages/regle-calculs/regle-calculs').then(m => m.RegleCalculs),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN] }
      },
      {
        path: 'regle-calculs/create',
        loadComponent: () => import('./pages/regle-calculs/regle-calculs-add/regle-calculs-add').then(m => m.RegleCalculsAdd),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN] }
      },
      {
        path: 'regle-calculs/edit',
        loadComponent: () => import('./pages/regle-calculs/regle-calculs-edit/regle-calculs-edit').then(m => m.RegleCalculsEdit),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN] }
      },
      // Routes indicateur cle
      {
        path: 'indicateur-cle',
        loadComponent: () => import('./pages/formule-builder/formule-builder').then(m => m.FormuleBuilder),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN] }
      },
      {
        path: 'indicateur-cle/create',
        loadComponent: () => import('./pages/formule-builder/formule-builder-add/formule-builder-add').then(m => m.FormuleBuilderAdd),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN] }
      },
      {
        path: 'indicateur-cle/edit',
        loadComponent: () => import('./pages/formule-builder/formule-builder-edit/formule-builder-edit').then(m => m.FormuleBuilderEdit),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN] }
      },
      // Routes Scénarios
      {
        path: 'scenarios',
        loadComponent: () => import('./pages/scenarios/scenarios').then(m => m.ScenariosComponent),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN] }
      },
      {
        path: 'scenarios/create',
        loadComponent: () => import('./pages/scenarios/scenarios-create/scenarios-create').then(m => m.ScenariosCreateComponent),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN] }
      },
      {
        path: 'scenarios/edit/:id',
        loadComponent: () => import('./pages/scenarios/scenarios-edit/scenarios-edit').then(m => m.ScenariosEditComponent),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN] }
      },
      // Route Test d'authentification
      {
        path: 'auth-test',
        loadComponent: () => import('./pages/auth-test/auth-test').then(m => m.AuthTestComponent),
        canActivate: [roleGuard],
        data: { roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] }
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
