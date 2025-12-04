import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthHelperService } from './auth-helper.service';
import { EmpruntCreate, EmpruntModel, EmpruntUpdate, ListEmprunts } from '../../pages/emprunts/emprunt';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class EmpruntService {

  private apiUrl = 'http://localhost:5000/api/emprunt';

  // Gestion d'un emprunt courant (optionnel)
  private currentEmpruntSubject = new BehaviorSubject<EmpruntModel | null>(null);
  public currentEmprunt$ = this.currentEmpruntSubject.asObservable();

  private _empruntToEdit: EmpruntModel | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private authHelper: AuthHelperService
  ) {}

  /** Headers centralisés */
  private getAuthHeaders() {
    return this.authHelper.getAuthHeaders('EmpruntService');
  }


  /** Stocke un emprunt pour édition */
  setEmpruntToEdit(emprunt: EmpruntModel) {
    this._empruntToEdit = emprunt;
  }

  /** Récupère l'emprunt à éditer */
  getEmpruntToEdit(): EmpruntModel | null {
    return this._empruntToEdit;
  }

  /** Efface l'emprunt à éditer */
  clearEmpruntToEdit() {
    this._empruntToEdit = null;
  }

  /** Crée un nouvel emprunt */
  createEmprunt(data: EmpruntCreate): Observable<EmpruntModel | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<{ data: any; success: boolean; message?: string }>(
      `${this.apiUrl}/creer_emprunt`, data,  headers
    ).pipe(
      map(res => res.success ? EmpruntModel.fromResponse(res.data) : null),
      catchError(err => this.handleError(err, null))
    );
  }

  /** Liste les emprunts avec pagination */
  listEmprunts(pageIndex = 1, pageSize = 10, idProjet?: number, actifOnly = false): Observable<ListEmprunts | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null as any);

    const body = {
      page: pageIndex,
      per_page: pageSize,
      idProjet: idProjet,
      actifOnly: actifOnly,
    };

    return this.http.post<ListEmprunts>(`${this.apiUrl}/lister_emprunts_projet`,
      body,
      this.getAuthHeaders())
      .pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /** Récupère un emprunt par son ID */
  getEmpruntById(id: number): Observable<EmpruntModel | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<{ data: any; success: boolean; message?: string }>(
      `${this.apiUrl}/obtenir`,
      { id_emprunt: id },
       headers
    ).pipe(
      map(res => res.success ? EmpruntModel.fromResponse(res.data) : null),
      catchError(err => this.handleError(err, null))
    );
  }

  /** Récupère une période par ID du projet*/
  getByProjet(idProjet: number): Observable<ListEmprunts | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<ListEmprunts>(`${this.apiUrl}/lister_emprunts_projet`,
      { idProjet: idProjet },
      headers)
      .pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /** Modifie un emprunt */
  updateEmprunt(data: EmpruntUpdate): Observable<EmpruntModel | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<{ data: any; success: boolean; message?: string }>(
      `${this.apiUrl}/modifier_emprunt`,
      data,
      headers
    ).pipe(
      map(res => res.success ? EmpruntModel.fromResponse(res.data) : null),
      catchError(err => this.handleError(err, null))
    );
  }

  /** Supprime un emprunt (soft delete) */
  /*
  deleteEmprunt(id: number): Observable<{ message: string; success: boolean } | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<{ message: string; success: boolean }>(
      `${this.apiUrl}/supprimer`,
      { id_emprunt: id },
      headers
    ).pipe(
      catchError(err => this.handleError(err, null))
    );
  }
    */

  /** Active ou désactive un emprunt */
  /*
  toggleEmprunt(id: number, actif?: boolean): Observable<EmpruntModel | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    const body: any = { id_emprunt: id };
    if (actif !== undefined) body.actif = actif;

    return this.http.post<{ data: any; success: boolean }>(
      `${this.apiUrl}/activer`,
      body,
      headers
    ).pipe(
      map(res => res.success ? EmpruntModel.fromResponse(res.data) : null),
      catchError(err => this.handleError(err, null))
    );
  }*/

  /** Gestion centralisée des erreurs */
  private handleError<T>(error: HttpErrorResponse, result: T): Observable<T> {
    console.error('Erreur dans EmpruntService:', error);
    if (error.error?.message) console.error('Message:', error.error.message);
    if (error.status === 401) console.warn('Token expiré ou invalide');
    return of(result);
  }
}
