import { filter } from 'rxjs/operators';

import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { RevenuExploitation } from '../projets/revenu-exploitation';
import { CommonModule } from '@angular/common';
import { FormsModule, NumberValueAccessor } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { Projet } from '../projets/projet';
import { Emprunt } from '../emprunts/emprunt';
import { ListTypeGraph, ModeAmortissements, TypeProjets } from '../projets/combo';
import { InfoNature, Element, RevenuProjet, CroissanceVacance, AmortisEmprunt, SousNature_Nature } from './interfaces';
import { InfoSupProjet, TabConfig } from '../projets/interface-projet';
import { AmortissementEmprunt } from './amortissement-emprunt/amortissement-emprunt';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Workbook } from 'exceljs';
import { RevenuPrevisionnels } from './revenu-previsionnels/revenu-previsionnels';
import { OperationPeriod } from '../projets/operation-periode';
import jspdf from 'jspdf';
import { RegleCalcul } from '../regle-calculs/regle-calcul';
import { finalize, forkJoin, map, switchMap } from 'rxjs';
import { NaturesService } from '../../core/services/natures.service';
import { SousNaturesService } from '../../core/services/sous-natures.service';
import { RegleCalculService } from '../../core/services/regle-calcul-service';
import { Nature, NatureModel } from '../natures/nature';
import { SousNature, SousNatureModel } from '../sous-natures/sous-nature';
import { ProjetOperation } from '../projets/projet-operation';

interface RegleCalcul_Nature{
  regleCalcul: RegleCalcul;
  sn_nature_rg: SousNature_Nature;
  sousNature_nature: SousNature_Nature[];
}
interface GroupElement{
  key: string;
  element: Element[];
}

@Component({
  selector: 'app-impressions',
  imports: [CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatDialogContent,
    MatDialogModule,
    MatButtonModule,
    AmortissementEmprunt,
    RevenuPrevisionnels],
  templateUrl: './impressions.html',
  styleUrl: './impressions.css'
})
export class Impressions  implements OnInit {
  isLoading: boolean = false;
  isPDFGenerate: boolean = false;
  loadingMessage: string = "Chargement...";
  titleTable: string = "";
  appName = 'SCI Manager'; // 🏢 Nom de ton app ou société
  group_Elts: GroupElement[] = [];
  group_Elts_Rapport: GroupElement[] = [];
  elements: Element[] = [];
  elements1: Element[] = [];
  elts_REV: Element[] = [];
  elts_DEP: Element[] = [];
  elts_IND_CLE: Element[] = [];

  elts_EMP: Element[] = [];
  elt_detail_EMP: Element[] = [];
  elements_CON: Element[] = [];
  InRegleCalculs_: any[] = [];
  elements_IN: Element[] = [];//liste des elements d'encaissement
  elements_OUT: Element[] = [];//liste des elements de decaissement
  //elts_REV: Element[] = [];
  //elts_DEP: Element[] = [];
  croissanceVacance: OperationPeriod[] = [];
  indexationAnnuel: OperationPeriod[] = [];
  regleCalcul_Natures: RegleCalcul_Nature[] = [];
  elts_regleCalcul: Element[] = [];
  interetEmprunt: number[] = [];
  remisEmprunt: number[] = [];

  constructor(
    public dialogRef: MatDialogRef<Impressions>,
    private natureService: NaturesService,
    private sousNatureService: SousNaturesService,
    private regleCalculService: RegleCalculService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      modulName: string;
      fileName?: string;
      tabs: TabConfig[];
      dureeProjet: number;
      infoProjet: Projet;
      valid: string;
      cancel: string }
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadGroupElts();
    this.loadEmprunts();
    const infoEmprunt = this.computeEmpruntStats();
    this.interetEmprunt = infoEmprunt.interets;
    this.remisEmprunt = infoEmprunt.capitaux;
    this.findRemiseInteretEmpNature();

    if(this.data.modulName == "REV"){
      this.titleTable = "Revenus prévisionnels";
    }else if(this.data.modulName == "DEP"){
      this.titleTable = "Dépenses d'exploitation";
    }else if(this.data.modulName == "EMP"){
      this.titleTable = "Tableau d'amortissement des emprunts";
    }else if(this.data.modulName == "CON"){
      this.titleTable = "Coût des investissements";
    }else if(this.data.modulName == "FIN"){
      this.titleTable = "Plan de financement";
    }else if(this.data.modulName == "TRE"){
      this.titleTable = "PLAN DE TRÉSORERIE";
    }else if(this.data.modulName == "CRT"){
      this.titleTable = "Compte de résultat prévisionnel";
    }else if(this.data.modulName == "IND"){
      this.titleTable = "INDICATEURS CLÉS";
    }
  }

  initData(){
    console.log("initData = ")
    if(this.data.modulName != "EMP"){
      this.loadCroissanceVacance();
      this.loadIndexationAnnuel();
      if(this.data.modulName === "CON"){
        this.elements = this.group_Elts
        .filter(g => (g.key === "INV") || (g.key === "FDR"))
        .flatMap(g => g.element);
      }else{
        this.elements = this.group_Elts
        .filter(g => g.key === this.data.modulName)
        .flatMap(g => g.element);
      }
      this.loadRegleCalcul();
    }
  }

  findRemiseInteretEmpNature(): void {
    this.isLoading = true;

    forkJoin({
      interet: this.sousNatureService.findById(-1),
      remise: this.sousNatureService.findById(-2)
    }).pipe(

      switchMap(({ interet, remise }) => {
        return forkJoin({
          interetNature: this.natureService.findById(interet?.idNature),
          remiseNature: this.natureService.findById(remise?.idNature)
        }).pipe(
          map(({ interetNature, remiseNature }) => ({
            interet, remise, interetNature, remiseNature
          }))
        );
      }),

      finalize(() => (this.isLoading = false))
    ).subscribe({
      next: ({ interet, remise, interetNature, remiseNature }) => {
        const dureeProjet = this.data.dureeProjet;
        const duree = this.interetEmprunt?.length ?? 0;

        const annee = Array.from({ length: duree }, (_, i) => `${i}`).slice(0, dureeProjet);

        this.elt_detail_EMP = [
          {
            id: -1,
            nom: interet.nomSousNature,
            sousNature_Nature: { sousNature: interet, nature: interetNature },
            annee,
            montant: this.interetEmprunt.slice(0, dureeProjet),
            autreElts: []
          },
          {
            id: -2,
            nom: remise.nomSousNature,
            sousNature_Nature: { sousNature: remise, nature: remiseNature },
            annee,
            montant: this.remisEmprunt.slice(0, dureeProjet),
            autreElts: []
          }
        ];

        this.initData();
        this.cdr.markForCheck(); // ✅ plus léger et sûr
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des natures ou sous-natures :', err);
        this.isLoading = false;
      }
    });
  }


  private computeEmpruntStats(): {
    interets: number[];
    capitaux: number[];
    cumulInterets: number[];
    cumulCapitaux: number[];
  } {
    if (!this.elts_EMP?.length) {
      const len = this.data?.dureeProjet ?? 0;
      return {
        interets: new Array(len).fill(0),
        capitaux: new Array(len).fill(0),
        cumulInterets: new Array(len).fill(0),
        cumulCapitaux: new Array(len).fill(0)
      };
      //return { interets: [], capitaux: [], cumulInterets: [], cumulCapitaux: [] };
    }


    const dureeProjet = this.data?.dureeProjet ?? 0;
    let maxAnnees = Math.max(...this.elts_EMP.map(e => e.autreElts?.length ?? 0), dureeProjet);
    const interets = new Array(maxAnnees).fill(0);
    const capitaux = new Array(maxAnnees).fill(0);

    for (const elt of this.elts_EMP) {
      for (const [i, a] of (elt.autreElts ?? []).entries()) {
        if(i > 0){
          interets[i-1] += a.interet ?? 0;
          capitaux[i-1] += a.valeurNet ?? 0;
        }
      }
    }

    const cumulInterets = interets.reduce<number[]>((acc, val) => {
      acc.push((acc.at(-1) ?? 0) + (Number(val) || 0));
      return acc;
    }, []);

    const cumulCapitaux = capitaux.reduce<number[]>((acc, val) => {
      acc.push((acc.at(-1) ?? 0) + (Number(val) || 0));
      return acc;
    }, []);

    const ensureLength = (arr: number[], len: number) =>
    arr.length < len ? [...arr, ...new Array(len - arr.length).fill(0)] : arr.slice(0, len);

    return {
      interets: ensureLength(interets, dureeProjet),
      capitaux: ensureLength(capitaux, dureeProjet),
      cumulInterets: ensureLength(cumulInterets, dureeProjet),
      cumulCapitaux: ensureLength(cumulCapitaux, dureeProjet)
    };
  }


  computeRegleCalcul(regleCalcul: RegleCalcul, annee: number, element: Element[]){
    const typeCalcul = regleCalcul.typeCalcul;
    const idsRg = new Set(regleCalcul.sous_natures_entree.map(b => b.idSousNature));

    const valeurs = element
      .filter(a => {
        const id = a.sousNature_Nature?.sousNature?.idSousNature;
        //console.log("cummulMontant id= ", id, " idsRg = ", idsRg, " res = ", idsRg.has(id||0), " m = ", a.montant[annee])
        return id !== undefined && idsRg.has(id);
      })
      .map(a => a.montant[annee] || 0)
      .map(Number);
    if (valeurs.length === 0) return 0;

    // Applique la règle selon le type de calcul
    let resultat = 0;

    switch (typeCalcul) {
      case "ADD":
        resultat = valeurs.reduce((acc, v) => acc + v, 0);
        break;

      case "DIF":
        resultat = valeurs.reduce((acc, v) => acc - v);
        break;

      case "MUL":
        resultat = valeurs.reduce((acc, v) => acc * v, 1);
        break;

      default:
        console.warn(`Type de calcul inconnu: ${typeCalcul}`);
        resultat = 0;
    }

    // Si un taux est défini, on peut l’appliquer
    if (regleCalcul.detailRegleCalcul.includes("tauxVariable")) {
      console.log("tauxVariable = ", regleCalcul);
      const item = element.find(a =>
        a.sousNature_Nature?.sousNature?.idSousNature == regleCalcul.idSousNature
      );
      const taux = Number(item?.montant?.[annee] || 0);
      console.log("tauxVariable i= ", item, " t= ", taux, " r= ", resultat);
      resultat *= taux / 100;
      console.log("tauxVariable r+= ", resultat);
    } else {
      const taux = Number(regleCalcul.tauxRegleCalcul || 0);
      if (taux !== 0) {
        resultat *= taux / 100;
      }
    }

    return resultat;
  }

  /**
   * Calcule toutes les règles de calcul dans le bon ordre (topologique)
   * sans récursion, en respectant les dépendances entre sous-natures.
   */
  computeAllReglesTopologique(
    regleCalculNatures: RegleCalcul_Nature[],
    elements: Element[],
    duree: number
  ): Map<number, number[]> {
    const graph = new Map<number, Set<number>>(); // idParent -> enfants
    const indegree = new Map<number, number>();   // id -> nombre de dépendances
    const idToRegle = new Map<number, RegleCalcul>();

    // 1️⃣ Construire le graphe de dépendances
    for (const rn of regleCalculNatures) {
      const parentId = rn.regleCalcul.idRegleCalcul;
      idToRegle.set(parentId, rn.regleCalcul);

      if (!graph.has(parentId)) graph.set(parentId, new Set());
      if (!indegree.has(parentId)) indegree.set(parentId, 0);

      // Pour chaque sous-nature d’entrée, vérifier si elle correspond à une autre règle
      for (const dep of rn.regleCalcul.sous_natures_entree) {
        const enfant = regleCalculNatures.find(
          r =>
            r.sn_nature_rg.sousNature.idSousNature === dep.idSousNature
        );
        if (enfant) {
          const childId = enfant.regleCalcul.idRegleCalcul;
          graph.get(parentId)?.add(childId);
          indegree.set(childId, (indegree.get(childId) || 0) + 1);
          if (!indegree.has(parentId)) indegree.set(parentId, 0);
        }
      }
    }

    // 2️⃣ Trouver les règles racines (aucune dépendance)
    const queue: number[] = [];
    for (const [id, count] of indegree.entries()) {
      if (count === 0) queue.push(id);
    }

    // 3️⃣ Ordre topologique
    const sortedIds: number[] = [];
    while (queue.length > 0) {
      const id = queue.shift()!;
      sortedIds.push(id);
      for (const child of graph.get(id) || []) {
        indegree.set(child, indegree.get(child)! - 1);
        if (indegree.get(child)! === 0) queue.push(child);
      }
    }

    // ⚠️ Vérification des cycles
    if (sortedIds.length !== idToRegle.size) {
      console.warn("⚠️ Cycle détecté dans les dépendances de règles !");
    }

    // 4️⃣ Calcul des montants dans l’ordre
    const results = new Map<number, number[]>();

    for (const id of sortedIds) {
      const regle = idToRegle.get(id);
      if (!regle) continue;

      const montants: number[] = [];
      for (let i = 0; i < duree; i++) {
        const montant = this.computeRegleCalcul(regle, i, elements);
        montants.push(montant);
      }
      results.set(id, montants);
    }

    return results;
  }

  loadCroissanceVacance(){
    const tab = this.data.tabs.find(t => t.key === "REV");
    const stab: TabConfig|undefined = tab?.subDataList?.find(sd => sd?.key === "VAC");

    const temp: OperationPeriod[] = [];
    stab?.dataList.forEach(sd => {
      temp.push({
        idProjet: -1,
        idOperation: -1,
        typeOperation: "REV",
        annee: sd.nom,
        montant: sd.value
      } as OperationPeriod)
      this.croissanceVacance = [...temp];
    })
  }

  loadIndexationAnnuel(){
    const tab = this.data.tabs.find(t => t.key === "DEP");
    const stab: TabConfig|undefined = tab?.subDataList?.find(sd => sd?.key === "IND");

    const temp: OperationPeriod[] = [];
    stab?.dataList.forEach(sd => {
      temp.push({
        idProjet: -1,
        idOperation: -1,
        typeOperation: "DEP",
        annee: sd.nom,
        montant: sd.value
      } as OperationPeriod)
      this.indexationAnnuel = [...temp];
    })
  }


  loadRegleCalcul(){
    forkJoin({
      sousNatures: this.sousNatureService.listSousNatures(1, 1000),
      natures: this.natureService.listNatures(1, 1000),
      regleCalculs: this.regleCalculService.listRegleCalculs(0, 1000),
    }).subscribe({
      next: ({ sousNatures, natures, regleCalculs }) => {
        sousNatures = sousNatures.data.sous_natures;
        //natures = natures.data.base_natures;
        const listNatures = natures.data.base_natures.map(
              (s: Nature) => NatureModel.fromResponse(s)
            );
        regleCalculs = regleCalculs.data.regles_calcul;
        this.buildElement(regleCalculs, listNatures, sousNatures);
        this.isLoading = false;
        //this.cdr.detectChanges();
        setTimeout(() => {
          //this.loadDepense();
          let duree = this.data.dureeProjet;

          const elts = this.group_Elts
          .flatMap(g => g.element);
          const results = this.computeAllReglesTopologique(
            this.regleCalcul_Natures,
            elts,
            duree
          );
          this.elts_regleCalcul = this.filterRegleCalcul([this.data.modulName])


          const idSn_Rg = new Set(this.regleCalcul_Natures.map(b => b.regleCalcul.idSousNature));


          this.elements = this.elements.filter(e => {
            const id = e.sousNature_Nature?.sousNature?.idSousNature;
            return id !== undefined && !idSn_Rg.has(id)})

          if(this.data.modulName == 'CON'){
            this.elements1 = [...this.elements, ...this.elts_regleCalcul.filter(e => e.sousNature_Nature?.nature.typeNature === 'INV' || e.sousNature_Nature?.nature.typeNature === 'FDR'), ...this.elt_detail_EMP.filter(e => e.sousNature_Nature?.nature.typeNature === 'INV' || e.sousNature_Nature?.nature.typeNature === 'FDR')];
          }else{
            this.elements1 = [...this.elements, ...this.elts_regleCalcul.filter(e => e.sousNature_Nature?.nature.typeNature === this.data.modulName), ...this.elt_detail_EMP.filter(e => e.sousNature_Nature?.nature.typeNature === this.data.modulName)];
          }
          this.elts_REV = [...this.group_Elts
                              .filter(g => g.key === "REV")
                              .flatMap(g => g.element),
                            ...this.filterRegleCalcul(["REV"]),
                            ...this.elt_detail_EMP
                              .filter(e => e.sousNature_Nature?.nature.typeNature === "REV")];


          this.elts_DEP = [...this.group_Elts
                              .filter(g => g.key === "DEP")
                              .flatMap(g => g.element),
                            ...this.filterRegleCalcul(["DEP"]),
                            ...this.elt_detail_EMP
                              .filter(e => e.sousNature_Nature?.nature.typeNature === "DEP")];


          this.elements_CON = [...this.group_Elts
                                .filter(g => (g.key === "INV") || (g.key === "FDR"))
                                .flatMap(g => g.element),
                              ...this.filterRegleCalcul(["INV", "FDR"]),
                              ...this.elt_detail_EMP
                                .filter(e => (e.sousNature_Nature?.nature.typeNature === "INV") || (e.sousNature_Nature?.nature.typeNature === "FDR"))]


          //this.elts_IND_CLE = this.buildElements_IN_OUT(["REV", "DEP", "INV", "FDR", "FIN", "TRE"], ["REV", "DEP", "INV", "FDR", "FIN", "TRE"], ["REV", "DEP", "INV", "FDR", "FIN", "TRE"])
          this.elements_OUT = this.buildElements_IN_OUT(['INV', 'DEP', 'TRE'], ['INV', 'DEP', 'TRE'], ['INV', 'DEP', 'TRE'])
          this.elements_IN = this.buildElements_IN_OUT(['FIN', 'REV'], ['FIN', 'REV'], ['FIN', 'REV', 'TRE'])

          this.elts_IND_CLE = [...this.group_Elts
                                .flatMap(g => g.element),
                              ...this.filterRegleCalcul(["REV", "DEP", "INV", "FDR", "FIN", "TRE"]),
                              ...this.elt_detail_EMP]//,
                              //...this.elements_OUT,
                              //...this.elements_IN]

          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => (this.isLoading = false)
    });
  }

  filterRegleCalcul(modulNames: string[]): Element[]{
    if(modulNames.includes('CON')){
      modulNames = modulNames.filter(m => m !== 'CON');
      modulNames.push('INV', 'FDR');
    }
    const allowed = new Set(modulNames);
    let duree = this.data.dureeProjet;
    const elts = this.group_Elts
          .flatMap(g => g.element);
    const results = this.computeAllReglesTopologique(
      this.regleCalcul_Natures,
      elts,
      duree
    );
    //console.log("results = ", results)
    const rg = this.regleCalcul_Natures
    .filter(elt => allowed.has(elt.sn_nature_rg.nature.typeNature))
    .map(rg => {
      const nom = rg.sn_nature_rg.sousNature.nomSousNature;
      const sousNature_Nature = rg.sn_nature_rg;
      const isCummul: boolean = !!rg.regleCalcul.detailRegleCalcul?.includes("cummulAnnee");

      const idRegle = rg.regleCalcul.idRegleCalcul;
      const valeurs = results.get(idRegle) || [];

      const montants: number[] = [];
      const annee: string[] = [];
      const autreElts: OperationPeriod[] = [];
      let cummulMontant = 0;
      for (let i = 0; i < duree; i++) {
        const montant = valeurs[i] ?? 0;
        cummulMontant = isCummul ? cummulMontant + montant : montant;

        montants.push(cummulMontant);
        annee.push(`${i}`);
        autreElts.push({
          idProjet: -1,
          idOperation: -1,
          typeOperation: rg.sn_nature_rg.nature.typeNature,
          annee: i,
          montant: cummulMontant,
          statut: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      return {
        id: 0,
        nom: nom,
        sousNature_Nature: sousNature_Nature,
        annee: annee,
        montant: montants,
        autreElts: autreElts
      } as Element;
    });
    console.log("results rg= ", rg)

    return rg;
  }

  private buildElements_IN_OUT(allowedTypes_Elt: string[], allowedTypes_EMP: string[], allowedTypes_RG?: string[]): Element[] {
    const allowed_Elt = new Set(allowedTypes_Elt);
    const allowed_EMP = new Set(allowedTypes_EMP);
    const allowed_RG = new Set(allowedTypes_RG);

    // 1️⃣ Récupère tous les idSousNature présents dans regleCalcul_Natures
    const allSousNatureIdsInRegles = new Set(
      this.regleCalcul_Natures
        .flatMap(r => [
          r.sn_nature_rg?.sousNature?.idSousNature,
          ...(r.sousNature_nature?.map(sn => sn.sousNature?.idSousNature) ?? [])
        ])
        .filter((id): id is number => id !== undefined)
    );

    // 2️⃣ Construit le tableau d’éléments filtrés
    const elements = [
      // 🟢 group_Elts : éléments dont la clé est dans allowedTypes, et non présents dans les règles
      ...this.group_Elts
        .filter(g => allowed_Elt.has(g.key))
        .flatMap(g =>
          g.element.filter(
            el =>
              !allSousNatureIdsInRegles.has(el.sousNature_Nature?.sousNature?.idSousNature ?? -10)
          )
        ),
      // 🟢 regleCalcul_Natures : sn_nature_rg et sousNature_nature valides
      ...this.regleCalcul_Natures.flatMap(rcn =>
        rcn.sn_nature_rg?.nature?.typeNature &&
        allowed_RG.has(rcn.sn_nature_rg.nature.typeNature) /*&&
        prohibited.has(rcn.sn_nature_rg.nature.typeNature)*/ &&
        rcn.sousNature_nature?.every(sn =>
          allowed_RG.has(sn.nature.typeNature)
          /*&&
          prohibited.has(rcn.sn_nature_rg.nature.typeNature)*/)
          ? this.elts_regleCalcul.filter(
              e =>
                e.sousNature_Nature?.sousNature?.idSousNature ===
                rcn.sn_nature_rg?.sousNature?.idSousNature
            )
          : []
      ),
      // 🟢 elt_detail_EMP : éléments dont le typeNature est dans allowedTypes
      ...this.elt_detail_EMP.filter(
        e => e.sousNature_Nature?.nature?.typeNature && allowed_EMP.has(e.sousNature_Nature.nature.typeNature)
      )
    ];

    // 3️⃣ Supprime les doublons (même idSousNature)
    return elements.filter(
      (el, index, self) =>
        index ===
        self.findIndex(
          e =>
            e.sousNature_Nature?.sousNature?.idSousNature ===
            el.sousNature_Nature?.sousNature?.idSousNature
        )
    );
  }


  buildElement(regleCalculs: RegleCalcul[], natures: Nature[], sousNatures: SousNature[]): void {
    this.regleCalcul_Natures = regleCalculs.map(rg => {
      // 🔹 Trouver la sous-nature principale liée à la règle
      const sousNature = sousNatures.find(sn => sn.idSousNature === rg.idSousNature);

      // 🔹 Trouver la nature correspondante
      const nature = sousNature
        ? natures.find(n => n.idNature === sousNature.idNature)
        : undefined;

      // 🔹 Associer la sous-nature/nature principale
      const sn_nature_rg: SousNature_Nature = {
        sousNature: sousNature!,
        nature: nature!
      };

      // 🔹 Construire la liste des sous-natures/natures liées (entrées)
      const sousNature_nature: SousNature_Nature[] = rg.sous_natures_entree?.map(log => {
        const snEntree = sousNatures.find(sn => sn.idSousNature === log.idSousNature);
        const natEntree = snEntree
          ? natures.find(n => n.idNature === snEntree.idNature)
          : undefined;
        return {
          sousNature: snEntree!,
          nature: natEntree!
        } as SousNature_Nature;
      }) || [];

      // 🔹 Retourner l’objet complet
      return {
        regleCalcul: rg,
        sn_nature_rg,
        sousNature_nature
      } as RegleCalcul_Nature;
    });
  }



  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async excelToPDF(file: File) {
    const workbook = new Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const sheet = workbook.worksheets[0]; // première feuille

    // 2️⃣ Extraire les données en tableau pour jsPDF
    const data: any[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (!row || !row.values) return; // saute les lignes vides

      const values = Array.isArray(row.values)
        ? row.values.slice(1).map(v => (v === null || v === undefined ? '' : v))
        : [String(row.values)];

      if (values.some(v => v !== '')) data.push(values);
    });


    // 3️⃣ Générer le PDF
    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [data[0]],    // première ligne comme en-tête
      body: data.slice(1), // le reste comme contenu
    });

    // 4️⃣ Sauvegarder le PDF
    doc.save('document.pdf');
  }

  async printGraph(): Promise<void> {
    this.loadingMessage = "Génération du PDF en cours...";
    this.isPDFGenerate = true;
    await this.delay(100);

    const canvas = document.getElementById('graphCanvas');
    if (!canvas){
      this.isPDFGenerate = false;
      return;
    }
    html2canvas(canvas, { scale: 2 }).then(canvasRendered => {
      const imgData = canvasRendered.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape', // ou 'portrait'
        unit: 'px',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvasRendered.width;
      const imgHeight = canvasRendered.height;

      // Ajustement proportionnel
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

      pdf.save('graph.pdf');
      this.isPDFGenerate = false;
    });
  }

  async exportPDF(): Promise<void> {
    this.loadingMessage = "Génération du PDF en cours...";
    this.isPDFGenerate = true;
    await this.delay(100);

    const data = document.getElementById('revenusTable');
    if (!data){
      this.isPDFGenerate = false;
      return;
    }
    const tableWidth = data.scrollWidth;
    const widthInMm = tableWidth * 0.264583;
    const format = widthInMm > 297 ? [widthInMm, 210] : 'a4';
    let opt: any;
    if(this.data.modulName == "EMP"){
      opt = {
        margin: [10, 10, 10, 10], // top, left, bottom, right
        filename: (this.data?.fileName || this.data.modulName)+'.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        //html2canvas: { scale: 2, useCORS: true },
        html2canvas: { scale: 1, useCORS: true, scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'p' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // ✅ évite coupures dans tableaux
      }as any;
    }else{
      opt = {
        margin: [10, 10, 10, 10], // top, left, bottom, right
        filename: (this.data?.fileName || this.data.modulName)+'.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        //html2canvas: { scale: 2, useCORS: true },
        html2canvas: { scale: 1, useCORS: true, scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm', format: format, orientation: 'l' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // ✅ évite coupures dans tableaux
      }as any;
    }
    try {
      await html2pdf().from(data).set(opt).save();

    } catch (err) {
      console.error('Erreur génération PDF :', err);
    } finally {
      this.isPDFGenerate = false;
      this.loadingMessage = "Chargement...";
    }
  }

  async exportPDF1(): Promise<void> {
    this.loadingMessage = "Génération du PDF en cours...";
    this.isPDFGenerate = true;
    await this.delay(100);

    const table = document.getElementById('revenusTable');
    if (!table) {
      this.isPDFGenerate = false;
      return;
    }

    const pxToMm = (px: number) => px * 0.264583;
    const pageMargin = 10; // marges en mm
    const a4WidthMm = 297 - 2 * pageMargin; // A4 paysage max width
    const a4HeightMm = 210 - 2 * pageMargin;

    const ths = table.querySelectorAll('th');
    const nbCols = ths.length;

    // Calcul des largeurs de chaque colonne
    const colWidths = Array.from(ths).map(th => th.getBoundingClientRect().width);
    const totalTableWidthPx = colWidths.reduce((a, b) => a + b, 0);

    // Découpe en tranches si tableau plus large qu'une page A4
    let slices: { start: number, end: number }[] = [];
    let startCol = 0;
    let accWidth = 0;
    for (let i = 0; i < nbCols; i++) {
      accWidth += colWidths[i];
      if (pxToMm(accWidth) > a4WidthMm) {
        slices.push({ start: startCol, end: i });
        startCol = i;
        accWidth = colWidths[i];
      }
    }
    slices.push({ start: startCol, end: nbCols - 1 });

    // Création d'un conteneur temporaire pour les clones
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const pdf = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4'
    });

    for (let s = 0; s < slices.length; s++) {
      const slice = slices[s];
      const clone = table.cloneNode(true) as HTMLElement;
      container.appendChild(clone);

      // Masquer les colonnes hors tranche
      const rows = clone.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        cells.forEach((cell, idx) => {
          if (idx < slice.start || idx > slice.end) {
            (cell as HTMLElement).style.display = 'none';
          }
        });
      });

      // Capture avec html2canvas
      const canvas = await html2canvas(clone, { useCORS: true, scale: 1 });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      const imgWidthMm = a4WidthMm;
      const imgHeightMm = pxToMm(canvas.height * (imgWidthMm / pxToMm(canvas.width)));

      if (s > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', pageMargin, pageMargin, imgWidthMm, imgHeightMm, '', 'FAST');

      container.removeChild(clone);
    }

    document.body.removeChild(container);
    pdf.save((this.data?.fileName || this.data.modulName) + '.pdf');

    this.isPDFGenerate = false;
    this.loadingMessage = "Chargement...";
  }

  async exportExcel(): Promise<void> {
    this.loadingMessage = "Génération du fichier excel en cours...";
    this.isPDFGenerate = true;
    await this.delay(100);
    const table = document.getElementById('revenusTable') as HTMLTableElement;
    if (!table){
      this.isPDFGenerate = false;
      return;
    }

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet(this.data.fileName || this.data.modulName);

    const skipMap: Record<string, boolean> = {};

    // Calcul du nombre total de colonnes en tenant compte du colspan
    const totalColumns = Array.from(table.rows[0].cells).reduce((sum, cell) => {
      return sum + parseInt(cell.getAttribute('colspan') || '1', 10);
    }, 0);

    for (let r = 0; r < table.rows.length; r++) {
      const rowElement = table.rows[r];
      const rowCellsCount = rowElement.cells.length;
      let row = sheet.getRow(r + 1);

      if (!row) row = sheet.addRow(Array(totalColumns).fill(null));

      let currentColIndex = 1;

      for (let c = 0; c < rowCellsCount; c++) {
        const cellElement = rowElement.cells[c];
        if (!cellElement) continue;

        // Sauter les cellules fusionnées précédemment
        while (skipMap[`${r}-${currentColIndex}`]) {
          currentColIndex++;
        }

        const colspan = parseInt(cellElement.getAttribute('colspan') || '1', 10);
        const rowspan = parseInt(cellElement.getAttribute('rowspan') || '1', 10);
        const cellValue = cellElement.innerText.trim();

        // Propager la valeur sur toutes les lignes et colonnes fusionnées
        for (let rr = 0; rr < rowspan; rr++) {
          let targetRow = sheet.getRow(r + 1 + rr);
          if (!targetRow) targetRow = sheet.addRow(Array(totalColumns).fill(null));

          for (let cc = 0; cc < colspan; cc++) {
            const targetCell = targetRow.getCell(currentColIndex + cc);
            targetCell.value = cellValue;

            // --- Styles
            const style = window.getComputedStyle(cellElement);

            // Gras
            const isBold = style.fontWeight === 'bold' || +style.fontWeight >= 600;
            if (isBold) targetCell.font = { bold: true };

            // Alignement
            const align = style.textAlign as 'left' | 'center' | 'right';
            targetCell.alignment = { horizontal: align || 'center', vertical: 'middle', wrapText: true };

            // Bordures
            targetCell.border = {
              top: { style: 'thin', color: { argb: '000000' } },
              left: { style: 'thin', color: { argb: '000000' } },
              bottom: { style: 'thin', color: { argb: '000000' } },
              right: { style: 'thin', color: { argb: '000000' } },
            };

            // Couleur de fond
            const bgColor = style.backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
              targetCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: this.rgbToHex(bgColor) }
              };
            }
          }
        }

        // Fusion des cellules dans Excel
        if (colspan > 1 || rowspan > 1) {
          sheet.mergeCells(
            r + 1,
            currentColIndex,
            r + rowspan,
            currentColIndex + colspan - 1
          );

          for (let rr = 0; rr < rowspan; rr++) {
            for (let cc = 0; cc < colspan; cc++) {
              if (rr === 0 && cc === 0) continue;
              skipMap[`${r + rr}-${currentColIndex + cc}`] = true;
            }
          }
        }

        currentColIndex += colspan;
      }
    }

    // Ajustement automatique des colonnes
    sheet.columns.forEach(col => {
      if (!col) return;
      let maxLength = 8;

      if (col.eachCell) {
        col.eachCell({ includeEmpty: true }, (cell : any) => {
          if (cell && cell.value != null) {
            let cellLength = 0;

            if (typeof cell.value === 'string') {
              cellLength = cell.value.length;
            } else if (typeof cell.value === 'number') {
              cellLength = cell.value.toString().length;
            } else if (typeof cell.value === 'boolean') {
              cellLength = cell.value ? 4 : 5; // "true"/"false"
            } else if (cell.value instanceof Date) {
              cellLength = 10; // format classique yyyy-mm-dd
            } else if ('richText' in cell.value && Array.isArray(cell.value.richText)) {
              //cellLength = cell.value.richText.map(rt => rt.text.length).reduce((a, b) => a + b, 0);
              cellLength = cell.value.richText.map((rt: { text: string | any[]; }) => rt.text.length).reduce((a: any, b: any) => a + b, 0);
            }

            if (cellLength > maxLength) maxLength = cellLength;
          }
        });
      }

      // Ajouter un peu de marge
      col.width = maxLength + 2;
    });

    await sheet.protect('motdepasse123', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false
    });


    // Exporter
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${(this.data.fileName || this.data.modulName)}.xlsx`);

    this.isPDFGenerate = false;
    this.loadingMessage = "Chargement...";
  }

  // Convertit 'rgb(255, 255, 255)' en 'FFFFFFFF'
  private rgbToHex(rgb: string): string {
    const result = rgb.match(/\d+/g);
    if (!result) return 'FFFFFFFF';
    const hex = result
      .slice(0, 3)
      .map(x => (+x).toString(16).padStart(2, '0'))
      .join('');
    return hex.toUpperCase() + 'FF'; // ARGB
  }

  loadGroupElts(): void {
    this.isLoading = true;

    const groupElements: GroupElement[] = [];

    for (const t of this.data.tabs) {
      const key = t.key;

      // --- 1️⃣ Gestion des sous-données REV / DEP ---
      if (key === "REV" || key === "DEP") {
        const subKey = key === "REV" ? "VAC" : "IND";
        const targetField = key === "REV" ? "croissanceVacance" : "indexationAnnuel";

        const stab = t.subDataList?.find(sd => sd?.key === subKey);
        if (stab?.dataList?.length) {
          this[targetField] = stab.dataList.map(sd => ({
            idProjet: -1,
            idOperation: -1,
            typeOperation: key,
            annee: sd.nom,
            montant: sd.value,
            statut: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as OperationPeriod));
        }
      }

      // --- 2️⃣ Génération des éléments ---
      const duree = this.data.dureeProjet;
      const newElements: Element[] = [];

      const maxId = Math.max(0, ...(t.dataList?.map(r => r.id) || []));
      let nextId = maxId + 1;

      for (const elt of t.dataList || []) {
        const montants: number[] = [];
        const annees: string[] = [];
        console.log("montant = ", elt)
        for (let i = 0; i < duree; i++) {
          let montant = 0;
          if (key === "REV") {
            const vac = this.croissanceVacance.at(i)?.montant ?? 0;
            montant = elt.data.surface * elt.data.loyer * (1 - vac / 100);
          } else if (key === "DEP") {
            const ind = this.indexationAnnuel.at(i)?.montant ?? 0;
            montant = elt.data.montant * (ind / 100);
          }else{
            montant = elt.montant?.[i] ?? 0;
          }
          montants.push(montant);
          annees.push(`${i}`);
        }

        newElements.push({
          id: nextId++,
          nom: elt.nom,
          data: elt.data,
          annee: annees,
          montant: montants,
          sousNature_Nature: elt.sousNature_Nature,
        });
      }

      // --- 3️⃣ Ajout dans le tableau global ---
      groupElements.push({
        key,
        element: newElements,
      });
    }

    // --- 4️⃣ Affectation finale ---
    this.group_Elts = groupElements;

    this.isLoading = false;
  }


  loadEmprunts(){
    this.isLoading = true;
    let duree = 1;
    let nameModeAmorti = "";
    let idModeAmorti = "";
    let capital = 0;
    let montants: number[] = [];
    let autreElts: AmortisEmprunt[] = [];
    let autreElt: AmortisEmprunt;
    let annee: string[] = [];
    const newElements: Element[] = [];
    const tab = this.data.tabs.find(t => t.key === "EMP");

    tab?.dataList.forEach((elt: {id: number, data: Emprunt, nameModeAmorti: string} )=> {
      duree = +elt.data.dureeCredit + 1;
      montants = [];
      autreElts = []
      annee = [];
      nameModeAmorti = elt.nameModeAmorti;
      idModeAmorti = elt.data.modeAmortissement;
      capital = elt.data.montantEmprunte;

      for (let i = 0; i < duree; i++) {
        if(i == 0){
          autreElts.push({interet: 0.0, amortiCapital: 0.0, annuite: 0.0, valeurNet: 0.0});
          montants.push(capital);
          annee.push(`${i}`);
        }else{
          autreElt = this.computeCapAmorti(+idModeAmorti, capital, elt.data);
          montants.push(capital);
          autreElts.push(autreElt);
          annee.push(`${i}`);
          capital = autreElt.valeurNet
        }
      }

      const maxId = tab.dataList.length > 0
        ? Math.max(...tab.dataList.map(r => r.id))
        : 0;

      let nextId = maxId + 1;

      newElements.push({
        id: nextId++,
        nom: nameModeAmorti,//elt.data.organismePreneur,// .nom,
        data: elt.data,
        annee: annee,
        montant: montants,
        autreElts: autreElts,
      });
      this.elts_EMP = [...newElements];
    });
    this.isLoading = false;
  }

  computeCapAmorti(idModeAmorti: number, capitalRestant: number, emprunt: Emprunt): AmortisEmprunt{
    let interet = 0;
    let amortiCapital = 0;
    let annuite = 0;
    let valeurNet = 0;
    let tauxInteret = emprunt.tauxInteretAnnuel/100;
    interet = capitalRestant*(tauxInteret);
    if(capitalRestant > 0){
      if(idModeAmorti == 1){
        annuite = emprunt.montantEmprunte*(tauxInteret/(1 - Math.pow(1+tauxInteret, -emprunt.dureeCredit)))
        amortiCapital = annuite - interet;
        valeurNet = capitalRestant-amortiCapital;
      }else if(idModeAmorti == 2){
        amortiCapital = emprunt.montantEmprunte/emprunt.dureeCredit;
        annuite = interet+amortiCapital;
        valeurNet = capitalRestant-amortiCapital;
      }
    }
    return {interet, amortiCapital, annuite, valeurNet};
  }
}

