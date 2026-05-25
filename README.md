# PULVIS

> Réseau de distributeurs automatiques de parfum premium connectés.

## Concept

**1 spray = 1 €** — paiement CB uniquement.

Chaque machine Pulvis contient 5 parfums premium. Pulvis gère l'installation, la maintenance, le remplissage et l'encaissement. L'objectif est de créer un réflexe parfum rapide et accessible dans des lieux à fort passage.

---

## Architecture technique

| Couche       | Technologie                        |
|--------------|------------------------------------|
| Embarqué     | ESP32 (Wi-Fi, NFC/CB, servo)       |
| Backend      | Supabase / PostgreSQL              |
| Frontend     | React (landing, marketing)         |
| Dashboard    | React (CEO, ops, monitoring)       |
| Automatismes | n8n (phase 2)                      |

### Principe fondamental

**`slot_events` est la source de vérité unique.** Toutes les ventes, les erreurs machine, et les événements métier sont inscrits dans cette table. Les vues agrégées et KPIs sont calculés depuis cette source.

L'architecture est **event-driven** : chaque spray déclenche un événement persisté, ensuite consommé par le dashboard et les automatismes.

---

## KPIs machine

| Sprays/jour | Statut              |
|-------------|---------------------|
| ≥ 40        | 🚀 SCALE            |
| ≥ 30        | ✅ GO               |
| ≥ 20        | 👍 BON emplacement  |
| ≥ 10        | ⚠️ SURVEILLER       |
| < 10        | 🔴 Corriger / déplacer |

---

## Structure du projet

```
PULVIS/
├── docs/          # Documentation métier, specs, cahiers des charges
├── sql/           # Migrations, schéma Supabase, seeds, fonctions RPC
├── frontend/      # Application React publique (landing, marketing)
├── dashboard/     # Dashboard React interne (CEO, ops, monitoring)
├── hardware/      # Code ESP32, wiring, specs matériel
├── operations/    # Procédures terrain, maintenance, remplissage
├── finance/       # Modèles financiers, P&L, prévisions
├── sales/         # Supports commerciaux, démarche partenaires emplacements
└── n8n/           # Workflows d'automatisation (phase 2)
```

---

## Priorités de développement

1. **Schéma SQL** — tables, RLS, fonctions RPC (source de vérité)
2. **Firmware ESP32** — paiement CB → spray → `slot_event` → Supabase
3. **Dashboard** — monitoring machines, CA, alertes stock
4. **Première installation terrain** — validation des KPIs avant tout scaling

---

## Règles du projet

- Code toujours complet et prêt à coller
- Simplicité et standardisation avant tout
- Pas de scaling sans validation terrain
- Priorité absolue au cashflow
- Architecture long terme, exécution simple
