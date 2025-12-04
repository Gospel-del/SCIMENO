# 🔍 Guide de diagnostic JWT - Erreur 401

## Problème identifié
Erreur 401 (UNAUTHORIZED) lors des requêtes vers l'API Flask.

## 🚀 Étapes de diagnostic

### 1. **Vérifier l'interceptor**
- Ouvrez la console du navigateur
- Allez sur `/auth-test` dans l'application
- Cliquez sur "Vérifier le token" et "Tester l'auth"
- Regardez les logs dans la console

### 2. **Vérifier le token dans le localStorage**
```javascript
// Dans la console du navigateur
console.log('Token localStorage:', localStorage.getItem('authToken'));
console.log('Token sessionStorage:', sessionStorage.getItem('authToken'));
```

### 3. **Vérifier les headers de la requête**
- Ouvrez l'onglet Network dans les DevTools
- Faites une requête vers l'API
- Vérifiez que l'header `Authorization: Bearer <token>` est présent

### 4. **Tester l'API directement**
```bash
# Remplacer YOUR_TOKEN par le token actuel
curl -X POST http://localhost:5000/api/auth/profil \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{}"
```

## 🛠️ Solutions possibles

### **Solution 1 : Token expiré**
```typescript
// Vérifier la validité du token
const token = localStorage.getItem('authToken');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.log('Token expiré');
      // Se reconnecter
    }
  } catch (e) {
    console.log('Token invalide');
  }
}
```

### **Solution 2 : Interceptor non actif**
Vérifier que l'interceptor est bien enregistré dans `app.config.ts`:
```typescript
{
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
}
```

### **Solution 3 : Format du token incorrect**
Le backend attend le format `Bearer <token>`. Vérifier que l'interceptor l'ajoute correctement.

### **Solution 4 : CORS ou headers manquants**
Vérifier que le backend accepte les headers `Authorization` et `Content-Type`.

## 🔧 Corrections appliquées

1. **Ajout de logs détaillés** dans l'interceptor
2. **Création d'un service de test** pour diagnostiquer
3. **Composant de test** accessible via `/auth-test`
4. **Vérification du format Bearer** dans l'interceptor

## 📋 Checklist de vérification

- [ ] Token présent dans localStorage/sessionStorage
- [ ] Token non expiré
- [ ] Interceptor enregistré dans app.config.ts
- [ ] Headers Authorization ajoutés correctement
- [ ] Backend accessible et fonctionnel
- [ ] CORS configuré pour accepter Authorization header

## 🚨 Actions immédiates

1. **Ouvrir la console** et aller sur `/auth-test`
2. **Cliquer sur "Vérifier le token"** pour voir l'état
3. **Cliquer sur "Tester l'auth"** pour tester l'API
4. **Regarder les logs** dans la console
5. **Partager les logs** si le problème persiste

## 📞 Informations à fournir en cas de problème

- Logs de la console (interceptor + erreurs)
- Contenu du token (premiers caractères)
- Headers de la requête dans Network
- Réponse exacte du serveur (401)
