import { DepenseExploitation } from "./depenses-exploitation";
import { RevenuExploitation } from "./revenu-exploitation";

export interface RevenuProjet {
  id: number;
  nom: string;
  idNature?: number;
  data : RevenuExploitation;
  surfaceConcerneeOpts : number;
  loyerOpts : number;
}

export interface PosteProjet {
  id: number;
  nom: string;
  idNature?: string;
  data : DepenseExploitation;
  montantOpts : number;
}

export interface InfoSupProjet {
  id: number;
  nom: string;
  idNature?: number;
  data : any;
  valeurs: number[];
  valeursOpts: number[];
}

export interface DocumentProjet {
  id: number;
  nom: string;
  data : any;
}

export interface CroissanceVacance {
  id: number;
  nom: string;
  value : number;
}

export interface TabConfig {
  key: string;                   // id de l'onglet
  title: string;                // titre affiché
  dataList: any[];              // liste des éléments à afficher
  subDataList?: TabConfig[];              // liste des éléments à afficher
  isLoading: boolean;           // indicateur de chargement
  isUpdate?: boolean;
  columns: ColumnConfig[]|null;      // configuration des colonnes
  addAction?: () => void;       // fonction pour le bouton ajouter
  deleteAction?: (elt: any) => void; // fonction pour supprimer un élément
}

export interface ColumnConfig {
  header: string;
  type: 'text' | 'number' | 'custom'| 'chaine';
  colspan?: number;
  model?: string;               // nom du modèle pour ngModel
  optModel?: string;
  max?: number;                 // max pour input number
  placeholder?: string;
  isOpt?: boolean;              // afficher valeur après optimisation
  subColumns?: ColumnConfig[];
}

export interface ComboBoxProjet {
  id: number;
  name: string;
}
