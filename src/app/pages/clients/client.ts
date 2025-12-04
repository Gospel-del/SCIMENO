export interface Client {
  idClient: number;
  nom: string;
  prenom?: string;
  email: string;
  entreprise?: string;
  telephone?: string;
  statut: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientCreate {
  nom: string;
  prenom?: string;
  email: string;
  entreprise?: string;
  telephone?: string;
  statut: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientUpdate {
  idClient: number;
  nom: string;
  prenom?: string;
  email: string;
  entreprise?: string;
  telephone?: string;
  statut: boolean;
}

export interface ClientResponse {
  idClient: number;
  nom: string;
  prenom?: string;
  email: string;
  entreprise?: string;
  telephone?: string;
  statut: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientSearchResponse {
  data: ClientResponse[];
  message: string;
  success: boolean;
}

export interface ListClients {
  data: {
    clients: Client[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
  message: string;
  success: boolean;
}


export class ClientModel {
  idClient: number;
  nom: string;
  prenom?: string;
  email: string;
  entreprise?: string;
  telephone?: string;
  statut: boolean;
  created_at: string;
  updated_at: string;

  constructor(data: Client) {
    this.idClient = data.idClient;
    this.nom = data.nom;
    this.prenom = data.prenom;
    this.email = data.email;
    this.entreprise = data.entreprise;
    this.telephone = data.telephone;
    this.statut = data.statut;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Convertit l'objet Client en dictionnaire (équivalent de to_dict() en Python)
   */
  toDict(): ClientResponse {
    return {
      idClient: this.idClient,
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      entreprise: this.entreprise,
      telephone: this.telephone,
      statut: this.statut,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Retourne le nom complet de le Client
   */
  getFullName(): string {
    return `${this.prenom} ${this.nom}`;
  }

  /**
   * Vérifie si le Client est actif
   */
  isActive(): boolean {
    return this.statut;
  }

  /**
   * Désactive e Client (soft delete)
   */
  softDelete(): void {
    this.statut = false;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Met à jour les informations de e Client
   */
  updateInfo(updateData: Partial<ClientUpdate>): void {
    if (updateData.nom !== undefined) this.nom = updateData.nom;
    if (updateData.prenom !== undefined) this.prenom = updateData.prenom;
    if (updateData.email !== undefined) this.email = updateData.email;
    if (updateData.entreprise !== undefined) this.entreprise = updateData.entreprise;
    if (updateData.telephone !== undefined) this.telephone = updateData.telephone;
    if (updateData.statut !== undefined) this.statut = updateData.statut;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Valide les données de e Client
   */
  isValidate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.nom || this.nom.trim().length === 0) {
      errors.push('Le nom est requis');
    }

    if (!this.email || this.email.trim().length === 0) {
      errors.push('L\'email est requis');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('L\'email n\'est pas valide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide le format de l'email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Crée un nouvel Client à partir des données de création
   */
  static fromCreateData(data: ClientCreate): ClientModel {
    const now = new Date().toISOString();
    return new ClientModel({
      idClient: 0, // Sera défini par la base de données
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      entreprise: data.entreprise,
      telephone: data.telephone,
      statut: data.statut ?? true,
      created_at: now,
      updated_at: now
    });
  }

  /**
   * Crée un Client à partir des données de réponse API
   */
  static fromResponse(data: ClientResponse): ClientModel {
    return new ClientModel({
      idClient: data.idClient,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      entreprise: data.entreprise,
      telephone: data.telephone,
      statut: data.statut,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
}


/**
 * Constantes pour les statuts Client
 */
export const CLIENT_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

export type ClientStatus = typeof CLIENT_STATUS[keyof typeof CLIENT_STATUS];
