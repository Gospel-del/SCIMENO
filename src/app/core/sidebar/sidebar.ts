import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuService } from '../services/menu.service';
import { MenuItem } from '../../models/menu.model';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  sidebarCollapsed = false;
  hoveredItem: MenuItem | null = null;
  isHovered = false;
  currentUser: any = null;
  userName: string = 'Utilisateur';
  userRole: string = 'Utilisateur';
  userAvatarUrl: string = '';

  constructor(
    private menuService: MenuService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.menuService.menuItems$.subscribe((items: MenuItem[]) => {
      this.menuItems = items;
    });

    this.menuService.sidebarCollapsed$.subscribe(
      (collapsed: boolean) => this.sidebarCollapsed = collapsed
    );
  }

  loadUserInfo(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.userName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
      this.userRole = this.currentUser.role || 'Utilisateur';
      this.userAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userName)}&background=0D8ABC&color=fff`;
    }
  }

  toggleSidebar(): void {
    this.menuService.toggleSidebar();
  }

  toggleMenuItem(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  onMenuItemHover(item: MenuItem): void {
    this.hoveredItem = item;
    this.isHovered = true;
  }

  logout(): void {
    this.authService.logout();
  }
}
