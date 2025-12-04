// src/app/models/combos.ts

import { ComboBoxProjet, TabConfig } from "./interface-projet";


// Mode d'amortissements
export const ModeAmortissements: ComboBoxProjet[] = [
  { id: 1, name: 'Annuité constante' },
  { id: 2, name: 'Amortissement constant' },
  { id: 3, name: 'Amortissement différé' },
  { id: 4, name: 'Amortissement infini' },
];

// Types de projets
export const TypeProjets: ComboBoxProjet[] = [
  { id: 1, name: 'Achat immeuble ancien (rénovation / réhabilitation)' },
  { id: 2, name: 'Achat terrain + construction' },
  { id: 3, name: 'Achat immeuble neuf' },
  { id: 4, name: 'Achat revente' },
  { id: 5, name: 'Achat terrain pour division parcellaire' },
  { id: 6, name: 'Achat pour mise en location sans travaux' },
];

// Modes d'exploitations
export const ModeExploitations: ComboBoxProjet[] = [
  { id: 1, name: 'Location nue' },
  { id: 2, name: 'Location meublée' },
  { id: 3, name: 'Exploitation mixte' },
  { id: 4, name: 'Vente en bloc ou à la découpe' },
  { id: 5, name: 'Mise à disposition gratuite' },
  { id: 6, name: 'Division parcellaire' },
  { id: 7, name: 'Exploitation propre' },
];

export enum FicheImpression {
  REV = "Revenus prévisionnels",
  DEP = "Dépenses d'exploitation",
  EMP = "Amortissement emprunt",
  CON = "Coût des investissements",
  FIN = "Plan de financement",
  TRE = "Plan de trésorerie",
  CRT = "Compte de résultat",
  IND = "Indicateurs clés",
}

export enum ListTypeGraph {
  line = "Line",
  bar = "Bar",
  pie = "Pie",
}

export const TABS: TabConfig[] = [
  {
    key: 'REV',
    title: 'Liste des revenus',
    dataList: [],
    subDataList: [
      {
        key: 'VAC',
        title: 'Taux de vacance prévisionnel (%)',
        dataList: [], // this.croissanceVacance
        isLoading: false, // this.isLoading1
        columns: [
          { header: 'ID', type: 'text', model: 'id' },
          { header: 'Année', type: 'text', model: 'nom' },
          { header: 'Valeur (%)', type: 'number', model: 'value', max: 100 }
        ]
      }
    ],
    isLoading: false,
    columns: [
      { header: 'ID', type: 'text', model: 'id' },
      { header: 'Type de revenu', type: 'text', model: 'nom' },
      {
        header: 'Surface concernée', type: 'text', model: 'id',
        subColumns: [
          { header: 'Avant Optimisation', type: 'number', model: 'data.surface' },
          { header: 'Après Optimisation', type: 'text', model: 'surfaceOpt', isOpt: true }
        ]
      },
      {
        header: 'Loyer (XAF/m2/mois)', type: 'text', model: 'id',
        subColumns: [
          { header: 'Avant Optimisation', type: 'number', model: 'data.loyer' },
          { header: 'Après Optimisation', type: 'text', model: 'loyerOpt', isOpt: true }
        ]
      }
    ]
  },
  {
    key: 'DEP',
    title: 'Liste des postes',
    dataList: [],
    subDataList: [
      {
        key: 'IND',
        title: 'Indexation annuelle estime (%) :',
        dataList: [], // this.croissanceVacance
        isLoading: false, // this.isLoading1
        columns: [
          { header: 'ID', type: 'text', model: 'id' },
          { header: 'Année', type: 'text', model: 'nom' },
          { header: 'Valeur (%)', type: 'number', model: 'value', max: 100 }
        ]
      }
    ],
    isLoading: false,
    columns: [
      { header: 'ID', type: 'text', model: 'id' },
      { header: 'Poste', type: 'text', model: 'nom' },
      {
        header: 'Montant annuel', type: 'text', model: 'id',
        subColumns: [
          { header: 'Estimé', type: 'number', model: 'data.montant' },
          { header: 'Après optimisation', type: 'text', model: 'montantOpt', isOpt: true }
        ]
      }
    ]
  },
  {
    key: 'EMP',
    title: 'Liste des emprunts',
    dataList: [], // this.empruntProjets
    isLoading: false,
    isUpdate: true,
    columns: [
      { header: 'ID', type: 'text', model: 'id' },
      { header: 'Organisme', type: 'text', model: 'data.organismePreneur' },
      { header: 'Montant', type: 'text', model: 'data.montantEmprunte' },
      { header: 'Durée', type: 'text', model: 'data.dureeCredit' },
      { header: 'Taux', type: 'text', model: 'data.tauxInteretAnnuel' },
      { header: 'Mode d\'amortissement', type: 'text', model: 'nameModeAmorti' },
      { header: 'Date de début', type: 'text', model: 'data.dateDebutPret' },
      { header: 'Date 1ère échéance', type: 'text', model: 'data.datePremiereEcheance' },
      //{ header: 'Option', type: 'custom' }
    ]
  },
  {
    key: 'INV',
    title: 'Investissements prévisionnels',
    dataList: [], // this.invPrevProjets
    isLoading: false, // this.isLoading3
    columns: [],
  },
  {
    key: 'FDR',
    title: 'Fonds de roulement',
    dataList: [], // this.invPrevProjets
    isLoading: false, // this.isLoading3
    columns: [
      { header: 'Nom', type: 'text', model: 'nom' },
      {
        header: 'Valeur avant optimisation / Valeur après optimisation',
        type: 'text',
        subColumns: [] // Ces colonnes seront générées dynamiquement selon la durée du projet
      },
      //{ header: 'Option', type: 'custom' }
    ]
  },
  {
    key: 'FIN',
    title: 'Liste des financements',
    dataList: [], // this.financeProjets
    isLoading: false, // this.isLoading4
    columns: [
      { header: 'Nom', type: 'text', model: 'nom' },
      {
        header: 'Valeur avant optimisation / Valeur après optimisation',
        type: 'text',
        subColumns: [] // Colonnes dynamiques selon durée du projet
      },
      //{ header: 'Option', type: 'custom' }
    ]
  },
  {
    key: 'TRE',
    title: 'Liste des flux de trésorerie',
    dataList: [], // this.tresorProjets
    isLoading: false,
    columns: [
      { header: 'Nom', type: 'text', model: 'nom' },
      {
        header: 'Valeur avant optimisation \n Valeur après optimisation',
        type: 'text',
        subColumns: [] // Colonnes dynamiques
      },
      //{ header: 'Option', type: 'custom' }
    ]
  },
  {
    key: 'DOC',
    title: 'Liste des documents disponibles',
    dataList: [], // this.documentProjet
    isLoading: false,
    columns: [
      { header: 'ID', type: 'text', model: 'id' },
      { header: 'Nom', type: 'text', model: 'nom' },
      //{ header: 'Option', type: 'custom' }
    ]
  }
];


