// src/app/core/guards/role-guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { FonctionUser } from '../../pages/users/fonctions';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userRole: string = authService.getCurrentUserRole(); // ex: 'Administrateur'
  const allowedRoles: FonctionUser[] = route.data?.['roles'] ?? [];

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (!allowedRoles.includes(userRole as FonctionUser)) {
    router.navigate(['/dashboard']); // ou page "Accès refusé"
    return false;
  }

  return true;
};
