import { Component, OnInit } from '@angular/core';
import { Nature, NatureModel } from '../natures/nature';
import { SousNature, SousNatureModel } from '../sous-natures/sous-nature';
import { RegleCalcul, RegleCalculModel } from './regle-calcul';
import { TypeCategorie } from '../categories';
import { NaturesService } from '../../core/services/natures.service';
import { SousNaturesService } from '../../core/services/sous-natures.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { RegleCalculService } from '../../core/services/regle-calcul-service';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

interface Element{
  sousNature: SousNature;
  nature: Nature;
  regleCalcul: RegleCalcul;
}

interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}
@Component({
  selector: 'app-regle-calculs',
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './regle-calculs.html',
  styleUrl: './regle-calculs.css'
})
export class RegleCalculs implements OnInit{
  error: string | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  total: number = 0;
  totalPages = 1;
  actifOnly = false;
  searchTerm = '';
  Math = Math;
  isLoading: boolean = true;
  natures: Nature[] = [];
  sousNatures: SousNature[] = [];
  newRegleCalculs: RegleCalcul[] = [];
  regleCalculs: RegleCalcul[] = []
  elements: Element[] = [];
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


  constructor(private natureService: NaturesService,
    private sousNatureService: SousNaturesService,
    private regleCalculService: RegleCalculService,
    private router: Router,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.categorieMap = this.typeCategorieList.reduce((acc, item) => {
      acc[item.key] = item.label;
      return acc;
    }, {} as Record<string, string>);
    //this.loadNatures();
    this.loadPageData();
  }

  loadPageData(): void {
    this.isLoading = true;
    forkJoin({
      sousNatures: this.sousNatureService.listSousNatures(1, 1000),
      natures: this.natureService.listNatures(1, 1000),
      regleCalculs: this.regleCalculService.listRegleCalculs(this.pageIndex, this.pageSize, ['REV', 'DEP', 'INV', 'FIN', 'FDR', 'TRE']),
    }).subscribe({
      next: ({ sousNatures, natures, regleCalculs }) => {
      if (sousNatures && sousNatures.success && sousNatures.data && natures && natures.success && natures.data) {
          this.total = regleCalculs.data.total;
          this.totalPages = regleCalculs.data.total_pages;
          this.pageIndex = regleCalculs.data.page;
          this.sousNatures = sousNatures.data.sous_natures.map((s: SousNature) => SousNatureModel.fromResponse(s));
          this.natures = natures.data.base_natures.map((s: Nature) => NatureModel.fromResponse(s));
          this.regleCalculs = regleCalculs.data.regles_calcul.map((s: RegleCalcul) => RegleCalculModel.fromResponse(s));
          //this.newRegleCalculs = this.mergeUnique(this.newRegleCalculs, this.regleCalculs, n => n.idSousNature);
          this.buildElement();
          this.isLoading = false;
          //this.cdr.detectChanges();
        } else {
          this.error = sousNatures?.message || 'Erreur lors du chargement des natures';
          this.natures = [];
          this.sousNatures = [];
          this.regleCalculs = [];
        }
        this.isLoading = false;
      },
      error: () => (
        this.error = 'Erreur lors du chargement des natures',
        this.isLoading = false
      )
    });
  }

  buildElement(): void {
    this.elements = this.regleCalculs.map(rg => {
      const sousNature = this.sousNatures.find(sn => sn.idSousNature === rg.idSousNature);
      const nature = sousNature
        ? this.natures.find(n => n.idNature === sousNature.idNature)
        : undefined;
      return {
        sousNature: sousNature as SousNature,
        nature: (nature ?? {}) as Nature,
        regleCalcul: rg as RegleCalcul
      };
    });//.filter(e => e.nature.typeNature !== 'IND');
  }

  search(): void {
    if (this.searchTerm.trim().length === 0) {
      this.loadPageData();
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.sousNatureService.searchSousNature(this.searchTerm).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.sousNatures = response.data.map(s => SousNatureModel.fromResponse(s));
          this.buildElement();
          this.total = this.natures.length;
          this.totalPages = 1;
        } else {
          this.error = response?.message || 'Aucune sous sous-nature trouvée';
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageIndex = page;
      this.loadPageData();
    }
  }

  previousPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadPageData();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages) {
      this.pageIndex++;
      this.loadPageData();
    }
  }


  addRegle(): void{
    this.router.navigate(['regle-calculs/create']);
  }

  supprimerRegle(element: Element): void {
    // Logique de suppression
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        title: 'Confirmation',
        message: 'Voulez-vous vraiment supprimer la regle ' + element.sousNature.nomSousNature +' ?',
        cancel: 'Non',
        valid: 'Oui'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // supprimer le nature ici
        this.regleCalculService.deleteRegleCalcul(element.regleCalcul).subscribe(
          (response: any) => {
            this.showToast(["Suppression réussie !"], "success");
            this.loadPageData();//this.loadSousNatures();
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

  updateRegle(element: Element): void{
    //sousNature.idNature = idNature;
    this.regleCalculService.setRegleCalculToEdit(element.regleCalcul);  // stocker dans le service
    this.router.navigate(['regle-calculs/edit']);
  }

}
