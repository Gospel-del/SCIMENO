export interface Nature {
  idNature : number;
  nomNature  : string;
  typeNature : string;
  detailNature : string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface NatureCreate {
  nomNature  : string;
  typeNature : string;
  detailNature : string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface NatureUpdate {
  idNature: string;
  nomNature : string;
  typeNature : string;
  detailNature : string;
  status: boolean;
}

export interface NatureResponse {
  idNature: number;
  nomNature : string;
  typeNature : string;
  detailNature : string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListNatures {
  data: {
    base_natures: Nature[];
    total: number;
    page: number;
    per_page: number;
    total_pages: string;
    actif_only: boolean;
  };
  message: string;
  success: boolean;
}

export interface NatureSearchResponse {
  data: NatureResponse[];
  message: string;
  success: boolean;
}

export class NatureModel {
  idNature: number;
  nomNature : string;
  typeNature : string;
  detailNature : string;
  status: boolean;
  created_at: string;
  updated_at: string;

  constructor(data: Nature) {
    this.idNature = data.idNature;
    this.nomNature = data.nomNature;
    this.typeNature = data.typeNature;
    this.detailNature = data.detailNature;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Convertit l'objet Nature en dictionnaire (équivalent de to_dict() en Python)
   */
  toDict(): NatureResponse {
    return {
      idNature: this.idNature,
      nomNature: this.nomNature,
      typeNature: this.typeNature,
      detailNature: this.detailNature,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Retourne le nom complet de le Nature
   */
  getFullName(): string {
    return `${this.nomNature}`;
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
  updateInfo(updateData: Partial<NatureUpdate>): void {
    if (updateData.nomNature !== undefined) this.nomNature = updateData.nomNature;
    if (updateData.status !== undefined) this.status = updateData.status;
    if (updateData.detailNature !== undefined) this.detailNature = updateData.detailNature;
    if (updateData.typeNature !== undefined) this.typeNature = updateData.typeNature;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Valide les données de e Nature
   */
  isValidate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.nomNature || this.nomNature.trim().length === 0) {
      errors.push('Le nom est requis');
    }
    if (!this.typeNature || this.typeNature.trim().length === 0) {
      errors.push('Le type est requis');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Crée un nouvel Nature à partir des données de création
   */
  static fromCreateData(data: NatureCreate): NatureModel {
    const now = new Date().toISOString();
    return new NatureModel({
      idNature: 0, // Sera défini par la base de données
      nomNature: data.nomNature,
      typeNature: data.typeNature,
      detailNature: data.detailNature,
      status: data.status ?? true,
      created_at: now,
      updated_at: now
    });
  }

  /**
   * Crée un Nature à partir des données de réponse API
   */
  static fromResponse(data: NatureResponse): NatureModel {
    return new NatureModel({
      idNature: data.idNature,
      nomNature: data.nomNature,
      typeNature: data.typeNature,
      detailNature: data.detailNature,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
}


/**
 * Constantes pour les statuss Nature
 */
export const NATURE_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

export type NatureStatus = typeof NATURE_STATUS[keyof typeof NATURE_STATUS];
