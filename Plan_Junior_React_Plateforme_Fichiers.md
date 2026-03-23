# 🗓️ Plan de développement — Dev Junior
## Plateforme de transfert de fichiers · React + Node.js/Express
**Durée estimée : 11 semaines · Démarrage : Mars 2025**

> Ce plan est conçu pour avancer **une étape à la fois**, sans se noyer.
> Chaque semaine a un objectif clair, un livrable concret, et des ressources pour comprendre avant de coder.

---

## 🔰 Avant de commencer — La règle d'or

```
Lis → Comprends → Code → Teste → Passe à la suite
Ne jamais copier-coller sans comprendre ce que tu colles.
```

---

## 📅 SEMAINE 1 — Mise en place de l'environnement
**Objectif : avoir un projet qui "tourne" localement, même vide**

### ✅ Ce que tu dois faire
- [ ] Installer Node.js LTS et VS Code
- [ ] Créer le dossier projet `plateforme-fichiers/`
- [ ] Créer le dossier `backend/` → `npm init -y`
- [ ] Installer Express : `npm install express`
- [ ] Créer un `server.js` qui répond `"Hello World"` sur `http://localhost:3000`
- [ ] Créer le projet React : `npm create vite@latest frontend -- --template react`
- [ ] Dans `frontend/` → `npm install` → `npm run dev` → voir la page par défaut React dans le navigateur

### 📦 Livrable de la semaine
> Le backend répond sur le port 3000, le frontend React s'ouvre dans le navigateur sur le port 5173.

### 📚 Ressources
| Sujet | Lien |
|-------|------|
| Installer Node.js | https://nodejs.org/en/download |
| Créer un projet React avec Vite | https://vitejs.dev/guide |
| Express en 10 min | https://expressjs.com/en/starter/hello-world.html |
| VS Code extensions utiles | ES7+ React Snippets, REST Client, ESLint, Prettier |

---

## 📅 SEMAINE 2 — Base de données + structure du backend
**Objectif : comprendre comment Node.js parle à une base de données**

### ✅ Ce que tu dois faire
- [ ] Installer `better-sqlite3` : `npm install better-sqlite3`
- [ ] Créer `src/config/db.js` qui initialise une base SQLite
- [ ] Créer les 3 tables essentielles : `users`, `files`, `audit_logs`
- [ ] Tester avec un script : insérer un utilisateur fictif, le relire
- [ ] Organiser les dossiers : `src/config/`, `src/routes/`, `src/controllers/`

### 📦 Livrable de la semaine
> Une base SQLite existe avec les bonnes tables. Tu peux lire/écrire dedans via un script Node.

### 📚 Ressources
| Sujet | Lien |
|-------|------|
| SQLite c'est quoi ? | https://www.sqlite.org/whentouse.html |
| better-sqlite3 — docs | https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md |
| SQL pour débutants | https://sqlzoo.net/wiki/SELECT_basics |
| Structure d'un projet Express | https://expressjs.com/en/starter/generator.html |

---

## 📅 SEMAINE 3 — Authentification JWT (sans Active Directory d'abord)
**Objectif : comprendre comment fonctionne un login sécurisé avec JWT**

### ✅ Ce que tu dois faire
- [ ] Installer `jsonwebtoken`, `bcryptjs`, `dotenv`
- [ ] Créer un fichier `.env` avec `JWT_SECRET` et `PORT`
- [ ] Créer la route `POST /api/auth/login` (identifiant + mot de passe en dur d'abord)
- [ ] Si valide → générer un token JWT et le retourner
- [ ] Créer un middleware `authMiddleware.js` qui vérifie le token sur chaque requête protégée
- [ ] Tester avec VS Code REST Client ou Postman :
  - Login → récupérer le token
  - Appeler une route protégée avec le token → succès
  - Appeler sans token → 401

### 📦 Livrable de la semaine
> Tu peux te connecter via API et accéder à des routes protégées par token.

### 📚 Ressources
| Sujet | Lien |
|-------|------|
| C'est quoi un JWT ? (visuel) | https://jwt.io/introduction |
| jwt.io (décoder un token) | https://jwt.io |
| Tutoriel JWT + Express | https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs |
| Tester une API avec VS Code | https://marketplace.visualstudio.com/items?itemName=humao.rest-client |
| Variables d'env avec dotenv | https://github.com/motdotla/dotenv#readme |

---

## 📅 SEMAINE 4 — Upload de fichiers (simple d'abord)
**Objectif : réussir à envoyer un fichier au backend et le stocker**

### ✅ Ce que tu dois faire
- [ ] Installer `multer`, `uuid`
- [ ] Créer la route `POST /api/files/upload` (un seul fichier, taille limitée à 100 Mo pour commencer)
- [ ] Stocker le fichier dans `storage/uploads/` avec un nom unique (UUID)
- [ ] Sauvegarder les métadonnées (nom, taille, chemin) en base SQLite
- [ ] Créer la route `GET /api/files` qui retourne la liste des fichiers de l'utilisateur connecté
- [ ] Créer la route `GET /api/files/:id/download` pour télécharger un fichier

### 📦 Livrable de la semaine
> Upload d'un fichier via Postman → fichier bien sauvegardé + métadonnées en base + re-téléchargeable.

### 📚 Ressources
| Sujet | Lien |
|-------|------|
| Multer — guide officiel | https://github.com/expressjs/multer#readme |
| UUID — pourquoi l'utiliser | https://www.uuidgenerator.net/version4 |
| res.download() dans Express | https://expressjs.com/en/api.html#res.download |
| Tuto upload fichier Express | https://www.digitalocean.com/community/tutorials/nodejs-uploading-files-multer-express |

---

## 📅 SEMAINE 5 — Upload chunked (gros fichiers)
**Objectif : comprendre pourquoi et comment envoyer un fichier en morceaux**

> 💡 **Pourquoi ?** Un fichier de 10 Go ne peut pas être envoyé d'un coup.
> On le coupe en morceaux (chunks) de 5 Mo, on les envoie un par un, puis on les rassemble.

### ✅ Ce que tu dois faire
- [ ] Créer la table `upload_sessions` en base
- [ ] Route `POST /api/files/init-upload` → crée une session, retourne un `sessionId`
- [ ] Route `PUT /api/files/chunk/:sessionId` → reçoit un chunk (buffer brut), le sauvegarde dans `storage/chunks/sessionId/chunk_000001`
- [ ] Route `POST /api/files/complete/:sessionId` → assemble tous les chunks dans l'ordre → fichier final
- [ ] Tester manuellement en découpant un fichier avec un script Node

### 📦 Livrable de la semaine
> Un fichier découpé en 3 chunks peut être envoyé et ré-assemblé correctement.

### 📚 Ressources
| Sujet | Lien |
|-------|------|
| C'est quoi le chunked upload ? | https://developer.mozilla.org/fr/docs/Web/API/Streams_API |
| fs.createWriteStream (assemblage) | https://nodejs.org/api/fs.html#fscreatewritestreampath-options |
| Tutoriel chunked upload Node.js | https://dev.to/sh20raj/chunked-file-uploads-in-nodejs-32oj |
| Buffer et streams en Node.js | https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93 |

---

## 📅 SEMAINE 6 — Frontend React : Login + Navigation
**Objectif : construire l'écran de connexion et la navigation entre pages**

### ✅ Ce que tu dois faire
- [ ] Installer les dépendances frontend :
  ```bash
  npm install axios react-router-dom zustand
  ```
- [ ] Créer `src/config/api.js` : instance Axios avec l'URL de base + intercepteur JWT auto
- [ ] Créer `src/store/authStore.js` avec Zustand : stocker le token, l'utilisateur, login/logout
- [ ] Créer le composant `LoginPage.jsx` : formulaire identifiant + mot de passe
- [ ] Configurer `react-router-dom` : routes `/login`, `/dashboard`, `/files`
- [ ] Créer un composant `PrivateRoute.jsx` : redirige vers `/login` si pas de token
- [ ] Brancher le formulaire sur `POST /api/auth/login` → sauvegarder le token → rediriger

### 📦 Livrable de la semaine
> La page de login s'affiche, on peut se connecter, le token est sauvegardé, et on est redirigé vers `/dashboard`. Sans token → retour sur `/login`.

### 📚 Ressources
| Sujet | Lien |
|-------|------|
| React Router v6 — démarrage | https://reactrouter.com/en/main/start/tutorial |
| Axios — client HTTP | https://axios-http.com/docs/intro |
| Zustand — gestion d'état simple | https://zustand-demo.pmnd.rs |
| Intercepteurs Axios (token auto) | https://axios-http.com/docs/interceptors |
| React pour débutants (fr) | https://fr.react.dev/learn |

---

## 📅 SEMAINE 7 — Frontend React : Liste de fichiers + Upload
**Objectif : afficher ses fichiers et uploader depuis le navigateur**

### ✅ Ce que tu dois faire
- [ ] Créer `FilesPage.jsx` : appeler `GET /api/files` avec Axios et afficher les fichiers dans une liste/tableau
- [ ] Créer `useFiles.js` (custom hook) : encapsuler la logique fetch + état des fichiers
- [ ] Créer `UploadZone.jsx` :
  - Zone de drag & drop avec l'API native HTML5 (`onDragOver`, `onDrop`)
  - Bouton "Choisir un fichier" avec `<input type="file" />`
- [ ] Créer `uploadService.js` : découper le fichier en chunks (`slice()`), les envoyer un par un avec Axios
- [ ] Afficher une barre de progression (`<progress>` ou une `<div>` stylisée) mise à jour chunk par chunk
- [ ] Après upload terminé → rafraîchir automatiquement la liste

### 📦 Livrable de la semaine
> On peut uploader un fichier depuis le navigateur, voir la progression en temps réel, et le fichier apparaît dans la liste.

### 📚 Ressources
| Sujet | Lien |
|-------|------|
| Drag & Drop HTML5 natif | https://developer.mozilla.org/fr/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop |
| File.slice() — découper un fichier | https://developer.mozilla.org/en-US/docs/Web/API/Blob/slice |
| Axios upload avec progression | https://axios-http.com/docs/req_config (`onUploadProgress`) |
| Custom hooks React | https://fr.react.dev/learn/reusing-logic-with-custom-hooks |
| useEffect et fetch | https://fr.react.dev/reference/react/useEffect |

---

## 📅 SEMAINE 8 — Partages + Téléchargement
**Objectif : créer et utiliser des liens de partage**

### ✅ Ce que tu dois faire

**Backend :**
- [ ] Créer la table `shares` en base
- [ ] Route `POST /api/shares` → crée un token unique, retourne un lien
- [ ] Route `GET /api/shares/:token/download` → vérifie le token, envoie le fichier
- [ ] Gérer l'expiration du lien (date + nombre max de téléchargements)

**Frontend :**
- [ ] Ajouter un bouton "Partager" sur chaque fichier dans la liste
- [ ] Appeler `POST /api/shares` → afficher le lien généré dans une modale
- [ ] Bouton "Copier le lien" avec `navigator.clipboard.writeText()`
- [ ] Créer `SharesPage.jsx` : liste des partages actifs + bouton "Révoquer"

### 📦 Livrable de la semaine
> On peut générer un lien de partage, le copier, l'ouvrir dans un autre onglet et télécharger le fichier.

### 📚 Ressources
| Sujet | Lien |
|-------|------|
| crypto.randomBytes (token) | https://nodejs.org/api/crypto.html#cryptorandombytessize-callback |
| Clipboard API (copier du texte) | https://developer.mozilla.org/fr/docs/Web/API/Clipboard/writeText |
| Modales en React (sans lib) | https://fr.react.dev/reference/react-dom/createPortal |
| Expiration avec SQLite | https://stackoverflow.com/questions/9124474/sqlite-store-and-compare-datetimes |

---

## 📅 SEMAINE 9 — Sécurité de base
**Objectif : rendre l'application robuste contre les erreurs et les abus**

### ✅ Ce que tu dois faire
- [ ] Installer `helmet` (headers sécurité HTTP) et `express-rate-limit`
- [ ] Limiter le login à 10 tentatives / 15 min par IP
- [ ] Valider les extensions de fichiers autorisées (liste blanche dans `.env`)
- [ ] Vérifier le quota disque avant chaque upload
- [ ] Créer un `errorHandler.js` centralisé (toutes les erreurs passent par là)
- [ ] Logger toutes les actions importantes avec `winston`
- [ ] Côté React : afficher proprement les messages d'erreur de l'API (pas juste "Erreur 500")

### 📦 Livrable de la semaine
> L'appli ne plante plus si on envoie de mauvaises données. Les erreurs sont lisibles et loggées.

### 📚 Ressources
| Sujet | Lien |
|-------|------|
| Helmet.js | https://helmetjs.github.io |
| express-rate-limit | https://github.com/express-rate-limit/express-rate-limit |
| Winston logger | https://github.com/winstonjs/winston |
| Sécurité Express — checklist | https://expressjs.com/en/advanced/best-practice-security.html |
| OWASP Top 10 (à lire !) | https://owasp.org/www-project-top-ten/ |

---

## 📅 SEMAINE 10 — Tests
**Objectif : vérifier que ce qu'on a construit fonctionne vraiment**

### ✅ Ce que tu dois faire
- [ ] Installer `jest` et `supertest` : `npm install --save-dev jest supertest`
- [ ] Écrire 3 tests pour l'authentification :
  - Login sans données → doit retourner 400
  - Login mauvais mdp → doit retourner 401
  - Login correct → doit retourner un token
- [ ] Écrire 2 tests pour les fichiers :
  - Accès sans token → 401
  - Accès avec token → liste retournée
- [ ] Lancer `npm test` → tous les tests passent au vert

### 📦 Livrable de la semaine
> `npm test` → 5 tests passent, 0 échec.

### 📚 Ressources
| Sujet | Lien |
|-------|------|
| Jest — démarrage | https://jestjs.io/docs/getting-started |
| Supertest — tester une API Express | https://github.com/ladjs/supertest |
| Tuto tests API Node.js | https://www.freecodecamp.org/news/how-to-test-in-node-js-using-mocha-and-chai |
| C'est quoi un test unitaire ? | https://www.youtube.com/watch?v=Jv2uxzhPFl4 |

---

## 📅 SEMAINE 11 — Déploiement sur Windows Server 2016
**Objectif : mettre l'application en ligne sur le serveur interne**

### ✅ Ce que tu dois faire
- [ ] Compiler React : `npm run build` dans `frontend/` → dossier `dist/`
- [ ] Configurer Express pour servir le dossier `dist/` comme fichiers statiques
- [ ] Installer Node.js sur Windows Server 2016
- [ ] Copier le dossier `backend/` sur le serveur + `npm install --production`
- [ ] Copier le dossier `frontend/dist/` dans `backend/public/`
- [ ] Remplir le `.env` avec les vraies valeurs (chemin stockage, SMTP interne, etc.)
- [ ] Installer PM2 : `npm install -g pm2` → `pm2 start server.js --name app`
- [ ] Configurer IIS comme reverse proxy vers `localhost:3000`
- [ ] Tester depuis un autre poste du réseau interne

### 📦 Livrable de la semaine
> L'appli est accessible depuis `https://fichiers.domaine.local` sur le réseau interne.

### 📚 Ressources
| Sujet | Lien |
|-------|------|
| PM2 — guide débutant | https://pm2.keymetrics.io/docs/usage/quick-start |
| IIS Reverse Proxy (ARR) | https://learn.microsoft.com/en-us/iis/extensions/url-rewrite-module/reverse-proxy-with-url-rewrite-v2-and-application-request-routing |
| Vite build pour production | https://vitejs.dev/guide/build |
| Servir React depuis Express | https://create-react-app.dev/docs/deployment/#other-solutions |
| Variables d'env en prod Node.js | https://www.twilio.com/en-us/blog/working-with-environment-variables-in-node-js-html |

---

## 🧰 Outils à installer dès le départ

| Outil | Usage | Lien |
|-------|-------|------|
| **VS Code** | Éditeur de code | https://code.visualstudio.com |
| **Postman** | Tester l'API REST | https://www.postman.com/downloads |
| **DB Browser for SQLite** | Voir/modifier la base de données | https://sqlitebrowser.org |
| **Git** | Versionner son code | https://git-scm.com |
| **Node.js LTS** | Backend + outillage React | https://nodejs.org |
| **React DevTools** | Déboguer les composants React | Extension Chrome/Firefox |

---

## 📖 Ressources générales pour monter en compétence

### Node.js / Express
| Ressource | Type | Niveau |
|-----------|------|--------|
| https://nodejs.org/en/learn | Docs officielles | Débutant |
| https://expressjs.com/en/guide/routing.html | Docs Express | Débutant |
| https://www.theodinproject.com/paths/full-stack-javascript | Cours complet gratuit | Débutant → Intermédiaire |
| https://www.youtube.com/@TraversyMedia | YouTube | Débutant |

### React
| Ressource | Type | Niveau |
|-----------|------|--------|
| https://fr.react.dev/learn | Docs officielles (en français !) | Débutant |
| https://fr.react.dev/learn/thinking-in-react | Penser en React | Débutant |
| https://www.youtube.com/@CoderOne | YouTube React (fr) | Débutant |
| https://react-tutorial.app | Tutoriel interactif | Débutant |
| https://zustand-demo.pmnd.rs | Zustand — état global | Intermédiaire |
| https://reactrouter.com/en/main | React Router v6 | Intermédiaire |

### Sécurité Web
| Ressource | Type | Niveau |
|-----------|------|--------|
| https://owasp.org/www-project-top-ten | OWASP Top 10 | À lire absolument |
| https://jwt.io/introduction | JWT expliqué | Débutant |
| https://developer.mozilla.org/fr/docs/Web/HTTP/Headers | Headers HTTP | Référence |

---

## ⚠️ Erreurs classiques à éviter

```
❌ Ne pas versionner le fichier .env     →  ajoute .env dans .gitignore
❌ Stocker des mots de passe en clair    →  toujours hasher avec bcryptjs
❌ Oublier de valider les données        →  vérifier TOUJOURS ce qui vient du client
❌ Coder tout en même temps              →  une fonctionnalité à la fois, testée avant de passer à la suite
❌ Ne pas lire les messages d'erreur     →  lire l'erreur en entier avant de chercher sur Google
❌ Modifier le DOM directement en React  →  toujours passer par le state (useState), jamais document.getElementById
```

---

## 💬 Quand tu es bloqué

1. **Lire le message d'erreur en entier** — il contient souvent la solution
2. **Chercher sur Google** : copier le message d'erreur exact entre guillemets
3. **Stack Overflow** : https://stackoverflow.com
4. **Documentation officielle** : toujours la source la plus fiable
5. **ChatGPT / Claude** : utile pour expliquer un concept, pas pour coder à ta place

---

*Plan adapté au niveau junior · Stack React + Node.js + Express · Mars 2025*
