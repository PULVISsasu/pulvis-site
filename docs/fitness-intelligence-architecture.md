# PULVIS Fitness Intelligence — Architecture

Statut : v1 — implémentation initiale (voir §9 pour le périmètre livré vs restant).

## 1. Analyse de l'existant

Le repo `pulvis-dashboard` contient déjà :

- `dashboard/` — dashboard interne CEO/ops (React + Vite + TS + Tailwind + `@supabase/supabase-js`), branché sur le projet Supabase **`pulvis-backend-fr`** (`zrktunxspbtjzaolulse`, région `eu-west-3`).
- `frontend/` — app publique (même stack).
- `sql/001…009` — schéma opérationnel de la partie « distributeurs de parfum » (`lieux`, `machines`, `parfums`, `machine_slots`, `slot_events`, `prospects`, …), déjà appliqué sur le projet Supabase actif (tables réelles vérifiées via MCP : `lieux`, `machines`, `slot_events` (1200 lignes), `prospects`, etc.).
- Aucune brique existante pour la prospection B2B fitness : **Fitness Intelligence part de zéro**.

Décisions d'intégration :

1. **Nouvelle app** `fitness-intelligence/` (Next.js) plutôt que d'étendre `dashboard/` : le besoin (scraping, jobs, graphe entités, cartographie) est un produit interne distinct du monitoring machines, avec un cycle de vie propre. Conforme à la stack demandée en brief (§34 : Next.js/TS/Tailwind/Supabase).
2. **Même projet Supabase** (`pulvis-backend-fr`) mais **schéma Postgres dédié `fitness_intel`** (pas `public`) pour ne jamais interférer avec les tables opérationnelles Pulvis existantes (`public.prospects` sert au CRM emplacements machines, pas à la prospection fitness — les deux univers sont liés (un club fitness qualifié devient un `lieu`/`prospect` Pulvis) mais leurs cycles de vie de données diffèrent).
3. Migrations SQL du nouveau domaine numérotées dans `sql/` (`010_…`) en cohérence avec la convention du repo, mais elles créent/peuplent exclusivement le schéma `fitness_intel`.

⚠️ Contrainte d'environnement découverte pendant le build : le réseau sortant de cette session est restreint à une liste blanche (npm, PyPI, Anthropic…) et **ne peut atteindre ni `recherche-entreprises.api.gouv.fr`, ni les sites des enseignes, ni même l'API REST du projet Supabase** depuis le serveur `next dev` de ce sandbox (`Host not in allowlist`). Vérifié en conditions réelles : `npm run build` compile et type-check sans erreur (16 routes générées), `next dev` démarre et sert toutes les pages en 200 y compris les routes dynamiques (`/clubs/[id]` → 404 correct sur ID inconnu), et les appels réseau bloqués sont absorbés proprement (pages affichant des zéros plutôt que de crasher, routes API renvoyant une erreur JSON 400 propre) — mais aucune page n'a pu être vérifiée avec de vraies données rendues **dans ce sandbox**, faute d'accès réseau à Supabase depuis le processus Next.js lui-même.
Le schéma, les migrations et le jeu de données de démonstration, eux, ont bien été appliqués sur le vrai projet Supabase (`pulvis-backend-fr`) via les outils MCP dédiés (qui empruntent un chemin réseau différent, non soumis à cette liste blanche) — confirmé par des requêtes SQL directes (`SELECT * FROM fitness_intel.v_dashboard_kpis`). Une fois déployée (Vercel, CI, poste local disposant d'un accès réseau normal), l'app se connectera à ce même projet et affichera ces données réelles sans changement de code.

---

## 2. Sources de données — matrice de faisabilité légale

| Source | Type d'accès | Légalité / conditions | Statut dans le code |
|---|---|---|---|
| **Recherche d'Entreprises (api.gouv.fr)** | API REST publique, sans clé, gratuite | Open data officiel (INSEE/INPI/RNE agrégés), CGU permissives, usage professionnel explicitement prévu | ✅ Connecteur fonctionnel (`connectors/recherche-entreprises`) |
| **API Sirene (INSEE)** | API REST, clé gratuite (compte data.gouv.fr) | Open data officiel | ✅ Connecteur fonctionnel, clé via `SIRENE_API_KEY` (dégrade proprement si absente) |
| **BODACC (data.gouv.fr / api-bodacc)** | API REST publique | Open data officiel (annonces légales : créations, procédures collectives) | ✅ Connecteur fonctionnel (détection radiations/procédures) |
| **INPI RNE (registre-national-entreprises.inpi.fr)** | API avec authentification (compte INPI) | Officiel mais nécessite des identifiants dédiés | 🟡 Stub typé, activable via `INPI_API_USER`/`INPI_API_PASSWORD` |
| **Sites des enseignes** (pages clubs/franchise/équipe) | HTTP direct + parsing HTML | Autorisé si `robots.txt` respecté et pas de contournement technique ; à faire enseigne par enseigne | 🟡 Interface `BrandWebsiteConnector` définie, un exemple (sitemap + fetch statique) fourni ; pas de moteur générique automatique (chaque site a une structure différente — nécessite une config par enseigne) |
| **LinkedIn** | Recherche publique / liens fournis par l'utilisateur | Pas de scraping automatisé (CGU LinkedIn l'interdisent). Import manuel d'URL uniquement | ✅ `manual-import` accepte une URL LinkedIn à rattacher à une personne ; aucun crawler LinkedIn n'est développé |
| **Société.com / Pappers / Verif** | Web, CGU restrictives / API payante | Utilisable seulement via leurs API officielles (payantes) | ❌ Non implémenté (nécessite contrat commercial) — laissé en TODO documenté |
| **Moteurs de recherche** | Scraping interdit par CGU | — | ❌ Non implémenté ; `web-search` est un stub qui appelle une API de recherche autorisée si l'utilisateur en configure une (Bing/SerpAPI…) |
| **Import manuel (CSV, URL, SIREN/SIRET)** | Saisie utilisateur | — | ✅ Fonctionnel, déclenche le pipeline d'enrichissement |

Principe appliqué partout : **jamais de contournement de CAPTCHA/authentification/paywall/anti-bot**, respect des rate limits (voir `lib/http/rateLimit.ts`), et toute donnée non vérifiable reste au niveau de confiance `estimated`/`unknown` plutôt que `verified`.

---

## 3. Architecture applicative

```
fitness-intelligence/
├── app/                       # Next.js App Router
│   ├── (dashboard)/
│   │   ├── page.tsx           # Dashboard — KPIs
│   │   ├── carte/
│   │   ├── clubs/
│   │   ├── enseignes/
│   │   ├── groupes/
│   │   ├── dirigeants/
│   │   ├── prospection/
│   │   ├── sources/
│   │   ├── scraping/
│   │   └── parametres/
│   └── api/
│       ├── pipeline/[stage]/route.ts   # déclenche une étape du pipeline
│       ├── jobs/route.ts               # liste/])état des jobs
│       └── import/route.ts             # import manuel
├── lib/
│   ├── supabase/               # client + types générés
│   ├── connectors/              # un dossier par source (contrat standardisé)
│   ├── pipeline/                 # discover, normalize, match, enrich, resolve, detectOwnership, score, store
│   ├── scoring/                  # pondérations configurables (PULVIS Opportunity Score, Contactability Score)
│   └── entity-resolution/        # dédup SIRET/adresse/téléphone/domaine/nom
├── components/                   # UI (style shadcn, écrit à la main — pas d'accès registry npm shadcn)
```

### Pipeline

```
DISCOVER → NORMALIZE → MATCH → ENRICH → RESOLVE ENTITIES → DETECT OWNERSHIP → IDENTIFY DECISION MAKERS → SCORE → STORE → DISPLAY
```

Chaque étape est une fonction pure `(input, ctx) => output` persistée via `scrape_jobs` / `enrichment_jobs`, rejouable indépendamment (`POST /api/pipeline/discover`, etc.), idempotente (upsert sur clé naturelle : SIRET pour les entités légales, `brand_id + normalized_address` pour les clubs).

---

## 4. Schéma de données (résumé — détail dans `sql/010_fitness_intelligence_schema.sql`)

`fitness_intel.brands`, `.legal_entities`, `.establishments`, `.people`, `.roles`, `.groups`, `.group_members`, `.ownership_relations`, `.contacts`, `.websites`, `.sources`, `.source_records`, `.scrape_jobs`, `.enrichment_jobs`, `.opportunity_scores`, `.crm_status`, `.activities`, `.notes`, `.merge_candidates`.

Principes :
- UUID (`gen_random_uuid()`) partout.
- Chaque champ sensible/déduit porte sa provenance via `source_records` (source, URL, date de collecte, dernière vérification, méthode, `confidence_level` : `verified|probable|estimated|unknown`).
- Pas d'écrasement silencieux : `legal_entities`, `establishments`, `people` ont des colonnes `_history` gérées par triggers (append-only) pour dirigeant/adresse/société/statut.
- RLS activé (lecture `authenticated`, écriture via `service_role` uniquement — les mutations passent par les routes API serveur, jamais par le client anon).

---

## 5. Périmètre livré dans cette itération

Livré et fonctionnel :
- Schéma complet, appliqué sur Supabase.
- Connecteurs réels : Recherche d'Entreprises, Sirene, BODACC, import manuel.
- Pipeline complet (stages composables + orchestrateur).
- Entity resolution (SIRET/adresse/téléphone/domaine/nom) avec 3 paliers de confiance.
- Détection franchise/succursale/multi-franchisé avec score de confiance et justification.
- Scoring PULVIS Opportunity Score + Contactability Score, pondérations en base (`fitness_intel.scoring_weights`), éditables depuis Paramètres.
- Toutes les pages de navigation demandées, branchées sur des données réelles (structure) + jeu de démo pour la visualisation immédiate.

Non livré (nécessite décision produit / contrat commercial / accès réseau réel) :
- Scraping HTML par enseigne (nécessite une config par site, à faire au fil de l'eau).
- Intégration INPI RNE authentifiée (nécessite identifiants).
- Société.com/Pappers (API payante).
- Résolution LinkedIn automatique (volontairement exclue — import manuel uniquement).
