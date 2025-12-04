import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem, ADMIN_MENU } from '../../models/menu.model';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItems = new BehaviorSubject<MenuItem[]>(ADMIN_MENU);
  menuItems$ = this.menuItems.asObservable();

  private sidebarCollapsed = new BehaviorSubject<boolean>(false);
  sidebarCollapsed$ = this.sidebarCollapsed.asObservable();

  constructor(private router: Router, private authService: AuthService) {
    this.initializeMenu();

    // Update active menu item based on current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentUrl = this.router.url;
      this.updateActiveMenuItem(currentUrl);
    });
  }

  private initializeMenu(): void {
    // Récupérer l'utilisateur courant
    const user = this.authService.getCurrentUser();
    let filteredMenu = ADMIN_MENU;

    if (!user || user.fonction !== 'Administrateur') {
      // On retire certains menus pour les non-admin
      filteredMenu = ADMIN_MENU.filter(item =>
        item.name !== 'Administration' &&
        item.name !== 'Paramètres'
      );
    }
    this.menuItems.next(filteredMenu);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.next(!this.sidebarCollapsed.value);
  }

  toggleMenuItem(itemName: string): void {
    const updatedMenu = this.menuItems.value.map(item => {
      if (item.name === itemName) {
        return { ...item, expanded: !item.expanded };
      }
      return item;
    });

    this.menuItems.next(updatedMenu);
  }

  private updateActiveMenuItem(currentUrl: string): void {
    const updatedMenu = this.menuItems.value.map(item => {
      // Check if this is the active parent item
      const isActiveParent = item.path && item.path[0] === currentUrl;

      // Check if any child is active
      const children = item.children?.map(child => {
        const childPath = child.path?.[0] || '';
        const pathBase = childPath.split(':')[0];
        const isActive = childPath === currentUrl ||
                        (pathBase && currentUrl.startsWith(pathBase));

        return { ...child, active: !!isActive };
      });

      const hasActiveChild = children?.some(child => child.active);

      return {
        ...item,
        active: !!isActiveParent,
        expanded: !!hasActiveChild || !!item.expanded,
        children
      };
    });

    this.menuItems.next(updatedMenu);
  }
}
