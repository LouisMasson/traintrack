# 🤖 Configuration GitHub Actions Cron

## ✅ Ce qui est déjà fait

- ✅ Workflow créé : `.github/workflows/collect-trains.yml`
- ✅ Code poussé sur GitHub
- ✅ Secret `CRON_SECRET` configuré dans GitHub Settings

---

## 🔄 Après le déploiement Vercel

### 1. Mettre à jour l'URL dans le workflow

Une fois que Vercel vous donne votre URL de production (ex: `https://traintrack-xyz.vercel.app`), vous devez mettre à jour le workflow :

**Fichier** : `.github/workflows/collect-trains.yml`

**Ligne à modifier** :
```yaml
https://traintrack.vercel.app/api/cron/collect-trains
```

**Remplacer par votre vraie URL Vercel** :
```yaml
https://VOTRE-URL.vercel.app/api/cron/collect-trains
```

---

### 2. Activer le workflow manuellement (première fois)

1. Allez sur : https://github.com/LouisMasson/traintrack/actions
2. Cliquez sur le workflow **"Collect Train Data"** dans la liste de gauche
3. Cliquez sur **"Run workflow"** → **"Run workflow"**
4. Le workflow devrait s'exécuter et appeler votre endpoint Vercel

---

### 3. Vérifier que ça fonctionne

**Après la première exécution manuelle** :
- Vérifiez les logs dans GitHub Actions (onglet Actions)
- Devrait afficher : `✅ Train data collected successfully`
- Si erreur, vérifier que :
  - L'URL Vercel est correcte
  - Le secret `CRON_SECRET` est bien configuré
  - Vercel a bien les 5 environment variables

---

## ⏰ Fonctionnement Automatique

Une fois configuré, le workflow s'exécutera **automatiquement chaque minute** :
- Pas besoin de faire quoi que ce soit
- GitHub Actions appelle `/api/cron/collect-trains`
- Les données sont collectées et stockées dans Supabase
- L'application affiche les trains en temps réel

---

## 📊 Monitoring

### Logs GitHub Actions
- Voir toutes les exécutions : https://github.com/LouisMasson/traintrack/actions
- Chaque exécution montre :
  - Timestamp
  - HTTP status code (200 = succès)
  - Nombre de trains collectés

### Quotas
- **GitHub Actions gratuit** : 2000 minutes/mois
- **Utilisation pour cron minute** : ~1440 minutes/mois (24h × 60min)
- **Marge restante** : ~560 minutes pour autres workflows

✅ Largement dans les limites du plan gratuit !

---

## 🔧 Troubleshooting

### Workflow échoue avec 401 Unauthorized
- Vérifier que le secret `CRON_SECRET` dans GitHub correspond à la variable `CRON_SECRET` dans Vercel

### Workflow échoue avec 404 Not Found
- L'URL Vercel dans le workflow est incorrecte
- Vérifier que l'endpoint `/api/cron/collect-trains` existe et est déployé

### Workflow ne s'exécute pas automatiquement
- Les crons GitHub Actions ont parfois 5-10 minutes de délai
- Pas d'exécution garantie à la seconde exacte
- Déclenchement manuel fonctionne toujours

---

## 🎯 Résumé

**Architecture finale** :
```
GitHub Actions (gratuit, cron minute)
    ↓ appelle chaque minute
Vercel API /api/cron/collect-trains (gratuit)
    ↓ collecte les données
Swiss Transport API
    ↓ stocke dans
Supabase PostgreSQL (gratuit)
    ↓ affiche dans
Application Web sur Vercel (gratuit)
```

**Coût total** : 0€ 🎉
