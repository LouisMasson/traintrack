# 🔑 Migration vers les Nouvelles Clés Supabase

## 📌 Contexte

Supabase a introduit un **nouveau système de clés API** plus sécurisé :

| Ancien (Legacy) | Nouveau (Moderne) | Usage |
|----------------|-------------------|-------|
| `anon` key (JWT) | **Publishable key** (`sb_publishable_xxx`) | Côté client (browser) |
| `service_role` key (JWT) | **Secret key** (`sb_secret_xxx`) | Côté serveur (API routes) |

**Bonne nouvelle** : Les deux systèmes peuvent coexister pendant la migration (zéro downtime) ✅

---

## ✅ Étape 1 : Créer les Nouvelles Clés

### A. Accéder au Dashboard Supabase

1. Allez sur : https://app.supabase.com
2. Sélectionnez votre projet
3. **Settings** (menu de gauche) → **API**

### B. Vérifier les Onglets

Vous devriez voir **2 onglets** :

1. **API Keys** (nouvelles clés - recommandées) ⭐
2. **Legacy API Keys** (anciennes clés - actuellement utilisées)

### C. Créer les Nouvelles Clés

**Dans l'onglet "API Keys"** :

- Si vous voyez déjà une **Publishable key** (`sb_publishable_xxx`) :
  - ✅ Copiez-la
  - ✅ Copiez aussi la **Secret key** correspondante

- Si aucune clé n'est visible :
  - Cliquez sur **"Create new API Keys"**
  - Supabase générera :
    - **Publishable key** (pour côté client)
    - **Secret key** (pour côté serveur)
  - ✅ Copiez les deux clés

⚠️ **Important** : Gardez ces clés dans un endroit sûr, vous en aurez besoin pour Vercel.

---

## ✅ Étape 2 : Ajouter les Nouvelles Variables dans Vercel

### A. Accéder aux Environment Variables

1. Allez sur : https://vercel.com
2. Sélectionnez votre projet **traintrack-fawn**
3. **Settings** → **Environment Variables**

### B. Ajouter les 2 Nouvelles Variables

Cliquez sur **"Add New"** pour chaque variable :

#### Variable 1 : Publishable Key
- **Name** : `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **Value** : `sb_publishable_xxxxxxxxxxxxx` (votre clé copiée)
- **Environments** : Production, Preview, Development (toutes cochées)

#### Variable 2 : Secret Key
- **Name** : `SUPABASE_SECRET_KEY`
- **Value** : `sb_secret_xxxxxxxxxxxxx` (votre clé copiée)
- **Environments** : Production, Preview, Development (toutes cochées)

### C. Garder les Anciennes Variables (Temporairement)

⚠️ **NE PAS SUPPRIMER** les anciennes variables pour l'instant :
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (garder)
- `SUPABASE_SERVICE_ROLE_KEY` (garder)

**Pourquoi ?** Le code supporte les deux systèmes. Si les nouvelles clés ont un problème, les anciennes prendront le relais automatiquement.

---

## ✅ Étape 3 : Déployer les Changements

### A. Push le Code Mis à Jour

Le code a déjà été mis à jour dans `lib/supabase.ts` pour supporter les deux systèmes.

```bash
git add .
git commit -m "feat: Support new Supabase Publishable/Secret keys

- Update lib/supabase.ts to support both legacy and new key systems
- New keys (publishable/secret) take precedence if present
- Fallback to legacy keys (anon/service_role) for backward compatibility
- Update .env.example with new key documentation"

git push origin main
```

### B. Vérifier le Déploiement Vercel

1. Vercel déploiera automatiquement après le push
2. Attendez ~2 minutes que le build se termine
3. ✅ Le déploiement devrait réussir

---

## ✅ Étape 4 : Vérifier que Tout Fonctionne

### Test 1 : API Trains Current

```bash
curl https://traintrack-fawn.vercel.app/api/trains/current | jq '.count'
```

**Résultat attendu** : Un nombre > 0 (ex: 105)

### Test 2 : GitHub Actions Cron

1. Allez sur : https://github.com/LouisMasson/traintrack/actions
2. Vérifiez les dernières exécutions
3. ✅ Devrait afficher : `✅ Train data collected successfully`

### Test 3 : Application Web

Ouvrez : https://traintrack-fawn.vercel.app/

- ✅ Map affiche les clusters de trains
- ✅ Cliquer sur cluster → popup fonctionne
- ✅ Pas d'erreurs dans la console (F12)

---

## ✅ Étape 5 : Désactiver les Anciennes Clés (Optionnel)

**Quand ?** Une fois que vous avez confirmé que tout fonctionne avec les nouvelles clés pendant au moins 24-48h.

### A. Vérifier que les Anciennes Clés ne sont Plus Utilisées

Dans Supabase Dashboard → Settings → API → **Legacy API Keys** :
- Regardez la colonne **"Last used"**
- Si pas d'activité récente → OK pour désactiver

### B. Désactiver (Pas Supprimer)

Dans le même onglet **Legacy API Keys** :
- Cliquez sur **"Deactivate"** pour chaque clé
- ⚠️ **Ne pas supprimer**, juste désactiver
- Vous pourrez les réactiver si besoin

### C. Nettoyer Vercel (Optionnel)

Une fois les anciennes clés désactivées pendant 1-2 semaines sans problème :

1. Vercel → Settings → Environment Variables
2. Supprimez les 2 anciennes variables :
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔧 Troubleshooting

### Problème : Erreur 401 après ajout des nouvelles clés

**Solution** :
1. Vérifiez que les variables Vercel sont bien nommées (pas de typo)
2. Vérifiez que vous avez copié les **bonnes** clés depuis Supabase
3. Redéployez manuellement dans Vercel

### Problème : Les anciennes clés fonctionnent mais pas les nouvelles

**Solution** :
1. Vérifiez dans Vercel Logs si les nouvelles variables sont bien chargées
2. Les nouvelles clés prennent priorité dans le code
3. Si les nouvelles clés ne marchent pas, le code utilise automatiquement les anciennes

### Problème : GitHub Actions échoue après migration

**Solution** :
1. Le cron utilise `SUPABASE_SECRET_KEY` (nouvelle) ou `SUPABASE_SERVICE_ROLE_KEY` (ancienne)
2. Vérifiez que l'une des deux est présente dans Vercel
3. Vérifiez les logs GitHub Actions pour voir l'erreur exacte

---

## 📊 Comparaison des Systèmes

| Caractéristique | Legacy (Ancien) | Moderne (Nouveau) |
|-----------------|-----------------|-------------------|
| **Format Anon/Publishable** | JWT long (`eyJhbGc...`) | `sb_publishable_xxx` |
| **Format Service/Secret** | JWT long (`eyJhbGc...`) | `sb_secret_xxx` |
| **Sécurité** | Bon | Meilleur ✅ |
| **Révocation** | Nécessite rotation JWT | Désactivation instantanée ✅ |
| **Monitoring** | Limité | "Last used" visible ✅ |
| **Transition** | - | Coexistence avec anciennes clés ✅ |

---

## ✅ Checklist de Migration

### Phase 1 : Préparation
- [ ] Créer nouvelles clés dans Supabase Dashboard (API Keys tab)
- [ ] Copier Publishable key (`sb_publishable_xxx`)
- [ ] Copier Secret key (`sb_secret_xxx`)

### Phase 2 : Configuration Vercel
- [ ] Ajouter `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dans Vercel
- [ ] Ajouter `SUPABASE_SECRET_KEY` dans Vercel
- [ ] Garder les anciennes variables (backup)

### Phase 3 : Déploiement
- [ ] Push code mis à jour vers GitHub
- [ ] Vérifier que Vercel déploie automatiquement
- [ ] Build succeed sans erreurs

### Phase 4 : Tests
- [ ] API `/api/trains/current` retourne données
- [ ] GitHub Actions cron réussit
- [ ] Application web fonctionne (map + analytics)
- [ ] Aucune erreur dans logs Vercel

### Phase 5 : Nettoyage (24-48h après)
- [ ] Vérifier "Last used" des anciennes clés dans Supabase
- [ ] Désactiver (pas supprimer) les anciennes clés Legacy
- [ ] Tester pendant 1-2 semaines
- [ ] Supprimer les anciennes variables Vercel (optionnel)

---

## 🎯 Résumé

**Migration en 3 étapes simples** :

1. **Créer** les nouvelles clés dans Supabase (API Keys tab)
2. **Ajouter** les 2 nouvelles variables dans Vercel
3. **Déployer** et vérifier que tout fonctionne

**Aucun risque** : Les anciennes clés restent actives comme backup automatique ! ✅

---

## 📚 Références

- [Supabase API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)
- [Migration Guide](https://supabase.com/docs/guides/troubleshooting/rotating-anon-service-and-jwt-secrets)
