import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';
import { filter } from 'rxjs/operators';
import { ADMIN_MENU, MenuItem } from '../../models/menu.model';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../services/auth';
import { FonctionUser } from '../../pages/users/fonctions';

interface BreadcrumbItem {
  name: string;
  path?: string;
  active: boolean;
}

interface SubmenuItem {
  name: string;
  path: string[];
  iconClasses: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit {
  currentUrl: string = '';
  activeMenu: string = '';
  showRibbon: boolean = false;
  contentClass: string = '';
  filteredMenu: MenuItem[] = [];

  constructor(private router: Router, private userService: AuthService) {}

  ngOnInit(): void {
    // Filtrer le menu selon le rôle de l'utilisateur
    this.filteredMenu = this.filterMenuByRole(ADMIN_MENU, this.userService.getCurrentUserRole());

    // Initialisation de l'état
    this.currentUrl = this.router.url;
    this.updatePageInfo();

    // Écouter les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
      this.updatePageInfo();
    });
  }

  showSubmenuRibbon1(): boolean {
    const showRibbonPaths: string[] = [];
    this.filteredMenu.forEach(menu => {
      if (menu.path) showRibbonPaths.push(...menu.path.filter(p => p !== '/dashboard'));
    });

    return this.currentUrl !== '/dashboard' &&
           showRibbonPaths.some(path => this.currentUrl.startsWith(path));
  }

  showSubmenuRibbon(): boolean {
    const showRibbonPaths = [];
    let path;
    for (const menu of ADMIN_MENU) {
      if (!menu.path) continue;
      if (menu.path?.length == 0) continue;

      showRibbonPaths.push(...menu.path.filter(p => p !== "/dashboard"));
    }

    // Le ruban est visible si on n'est pas sur le dashboard
    const shouldShow = this.currentUrl !== '/dashboard' &&
                      showRibbonPaths.some(path => this.currentUrl.startsWith(path));

    console.log('🎯 showSubmenuRibbon() appelée - URL:', this.currentUrl, 'Résultat:', shouldShow);
    return shouldShow;
  }

  // -------------------
  // Filtrage RBAC du menu
  // -------------------
  private filterMenuByRole(menu: MenuItem[], role: FonctionUser): MenuItem[] {
    return menu
      .filter(item => item.roles?.includes(role)) // garder uniquement les items autorisés pour ce rôle
      .map(item => {
        const newItem: MenuItem = { ...item };
        if (newItem.children) {
          newItem.children = this.filterMenuByRole(newItem.children, role);
        }
        return newItem;
      });
  }


  // -------------------
  // Mise à jour de l'état de la page
  // -------------------
  /*
  private updatePageInfo(): void {
    // Dashboard
    if (this.currentUrl === '/dashboard') {
      this.activeMenu = 'dashboard';
      this.showRibbon = false;
    } else {
      // Trouver le menu correspondant
      const menu = this.filteredMenu.find(m => m.path?.some(p => this.currentUrl.startsWith(p)));
      if (menu) {
        this.activeMenu = menu.nameClick!;
        this.showRibbon = true;
      } else {
        this.activeMenu = '';
        this.showRibbon = false;
      }
    }

    this.contentClass = this.getContentClass();
  }
    */

  private updatePageInfo(): void {
    if (this.currentUrl === '/dashboard') {
      this.activeMenu = 'dashboard';
      this.showRibbon = false;
      return;
    }

    // Trouver le menu parent correspondant à l’URL
    const menu = this.filteredMenu.find(m =>
      m.path?.some(p => this.currentUrl.startsWith(p))
    );

    this.activeMenu = menu?.nameClick ?? '';
    this.showRibbon = !!menu;
    this.contentClass = this.getContentClass();
  }


  // -------------------
  // Classe CSS dynamique
  // -------------------
  getContentClass(): string {
    let classes = '';
    if (this.activeMenu) {
      classes += `${this.activeMenu}-content`;
    }
    if (this.showRibbon) {
      classes += classes ? ' show-ribbon' : 'show-ribbon';
    }
    return classes;
  }

  // -------------------
  // Sous-menus
  // -------------------
  getSubmenuItems(): SubmenuItem[] {
    const menu = this.filteredMenu.find(m => m.path?.some(p => this.currentUrl.startsWith(p)));
    if (!menu?.children) return [];

    // Convertir MenuItem[] en SubmenuItem[]
    return menu.children
      .filter(child => child.path && child.path.length > 0) // garder seulement ceux avec path défini
      .map(child => ({
        name: child.name,
        path: child.path!,
        iconClasses: child.iconClasses
      }));
  }


  isSubmenuItemActive(path?: string[]): boolean {
    if (!path) return false;
    return path.some(p => this.currentUrl.startsWith(p));
  }

  // -------------------
  // Clic sur menu principal
  // -------------------
  onMenuClick(menuName: string): void {
    this.activeMenu = menuName;
    this.showRibbon = menuName !== 'dashboard';

    const menu = this.filteredMenu.find(m => m.nameClick === menuName);
    if (menu?.path?.length) {
      this.router.navigate([menu.path[0]]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // -------------------
  // Breadcrumb
  // -------------------
  getBreadcrumbItems(): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [];

    for (const menu of this.filteredMenu) {
      const parentPath = menu.path?.[0];
      if (!parentPath) continue;

      if (this.currentUrl.startsWith(parentPath)) {
        items.push({ name: menu.name, path: parentPath, active: false });

        const matchedChild = menu.children?.find(child => this.currentUrl.startsWith(child.path?.[0] || ''));
        if (matchedChild) {
          items.push({ name: matchedChild.name, path: matchedChild.path?.[0], active: true });
        } else {
          items[items.length - 1].active = true;
        }

        break;
      }
    }

    return items;
  }
}
