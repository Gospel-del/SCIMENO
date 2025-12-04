import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Nature, NatureModel } from './nature';
import { NaturesService } from '../../core/services/natures.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TypeCategorie } from '../categories';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}
@Component({
  selector: 'app-natures',
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './natures.html',
  styleUrl: './natures.css'
})
export class Natures implements OnInit {
  error: string | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalPages = 1;
  total: number = 0;
  Math = Math;
  isLoading: boolean = true;
  natures: Nature[] = [];
  actifOnly = false;
  searchTerm = '';

  typeCategorieList = Object.entries(TypeCategorie).map(([key, value]) => ({
    key,
    label: value
  }));
  categorieMap: Record<string, string> = {};
  toasts: Toast[] = [];
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

  constructor(private natureService: NaturesService, private router: Router, private dialog: MatDialog) {}

  ngOnInit() {
    this.categorieMap = this.typeCategorieList.reduce((acc, item) => {
      acc[item.key] = item.label;
      return acc;
    }, {} as Record<string, string>);
    console.log("ngOnInit = ", this.categorieMap);
    this.loadNatures();
  }

  loadNatures(): void {
    this.isLoading = true;
    this.natureService.listNatures(this.pageIndex, this.pageSize, undefined, this.actifOnly).subscribe(
      (response: any) => {
        if (response && response.success && response.data) {
          this.natures = response.data.base_natures.map((s: Nature) => NatureModel.fromResponse(s));
          this.total = response.data.total;
          this.totalPages = response.data.total_pages;
          this.pageIndex = response.data.page;
        } else {
          this.error = response?.message || 'Erreur lors du chargement des natures';
          this.natures = [];
        }
        this.isLoading = false;
      },
      (error: any) => {
        this.error = 'Erreur lors du chargement des natures';
        console.error('Erreur:', error);
        this.isLoading = false;
      }
    );
  }
  /*
  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadNatures();
  }
  */

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageIndex = page;
      this.loadNatures();
    }
  }

  previousPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadNatures();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages) {
      this.pageIndex++;
      this.loadNatures();
    }
  }

  addNature(): void{
    this.router.navigate(['natures/create']);
  }

  supprimerNature(nature: Nature): void {
    // Logique de suppression
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        title: 'Confirmation',
        message: 'Voulez-vous vraiment supprimer le nature ' + nature.nomNature +' ?',
        cancel: 'Non',
        valid: 'Oui'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // supprimer le nature ici
        this.natureService.deleteNature(nature).subscribe(
          (response: any) => {
            this.showToast(["Suppression réussie !"], "success");
            this.loadNatures();
          },
          (err: HttpErrorResponse) => {
            const serverErrors = [];
            serverErrors.push(err.error?.message || 'Erreur inconnue.');
            this.showToast(serverErrors, "error");
          }
        );
      }
    });
  }

  updateNature(nature: Nature): void{
    this.natureService.setNatureToEdit(nature);  // stocker dans le service
    this.router.navigate(['natures/edit']);
  }

  search(): void {
    if (this.searchTerm.trim().length === 0) {
      this.loadNatures();
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.natureService.searchNature(this.searchTerm).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.natures = response.data.map(s => NatureModel.fromResponse(s));
          this.total = this.natures.length;
          this.totalPages = 1;
        } else {
          this.error = response?.message || 'Aucune nature trouvée';
          this.natures = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors de la recherche';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  toggleActifOnly(): void {
    this.actifOnly = !this.actifOnly;
    this.pageIndex = 1;
    this.loadNatures();
  }

}
