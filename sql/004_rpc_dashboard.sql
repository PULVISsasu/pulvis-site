-- =============================================================================
-- PULVIS — Fonctions RPC dashboard CEO
-- Migration : 004_rpc_dashboard.sql
-- Prérequis  : 001_init.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- get_top_perfumes — classement des parfums par volume de ventes (réseau)
-- Appelée par le dashboard CEO pour afficher le top parfum 30j
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_top_perfumes(
  days_back INTEGER DEFAULT 30,
  limit_n   INTEGER DEFAULT 5
)
RETURNS TABLE (
  perfume_name TEXT,
  brand        TEXT,
  total_sales  BIGINT,
  pct_of_total NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH sales AS (
    SELECT
      ms.perfume_id,
      COUNT(*) AS cnt
    FROM slot_events se
    JOIN machine_slots ms ON ms.id = se.slot_id
    WHERE se.event_type_code = 'sale'
      AND se.created_at >= NOW() - (days_back || ' days')::interval
    GROUP BY ms.perfume_id
  ),
  total AS (
    SELECT SUM(cnt) AS t FROM sales
  )
  SELECT
    p.name                                              AS perfume_name,
    p.brand,
    s.cnt                                               AS total_sales,
    ROUND(s.cnt * 100.0 / NULLIF(t.t, 0), 1)           AS pct_of_total
  FROM sales s
  JOIN perfumes p  ON p.id = s.perfume_id
  CROSS JOIN total t
  ORDER BY s.cnt DESC
  LIMIT limit_n;
$$;

COMMENT ON FUNCTION get_top_perfumes IS
  'Classement des parfums par volume de ventes sur N jours (réseau complet). Utilisée par le dashboard CEO.';

GRANT EXECUTE ON FUNCTION get_top_perfumes TO authenticated, anon;


-- ---------------------------------------------------------------------------
-- get_network_summary — agrégats réseau pour les KPI cards du dashboard
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_network_summary()
RETURNS TABLE (
  sprays_today      BIGINT,
  revenue_today     NUMERIC,
  sprays_30d        BIGINT,
  revenue_30d       NUMERIC,
  pulvis_net_30d    NUMERIC,
  active_machines   BIGINT,
  machines_in_alert BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COALESCE(SUM(sprays_today),    0)              AS sprays_today,
    COALESCE(SUM(revenue_today),   0)              AS revenue_today,
    COALESCE(SUM(sprays_30d),      0)              AS sprays_30d,
    COALESCE(SUM(revenue_30d),     0)              AS revenue_30d,
    COALESCE(SUM(pulvis_net_30d),  0)              AS pulvis_net_30d,
    COUNT(*) FILTER (WHERE machine_status = 'active')                              AS active_machines,
    COUNT(*) FILTER (WHERE has_empty_slot OR has_low_stock OR is_offline_suspected) AS machines_in_alert
  FROM machine_kpis mf
  JOIN machine_financials mfin USING (machine_id);
$$;

GRANT EXECUTE ON FUNCTION get_network_summary TO authenticated, anon;
