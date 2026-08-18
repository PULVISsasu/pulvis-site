import { useState, type FormEvent } from 'react'

interface LoginScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>
}

export default function LoginScreen({ onSignIn }: LoginScreenProps) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setFormError(null)

    const { error } = await onSignIn(email.trim(), password)

    if (error) {
      // Message générique volontaire : ne pas confirmer si l'email existe ou non
      setFormError('Identifiants incorrects.')
      setSubmitting(false)
    }
    // en cas de succès, useAuth bascule le status via onAuthStateChange —
    // pas besoin de setSubmitting(false) ici, l'écran change tout seul
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 bg-gray-950">
      <div className="flex items-center gap-2.5">
        <span className="text-xl font-bold text-white tracking-tight">■ PULVIS</span>
        <span className="text-[10px] text-gray-700 uppercase tracking-widest">Dashboard</span>
      </div>

      <form onSubmit={handleSubmit} className="card w-full max-w-sm p-6 flex flex-col gap-4">
        <div>
          <h1 className="text-sm font-semibold text-white mb-1">Connexion administrateur</h1>
          <p className="text-xs text-gray-600">Accès réservé — PULVIS OS interne.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="label">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={submitting}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white
              placeholder:text-gray-700 focus:outline-none focus:border-violet-600 disabled:opacity-50"
            placeholder="pulviscontact@gmail.com"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="label">Mot de passe</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={submitting}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white
              placeholder:text-gray-700 focus:outline-none focus:border-violet-600 disabled:opacity-50"
            placeholder="••••••••"
          />
        </label>

        {formError && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-900/60
            bg-red-950/30 text-xs text-red-400">
            <span>🔴</span>
            <span>{formError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !email || !password}
          className="mt-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40
            disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
        >
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
