import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthHelperService } from './auth-helper.service';
import { ProjetOperationModel, ProjetOperationCreate, ProjetOperationUpdate, ListProjetOperations } from '../../pages/projets/projet-operation';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ProjetOperationService {

  private apiUrl = 'http://localhost:5000/api/projet_operation';

  // Gestion du projet opération courant
  private currentProjetOperationSubject = new BehaviorSubject<ProjetOperationModel | null>(null);
  public currentProjetOperation$ = this.currentProjetOperationSubject.asObservable();

  private _projetOperationToEdit: ProjetOperationModel | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private authHelper: AuthHelperService
  ) {}

  /** Headers centralisés */
  private getAuthHeaders() {
    return this.authHelper.getAuthHeaders('ProjetOperationService');
  }

  /** Stocke un projet opération pour édition */
  setProjetOperationToEdit(operation: ProjetOperationModel) {
    this._projetOperationToEdit = operation;
  }

  /** Récupère le projet opération à éditer */
  getProjetOperationToEdit(): ProjetOperationModel | null {
    return this._projetOperationToEdit;
  }

  /** Efface le projet opération à éditer */
  clearProjetOperationToEdit() {
    this._projetOperationToEdit = null;
  }

  /** Crée un projet opération */
  createProjetOperation(data: ProjetOperationCreate): Observable<ProjetOperationModel | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<{ data: any; success: boolean; message?: string }>(
      `${this.apiUrl}/creer`,
      data,
      headers
    ).pipe(
      map(res => res.success ? ProjetOperationModel.fromResponse(res.data) : null),
      catchError(err => this.handleError(err, null))
    );
  }

  /** Liste des projets opération avec pagination */
  listProjetOperations(pageIndex = 1, pageSize = 10, id_projet?: number, type_operation?: string, actifOnly = false): Observable<ListProjetOperations | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null as any);

    const body = {
      page: pageIndex,
      per_page: pageSize,
      id_projet: id_projet,
      type_operation: type_operation,
      actifOnly: actifOnly,
    };
    return this.http.post<ListProjetOperations>(`${this.apiUrl}/lister`,
      body,
      this.getAuthHeaders())
      .pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /** Récupère une période par ID du projet*/
  getByProjet(idProjet: number): Observable<ListProjetOperations | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<ListProjetOperations>(`${this.apiUrl}/par_projet`,
      { idProjet: idProjet },
      headers)
      .pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /** Modifie un projet opération */
  updateProjetOperation(data: ProjetOperationUpdate): Observable<ProjetOperationModel | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<{ data: any; success: boolean; message?: string }>(
      `${this.apiUrl}/modifier`,
      data,
      headers
    ).pipe(
      map(res => res.success ? ProjetOperationModel.fromResponse(res.data) : null),
      catchError(err => this.handleError(err, null))
    );
  }

  /** Supprime un projet opération (soft delete) */
  deleteProjetOperation(id: number): Observable<{ message: string; success: boolean } | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<{ message: string; success: boolean }>(
      `${this.apiUrl}/supprimer`,
      { id_projet_operation: id },
      headers
    ).pipe(
      catchError(err => this.handleError(err, null))
    );
  }

  /** Active ou désactive un projet opération */
  toggleProjetOperation(id: number, actif?: boolean): Observable<ProjetOperationModel | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    const body: any = { id_projet_operation: id };
    if (actif !== undefined) body.actif = actif;

    return this.http.post<{ data: any; success: boolean }>(
      `${this.apiUrl}/supprimer`,
      body,
      headers
    ).pipe(
      map(res => res.success ? ProjetOperationModel.fromResponse(res.data) : null),
      catchError(err => this.handleError(err, null))
    );
  }

  /** Gestion centralisée des erreurs */
  private handleError<T>(error: HttpErrorResponse, result: T): Observable<T> {
    console.error('Erreur dans ProjetOperationService:', error);
    if (error.error?.message) console.error('Message:', error.error.message);
    if (error.status === 401) console.warn('Token expiré ou invalide');
    return of(result);
  }
}
