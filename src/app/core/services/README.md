# Services d'Authentification et de Session

## Vue d'ensemble

Ce système d'authentification utilise JWT (JSON Web Tokens) pour gérer l'authentification des utilisateurs et les sessions. Il comprend trois services principaux :

1. **AuthService** - Gestion de l'authentification JWT
2. **SessionService** - Gestion des sessions utilisateur
3. **JwtService** - Utilitaires pour les tokens JWT

## AuthService

### Fonctionnalités principales

- **Connexion** : Authentification avec email/mot de passe
- **Déconnexion** : Nettoyage des données d'authentification
- **Gestion des tokens** : Stockage et validation des tokens JWT
- **Fallback local** : Authentification locale si le backend n'est pas disponible
- **Rafraîchissement de token** : Renouvellement automatique des tokens

### Utilisation

```typescript
// Injection du service
constructor(private authService: AuthService) {}

// Connexion
this.authService.login(email, password).subscribe({
  next: (success) => {
    if (success) {
      // Connexion réussie
      console.log('Utilisateur connecté');
    }
  },
  error: (error) => {
    // Gestion des erreurs
    console.error('Erreur de connexion:', error);
  }
});

// Vérification de l'état d'authentification
if (this.authService.isAuthenticated()) {
  const user = this.authService.getCurrentUser();
  console.log('Utilisateur connecté:', user.getFullName());
}

// Déconnexion
this.authService.logout();
```

## SessionService

### Fonctionnalités principales

- **Gestion des sessions** : Stockage temporaire des données utilisateur
- **Persistance** : Sauvegarde dans sessionStorage et localStorage
- **Validation** : Vérification de la validité des sessions
- **Expiration** : Gestion automatique de l'expiration des sessions (30 minutes)
- **Observables** : Réactivité aux changements de session

### Utilisation

```typescript
// Injection du service
constructor(private sessionService: SessionService) {}

// S'abonner aux changements de session
this.sessionService.sessionData$.subscribe(sessionData => {
  console.log('Session mise à jour:', sessionData);
});

// Vérifier la validité de la session
if (this.sessionService.isSessionValid()) {
  console.log('Session valide');
}

// Rafraîchir la session
this.sessionService.refreshSession();

// Effacer la session
this.sessionService.clearSession();
```

## JwtService

### Fonctionnalités principales

- **Décodage** : Décodage des tokens JWT
- **Validation** : Vérification de la validité des tokens
- **Extraction** : Récupération des informations utilisateur depuis les tokens
- **Génération locale** : Création de tokens pour la démo (fallback)

### Utilisation

```typescript
// Injection du service
constructor(private jwtService: JwtService) {}

// Vérifier la validité d'un token
if (this.jwtService.isValidToken(token)) {
  console.log('Token valide');
}

// Extraire les informations utilisateur
const userInfo = this.jwtService.getUserFromToken(token);
console.log('Utilisateur:', userInfo);
```

## Configuration

### Backend Flask

Le service est configuré pour communiquer avec un backend Flask sur `http://localhost:5000/api`. Les endpoints utilisés sont :

- `POST /api/auth/connexion` - Connexion
- `POST /api/auth/deconnexion` - Déconnexion
- `POST /api/auth/profil` - Récupération du profil
- `POST /api/auth/verifier_token` - Vérification du token
- `POST /api/auth/rafraichir_token` - Rafraîchissement du token

### Fallback local

Si le backend n'est pas disponible, le service utilise des utilisateurs par défaut :

- **admin@example.com** / **admin** (Administrateur)
- **john.doe@example.com** / **password** (Utilisateur)
- **jane.manager@example.com** / **manager** (Gestionnaire)

## Stockage des données

### SessionStorage (temporaire)
- `currentUser` - Données utilisateur
- `authToken` - Token JWT
- `isAuthenticated` - État d'authentification
- `lastActivity` - Dernière activité

### LocalStorage (persistant)
- `currentUser` - Données utilisateur
- `authToken` - Token JWT

## Gestion des erreurs

Le système gère plusieurs types d'erreurs :

- **401 Unauthorized** - Token invalide ou expiré
- **500 Internal Server Error** - Erreur serveur
- **0 Network Error** - Problème de connexion
- **Erreurs de validation** - Données invalides

## Sécurité

- Les mots de passe sont hashés côté backend
- Les tokens JWT sont validés à chaque requête
- Les sessions expirent après 30 minutes d'inactivité
- Les données sensibles ne sont pas stockées en clair

## Test

Utilisez le composant `AuthTestComponent` pour tester les fonctionnalités :

```typescript
// Accéder à /auth-test pour voir l'interface de test
```

## Exemple complet

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth';
import { SessionService } from './core/services/session.service';

@Component({
  selector: 'app-example',
  template: `
    <div *ngIf="isAuthenticated; else loginTemplate">
      <h2>Bienvenue {{ currentUser?.getFullName() }}!</h2>
      <button (click)="logout()">Déconnexion</button>
    </div>
    <ng-template #loginTemplate>
      <form (ngSubmit)="login()">
        <input [(ngModel)]="email" placeholder="Email" type="email">
        <input [(ngModel)]="password" placeholder="Mot de passe" type="password">
        <button type="submit">Connexion</button>
      </form>
    </ng-template>
  `
})
export class ExampleComponent implements OnInit {
  isAuthenticated = false;
  currentUser: UtilisateurModel | null = null;
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    // Vérifier l'état d'authentification
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();

    // S'abonner aux changements
    this.sessionService.sessionData$.subscribe(sessionData => {
      this.isAuthenticated = sessionData.isAuthenticated;
      this.currentUser = sessionData.user;
    });
  }

  login(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        if (success) {
          console.log('Connexion réussie');
        }
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
```
