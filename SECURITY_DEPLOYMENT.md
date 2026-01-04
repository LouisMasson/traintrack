# ⚠️ SÉCURITÉ - ACTIONS CRITIQUES APRÈS DÉPLOIEMENT

## 🔴 URGENT : Credentials Exposés

Les credentials suivants ont été accidentellement exposés dans le fichier `.env.local` commité dans Git. Ils **DOIVENT** être régénérés immédiatement après le déploiement.

### Credentials à Régénérer

#### 1. Supabase ANON Key
- **Localisation** : Supabase Dashboard → Project Settings → API
- **Variable** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Action** :
  1. Révoquer l'ancienne clé dans Supabase
  2. Générer une nouvelle clé
  3. Mettre à jour dans Vercel Environment Variables
  4. Redéployer

#### 2. Supabase SERVICE_ROLE Key
- **Localisation** : Supabase Dashboard → Project Settings → API
- **Variable** : `SUPABASE_SERVICE_ROLE_KEY`
- **Criticité** : 🔴 **TRÈS ÉLEVÉE** - Accès admin complet à la base de données
- **Action** :
  1. Révoquer immédiatement l'ancienne clé
  2. Générer une nouvelle clé
  3. Mettre à jour dans Vercel Environment Variables
  4. Redéployer

#### 3. Mapbox Token (Optionnel)
- **Localisation** : https://account.mapbox.com/access-tokens/
- **Variable** : `NEXT_PUBLIC_MAPBOX_TOKEN`
- **Criticité** : Moyenne (peut être utilisé publiquement mais limité)
- **Action** :
  1. Révoquer l'ancien token
  2. Créer un nouveau token avec restrictions URL : `*.vercel.app/*`
  3. Limiter les scopes : `styles:read`, `fonts:read`, `tiles:read`
  4. Mettre à jour dans Vercel Environment Variables
  5. Redéployer

---

## 📋 Checklist de Sécurité Post-Déploiement

- [ ] Supabase ANON key régénérée et mise à jour dans Vercel
- [ ] Supabase SERVICE_ROLE key régénérée et mise à jour dans Vercel
- [ ] Anciennes clés Supabase révoquées dans le dashboard
- [ ] Mapbox token régénéré avec restrictions URL (optionnel)
- [ ] Ancien Mapbox token révoqué
- [ ] Vercel project redéployé avec nouvelles variables
- [ ] Vérification que l'application fonctionne toujours après rotation

---

## 🔐 Configuration Row Level Security (Recommandé)

Pour sécuriser davantage la base de données, exécuter ce SQL dans Supabase SQL Editor :

```sql
-- Activer RLS sur les tables
ALTER TABLE train_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE train_metadata ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture publique (GET /api/trains/current utilise anon key)
CREATE POLICY "Public read access on train_positions"
  ON train_positions FOR SELECT
  USING (true);

CREATE POLICY "Public read access on train_metadata"
  ON train_metadata FOR SELECT
  USING (true);

-- Politique : Écriture uniquement avec service_role (cron job)
CREATE POLICY "Service role write access on train_positions"
  ON train_positions FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role upsert access on train_metadata"
  ON train_metadata FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

**Impact** :
- ✅ Protection contre insertions non autorisées via anon key
- ✅ Lecture publique maintenue pour les APIs
- ✅ Seul le cron job (service_role) peut écrire des données

---

## 📊 Monitoring Post-Déploiement

### Vercel
1. Activer "Error Tracking" dans Project Settings
2. Configurer alertes email pour :
   - Cron job failures
   - API errors (> 5% error rate)
   - Build failures

### Supabase
1. Dashboard → Reports
2. Surveiller :
   - Database size (limite: 500MB sur plan gratuit)
   - API requests (limite: 50,000 reads/mois)
   - Bandwidth (limite: 5GB/mois)

---

## 🚨 En Cas de Problème

Si vous constatez une utilisation suspecte :

### Supabase
1. Immédiatement : Reset database password
2. Révoquer toutes les clés API
3. Générer de nouvelles clés
4. Vérifier les logs d'activité dans Supabase

### Mapbox
1. Révoquer le token
2. Créer nouveau token avec restrictions strictes
3. Vérifier l'usage dans Mapbox Dashboard

---

## 📝 Notes

- Les credentials exposés sont visibles dans l'historique Git
- Même après rotation, l'historique Git contient les anciennes clés
- Pour une sécurité maximale, envisager de créer un nouveau repository privé
- Ne **JAMAIS** commiter des fichiers `.env*` dans Git à l'avenir

---

**Date de création** : 2025-01-04
**Statut** : ⚠️ ACTION REQUISE IMMÉDIATEMENT APRÈS DÉPLOIEMENT
