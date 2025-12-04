# 🔐 Authentification JWT avec Fallback Local

## Vue d'ensemble

Cette application utilise un système d'authentification JWT avec un fallback local pour permettre le développement sans backend.

## 🚀 Fonctionnalités

### ✅ Authentification JWT complète
- **Tokens JWT** avec expiration (24h)
- **Intercepteur HTTP** pour ajouter automatiquement les tokens
- **Vérification de validité** des tokens
- **Déconnexion automatique** en cas de token expiré

### ✅ Authentification locale par défaut
- **3 utilisateurs prédéfinis** pour le développement
- **Fallback automatique** si l'API backend n'est pas disponible
- **Génération de tokens JWT locaux** pour la démo

## 👥 Utilisateurs par défaut

| Email | Mot de passe | Fonction | Description |
|-------|-------------|----------|-------------|
| `admin@example.com` | `admin` | Administrateur | Accès complet |
| `john.doe@example.com` | `password` | Utilisateur | Accès standard |
| `jane.manager@example.com` | `manager` | Gestionnaire | Accès gestion |

## 🔧 Architecture

### Services
- **`AuthService`** : Gestion de l'authentification
- **`JwtService`** : Manipulation des tokens JWT
- **`AuthInterceptor`** : Intercepteur HTTP pour les tokens

### Composants
- **`LoginComponent`** : Page de connexion
- **`AuthTestComponent`** : Test d'authentification (`/auth-test`)

## 🛠️ Utilisation

### 1. Connexion
1. Allez sur `http://localhost:4222/`
2. Utilisez les identifiants ci-dessus
3. L'application génère automatiquement un token JWT

### 2. Test d'authentification
1. Connectez-vous
2. Cliquez sur votre nom dans le header
3. Sélectionnez "Test Auth"
4. Vérifiez les informations de votre session

### 3. Déconnexion
- Cliquez sur "Logout" dans le menu utilisateur
- Ou laissez le token expirer (24h)

## 🔒 Sécurité

### Tokens JWT
- **Expiration** : 24 heures
- **Signature** : Base64 simple (pour la démo)
- **Contenu** : ID utilisateur, email, fonction, timestamps

### Vérifications
- **Validité du token** au chargement
- **Expiration automatique** de la session
- **Redirection** vers login si token invalide

## 🌐 API Backend (optionnel)

Si vous avez un backend Flask, l'application tentera de s'y connecter en premier :

```python
# Endpoints attendus
POST /api/auth/connexion
POST /api/auth/deconnexion
POST /api/auth/rafraichir_token
POST /api/auth/verifier_token
POST /api/auth/profil
```

## 📝 Développement

### Ajouter un utilisateur
Modifiez le tableau `defaultUsers` dans `AuthService.loginLocal()` :

```typescript
const defaultUsers = [
  // ... utilisateurs existants
  {
    idUtilisateur: 4,
    nom: 'Nouveau',
    prenom: 'User',
    fonction: 'Utilisateur',
    email: 'nouveau@example.com',
    telephone: '0123456789',
    motDePasse: 'password',
    statut: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];
```

### Modifier la durée des tokens
Dans `JwtService.generateLocalToken()` :

```typescript
exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 heures
```

## 🐛 Dépannage

### Problèmes courants
1. **Token expiré** : Reconnectez-vous
2. **API backend indisponible** : L'authentification locale se déclenche automatiquement
3. **Erreurs de compilation** : Vérifiez les imports dans `app.config.ts`

### Logs utiles
- Ouvrez la console du navigateur
- Regardez les messages de l'`AuthService`
- Vérifiez les tokens dans `localStorage`

## 🎯 Prochaines étapes

1. **Backend Flask** : Implémentez les endpoints JWT
2. **Refresh tokens** : Ajoutez le renouvellement automatique
3. **Rôles avancés** : Implémentez la gestion des permissions
4. **2FA** : Ajoutez l'authentification à deux facteurs

---

**L'authentification JWT est maintenant complètement fonctionnelle ! 🚀**
