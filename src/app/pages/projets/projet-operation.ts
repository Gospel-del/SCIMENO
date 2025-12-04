import { Projet } from "./projet";

export interface ProjetOperation {
  id : number;
  idProjet : number;
  idSousNature : number;
  typeOperation : string;
  surface : number;
  loyer : number;
  montant : number;
  created_at: string;
  updated_at: string;
}


export interface ProjetOperationCreate {
  idProjet : number;
  idSousNature : number;
  typeOperation : string;
  surface : number;
  loyer : number;
  montant : number;
  created_at: string;
  updated_at: string;
}

export interface ProjetOperationUpdate {
  id: number;
  idProjet : number;
  idSousNature : number;
  typeOperation : string;
  surface : number;
  loyer : number;
  montant : number;
}

export interface ProjetOperationResponse {
  id: number;
  idProjet : number;
  idSousNature : number;
  typeOperation : string;
  surface : number;
  loyer : number;
  montant : number;
  created_at: string;
  updated_at: string;
}

export interface ListProjetOperations {
  data: {
    operations: ProjetOperation[];
    projet?: Projet[];
    total_operations?: number;
    total: number;
    page: string;
    per_page: number;
    total_pages: string;
  };
  message: string;
  success: boolean;
}

export class ProjetOperationModel {
  id: number; //ok
  idProjet : number;  //ok
  idSousNature : number;  //ok
  typeOperation : string; //ok
  surface : number; //ok
  loyer : number; //ok
  montant : number; //ok
  created_at: string; //ok
  updated_at: string; //ok

  constructor(data: ProjetOperation) {
    this.id = data.id;
    this.idProjet = data.idProjet;
    this.idSousNature = data.idSousNature;
    this.typeOperation = data.typeOperation;
    this.surface = data.surface;
    this.loyer = data.loyer;
    this.montant = data.montant;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Convertit l'objet Projet en dictionnaire (équivalent de to_dict() en Python)
   */
  toDict(): ProjetOperationResponse {
    return {
      id: this.id,
      idProjet: this.idProjet,
      idSousNature: this.idSousNature,
      typeOperation: this.typeOperation,
      surface: this.surface,
      loyer: this.loyer,
      montant: this.montant,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Retourne le nom complet de le Projet
   */
  getFullName(): string {
    return `${this.idProjet}`;
  }

  /**
   * Désactive e Projet (soft delete)
   */
  softDelete(): void {
    this.updated_at = new Date().toISOString();
  }

  /**
   * Met à jour les informations de e Projet
   */
  updateInfo(updateData: Partial<ProjetOperationUpdate>): void {
    if (updateData.idProjet !== undefined) this.idProjet = updateData.idProjet;
    if (updateData.idSousNature !== undefined) this.idSousNature = updateData.idSousNature;
    if (updateData.typeOperation !== undefined) this.typeOperation = updateData.typeOperation;
    if (updateData.surface !== undefined) this.surface = updateData.surface;
    if (updateData.loyer !== undefined) this.loyer = updateData.loyer;
    if (updateData.montant !== undefined) this.montant = updateData.montant;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Valide les données de e Projet
   */
  isValidate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];


    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Crée un nouvel Projet à partir des données de création
   */
  static fromCreateData(data: ProjetOperationCreate): ProjetOperationModel {
    const now = new Date().toISOString();
    return new ProjetOperationModel({
      id: 0, // Sera défini par la base de données
      idProjet: data.idProjet,
      idSousNature: data.idSousNature,
      typeOperation: data.typeOperation,
      surface: data.surface,
      loyer: data.loyer,
      montant: data.montant,
      created_at: now,
      updated_at: now
    });
  }

  /**
   * Crée un Projet à partir des données de réponse API
   */
  static fromResponse(data: ProjetOperationResponse): ProjetOperationModel {
    return new ProjetOperationModel({
      id: data.id,
      idProjet: data.idProjet,
      idSousNature: data.idSousNature,
      typeOperation: data.typeOperation,
      surface: data.surface,
      loyer: data.loyer,
      montant: data.montant,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
}


/**
 * Constantes pour les statuts Projet
 */
export const PROJETOPERATION_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

export type ProjetOperationStatus = typeof PROJETOPERATION_STATUS[keyof typeof PROJETOPERATION_STATUS];
