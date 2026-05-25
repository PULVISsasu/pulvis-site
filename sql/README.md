# PULVIS — SQL

## Fichiers

| Fichier | Description | Environnement |
|---|---|---|
| `001_init.sql` | Schéma fondateur : tables, triggers, indexes, RLS, fonctions RPC, vues | Tous |
| `002_seed_prototype.sql` | Données simulées — réseau de 4 machines, 30 jours d'historique | **Test uniquement** |

---

## Appliquer dans Supabase

### Option A — Supabase Studio (interface web)
1. Aller dans **SQL Editor**
2. Coller le contenu de `001_init.sql` → **Run**
3. Coller le contenu de `002_seed_prototype.sql` → **Run**

### Option B — Supabase CLI
```bash
# Connexion
supabase login

# Appliquer sur un projet spécifique
supabase db push --db-url "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Ou via psql
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f sql/001_init.sql
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f sql/002_seed_prototype.sql
```

### Option C — MCP Supabase (depuis Claude Code)
Utiliser les outils MCP `execute_sql` / `apply_migration` disponibles dans la session.

---

## Vérifier les KPIs après le seed

```sql
-- Vue KPIs par machine
SELECT
  serial_number,
  location_name,
  kpi_status,
  sprays_today,
  avg_sprays_per_day_30d,
  has_empty_slot,
  has_low_stock,
  is_offline_suspected
FROM machine_kpis
ORDER BY avg_sprays_per_day_30d DESC;

-- Vue financière
SELECT
  serial_number,
  location_name,
  revenue_today,
  revenue_30d,
  pulvis_net_30d,
  partner_share_30d
FROM machine_financials
ORDER BY revenue_30d DESC;
```

## Résultats attendus après 002_seed_prototype.sql

| Machine | Emplacement | ~Sprays/jour | KPI |
|---|---|---|---|
| PUL-2024-001 | Forum des Halles | ~42 | SCALE 🚀 |
| PUL-2024-002 | Hôtel Lutetia | ~31 | GO ✅ |
| PUL-2024-003 | Gare de Lyon | ~22 | BON 👍 |
| PUL-2024-004 | Basic-Fit Nation | ~8 | CORRIGER 🔴 |

Alertes actives :
- Machine 3, slot 5 → stock bas (45 sprays restants)
- Machine 4, slot 4 → rupture totale (0 spray)
- Machine 4 → `is_offline_suspected = true` (last_seen > 2h)

---

## Convention de nommage des migrations

```
NNN_description.sql
001_init.sql
002_seed_prototype.sql
003_add_operators.sql     ← exemple futur
004_add_notifications.sql ← exemple futur
```
