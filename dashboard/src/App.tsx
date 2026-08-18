import { useDashboard }        from './hooks/useDashboard'
import { useAuth }             from './hooks/useAuth'
import { isSupabaseConfigured } from './lib/supabase'
import KPICard              from './components/KPICard'
import KPIBadge             from './components/KPIBadge'
import AlertBanner          from './components/AlertBanner'
import MachineRow           from './components/MachineRow'
import SimulationBadge      from './components/SimulationBadge'
import PLCard               from './components/PLCard'
import ScenarioTable        from './components/ScenarioTable'
import NetworkProjectionTable from './components/NetworkProjectionTable'
import LoginScreen          from './components/LoginScreen'
import AccessDeniedScreen   from './components/AccessDeniedScreen'
import type { MachineProfitability, TopPerfume } from './types/pulvis'

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function fmtE(n: number, dec = 0) {
  return n.toLocaleString('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: dec,
  })
}
function fmtTime(d: Date | null) {
  return d?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) ?? '—'
}

// ---------------------------------------------------------------------------
// Écrans utilitaires
// ---------------------------------------------------------------------------

function SetupScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-4xl">⚙️</span>
      <div>
        <h1 className="text-xl font-bold text-white mb-2">Configuration Supabase manquante</h1>
        <p className="text-gray-500 text-sm max-w-sm">
          Copier <code className="text-violet-400">.env.example</code> → <code className="text-violet-400">.env</code>
        </p>
      </div>
      <pre className="card-sm p-4 text-xs text-gray-400 max-w-md w-full text-left leading-loose">
        <span className="text-gray-700"># .env{'\n'}</span>
        VITE_SUPABASE_URL=https://xxx.supabase.co{'\n'}
        VITE_SUPABASE_ANON_KEY=eyJ...
      </pre>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-6 h-6 border-2 border-gray-800 border-t-violet-500 rounded-full animate-spin" />
      <p className="text-gray-600 text-sm">Connexion au réseau Pulvis…</p>
    </div>
  )
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-3xl">🔴</span>
      <div>
        <p className="text-white font-semibold mb-1">Erreur de connexion</p>
        <p className="text-gray-500 text-xs font-mono max-w-md">{message}</p>
      </div>
      <button onClick={onRetry}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white">
        Réessayer
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Top parfum display
// ---------------------------------------------------------------------------

function TopPerfumeDisplay({ perfume }: { perfume: TopPerfume | null }) {
  if (!perfume) return <span className="text-gray-600">—</span>
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-2xl font-bold text-white truncate leading-tight">
        {perfume.perfume_name}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// App principale
// ---------------------------------------------------------------------------

export default function App() {
  if (!isSupabaseConfigured) return <SetupScreen />

  const { status, session, error, signIn, signOut } = useAuth()

  // Aucun rendu du dashboard tant que la session n'est pas résolue (login,
  // refresh de token, ou vérification is_admin()) — jamais de "authenticated"
  // considéré suffisant à lui seul.
  switch (status) {
    case 'loading':
    case 'checking_admin':
      return <LoadingScreen />

    case 'signed_out':
      return <LoginScreen onSignIn={signIn} />

    case 'forbidden':
      return <AccessDeniedScreen email={session?.user.email} onSignOut={signOut} />

    case 'error':
      return (
        <ErrorScreen
          message={error ?? 'Erreur d\'authentification inconnue'}
          onRetry={() => window.location.reload()}
        />
      )

    case 'authorized':
      return <Dashboard onSignOut={signOut} />
  }
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const {
    machines, overview, scenarios, companyCosts,
    topPerfumes, alerts, bestStatus,
    lastUpdated, loading, error, refresh,
  } = useDashboard()

  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen message={error} onRetry={refresh} />

  const topPerfume     = topPerfumes[0] ?? null
  const hasSimMachines = machines.some(m => m.simulation_mode)
  const simCount       = machines.filter(m => m.simulation_mode).length

  // P&L de la première machine (la mieux classée selon KPI)
  const firstProfitability = (machines[0] as MachineProfitability | undefined) ?? null

  const avgSprayPerDay = overview?.avg_sprays_per_day ?? 0

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col gap-4 p-4 md:p-5 max-w-7xl mx-auto">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg font-bold text-white tracking-tight">■ PULVIS</span>
          <span className="text-[10px] text-gray-700 uppercase tracking-widest hidden sm:block">
            Dashboard
          </span>
          {hasSimMachines && <SimulationBadge size="sm" />}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Live
          </div>
          <span className="text-[11px] text-gray-700 hidden md:block">{fmtTime(lastUpdated)}</span>
          <button onClick={refresh} title="Actualiser"
            className="p-1.5 text-gray-700 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm">
            ↻
          </button>
          <button onClick={onSignOut} title="Déconnexion"
            className="px-2.5 py-1.5 text-[11px] text-gray-600 hover:text-gray-300 hover:bg-gray-800
              rounded-lg transition-colors">
            Déconnexion
          </button>
        </div>
      </header>

      {/* Bandeau simulation */}
      {hasSimMachines && (
        <div className="flex items-start gap-2 px-4 py-2.5 rounded-xl
          border border-violet-900/60 bg-violet-950/30 text-[11px] text-violet-400/80">
          <span className="text-violet-600 mt-0.5 flex-shrink-0">◈</span>
          <span>
            {simCount} machine{simCount > 1 ? 's' : ''} en mode simulation — données générées.
            {' '}Déploiement terrain :{' '}
            <code className="text-violet-300 font-mono">
              UPDATE machines SET simulation_mode = false WHERE serial_number = 'BMF-001';
            </code>
          </span>
        </div>
      )}

      {/* ── ALERTES ────────────────────────────────────────── */}
      <AlertBanner alerts={alerts} />

      {/* ── KPI CARDS — 2×2 mobile / 4×1 desktop ──────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        <KPICard
          label="Sprays aujourd'hui"
          value={overview?.sprays_30d !== undefined
            ? machines.reduce((s, m) => s + (m.sprays_today ?? 0), 0)
            : '—'}
          sub={`${overview?.machine_count ?? 0} machine${(overview?.machine_count ?? 0) > 1 ? 's' : ''} · moy. ${avgSprayPerDay.toFixed(1)}/j`}
          accent="green" icon="💨"
        />

        <KPICard
          label="CA TTC / HT aujourd'hui"
          value={fmtE(overview
            ? machines.reduce((s, m) => s + (m.ca_ttc_today ?? 0), 0) : 0)}
          sub={overview
            ? `HT ${fmtE(machines.reduce((s, m) => s + (m.ca_ht_today ?? 0), 0))} · TVA ${fmtE(machines.reduce((s, m) => s + ((m.ca_ttc_today ?? 0) - (m.ca_ht_today ?? 0)), 0))}`
            : undefined}
          accent="blue" icon="💶"
        />

        <KPICard
          label="Cashflow tréso. 30 j"
          value={
            (overview?.cashflow_net_30d ?? 0) > 0
              ? <span className="text-emerald-400">{fmtE(overview?.cashflow_net_30d ?? 0)}</span>
              : <span className="text-gray-600">—</span>
          }
          sub={overview?.cashflow_net_pct
            ? `${overview.cashflow_net_pct.toFixed(0)}% CA HT · cash disponible`
            : 'tous frais inclus'}
          accent="green" icon="📈"
        />

        <KPICard
          label="Top parfum 30 j"
          value={<TopPerfumeDisplay perfume={topPerfume} />}
          sub={topPerfume
            ? `${topPerfume.pct_of_total}% des ventes · ${topPerfume.total_sales} sprays`
            : undefined}
          accent="amber" icon="🌸"
        />
      </div>

      {/* ── COMPTE DE RÉSULTAT ─────────────────────────────── */}
      {firstProfitability && (
        <PLCard
          profitability={firstProfitability as MachineProfitability}
          companyCosts={companyCosts}
        />
      )}

      {/* ── TABLE MACHINES ─────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold text-white">Parc machines</h2>
            <span className="text-xs text-gray-700">
              {machines.length} machine{machines.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {bestStatus && <KPIBadge status={bestStatus} size="sm" />}
            {alerts.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Machine', 'KPI', 'Sprays auj.', 'CA TTC', 'CA HT', 'Cashflow tréso. 30j', 'Stock', 'Signal'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-gray-600 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {machines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-gray-700 text-sm">
                    Aucune machine — appliquer{' '}
                    <code className="text-gray-600">005_bmf001_setup.sql</code> +{' '}
                    <code className="text-gray-600">007_financial_views.sql</code> +{' '}
                    <code className="text-gray-600">008_network_projections.sql</code>
                  </td>
                </tr>
              ) : (
                machines.map(m => <MachineRow key={m.machine_id} machine={m} />)
              )}
            </tbody>
          </table>
        </div>

        {machines.length > 0 && (
          <div className="px-5 py-2.5 border-t border-gray-800 flex flex-wrap gap-x-4 gap-y-1">
            {[
              { l: 'SCALE', v: '≥ 40/j', c: 'text-emerald-700' },
              { l: 'GO',    v: '≥ 30',   c: 'text-green-700'   },
              { l: 'BON',   v: '≥ 20',   c: 'text-blue-700'    },
              { l: 'SURV.', v: '≥ 10',   c: 'text-amber-700'   },
              { l: 'CORR.', v: '< 10',   c: 'text-red-800'     },
            ].map(s => (
              <span key={s.l} className={`text-[10px] ${s.c}`}>
                <b>{s.l}</b> <span className="text-gray-800">{s.v}</span>
              </span>
            ))}
            <span className="ml-auto text-[10px] text-gray-800">moy. 30j</span>
          </div>
        )}
      </div>

      {/* ── TABLEAU SCÉNARIOS (1 machine) ──────────────────── */}
      {scenarios.length > 0 && (
        <ScenarioTable
          scenarios={scenarios}
          currentSprayPerDay={Math.round(avgSprayPerDay)}
        />
      )}

      {/* ── PROJECTIONS RÉSEAU MULTI-MACHINES ──────────────── */}
      <NetworkProjectionTable
        machines={machines}
        companyCosts={companyCosts}
        overview={overview}
      />

    </div>
  )
}
