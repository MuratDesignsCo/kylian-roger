# Kylian Roger Portfolio — CMS

Full-stack portfolio CMS pour Kylian Roger (photographe, réalisateur, directeur artistique).

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, GSAP, Lenis |
| Backend | Express 4, Apollo Server 4 (GraphQL), PostgreSQL |
| Auth | JWT + bcryptjs |
| Upload | Multer (images 5MB, vidéos 100MB) |

## Structure du projet

```
kylian-roger/
├── frontend/          # Next.js App Router
│   └── src/
│       ├── app/(public)/      # Pages publiques (homepage, photography, film-motion, art-direction, works/[slug], contact)
│       ├── app/(admin)/admin/ # Panel admin (login, dashboard, pages/{home,photography,film-motion,art-direction}, projects CRUD, settings, support)
│       ├── components/        # Composants public/ et admin/
│       └── lib/
│           ├── data/          # Fetchers + fallback-projects.ts (données démo)
│           ├── graphql/       # client.ts, queries.ts, mutations.ts
│           └── types.ts       # Interfaces TypeScript
├── backend/           # API GraphQL
│   └── src/
│       ├── index.ts           # Express app + Apollo setup + upload endpoint
│       ├── db.ts              # PostgreSQL pool
│       ├── auth.ts            # JWT auth
│       └── schema/
│           ├── typeDefs.ts    # Schéma GraphQL
│           └── resolvers/     # projects, homepage, contact, settings, seo, page-settings, auth
│   ├── scripts/
│   │   ├── create-admin.ts    # Créer un utilisateur admin
│   │   └── seed-projects.ts   # Seed 58 projets de démo en DB
│   └── init-db/
│       └── 01-schema.sql      # Schéma PostgreSQL (17 tables)
```

## Base de données

- **PostgreSQL local** : `postgresql://muratdesigns@localhost:5432/kylianroger`
- **Docker** : `docker-compose.yml` dans `backend/` pour PostgreSQL + API
- **Tables** : projects (polymorphique par catégorie), gallery rows/images, hero slides, blocks/block images, homepage, contact, settings, seo, page_settings, admin_users
- **IDs** : UUIDs, cascade deletes sur toutes les FK

## Commandes

```bash
# Backend
cd backend && pnpm dev                    # Serveur dev (port 4000)
cd backend && pnpm build && pnpm start    # Production
cd backend && DATABASE_URL="..." pnpm create-admin  # Créer admin
cd backend && DATABASE_URL="..." pnpm seed          # Seed 58 projets

# Frontend
cd frontend && pnpm dev                   # Serveur dev (port 3000)
cd frontend && pnpm build                 # Build production
```

## Patterns importants

- **Fallback pattern** : Le frontend essaie l'API GraphQL, puis utilise les données statiques de `fallback-projects.ts` si l'API est indisponible
- **Projets polymorphiques** : Table `projects` unique, champs spécifiques par catégorie (`photo_*`, `film_*`, `art_*`)
- **GraphQL nested** : Un query `project(slug)` résout automatiquement gallery_rows > images, hero_slides, blocks > images
- **Auth admin** : JWT 7 jours, stocké dans localStorage, envoyé via `Authorization: Bearer <token>`
- **Systeme Pages admin** : Architecture Webflow-like avec onglets Contenu/SEO par page. Chaque page (`/admin/pages/<slug>`) charge ses donnees via une query combinee (pageSettings + seoPage) et sauvegarde en parallele. Composants reutilisables : `PageTabs`, `SeoTabEditor`
- **Page settings** : Table `page_settings` (page_slug PK, page_title, items_per_page, items_per_page_alt). Chaque page publique (photography, film-motion, art-direction) fetch ses settings via `getPageSettings()` pour le titre et la pagination dynamiques. Les composants `PhotoGallery` et `ArtDirectionList` acceptent une prop `initialVisible` au lieu de constantes hardcodées
- **Featured works slots** : DB utilise `slot_category` (still/motion) + `slot_index`, l'admin affiche 4 dropdowns simples avec mapping interne
- **Upload centralisé** : Toujours utiliser `UPLOAD_URL` exporté depuis `lib/graphql/client.ts` (fallback `http://localhost:4000/upload`). Ne PAS utiliser `process.env.NEXT_PUBLIC_UPLOAD_URL || '/api/upload'` directement (la route `/api/upload` n'existe pas côté Next.js)
- **Hover images About** : Les images de survol des liens dans la section About sont stockées dans `about_hover_images` (link_identifier = href du lien, ex: `/photography`, `/film-motion`, `/art-direction`). Le curseur ne s'anime que si `data-hover-img` est non vide. Le composant `AboutSection` utilise `useMemo` pour construire le `hoverImageMap` et pré-charge les images pour un affichage instantané. Animation GSAP avec `opacity` + `clipPath` + `tweenRef` pour éviter les effets fantômes. L'admin utilise un flag `hoverImagesDirty` pour ne pas écraser les hover images lors de sauvegardes non-liées
- **Portfolio admin** : `/admin/projects` affiche 3 cards catégorie (Photography, Film & Motion, Art Direction). Clic → liste filtrée `?category=<slug>`. L'éditeur reçoit `defaultCategory` via URL params
- **Galerie photo admin** : Rangées illimitées, max 3 images/rangée. Le "+" ouvre directement le file picker (pas de dropzone). Layout auto-calculé au save (1=full, 2=half, 3=third). Après save, `loadProject()` recharge les données pour confirmer la persistance
- **project_date** : Colonne `DATE` PostgreSQL. Le driver `pg` retourne un objet `Date` JS → field resolver `Project.project_date` formate en "YYYY-MM-DD". `year` INT est auto-calculé depuis `project_date` dans les mutations create/update
- **Smart auto-slug** : `slugManuallyEdited` boolean — auto-génération s'arrête dès que l'utilisateur modifie le slug manuellement
- **Navbar reload same page** : `handleNavClick` dans `Navbar.tsx` force `window.location.reload()` quand on clique sur un lien correspondant à la page actuelle. Appliqué sur tous les liens (logo, menu principal, dropdown, mobile)
- **Homepage responsive mobile** :
  - **Hero** : Images 16:9 (`aspect-ratio: 16/9`) sur mobile comme desktop. SVGs KYLIAN/ROGER rapprochés de la photo via marges négatives agressives sur `.is-middle` (-22% tablet, -28% mobile). `heroPadding` responsif dans `computeFullscreenScale()` (16px mobile vs 80px desktop) pour que l'effet de scaling fonctionne sur petit écran
  - **Role text mobile** : "MULTIDISCIPLINARY ARTIST / AVAILABLE WORLDWIDE" sorti du hero 100vh, affiché dans `.home_hero_role-mobile` (dans `page.tsx`) entre Hero et About. Caché sur desktop, visible ≤767px. `.home_hero_role-based` caché sur mobile
  - **Works Section mobile** : Même titre dynamique que desktop (plus de "FEATURED WORKS" en dur). Sous-titre + boutons catégorie via `.works_button--tablet-mobile`. Comportement sticky scroll-over restauré (`.home_works_headline-button` sticky top 30vh/25vh). Images 16:9, alternance gauche/droite conservée
- **Hero SVG logos** : `HeroSection` accepte `logoTopUrl` / `logoBottomUrl` (optionnels). Si une URL est fournie, affiche `<img>` au lieu du SVG hardcodé. Les URLs sont stockées dans `site_settings` (`hero_logo_top_url`, `hero_logo_bottom_url`)
- **LATEST WORKS titre** : Le titre wrap naturellement via CSS (`max-width: 6em` sur le `h2.heading-style-h1` dans `.works_headline--desktop`). Le `6em` est relatif au `font-size: 4.5vw` du heading, pas au body. Pas de `\n` dans le titre admin
- **Mutation homepage protégée** : `updateHomepage` n'inclut `hoverImages` dans le payload que si `hoverImagesDirty` est true OU si des hover images existent en state. Empêche le DELETE accidentel de la table `about_hover_images` lors de sauvegardes non-liées

## Interface Admin — Design

### Thème
- **Sidebar** : fond noir (`bg-black`), largeur `w-72`, hauteur plein écran (`sticky top-0 h-screen`)
- **Zone de contenu** : fond clair (`bg-gray-50`), texte sombre (`text-gray-900`)
- Les couleurs de la sidebar sont gérées via des classes CSS dans `admin.css` (pas Tailwind) car le `styles.css` global du portfolio utilise du CSS sans layer (`a { color: var(--text-color--text-primary) }`) qui écrase les utilities Tailwind

### Sidebar (`AdminSidebar.tsx`)
- **Logo SVG** en haut avec effet `hover:scale-[0.97]`, clic = retour dashboard
- **Navigation** structurée :
  - Accueil → `/admin`
  - Pages (clic texte → `/admin/pages` liste, chevron → toggle dropdown) :
    - Home → `/admin/pages/home`
    - Works (sous-dropdown) : Photography, Film & Motion, Art Direction → `/admin/pages/*`
    - Contact → `/admin/contact`
  - Portfolio → `/admin/projects`
  - Paramètres → `/admin/settings` (footer uniquement)
  - Aide et support → `/admin/support`
- **Déconnexion** : tout en bas (`mt-auto`), petit, faible opacité, hover rouge
- Classes CSS sidebar : `.sidebar-link`, `.sidebar-dropdown`, `.sidebar-sub`, `.sidebar-logout` (+ `.active` pour état actif)

### Composants admin réutilisables
- **`PageTabs`** : Onglets Contenu/SEO avec border-bottom actif
- **`SeoTabEditor`** : Editeur SEO reutilisable (Meta Title/Description avec compteurs, preview Google, OG Title/Description/Image, preview social)
- **`RichTextEditor`** : TipTap avec bold, italic, liens + hover image URL. Config : `immediatelyRender: false` (SSR)
- **`ImageUpload`** : Support JPEG, PNG, WebP, AVIF, SVG
- **`DatePicker`** : Calendrier popover custom (mois français, lundi en premier, sélection jour, bouton effacer). Remplace `<input type="date">`
- **`SortableList`** : Drag-and-drop generique (@dnd-kit)

### CSS Admin (`styles/admin.css`)
- Overrides SANS layer (pour battre `styles.css` global)
- Reset : couleur `#18181b`, font system-ui, font-size 1rem
- Sidebar : couleurs gérées via `.admin-root aside .sidebar-*`
- TipTap, dropzone, scrollbar : styles spécifiques

## Workflow Orchestration

### 1. Plan Mode par défaut
- Entrer en plan mode pour TOUTE tâche non-triviale (3+ étapes ou décisions d'architecture)
- Si quelque chose dérape, STOP et re-planifier immédiatement — ne pas insister
- Utiliser le plan mode aussi pour les étapes de vérification, pas uniquement la construction
- Écrire des specs détaillées en amont pour réduire l'ambiguïté

### 2. Stratégie Subagents
- Utiliser les subagents généreusement pour garder le contexte principal propre
- Déléguer la recherche, l'exploration et l'analyse parallèle aux subagents
- Pour les problèmes complexes, envoyer plus de compute via subagents
- Une tâche par subagent pour une exécution ciblée

### 3. Boucle d'auto-amélioration
- Après TOUTE correction de l'utilisateur : mettre à jour `tasks/lessons.md` avec le pattern
- Écrire des règles pour soi-même qui empêchent la même erreur
- Itérer sans relâche sur ces leçons jusqu'à ce que le taux d'erreur baisse
- Revoir les leçons en début de session pour le projet en cours

### 4. Vérification avant de conclure
- Ne jamais marquer une tâche comme terminée sans prouver qu'elle fonctionne
- Comparer le comportement entre main et les changements quand c'est pertinent
- Se demander : « Est-ce qu'un staff engineer approuverait ça ? »
- Lancer les tests, vérifier les logs, démontrer la correction

### 5. Exiger l'élégance (équilibré)
- Pour les changements non-triviaux : faire une pause et se demander « y a-t-il une solution plus élégante ? »
- Si un fix semble hacky : « Sachant tout ce que je sais maintenant, implémenter la solution élégante »
- Ne pas appliquer ça pour les fixes simples et évidents — pas de sur-ingénierie
- Challenger son propre travail avant de le présenter

### 6. Correction de bugs autonome
- Quand on reçoit un rapport de bug : le corriger directement. Ne pas demander d'être guidé
- Pointer les logs, erreurs, tests qui échouent — puis les résoudre
- Zéro changement de contexte requis de la part de l'utilisateur
- Aller corriger les tests CI qui échouent sans qu'on dise comment

## Task Management

1. **Planifier d'abord** : Écrire le plan dans `tasks/todo.md` avec des items cochables
2. **Valider le plan** : Faire un check-in avant de commencer l'implémentation
3. **Suivre la progression** : Marquer les items terminés au fur et à mesure
4. **Expliquer les changements** : Résumé haut-niveau à chaque étape
5. **Documenter les résultats** : Ajouter une section review dans `tasks/todo.md`
6. **Capturer les leçons** : Mettre à jour `tasks/lessons.md` après les corrections

## Principes fondamentaux

- **Simplicité d'abord** : Chaque changement doit être aussi simple que possible. Impact minimal sur le code
- **Pas de paresse** : Trouver les causes racines. Pas de fixes temporaires. Standards de développeur senior
- **Impact minimal** : Les changements ne doivent toucher que ce qui est nécessaire. Éviter d'introduire des bugs

## Conventions

- Communiquer en **français**
- Pas de débordement horizontal (`overflow-x: clip` sur body)
- Copyright : 2026
- Éviter la duplication de code — utiliser les composants partagés
