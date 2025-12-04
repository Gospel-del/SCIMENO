/**
 * Modèle Utilisateur TypeScript
 * Basé sur le modèle Python Utilisateur
 */

export interface Utilisateur {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  fonction?: string;
  email: string;
  telephone?: string;
  motDePasse: string;
  statut: boolean;
  created_at: string;
  updated_at: string;
}

export interface UtilisateurCreate {
  nom: string;
  prenom: string;
  fonction?: string;
  email: string;
  telephone?: string;
  motDePasse: string;
  statut?: boolean;
}

export interface UtilisateurUpdate {
  nom?: string;
  prenom?: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  motDePasse?: string;
  statut?: boolean;
}

export interface UtilisateurResponse {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  fonction?: string;
  email: string;
  telephone?: string;
  statut: boolean;
  created_at: string;
  updated_at: string;
}


export interface ListUtilisateurs {
  data: {
    utilisateurs: Utilisateur[];
    total: number;
    page: number;
    per_page: number;
    total_pages: string;
    actif_only: boolean;
  };
  message: string;
  success: boolean;
}

export interface UtilisateurSearchResponse {
  data: UtilisateurResponse[];
  message: string;
  success: boolean;
}


export interface UtilisateurLogin {
  email: string;
  motDePasse: string;
}

export interface UtilisateurPasswordUpdate {
  idUtilisateur: number;
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}

export class UtilisateurModel {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  fonction?: string;
  email: string;
  telephone?: string;
  motDePasse: string;
  statut: boolean;
  created_at: string;
  updated_at: string;

  constructor(data: Utilisateur) {
    this.idUtilisateur = data.idUtilisateur;
    this.nom = data.nom;
    this.prenom = data.prenom;
    this.fonction = data.fonction;
    this.email = data.email;
    this.telephone = data.telephone;
    this.motDePasse = data.motDePasse;
    this.statut = data.statut;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Convertit l'objet utilisateur en dictionnaire (équivalent de to_dict() en Python)
   */
  toDict(): UtilisateurResponse {
    return {
      idUtilisateur: this.idUtilisateur,
      nom: this.nom,
      prenom: this.prenom,
      fonction: this.fonction,
      email: this.email,
      telephone: this.telephone,
      statut: this.statut,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Retourne le nom complet de l'utilisateur
   */
  getFullName(): string {
    return `${this.prenom} ${this.nom}`;
  }

  /**
   * Vérifie si l'utilisateur est actif
   */
  isActive(): boolean {
    return this.statut;
  }

  /**
   * Désactive l'utilisateur (soft delete)
   */
  softDelete(): void {
    this.statut = false;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Met à jour le mot de passe
   */
  updatePassword(newPassword: string): void {
    this.motDePasse = newPassword;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Met à jour les informations de l'utilisateur
   */
  updateInfo(updateData: Partial<UtilisateurUpdate>): void {
    if (updateData.nom !== undefined) this.nom = updateData.nom;
    if (updateData.prenom !== undefined) this.prenom = updateData.prenom;
    if (updateData.fonction !== undefined) this.fonction = updateData.fonction;
    if (updateData.email !== undefined) this.email = updateData.email;
    if (updateData.telephone !== undefined) this.telephone = updateData.telephone;
    if (updateData.statut !== undefined) this.statut = updateData.statut;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Valide les données de l'utilisateur
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.nom || this.nom.trim().length === 0) {
      errors.push('Le nom est requis');
    }

    if (!this.prenom || this.prenom.trim().length === 0) {
      errors.push('Le prénom est requis');
    }

    if (!this.email || this.email.trim().length === 0) {
      errors.push('L\'email est requis');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('L\'email n\'est pas valide');
    }

    if (!this.motDePasse || this.motDePasse.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
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
   * Crée un nouvel utilisateur à partir des données de création
   */
  static fromCreateData(data: UtilisateurCreate): UtilisateurModel {
    const now = new Date().toISOString();
    return new UtilisateurModel({
      idUtilisateur: 0, // Sera défini par la base de données
      nom: data.nom,
      prenom: data.prenom,
      fonction: data.fonction,
      email: data.email,
      telephone: data.telephone,
      motDePasse: data.motDePasse,
      statut: data.statut ?? true,
      created_at: now,
      updated_at: now
    });
  }

  /**
   * Crée un utilisateur à partir des données de réponse API
   */
  static fromResponse(data: UtilisateurResponse): UtilisateurModel {
    return new UtilisateurModel({
      idUtilisateur: data.idUtilisateur,
      nom: data.nom,
      prenom: data.prenom,
      fonction: data.fonction,
      email: data.email,
      telephone: data.telephone,
      motDePasse: '', // Le mot de passe n'est pas retourné par l'API
      statut: data.statut,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
}

/**
 * Constantes pour les rôles/fonctions utilisateur
 */
export const USER_FUNCTIONS = {
  ADMIN: 'Administrateur',
  MANAGER: 'Gestionnaire',
  USER: 'Utilisateur',
  CLIENT: 'Client'
} as const;

export type UserFunction = typeof USER_FUNCTIONS[keyof typeof USER_FUNCTIONS];

/**
 * Constantes pour les statuts utilisateur
 */
export const USER_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
