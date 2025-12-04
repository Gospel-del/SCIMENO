export interface SousNature {
  idSousNature : number;
  idNature : number;
  nomSousNature  : string;
  detailSousNature : string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface SousNatureCreate {
  idNature : number;
  nomSousNature  : string;
  detailSousNature : string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface SousNatureUpdate {
  idSousNature: string;
  idNature : number;
  nomSousNature : string;
  detailSousNature : string;
  status: boolean;
}

export interface SousNatureResponse {
  idSousNature: number;
  idNature : number;
  nomSousNature : string;
  detailSousNature : string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListSousNatures {
  data: {
    sous_natures: SousNature[];
    total: number;
    page: string;
    per_page: number;
    total_pages: string;
  };
  message: string;
  success: boolean;
}

export interface SousNatureSearchResponse {
  data: SousNatureResponse[];
  message: string;
  success: boolean;
}

export class SousNatureModel {
  idSousNature: number;
  idNature : number;
  nomSousNature : string;
  detailSousNature : string;
  status: boolean;
  created_at: string;
  updated_at: string;

  constructor(data: SousNature) {
    this.idSousNature = data.idSousNature;
    this.idNature = data.idNature;
    this.nomSousNature = data.nomSousNature;
    this.detailSousNature = data.detailSousNature;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Convertit l'objet SousNature en dictionnaire (équivalent de to_dict() en Python)
   */
  toDict(): SousNatureResponse {
    return {
      idSousNature: this.idSousNature,
      idNature: this.idNature,
      nomSousNature: this.nomSousNature,
      detailSousNature: this.detailSousNature,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Retourne le nom complet de le Nature
   */
  getFullName(): string {
    return `${this.nomSousNature}`;
  }

  /**
   * Vérifie si le Nature est actif
   */
  isActive(): boolean {
    return this.status;
  }

  /**
   * Désactive e Nature (soft delete)
   */
  softDelete(): void {
    this.status = false;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Met à jour les informations de e Nature
   */
  updateInfo(updateData: Partial<SousNatureUpdate>): void {
    if (updateData.idNature !== undefined) this.idNature = updateData.idNature;
    if (updateData.nomSousNature !== undefined) this.nomSousNature = updateData.nomSousNature;
    if (updateData.status !== undefined) this.status = updateData.status;
    if (updateData.detailSousNature !== undefined) this.detailSousNature = updateData.detailSousNature;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Valide les données de e Nature
   */
  isValidate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.nomSousNature || this.nomSousNature.trim().length === 0) {
      errors.push('Le nom est requis');
    }
    if (!this.idNature) {
      errors.push('La nature est requise');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Crée un nouvel Nature à partir des données de création
   */
  static fromCreateData(data: SousNatureCreate): SousNatureModel {
    const now = new Date().toISOString();
    return new SousNatureModel({
      idSousNature: 0, // Sera défini par la base de données
      idNature: data.idNature,
      nomSousNature: data.nomSousNature,
      detailSousNature: data.detailSousNature,
      status: data.status ?? true,
      created_at: now,
      updated_at: now
    });
  }

  /**
   * Crée un Nature à partir des données de réponse API
   */
  static fromResponse(data: SousNatureResponse): SousNatureModel {
    return new SousNatureModel({
      idSousNature: data.idSousNature,
      idNature: data.idNature,
      nomSousNature: data.nomSousNature,
      detailSousNature: data.detailSousNature,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
}


/**
 * Constantes pour les statuss Nature
 */
export const SOUSNATURE_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

export type SousNatureStatus = typeof SOUSNATURE_STATUS[keyof typeof SOUSNATURE_STATUS];
