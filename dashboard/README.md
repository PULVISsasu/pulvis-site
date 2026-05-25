# PULVIS Dashboard CEO

> Dashboard de monitoring temps réel du réseau Pulvis.

## Démarrage rapide

```bash
cd dashboard
npm install
cp .env.example .env   # renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm run dev            # http://localhost:5173
```

## Prérequis SQL

Appliquer dans l'ordre sur Supabase :

```
sql/001_init.sql              ← schéma + vues + RLS
sql/004_rpc_dashboard.sql     ← fonctions RPC (top parfums, résumé réseau)
sql/003_simulate_mtest001.sql ← seed de démo (optionnel)
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase (`Settings → API`) |
| `VITE_SUPABASE_ANON_KEY` | Clé publique anon |
| `VITE_REFRESH_INTERVAL` | Intervalle fallback en ms (défaut : 60000) |

## Fonctionnalités

- **Sprays aujourd'hui** — total réseau temps réel
- **CA net 30j** — après déduction des parts partenaires emplacement
- **Meilleure machine** — KPI badge SCALE/GO/BON/SURVEILLER/CORRIGER
- **Top parfum 30j** — classement réseau par volume de ventes
- **Table machines** — triée par performance, avec stock visuel par slot
- **Alertes** — slots vides, stocks bas, machines offline > 2h
- **Live updates** — Supabase Realtime sur `slot_events` (chaque vente = update immédiat)
- **Refresh auto** — toutes les 60 secondes en fallback

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- @supabase/supabase-js 2
