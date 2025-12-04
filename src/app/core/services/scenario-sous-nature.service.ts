import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth';
import { AuthHelperService } from './auth-helper.service';
import {
  ScenarioSousNature,
  ScenarioSousNatureCreate,
  ScenarioSousNatureUpdate,
  ScenarioSousNatureResponse,
  ScenarioSousNatureModel,
  ListScenarioSousNatures
} from '../../models/scenarios';

@Injectable({
  providedIn: 'root'
})
export class ScenarioSousNatureService {
  private apiUrl = 'http://localhost:5000/api/scenario_sous_nature';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private authHelper: AuthHelperService
  ) {}

  /**
   * Crée un nouveau lien scenario-sous_nature
   */
  createScenarioSousNature(data: ScenarioSousNatureCreate): Observable<ScenarioSousNatureModel> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenarioSousNatureService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<{ data: ScenarioSousNatureResponse; message: string; success: boolean }>(
      `${this.apiUrl}/creer`,
      data,
      authHeaders
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return ScenarioSousNatureModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Erreur lors de la création du lien');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Liste les liens scenario-sous_nature avec pagination
   */
  listScenarioSousNatures(
    pageIndex: number = 1,
    pageSize: number = 10,
    idScenario?: number,
    idSousNature?: number
  ): Observable<ListScenarioSousNatures> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenarioSousNatureService');
    if (!authHeaders) {
      return of(null as any);
    }

    const body: any = {
      page: pageIndex,
      per_page: pageSize
    };
    if (idScenario) body.id_scenario = idScenario;
    if (idSousNature) body.id_sous_nature = idSousNature;

    return this.http.post<ListScenarioSousNatures>(
      `${this.apiUrl}/lister`,
      body,
      authHeaders
    ).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Obtient un lien par son ID
   */
  getScenarioSousNatureById(id: number): Observable<ScenarioSousNatureModel> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenarioSousNatureService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<{ data: ScenarioSousNatureResponse; message: string; success: boolean }>(
      `${this.apiUrl}/obtenir`,
      { id_scenario_sous_nature: id },
      authHeaders
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return ScenarioSousNatureModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Lien non trouvé');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Obtient un lien par scenario et sous-nature
   */
  getScenarioSousNatureByScenarioAndSousNature(
    idScenario: number,
    idSousNature: number
  ): Observable<ScenarioSousNatureModel> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenarioSousNatureService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<{ data: ScenarioSousNatureResponse; message: string; success: boolean }>(
      `${this.apiUrl}/obtenir_par_scenario_sous_nature`,
      { id_scenario: idScenario, id_sous_nature: idSousNature },
      authHeaders
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return ScenarioSousNatureModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Lien non trouvé');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Modifie un lien scenario-sous_nature
   */
  updateScenarioSousNature(data: ScenarioSousNatureUpdate): Observable<ScenarioSousNatureModel> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenarioSousNatureService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<{ data: ScenarioSousNatureResponse; message: string; success: boolean }>(
      `${this.apiUrl}/modifier`,
      data,
      authHeaders
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return ScenarioSousNatureModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Erreur lors de la modification du lien');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Calcule la valeur calculée
   */
  calculerValeur(id: number, valeurBase?: number): Observable<ScenarioSousNatureModel> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenarioSousNatureService');
    if (!authHeaders) {
      return of(null as any);
    }

    const body: any = { id_scenario_sous_nature: id };
    if (valeurBase !== undefined) {
      body.valeur_base = valeurBase;
    }

    return this.http.post<{ data: ScenarioSousNatureResponse; message: string; success: boolean }>(
      `${this.apiUrl}/calculer_valeur`,
      body,
      authHeaders
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return ScenarioSousNatureModel.fromResponse(response.data);
        }
        throw new Error(response.message || 'Erreur lors du calcul');
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Supprime un lien scenario-sous_nature
   */
  deleteScenarioSousNature(id: number): Observable<{ message: string; success: boolean }> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenarioSousNatureService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<{ message: string; success: boolean }>(
      `${this.apiUrl}/supprimer`,
      { id_scenario_sous_nature: id },
      authHeaders
    ).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Supprime un lien par scenario et sous-nature
   */
  deleteScenarioSousNatureByScenarioAndSousNature(
    idScenario: number,
    idSousNature: number
  ): Observable<{ message: string; success: boolean }> {
    const authHeaders = this.authHelper.getAuthHeadersWithCheck('ScenarioSousNatureService');
    if (!authHeaders) {
      return of(null as any);
    }

    return this.http.post<{ message: string; success: boolean }>(
      `${this.apiUrl}/supprimer_par_scenario_sous_nature`,
      { id_scenario: idScenario, id_sous_nature: idSousNature },
      authHeaders
    ).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Gère les erreurs HTTP
   */
  private handleError(error: HttpErrorResponse, errorValue: any): Observable<any> {
    console.error('Erreur dans ScenarioSousNatureService:', error);

    if (error.error && error.error.message) {
      console.error('Message d\'erreur:', error.error.message);
    }

    if (error.status === 401) {
      console.warn('Token expiré ou invalide');
    }

    return of(errorValue);
  }
}

