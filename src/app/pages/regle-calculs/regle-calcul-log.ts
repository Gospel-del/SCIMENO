export interface RegleCalculLog {
  idRegleCalcul_Log : number;
  idSousNature  : number;
  idRegleCalcul : number;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegleCalculLogCreate {
  idSousNature  : number;
  idRegleCalcul : number;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegleCalculLogUpdate {
  idRegleCalcul_Log: number;
  idSousNature : number;
  idRegleCalcul : number;
  status: boolean;
}

export interface RegleCalculLogResponse {
  idRegleCalcul_Log: number;
  idSousNature : number;
  idRegleCalcul : number;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListRegleCalculLogs {
  data: {
    regleCalcul: RegleCalculLog[];
    total: number;
    page: string;
    per_page: number;
    total_pages: string;
  };
  message: string;
  success: boolean;
}

export class RegleCalculLogModel {
  idRegleCalcul_Log: number;
  idSousNature : number;
  idRegleCalcul : number;
  status: boolean;
  created_at: string;
  updated_at: string;

  constructor(data: RegleCalculLog) {
    this.idRegleCalcul_Log = data.idRegleCalcul_Log;
    this.idSousNature = data.idSousNature;
    this.idRegleCalcul = data.idRegleCalcul;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Convertit l'objet RegleCalcul en dictionnaire (équivalent de to_dict() en Python)
   */
  toDict(): RegleCalculLogResponse {
    return {
      idRegleCalcul_Log: this.idRegleCalcul_Log,
      idSousNature: this.idSousNature,
      idRegleCalcul: this.idRegleCalcul,
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
  updateInfo(updateData: Partial<RegleCalculLogUpdate>): void {
    if (updateData.idSousNature !== undefined) this.idSousNature = updateData.idSousNature;
    if (updateData.status !== undefined) this.status = updateData.status;
    if (updateData.idRegleCalcul !== undefined) this.idRegleCalcul = updateData.idRegleCalcul;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Valide les données de e RegleCalcul
   */
  isValidate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.idRegleCalcul !== 0) {
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
  static fromCreateData(data: RegleCalculLogCreate): RegleCalculLogModel {
    const now = new Date().toISOString();
    return new RegleCalculLogModel({
      idRegleCalcul_Log: 0, // Sera défini par la base de données
      idSousNature: data.idSousNature,
      idRegleCalcul: data.idRegleCalcul,
      status: data.status ?? true,
      created_at: now,
      updated_at: now
    });
  }

  /**
   * Crée un RegleCalcul à partir des données de réponse API
   */
  static fromResponse(data: RegleCalculLogResponse): RegleCalculLogModel {
    return new RegleCalculLogModel({
      idRegleCalcul_Log: data.idRegleCalcul_Log,
      idSousNature: data.idSousNature,
      idRegleCalcul: data.idRegleCalcul,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
}


/**
 * Constantes pour les statuss RegleCalcul
 */
export const REGLECACULLOG_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

export type RegleCalculLogStatus = typeof REGLECACULLOG_STATUS[keyof typeof REGLECACULLOG_STATUS];
