# PULVIS Fitness Intelligence

> Prospection B2B des salles de sport / fitness en Île-de-France pour identifier
> les décideurs à contacter pour l'installation de stations PULVIS.

Voir [`docs/fitness-intelligence-architecture.md`](../docs/fitness-intelligence-architecture.md)
à la racine du repo pour l'architecture complète, la matrice des sources de
données et le périmètre livré.

---

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind, Supabase (schéma dédié
`fitness_intel` sur le projet `pulvis-backend-fr`), Leaflet pour la carte.

## Démarrage

```bash
npm install
cp .env.example .env.local   # renseigner les clés (voir ci-dessous)
npm run dev
```

### Variables d'environnement requises

Voir `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` est **obligatoire** — toutes
les pages (Server Components) et routes API l'utilisent côté serveur
uniquement (jamais exposée au navigateur, voir `lib/supabase/server.ts`).

### ⚠️ Étape Supabase requise avant le premier lancement

Le schéma `fitness_intel` doit être ajouté aux **Exposed schemas** du projet :
**Dashboard Supabase → Settings → API → Data API → Exposed schemas → ajouter
`fitness_intel` → Save**. Sans ça, PostgREST renvoie 404 sur toutes les
requêtes. Ce réglage n'est pas pilotable en SQL/migration, il est à faire une
fois manuellement (ou via l'API Management de Supabase).

## Commandes

```bash
npm run dev        # développement
npm run build       # build production
npm run typecheck   # tsc --noEmit
npm run lint         # next lint
```

## Structure

```
app/            Pages (App Router) : dashboard, carte, clubs, enseignes,
                groupes, dirigeants, prospection, sources, scraping,
                paramètres — + routes API (app/api/**)
components/     UI (badges, stat tiles, nav) — écrit à la main, style shadcn
lib/connectors/ Un module par source de données (contrat standardisé)
lib/pipeline/   DISCOVER → NORMALIZE → MATCH → ENRICH → RESOLVE ENTITIES →
                DETECT OWNERSHIP → SCORE, chaque étape indépendante/rejouable
lib/entity-resolution/ (voir lib/pipeline/resolveEntities.ts + RPC SQL
                fitness_intel.find_club_duplicates)
lib/scoring/    PULVIS Opportunity Score + Contactability Score (pondérations
                configurables en base, éditables depuis /parametres)
lib/data/       Requêtes Supabase par page (Server Components)
```

## Lancer le pipeline

Depuis la page **Scraping** (`/scraping`) : boutons pour déclencher chaque
étape, formulaire d'import manuel (club unique ou CSV), suggestions de fusion
à valider. Chaque étape est aussi exposée en API : `POST /api/pipeline/[stage]`
avec `stage` ∈ `discover|normalize|match|enrich|resolve_entities|detect_ownership|score`.

## Limites connues (voir docs/fitness-intelligence-architecture.md §5)

- Scraping HTML par enseigne : interface prête (`lib/connectors/brand-website.ts`),
  aucune config activée par défaut (à faire enseigne par enseigne, robots.txt
  vérifié à chaque fois).
- INPI RNE, Société.com/Pappers : non implémentés (identifiants/API payante requis).
- LinkedIn : import manuel d'URL uniquement, aucun crawler.
- Géocodage : dépend des coordonnées fournies par les connecteurs (pas de
  service de géocodage tiers branché).
- Export : CSV uniquement pour l'instant (pas de XLSX).
