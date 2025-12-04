import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  Utilisateur,
  UtilisateurCreate,
  UtilisateurUpdate,
  UtilisateurResponse,
  UtilisateurModel,
  UtilisateurLogin,
  UtilisateurPasswordUpdate,
  ListUtilisateurs,
  UtilisateurSearchResponse
} from '../../pages/users/user';
import { AuthService } from './auth';
import { AuthHelperService } from './auth-helper.service';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/auth'; // URL de votre API Flask
  private currentUserSubject = new BehaviorSubject<UtilisateurModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private _userToEdit: Utilisateur | null = null;

  constructor(private http: HttpClient,
        private authService: AuthService,
        private authHelper: AuthHelperService
  ) {
    // Charger l'utilisateur depuis le localStorage au démarrage
    this.loadUserFromStorage();
  }

  setUserToEdit(user: Utilisateur) {
    this._userToEdit = user;
  }

  getUserToEdit(): Utilisateur | null {
    return this._userToEdit;
  }

  clearUserToEdit() {
    this._userToEdit = null;
  }

    /**
   * Génère les en-têtes avec JWT
  */
  private getAuthHeaders() {
    return this.authHelper.getAuthHeaders('UserService');
  }

  /**
   * Charge l'utilisateur depuis le localStorage
   */
  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(new UtilisateurModel(user));
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  /**
   * Sauvegarde l'utilisateur dans le localStorage
   */
  private saveUserToStorage(user: UtilisateurModel | null): void {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user.toDict()));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  /**
   * Retourne l'utilisateur actuel
   */
  getCurrentUser(): UtilisateurModel | null {
    return this.currentUserSubject.value;
  }

  /**
   * Définit l'utilisateur actuel
   */
  setCurrentUser(user: UtilisateurModel | null): void {
    this.currentUserSubject.next(user);
    this.saveUserToStorage(user);
  }

  /**
   * Connexion utilisateur
   */
  login(credentials: UtilisateurLogin): Observable<UtilisateurModel> {
    return this.http.post<UtilisateurResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => UtilisateurModel.fromResponse(response)),
        tap(user => this.setCurrentUser(user))
      );
  }

  /**
   * Déconnexion utilisateur
   */
  logout(): void {
    this.setCurrentUser(null);
  }

  /**
   * Récupère tous les utilisateurs actifs
   */
  getAllUsers(pageIndex: number, pageSize: number, actifOnly: boolean=false): Observable<UtilisateurModel[]> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      page: pageIndex,
      per_page: pageSize,
      actifOnly: actifOnly,
    };

    return this.http.post<ListUtilisateurs>(`${this.apiUrl}/liste_utilisateurs`,
      body,
      this.getAuthHeaders()
    ).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Récupère un utilisateur par son ID
   */
  getUserById(id: number): Observable<UtilisateurModel> {
    return this.http.get<UtilisateurResponse>(`${this.apiUrl}/users/${id}`)
      .pipe(
        map(user => UtilisateurModel.fromResponse(user))
      );
  }

  /**
   * Récupère un utilisateur par son email
   */
  getUserByEmail(email: string): Observable<UtilisateurModel> {
    return this.http.get<UtilisateurResponse>(`${this.apiUrl}/users/email/${email}`)
      .pipe(
        map(user => UtilisateurModel.fromResponse(user))
      );
  }

  /**
   * Crée un nouvel utilisateur
   */
  createUser(userData: UtilisateurCreate): Observable<UtilisateurModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: UtilisateurResponse; message: string; success: boolean }>(`${this.apiUrl}/creer_utilisateur`,
      userData,
      this.getAuthHeaders())
      .pipe(
        map(result => {
          if (result.success && result.data) {
            return UtilisateurModel.fromResponse(result.data);
          }
          throw new Error(result.message || 'Erreur lors de la création de l\'utilisateur');
        }),
        catchError((error) => this.handleError(error, undefined))
      );
  }

  private handleError(error: Error, errorValue: any) {
    console.log("error = ", error);
    return of(errorValue);
  }




  /**
   * Met à jour un utilisateur
   */
  updateUser(userData: UtilisateurUpdate): Observable<UtilisateurModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    console.log("userData = ", userData)
    return this.http.post<{ data: UtilisateurResponse; message: string; success: boolean }>(`${this.apiUrl}/modifier_utilisateur`,
      userData,
      this.getAuthHeaders())
      .pipe(
        map(result => {
          if (result.success && result.data) {
            return UtilisateurModel.fromResponse(result.data);
          }
          throw new Error(result.message || 'Erreur lors de la modification de l\'utilisateur');
        }),
        catchError((error) => this.handleError(error, undefined))
      );
  }

  /**
   * Supprime un utilisateur (soft delete)
   */
  deleteUser(id: number): Observable<void> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  /**
   * Met à jour le mot de passe d'un utilisateur
   */
  updatePassword(passwordData: UtilisateurPasswordUpdate): Observable<any> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ message: string; success: boolean }>(`${this.apiUrl}/changer_mot_de_passe`,
      passwordData,
      this.getAuthHeaders());
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
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
   * Recherche des utilisateurs par nom ou email
   */
  searchUsers(query: string): Observable<UtilisateurSearchResponse> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.get<UtilisateurResponse>(`${this.apiUrl}/users/search?q=${encodeURIComponent(query)}`,
      this.getAuthHeaders()).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Récupère les statistiques des utilisateurs
   */
  getUserStats(): Observable<{
    total: number;
    active: number;
    inactive: number;
    byFunction: { [key: string]: number };
  }> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.get<{
      total: number;
      active: number;
      inactive: number;
      byFunction: { [key: string]: number };
    }>(`${this.apiUrl}/users/stats`,
      this.getAuthHeaders());
  }

  /**
   * Exporte la liste des utilisateurs
   */
  exportUsers(format: 'csv' | 'excel' | 'pdf' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/users/export?format=${format}`, {
      responseType: 'blob'
    });
  }

  /**
   * Demande de réinitialisation de mot de passe
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post<{ message: string; success: boolean }>(`${this.apiUrl}/mot_de_passe_oublie`, { email })
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la demande de réinitialisation:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Importe des utilisateurs depuis un fichier
   */
  importUsers(file: File): Observable<{ success: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ success: number; errors: string[] }>(`${this.apiUrl}/users/import`, formData);
  }
}
