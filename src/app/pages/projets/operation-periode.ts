import { Projet } from "./projet";

export interface OperationPeriod {
  idProjet : number;
  idOperation : number;
  typeOperation : string;
  annee : number;
  montant : number;
  statut : boolean;
  created_at: string;
  updated_at: string;
}


export interface OperationPeriodCreate {
  idProjet : number;
  idOperation : number;
  typeOperation : string;
  annee : number;
  montant : number;
  statut : boolean;
  created_at: string;
  updated_at: string;
}

export interface OperationPeriodUpdate {
  idProjet : number;
  idOperation : number;
  typeOperation : string;
  annee : number;
  montant : number;
  statut : boolean;
}

export interface OperationPeriodResponse {
  idProjet : number;
  idOperation : number;
  typeOperation : string;
  annee : number;
  montant : number;
  statut : boolean;
  created_at: string;
  updated_at: string;
}

export interface ListOperationPeriods {
  data: {
    operations_periode: OperationPeriod[];
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

export class OperationPeriodModel {
  idProjet : number;
  idOperation : number;
  typeOperation : string;
  annee : number;
  montant : number;
  statut : boolean;
  created_at: string;
  updated_at: string;

  constructor(data: OperationPeriod) {
    this.idProjet = data.idProjet;
    this.idOperation = data.idOperation;
    this.typeOperation = data.typeOperation;
    this.annee = data.annee;
    this.montant = data.montant;
    this.statut = data.statut;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Convertit l'objet Projet en dictionnaire (équivalent de to_dict() en Python)
   */
  toDict(): OperationPeriodResponse {
    return {
      idProjet: this.idProjet,
      idOperation: this.idOperation,
      typeOperation: this.typeOperation,
      annee: this.annee,
      montant: this.montant,
      statut: this.statut,
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
   * Vérifie si le Projet est actif
   */
  isActive(): boolean {
    return this.statut;
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
  updateInfo(updateData: Partial<OperationPeriodUpdate>): void {
    if (updateData.idProjet !== undefined) this.idProjet = updateData.idProjet;
    if (updateData.idOperation !== undefined) this.idOperation = updateData.idOperation;
    if (updateData.typeOperation !== undefined) this.typeOperation = updateData.typeOperation;
    if (updateData.annee !== undefined) this.annee = updateData.annee;
    if (updateData.statut !== undefined) this.statut = updateData.statut;
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
  static fromCreateData(data: OperationPeriodCreate): OperationPeriodModel {
    const now = new Date().toISOString();
    return new OperationPeriodModel({
      idProjet: data.idProjet,
      idOperation: data.idOperation,
      typeOperation: data.typeOperation,
      annee: data.annee,
      montant: data.montant,
      statut: data.statut,
      created_at: now,
      updated_at: now
    });
  }

  /**
   * Crée un Projet à partir des données de réponse API
   */
  static fromResponse(data: OperationPeriodResponse): OperationPeriodModel {
    return new OperationPeriodModel({
      idProjet: data.idProjet,
      idOperation: data.idOperation,
      typeOperation: data.typeOperation,
      annee: data.annee,
      montant: data.montant,
      statut: data.statut,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
}


/**
 * Constantes pour les statuts Projet
 */
export const OPERATIONPERIOD_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

export type OperationPeriodStatus = typeof OPERATIONPERIOD_STATUS[keyof typeof OPERATIONPERIOD_STATUS];
