import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TypeCategorie } from '../categories';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SousNature, SousNatureModel } from './sous-nature';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { SousNaturesService } from '../../core/services/sous-natures.service';
import { Nature, NatureModel } from '../natures/nature';
import { NaturesService } from '../../core/services/natures.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { GlobalFonctionService } from '../../core/services/global-fonction.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
interface SousNature_Nature{
  sousNature: SousNature;
  nature: Nature;
}

interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}

@Component({
  selector: 'app-sous-natures',
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './sous-natures.html',
  styleUrl: './sous-natures.css'
})
export class SousNatures implements OnInit{
  error: string | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  total: number = 0;
  totalPages = 1;
  Math = Math;
  actifOnly = false;
  searchTerm = '';
  isLoading: boolean = true;
  natures: Nature[] = [];
  sousNatures: SousNature[] = [];
  newSousNatures: SousNature[] = [];
  typeCategorieList = Object.entries(TypeCategorie).map(([key, value]) => ({
    key,
    label: value
  }));
  categorieMap: Record<string, string> = {};
  sousNature_natures: SousNature_Nature[] = [];

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
    private globalFonctionService: GlobalFonctionService,
    private router: Router,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.categorieMap = this.typeCategorieList.reduce((acc, item) => {
      acc[item.key] = item.label;
      return acc;
    }, {} as Record<string, string>);
    this.loadPageData();
  }

  loadPageData(): void {
    this.isLoading = true;
    forkJoin({
      sousNatures: this.sousNatureService.listSousNatures(this.pageIndex, this.pageSize),
      natures: this.natureService.listNatures(1, 1000)
    }).subscribe({
      next: ({ sousNatures, natures }) => {
        console.log("loadPageData = ", sousNatures, natures);
        if (sousNatures && sousNatures.success && sousNatures.data && natures && natures.success && natures.data) {
          this.total = sousNatures.data.total;
          this.totalPages = sousNatures.data.total_pages;
          this.pageIndex = sousNatures.data.page;
          this.natures = natures.data.base_natures.map((s: Nature) => NatureModel.fromResponse(s));
          this.sousNatures = sousNatures.data.sous_natures.map((s: SousNature) => SousNatureModel.fromResponse(s));
          //this.newSousNatures = this.globalFonctionService.mergeUnique(this.newSousNatures, this.sousNatures, n => n.idSousNature);
          this.buildSousNatureNature();
        } else {
          this.error = sousNatures?.message || 'Erreur lors du chargement des natures';
          this.natures = [];
          this.sousNatures = [];
        }
        this.isLoading = false;
      }
    });
  }

  buildSousNatureNature(): void {
    console.log('buildSousNatureNature', {
      natures: this.natures,
      sousNatures: this.sousNatures
    });
    this.sousNature_natures = this.sousNatures.map(sn => {
      const nature = this.natures.find(n => n.idNature === sn.idNature);
      return { sousNature: sn as SousNature, nature: nature ?? {} as Nature };
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

  addSousNature(): void{
    this.router.navigate(['sous-natures/create']);
  }

  supprimerSousNature(sousNature: SousNature): void {
    // Logique de suppression
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        title: 'Confirmation',
        message: 'Voulez-vous vraiment supprimer la sous-nature ' + sousNature.nomSousNature +' ?',
        cancel: 'Non',
        valid: 'Oui'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // supprimer le nature ici
        this.sousNatureService.deleteSousNature(sousNature).subscribe(
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

  updateSousNature(sousNature: SousNature, idNature: number): void{
    //sousNature.idNature = idNature;
    this.sousNatureService.setSousNatureToEdit(sousNature);  // stocker dans le service
    this.router.navigate(['sous-natures/edit']);
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
          this.buildSousNatureNature();
          this.total = this.natures.length;
          this.totalPages = 1;
        } else {
          this.error = response?.message || 'Aucune sous nature trouvée';
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
    this.loadPageData();
  }
}
