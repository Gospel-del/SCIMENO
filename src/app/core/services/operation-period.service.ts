import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthHelperService } from './auth-helper.service';
import { ListOperationPeriods, OperationPeriodCreate, OperationPeriodModel, OperationPeriodUpdate } from '../../pages/projets/operation-periode';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class OperationPeriodService {

  private apiUrl = 'http://localhost:5000/api/operation_periode';

  // Gestion d'une période opérationnelle courante
  private currentOperationPeriodSubject = new BehaviorSubject<OperationPeriodModel | null>(null);
  public currentOperationPeriod$ = this.currentOperationPeriodSubject.asObservable();

  private _operationPeriodToEdit: OperationPeriodModel | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private authHelper: AuthHelperService
  ) {}

  /** Headers centralisés */
  private getAuthHeaders() {
    return this.authHelper.getAuthHeaders('OperationPeriodService');
  }

  /** Stocke une période pour édition */
  setOperationPeriodToEdit(period: OperationPeriodModel) {
    this._operationPeriodToEdit = period;
  }

  /** Récupère la période à éditer */
  getOperationPeriodToEdit(): OperationPeriodModel | null {
    return this._operationPeriodToEdit;
  }

  /** Efface la période à éditer */
  clearOperationPeriodToEdit() {
    this._operationPeriodToEdit = null;
  }

  /** Crée une nouvelle période opérationnelle */
  createOperationPeriod(data: OperationPeriodCreate): Observable<OperationPeriodModel | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<{ data: any; success: boolean; message?: string }>(
      `${this.apiUrl}/creer`,
      data,
      headers
    ).pipe(
      map(res => res.success ? OperationPeriodModel.fromResponse(res.data) : null),
      catchError(err => this.handleError(err, null))
    );
  }

  /** Liste les périodes avec pagination */
  listOperationPeriods(pageIndex = 1, pageSize = 10, idProjet?: number, typeOperation?: string, annee?: number, actifOnly = false): Observable<ListOperationPeriods | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    const body = {
      page: pageIndex,
      per_page: pageSize,
      idProjet: idProjet,
      typeOperation: typeOperation,
      annee: annee,
      actifOnly: actifOnly,
    };

    return this.http.post<ListOperationPeriods>(`${this.apiUrl}/lister`,
      body,
      this.getAuthHeaders())
      .pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }


  /** Récupère une période par ID du projet*/
  getByProjet(idProjet: number): Observable<ListOperationPeriods | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<ListOperationPeriods>(`${this.apiUrl}/par_projet`,
      { idProjet: idProjet },
      headers)
      .pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /** Modifie une période */
  updateOperationPeriod(data: OperationPeriodUpdate): Observable<OperationPeriodModel | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<{ data: any; success: boolean; message?: string }>(
      `${this.apiUrl}/modifier`,
      data,
      headers
    ).pipe(
      map(res => res.success ? OperationPeriodModel.fromResponse(res.data) : null),
      catchError(err => this.handleError(err, null))
    );
  }

  /** Supprime une période (soft delete) */
  deleteOperationPeriod(id: number): Observable<{ message: string; success: boolean } | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    return this.http.post<{ message: string; success: boolean }>(
      `${this.apiUrl}/supprimer`,
      { id_operation_period: id },
      headers
    ).pipe(
      catchError(err => this.handleError(err, null))
    );
  }

  /** Active ou désactive une période */
  toggleOperationPeriod(id: number, actif?: boolean): Observable<OperationPeriodModel | null> {
    const headers = this.getAuthHeaders();
    if (!headers) return of(null);

    const body: any = { id_operation_period: id };
    if (actif !== undefined) body.actif = actif;

    return this.http.post<{ data: any; success: boolean }>(
      `${this.apiUrl}/toggle`,
      body,
      headers
    ).pipe(
      map(res => res.success ? OperationPeriodModel.fromResponse(res.data) : null),
      catchError(err => this.handleError(err, null))
    );
  }

  /** Gestion centralisée des erreurs */
  private handleError<T>(error: HttpErrorResponse, result: T): Observable<T> {
    console.error('Erreur dans OperationPeriodService:', error);
    if (error.error?.message) console.error('Message:', error.error.message);
    if (error.status === 401) console.warn('Token expiré ou invalide');
    return of(result);
  }
}
