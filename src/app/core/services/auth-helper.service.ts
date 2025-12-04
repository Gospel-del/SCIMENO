import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class AuthHelperService {

  constructor(private authService: AuthService) {}

  /**
   * Génère les en-têtes avec JWT pour les requêtes HTTP
   * @param serviceName Nom du service pour les logs (optionnel)
   * @returns Objet contenant les headers d'authentification
   */
  getAuthHeaders(serviceName?: string): { headers: HttpHeaders } {
    const token = this.authService.getCurrentToken();

    if (serviceName) {
      console.log(`🔑 [${serviceName}] Token utilisé:`, token ? 'Token présent' : 'Token manquant');
    } else {
      console.log('🔑 [AuthHelper] Token utilisé:', token ? 'Token présent' : 'Token manquant');
    }

    if (!token) {
      console.warn('⚠️ Aucun token JWT trouvé. L\'utilisateur doit se reconnecter.');
      return { headers: new HttpHeaders() };
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return { headers };
  }

  /**
   * Vérifie si l'utilisateur est authentifié avant de faire une requête
   * @param serviceName Nom du service pour les logs
   * @returns true si authentifié, false sinon
   */
  checkAuthentication(serviceName?: string): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    const token = this.authService.getCurrentToken();

    if (!isAuthenticated || !token) {
      const service = serviceName ? `[${serviceName}]` : '[AuthHelper]';
      console.warn(`⚠️ ${service} Utilisateur non authentifié ou token manquant`);
      return false;
    }

    return true;
  }

  /**
   * Récupère le token JWT pour usage manuel
   * @returns Le token JWT ou null
   */
  getToken(): string | null {
    return this.authService.getCurrentToken();
  }

  /**
   * Génère les headers avec vérification d'authentification
   * @param serviceName Nom du service pour les logs
   * @returns Objet contenant les headers ou null si non authentifié
   */
  getAuthHeadersWithCheck(serviceName?: string): { headers: HttpHeaders } | null {
    if (!this.checkAuthentication(serviceName)) {
      return null;
    }

    return this.getAuthHeaders(serviceName);
  }
}
