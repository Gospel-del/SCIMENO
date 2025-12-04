/**
 * Modèle Scenario TypeScript
 * Basé sur le modèle Python Scenario
 */

export interface Scenario {
  id_scenario: number;
  nom_scenario: string;
  coef_majoration: number;
  description?: string;
  status: boolean;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScenarioCreate {
  nom_scenario: string;
  coef_majoration: number;
  description?: string;
  actif?: boolean;
}

export interface ScenarioUpdate {
  id_scenario: number;
  nom_scenario?: string;
  coef_majoration?: number;
  description?: string;
  actif?: boolean;
}

export interface ScenarioResponse {
  id_scenario: number;
  nom_scenario: string;
  coef_majoration: number;
  description?: string;
  status: boolean;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListScenarios {
  data: {
    scenarios: ScenarioResponse[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    actif_only: boolean;
  };
  message: string;
  success: boolean;
}

export interface ScenarioSearchResponse {
  data: ScenarioResponse[];
  message: string;
  success: boolean;
}

export interface ApplyScenarioRequest {
  id_scenario: number;
  valeur_base: number;
  id_sous_nature?: number;
  sauvegarder?: boolean;
}

export interface ApplyScenarioResponse {
  data: {
    id_scenario: number;
    nom_scenario: string;
    valeur_base: number;
    coefficient_utilise: number;
    valeur_calculee: number;
    id_sous_nature?: number;
    sauvegarde: boolean;
  };
  message: string;
  success: boolean;
}

export interface ApplyMultipleScenarioRequest {
  id_scenario: number;
  valeurs_sous_natures: { [key: string]: number };
  sauvegarder?: boolean;
}

export interface ApplyMultipleScenarioResponse {
  data: {
    id_scenario: number;
    nom_scenario: string;
    resultats: { [key: string]: { valeur_base: number; coefficient_utilise: number; valeur_calculee: number } };
    total_traite: number;
    erreurs?: string[];
  };
  message: string;
  success: boolean;
}

export class ScenarioModel {
  id_scenario: number;
  nom_scenario: string;
  coef_majoration: number;
  description?: string;
  status: boolean;
  actif: boolean;
  created_at: string;
  updated_at: string;

  constructor(data: Scenario) {
    this.id_scenario = data.id_scenario;
    this.nom_scenario = data.nom_scenario;
    this.coef_majoration = data.coef_majoration;
    this.description = data.description;
    this.status = data.status;
    this.actif = data.actif;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Convertit l'objet scenario en dictionnaire
   */
  toDict(): ScenarioResponse {
    return {
      id_scenario: this.id_scenario,
      nom_scenario: this.nom_scenario,
      coef_majoration: this.coef_majoration,
      description: this.description,
      status: this.status,
      actif: this.actif,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Crée un scenario à partir des données de réponse API
   */
  static fromResponse(data: ScenarioResponse): ScenarioModel {
    return new ScenarioModel({
      id_scenario: data.id_scenario,
      nom_scenario: data.nom_scenario,
      coef_majoration: data.coef_majoration,
      description: data.description,
      status: data.status,
      actif: data.actif,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }

  /**
   * Vérifie si le scenario est actif
   */
  isActive(): boolean {
    return this.status && this.actif;
  }

  /**
   * Formate le coefficient de majoration pour l'affichage
   */
  getFormattedCoefficient(): string {
    return `${(this.coef_majoration * 100).toFixed(2)}%`;
  }
}

/**
 * Modèle ScenarioSousNature TypeScript
 * Basé sur le modèle Python ScenarioSousNature
 */

export interface ScenarioSousNature {
  id_scenario_sous_nature: number;
  id_scenario: number;
  id_sous_nature: number;
  coefficient?: number;
  valeur_calculee?: number;
  created_at: string;
  updated_at: string;
  scenario_nom?: string;
  sous_nature_nom?: string;
  sous_nature_nature_nom?: string;
}

export interface ScenarioSousNatureCreate {
  id_scenario: number;
  id_sous_nature: number;
  coefficient?: number;
  valeur_calculee?: number;
}

export interface ScenarioSousNatureUpdate {
  id_scenario_sous_nature: number;
  coefficient?: number;
  valeur_calculee?: number;
}

export interface ScenarioSousNatureResponse {
  id_scenario_sous_nature: number;
  id_scenario: number;
  id_sous_nature: number;
  coefficient?: number;
  valeur_calculee?: number;
  created_at: string;
  updated_at: string;
  scenario_nom?: string;
  sous_nature_nom?: string;
  sous_nature_nature_nom?: string;
}

export interface ListScenarioSousNatures {
  data: {
    scenario_sous_natures: ScenarioSousNatureResponse[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    filters?: {
      id_scenario?: number;
      id_sous_nature?: number;
    };
  };
  message: string;
  success: boolean;
}

export class ScenarioSousNatureModel {
  id_scenario_sous_nature: number;
  id_scenario: number;
  id_sous_nature: number;
  coefficient?: number;
  valeur_calculee?: number;
  created_at: string;
  updated_at: string;
  scenario_nom?: string;
  sous_nature_nom?: string;
  sous_nature_nature_nom?: string;

  constructor(data: ScenarioSousNature) {
    this.id_scenario_sous_nature = data.id_scenario_sous_nature;
    this.id_scenario = data.id_scenario;
    this.id_sous_nature = data.id_sous_nature;
    this.coefficient = data.coefficient;
    this.valeur_calculee = data.valeur_calculee;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.scenario_nom = data.scenario_nom;
    this.sous_nature_nom = data.sous_nature_nom;
    this.sous_nature_nature_nom = data.sous_nature_nature_nom;
  }

  /**
   * Convertit l'objet scenario_sous_nature en dictionnaire
   */
  toDict(): ScenarioSousNatureResponse {
    return {
      id_scenario_sous_nature: this.id_scenario_sous_nature,
      id_scenario: this.id_scenario,
      id_sous_nature: this.id_sous_nature,
      coefficient: this.coefficient,
      valeur_calculee: this.valeur_calculee,
      created_at: this.created_at,
      updated_at: this.updated_at,
      scenario_nom: this.scenario_nom,
      sous_nature_nom: this.sous_nature_nom,
      sous_nature_nature_nom: this.sous_nature_nature_nom
    };
  }

  /**
   * Crée un scenario_sous_nature à partir des données de réponse API
   */
  static fromResponse(data: ScenarioSousNatureResponse): ScenarioSousNatureModel {
    return new ScenarioSousNatureModel({
      id_scenario_sous_nature: data.id_scenario_sous_nature,
      id_scenario: data.id_scenario,
      id_sous_nature: data.id_sous_nature,
      coefficient: data.coefficient,
      valeur_calculee: data.valeur_calculee,
      created_at: data.created_at,
      updated_at: data.updated_at,
      scenario_nom: data.scenario_nom,
      sous_nature_nom: data.sous_nature_nom,
      sous_nature_nature_nom: data.sous_nature_nature_nom
    });
  }

  /**
   * Formate le coefficient pour l'affichage
   */
  getFormattedCoefficient(): string {
    if (this.coefficient === undefined || this.coefficient === null) {
      return 'N/A';
    }
    return `${(this.coefficient * 100).toFixed(2)}%`;
  }

  /**
   * Formate la valeur calculée pour l'affichage
   */
  getFormattedValeurCalculee(): string {
    if (this.valeur_calculee === undefined || this.valeur_calculee === null) {
      return 'N/A';
    }
    return this.valeur_calculee.toFixed(2);
  }
}
