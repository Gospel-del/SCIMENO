import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Récupérer le token depuis le service d'authentification
    const token = this.authService.getCurrentToken();

    // Cloner la requête et ajouter le token d'autorisation si disponible
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Envoyer la requête modifiée
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si l'erreur est 401 (Non autorisé), rediriger vers la page de connexion
        if (error.status === 401) {
          console.warn('Token expiré ou invalide, redirection vers la connexion');
          this.authService.logout();
        }

        return throwError(() => error);
      })
    );
  }
}
