import { GlobalFonctionService } from './../../core/services/global-fonction.service';
import { finalize, forkJoin, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { create, all } from 'mathjs';
import { Nature } from '../natures/nature';
import { NaturesService } from '../../core/services/natures.service';
import { Router } from '@angular/router';
import { Select2, Select2Data } from 'ng-select2-component';
import { TypeCategorie } from '../categories';
import { RegleCalcul } from '../regle-calculs/regle-calcul';
import { RegleCalculService } from '../../core/services/regle-calcul-service';
import { HttpErrorResponse } from '@angular/common/http';
import { SousNature } from '../sous-natures/sous-nature';
import { SousNaturesService } from '../../core/services/sous-natures.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { TypeIndicateur } from './indicateur';

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
  selector: 'app-formule-builder',
  imports: [FormsModule, CommonModule, MatProgressSpinner],
  templateUrl: './formule-builder.html',
  styleUrl: './formule-builder.css',
})
export class FormuleBuilder implements OnInit{
  pageIndex: number = 1;
  pageSize: number = 10;
  total: number = 0;
  totalPages: number = 0;
  Math = Math;
  isLoading: boolean = true;
  natures: Nature[] = [];
  sousNatures: SousNature[] = [];
  newRegleCalculs: RegleCalcul[] = [];
  regleCalculs: RegleCalcul[] = []
  elements: Element[] = [];
  allowedInd: Set<string> = new Set<string>();
  typeCategorieList = Object.entries(TypeCategorie).map(([key, value]) => ({
    key,
    label: value
  }));
  typeIndicateurList = Object.entries(TypeIndicateur).map(([key, value]) => ({
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
    private globalFonctionService: GlobalFonctionService,
    private router: Router,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.categorieMap = this.typeCategorieList.reduce((acc, item) => {
      acc[item.key] = item.label;
      return acc;
    }, {} as Record<string, string>);

    this.typeIndicateurList.forEach(element => {
      this.allowedInd.add(element.key);
    });

    //this.loadNatures();
    this.loadPageData();
  }

  loadPageData(): void {
    this.isLoading = true;
    forkJoin({
      sousNatures: this.sousNatureService.listSousNatures(1, 1000),
      natures: this.natureService.listNatures(1, 1000),
      regleCalculs: this.regleCalculService.listRegleCalculs(this.pageIndex, this.pageSize, ['IND']),
    }).subscribe({
      next: ({ sousNatures, natures, regleCalculs }) => {
        if(sousNatures && sousNatures.success && sousNatures.data && natures && natures.success && natures.data && regleCalculs && regleCalculs.success && regleCalculs.data){
          this.sousNatures = sousNatures.data.sous_natures;
          this.natures = natures.data.base_natures;
          this.regleCalculs = regleCalculs.data.regles_calcul;
          this.total = regleCalculs.data.total;
          this.pageIndex = regleCalculs.data.page;
          this.totalPages = regleCalculs.data.total_pages;
          //this.newRegleCalculs = this.globalFonctionService.mergeUnique(this.newRegleCalculs, this.regleCalculs, n => n.idSousNature);
          this.buildElement();
          this.isLoading = false;
          //this.cdr.detectChanges();
        }
      },
      error: () => (this.isLoading = false)
    });
  }


  buildElement(): void {
    this.elements = this.regleCalculs
    .map(rg => {
      const sousNature = this.sousNatures.find(sn => sn.idSousNature === rg.idSousNature);
      const nature = sousNature
        ? this.natures.find(n => n.idNature === sousNature.idNature)
        : undefined;

      return {
        sousNature: sousNature as SousNature,
        nature: (nature ?? {}) as Nature,
        regleCalcul: rg as RegleCalcul
      };
    });
    //.filter(elt => elt.nature.typeNature !== 'IND');
    //this.total = this.elements.length;
    //this.totalPages =  Math.ceil(this.elements.length / this.pageSize);
  }

  onPageChange(page: number): void {
    const maxPage = Math.ceil(this.total / this.pageSize);
    if (page < 1 || page > maxPage) return;
    this.pageIndex = page;
    this.loadPageData();// loadSousNatures();
  }

  addRegle(): void{
    this.router.navigate(['indicateur-cle/create']);
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
    this.router.navigate(['indicateur-cle/edit']);
  }

}
