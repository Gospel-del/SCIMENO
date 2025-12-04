import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { ListNatures, Nature, NatureCreate, NatureModel, NatureResponse, NatureSearchResponse, NatureUpdate } from '../../pages/natures/nature';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth';
import { AuthHelperService } from './auth-helper.service';

@Injectable({
  providedIn: 'root'
})
export class NaturesService {
  private apiUrl = 'http://localhost:5000/api/base_nature'; // URL de votre API Flask
  private currentUserSubject = new BehaviorSubject<NatureModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private _natureToEdit: Nature | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private authHelper: AuthHelperService
  ) {}

  setNatureToEdit(nature: Nature) {
    this._natureToEdit = nature;
  }

  getNatureToEdit(): Nature | null {
    return this._natureToEdit;
  }

  clearNatureToEdit() {
    this._natureToEdit = null;
  }

  /**
   * Génère les en-têtes avec JWT
  */
  private getAuthHeaders() {
    return this.authHelper.getAuthHeaders('NaturesService');
  }

  /**
   * Crée un nouveau Nature
   */
  createNature(natureData: NatureCreate): Observable<NatureModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: NatureResponse; message: string; success: boolean }>(`${this.apiUrl}/creer`,
      natureData,
      this.getAuthHeaders())
      .pipe(
        map(result => {
          if (result.success && result.data) {
            return NatureModel.fromResponse(result.data);
          }
          throw new Error(result.message || 'Erreur lors de la création de la nature');
        }),
        catchError((error) => this.handleError(error, undefined))
      );
  }

  /**
   * editer un Nature
  */
  updateNature(natureData: Nature): Observable<NatureModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: NatureResponse; message: string; success: boolean }>(`${this.apiUrl}/modifier`,
      natureData,
      this.getAuthHeaders())
      .pipe(
        map(result => {
          if (result.success && result.data) {
            return NatureModel.fromResponse(result.data);
          }
          throw new Error(result.message || 'Erreur lors de la modification de la nature');
        }),
        catchError((error) => this.handleError(error, undefined))
      );
  }

  /**
   * cherche un Nature
  */
  findById(idNature: number): Observable<NatureModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      idNature: idNature,
    };
    return this.http.post<{ data: NatureResponse; message: string; success: boolean }>(
      `${this.apiUrl}/obtenir`,
      body,
      this.getAuthHeaders()
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return NatureModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Nature non trouvé');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * supprimer un client
   */
  deleteNature(natureData: Nature): Observable<NatureModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      idNature: natureData.idNature,
    };
    return this.http.post<{ message: string; success: boolean }>(`${this.apiUrl}/supprimer`,
      body,
      this.getAuthHeaders())
      .pipe(
        catchError((error) => this.handleError(error, undefined))
      );
  }

  /**
   * Lister les clients
   */
  listNatures(pageIndex: number, pageSize: number, typeNature?: String, actifOnly: boolean=false): Observable<ListNatures> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      page: pageIndex,
      per_page: pageSize,
      typeNature: typeNature,
      actifOnly: actifOnly,
    };

    return this.http.post<ListNatures>(`${this.apiUrl}/lister`,
      body,
      this.getAuthHeaders())
      .pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

    /**
   * Restaure un nature supprimé
   */
  restoreNature(idNature: number): Observable<NatureModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: NatureResponse; message: string; success: boolean }>(
      `${this.apiUrl}/restaurer`,
      { idNature: idNature },
      this.getAuthHeaders()
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return NatureModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Erreur lors de la restauration de la nature');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }


  /**
   * Recherche des nature par nom
   */
  searchNature(searchTerm: string): Observable<NatureSearchResponse> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<NatureSearchResponse>(
      `${this.apiUrl}/rechercher`,
      { terme_recherche: searchTerm },
      this.getAuthHeaders()
    ).pipe(
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
