# PULVIS Dashboard

> Dashboard de monitoring interne pour le réseau de distributeurs automatiques de parfum premium Pulvis.

---

## Présentation

**Pulvis** déploie des distributeurs automatiques de parfum premium dans des lieux à fort passage (clubs, hôtels, salles de sport, etc.).

- **1 spray = 1 € TTC** — paiement CB uniquement
- 5 parfums premium par machine
- Pulvis gère l'installation, la maintenance, le remplissage et l'encaissement

Ce dashboard permet au CEO et à l'équipe ops de suivre en temps réel les ventes, la performance financière et l'état de chaque machine du réseau.

---

## Objectif du dashboard

| Section | Rôle |
|---|---|
| **KPI réseau** | Sprays du jour, CA TTC/HT, meilleur statut machine |
| **Table machines** | Performance par machine, stock par slot, signal |
| **P&L par machine** | Cashflow Phase 1/2, seuils de rentabilité, délai autofinancement |
| **Scénarios** | Simulation de rentabilité selon les sprays/jour |
| **Projection réseau** | Rentabilité à 1/3/5/10 machines |
| **Alertes** | Slots vides, stock bas, machine offline > 2h |

---

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | **Supabase** (PostgreSQL, RLS, Realtime, PostgREST) |
| Dashboard | **React 18** + **TypeScript** + **Vite 5** |
| Style | **Tailwind CSS 3** |
| Client Supabase | `@supabase/supabase-js` v2 |
| Embarqué *(phase 2)* | ESP32 (Wi-Fi, Nayax CB, servo) |
| Automatismes *(phase 2)* | n8n |

---

## Structure des dossiers

```
PULVIS/
├── dashboard/          ← Dashboard React (ce projet)
│   ├── src/
│   │   ├── App.tsx             # Layout principal + requêtes Supabase
│   │   ├── components/         # AlertBanner, KPICard, MachineRow, PLCard…
│   │   ├── hooks/
│   │   │   └── useDashboard.ts # Hook principal : fetch + merge + alertes
│   │   ├── lib/
│   │   │   └── supabase.ts     # Client Supabase initialisé
│   │   └── types/
│   │       └── pulvis.ts       # Interfaces TypeScript (vues SQL → TS)
│   ├── .env.example            # Template variables d'environnement
│   └── package.json
├── sql/                ← Migrations Supabase (numérotées)
│   ├── 001_init.sql            # Schéma de base, RLS, vues fondamentales
│   ├── …
│   ├── 009_v1_hardware.sql     # Modèle financier V1 final
│   └── 010…013_fitness_intelligence_*.sql  # Schéma fitness_intel, seeds, RPC
├── fitness-intelligence/ ← App de prospection B2B fitness (Next.js) — voir son README
├── docs/               ← Specs, ADR, cahier des charges
│   └── fitness-intelligence-architecture.md
├── hardware/           ← Firmware ESP32, schémas câblage
├── operations/         ← Procédures terrain (remplissage, maintenance)
├── finance/            ← Modèles P&L, projections
├── sales/              ← Supports partenaires emplacements
└── n8n/                ← Workflows automatisation (phase 2)
```

---

## Lancer le projet en local

### Prérequis

- Node.js ≥ 18
- Un projet Supabase avec les migrations appliquées (voir ci-dessous)

### Installation

```bash
cd dashboard
npm install
```

### Variables d'environnement

Copier le fichier exemple et renseigner les valeurs :

```bash
cp .env.example .env
```

Ouvrir `.env` et remplir :

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<clé-anon-publique>
VITE_REFRESH_INTERVAL=60000   # optionnel, défaut 60 secondes
```

> Les clés se trouvent dans **Supabase Dashboard → Settings → API**.  
> Ne jamais commiter le fichier `.env` (déjà dans `.gitignore`).

### Démarrage

```bash
npm run dev        # Serveur de développement → http://localhost:5173
npm run build      # Build de production → dist/
npm run lint       # Vérification TypeScript + ESLint
```

---

## Connexion Supabase

Le dashboard consomme exclusivement des **vues et fonctions RPC** — jamais les tables brutes directement :

| Vue / RPC | Description |
|---|---|
| `machine_kpis` | KPIs opérationnels par machine (sprays, stock, statut) |
| `machine_financials` | Revenus bruts |
| `machine_profitability` | P&L complet Phase 1 / Phase 2 |
| `company_monthly_overview` | Synthèse réseau 30j |
| `get_top_perfumes(days, n)` | Top N parfums sur la période |
| `get_profitability_scenarios()` | Tableau de scénarios 10→50 sprays/j |

Les migrations à appliquer sont dans `sql/` dans l'ordre `001` → `009` + migrations dashboard `pulvis_dashboard_001` → `pulvis_dashboard_007`.

**Realtime** : chaque `INSERT` dans `slot_events` déclenche un refresh automatique du dashboard (abonnement Supabase Realtime).

---

## Mode SIMULATION vs mode RÉEL

| | SIMULATION | RÉEL |
|---|---|---|
| **Champ** | `machines.simulation_mode = true` | `machines.simulation_mode = false` |
| **Données** | Événements générés par script SQL | Événements envoyés par l'ESP32 |
| **Indicateur** | Badge orange « SIM » sur la machine | Aucun badge |
| **Usage** | Tests, démonstrations, validation modèle financier | Production terrain |

Pour passer une machine en mode réel :

```sql
UPDATE machines SET simulation_mode = false WHERE numero_serie = 'BMF-001';
```

---

## État actuel du projet — V1 (mai 2026)

- ✅ Dashboard React fonctionnel connecté à Supabase
- ✅ Machine **BMF-001** · Circle Club Auteuil · Paris 16e (simulation 40 sprays/j)
- ✅ Modèle financier V1 complet : CAPEX 1 640 €, Phase 1/2, délai autofinancement
- ✅ Vues SQL adaptées au schéma réel Supabase (nommage français)
- ✅ Permissions RLS `anon` configurées (vues exposées, tables brutes protégées)
- ✅ Commit initial versionné sur GitHub

---

## Prochaines étapes

### 1 — Nettoyage simulation
Remplacer les données simulées par les vraies ventes terrain une fois BMF-001 installée :
```sql
UPDATE machines SET simulation_mode = false WHERE numero_serie = 'BMF-001';
```

### 2 — Déploiement Vercel
```bash
# Dans le dossier dashboard/
vercel --prod
# Configurer les variables d'environnement dans Vercel Dashboard
```

### 3 — Ingestion ESP32
- L'ESP32 envoie un `POST` sur `slot_events` après chaque paiement CB validé
- Le dashboard se met à jour en temps réel via Supabase Realtime
- Firmware à développer dans `hardware/`

### 4 — Connexion machine réelle
- Désactiver `simulation_mode` sur la machine
- Vérifier que `last_event_at` se met à jour (indicateur de signal)
- Surveiller les alertes offline > 2h dans le dashboard

---

## Modèle financier V1 (référence)

| Paramètre | Valeur |
|---|---|
| Prix spray TTC | 1,00 € |
| CAPEX total | 1 640 € (machine 1 200 + Nayax 415 + activation 25) |
| Financement | 3 × 400 € |
| Nayax | 15 €/mois + 2 % du CA TTC |
| Coût parfum | 0,020 €/spray |
| Frais fixes société | 57,19 €/mois |
| Opex machine | 47,50 €/mois |
| **Seuil Phase 2** | **~5 sprays/j** |
| **Seuil Phase 1** | **~22 sprays/j** |
| CF Phase 2 à 40/j | **~832 €/mois** |
| CF Phase 1 à 40/j | **~432 €/mois** |

---

## KPIs machine

| Sprays/jour | Statut |
|---|---|
| ≥ 40 | 🚀 SCALE |
| ≥ 30 | ✅ GO |
| ≥ 20 | 👍 BON |
| ≥ 10 | ⚠️ SURVEILLER |
| < 10 | 🔴 CORRIGER |
