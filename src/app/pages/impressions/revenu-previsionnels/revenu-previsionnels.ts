import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RevenuExploitation } from '../../projets/revenu-exploitation';
import { CommonModule } from '@angular/common';
import { FormsModule, NumberValueAccessor } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { Projet } from '../../projets/projet';
import { Emprunt } from '../../emprunts/emprunt';
import { InfoNature, Element, AmortisEmprunt, SousNature_Nature } from '../interfaces';
import { OperationPeriod } from '../../projets/operation-periode';
import { Nature, NatureModel } from '../../natures/nature';
import { forkJoin } from 'rxjs';
import { NaturesService } from '../../../core/services/natures.service';
import { SousNaturesService } from '../../../core/services/sous-natures.service';
import { Router } from '@angular/router';
import { SousNature, SousNatureModel } from '../../sous-natures/sous-nature';
import { RegleCalculService } from '../../../core/services/regle-calcul-service';
import { RegleCalcul, RegleCalculModel } from '../../regle-calculs/regle-calcul';
import { all, create, evaluate, Matrix } from 'mathjs';

import { Chart, ChartDataset, registerables } from 'chart.js';
import { ListTypeGraph } from '../../projets/combo';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';


Chart.register(...registerables, ChartDataLabels);

interface TotauxParAnnee{
  id: number;
  nom: string;
  value : number;
}

interface GroupeElt{
  nature: Nature;
  elements: Element[];
  totauxAnnee: number[];
  totalNature: number;
}

interface GroupeElt_IND_CLE{
  sousNature: SousNature;
  elements: Element[];
  totauxAnnee: number[];
  totalNature: number;
}

@Component({
  selector: 'app-revenu-previsionnels',
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule, MatDialogModule, MatButtonModule,
    BaseChartDirective
  ],
  templateUrl: './revenu-previsionnels.html',
  styleUrl: '../impressions.css'//'./revenu-previsionnels.css'
})
export class RevenuPrevisionnels implements AfterViewInit, OnInit, OnChanges {
  @Input() titleTable : string = "Tableau d'amortissement des emprunts";
  @Input() croissanceVacance?: OperationPeriod[];
  @Input() indexationAnnuel?: OperationPeriod[];
  @Input() data: any;
  @Input() elements: any[] = [];
  @Input() elements_CON?: any[] = [];
  @Input() elts_regleCalcul?: Element[];
  @Input() elements_IN?: Element[];
  @Input() elements_OUT?: Element[];
  @Input() elts_DEP?: Element[];
  @ViewChild('graphCanvas') graphCanvas!: ElementRef;
  isLoading: boolean = false;
  sousNature_natures: SousNature_Nature[] = [];
  anneeList: string[] = [];
  totauxParAnnee: number[] = [];
  cumulMontants: number[] = [];
  cumulMontants_IN: number[] = [];
  cumulMontants_OUT: number[] = [];
  cumulMontants_DEP: number[] = [];
  totauxParAnnee_CON: number[] = [];
  cumulMontants_CON: number[] = [];
  totauxParAnnee_IN: number[] = [];
  totauxParAnnee_OUT: number[] = [];
  totauxParAnnee_DEP: number[] = [];
  diffCumulMontants: number[] = [];
  totalGlobal = 0;
  totalGlobal_CON = 0;
  totalGlobal_IN = 0;
  totalGlobal_OUT = 0;
  totalGlobal_DEP = 0;
  groupes: {
    nature: Nature;
    elements: Element[];
    totauxAnnee: number[];
    totalNature: number;
  }[] = [];
  groupes_IN: {
    nature: Nature;
    elements: Element[];
    totauxAnnee: number[];
    totalNature: number;
  }[] = [];
  groupes_OUT: {
    nature: Nature;
    elements: Element[];
    totauxAnnee: number[];
    totalNature: number;
  }[] = [];
  groupes_DEP: {
    nature: Nature;
    elements: Element[];
    totauxAnnee: number[];
    totalNature: number;
  }[] = [];

  groupes_IND_CLE: {
    nature: Nature;
    elements: GroupeElt_IND_CLE[];
    totauxAnnee: number[];
    totalNature: number;
  }[] = [];

  groupedElements: { nature: Nature; elements: Element[] }[] = [];
  math = create(all);

  listTypeGraph = Object.entries(ListTypeGraph).map(([key, value]) => ({
    key,
    label: value
  }));
  eltGraph: number = -5;
  isPDFGenerate: boolean = false;
  loadingMessage: string = "Chargement...";

  labels = []
  yValue: number[] = []

  chart!: Chart | undefined | null;
  tousElements: any;

  chartType: ChartType = 'line';

  chartData = {
    labels: [] as string[],
    datasets: [
      {
        label: 'Montants',
        data: [] as number[],
        borderWidth: 2,
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63,81,181,0.3)'
      } as ChartDataset<'line' | 'bar', number[]>
    ]
  };


  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            return tooltipItem.raw.toFixed(0);
          }
        }
      }
    }
  };

  ngAfterViewInit() {
    if (this.data.modulName === 'IND' && this.eltGraph && this.chartType) {
      this.onTypeGraphChange();
    }
  }

  flattenArgs(args: any[]): number[] {
    return args.flat(Infinity).map(v => Number(v));
  }

  onTypeGraphChange() {
    const elt = this.groupes_IND_CLE
      .flatMap(g => g.elements)
      .find(e => e.sousNature.idSousNature === this.eltGraph);

    if (!elt) return;
    this.renderGraph(elt)
  }

  private renderGraph(elt: any) {
    if (!elt) return;

    // Labels
    const labels = this.anneeList.map(a => "N+" + a);

    // Dataset
    const data = [...elt.totauxAnnee]; // créer un nouveau tableau


    const isPie = ["pie", "doughnut"].includes(this.chartType);
    // 🎨 Couleurs
    const backgroundColors = isPie
      ? this.generateColors(data.length)
      : "#187bcd";

    const borderColors = isPie
      ? data.map(() => "#fff")
      : "#187bcd";

    // Créer un NOUVEL objet chartData pour forcer Angular
    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: elt.sousNature?.nomSousNature || "",
          data: data,
          fill: false,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: isPie ? 2 : 3
        }
      ]
    };
    this.chartOptions = {
      responsive: true,

      plugins: {
        title: {
          display: true,
          text: elt.sousNature?.nomSousNature || "",
          color: "#000",
          font: { size: 18, weight: "bold" },
          padding: { top: 10, bottom: 20 }
        },

        tooltip: {
          callbacks: {
            label: (ctx: { label: any; raw: any; }) => {
              const x = ctx.label;
              const y = Number(ctx.raw).toFixed(2);
              return `${x} : ${y}`;
            }
          }
        },

        datalabels: {
          color: isPie ? "#fff" : "#000",
          anchor: isPie ? "center" : "end",
          align: isPie ? "center" : "top",
          font: { weight: "bold" },
          formatter: (value, ctx) => {
            const formatted = Number(value).toFixed(2);
            const label = ctx.chart?.data?.labels?.[ctx.dataIndex] ?? '';
            return isPie
              ? `${label}\n${formatted}`
              : formatted;
          }
        }
      },

      scales: isPie ? {} : {
        x: {
          title: {
            display: true,
            text: "Années (N+n)",
            color: "#000",
            font: { size: 14, weight: "bold" }
          }
        },
        y: {
          title: {
            display: true,
            text: "Montant",
            color: "#000",
            font: { size: 14, weight: "bold" }
          }
        }
      }
    }

    // Si la directive chart existe, on peut forcer update (optionnel)
    setTimeout(() => {
      this.chart?.update();
    });
  }

  generateColors(count: number): string[] {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * (360 / count)) % 360;   // répartit les couleurs sur le cercle chromatique
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
  }

  constructor(private natureService: NaturesService,
    private sousNatureService: SousNaturesService,
    private regleCalculService: RegleCalculService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog) {
    this.math.import({
      //SOMME: (...args: number[]) => args.reduce((a, b) => a + b, 0),
      //MOYENNE: (...args: number[]) => args.reduce((a, b) => a + b, 0) / args.length,
      //MIN: (...args: number[]) => Math.min(...args),
      //MAX: (...args: number[]) => Math.max(...args),


      SOMME: (...args: any[]) => {
        const vals = this.flattenArgs(args);
        return vals.reduce((a, b) => a + b, 0);
      },
      MOYENNE: (...args: any[]) => {
        const vals = this.flattenArgs(args);
        return vals.reduce((a, b) => a + b, 0) / vals.length;
      },
      MIN: (...args: any[]) => {
        const vals = this.flattenArgs(args);
        return Math.min(...vals);
      },
      MAX: (...args: any[]) => {
        const vals = this.flattenArgs(args);
        return Math.max(...vals);
      }

    });
  }


  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

    html2canvas(canvas, { scale: 3 }).then(canvasRendered => {
      const imgData = canvasRendered.toDataURL('image/png');

      // Dimensions A4
      const pdf = new jsPDF({
        orientation: 'landscape', // ou "portrait"
        unit: 'px',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Dimensions du canvas
      const imgWidth = canvasRendered.width;
      const imgHeight = canvasRendered.height;

      // Ajustement proportionnel pour entrer dans l'A4
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      // Centrage sur la page
      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      const rawLabel: string = String(this.eltGraph || 'graph'); // fallback si vide

      // On remplace tout ce qui n'est pas lettre, chiffre, tiret ou underscore
      const safeLabel = rawLabel.replace(/[^a-zA-Z0-9-_]/g, '_');

      // Ajoute l'extension PDF
      const fileName = `${safeLabel}.pdf`;

      // Sauvegarde le PDF
      pdf.save(fileName);
    });
  }

  private initData(): void {
    this.isLoading = true;
    if (!this.data || !this.data.dureeProjet) return;
    this.anneeList = Array.from({ length: this.data.dureeProjet }, (_, i) => `${i}`);

    this.groupedElements = this.groupByNature(this.elements);
    this.groupes = this.groupedElements.map(g => ({
      nature: g.nature,
      elements: g.elements,
      totauxAnnee: this.anneeList.map(annee =>
        g.elements.reduce((sum, elt) => {
          const idx = elt.annee?.indexOf(annee) ?? -1;
          const montant = idx >= 0 ? Number(elt.montant?.[idx] ?? 0) : 0;
          return sum + (isNaN(montant) ? 0 : montant);
        }, 0)
      ),
      totalNature: g.elements.reduce((acc, e) => {
        const total = Number(this.getTotalByElt(e) ?? 0);
        return acc + (isNaN(total) ? 0 : total);
      }, 0)
    }));


    if(this.elements_IN){
      this.groupes_IN = this.groupByNature(this.elements_IN).map(g => ({
        nature: g.nature,
        elements: g.elements,
        totauxAnnee: this.anneeList.map(annee =>
          g.elements.reduce((sum, elt) => {
            const idx = elt.annee?.indexOf(annee) ?? -1;
            const montant = idx >= 0 ? Number(elt.montant?.[idx] ?? 0) : 0;
            return sum + (isNaN(montant) ? 0 : montant);
          }, 0)
        ),
        totalNature: g.elements.reduce((acc, e) => {
          const total = Number(this.getTotalByElt(e) ?? 0);
          return acc + (isNaN(total) ? 0 : total);
        }, 0)
      }));
    }
    if(this.elements_OUT){
      this.groupes_OUT = this.groupByNature(this.elements_OUT).map(g => ({
        nature: g.nature,
        elements: g.elements,
        totauxAnnee: this.anneeList.map(annee =>
          g.elements.reduce((sum, elt) => {
            const idx = elt.annee?.indexOf(annee) ?? -1;
            const montant = idx >= 0 ? Number(elt.montant?.[idx] ?? 0) : 0;
            return sum + (isNaN(montant) ? 0 : montant);
          }, 0)
        ),
        totalNature: g.elements.reduce((acc, e) => {
          const total = Number(this.getTotalByElt(e) ?? 0);
          return acc + (isNaN(total) ? 0 : total);
        }, 0)
      }));
    }
    if(this.elts_DEP){
      this.groupes_DEP = this.groupByNature(this.elts_DEP).map(g => ({
        nature: g.nature,
        elements: g.elements,
        totauxAnnee: this.anneeList.map(annee =>
          g.elements.reduce((sum, elt) => {
            const idx = elt.annee?.indexOf(annee) ?? -1;
            const montant = idx >= 0 ? Number(elt.montant?.[idx] ?? 0) : 0;
            return sum + (isNaN(montant) ? 0 : montant);
          }, 0)
        ),
        totalNature: g.elements.reduce((acc, e) => {
          const total = Number(this.getTotalByElt(e) ?? 0);
          return acc + (isNaN(total) ? 0 : total);
        }, 0)
      }));
    }

    this.isLoading = false;

    this.calculerTotaux();
    this.loadRegleCalcul();
    //this.calculerDiffCumulMontants();
  }

  loadRegleCalcul() {
    this.isLoading = true;

    forkJoin({
      sousNatures: this.sousNatureService.listSousNatures(1, 1000, "IND"),
      natures: this.natureService.listNatures(1, 1000, "IND"),
      regleCalculs: this.regleCalculService.listRegleCalculs(0, 1000),
    }).subscribe({
      next: ({ sousNatures, natures, regleCalculs }) => {

        if (sousNatures && sousNatures.success && sousNatures.data && natures && natures.success && natures.data) {
            sousNatures = sousNatures.data.sous_natures.map((s: SousNature) => SousNatureModel.fromResponse(s));
            const listNatures = natures.data.base_natures.map(
              (s: Nature) => NatureModel.fromResponse(s)
            );
            //natures = natures.data.base_natures.map((s: Nature) => NatureModel.fromResponse(s));
            regleCalculs = regleCalculs.data.regles_calcul.map((s: RegleCalcul) => RegleCalculModel.fromResponse(s));
            //this.newRegleCalculs = this.mergeUnique(this.newRegleCalculs, this.regleCalculs, n => n.idSousNature);
            this.loadIndCle(listNatures, sousNatures, regleCalculs);
            //this.cdr.detectChanges();

            this.isLoading = false;
            this.cdr.detectChanges();
          } else {
            //
          }
          this.isLoading = false;

      },
      error: () => (this.isLoading = false)
    });
  }

  loadIndCle(
    natures: Nature[],
    sousNatures: SousNature[],
    regleCalculs: RegleCalcul[]
  ) {
    this.isLoading = true;

    const nbAnnees = this.anneeList?.length ?? 0;
    this.groupes_IND_CLE = [];
    //console.log("loadIndCle rg= ", regleCalculs)

    console.log("loadIndCle natures= ", natures)
    natures.forEach((elt: Nature) => {

      console.log("loadIndCle elt= ", elt)

      const idsRegles = regleCalculs.map(r => r.idSousNature);

      const sousNaturesRegle = sousNatures.filter(sn =>
        sn.idNature === elt.idNature &&
        idsRegles.includes(sn.idSousNature)
      );

      // --- 3) Création des groupes via règles ---
      const newElements: GroupeElt_IND_CLE[] = this.groupes
      .filter(g => g.nature.idNature === elt.idNature)
      .flatMap(g =>
        g.elements
          .filter(e => e.sousNature_Nature?.sousNature.idSousNature
                  && !idsRegles.includes(e.sousNature_Nature.sousNature.idSousNature))
          .map(e => {
            // Adapter totauxAnnee à nbAnnees
            const totauxAnnee: number[] = new Array(nbAnnees).fill(0);
            for (let i = 0; i < Math.min(nbAnnees, e.montant.length); i++) {
              totauxAnnee[i] = e.montant[i];
            }

            return {
              sousNature: e.sousNature_Nature!.sousNature,
              elements: [e],
              totauxAnnee,
              totalNature: totauxAnnee.reduce((a, b) => a + b, 0)
            };
          })
      );


      // --- 3) Création des groupes via règles ---
      const newElementsRg: GroupeElt_IND_CLE[] = sousNaturesRegle.map(sn => {
        // Récupérer la formule correspondante
        const regle = regleCalculs.find(r => r.idSousNature === sn.idSousNature);
        const formule = regle?.detailRegleCalcul ?? "";
        return {
          sousNature: sn,
          elements: [],
          totauxAnnee: formule !== ""
            ? this.evalVecteur(formule, [...this.groupes, ...this.groupes_IN, ...this.groupes_OUT, ...this.groupes_DEP])
            : new Array(nbAnnees).fill(0),
          totalNature: 0,
          idSousNature: sn.idSousNature
        };
      });

      // --- 4) Ajout dans le tableau final ---
      this.groupes_IND_CLE.push({
        nature: elt,
        elements: [...newElements, ...newElementsRg],
        totauxAnnee: new Array(nbAnnees).fill(0),
        totalNature: 0,
      });

      console.log("loadIndCle ind= ", this.groupes_IND_CLE)
    });
    this.tousElements = this.groupes_IND_CLE.flatMap(groupe =>
      groupe.elements.map(e => ({
        id: e.sousNature.idSousNature,
        nom: e.sousNature.nomSousNature
      }))
    );
  }

  evalVecteur(expression: string, groupes: GroupeElt[]): number[] {
    const nbAnnees = this.anneeList?.length ?? 0;

    console.log("Expression groupes :", groupes);
    // 1️⃣ Transformer l'expression : SOMME, CUMMUL et ids
    let transformed = this.formuleAvecVecteurs(expression, groupes);

    console.log("Expression originale :", expression);
    console.log("Expression transformée :", transformed);

    let result: any;
    try {
      // 2️⃣ Évaluer l'expression
      result = evaluate(transformed);

      // 3️⃣ Convertir DenseMatrix en tableau JS si besoin
      if (result && typeof result === "object" && "toArray" in result) {
        result = (result as any).toArray();
      }

      // 4️⃣ Si résultat scalaire mais attendu vecteur, répéter
      if (typeof result === "number") {
        result = new Array(nbAnnees).fill(result);
      }

    } catch (err: any) {
      console.error("Erreur dans l'évaluation vecteur :", transformed, err);
      result = new Array(nbAnnees).fill(0);
    }

    // 6️⃣ Fallback si pas un tableau
    if (!Array.isArray(result)) {
      result = new Array(nbAnnees).fill(0);
    }

    return result as number[];
  }

  remplacerIdsParVecteurs(expr: string, groupes: GroupeElt[], nbAnnees: number): string {
    //return expr.replace(/\bid(\d+)\b/g, (_, idStr) => {
    return expr.replace(/\bid(-?\d+)\b/g, (_, idStr) => {
      console.log("id +: ", idStr)
      const idNum = Number(idStr);
      if(idNum === -1 || idNum === -2){
        const tousElements = groupes.flatMap(g => g.elements);
        const elt = tousElements.find(g => g.sousNature_Nature?.sousNature?.idSousNature === idNum);

        console.log("id e: ", elt)

        if (elt) {
          return `[${elt.montant.join(',')}]`;
        }

      }else{
        const groupe = groupes.find(g => g.nature.idNature === idNum);

        if (groupe && groupe.totauxAnnee.length) {
          return `[${groupe.totauxAnnee.join(',')}]`;
        }
      }

      // Si le groupe n'existe pas → tableau de 0
      return `[${new Array(nbAnnees).fill(0).join(',')}]`;
    });
  }

  calculerSommeExpression(expr: string, groupes: GroupeElt[]): number {
    try {
      const nbAnnees = groupes[0]?.totauxAnnee?.length ?? 0;

      // Remplacer les idXX par la somme des totaux
      const exprAvecSommes = expr.replace(/\bid(\d+)\b/g, (_, idStr) => {
        const idNum = Number(idStr);
        const groupe = groupes.find(g => g.nature.idNature === idNum);
        if (groupe) return String(groupe.totauxAnnee.reduce((a,b) => a+b, 0));
        return "0";
      });

      return evaluate(exprAvecSommes);
    } catch(err) {
      console.error("Erreur SOMME:", expr, err);
      return 0;
    }
  }

  calculerCumulExpression(expr: string, groupes: GroupeElt[]): number[] {
    const nbAnnees = groupes[0]?.totauxAnnee?.length ?? 0;

    try {
      // 1️⃣ Remplacer les idXX par vecteurs
      const exprAvecVecteurs = this.remplacerIdsParVecteurs(expr, groupes, nbAnnees);
      console.log("exprAvecVecteurs = ", exprAvecVecteurs)

      // 2️⃣ Évaluer la formule vectorielle (mathjs supporte les opérations élément par élément)
      let vecteur: any = evaluate(exprAvecVecteurs);

      // 3️⃣ Convertir DenseMatrix en array si besoin
      if (vecteur && typeof vecteur === "object" && "toArray" in vecteur) {
        vecteur = (vecteur as any).toArray();
      }

      // 4️⃣ Si ce n'est pas un tableau, fallback
      if (!Array.isArray(vecteur)) vecteur = new Array(nbAnnees).fill(0);

      // 5️⃣ Calcul du cumul
      const cumul: number[] = [];
      vecteur.forEach((val: number, i: number) => {
        cumul[i] = (i === 0 ? val : cumul[i-1] + val);
      });

      return cumul;
    } catch(err) {
      console.error("Erreur CUMMUL:", expr, err);
      return new Array(nbAnnees).fill(0);
    }
  }

  remplacerAnnee(expr: string, nbAnnees: number): string {
    const vecteurAnnees = `[${Array.from({length: nbAnnees}, (_, i) => i).join(',')}]`;
    return expr.replace(/\bANNEE\b/g, vecteurAnnees);
  }

  formuleAvecVecteurs(expr: string, groupes: GroupeElt[]): string {
    const nbAnnees = groupes[0]?.totauxAnnee?.length ?? 0;

    // Gérer SOMME(...)
    //expr = expr.replace(/SOMME\((.*?)\)/gi, (_, inner) => this.calculerSommeExpression(inner, groupes).toString());

    let info1 = this.extraireOperateur(expr, "SOMME(");
    while (info1) {
      const valeur = this.calculerSommeExpression(info1.inner, groupes);
      expr = expr.slice(0, info1.start) + valeur + expr.slice(info1.end);
      info1 = this.extraireOperateur(expr, "SOMME("); // suivant
    }


    let info = this.extraireOperateur(expr, "CUMMUL(");
    while (info) {
      const cumulVect = this.calculerCumulExpression(info.inner, groupes);
      expr = expr.slice(0, info.start) + `[${cumulVect.join(",")}]` + expr.slice(info.end);
      info = this.extraireOperateur(expr, "CUMMUL("); // chercher le suivant
    }

    expr = this.remplacerAnnee(expr, nbAnnees);

    // Remplacer les idXX restants
    expr = this.remplacerIdsParVecteurs(expr, groupes, nbAnnees);

    //expr = expr.replace(/\]\s*\^\s*(\d+(\.\d+)?)/g, '].^$1');

    return expr;
  }

  extraireOperateur(expr: string, operateur: string): { inner: string, start: number, end: number } | null {
    const start = expr.indexOf(operateur);
    console.log("extraireOperateur = ", operateur, " - ", operateur.length)
    if (start === -1) return null;

    let open = 1;
    let i = start + operateur.length; // position après "CUMMUL("
    while (i < expr.length && open > 0) {
      if (expr[i] === "(") open++;
      else if (expr[i] === ")") open--;
      i++;
    }

    if (open === 0) {
      return {
        inner: expr.slice(start + operateur.length, i - 1),
        start,
        end: i
      };
    } else {
      console.error("Parenthèses mal fermées dans CUMMUL");
      return null;
    }
  }

  getRowSpan(groupes: any[]): number {
    // Nombre total de lignes à afficher (groupes + leurs éléments)
    return groupes.reduce((total, g) => total + 1 + (g.elements?.length ?? 0), 0);
  }

  private calculerTotaux(): void {
    const nbAnnees = this.anneeList?.length ?? 0;
    const calculTotauxOptimise = (elements: Element[]) => {
      const totauxParAnnee = new Array(nbAnnees).fill(0);
      let totalGlobal = 0;

      if (!elements?.length || nbAnnees === 0) {
        return { totauxParAnnee, totalGlobal, cumulMontants: totauxParAnnee.slice() };
      }

      for (const elt of elements) {
        if (!elt?.annee || !elt?.montant) continue;

        const len = Math.min(elt.annee.length, elt.montant.length);

        for (let i = 0; i < len; i++) {
          const annee = elt.annee[i];
          const montant = Number(elt.montant[i]) || 0;

          const idx = this.anneeList.indexOf(annee);
          if (idx !== -1) totauxParAnnee[idx] += montant;
        }

        totalGlobal += Number(this.getTotalByElt(elt)) || 0;
      }

      // ⚡ Calcul du cumul optimisé
      const cumulMontants = new Array(nbAnnees);
      let cumul = 0;
      for (let i = 0; i < nbAnnees; i++) {
        cumul += Number(totauxParAnnee[i]) || 0;
        cumulMontants[i] = cumul;
      }

      return { totauxParAnnee, totalGlobal, cumulMontants };
    };


    // Calcul principal
    const resPrincipaux = calculTotauxOptimise(this.elements);
    this.totauxParAnnee = resPrincipaux.totauxParAnnee;
    this.totalGlobal = resPrincipaux.totalGlobal;
    this.cumulMontants = resPrincipaux.cumulMontants;

    // Calcul investissement
    if (this.elements_CON?.length) {
      const resInv = calculTotauxOptimise(this.elements_CON);
      this.totauxParAnnee_CON = resInv.totauxParAnnee;
      this.totalGlobal_CON = resInv.totalGlobal;
      this.cumulMontants_CON = resInv.cumulMontants;
    } else {
      this.totauxParAnnee_CON = new Array(nbAnnees).fill(0);
      this.totalGlobal_CON = 0;
      this.cumulMontants_CON = new Array(nbAnnees).fill(0);
    }

    if (this.elements_IN?.length) {
      const resInv = calculTotauxOptimise(this.elements_IN);
      this.totauxParAnnee_IN = resInv.totauxParAnnee.map(v => Number(v));
      this.totalGlobal_IN = Number(resInv.totalGlobal);
      this.cumulMontants_IN = resInv.cumulMontants.map(v => Number(v));
    } else {
      this.totauxParAnnee_IN = new Array(nbAnnees).fill(0);
      this.totalGlobal_IN = 0;
      this.cumulMontants_IN = new Array(nbAnnees).fill(0);
    }

    if (this.elements_OUT?.length) {
      const resInv = calculTotauxOptimise(this.elements_OUT);
      this.totauxParAnnee_OUT = resInv.totauxParAnnee.map(v => Number(v));
      this.totalGlobal_OUT = Number(resInv.totalGlobal);
      this.cumulMontants_OUT = resInv.cumulMontants.map(v => Number(v));
    } else {
      this.totauxParAnnee_OUT = new Array(nbAnnees).fill(0);
      this.totalGlobal_OUT = 0;
      this.cumulMontants_OUT = new Array(nbAnnees).fill(0);
    }

    if (this.elts_DEP?.length) {
      const resInv = calculTotauxOptimise(this.elts_DEP);
      this.totauxParAnnee_DEP = resInv.totauxParAnnee.map(v => Number(v));
      this.totalGlobal_DEP = Number(resInv.totalGlobal);
      this.cumulMontants_DEP = resInv.cumulMontants.map(v => Number(v));
    } else {
      this.totauxParAnnee_DEP = new Array(nbAnnees).fill(0);
      this.totalGlobal_DEP = 0;
      this.cumulMontants_DEP = new Array(nbAnnees).fill(0);
    }

    const cumulA = this.cumulMontants ?? [];
    const cumulB = this.cumulMontants_CON ?? [];
    const len = Math.max(cumulA.length, cumulB.length);

    this.diffCumulMontants = Array.from({ length: len }, (_, i) => {
      const a = Number(cumulA[i]) || 0;
      const b = Number(cumulB[i]) || 0;
      return a - b;
    });
    this.diffCumulMontants = this.diffCumulMontants.map(v => Number(v));
  }


  groupByNature(elements: Element[]): { nature: Nature; elements: Element[] }[] {
    /*
    let fusion: Element[] = [];
    if(!this.elts_regleCalcul){
      fusion = [...elements];
    }else{
      fusion = [...elements, ...this.elts_regleCalcul];
    }
    */
    const grouped = elements.reduce((acc, element) => {
      const nature = element.sousNature_Nature?.nature;
      if (!nature) return acc;

      const key = nature.idNature; // ou nature.nom selon ton besoin

      if (!acc[key]) {
        acc[key] = { nature, elements: [] };
      }

      acc[key].elements.push(element);
      return acc;
    }, {} as Record<number, { nature: Nature; elements: Element[] }>);

    // Convertir l’objet en tableau
    return Object.values(grouped);
  }

  ngOnInit(): void {
    this.initData();
  }

  ngOnChanges(): void {
    this.initData();
  }

  trackByIndex(index: number): number {
    return index;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  getTotalByElt(elt: Element): number {
    return elt.montant?.reduce((a, b) => a + (Number(b) || 0), 0) ?? 0;
    //elt.montant.reduce((a, b) => a + b, 0);
  }

  getTotalByNature(elements: Element[]): number {
    return elements.reduce((acc, e) => {
        const total = Number(this.getTotalByElt(e) ?? 0);
        return acc + (isNaN(total) ? 0 : total);
      }, 0)
      //elements.reduce((acc, e) => acc + this.getTotalByElt(e), 0);
  }

  buildSousNatureNature(): void {
    forkJoin({
      sousNatures: this.sousNatureService.listSousNatures(0, 1),
      natures: this.natureService.listNatures(1, 1000)
    }).subscribe({
      next: ({ sousNatures, natures }) => {
        sousNatures = sousNatures.data.sous_natures;
        //natures = natures.data.base_natures ;// .base_natures;
        const listNatures = natures.data.base_natures.map(
              (s: Nature) => NatureModel.fromResponse(s)
            );
        this.buildSousNatureNature();
        this.sousNature_natures = sousNatures.map((sn: SousNature) => {
          const nature = listNatures.find((n: { idNature: number; }) => n.idNature === sn.idNature);
          return { sousNature: sn as SousNature, nature: nature ?? {} as Nature };
        });
        //this.cdr.detectChanges();
      },
      error: () => (false)
    });
  }

  groupElementsParNature(elements: Element[]) {
    if (!elements?.length) return { groupes: [], uniqueIdNature: [] };

    const map = new Map<number, Element[]>();

    console.log("groupElementsParNature = ", elements);

    for (const elt of elements) {
      if (!map.has(elt.sousNature_Nature?.nature.idNature || -1)) {
        map.set(elt.sousNature_Nature?.nature.idNature || -1, []);
      }
      map.get(elt.sousNature_Nature?.nature.idNature || -1)!.push(elt);
    }

    const groupes = Array.from(map.entries()).map(([idNature, elts]) => ({
      nature: elts[0].sousNature_Nature?.nature,
      elements: elts,
    }));

    const uniqueIdNature = Array.from(map.keys());

    return { groupes, uniqueIdNature };
  }
}
