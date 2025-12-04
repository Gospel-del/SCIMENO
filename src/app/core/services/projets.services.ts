import { Injectable } from '@angular/core';
import { ListProjets, Projet, ProjetCreate, ProjetModel, ProjetResponse, ProjetSearchResponse } from '../../pages/projets/projet';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth';
import { AuthHelperService } from './auth-helper.service';

@Injectable({
  providedIn: 'root',
})
export class ProjetsServices {
  private apiUrl = 'http://localhost:5000/api/projets'; // URL de votre API Flask
  private currentUserSubject = new BehaviorSubject<ProjetModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private _projetToEdit: Projet | null = null;
  private _isDuplicate: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private authHelper: AuthHelperService
  ) {}

  setProjetToEdit(projet: Projet, isDuplicate: boolean) {
    this._projetToEdit = projet;
    this._isDuplicate = isDuplicate;
  }

  getProjetToEdit(): Projet | null {
    return this._projetToEdit;
  }

  getIsDuplicate(): boolean {
    return this._isDuplicate;
  }

  clearProjetToEdit() {
    this._projetToEdit = null;
    this._isDuplicate = false
  }

  /**
   * Génère les en-têtes avec JWT
  */
  private getAuthHeaders() {
    return this.authHelper.getAuthHeaders('ProjetsServices');
  }

  /**
   * Crée un nouveau Projet
   */
  createProjet(projetData: ProjetCreate): Observable<ProjetModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: ProjetResponse; message: string; success: boolean }>(`${this.apiUrl}/creer_projet`,
      projetData,
      this.getAuthHeaders())
      .pipe(
        map(result => {
          if (result.success && result.data) {
            return ProjetModel.fromResponse(result.data);
          }
          throw new Error(result.message || 'Erreur lors de la création du projet');
        }),
        catchError((error) => this.handleError(error, undefined))
      );
  }

  /**
   * editer un Projet
  */
  updateProjet(projetData: Projet): Observable<ProjetModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: ProjetResponse; message: string; success: boolean }>(`${this.apiUrl}/modifier_projet`,
      projetData,
      this.getAuthHeaders())
      .pipe(
        map(result => {
          if (result.success && result.data) {
            return ProjetModel.fromResponse(result.data);
          }
          throw new Error(result.message || 'Erreur lors de la création du projet');
        }),
        catchError((error) => this.handleError(error, undefined))
      );
  }

  /**
   * cherche un Projet
  */
  /**
   * cherche un Nature
  */
  findById(idNature: number): Observable<ProjetModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      idNature: idNature,
    };
    return this.http.post<{ data: ProjetResponse; message: string; success: boolean }>(
      `${this.apiUrl}/obtenir`,
      body,
      this.getAuthHeaders()
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return ProjetModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Projet non trouvé');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * supprimer un client
   */
  deleteProjet(projetData: Projet): Observable<ProjetModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      idProjet: projetData.idProjet,
    };
    return this.http.post<{ message: string; success: boolean }>(`${this.apiUrl}/supprimer_projet`,
      body,
      this.getAuthHeaders())
      .pipe(
        catchError((error) => this.handleError(error, undefined))
      );
  }

  /**
   * Lister les clients
   */
  listProjets(pageIndex: number, pageSize: number, search_term?: string, idClient?: string, actifOnly: boolean=false): Observable<any> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      page: pageIndex,
      per_page: pageSize,
      recherche: search_term,
      idClient: idClient,
      actifOnly: actifOnly,
    };

    return this.http.post<ListProjets>(`${this.apiUrl}/lister_projets`,
      body,
      this.getAuthHeaders())
      .pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Restaure un nature supprimé
   */
  restoreProjet(idProjet: number): Observable<ProjetModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: ProjetResponse; message: string; success: boolean }>(
      `${this.apiUrl}/restaurer`,
      { idProjet: idProjet },
      this.getAuthHeaders()
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return ProjetModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Erreur lors de la restauration du projet');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }


  /**
   * Recherche des nature par nom
   */
  searchProjet(pageIndex: number, pageSize: number, searchTerm: string, idClient?: number): Observable<any> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      page: pageIndex,
      per_page: pageSize,
      recherche: searchTerm,
      idClient: idClient,
    };
    return this.http.post<ListProjets>(`${this.apiUrl}/lister_projets`,
      body,
      this.getAuthHeaders())
      .pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  private handleError(error: HttpErrorResponse, errorValue: any) {
    console.table(error);
    if (error.error && error.error.message) {
      console.error('Message d\'erreur:', error.error.message);
    }
    if (error.status === 401) {
      console.warn('Token expiré ou invalide');
    }
    return of(errorValue);
  }

}
