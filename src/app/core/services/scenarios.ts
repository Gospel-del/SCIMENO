import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth';
import { AuthHelperService } from './auth-helper.service';
import {
  Scenario,
  ScenarioCreate,
  ScenarioUpdate,
  ScenarioModel,
  ScenarioResponse,
  ListScenarios,
  ScenarioSearchResponse,
  ApplyScenarioRequest,
  ApplyScenarioResponse,
  ApplyMultipleScenarioRequest,
  ApplyMultipleScenarioResponse
} from '../../models/scenarios';

@Injectable({
  providedIn: 'root'
})
export class ScenariosService {
  private apiUrl = 'http://localhost:5000/api/scenario';
  private currentScenarioSubject = new BehaviorSubject<ScenarioModel | null>(null);
  public currentScenario$ = this.currentScenarioSubject.asObservable();

  private _scenarioToEdit: ScenarioModel | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private authHelper: AuthHelperService
  ) {}

  /**
   * Stocke un scénario pour l'édition
   */
  setScenarioToEdit(scenario: ScenarioModel): void {
    this._scenarioToEdit = scenario;
  }

  /**
   * Récupère le scénario à éditer
   */
  getScenarioToEdit(): ScenarioModel | null {
    return this._scenarioToEdit;
  }

  /**
   * Efface le scénario à éditer
   */
  clearScenarioToEdit(): void {
    this._scenarioToEdit = null;
  }

  /**
   * Crée un nouveau scénario
   */
  createScenario(scenarioData: ScenarioCreate): Observable<ScenarioModel> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenariosService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<{ data: ScenarioResponse; message: string; success: boolean }>(
      `${this.apiUrl}/creer`,
      scenarioData,
      authHeaders
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return ScenarioModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Erreur lors de la création du scénario');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Liste les scénarios avec pagination
   */
  listScenarios(pageIndex: number = 1, pageSize: number = 10, actifOnly: boolean = false): Observable<ListScenarios> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenariosService');
    if (!authHeaders) {
      return of(null as any);
    }

    const body = {
      page: pageIndex,
      per_page: pageSize,
      actif_only: actifOnly
    };

    return this.http.post<ListScenarios>(
      `${this.apiUrl}/lister`,
      body,
      authHeaders
    ).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Obtient un scénario par son ID
   */
  getScenarioById(idScenario: number): Observable<ScenarioModel> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenariosService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<{ data: ScenarioResponse; message: string; success: boolean }>(
      `${this.apiUrl}/obtenir`,
      { id_scenario: idScenario },
      authHeaders
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return ScenarioModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Scénario non trouvé');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Modifie un scénario
   */
  updateScenario(scenarioData: ScenarioUpdate): Observable<ScenarioModel> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenariosService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<{ data: ScenarioResponse; message: string; success: boolean }>(
      `${this.apiUrl}/modifier`,
      scenarioData,
      authHeaders
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return ScenarioModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Erreur lors de la modification du scénario');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Recherche des scénarios par nom
   */
  searchScenarios(searchTerm: string): Observable<ScenarioSearchResponse> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenariosService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<ScenarioSearchResponse>(
      `${this.apiUrl}/rechercher`,
      { terme_recherche: searchTerm },
      authHeaders
    ).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Supprime un scénario (soft delete)
   */
  deleteScenario(idScenario: number): Observable<{ message: string; success: boolean }> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenariosService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<{ message: string; success: boolean }>(
      `${this.apiUrl}/supprimer`,
      { id_scenario: idScenario },
      authHeaders
    ).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Restaure un scénario supprimé
   */
  restoreScenario(idScenario: number): Observable<ScenarioModel> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenariosService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<{ data: ScenarioResponse; message: string; success: boolean }>(
      `${this.apiUrl}/restaurer`,
      { id_scenario: idScenario },
      authHeaders
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return ScenarioModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Erreur lors de la restauration du scénario');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Active ou désactive un scénario
   */
  toggleScenario(idScenario: number, actif?: boolean): Observable<ScenarioModel> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenariosService');
    if (!authHeaders) {
      return of(null as any);
    }

    const body: any = { id_scenario: idScenario };
    if (actif !== undefined) {
      body.actif = actif;
    }

    return this.http.post<{ data: ScenarioResponse; message: string; success: boolean }>(
      `${this.apiUrl}/activer`,
      body,
      authHeaders
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return ScenarioModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Erreur lors de l\'activation/désactivation du scénario');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Applique un scénario à une valeur
   */
  applyScenario(request: ApplyScenarioRequest): Observable<ApplyScenarioResponse> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenariosService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<ApplyScenarioResponse>(
      `${this.apiUrl}/appliquer`,
      request,
      authHeaders
    ).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Applique un scénario à plusieurs valeurs
   */
  applyScenarioMultiple(request: ApplyMultipleScenarioRequest): Observable<ApplyMultipleScenarioResponse> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenariosService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<ApplyMultipleScenarioResponse>(
      `${this.apiUrl}/appliquer_multiple`,
      request,
      authHeaders
    ).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Annule l'application d'un scénario
   */
  cancelScenario(idScenario: number, idSousNature?: number, supprimerEntree: boolean = false): Observable<any> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenariosService');
    if (!authHeaders) {
      return of(null as any);
    }

    const body: any = { id_scenario: idScenario };
    if (idSousNature !== undefined) {
      body.id_sous_nature = idSousNature;
      body.supprimer_entree = supprimerEntree;
    } else {
      body.supprimer_entrees = supprimerEntree;
    }

    return this.http.post<any>(
      `${this.apiUrl}/annuler`,
      body,
      authHeaders
    ).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Gère les erreurs HTTP
   */
  private handleError(error: HttpErrorResponse, errorValue: any): Observable<any> {
    console.error('Erreur dans ScenariosService:', error);

    if (error.error && error.error.message) {
      console.error('Message d\'erreur:', error.error.message);
    }

    if (error.status === 401) {
      console.warn('Token expiré ou invalide');
      // Optionnel: rediriger vers la page de connexion
      // this.authService.logout();
    }

    return of(errorValue);
  }
}
