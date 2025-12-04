import { GlobalFonctionService } from './../../../core/services/global-fonction.service';
import { RegleCalculService } from './../../../core/services/regle-calcul-service';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Select2, Select2Data } from 'ng-select2-component';
import { RegleCalcul } from '../regle-calcul';
import { SousNature } from '../../sous-natures/sous-nature';
import { SousNaturesService } from '../../../core/services/sous-natures.service';
import { NaturesService } from '../../../core/services/natures.service';
import { Router } from '@angular/router';
import { TypeRegle } from '../regles';
import { debounceTime, finalize, forkJoin, Subject } from 'rxjs';
import { Nature } from '../../natures/nature';
import { TypeCategorie } from '../../categories';
import { RegleCalculLog } from '../regle-calcul-log';
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
interface DualList {
  key: string;                  // identifiant unique
  label: string;                // libellé affiché
  leftList: SousNature_Nature[];           // liste initiale à gauche
  rightList: SousNature_Nature[];          // liste initiale à droite (souvent vide)
  filteredLeftList: SousNature_Nature[];   // liste filtrée à gauche selon leftFilter
  filteredRightList: SousNature_Nature[];  // liste filtrée à droite selon rightFilter
  leftFilter: string;           // texte filtre gauche
  rightFilter: string;          // texte filtre droite
  selectedLeft: SousNature_Nature[];       // éléments sélectionnés à gauche
  selectedRight: SousNature_Nature[];      // éléments sélectionnés à droite
}



@Component({
  selector: 'app-regle-calculs-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CommonModule,
    MatAutocompleteModule,
    Select2,
    MatProgressSpinner],
  templateUrl: './regle-calculs-form.html',
  styleUrl: './regle-calculs-form.css'
})
export class RegleCalculsForm implements OnInit{
  @Input() regleCalcul!: RegleCalcul;

  // --- Données ---
  natures: Nature[] = [];
  sousNatures: SousNature[] = [];
  newSousNatures: SousNature[] = [];
  sousNature_natures: SousNature_Nature[] = [];

  // --- Autres propriétés ---
  isLoading = false;
  isAddForm = false;
  bSaveName = 'Enregistrer';
  serverErrors: string[] = [];
  creationSuccess = false;
  loading = false;
  data: Select2Data = [];
  selectedSousNatureId: string = "";
  typeRegleList: any;
  dualList: DualList[] = [];
  cummulAnnee: boolean = false;
  TauxVariable: boolean = false;

  typeCategorieList = Object.entries(TypeCategorie).map(([key, value]) => ({
    key,
    label: value
  }));

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

  constructor(
    private regleCalculService: RegleCalculService,
    private sousNatureService: SousNaturesService,
    private natureService: NaturesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private globalFonctionService: GlobalFonctionService,
  ) {}


  filterSubject = new Subject<{ cat: DualList, side: 'left' | 'right' }>();

  ngOnInit() {
    this.filterSubject.pipe(debounceTime(200)).subscribe(({ cat, side }) => {
      if(side === 'left') this.filterLeft(cat);
      else this.filterRight(cat);
    });
    this.typeRegleList = Object.entries(TypeRegle).map(([key, value]) => ({
      key,
      label: value
    }));

    // Déterminer si c’est un ajout ou une édition
    if (this.regleCalcul) {
      if (this.router.url.includes('/create') || this.regleCalcul.idRegleCalcul === -1) {
        this.isAddForm = true;
      }
      if(this.regleCalcul.detailRegleCalcul.includes("cummulAnnee")){
        this.cummulAnnee = true;
      }
      if(this.regleCalcul.detailRegleCalcul.includes("tauxVariable")){
        this.TauxVariable = true;
      }
    }
    this.bSaveName = this.isAddForm ? 'Enregistrer' : 'Modifier';
    this.loadData();
  }

  trackBySousNatureId(index: number, item: SousNature_Nature) {
    return item.sousNature.idSousNature;
  }

  groupPerCat(): void{
    this.typeCategorieList.forEach(e => {
      console.log("groupPerCat = ", this.sousNature_natures.filter(i => i.nature.typeNature === e.key));
      const left = this.sousNature_natures.filter(i => i.nature.typeNature === e.key);
      this.dualList.push({
        key: e.key,
        label: e.label,
        leftList: left,           // liste initiale à gauche
        rightList: [],          // liste initiale à droite (souvent vide)
        filteredLeftList: [...left],   // liste filtrée à gauche selon leftFilter
        filteredRightList: [],  // liste filtrée à droite selon rightFilter
        leftFilter: "",           // texte filtre gauche
        rightFilter: "",          // texte filtre droite
        selectedLeft: [],//this.sousNature_natures.filter(i => i.nature.typeNature === e.key),       // éléments sélectionnés à gauche
        selectedRight: [],//this.sousNature_natures.filter(i => i.nature.typeNature === e.key),      // éléments sélectionnés à droite
      });
    });
  }


  loadData(): void {
    this.isLoading = true;
    forkJoin({
      sousNatures: this.sousNatureService.listSousNatures(0, 1000),
      natures: this.natureService.listNatures(1, 1000)
    }).subscribe({
      next: ({ sousNatures, natures }) => {
        this.sousNatures = sousNatures.data.sous_natures;
        this.natures = natures.data.base_natures;
        this.newSousNatures = this.globalFonctionService.mergeUnique(this.newSousNatures, this.sousNatures, n => n.idSousNature);
        this.data = this.buildSelect2Data(this.newSousNatures, this.natures);
        this.buildSousNatureNature();

        this.groupPerCat();
        setTimeout(() => {
          if (this.regleCalcul?.idSousNature) {
            this.selectedSousNatureId = this.regleCalcul.idSousNature.toString();
          } else {
            this.selectedSousNatureId = ''; // ou une autre valeur par défaut
          }
          if(this.regleCalcul.sous_natures_entree.length > 0){
            this.setEditSelectToRight()
          }

          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => (this.isLoading = false)
    });
  }

  setEditSelectToRight() {
    // Exemple : remettre automatiquement à gauche dans la dual list
    this.dualList.forEach(cat => {
      const toMoveRight = cat.leftList.filter(
        item => this.regleCalcul.sous_natures_entree.some(selected => item.sousNature.idSousNature === selected.idSousNature)
      );
      if (toMoveRight.length > 0) {
        cat.rightList.push(...toMoveRight);
        cat.leftList = cat.leftList.filter(item => !toMoveRight.includes(item));
        this.filterLeft(cat);
        this.filterRight(cat);
      }
    });
  }

  removeSelect(): void{
    // Exemple : remettre automatiquement à gauche dans la dual list
    this.dualList.forEach(cat => {
      const toMoveLeft = cat.rightList.filter(
        item => item.sousNature.idSousNature.toString() === this.selectedSousNatureId
      );
      if (toMoveLeft.length > 0) {
        cat.leftList.push(...toMoveLeft);
        cat.rightList = cat.rightList.filter(
          item => item.sousNature.idSousNature.toString() !== this.selectedSousNatureId
        );
        this.filterLeft(cat);
        this.filterRight(cat);
      }
    });
  }


  buildSousNatureNature(): void {
    this.sousNature_natures = this.newSousNatures.map(sn => {
      const nature = this.natures.find(n => n.idNature === sn.idNature);
      return { sousNature: sn as SousNature, nature: nature ?? {} as Nature };
    });
  }
  private buildSelect2Data(sousNatures: SousNature[], natures: Nature[]): Select2Data {
    return natures.map(cat => {
      const options = sousNatures
        .filter(n => n.idNature === cat.idNature && n.idSousNature >= 0)
        .map(n => ({
          value: n.idSousNature.toString(),
          label: n.nomSousNature,
          id: n.idSousNature.toString(),
        }));

      return {
        label: cat.nomNature,
        data: { name: cat.idNature },
        options
      };
    }).filter(group => group.options.length > 0); // on garde seulement les groupes non vides
  }

  checkMax(event: any, min: number|null, max: number|null, model?: any) {
    const correctedValue = this.globalFonctionService.limitValue(event.target.value, min, max);
    event.target.value = correctedValue;

    if (model) {
      model.control.setValue(correctedValue, { emitEvent: false });
    }
  }

  close(){
    this.router.navigate(['regle-calculs/']);
  }

  onSubmit(){
    this.creationSuccess = false;
    this.serverErrors = [];
    this.loading = true;

    this.regleCalcul.idSousNature = +this.selectedSousNatureId;
    this.regleCalcul.detailRegleCalcul = " ";
    if(this.cummulAnnee){
      this.regleCalcul.detailRegleCalcul += "cummulAnnee\n";
    }
    if(this.TauxVariable){
      this.regleCalcul.detailRegleCalcul += "tauxVariable";
    }

    this.regleCalcul.sous_natures_entree = []; // on vide avant de remplir

    this.dualList.forEach(cat => {
      cat.rightList.forEach(item => {
        const log: RegleCalculLog = {
          idRegleCalcul_Log: 0, // ou une valeur par défaut si c’est à créer
          idSousNature: item.sousNature.idSousNature,
          idRegleCalcul: this.regleCalcul.idRegleCalcul,
          status: true, // selon ton besoin
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.regleCalcul.sous_natures_entree.push(log);
      });
    });


    const obs = this.isAddForm
      ? this.regleCalculService.createRegleCalcul(this.regleCalcul)
      : this.regleCalculService.updateRegleCalcul(this.regleCalcul);

    obs.pipe(finalize(() => (this.loading = false))).subscribe({
      next: (result) => {
        if(result){
          this.creationSuccess = true;
          if(this.isAddForm){
            console.log('Sauvegarde réussie', result);
            this.selectedSousNatureId = "";
            this.cummulAnnee = false;
            this.regleCalcul = {
              idRegleCalcul: -1,
              idSousNature: -1,
              typeCalcul: '',
              tauxRegleCalcul: 0,
              detailRegleCalcul: '',
              sous_natures_entree: [],
              status: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            this.emptyRight();
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

  emptyRight(){
    this.dualList.forEach(cat => {
      cat.leftList.push(...cat.rightList);
      cat.rightList = [];
      this.filterLeft(cat);
      this.filterRight(cat);
    });
  }

  moveSelectedToRight(cat: DualList) {
    if (!cat.selectedLeft || cat.selectedLeft.length === 0) {
      return;
    }

    const allowedToMove = cat.leftList.filter(item =>
      cat.selectedLeft.some(selected => item === selected) &&
      item.sousNature.idSousNature.toString() !== this.selectedSousNatureId
    );
    cat.rightList.push(...allowedToMove);
    cat.leftList = cat.leftList.filter(item => !allowedToMove.includes(item));
    cat.selectedLeft = [];
    this.filterLeft(cat);
    this.filterRight(cat);
  }


  moveSelectedToLeft(cat: DualList) {
    // Vérifie qu'on a bien des éléments sélectionnés à droite
    if (!cat.selectedRight || cat.selectedRight.length === 0) {
      return;
    }

    cat.leftList.push(...cat.rightList.filter(item =>
      cat.selectedRight.some(selected =>
        item === selected
      )
    ));
    cat.rightList = cat.rightList.filter(item =>
      !cat.selectedRight.some(selected =>
        item === selected
      )
    );
    cat.selectedRight = [];
    this.filterLeft(cat);
    this.filterRight(cat);
  }


  // Déplacement de tous les éléments gauche -> droite
  moveAllToRight(cat: DualList) {
    // On sélectionne seulement les éléments autorisés à passer à droite
    const allowedToMove = cat.leftList.filter(
      item => item.sousNature.idSousNature.toString() !== this.selectedSousNatureId
    );

    // Ajoute les éléments autorisés à la droite
    cat.rightList = cat.rightList.concat(allowedToMove);

    // Les retire de la gauche
    cat.leftList = cat.leftList.filter(
      item => item.sousNature.idSousNature.toString() === this.selectedSousNatureId
    );
    this.filterLeft(cat);
    this.filterRight(cat);
  }

  // Déplacement de tous les éléments droite -> gauche
  moveAllToLeft(cat: DualList) {
    cat.leftList = cat.leftList.concat(cat.rightList);
    cat.rightList = [];
    this.filterLeft(cat);
    this.filterRight(cat);
  }

  // Utilitaires pour vérifier si un item est sélectionné
  isSelectedLeft(item: SousNature_Nature, cat: DualList) {
    return cat.selectedLeft.includes(item);
  }

  isSelectedRight(item: SousNature_Nature, cat: DualList) {
    return cat.selectedRight.includes(item);
  }

  // Méthode appelée au changement de sélection gauche
  onLeftSelectChange(event: Event, cat: DualList) {
    const select = event.target as HTMLSelectElement;
    cat.selectedLeft = Array.from(select.selectedOptions).map(option => {
      return cat.filteredLeftList.find(
        item => item.sousNature.nomSousNature === option.text
      )!;
    });
    console.log("onLeftSelectChange += ", cat.selectedLeft)
  }

  // Méthode appelée au changement de sélection droite
  onRightSelectChange(event: Event, cat: DualList) {
    const select = event.target as HTMLSelectElement;
    cat.selectedRight = Array.from(select.selectedOptions).map(option => {
      return cat.filteredRightList.find(
        item => item.sousNature.nomSousNature === option.text
      )!;
    });
  }

  // Méthode de filtrage par catégorie (appelée via (ngModelChange))
  filterLeft(cat: DualList) {
    cat.filteredLeftList = cat.leftList.filter(item =>
      item.sousNature.nomSousNature.toLowerCase().includes(cat.leftFilter.toLowerCase())
    );
  }

  filterRight(cat: DualList) {
    cat.filteredRightList = cat.rightList.filter(item =>
      item.sousNature.nomSousNature.toLowerCase().includes(cat.rightFilter.toLowerCase())
    );
  }

}
