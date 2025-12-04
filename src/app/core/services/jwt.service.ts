import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  /**
   * Décode un token JWT
   */
  decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT invalide');
      }

      const payload = parts[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  /**
   * Vérifie si un token est expiré
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return true;
    }
  }

  /**
   * Vérifie si un token est valide
   */
  isValidToken(token: string): boolean {
    if (!token) {
      return false;
    }

    try {
      const payload = this.decodeToken(token);
      return payload && !this.isTokenExpired(token);
    } catch (error) {
      return false;
    }
  }

  /**
   * Extrait les informations utilisateur du token
   */
  getUserFromToken(token: string): any {
    try {
      const payload = this.decodeToken(token);
      return {
        id: payload.sub,
        email: payload.email,
        fonction: payload.fonction,
        iat: payload.iat,
        exp: payload.exp
      };
    } catch (error) {
      console.error('Erreur lors de l\'extraction des informations utilisateur:', error);
      return null;
    }
  }

  /**
   * Génère un token JWT local (pour la démo)
   */
  generateLocalToken(user: any): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      sub: user.idUtilisateur,
      email: user.email,
      fonction: user.fonction,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 heures
    };

    // Encodage base64 simple (pour la démo)
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.secret`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}
