import { ProjetsServices } from './../../core/services/projets.services';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Projet, ProjetModel } from './projet';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TypeCategorie } from '../categories';
import { TypeProjets } from './combo';
import { ComboBoxProjet } from './interface-projet';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { HttpErrorResponse } from '@angular/common/http';

interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}
@Component({
  selector: 'app-projets',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './projets.html',
  styleUrl: './projets.css'
})
export class ProjetsComponent implements OnInit {
  error: string | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalPages = 1;
  total: number = 0;
  Math = Math;
  isLoading: boolean = true;
  actifOnly: boolean = false;
  projets: Projet[] = [];
  searchTerm = '';

  public typeProjets = TypeProjets;

  // Map rapide pour lookup
  public typeProjetsMap: Record<number, string> = {};
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

  constructor(private router: Router,
    private dialog: MatDialog,
    private projetsServices: ProjetsServices) {}

  ngOnInit() {
    this.typeProjetsMap = Object.fromEntries(
      TypeProjets.map(t => [t.id, t.name])
    );
    this.loadProjets();
  }

  loadProjets(){
    this.isLoading = true;//pageIndex: number, pageSize: number, search_term?: string, idClient?: string, actifOnly: boolean=false
    this.projetsServices.listProjets(this.pageIndex, this.pageSize, this.searchTerm, undefined, this.actifOnly).subscribe(
      (response: any) => {
        if (response && response.success && response.data) {
          this.projets = response.data.projets.map((s: Projet) => ProjetModel.fromResponse(s));
          this.total = response.data.total;
          this.totalPages = response.data.total_pages;
          this.pageIndex = response.data.page;
        } else {
          this.error = response?.message || 'Erreur lors du chargement des projets';
          this.projets = [];
        }
        this.isLoading = false;
      },
      (error: any) => {
        this.error = 'Erreur lors du chargement des projets';
        console.error('Erreur:', error);
        this.isLoading = false;
      }
    );
  }

  supprimerProjet(projet: Projet): void {
    //console.log('Suppression projet:', id);
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        title: 'Confirmation',
        message: 'Voulez-vous vraiment supprimer le projet ' + projet.nomProjet +' ?',
        cancel: 'Non',
        valid: 'Oui'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // supprimer le nature ici
        this.projetsServices.deleteProjet(projet).subscribe(
          (response: any) => {
          (err: HttpErrorResponse) => {
            const serverErrors = [];
            serverErrors.push(err.error?.message || 'Erreur inconnue.');
            this.showToast(serverErrors, "error");
          }
            this.loadProjets();//this.loadSousNatures();
          },
          (err: HttpErrorResponse) => {
            const serverErrors = [];
            serverErrors.push(err.error?.message || 'Erreur inconnue.');
            this.showToast(serverErrors, "error");
          }
        );
      }
    });
    /*
    const newStatus = !projet.statut;
    this.projetsServices.toggleScenario(scenario.id_scenario, newStatus).subscribe({
      next: (updatedScenario) => {
        if (updatedScenario) {
          const index = this.scenarios.findIndex(s => s.id_scenario === scenario.id_scenario);
          if (index !== -1) {
            this.scenarios[index] = updatedScenario;
          }
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
    */
    // Logique de suppression
  }

  addProjet(): void{
    this.router.navigate(['projets/create']);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageIndex = page;
      this.loadProjets();
    }
  }

  previousPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadProjets();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages) {
      this.pageIndex++;
      this.loadProjets();
    }
  }

  updateProjet(projet: Projet, isDuplicate: boolean): void{
    //
    this.projetsServices.setProjetToEdit(projet, isDuplicate);  // stocker dans le service
    this.router.navigate(['projets/edit']);
  }

  search(): void {
    this.isLoading = true;
    this.error = null;
    if (this.searchTerm.trim().length === 0) {
      console.log("search = ", this.searchTerm.trim().length)
      this.loadProjets();
      return;
    }


    this.projetsServices.searchProjet(1, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.projets = response.data.projets.map((s: Projet) => ProjetModel.fromResponse(s));
          this.total = this.projets.length;
          this.totalPages = 1;
        } else {
          this.error = response?.message || 'Aucun projet trouvée';
          this.projets = [];
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
}
