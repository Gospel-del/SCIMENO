import { finalize, forkJoin, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { create, all, exp } from 'mathjs';
import { Router } from '@angular/router';
import { Select2, Select2Data } from 'ng-select2-component';
import { HttpErrorResponse } from '@angular/common/http';
import { RegleCalcul } from '../../regle-calculs/regle-calcul';
import { Nature } from '../../natures/nature';
import { TypeCategorie } from '../../categories';
import { NaturesService } from '../../../core/services/natures.service';
import { RegleCalculService } from '../../../core/services/regle-calcul-service';
import { TypeIndicateur } from '../indicateur';
import { GlobalFonctionService } from '../../../core/services/global-fonction.service';
import { SousNaturesService } from '../../../core/services/sous-natures.service';
import { SousNature } from '../../sous-natures/sous-nature';
import { TypeRegle } from '../../regle-calculs/regles';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}

@Component({
  selector: 'app-formule-builder-form',
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
  templateUrl: './formule-builder-form.html',
  styleUrl: './formule-builder-form.css',
})
export class FormuleBuilderForm implements OnInit{
  @Input() regleCalcul!: RegleCalcul;

  isAddForm = false;
  bSaveName = 'Enregistrer';
  serverErrors: string[] = [];
  creationSuccess = false;

  natures: Nature[] = [];
  sousNatures: SousNature[] = [];
  newSousNatures: SousNature[] = [];
  selectedSousNatureId: string = "-5";
  isLoading: boolean = false;
  formuleSave = '';
  formule = '';
  nomFormule = '';
  description = '';
  result: number | null = null;
  valeurs: Record<string, number> = {};
  data: Select2Data = [];

  typeCategorieList = Object.entries(TypeCategorie).map(([key, value]) => ({
    key,
    label: value
  }));

  typeRegleList = Object.entries(TypeRegle).map(([key, value]) => ({
    key,
    label: value
  }));

  math = create(all);
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
    private natureService: NaturesService,
    private regleCalculService: RegleCalculService,
    private globalFonctionService: GlobalFonctionService,
    private sousNatureService: SousNaturesService,
    private cdr: ChangeDetectorRef,
    private router: Router) {

    this.math.import({
      SOMME: (...args: number[]) => args.reduce((a, b) => a + b, 0),
      MOYENNE: (...args: number[]) => args.reduce((a, b) => a + b, 0) / args.length,
      MIN: (...args: number[]) => Math.min(...args),
      MAX: (...args: number[]) => Math.max(...args),
    });
  }

  ngOnInit() {
    if (this.regleCalcul) {
      if (this.router.url.includes('/create') || this.regleCalcul.idRegleCalcul === -1) {
        this.isAddForm = true;
      }
    }
    this.bSaveName = this.isAddForm ? 'Enregistrer' : 'Modifier';
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      sousNatures: this.sousNatureService.listSousNatures(0, 1000),
      natures: this.natureService.listNatures(1, 1000),
      regleCalculs: this.regleCalculService.listRegleCalculs(1, 1000)
    }).subscribe({
      next: ({ sousNatures, natures, regleCalculs }) => {
        if(sousNatures && sousNatures.success && sousNatures.data && natures && natures.success && natures.data && regleCalculs && regleCalculs.success && regleCalculs.data){

          this.sousNatures = sousNatures.data.sous_natures;
          this.natures = natures.data.base_natures;
          regleCalculs = regleCalculs.data.regles_calcul;
          this.newSousNatures = this.globalFonctionService.mergeUnique(this.newSousNatures, this.sousNatures, n => n.idSousNature);
          this.data = this.buildSelect2Data(this.newSousNatures, this.natures, regleCalculs);
          //this.buildSousNatureNature();

          setTimeout(() => {
            this.cdr.detectChanges();

            if (this.regleCalcul?.idSousNature) {
              this.selectedSousNatureId = this.regleCalcul.idSousNature.toString();
            } else {
              this.selectedSousNatureId = ''; // ou une autre valeur par défaut
            }


            //this.selectedSousNatureId = "test";//this.regleCalcul.idSousNature.toString();

            if(this.regleCalcul?.detailRegleCalcul){
              this.formuleSave = this.regleCalcul.detailRegleCalcul;
              this.formule = this.remplacerIdsParNoms(this.regleCalcul.detailRegleCalcul, this.natures);
            }


            this.isLoading = false;
          });
        }
      },
      error: () => (this.isLoading = false)
    });
  }

  buildSelect2Data(sousNatures: SousNature[], natures: Nature[], regleCalculs: RegleCalcul[]): Select2Data {
    const idsRegles = regleCalculs.filter(e => e.idRegleCalcul !== this.regleCalcul.idRegleCalcul).map(r => r.idSousNature);
    return natures
    .filter(e => e.typeNature === "IND")
    .map(cat => {
      const options = sousNatures
        .filter(n => n.idNature === cat.idNature
          && !idsRegles.includes(n.idSousNature)
        )
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

  remplacerIdsParNoms(expr: string, natures: Nature[]): string {
    return expr.replace(/\bid(-?\d+)\b/g, (_, idStr) => {
      const idNum = Number(idStr);

      // Chercher la nature correspondant à l'id
      const nature = natures.find(n => n.idNature === idNum);

      if (nature) {
        return nature.nomNature;
      }

      // Si on ne trouve pas, on retourne un placeholder lisible
      return `INCONNU_${idNum}`;
    });
  }

  addElement(element: string) {
    this.formule += element;
    this.formuleSave += element;
  }


  addElementNature(element: Nature) {
    this.formule += element.nomNature;
    this.formuleSave += 'id' + element.idNature;
  }

  clearFormula() {
    this.formule = '';
    this.formuleSave = '';
    this.result = null;
  }

  trackByNatureId(index: number, item: Nature) {
    return item.idNature;
  }


  calculateLocal() {
    if (!this.formule) {
      alert('Veuillez d’abord créer une formule.');
      return;
    }

    // Copier la formule et remplacer les variables par leurs valeurs
    let expr = this.formuleSave;
    Object.entries(this.valeurs).forEach(([cle, val]) => {
      const regex = new RegExp(`\\b${cle}\\b`, 'g');
      expr = expr.replace(regex, val.toString());
    });

    try {
      const result = this.math.evaluate(expr);
      this.result = result;
      alert('result : ' + result);
    } catch (err: any) {
      alert('❌ Erreur dans la formule : ' + err.message);
    }

  }

  getVariablesFromFormula(): string[] {
    const regex = /\b\d+\b/g;
    const matches = this.formule.match(regex);
    return matches ? [...new Set(matches)] : [];
  }

  onSubmit(){
    if (!this.formuleSave) {
      alert('Veuillez d’abord créer une formule.');
      return;
    }

    const err = this.validateExpression(this.formuleSave);

    if (err) {
      //alert(`Formule invalide : ${err}`);
      this.showToast([`Formule invalide : ${err}`], "error");
      return;
    }


    this.regleCalcul.idSousNature = +this.selectedSousNatureId;
    //this.regleCalcul.typeCalcul = "IND";
    this.regleCalcul.tauxRegleCalcul = 100;
    this.regleCalcul.detailRegleCalcul = this.formuleSave;
    this.regleCalcul.sous_natures_entree = [];

    const obs = this.isAddForm
      ? this.regleCalculService.createRegleCalcul(this.regleCalcul)
      : this.regleCalculService.updateRegleCalcul(this.regleCalcul);

    obs.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: (result) => {
        if(result){
          this.creationSuccess = true;
          console.log('Sauvegarde réussie', result);
          if(this.isAddForm){
            this.selectedSousNatureId = "";
            this.clearFormula();
            this.loadData();
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

  close(){
    this.router.navigate(['indicateur-cle/']);
  }

  validateExpression(expr: string): string | null {
    let expression = expr.trim();

    // ⚠ 1. Vérifier parenthèses équilibrées
    let balance = 0;
    for (const c of expression) {
      if (c === '(') balance++;
      if (c === ')') balance--;
      if (balance < 0) return "Parenthèse fermante inattendue.";
    }
    if (balance !== 0) return "Les parenthèses ne sont pas équilibrées.";

    // ⚠ 2. Vérifier opérateurs consécutifs
    if (/[\+\-\*\/]{2,}/.test(expression.replace(/\s+/g, ''))) {
      return "Opérateurs consécutifs invalides.";
    }

    // ⚠ 3. Vérifier opérateur en fin d'expression
    if (/[\+\-\*\/]\s*$/.test(expression)) {
      return "Expression se termine par un opérateur.";
    }

    // ⚠ 4. Vérifier opérateur avant fermeture de parenthèse
    if (/[\+\-\*\/]\s*\)/.test(expression)) {
      return "Opérateur avant une parenthèse fermante.";
    }

    // ⚠ 5. Vérifier parenthèse ouvrante suivie d’un opérateur
    if (/\(\s*[\+\-\*\/]/.test(expression)) {
      return "Opérateur après une parenthèse ouvrante.";
    }

    // ⚠ 6. Vérifier identifiants valides
    /*
    if (/id(?!\d)/.test(expression)) {
      return "Identifiant 'id' invalide (ex: id doit être suivi d'un nombre).";
    }
      */
    if (/id(?!-?\d)/.test(expression)) {
      return "Identifiant 'id' invalide (ex: id doit être suivi d'un nombre).";
    }


    // Expression correcte
    return null;
  }


}
