import { Injectable } from '@angular/core';
import { ListSousNatures, SousNature, SousNatureCreate, SousNatureModel, SousNatureResponse, SousNatureSearchResponse } from '../../pages/sous-natures/sous-nature';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth';
import { AuthHelperService } from './auth-helper.service';

@Injectable({
  providedIn: 'root'
})
export class SousNaturesService {
  private apiUrl = 'http://localhost:5000/api/sous_nature'; // URL de votre API Flask
  private currentUserSubject = new BehaviorSubject<SousNatureModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private _sousNatureToEdit: SousNature | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private authHelper: AuthHelperService
  ) {}

  setSousNatureToEdit(sousNature: SousNature) {
    this._sousNatureToEdit = sousNature;
  }

  getSousNatureToEdit(): SousNature | null {
    return this._sousNatureToEdit;
  }

  clearSousNatureToEdit() {
    this._sousNatureToEdit = null;
  }

  /**
   * Génère les en-têtes avec JWT
  */
  private getAuthHeaders() {
    return this.authHelper.getAuthHeaders('SousNaturesService');
  }

  /**
   * Crée un nouveau SousNature
   */
  createSousNature(sousNatureData: SousNatureCreate): Observable<SousNatureModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    console.log("ce que tu a",this.getAuthHeaders())
    return this.http.post<{ data: SousNatureResponse; message: string; success: boolean }>(`${this.apiUrl}/creer`, sousNatureData, this.getAuthHeaders())
      .pipe(
        map(result => {
          if (result.success && result.data) {
            return SousNatureModel.fromResponse(result.data);
          }
          throw new Error(result.message || 'Erreur lors de la création de la sous nature');
        }),
        catchError((error) => this.handleError(error, undefined))
      );
  }

  /**
   * editer un SousNature
  */
  updateSousNature(sousNatureData: SousNature): Observable<SousNatureModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: SousNatureResponse; message: string; success: boolean }>(`${this.apiUrl}/modifier`, sousNatureData, this.getAuthHeaders())
      .pipe(
        map(result => {
          if (result.success && result.data) {
            return SousNatureModel.fromResponse(result.data);
          }
          throw new Error(result.message || 'Erreur lors de la modification de la sous nature');
        }),
        catchError((error) => this.handleError(error, undefined))
      );
  }


  /**
   * cherche un Nature
  */
  findById(idSousNature: number): Observable<any> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      idSousNature: idSousNature,
    };
    return this.http.post<{ data: SousNatureResponse; message: string; success: boolean }>(
      `${this.apiUrl}/obtenir`,
      body,
      this.getAuthHeaders()).pipe(
      map(response => {
        if (response.success && response.data) {
          return SousNatureModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Sous nature non trouvé');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );;
  }

  /**
   * supprimer un client
   */
  deleteSousNature(sousNatureData: SousNature): Observable<SousNatureModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      idNature: sousNatureData.idNature,
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
  listSousNatures(pageIndex: number, pageSize: number, typeNature?: string, actifOnly: boolean=false): Observable<any> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      page: pageIndex,
      per_page: pageSize,
      typeNature: typeNature,
      actifOnly: actifOnly,
    };

    return this.http.post<ListSousNatures>(`${this.apiUrl}/lister`,
      body,
      this.getAuthHeaders())
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error, null))
      );
  }
  /**
   * Restaure un nature supprimé
   */
  restoreNature(idSousNature: number): Observable<SousNatureModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: SousNatureResponse; message: string; success: boolean }>(
      `${this.apiUrl}/restaurer`,
      { idSousNature: idSousNature },
      this.getAuthHeaders()
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return SousNatureModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Erreur lors de la restauration de la sous nature');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }


  /**
   * Recherche des nature par nom
   */
  searchSousNature(searchTerm: string): Observable<SousNatureSearchResponse> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<SousNatureSearchResponse>(
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
