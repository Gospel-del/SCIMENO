import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { ListRegleCalculs, RegleCalcul, RegleCalculCreate, RegleCalculModel, RegleCalculResponse } from '../../pages/regle-calculs/regle-calcul';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth';
import { AuthHelperService } from './auth-helper.service';

@Injectable({
  providedIn: 'root'
})
export class RegleCalculService {
  private apiUrl = 'http://localhost:5000/api/regle_calcul'; // URL de votre API Flask
  private currentUserSubject = new BehaviorSubject<RegleCalculModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private _regleCalculToEdit: RegleCalcul | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private authHelper: AuthHelperService
  ) {}

  setRegleCalculToEdit(regleCalcul: RegleCalcul) {
    this._regleCalculToEdit = regleCalcul;
  }

  getRegleCalculToEdit(): RegleCalcul | null {
    return this._regleCalculToEdit;
  }

  clearRegleCalculToEdit() {
    this._regleCalculToEdit = null;
  }

  /**
   * Génère les en-têtes avec JWT
  */
  private getAuthHeaders() {
    return this.authHelper.getAuthHeaders('RegleCalculService');
  }

  /**
   * Crée un nouveau RegleCalcul
   */
  createRegleCalcul(regleCalculData: RegleCalculCreate): Observable<RegleCalculModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: RegleCalculResponse; message: string; success: boolean }>(`${this.apiUrl}/creer`, regleCalculData, this.getAuthHeaders())
      .pipe(
        map(result => {
          if (result.success && result.data) {
            return RegleCalculModel.fromResponse(result.data);
          }
          throw new Error(result.message || 'Erreur lors de la création de la règle');
        }),
        catchError((error) => this.handleError(error, undefined))
      );
  }

  /**
   * editer un RegleCalcul
  */
  updateRegleCalcul(regleCalculData: RegleCalcul): Observable<RegleCalculModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: RegleCalculResponse; message: string; success: boolean }>(`${this.apiUrl}/modifier`, regleCalculData, this.getAuthHeaders())
      .pipe(
        map(result => {
          if (result.success && result.data) {
            return RegleCalculModel.fromResponse(result.data);
          }
          throw new Error(result.message || 'Erreur lors de la modification de la nature');
        }),
        catchError((error) => this.handleError(error, undefined))
      );
  }


  /**
   * supprimer un client
   */
  deleteRegleCalcul(regleCalculData: RegleCalcul): Observable<RegleCalculModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<RegleCalculResponse>(`${this.apiUrl}/supprimer`, regleCalculData, this.getAuthHeaders())
      .pipe(
        map(result => RegleCalculModel.fromResponse(result)),
        catchError((error) => this.handleError(error, undefined))
      );
  }

  /**
   * Lister les clients
   */
  listRegleCalculs(pageIndex: number, pageSize: number, typeNature?: string[], idSousNature?: string): Observable<any> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      page: pageIndex,
      per_page: pageSize,
      typeNature: typeNature,
      idSousNature: idSousNature,
    };

    return this.http.post<ListRegleCalculs>(`${this.apiUrl}/lister`, body, this.getAuthHeaders());
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
