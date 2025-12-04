export interface Emprunt {
  idEmprunt: number;
  idProjet: number;
  organismePreneur: string;
  montantEmprunte: number;
  dureeCredit: number;
  tauxInteretAnnuel: number;
  dateDebutPret: string;
  datePremiereEcheance: string;
  modeAmortissement: string;
  statut: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmpruntCreate {
  idProjet: number;
  organismePreneur: string;
  montantEmprunte: number;
  dureeCredit: number;
  tauxInteretAnnuel: number;
  dateDebutPret: string;
  datePremiereEcheance: string;
  modeAmortissement: string;
  statut: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmpruntUpdate {
  idEmprunt: number;
  idProjet: number;
  organismePreneur: string;
  montantEmprunte: number;
  dureeCredit: number;
  tauxInteretAnnuel: number;
  dateDebutPret: string;
  datePremiereEcheance: string;
  modeAmortissement: string;
  statut: boolean;
}

export interface EmpruntResponse {
  idEmprunt: number;
  idProjet: number;
  organismePreneur: string;
  montantEmprunte: number;
  dureeCredit: number;
  tauxInteretAnnuel: number;
  dateDebutPret: string;
  datePremiereEcheance: string;
  modeAmortissement: string;
  statut: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListEmprunts {
  data: Emprunt[];
  /*
  {
    emprunts: Emprunt[];
    total: number;
    page: string;
    per_page: number;
    total_pages: string;
  };
  */
  message: string;
  success: boolean;
}


export class EmpruntModel {
  idEmprunt: number;
  idProjet: number;
  organismePreneur: string;
  montantEmprunte: number;
  dureeCredit: number;
  tauxInteretAnnuel: number;
  dateDebutPret: string;
  datePremiereEcheance: string;
  modeAmortissement: string;
  statut: boolean;
  created_at: string;
  updated_at: string;

  constructor(data: Emprunt) {
    this.idEmprunt = data.idEmprunt;
    this.idProjet = data.idProjet;
    this.organismePreneur = data.organismePreneur;
    this.montantEmprunte = data.montantEmprunte;
    this.dureeCredit = data.dureeCredit;
    this.tauxInteretAnnuel = data.tauxInteretAnnuel;
    this.dateDebutPret = data.dateDebutPret;
    this.datePremiereEcheance = data.datePremiereEcheance;
    this.modeAmortissement = data.modeAmortissement;
    this.statut = data.statut;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Convertit l'objet Emprunt en dictionnaire (équivalent de to_dict() en Python)
   */
  toDict(): EmpruntResponse {
    return {
      idEmprunt: this.idEmprunt,
      idProjet: this.idProjet,
      organismePreneur: this.organismePreneur,
      montantEmprunte: this.montantEmprunte,
      dureeCredit: this.dureeCredit,
      tauxInteretAnnuel: this.tauxInteretAnnuel,
      dateDebutPret: this.dateDebutPret,
      datePremiereEcheance: this.datePremiereEcheance,
      modeAmortissement: this.modeAmortissement,
      statut: this.statut,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Retourne le idProjet complet de le Emprunt
   */
  getFullName(): string {
    return `${this.organismePreneur} ${this.idProjet}`;
  }

  /**
   * Vérifie si le Emprunt est actif
   */
  isActive(): boolean {
    return this.statut;
  }

  /**
   * Désactive e Emprunt (soft delete)
   */
  softDelete(): void {
    this.statut = false;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Met à jour les informations de e Emprunt
   */
  updateInfo(updateData: Partial<EmpruntUpdate>): void {
    if (updateData.idProjet !== undefined) this.idProjet = updateData.idProjet;
    if (updateData.organismePreneur !== undefined) this.organismePreneur = updateData.organismePreneur;
    if (updateData.montantEmprunte !== undefined) this.montantEmprunte = updateData.montantEmprunte;
    if (updateData.dureeCredit !== undefined) this.dureeCredit = updateData.dureeCredit;
    if (updateData.tauxInteretAnnuel !== undefined) this.tauxInteretAnnuel = updateData.tauxInteretAnnuel;
    if (updateData.dateDebutPret !== undefined) this.dateDebutPret = updateData.dateDebutPret;
    if (updateData.datePremiereEcheance !== undefined) this.datePremiereEcheance = updateData.datePremiereEcheance;
    if (updateData.modeAmortissement !== undefined) this.modeAmortissement = updateData.modeAmortissement;
    if (updateData.statut !== undefined) this.statut = updateData.statut;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Valide les données de e Emprunt
   */
  isValidate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!this.organismePreneur || this.organismePreneur.trim().length === 0) {
      errors.push('Le nom de l\'organisme preneur est requis');
    }
    if (!this.montantEmprunte) {
      errors.push('Le montant emprunté est requis');
    }
    if (!this.dureeCredit) {
      errors.push('La durée de l\'emprunté est requise');
    }
    if (!this.tauxInteretAnnuel) {
      errors.push('Le taux d\'intérêt de l\'emprunté est requise');
    }
    if (!this.modeAmortissement) {
      errors.push('Le mode d\'amortissement de l\'emprunt est requise');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Crée un nouvel Emprunt à partir des données de création
   */
  static fromCreateData(data: EmpruntCreate): EmpruntModel {
    const now = new Date().toISOString();
    return new EmpruntModel({
      idEmprunt: 0, // Sera défini par la base de données
      idProjet: data.idProjet,
      organismePreneur: data.organismePreneur,
      montantEmprunte: data.montantEmprunte,
      dureeCredit: data.dureeCredit,
      tauxInteretAnnuel: data.tauxInteretAnnuel,
      dateDebutPret: data.dateDebutPret,
      datePremiereEcheance: data.datePremiereEcheance,
      modeAmortissement: data.modeAmortissement,
      statut: data.statut ?? true,
      created_at: now,
      updated_at: now
    });
  }

  /**
   * Crée un Emprunt à partir des données de réponse API
   */
  static fromResponse(data: EmpruntResponse): EmpruntModel {
    return new EmpruntModel({
      idEmprunt: data.idEmprunt,
      idProjet: data.idProjet,
      organismePreneur: data.organismePreneur,
      montantEmprunte: data.montantEmprunte,
      dureeCredit: data.dureeCredit,
      tauxInteretAnnuel: data.tauxInteretAnnuel,
      dateDebutPret: data.dateDebutPret,
      datePremiereEcheance: data.datePremiereEcheance,
      modeAmortissement: data.modeAmortissement,
      statut: data.statut,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
}


/**
 * Constantes pour les statuts Emprunt
 */
export const EMPRUNT_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

export type EmpruntStatus = typeof EMPRUNT_STATUS[keyof typeof EMPRUNT_STATUS];
