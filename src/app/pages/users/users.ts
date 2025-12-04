import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { Utilisateur, UtilisateurModel } from './user';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FonctionUser, FonctionUserLabel } from './fonctions';

interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class UsersComponent implements OnInit {
  users: UtilisateurModel[] = [];
  loading = false;
  error: string | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalPages = 1;
  total: number = 0;
  Math = Math;
  searchTerm: string = "";
  toasts: Toast[] = [];
  fonctionMap: Record<string, string> = {};

  fonctionUserList = Object.values(FonctionUser).map(key => ({
    key,
    label: FonctionUserLabel[key]
  }));

  showToast(messages: string[], type: 'success' | 'error' = 'success') {
    const toast: Toast = { message: messages, type, visible: false };
    this.toasts.push(toast);

    // Forcer le rendu avant animation
    requestAnimationFrame(() => {
      toast.visible = true;
    });

    // Auto-fermeture après 3 secondes
    toast.timeout = setTimeout(() => this.closeToast(toast), 3000);
  }

  closeToast(toast: Toast) {
    clearTimeout(toast.timeout);
    toast.visible = false;

    // Supprimer le toast après animation
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 400);
  }

  constructor(private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fonctionMap = this.fonctionUserList.reduce((acc, item) => {
      acc[item.key] = item.label;
      return acc;
    }, {} as Record<string, string>);
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.userService.getAllUsers(this.pageIndex, this.pageSize).subscribe({
      next: (response: any) => {
        console.log("response = ", response)
        if (response && response.success && response.data) {
          this.users = response.data.utilisateurs.map((s: Utilisateur) => UtilisateurModel.fromResponse(s));
          this.total = response.data.total;
          this.totalPages = response.data.total_pages;
          this.pageIndex = response.data.page;
        } else {
          this.error = response?.message || 'Erreur lors du chargement des utilisateurs';
          this.users = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des utilisateurs';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageIndex = page;
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages) {
      this.pageIndex++;
      this.loadUsers();
    }
  }

  deleteUser(user: UtilisateurModel): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.getFullName()} ?`)) {
      this.userService.deleteUser(user.idUtilisateur).subscribe({
        next: () => {
          this.showToast(["Suppression réussie !"], "success");
          this.loadUsers(); // Recharger la liste
        },
        error: (err: HttpErrorResponse) => {
          const serverErrors = [];
          serverErrors.push(err.error?.message || 'Erreur inconnue.');
          this.showToast(serverErrors, "error");
        }
      });
    }
  }

  search(): void {
    if (this.searchTerm.trim().length === 0) {
      this.loadUsers();
      return;
    }

    this.loading = true;
    this.error = null;

    this.userService.searchUsers(this.searchTerm).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.users = response.data.map(s => UtilisateurModel.fromResponse(s));
          this.total = this.users.length;
          this.totalPages = 1;
        } else {
          this.error = response?.message || 'Aucun utilisateur trouvée';
          this.users = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors de la recherche';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  toggleUserStatus(user: UtilisateurModel): void {
    user.statut = !user.statut;
    this.userService.updateUser(user).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.idUtilisateur === user.idUtilisateur);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
      },
      error: (error) => {
        this.showToast(['Erreur lors de la mise à jour'], "error");
        console.error('Erreur lors de la mise à jour:', error);
      }
    });
  }

  updateUser(user: UtilisateurModel): void{
    this.userService.setUserToEdit(user);  // stocker dans le service
    this.router.navigate(['users/edit']);
  }
}
