import { FonctionUser } from "../pages/users/fonctions";

export interface MenuItem {
  name: string;
  nameClick?: string;
  iconClasses: string;
  path?: string[];
  children?: MenuItem[];
  active?: boolean | undefined;
  expanded?: boolean;
  roles?: FonctionUser[];
}

export const ADMIN_MENU: MenuItem[] = [
  {
    name: 'Dashboard',
    nameClick: 'dashboard',
    iconClasses: 'fas fa-tachometer-alt mr-1',
    path: ['/dashboard'],
    roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE]
  },
  {
    name: 'Utilisateurs',
    nameClick: 'users',
    iconClasses: 'fas fa-users mr-1',
    path: ['/users'],
    roles: [FonctionUser.ADMIN],
    children: [
      { name: 'Liste des utilisateurs', iconClasses: 'fas fa-list', path: ['/users'], roles: [FonctionUser.ADMIN] },
      { name: 'Créer utilisateur', iconClasses: 'fas fa-user-plus', path: ['/users/create'], roles: [FonctionUser.ADMIN] },
      { name: 'Modifier utilisateur', iconClasses: 'fas fa-user-edit', path: ['/users/edit'], roles: [FonctionUser.ADMIN] }
    ]
  },
  {
    name: 'Clients',
    nameClick: 'clients',
    iconClasses: 'fas fa-user-tie mr-1',
    path: ['/clients'],
    roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE],
    children: [
      { name: 'Liste des clients', iconClasses: 'fas fa-list', path: ['/clients'], roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] },
      { name: 'Créer client', iconClasses: 'fas fa-plus', path: ['/clients/create'], roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] },
      { name: 'Modifier client', iconClasses: 'fas fa-edit', path: ['/clients/edit'], roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] }
    ]
  },
  {
    name: 'Projets',
    nameClick: 'projets',
    iconClasses: 'fas fa-project-diagram mr-1',
    path: ['/projets'],
    roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE],
    children: [
      { name: 'Liste des projets', iconClasses: 'fas fa-list', path: ['/projets'], roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] },
      { name: 'Créer projet', iconClasses: 'fas fa-plus', path: ['/projets/create'], roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] },
      { name: 'Modifier projet', iconClasses: 'fas fa-edit', path: ['/projets/edit'], roles: [FonctionUser.ADMIN, FonctionUser.STANDARD, FonctionUser.LIMITE] }
    ]
  },
  {
    name: 'Paramètres',
    nameClick: 'settings',
    iconClasses: 'fas fa-cog mr-1',
    path: ['/natures', '/sous-natures', '/regle-calculs', '/indicateur-cle', '/scenarios', '/settings'],
    roles: [FonctionUser.ADMIN, FonctionUser.STANDARD],
    children: [
      { name: 'Nature', iconClasses: 'fas fa-sliders-h', path: ['/natures'], roles: [FonctionUser.ADMIN, FonctionUser.STANDARD] },
      { name: 'Sous-Nature', iconClasses: 'fas fa-sliders-h', path: ['/sous-natures'], roles: [FonctionUser.ADMIN, FonctionUser.STANDARD] },
      { name: 'Regles-Calculs', iconClasses: 'fas fa-sliders-h', path: ['/regle-calculs'], roles: [FonctionUser.ADMIN] },
      { name: 'Indicateur-Clés', iconClasses: 'fas fa-sliders-h', path: ['/indicateur-cle'], roles: [FonctionUser.ADMIN] },
      { name: 'Scénarios', iconClasses: 'fas fa-chart-line', path: ['/scenarios'], roles: [FonctionUser.ADMIN] },
      { name: 'Général', iconClasses: 'fas fa-sliders-h', path: ['/settings'], roles: [FonctionUser.ADMIN] },
      //{ name: 'Sécurité', iconClasses: 'fas fa-lock', path: ['/settings/security'] },
      //{ name: 'Notifications', iconClasses: 'fas fa-bell', path: ['/settings/notifications'] }
    ]
  }
];
