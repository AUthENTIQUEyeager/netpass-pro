# NetPass Pro — Déploiement Public

Plateforme de tickets WiFi automatisés (MikroTik + Wave + Vercel + Render + Supabase).

---

## Architecture

```
GitHub (ce repo)
  ├── frontend/   → Vercel  (Next.js)
  └── backend/    → Render  (Node.js + Express)
                       └── Supabase (PostgreSQL)
```

---

## Déploiement étape par étape

### 1. Base de données — Supabase

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Nouveau projet → notez le **mot de passe** de la BDD
3. Aller dans **Settings → Database → Connection string → URI**
4. Copier l'URL (format `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`)

---

### 2. Backend — Render

1. Créer un compte sur [render.com](https://render.com)
2. **New → Web Service** → connecter ce repo GitHub
3. Paramètres :
   - **Root Directory** : `backend`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Environment** : Node
4. Ajouter les variables d'environnement :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | URL Supabase copiée à l'étape 1 |
| `JWT_SECRET` | Chaîne aléatoire de 64 caractères |
| `WAVE_API_KEY` | Votre clé Wave (`wave_sn_prod_...`) |
| `WAVE_WEBHOOK_SECRET` | Votre secret Wave webhook |
| `FRONTEND_URL` | `https://votre-app.vercel.app` *(mettre à jour après étape 3)* |
| `PORT` | `3001` |

5. Déployer → notez l'URL du service (ex: `https://netpass-pro-api.onrender.com`)
6. Aller dans **Settings → Deploy Hook** → copier l'URL du hook

---

### 3. Frontend — Vercel

1. Créer un compte sur [vercel.com](https://vercel.com)
2. **New Project** → importer ce repo GitHub
3. Paramètres :
   - **Root Directory** : `frontend`
   - **Framework** : Next.js (détecté automatiquement)
4. Ajouter la variable d'environnement :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | URL Render de l'étape 2 |

5. Déployer → notez l'URL (ex: `https://netpass-pro.vercel.app`)
6. **Retourner sur Render** et mettre à jour `FRONTEND_URL` avec cette URL Vercel

---

### 4. GitHub Secrets (pour le déploiement automatique)

Dans votre repo GitHub → **Settings → Secrets → Actions** :

| Secret | Valeur |
|--------|--------|
| `RENDER_DEPLOY_HOOK_URL` | URL du deploy hook Render (étape 2.6) |

---

### 5. Webhook Wave

Dans votre dashboard Wave → Webhooks :
- **URL** : `https://votre-backend.onrender.com/webhooks/wave`
- **Events** : `checkout.session.completed`

---

### 6. Premier admin

Après le premier déploiement, créer votre compte admin :

```bash
curl -X POST https://votre-backend.onrender.com/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@votredomaine.com","password":"MotDePasseSecurise!","nom":"Admin"}'
```

Ou via l'interface : aller sur `https://votre-app.vercel.app/admin/login` → utiliser `/api/auth/setup`.

---

## Mise à jour (après le premier déploiement)

```bash
git add .
git commit -m "description des changements"
git push origin main
```

→ Vercel redéploie le frontend automatiquement.  
→ GitHub Actions déclenche le redéploiement Render via le webhook.

---

## Variables d'environnement résumé

### Backend (Render)
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
JWT_SECRET=votre_cle_secrete_de_64_caracteres
WAVE_API_KEY=wave_sn_prod_xxxxxxxxxxxx
WAVE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
FRONTEND_URL=https://votre-app.vercel.app
PORT=3001
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://votre-backend.onrender.com
```
