/**
 * Badge SIMULATION — affiché sur toute machine en mode test.
 * Disparaît automatiquement quand simulation_mode = false sur la machine.
 */

interface Props {
  size?: 'xs' | 'sm'
}

export default function SimulationBadge({ size = 'sm' }: Props) {
  const classes = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-0.5'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border
        border-violet-700 bg-violet-950 text-violet-300 font-medium
        uppercase tracking-widest ${classes}`}
    >
      <span className="inline-block w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
      SIM
    </span>
  )
}
