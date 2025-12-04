import { RegleCalculLog } from "./regle-calcul-log";

export interface RegleCalcul {
  idRegleCalcul : number;
  idSousNature  : number;
  typeCalcul : string;
  tauxRegleCalcul: number;
  detailRegleCalcul : string;
  sous_natures_entree: RegleCalculLog[];
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegleCalculCreate {
  idSousNature  : number;
  typeCalcul : string;
  tauxRegleCalcul: number;
  detailRegleCalcul : string;
  sous_natures_entree: RegleCalculLog[];
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegleCalculUpdate {
  idRegleCalcul: number;
  idSousNature : number;
  typeCalcul : string;
  tauxRegleCalcul: number;
  detailRegleCalcul : string;
  sous_natures_entree: RegleCalculLog[];
  status: boolean;
}

export interface RegleCalculResponse {
  idRegleCalcul: number;
  idSousNature : number;
  typeCalcul : string;
  tauxRegleCalcul: number;
  detailRegleCalcul : string;
  sous_natures_entree: RegleCalculLog[];
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListRegleCalculs {
  data: {
    regles_calcul: RegleCalcul[];
    total: number;
    page: string;
    per_page: number;
    total_pages: string;
  };
  message: string;
  success: boolean;
}

export class RegleCalculModel {
  idRegleCalcul: number;
  idSousNature : number;
  typeCalcul : string;
  tauxRegleCalcul: number;
  detailRegleCalcul : string;
  sous_natures_entree: RegleCalculLog[];
  status: boolean;
  created_at: string;
  updated_at: string;

  constructor(data: RegleCalcul) {
    this.idRegleCalcul = data.idRegleCalcul;
    this.idSousNature = data.idSousNature;
    this.typeCalcul = data.typeCalcul;
    this.tauxRegleCalcul = data.tauxRegleCalcul;
    this.detailRegleCalcul = data.detailRegleCalcul;
    this.sous_natures_entree = data.sous_natures_entree;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Convertit l'objet RegleCalcul en dictionnaire (équivalent de to_dict() en Python)
   */
  toDict(): RegleCalculResponse {
    return {
      idRegleCalcul: this.idRegleCalcul,
      idSousNature: this.idSousNature,
      typeCalcul: this.typeCalcul,
      tauxRegleCalcul: this.tauxRegleCalcul,
      detailRegleCalcul: this.detailRegleCalcul,
      sous_natures_entree: this.sous_natures_entree,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Retourne le nom complet de le RegleCalcul
   */
  getFullName(): string {
    return `${this.idSousNature}`;
  }

  /**
   * Vérifie si le RegleCalcul est actif
   */
  isActive(): boolean {
    return this.status;
  }

  /**
   * Désactive e RegleCalcul (soft delete)
   */
  softDelete(): void {
    this.status = false;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Met à jour les informations de e RegleCalcul
   */
  updateInfo(updateData: Partial<RegleCalculUpdate>): void {
    if (updateData.idSousNature !== undefined) this.idSousNature = updateData.idSousNature;
    if (updateData.status !== undefined) this.status = updateData.status;
    if (updateData.detailRegleCalcul !== undefined) this.detailRegleCalcul = updateData.detailRegleCalcul;
    if (updateData.typeCalcul !== undefined) this.typeCalcul = updateData.typeCalcul;
    if (updateData.tauxRegleCalcul !== undefined) this.tauxRegleCalcul = updateData.tauxRegleCalcul;
    if (updateData.sous_natures_entree !== undefined) this.sous_natures_entree = updateData.sous_natures_entree;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Valide les données de e RegleCalcul
   */
  isValidate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.typeCalcul || this.typeCalcul.trim().length === 0) {
      errors.push('Le type est requis');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Crée un nouvel RegleCalcul à partir des données de création
   */
  static fromCreateData(data: RegleCalculCreate): RegleCalculModel {
    const now = new Date().toISOString();
    return new RegleCalculModel({
      idRegleCalcul: 0, // Sera défini par la base de données
      idSousNature: data.idSousNature,
      typeCalcul: data.typeCalcul,
      tauxRegleCalcul: data.tauxRegleCalcul,
      detailRegleCalcul: data.detailRegleCalcul,
      sous_natures_entree: data.sous_natures_entree,
      status: data.status ?? true,
      created_at: now,
      updated_at: now
    });
  }

  /**
   * Crée un RegleCalcul à partir des données de réponse API
   */
  static fromResponse(data: RegleCalculResponse): RegleCalculModel {
    return new RegleCalculModel({
      idRegleCalcul: data.idRegleCalcul,
      idSousNature: data.idSousNature,
      typeCalcul: data.typeCalcul,
      tauxRegleCalcul: data.tauxRegleCalcul,
      detailRegleCalcul: data.detailRegleCalcul,
      sous_natures_entree: data.sous_natures_entree,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
}


/**
 * Constantes pour les statuss RegleCalcul
 */
export const REGLECACUL_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

export type RegleCalculStatus = typeof REGLECACUL_STATUS[keyof typeof REGLECACUL_STATUS];
