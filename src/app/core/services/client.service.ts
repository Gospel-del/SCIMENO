import { Client, ClientSearchResponse } from './../../pages/clients/client';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { ClientCreate, ClientModel, ClientResponse, ClientUpdate, ListClients } from '../../pages/clients/client';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthHelperService } from './auth-helper.service';
import { AuthService } from './auth';





@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:5000/api/clients'; // URL de votre API Flask
  private currentUserSubject = new BehaviorSubject<ClientModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private _clientToEdit: Client | null = null;

  constructor(private http: HttpClient,
        private authService: AuthService,
        private authHelper: AuthHelperService
  ) {}

  setClientToEdit(client: Client) {
    this._clientToEdit = client;
  }

  getClientToEdit(): Client | null {
    return this._clientToEdit;
  }

  clearClientToEdit() {
    this._clientToEdit = null;
  }

  /**
   * Génère les en-têtes avec JWT
  */
  private getAuthHeaders() {
    return this.authHelper.getAuthHeaders('ClientService');
  }

  /**
   * Crée un nouveau client
   */
  createClient(clientData: ClientCreate): Observable<ClientModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: ClientResponse; message: string; success: boolean }>(`${this.apiUrl}/creer_client`,
      clientData,
      this.getAuthHeaders())
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return ClientModel.fromResponse(response.data);
          }
          throw new Error(response.message || 'Erreur lors du client');
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error, null))
      );
  }


  /**
   * editer un client
   */
  updateClient(clientData: Client): Observable<ClientModel> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ data: ClientResponse; message: string; success: boolean }>(`${this.apiUrl}/modifier_client`,
      clientData,
      this.getAuthHeaders())
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return ClientModel.fromResponse(response.data);
          }
          throw new Error(response.message || 'Erreur lors de la modification du client');
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error, null))
      );
  }

  /**
   * supprimer un client
   */
  deleteClient(clientData: Client): Observable<{ message: string; success: boolean }> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<{ message: string; success: boolean }>(`${this.apiUrl}/supprimer_client`,
      { idClient: clientData.idClient },
      this.getAuthHeaders())
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error, null))
      );
  }

  /**
   * Recherche des nature par nom
   */
  searchClient(searchTerm: string): Observable<ClientSearchResponse> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    return this.http.post<ClientResponse>(
      `${this.apiUrl}/rechercher_clients`,
      { terme_recherche: searchTerm },
      this.getAuthHeaders()
    ).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, null))
    );
  }

  /**
   * Lister les clients
   */
  listClients(pageIndex: number, pageSize: number, recherche?: string): Observable<ListClients> {
    if (!this.getAuthHeaders()) {
      return of(null as any);
    }
    const body = {
      page: pageIndex,
      size: pageSize,
      recherche: recherche
    };

    return this.http.post<ListClients>(`${this.apiUrl}/lister_clients`,
      body,
      this.getAuthHeaders())
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error, null))
      );
  }

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
