export interface Projet {
  idProjet: number;
  nomProjet: string;
  dateProjet: string;
  localisation: string;
  typeProjet: string;
  modeExploitation: string;
  statutJuridique: string;
  typeLocataireCible: string;
  dureeProjet: number;
  superficieTerrain: number;
  superficieConstruite: number;
  nombreAnneesProjet: number;
  informationsComplementaires: string;
  idClient: number;
  client_nom?: string | null;
  statut: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjetCreate {
  nomProjet: string;
  dateProjet: string;
  localisation: string;
  typeProjet: string;
  modeExploitation: string;
  statutJuridique: string;
  typeLocataireCible: string;
  dureeProjet: number;
  superficieTerrain: number;
  superficieConstruite: number;
  nombreAnneesProjet: number;
  informationsComplementaires: string;
  idClient: number;
  client_nom?: string | null;
  statut?: boolean;
}

export interface ProjetUpdate {
  idProjet: number;
  nomProjet?: string;
  dateProjet?: string;
  localisation?: string;
  typeProjet?: string;
  modeExploitation?: string;
  statutJuridique?: string;
  typeLocataireCible?: string;
  dureeProjet?: number;
  superficieTerrain?: number;
  superficieConstruite?: number;
  nombreAnneesProjet?: number;
  informationsComplementaires?: string;
  idClient?: number;
  statut?: boolean;
  client_nom?: string | null;
}

export interface ProjetResponse {
  idProjet: number;
  nomProjet: string;
  dateProjet: string;
  localisation: string;
  typeProjet: string;
  modeExploitation: string;
  statutJuridique: string;
  typeLocataireCible: string;
  dureeProjet: number;
  superficieTerrain: number;
  superficieConstruite: number;
  nombreAnneesProjet: number;
  informationsComplementaires: string;
  idClient: number;
  client_nom?: string | null;
  statut: boolean;
  created_at: string;
  updated_at: string;
}


export interface ListProjets {
  data: {
    projets: Projet[];
    total: number;
    page: string;
    per_page: number;
    total_pages: string;
    actif_only: boolean;
  };
  message: string;
  success: boolean;
}

export interface ProjetSearchResponse {
  data: ProjetResponse[];
  message: string;
  success: boolean;
}

export class ProjetModel {
  idProjet: number;
  nomProjet : string;
  dateProjet : string;
  localisation : string;
  typeProjet : string;
  modeExploitation : string;
  statutJuridique : string;
  typeLocataireCible : string;
  dureeProjet : number;
  superficieTerrain : number;
  superficieConstruite : number;
  nombreAnneesProjet : number;
  informationsComplementaires : string;
  idClient: number;
  client_nom?: string | null;
  statut: boolean;
  created_at: string;
  updated_at: string;

  constructor(data: Projet) {
    this.idProjet = data.idProjet;
    this.nomProjet = data.nomProjet;
    this.dateProjet = data.dateProjet;
    this.localisation = data.localisation;
    this.typeProjet = data.typeProjet;
    this.modeExploitation = data.modeExploitation;
    this.statutJuridique = data.statutJuridique;
    this.typeLocataireCible = data.typeLocataireCible;
    this.dureeProjet = data.dureeProjet;
    this.superficieTerrain = data.superficieTerrain;
    this.superficieConstruite = data.superficieConstruite;
    this.nombreAnneesProjet = data.nombreAnneesProjet;
    this.informationsComplementaires = data.informationsComplementaires;
    this.idClient = data.idClient;
    this.client_nom = data.client_nom ?? null;
    this.statut = data.statut;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Convertit l'objet Projet en dictionnaire (équivalent de to_dict() en Python)
   */
  toDict(): ProjetResponse {
    return {
      idProjet: this.idProjet,
      nomProjet: this.nomProjet,
      dateProjet: this.dateProjet,
      localisation: this.localisation,
      typeProjet: this.typeProjet,
      modeExploitation: this.modeExploitation,
      statutJuridique: this.statutJuridique,
      typeLocataireCible: this.typeLocataireCible,
      dureeProjet: this.dureeProjet,
      superficieTerrain: this.superficieTerrain,
      superficieConstruite: this.superficieConstruite,
      nombreAnneesProjet: this.nombreAnneesProjet,
      informationsComplementaires: this.informationsComplementaires,
      idClient: this.idClient,
      client_nom: this.client_nom ?? null,
      statut: this.statut,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Retourne le nom complet de le Projet
   */
  getFullName(): string {
    return `${this.nomProjet}`;
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
    this.statut = false;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Met à jour les informations de e Projet
   */
  updateInfo(updateData: Partial<ProjetUpdate>): void {
    if (updateData.nomProjet !== undefined) this.nomProjet = updateData.nomProjet;
    if (updateData.dateProjet !== undefined) this.dateProjet = updateData.dateProjet;
    if (updateData.localisation !== undefined) this.localisation = updateData.localisation;
    if (updateData.typeProjet !== undefined) this.typeProjet = updateData.typeProjet;
    if (updateData.modeExploitation !== undefined) this.modeExploitation = updateData.modeExploitation;
    if (updateData.statutJuridique !== undefined) this.statutJuridique = updateData.statutJuridique;
    if (updateData.typeLocataireCible !== undefined) this.typeLocataireCible = updateData.typeLocataireCible;
    if (updateData.dureeProjet !== undefined) this.dureeProjet = updateData.dureeProjet;
    if (updateData.superficieTerrain !== undefined) this.superficieTerrain = updateData.superficieTerrain;
    if (updateData.superficieConstruite !== undefined) this.superficieConstruite = updateData.superficieConstruite;
    if (updateData.nombreAnneesProjet !== undefined) this.nombreAnneesProjet = updateData.nombreAnneesProjet;
    if (updateData.statut !== undefined) this.statut = updateData.statut;
    if (updateData.informationsComplementaires !== undefined) this.informationsComplementaires = updateData.informationsComplementaires;
    if (updateData.idClient !== undefined) this.idClient = updateData.idClient;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Valide les données de e Projet
   */
  isValidate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.nomProjet || this.nomProjet.trim().length === 0) {
      errors.push('Le nom est requis');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Crée un nouvel Projet à partir des données de création
   */
  static fromCreateData(data: ProjetCreate): ProjetModel {
    const now = new Date().toISOString();
    return new ProjetModel({
      idProjet: 0, // Sera défini par la base de données
      nomProjet: data.nomProjet,
      dateProjet: data.dateProjet,
      localisation: data.localisation,
      typeProjet: data.typeProjet,
      modeExploitation: data.modeExploitation,
      statutJuridique: data.statutJuridique,
      typeLocataireCible: data.typeLocataireCible,
      dureeProjet: data.dureeProjet,
      superficieTerrain: data.superficieTerrain,
      superficieConstruite: data.superficieConstruite,
      nombreAnneesProjet: data.nombreAnneesProjet,
      informationsComplementaires: data.informationsComplementaires,
      idClient: data.idClient,
      client_nom: data.client_nom ?? null,
      statut: data.statut ?? true,
      created_at: now,
      updated_at: now
    });
  }

  /**
   * Crée un Projet à partir des données de réponse API
   */
  static fromResponse(data: ProjetResponse): ProjetModel {
    return new ProjetModel({
      idProjet: data.idProjet,
      nomProjet: data.nomProjet,
      dateProjet: data.dateProjet,
      localisation: data.localisation,
      typeProjet: data.typeProjet,
      modeExploitation: data.modeExploitation,
      statutJuridique: data.statutJuridique,
      typeLocataireCible: data.typeLocataireCible,
      dureeProjet: data.dureeProjet,
      superficieTerrain: data.superficieTerrain,
      superficieConstruite: data.superficieConstruite,
      nombreAnneesProjet: data.nombreAnneesProjet,
      informationsComplementaires: data.informationsComplementaires,
      idClient: data.idClient,
      client_nom: data.client_nom,
      statut: data.statut,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
}


/**
 * Constantes pour les statuts Projet
 */
export const PROJET_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

export type ProjetStatus = typeof PROJET_STATUS[keyof typeof PROJET_STATUS];
