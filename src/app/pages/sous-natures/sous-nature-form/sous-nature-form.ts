import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { SousNature } from '../sous-nature';
import { Nature } from '../../natures/nature';
import { SousNaturesService } from '../../../core/services/sous-natures.service';
import { NaturesService } from '../../../core/services/natures.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TypeCategorie } from '../../categories';
import { ChangeDetectorRef } from '@angular/core';
import { Select2, Select2Data } from 'ng-select2-component';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { GlobalFonctionService } from '../../../core/services/global-fonction.service';

interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}
@Component({
  selector: 'app-sous-nature-form',
  standalone: true,
  imports: [
    // Angular + Material + Forms
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CommonModule,
    MatAutocompleteModule,
    Select2,
    MatProgressSpinner
],
  templateUrl: './sous-nature-form.html',
  styleUrls: ['./sous-nature-form.css']
})
export class SousNatureForm implements OnInit {
  @Input() sousNature!: SousNature;

  // --- Données ---
  natures: Nature[] = [];
  newNatures: Nature[] = [];
  filteredNatures!: Observable<Nature[]>;
  natureControl = new FormControl('');

  // --- Autres propriétés ---
  pageIndex = 1;
  pageSize = 10;
  totalNature = 0;
  isLoading = false;
  isAddForm = false;
  bSaveName = 'Enregistrer';
  serverErrors: string[] = [];
  creationSuccess = false;
  loading = false;
  data: Select2Data = [];

  selectedNatureId: string = "";

  typeCategorieList: any;

  toasts: Toast[] = [];

  constructor(
    private sousNatureService: SousNaturesService,
    private natureService: NaturesService,
    private globalFonctionService: GlobalFonctionService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

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

  ngOnInit() {
    this.typeCategorieList = Object.entries(TypeCategorie).map(([key, value]) => ({
      key,
      label: value
    }));
    this.loadNatures();

    // Déterminer si c’est un ajout ou une édition
    if (this.sousNature) {
      if (this.router.url.includes('/create') || this.sousNature.idSousNature === -1) {
        this.isAddForm = true;
      }
    }
    this.bSaveName = this.isAddForm ? 'Enregistrer' : 'Modifier';
  }

  onNatureChange(value: string) {
    this.sousNature.idNature = Number(value);
  }

  // Chargement des natures
  loadNatures(): void {
    this.isLoading = true;
    this.natureService.listNatures(0, 1000).subscribe({
      next: (response: any) => {
        this.natures = response.data.base_natures;
        this.totalNature = response.data.total;

        this.newNatures = this.globalFonctionService.mergeUnique(this.newNatures, this.natures, n => n.idNature);
        this.data = this.buildSelect2Data(this.newNatures, this.typeCategorieList);


        setTimeout(() => {
          if (this.sousNature?.idNature) {
            this.selectedNatureId = this.sousNature.idNature.toString();
          } else {
            this.selectedNatureId = ''; // ou une autre valeur par défaut
          }

          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => (this.isLoading = false)
    });
  }

  private buildSelect2Data(natures: Nature[], typeCategories: { key: string; label: string }[]): Select2Data {
    return typeCategories.map(cat => {
      console.log("cat = ", cat)
      const options = natures
        .filter(n => n.typeNature === cat.key)
        .map(n => ({
          value: n.idNature.toString(),
          label: n.nomNature,
          id: n.idNature.toString()
        }));

      return {
        label: cat.label,
        data: { name: cat.key },
        options
      };
    }).filter(group => group.options.length > 0); // on garde seulement les groupes non vides
  }

  onNatureSelected(event: any): void {
    const selectedLabel = event.option.value;
    const selectedNature = this.natures.find(n => n.nomNature === selectedLabel);
    if (selectedNature) {
      this.sousNature.idNature = selectedNature.idNature;
    }
  }

  onSubmit() {
    this.creationSuccess = false;
    this.serverErrors = [];
    this.loading = true;

    this.sousNature.idNature = +this.selectedNatureId;

    const obs = this.isAddForm
      ? this.sousNatureService.createSousNature(this.sousNature)
      : this.sousNatureService.updateSousNature(this.sousNature);

    obs.pipe(finalize(() => (this.loading = false))).subscribe({
      next: (result) => {
        if(result){
          this.creationSuccess = true;
          console.log('Sauvegarde réussie', result);
          if(this.isAddForm){
            this.selectedNatureId = "";
            this.sousNature = {
              idSousNature: -5,
              idNature: -5,
              nomSousNature: '',
              detailSousNature: '',
              status: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            this.showToast(["Sauvegarde réussie !"], "success");
          }else{
            this.showToast(["Modification réussie !"], "success");
          }
        }else{
          this.showToast(["Une erreur est survenue lors de l\'enregistrement"], "error");
        }
      },
      error: (err: HttpErrorResponse) => {
        this.serverErrors.push(err.error?.message || 'Erreur inconnue.');
        this.showToast(this.serverErrors, "error");
      }
    });
  }

  close() {
    this.router.navigate(['sous-natures/']);
  }
}
