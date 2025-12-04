import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { UtilisateurModel, UtilisateurLogin, Utilisateur } from '../../pages/users/user';
import { JwtService } from './jwt.service';
import { AuthHelperService } from './auth-helper.service';
import { FonctionUser } from '../../pages/users/fonctions';

export interface LoginResponse {
  data: {
    token: string;
    expires_in: number;
    token_type: string;
    utilisateur: Utilisateur;
  };
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth'; // URL de votre API Flask
  private currentUserSubject = new BehaviorSubject<UtilisateurModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();
  private _userToEdit: Utilisateur | null = null;
  private refreshTimeout: any;



  setUserToEdit(user: Utilisateur) {
    this._userToEdit = user;
  }

  getUserToEdit(): Utilisateur | null {
    return this._userToEdit;
  }

  clearUserToEdit() {
    this._userToEdit = null;
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private jwtService: JwtService
  ) {
    // Charger l'utilisateur et le token depuis le localStorage au démarrage
    this.loadUserFromStorage();
  }

  /**
   * Charge l'utilisateur et le token depuis le localStorage
   */
  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');

    if (userData && token) {
      try {
        // Vérifier si le token est encore valide
        if (this.jwtService.isValidToken(token)) {
          const user = JSON.parse(userData);
          this.currentUserSubject.next(new UtilisateurModel(user));
          this.tokenSubject.next(token);
          this.isAuthenticatedSubject.next(true);
        } else {
          console.warn('Token expiré, déconnexion automatique');
          this.clearAuthData();
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Sauvegarde l'utilisateur et le token dans le localStorage
   */
  private saveAuthData(user: UtilisateurModel, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user.toDict()));
    localStorage.setItem('authToken', token);
    this.currentUserSubject.next(user);
    this.tokenSubject.next(token);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Supprime les données d'authentification
   */
  private clearAuthData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');

    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Connexion avec JWT (avec fallback local)
   */
  login(email: string, motDePasse: string): Observable<boolean> {
    const credentials: UtilisateurLogin = { email, motDePasse };

    // Essayer d'abord l'API backend
    return this.http.post<LoginResponse>(`${this.apiUrl}/connexion`, credentials)
      .pipe(
        map(response => {
          console.log("response = ", response)
          if (response.data.token && response.data.utilisateur) {
            const user = UtilisateurModel.fromResponse(response.data.utilisateur);
            this.saveAuthData(user, response.data.token);
            this.scheduleRefreshToken(response.data.token);
            return true;
          }
          return false;
        }),
        catchError(error => {
          console.warn('API backend non disponible, utilisation de l\'authentification locale:', error);
          // Fallback vers l'authentification locale
          return this.loginLocal(email, motDePasse);
        })
      );
  }

  scheduleRefreshToken(token: string) {
    if (!token) return;

    // Décoder payload JWT pour récupérer exp
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    const timeout = expiresAt - now - 300000; // 1 min avant expiration

    if (timeout > 0) {
      if (this.refreshTimeout) clearTimeout(this.refreshTimeout);

      this.refreshTimeout = setTimeout(() => {
        this.refreshToken().subscribe({
          next: () => console.log('Token rafraîchi automatiquement'),
          error: () => console.warn('Impossible de rafraîchir le token')
        });
      }, timeout);
    }
  }


  /**
   * Authentification locale par défaut
   */
  private loginLocal(email: string, motDePasse: string): Observable<boolean> {
    // Utilisateurs par défaut
    const defaultUsers = [
      {
        idUtilisateur: 1,
        nom: 'Admin',
        prenom: 'Super',
        fonction: 'Administrateur',
        email: 'admin@example.com',
        telephone: '0123456789',
        motDePasse: 'admin',
        statut: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        idUtilisateur: 2,
        nom: 'Doe',
        prenom: 'John',
        fonction: 'Utilisateur',
        email: 'john.doe@example.com',
        telephone: '0987654321',
        motDePasse: 'password',
        statut: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        idUtilisateur: 3,
        nom: 'Manager',
        prenom: 'Jane',
        fonction: 'Gestionnaire',
        email: 'jane.manager@example.com',
        telephone: '0555666777',
        motDePasse: 'manager',
        statut: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    // Rechercher l'utilisateur
    const user = defaultUsers.find(u => u.email === email && u.motDePasse === motDePasse);

    if (user) {
      const userModel = UtilisateurModel.fromResponse(user);
      // Générer un token JWT local simple (pour la démo)
      const token = this.generateLocalToken(user);
      this.saveAuthData(userModel, token);
      return new Observable(observer => {
        observer.next(true);
        observer.complete();
      });
    } else {
      return new Observable(observer => {
        observer.error(new Error('Email ou mot de passe incorrect'));
        observer.complete();
      });
    }
  }

  /**
   * Génère un token JWT local simple
   */
  private generateLocalToken(user: any): string {
    return this.jwtService.generateLocalToken(user);
  }

  logout(): void {
    // Tentative de déconnexion backend
    this.http.post(`${this.apiUrl}/deconnexion`, {}).subscribe({
      next: () => {
        this.performLocalLogout();
      },
      error: (error) => {
        console.warn('API backend non disponible, déconnexion locale:', error);
        this.performLocalLogout();
      }
    });
  }

  private performLocalLogout(): void {
    this.clearAuthData();
    this.tokenSubject.next(null);

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }

    this.router.navigate(['/login']);
  }


  /**
   * Récupère l'utilisateur actuel
   */
  getCurrentUser(): UtilisateurModel | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserRole(): FonctionUser {
    const role = this.currentUserSubject.value?.fonction;

    if (!role) {
      return FonctionUser.LIMITE; // le rôle le plus faible par défaut
    }

    // Vérifie que le rôle existe dans l'enum
    if (Object.values(FonctionUser).includes(role as FonctionUser)) {
      return role as FonctionUser;
    }

    console.warn('⚠️ Rôle utilisateur inconnu, rôle par défaut appliqué.');
    return FonctionUser.LIMITE;
  }

  /**
   * Récupère le token actuel
   */
  getCurrentToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.fonction === role : false;
  }

  /**
   * Vérifie si l'utilisateur est administrateur
   */
  isAdmin(): boolean {
    return this.hasRole('Administrateur');
  }

  /**
   * Vérifie si l'utilisateur est gestionnaire
   */
  isManager(): boolean {
    return this.hasRole('Gestionnaire');
  }

  /**
   * Rafraîchit le token JWT
   */
  refreshToken(): Observable<string> {
    const currentToken = this.getCurrentToken();
    if (!currentToken) {
      return throwError(() => new Error('Aucun token disponible'));
    }

    return this.http.post<{token: string, token_type: string, expires_in: number}>(`${this.apiUrl}/rafraichir_token`, { token: currentToken })
      .pipe(
        map(response => {
          this.tokenSubject.next(response.token);
          localStorage.setItem('authToken', response.token);
          return response.token;
        }),
        catchError(error => {
          console.error('Erreur lors du rafraîchissement du token:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Vérifie la validité du token
   */
  verifyToken(): Observable<boolean> {
    const currentToken = this.getCurrentToken();
    if (!currentToken) {
      return throwError(() => new Error('Aucun token disponible'));
    }

    return this.http.post<{valid: boolean, user: any, payload: any}>(`${this.apiUrl}/verifier_token`, { token: currentToken })
      .pipe(
        map(response => response.valid),
        catchError(error => {
          console.error('Token invalide:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  getProfile(): Observable<UtilisateurModel> {
    return this.http.post<any>(`${this.apiUrl}/profil`, {})
      .pipe(
        map(response => UtilisateurModel.fromResponse(response.data)),
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user.toDict()));
        }),
        catchError(error => {
          console.error('Erreur lors de la récupération du profil:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Met à jour le profil de l'utilisateur
   */
  updateProfile(userData: any): Observable<UtilisateurModel> {
    return this.http.post<any>(`${this.apiUrl}/modifier_utilisateur`, userData)
      .pipe(
        map(response => UtilisateurModel.fromResponse(response.data)),
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user.toDict()));
        }),
        catchError(error => {
          console.error('Erreur lors de la mise à jour du profil:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Change le mot de passe
   */
  changePassword(ancienMotDePasse: string, nouveauMotDePasse: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/changer_mot_de_passe`, {
      ancienMotDePasse,
      nouveauMotDePasse
    }).pipe(
      catchError(error => {
        console.error('Erreur lors du changement de mot de passe:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Demande de réinitialisation de mot de passe
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mot_de_passe_oublie`, { email })
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la demande de réinitialisation:', error);
          return throwError(() => error);
        })
      );
  }
}
