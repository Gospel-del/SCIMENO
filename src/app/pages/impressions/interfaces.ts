import { Emprunt } from "../emprunts/emprunt";
import { Nature } from "../natures/nature";
import { OperationPeriod } from "../projets/operation-periode";
import { ProjetOperationModel } from "../projets/projet-operation";
import { RevenuExploitation } from "../projets/revenu-exploitation";
import { SousNature } from "../sous-natures/sous-nature";

export interface Element {
  id: number;
  nom: string;
  data?: ProjetOperationModel|Emprunt|any;
  sousNature_Nature?: SousNature_Nature;
  //idSousNature: number;
  //nomNature?: string;
  annee: string[];
  montant: number[];
  autreElts?: AmortisEmprunt[]|OperationPeriod[]|any[];
}

export interface SousNature_Nature{
  sousNature: SousNature;
  nature: Nature;
}

export interface InfoNature {
  idNature: number;
  nomNature: string;
}

export interface RevenuProjet {
  id : number;
  nom : string;
  idNature: number;
  data : RevenuExploitation;
  surfaceConcerneeOpts : number;
  loyerOpts : number;
}

export interface CroissanceVacance {
  id: number;
  nom: string;
  value : number;
}

export interface AmortisEmprunt {
  interet: number;
  amortiCapital: number;
  annuite: number;
  valeurNet: number;
}
