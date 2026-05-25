# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Projet

**PULVIS** — réseau de distributeurs automatiques de parfum premium connectés.
1 spray = 1 €, paiement CB uniquement, 5 parfums par machine.
Pulvis gère installation, maintenance, remplissage et encaissement.

---

## Stack technique

| Couche       | Technologie                              |
|--------------|------------------------------------------|
| Embarqué     | ESP32 (Arduino/C++, Wi-Fi, NFC/CB)       |
| Backend      | Supabase (PostgreSQL, RLS, Edge Functions, Realtime) |
| Frontend     | React (Vite, TypeScript)                 |
| Dashboard    | React (Vite, TypeScript)                 |
| Automatismes | n8n (phase 2 uniquement)                 |

---

## Architecture — principes fondamentaux

### Source de vérité unique : `slot_events`
Toute action machine (spray vendu, erreur, stock bas, redémarrage) génère un **événement** inséré dans la table `slot_events`. Les vues, agrégats et KPIs sont **calculés** depuis cette table — jamais depuis un compteur mis à jour en place.

### Flux de données principal
```
ESP32 (paiement CB validé)
  → INSERT slot_events (type='sale', slot_id, machine_id, amount, ts)
  → Supabase Realtime
  → Dashboard (live)
  → n8n triggers (phase 2)
```

### Règle : pas de logique métier dans le firmware
L'ESP32 envoie les événements bruts à Supabase via HTTP REST. Toute logique de calcul (CA, stock restant, alertes) vit côté Supabase (fonctions RPC, vues, triggers) ou dans le dashboard.

---

## Structure des dossiers

```
sql/          Migrations numérotées (001_init.sql, 002_rpc.sql…), seeds, fonctions RPC
frontend/     App React publique (Vite + TypeScript)
dashboard/    Dashboard React interne CEO/ops (Vite + TypeScript)
hardware/     Firmware ESP32 (PlatformIO), schémas de câblage, specs matériel
docs/         Spécifications, ADR (Architecture Decision Records), cahier des charges
operations/   Procédures terrain : remplissage, maintenance, installation
finance/      Modèles P&L, projections, suivi emplacement
sales/        Supports partenaires emplacements, pitch deck
n8n/          Exports JSON de workflows (phase 2)
```

---

## Base de données (Supabase/PostgreSQL)

### Tables principales attendues

| Table          | Rôle                                              |
|----------------|---------------------------------------------------|
| `machines`     | Inventaire des machines (id, lieu, statut, installée_le) |
| `slots`        | 5 slots par machine (machine_id, position 1-5, parfum_id, stock) |
| `perfumes`     | Catalogue parfums (nom, marque, référence)        |
| `slot_events`  | **Source de vérité** — tous les événements machine |
| `locations`    | Emplacements physiques (nom, adresse, type)       |

### Conventions SQL
- Toutes les migrations vont dans `sql/` avec un préfixe numéroté : `001_`, `002_`, etc.
- Utiliser `uuid` comme type de clé primaire (généré côté Supabase avec `gen_random_uuid()`).
- Timestamps en `timestamptz`, timezone UTC.
- RLS activé sur toutes les tables exposées à l'ESP32 ou au frontend public.
- Les fonctions RPC Supabase (`SECURITY DEFINER`) sont privilégiées pour les opérations critiques (ex. : enregistrer une vente atomiquement).

---

## KPIs machine (référence pour les requêtes dashboard)

| Sprays/jour | Décision             |
|-------------|----------------------|
| ≥ 40        | SCALE                |
| ≥ 30        | GO                   |
| ≥ 20        | BON emplacement      |
| ≥ 10        | SURVEILLER           |
| < 10        | Corriger ou déplacer |

Ces seuils sont la référence pour toutes les alertes, couleurs de statut, et filtres du dashboard.

---

## Firmware ESP32 (hardware/)

- Environnement : **PlatformIO** (VS Code extension)
- Language : C++ Arduino
- Communication backend : HTTP REST vers Supabase (endpoint `/rest/v1/slot_events`)
- Authentification : clé `anon` Supabase stockée dans les variables d'environnement PlatformIO (`platformio.ini` → `build_flags`)
- Ne jamais stocker de secrets dans le code source versionné

### Séquence paiement
```
1. Client appuie sur bouton slot N
2. Terminal CB déclenche paiement (1,00 €)
3. Paiement validé → servo libère spray
4. ESP32 → POST /rest/v1/slot_events { type: 'sale', slot_id, machine_id, amount: 1.00 }
5. Si échec réseau → retry queue locale (SPIFFS)
```

---

## Frontend & Dashboard (React / Vite / TypeScript)

### Commandes (une fois le projet initialisé)
```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Build de production
npm run build

# Linter
npm run lint
```

### Bibliothèques à privilégier
- **@supabase/supabase-js** pour toutes les interactions backend
- **Recharts** ou **Chart.js** pour les graphiques dashboard
- **TailwindCSS** pour le style
- **React Query (TanStack Query)** pour la gestion du cache et des requêtes

### Variables d'environnement
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Règles de développement Pulvis

1. **Code toujours complet** — fournir le fichier entier, prêt à coller, sans `// ...existing code...`
2. **Simplicité avant tout** — pas de pattern complexe si une solution simple suffit
3. **Pas de scaling avant validation terrain** — ne pas sur-architecturer avant les premiers KPIs réels
4. **Priorité cashflow** — toute fonctionnalité doit servir directement le suivi des ventes ou la fiabilité machine
5. **Standardisation** — conventions de nommage cohérentes partout (snake_case SQL, camelCase TS)

---

## Phases du projet

| Phase | Objectif                                             |
|-------|------------------------------------------------------|
| 0     | Schéma SQL + seed de démo                            |
| 1     | Firmware ESP32 → enregistrement vente dans Supabase  |
| 2     | Dashboard monitoring (machines, CA, alertes stock)   |
| 3     | Première installation terrain + validation KPIs      |
| 4     | n8n automatisations (alertes, rapports, maintenance) |
| 5     | Scaling réseau selon KPIs validés                    |
