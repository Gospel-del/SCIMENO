import { EmpruntService } from './../../../core/services/emprunt.service';
import { catchError, concatMap, filter, switchMap, tap, toArray } from 'rxjs/operators';
import { SousNature, SousNatureModel } from './../../sous-natures/sous-nature';
import { GlobalFonctionService } from './../../../core/services/global-fonction.service';
import { TABS, FicheImpression } from './../combo';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Projet, ProjetModel } from '../projet';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Client, ClientModel } from '../../clients/client';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';

import { NgSelectModule } from '@ng-select/ng-select';
import { EMPTY, finalize, forkJoin, from, map, Observable, of } from 'rxjs';
import { Select2Data, Select2 } from 'ng-select2-component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ModeAmortissements, TypeProjets, ModeExploitations } from '../combo';
import { TypeCategorie } from '../../categories';
import { ColumnConfig, ComboBoxProjet, TabConfig } from '../interface-projet';
import { PopusElts } from '../popus-elts/popus-elts';
import { RevenuExploitationModel } from '../revenu-exploitation';
import { ProjetOperation, ProjetOperationModel } from '../projet-operation';
import { Nature, NatureModel } from '../../natures/nature';
import { Emprunt, EmpruntModel } from '../../emprunts/emprunt';
import { EmpruntsForm } from '../../emprunts/emprunts-form/emprunts-form';
import { Impressions } from '../../impressions/impressions';
import { ProjetsServices } from '../../../core/services/projets.services';
import { HttpErrorResponse } from '@angular/common/http';
import { OperationPeriod } from '../operation-periode';
import { Scenario, ScenarioSousNatureModel, ScenarioSousNatureResponse } from '../../../models/scenarios';
import { ScenariosService } from '../../../core/services/scenarios';
import { ScenarioSousNatureService } from '../../../core/services/scenario-sous-nature.service';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';
import { OperationPeriodService } from '../../../core/services/operation-period.service';
import { ProjetOperationService } from '../../../core/services/projet-operation.service';
import { NaturesService } from '../../../core/services/natures.service';
import { SousNaturesService } from '../../../core/services/sous-natures.service';


interface Element {
  data : SousNature_Nature;
  selected : boolean;
}

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
  selector: 'app-projets-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule, NgSelectModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule],
  templateUrl: './projets-form.html',
  styleUrl: './projets-form.css'
})
export class ProjetsForm implements OnInit{
  @Input() projet!: Projet;
  @Input() isDuplicate: boolean = false;
  loadingMessage: string = "Chargement ..."
  isLoading = false;
  bSaveName: String = "Enregistrer";
  clients: Client[] = [];
  scenarios: Scenario[] = []
  selectedScenarioId: number | null = -1;
  emptyClient!: Client;
  selectedClient!: Client;
  //dualList: DualList[] = [];
  natures: Nature[] = [];
  sousNatures: SousNature[] = [];

  // État du bouton et du mode retry
  hasUnstoredItems = false;
  isRetryMode = false;

  // Stockage des éléments échoués
  failedOperationPeriods: OperationPeriod[] = [];
  failedProjetOperations: ProjetOperation[] = [];
  failedEmprunts: Emprunt[] = [];


  isAddForm = false;
  serverErrors: string[] = [];
  creationSuccess = false;

  isApplyScenario: boolean = true;

  public modeAmortissements: ComboBoxProjet[] = ModeAmortissements;
  public typeProjets: ComboBoxProjet[] = TypeProjets;
  public modeExploitations: ComboBoxProjet[] = ModeExploitations;
  public tabs: TabConfig[] = TABS;

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

  @ViewChild('dropdown') dropdownRef!: ElementRef;
  isOpen = false;
  dropUp = false;

  typeCategorieList = Object.entries(TypeCategorie).map(([key, value]) => ({
    key,
    label: value
  })).filter(e => e.key !== 'IND');

  FicheImpressionList = Object.entries(FicheImpression).map(([key, value]) => ({
    key,
    label: value
  }));


  ModeAmortissementMap: Record<number, string> = Object.fromEntries(
    ModeAmortissements.map(m => [m.id, m.name])
  );

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;

    // Détection automatique si l’espace est limité en bas
    setTimeout(() => {
      const rect = this.dropdownRef.nativeElement.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      this.dropUp = spaceBelow < 200; // monte si espace insuffisant
    });
  }

  printRapport(modulName: string): void {
    this.isOpen = false;
    const popusRef = this.popus.open(Impressions, {
      width: '1800px',
      data: {
        title: 'Selectionnes les differents éléments',
        modulName: modulName,
        tabs: this.tabs,
        dureeProjet: this.projet.dureeProjet,
        infoProjet: this.projet,
        cancel: 'Annuler',
        valid: 'Valider'
      }
    });
  }

  // Fermer quand on clique à l’extérieur
  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    if (this.isOpen && this.dropdownRef && !this.dropdownRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  constructor(private clientService: ClientService,
    private natureService: NaturesService,
    private sousNatureService: SousNaturesService,
    private scenariosService: ScenariosService,
    private scenarioSousNatureService: ScenarioSousNatureService,
    private projetsServices: ProjetsServices,
    private globalFonctionService: GlobalFonctionService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private empruntService: EmpruntService,
    private operationPeriodService: OperationPeriodService,
    private projetOperationService: ProjetOperationService,
    private popus: MatDialog) {}

  ngOnInit(): void {
    this.clearTabs();
    this.bSaveName = "Enregistrer";
    this.isLoading = true;
    this.selectedClient = new ClientModel({
      idClient: -1,
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      statut: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    this.loadData();
  }

  clearTabs(){
    this.tabs.forEach(tab => {
      tab.dataList = [];
      if (tab.subDataList) {
        tab.subDataList.forEach(sub => sub.dataList = []);
      }
    });
  }

  loadProjet(){
    const id = this.projet?.idClient;
    // Si pas d'id → remet la sélection à vide
    if (typeof id !== 'number' || id <= 0) {
      this.selectedClient = {} as Client;
      return;
    }

    // Recherche dans la liste
    const client = this.clients.find(c => c.idClient === id);
    if (!client) {
      console.warn("Aucun client trouvé pour idClient =", id);
    }
    this.selectedClient = client ?? {} as Client;
    this.loadSousNature_Nature();
  }

  loadSousNature_Nature(): void {
    //this.isLoading = true;
    forkJoin({
      sousNatures: this.sousNatureService.listSousNatures(0, 1000),
      natures: this.natureService.listNatures(1, 1000)
    }).subscribe({
      next: ({ sousNatures, natures }) => {
        if (sousNatures && sousNatures.success && sousNatures.data && natures && natures.success && natures.data) {
          this.natures = natures.data.base_natures.map((s: Nature) => NatureModel.fromResponse(s));
          this.sousNatures = sousNatures.data.sous_natures.map((s: SousNature) => SousNatureModel.fromResponse(s));
          this.loadProjetTabs(this.projet.idProjet);
        } else {
          this.natures = [];
          this.sousNatures = [];
          this.isLoading = false;
        }
      },
      error:() =>{
        this.isLoading = false;
      }
    });
  }

  loadProjetTabs(idProjet: number) {
    if (!idProjet || idProjet <= 0) return;

    this.tabs
    .forEach(tab => {
      tab.isLoading = true;
    });

    //this.isLoading = true;

    forkJoin({
      operationPeriods: this.operationPeriodService.getByProjet(idProjet),
      projetOperations: this.projetOperationService.getByProjet(idProjet),
      emprunts: this.empruntService.getByProjet(idProjet)
    }).subscribe({
      next: ({ operationPeriods, projetOperations, emprunts }) => {

        // Réinitialiser les tabs
        //this.tabs.forEach(tab => tab.dataList = []);

        // Remplir les tabs selon type
        this.tabs.forEach(tab => {
          if (tab.key === 'REV' || tab.key === 'DEP') {
            const tabOps = projetOperations?.data?.operations.filter(po => po.typeOperation === tab.key) ?? [];

            tab.dataList = tabOps.map((po, idx) => {
              const sousNature = this.sousNatures.find(e => e.idSousNature === po.idSousNature);
              const nature = this.natures.find(e => e.idNature === sousNature?.idNature);
              return {
                id: idx++,
                nom: sousNature?.nomSousNature ?? '',
                sousNature_Nature: {sousNature: sousNature ?? {} as SousNature, nature: nature ?? {} as Nature},
                data: new ProjetOperationModel({
                  id: po.id,
                  idProjet: po.idProjet,
                  idSousNature: po.idSousNature,
                  typeOperation: po.typeOperation,
                  surface: po?.surface ?? 0,
                  loyer: po?.loyer ?? 0,
                  montant: po?.montant ?? 0,
                  created_at: po.created_at,
                  updated_at: po.updated_at
                } as ProjetOperation),
                surfaceOpt: 0,
                loyerOpt: 0,
                montantOpt: 0,

                surfaceInit: 0,
                loyerInit: 0,
                montantInit: 0,
              };
            });

            const tabOps_ = operationPeriods?.data?.operations_periode.filter(po => po.typeOperation === tab.key) ?? [];
            const duree = this.projet.dureeProjet;
            if(tab.subDataList){
              const sub = tab.subDataList.at(0);

              for (let i = 0; i < duree; i++) {

                if (sub && sub.dataList[i]) {
                  const value = tabOps_.find(
                    e => e.annee === i && e.typeOperation === tab.key
                  )?.montant ?? 0;

                  sub.dataList[i].value = Number(value);
                  sub.dataList[i].nom = `N + ${i}`;
                  sub.dataList[i].id = i + 1;
                }
                if (sub && sub.dataList[i]) {
                  sub.dataList = [...sub.dataList];
                  this.cdr.detectChanges();
                }
              }
            }
          } else if (['INV', 'FDR', 'FIN', 'TRE'].includes(tab.key)) {

            const tabOps = operationPeriods?.data?.operations_periode.filter(po => po.typeOperation === tab.key) ?? [];
            console.log("tabOps = ", tab.key, " - ", tabOps)

            // Grouper par idOperation
            const groupedOps = new Map<number, typeof tabOps[0]>();
            tabOps.forEach(po => {
              if (!groupedOps.has(po.idOperation)) {
                groupedOps.set(po.idOperation, po);
              }
            });

            tab.dataList = Array.from(groupedOps.values()).map((po, idx) => {
              const sousNature = this.sousNatures.find(e => e.idSousNature === po.idOperation);
              const nature = this.natures.find(e => e.idNature === sousNature?.idNature);

              // Construire le tableau des montants par année
              const montant = Array(this.projet.dureeProjet).fill(0);
              tabOps
                .filter(m => m.idOperation === po.idOperation)
                .forEach(m => {
                  if (m.annee != null && m.annee >= 0 && m.annee < montant.length) {
                    montant[m.annee] = m.montant ?? 0;
                  }
                });

              return {
                id: idx + 1,
                nom: sousNature?.nomSousNature ?? '',
                sousNature_Nature: {
                  sousNature: sousNature ?? {} as SousNature,
                  nature: nature ?? {} as Nature
                },
                data: { idSousNature: sousNature?.idSousNature ?? -5 },
                montant: montant,
                montantOpt: Array(this.projet.dureeProjet).fill(0),
                montantInit: Array(this.projet.dureeProjet).fill(0),
              };
            });

          } else if (tab.key === 'EMP') {

            const tabEmprunts = emprunts?.data;
            if(tabEmprunts){
              tab.dataList = tabEmprunts?.map((emp, idx) => ({
                id: idx + 1,
                data: emp as Emprunt,
                nameModeAmorti: this.ModeAmortissementMap[Number(emp.modeAmortissement)]
              }));
            }

          } else if (tab.key === 'DOC') {
            /*
            const tabDocs = operationPeriods.filter((op: { typeOperation: string; }) => op.typeOperation === 'DOC');
            tab.dataList = tabDocs.map((doc: any, idx: number) => ({
              id: idx + 1,
              nom: `Doc ${idx + 1}`,
              data: doc
            }));
            */
          }
        });

        this.onDureeProjetChange();
        this.refreshTabs();
        //this.isLoading = false;

        if(this.isDuplicate){
          this.projet.idProjet = -1;
          this.isAddForm = true;
          this.bSaveName = "Enregistrer"
        }

        this.tabs
          .forEach(tab => {
            tab.isLoading = false;
          });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Erreur chargement tabs projet', err);
        this.isLoading = false;
      }
    });
  }

  trackRow(index: number, item: any) {
    return item.id ?? index;
  }



  applyRestaureScenario(idScenario: number, isView: boolean=true){
    this.tabs
    .filter(tab => tab.key !== 'EMP' && tab.key !== 'DOC')
    .forEach(tab => {
      tab.isLoading = true;
    });

    console.log("applyRestaureScenario = ", isView, ' - ', this.isApplyScenario)

    if(this.isApplyScenario){
      this.viewScenarioOpt(idScenario, isView);
    }else{
      this.restaureScenario()
    }

    this.tabs
    .filter(tab => tab.key !== 'EMP' && tab.key !== 'DOC')
    .forEach(tab => {
      tab.isLoading = false;
    });
  }

  close(){
    this.router.navigate(['projets/']);
  }

  onSubmit() {
    console.log("etape = onSubmit");
    this.serverErrors = [];
    const idClient = this.selectedClient?.idClient;

    if (typeof idClient !== 'number' || idClient <= 0) {
      alert("Veuillez sélectionner un client !!!");
      return;
    }
    this.isLoading = true;

    this.projet.idClient = idClient;

    if (this.isRetryMode) {
      this.retryFailedElements();
    } else {
      this.createProjetAndElements();
    }
  }

  private buildAllElements(idProjet: number, duree: number) {
    const operationPeriods: OperationPeriod[] = [];
    const projetOperations: ProjetOperation[] = [];
    const emprunts: Emprunt[] = [];

    this.tabs.forEach(tab => {

      // REV / DEP
      if (tab.key === 'REV' || tab.key === 'DEP') {

        for (let i = 0; i < duree; i++) {
          if((tab.subDataList?.at(0)?.dataList.at(i)?.value ?? 0) != 0){
            operationPeriods.push({
              idProjet,
              idOperation: 0,
              typeOperation: tab.key,
              annee: i,
              montant: tab.subDataList?.at(0)?.dataList.at(i)?.value ?? 0
            } as OperationPeriod);
          }
        }

        for (let i = 0; i < tab.dataList.length; i++) {
          projetOperations.push({
            id: tab.dataList[i]?.data?.id ?? 0,
            idProjet,
            idSousNature: tab.dataList[i]?.sousNature_Nature.sousNature?.idSousNature ?? -5,
            typeOperation: tab.key,
            surface: tab.dataList[i]?.data?.surface ?? 0,
            loyer: tab.dataList[i]?.data?.loyer ?? 0,
            montant: tab.dataList[i]?.data?.montant ?? 0,
          } as ProjetOperation);
        }

      } else if (['INV', 'FDR', 'FIN', 'TRE'].includes(tab.key)) {

        for (let i = 0; i < tab.dataList.length; i++) {
          for (let j = 0; j < duree; j++) {
            if((tab.dataList[i]?.montant[j] ?? 0) != 0){
              operationPeriods.push({
                idProjet,
                idOperation: tab.dataList[i]?.sousNature_Nature.sousNature?.idSousNature ?? -5,
                typeOperation: tab.key,
                annee: j,
                montant: tab.dataList[i]?.montant[j] ?? 0,
              } as OperationPeriod);
            }
          }
        }

      } else if (tab.key === 'EMP') {

        for (let i = 0; i < tab.dataList.length; i++) {
          emprunts.push({
            idEmprunt: tab.dataList[i].data?.idEmprunt ?? 0,
            idProjet,
            organismePreneur: tab.dataList[i].data?.organismePreneur ?? '',
            montantEmprunte: tab.dataList[i].data?.montantEmprunte ?? 0,
            dureeCredit: tab.dataList[i].data?.dureeCredit ?? 0,
            tauxInteretAnnuel: tab.dataList[i].data?.tauxInteretAnnuel ?? 0,
            dateDebutPret: tab.dataList[i].data?.dateDebutPret ?? '',
            datePremiereEcheance: tab.dataList[i].data?.datePremiereEcheance ?? '',
            modeAmortissement: tab.dataList[i].data?.modeAmortissement ?? ''
          } as Emprunt);
        }

      } else if (tab.key === 'DOC') {

        for (let i = 0; i < tab.dataList.length; i++) {
          operationPeriods.push({
            idProjet,
            idOperation: tab.dataList[i]?.sousNature?.idSousNature ?? -5,
            typeOperation: tab.key,
            annee: 0,
            montant: 0
          } as OperationPeriod);
        }
      }

    });

    return { operationPeriods, projetOperations, emprunts };
  }


  private createProjetAndElements() {
    this.isLoading = true;

    this.projet.idClient = this.selectedClient.idClient;

    const duree = this.projet.dureeProjet || 1;

    // Enregistrer le projet
    const obs = this.isAddForm
        ? this.projetsServices.createProjet(this.projet)
        : this.projetsServices.updateProjet(this.projet);

    obs.pipe(finalize(() => console.log("ok"))).subscribe({
      next: response => {
        if (!response) {
          this.serverErrors.push('Erreur lors de la création du projet.');
          return;
        }
        const idProjet = response.idProjet;

        // Construire les tableaux (refactorés plus bas)
        const { operationPeriods, projetOperations, emprunts } =
          this.buildAllElements(idProjet, duree);

          this.createOrUpdateAllElements(operationPeriods, projetOperations, emprunts);
      },
      error: err => {
        this.serverErrors.push(err.error?.message || 'Erreur inconnue.');
        this.isLoading = false;
        this.showToast(this.serverErrors, "error");
      }
    });
  }

  private createWithRetrySingle<T, R>(
    elements: T[],
    createFn: (elem: T) => Observable<R | null>,
    label: string
  ): Observable<{ success: R[]; failed: T[] }> {

    if (!elements.length) return of({ success: [], failed: [] });

    const success: R[] = [];
    const failed: T[] = [];

    return from(elements).pipe(
      concatMap(elem =>
        createFn(elem).pipe(
          tap(res => res ? success.push(res) : failed.push(elem)),
          catchError(err => {
            console.error(`Erreur création ${label}:`, err);
            failed.push(elem);
            return of(null);
          })
        )
      ),
      toArray(),
      map(() => ({ success, failed }))
    );
  }

  private createOrUpdateAllElements(
    operationPeriods: OperationPeriod[],
    projetOperations: ProjetOperation[],
    emprunts: Emprunt[]
  ) {

    this.isLoading = true;
    forkJoin({
      op: this.createWithRetrySingle(
        operationPeriods,
        this.isAddForm
          ? this.operationPeriodService.createOperationPeriod.bind(this.operationPeriodService)
          : this.operationPeriodService.updateOperationPeriod.bind(this.operationPeriodService),
        'OperationPeriods'
      ),
      po: this.createWithRetrySingle(
        projetOperations,
        this.isAddForm
          ? this.projetOperationService.createProjetOperation.bind(this.projetOperationService)
          : this.projetOperationService.updateProjetOperation.bind(this.projetOperationService),
        'ProjetOperations'
      ),
      emp: this.createWithRetrySingle(
        emprunts,
        this.isAddForm
          ? this.empruntService.createEmprunt.bind(this.empruntService)
          : this.empruntService.updateEmprunt.bind(this.empruntService),
        'Emprunts'
      )
    }).subscribe(({ op, po, emp }) => {

      // Stocker les éléments échoués pour retry
      this.failedOperationPeriods = op.failed;
      this.failedProjetOperations = po.failed;
      this.failedEmprunts = emp.failed;

      // Vérifier s'il reste des erreurs
      this.isRetryMode = op.failed.length > 0 || po.failed.length > 0 || emp.failed.length > 0;

      if (this.isRetryMode) {
        this.showToast(["Certains éléments n'ont pas pu être enregistrés.\nVeuillez réessayer."], "error");
      } else {
        this.showToast(["Enregistrement réussi"], "success");
      }

      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }


  private retryFailedElements() {
    console.log("etape = retryFailedElements");

    // Création des observables uniquement s'il y a des éléments à réessayer
    const retryOp$ = this.failedOperationPeriods.length
      ? this.createWithRetrySingle(
          this.failedOperationPeriods,
          this.isAddForm
            ? this.operationPeriodService.createOperationPeriod.bind(this.operationPeriodService)
            : this.operationPeriodService.updateOperationPeriod.bind(this.operationPeriodService),
          'OperationPeriods Retry'
        )
      : of(null);

    const retryPo$ = this.failedProjetOperations.length
      ? this.createWithRetrySingle(
          this.failedProjetOperations,
          this.isAddForm
            ? this.projetOperationService.createProjetOperation.bind(this.projetOperationService)
            : this.projetOperationService.updateProjetOperation.bind(this.projetOperationService),
          'ProjetOperations Retry'
        )
      : of(null);

    const retryEmp$ = this.failedEmprunts.length
      ? this.createWithRetrySingle(
          this.failedEmprunts,
          this.isAddForm
            ? this.empruntService.createEmprunt.bind(this.empruntService)
            : this.empruntService.updateEmprunt.bind(this.empruntService),
          'Emprunts Retry'
        )
      : of(null);

    forkJoin({
      op: retryOp$,
      po: retryPo$,
      emp: retryEmp$
    }).subscribe({
      next: ({ op, po, emp }) => {

        // Mise à jour seulement si un retry a été fait
        if (op) this.failedOperationPeriods = op.failed;
        if (po) this.failedProjetOperations = po.failed;
        if (emp) this.failedEmprunts = emp.failed;

        // Check si encore des erreurs
        this.isRetryMode =
          this.failedOperationPeriods.length > 0 ||
          this.failedProjetOperations.length > 0 ||
          this.failedEmprunts.length > 0;

        if(this.isRetryMode){
          this.showToast(["Certains éléments n'ont pas pu être enregistrés.\nVeuillez réessayer"], "error");
        }else{
          this.showToast(["Enregistrement reussi"], "success");
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.showToast(["Une erreur est survenue"], "error");
      }
    });
  }

  loadData(): void {
    //this.isLoading = true;
    forkJoin({
      clients: this.clientService.listClients(1, 1000),
      scenarios: this.scenariosService.listScenarios(0, 1000)
    }).subscribe({
      next: ({ clients, scenarios }) => {
        if(clients && clients.success && clients.data && scenarios && scenarios.success && scenarios.data){
          const newClients = this.globalFonctionService.mergeUnique(clients.data.clients, this.clients, n => n.idClient);
          this.clients.push(...newClients);

          const newScenearios = this.globalFonctionService.mergeUnique(scenarios.data.scenarios, this.scenarios, n => n.id_scenario);
          this.scenarios.push(...newScenearios);
        }

        setTimeout(() => {

          this.refreshTabs();
          this.onDureeProjetChange();

          this.isAddForm = false;
          this.bSaveName = "Enregistrer"
          if(this.projet){
            if((this.router.url.includes('/create')) || (this.projet.idProjet == -1)){
              this.isLoading = false;
              this.isAddForm = true;
            }else{
              console.log("loadProjet = true")
              this.loadProjet();
            }
          }
          if(! this.isAddForm){
            this.bSaveName = "Modifier"
          }
          //this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => (this.isLoading = false)
    });
  }

  viewScenarioOpt(idScenario: number, isView: boolean=true): void{
    console.log("applyRestaureScenario = viewScenarioOpt - ", isView)
    const scenario = this.scenarios.find(e => e.id_scenario == idScenario);
    let taux = 1;
    if(scenario){
      taux = scenario.coef_majoration || 1;
    }
    this.scenarioSousNatureService.listScenarioSousNatures(
        0,
        1000,
        idScenario || undefined
      ).subscribe(
      (response: any) => {
        if (response && response.success && response.data) {
          const sn = response.data.scenario_sous_natures.map((ssn: ScenarioSousNatureResponse) => ScenarioSousNatureModel.fromResponse(ssn))
          const idsRg = new Set(sn.map((b: ScenarioSousNatureResponse) => b.id_sous_nature));

          this.tabs.forEach(tab => {
            const elts = tab.dataList.filter(e => {
              const id = e?.sousNature_Nature?.sousNature?.idSousNature;
              return id !== undefined && idsRg.has(id) });

            elts.forEach(e => {
              if(isView){
                if(e.data.surface){
                  e.surfaceOpt = (e.data.surface || 0)*taux;
                };
                if(e.data.loyer){
                  e.loyerOpt = (e.data.loyer || 0)*taux;
                };
                if(e.data.montant){
                  e.montantOpt = (e.data.montant || 0)*taux;
                };
              }else{
                if(e.data.surface){
                  e.surfaceInit = e.data.surface || 0;
                  e.data.surface = (e.surfaceInit || 0)*taux;
                  e.surfaceOpt = 0;
                };
                if(e.data.loyer){
                  e.loyerInit = e.data.loyer || 0;
                  e.data.loyer = (e.loyerInit || 0)*taux;
                  e.loyerOpt = 0;
                };
                if(e.data.montant){
                  e.montantInit = e.data.montant || 0;
                  e.data.montant = (e.montantInit || 0)*taux;
                  e.montantOpt = 0;
                };
              }
            })
          })
          if(!isView){
            this.isApplyScenario = false;
          }
        }
      },
      (error: any) => {
        this.isLoading = false;
      }
    );
  }

  restaureScenario(): void{
    console.log("applyRestaureScenario = rstaureScenario")
    this.tabs
    .filter(tab => tab.key !== 'EMP' && tab.key !== 'DOC')
    .forEach(tab => {
      tab.dataList.forEach(e => {
        // Restaurer surface
        if (e.surfaceInit !== undefined && e.surfaceInit !== 0) {
          e.data.surface = e.surfaceInit;
          e.surfaceOpt = 0;
          e.surfaceInit = 0;
        }

        // Restaurer loyer
        if (e.loyerInit !== undefined && e.loyerInit !== 0) {
          e.data.loyer = e.loyerInit;
          e.loyerOpt = 0;
          e.loyerInit = 0;
        }

        // Restaurer montant
        if (e.montantInit !== undefined && e.montantInit !== 0) {
          e.data.montant = e.montantInit;
          e.montantOpt = 0;
          e.montantInit = 0;
        }
      });
    });
    this.isApplyScenario = true;
  }

  getValue(obj: any, path: string, isModel = false) {
    if (!path) return '';
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return '';
    }
    return isModel ? value : value;
  }

  getNestedValue(obj: any, path: string) {
    return path.split(/[\.\[\]]/).filter(Boolean).reduce((o, key) => (o ? o[key] : undefined), obj);
  }

  setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split(/[\.\[\]]/).filter(Boolean);
    const lastKey = keys.pop()!;
    const target = keys.reduce((o, key) => {
      if (!o[key]) o[key] = {};
      return o[key];
    }, obj);
    target[lastKey] = value;
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.listClients(1, 100).subscribe(
      (response: any) => {
        console.log('Received data:', response);
        this.clients = response.data.clients;
        this.isLoading = false;
        this.clients.forEach(client => {
          (client as any).fullName = this.getNomPrenomClient(client);
        });
      },
      (error: any) => {
        this.isLoading = false;
      }
    );
  }

  openPopupGeneric(modulName: string) {
    switch (modulName) {
      case 'EMP':
        this.addEmprunt();
        break;
      default:
        const popusRef = this.popus.open(PopusElts, {
          width: '1800px',
          data: {
            title: 'Sélectionnez les différents éléments',
            modulName,
            cancel: 'Annuler',
            valid: 'Valider'
          }
        });

        popusRef.afterClosed().subscribe((result: Element[]) => {
          if (!result || result.length === 0) return;

          const tab = this.tabs.find(t => t.key === modulName);
          if (!tab) return;

          tab.isLoading = true;

          const newData = result.filter(e =>
            !tab.dataList.some(d => d.data.idSousNature === e.data.sousNature.idSousNature)
          );

          const maxId = tab.dataList.length > 0 ? Math.max(...tab.dataList.map(r => r.id)) : 0;
          let nextId = maxId + 1;
          if(modulName == "REV" || modulName == "DEP"){
            tab.dataList.push(
              ...newData.map(d =>({
                id: nextId++,
                nom: d.data.sousNature.nomSousNature,
                sousNature_Nature: d.data,
                data: new ProjetOperationModel({
                  id: 0,
                  idProjet: -1,
                  idSousNature: d.data.sousNature.idSousNature,
                  typeOperation: modulName,
                  surface: 0,
                  loyer: 0,
                  montant: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                } as ProjetOperation),
                surfaceOpt: 0,
                loyerOpt: 0,
                montantOpt: 0,

                surfaceInit: 0,
                loyerInit: 0,
                montantInit: 0,
              }))
            )
          }else{
            tab.dataList.push(
              ...newData.map(d => ({
                id: nextId++,
                nom: d.data.sousNature.nomSousNature,
                sousNature_Nature: d.data,
                data: {
                  idSousNature: d.data.sousNature.idSousNature,
                },
                montant: Array(this.projet.dureeProjet).fill(0),
                montantOpt: Array(this.projet.dureeProjet).fill(0),
                montantInit: Array(this.projet.dureeProjet).fill(0),
              }))
            );
          }

          tab.isLoading = false;
        });
        break;
    }

  }

  onSelectClient(){
    //console.log("this.selectedClient", this.selectedClient)
  }

  getNomPrenomClient(client: Client){
    return client.prenom+' '+client.nom+' ('+client.telephone+')';
  }

  checkMax(event: any, min: number|null, max: number|null, model?: any) {
    const correctedValue = this.globalFonctionService.limitValue(event.target.value, min, max);
    event.target.value = correctedValue;

    if (model) {
      model.control.setValue(correctedValue, { emitEvent: false });
    }
  }

  checkMaxTable(event: any, min: number|null, max: number|null, row: any, modelKey: string) {
    const correctedValue = this.globalFonctionService.limitValue(event.target.value, min, max);
    event.target.value = correctedValue;

    // Mettre à jour le modèle lié au tableau
    row[modelKey] = correctedValue;
  }

  addEmprunt(){
    const emptyEmprunt = new EmpruntModel({
      idEmprunt: 0,
      idProjet: -5,
      organismePreneur: '',
      montantEmprunte: 0,
      dureeCredit: 1,
      tauxInteretAnnuel: 0,
      dateDebutPret: new Date().toISOString().substring(0, 10),
      datePremiereEcheance: new Date().toISOString().substring(0, 10),
      modeAmortissement: '',
      statut: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const popusRef = this.popus.open(EmpruntsForm, {
      width: '1800px',
      data: {
        title: 'Enregistrement',
        emprunt: emptyEmprunt,
        cancel: 'Annuler',
        valid: 'Valider'
      }
    });
    popusRef.afterClosed().subscribe(result => {
      if (result.isValid === true) {
        this.tabs.forEach(elt => {
          if(elt.key === "EMP"){
            elt.isLoading = true;
            const maxId = elt.dataList.length > 0
              ? Math.max(...elt.dataList.map(r => r.id))
              : 0;
            let nextId = maxId + 1;
            elt.dataList.push({
              id: nextId++,
              data: new EmpruntModel(result.data as Emprunt),
              nameModeAmorti: this.ModeAmortissementMap[Number(result.data.modeAmortissement)],
            });
            elt.isLoading = false;
          }
        });
      }
    });
  }

  refreshTabs(): void{
    const duree = this.projet.dureeProjet || 1;
    this.tabs.forEach(tab => {
      if (tab.key === 'INV' || tab.key === 'FDR' || tab.key === 'FIN' || tab.key === 'TRE') { // duree = 5
        const nSubs: ColumnConfig[] = [];
        for (let i = 1; i <= duree; i++) {
          nSubs.push({
            header: `N + ${i - 1}`,
            type: 'number',
            model: `montant[${i - 1}]`, // tableau de valeurs dans l'objet elt
            optModel: `montantOpt[${i - 1}]` // pour la valeur optimisée
          });
        }

        // On suppose qu'il y a une colonne principale "Valeurs"
        tab.columns = [
          { header: 'Nom', type: 'text', model: 'nom' },
          { header: 'Valeur avant optimisation / Valeur après optimisation', type: 'text', subColumns: nSubs }
        ];
      }
    });
  }

  onDureeProjetChange(): void{
    const n = this.projet.dureeProjet || 0;
    if(n > 0){
      this.tabs.forEach(elt => {
        console.log("onDureeProjetChange = ", elt.key);

        if(elt.subDataList){
          console.log("onDureeProjetChange += ", elt.subDataList)
          if (elt.subDataList[0].dataList.length > n && elt.subDataList[0].dataList) {
            elt.subDataList[0].dataList = elt.subDataList[0].dataList.slice(0, n);
          }else{
            for (let i = (elt.subDataList.at(0)?.dataList.length || 0) + 1; i <= n; i++) {
              elt.subDataList.at(0)?.dataList.push({
                id: i,
                nom: `N + ${i - 1}`,
                value: 0,
              });
            }
          }
        }

        if(elt.columns){
          elt.dataList.forEach(item => {
            // Ajuste la taille du tableau 'montant'
            if(item.montant){
              if (item.montant.length > n) {
                item.montant = item.montant.slice(0, n);
              } else {
                for (let i = item.montant.length; i < n; i++) {
                  item.montant.push(0);
                }
              }
            }

            // Ajuste la taille du tableau 'montantOpt'
            if(item.montant){
              if (item.montantOpt.length > n) {
                item.montantOpt = item.montantOpt.slice(0, n);
              } else {
                for (let i = item.montantOpt.length; i < n; i++) {
                  item.montantOpt.push(0);
                }
              }
            }

            // Ajuste la taille du tableau 'montantInit'
            if(item.montant){
              if (item.montantInit.length > n) {
                item.montantInit = item.montantInit.slice(0, n);
              } else {
                for (let i = item.montantInit.length; i < n; i++) {
                  item.montantInit.push(0);
                }
              }
            }
          });
        }

      });
      this.refreshTabs();
    }
  }

  supprimerElt(modulName: string, element: any){
    this.isLoading = false;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        title: 'Confirmation',
        message: 'Voulez-vous vraiment supprimer cet élément ?',
        cancel: 'Non',
        valid: 'Oui'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // supprimer le nature ici
        const tab = this.tabs.find(t => t.key === modulName);
        if (tab){
          tab.isLoading = true;
          tab.dataList = tab.dataList.filter(item => item !== element);
          tab.isLoading = false;
        }
      }
    });
  }

  updateElt(modulName: string, element: any){
    if(modulName === 'EMP'){
      const empruntClone = structuredClone(element.data);
      const popusRef = this.popus.open(EmpruntsForm, {
        width: '1800px',
        data: {
          title: 'Enregistrement',
          emprunt: empruntClone,
          cancel: 'Annuler',
          valid: 'Valider'
        }
      });
      popusRef.afterClosed().subscribe(result => {
        if (result.isValid === true) {
          const tab = this.tabs.find(t => t.key === modulName);
          if (tab){
            const item = tab.dataList.find(d => d === element);
            if(item){
              const elt = {
                id: item.id,
                data: new EmpruntModel(result.data as Emprunt),
                nameModeAmorti: this.ModeAmortissementMap[Number(result.data.modeAmortissement)],
              }
              Object.assign(item, elt);
            }
          }
        }
      });
    }
  }
}
