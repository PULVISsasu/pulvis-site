interface AccessDeniedScreenProps {
  email: string | undefined
  onSignOut: () => void
}

export default function AccessDeniedScreen({ email, onSignOut }: AccessDeniedScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center bg-gray-950">
      <span className="text-3xl">⛔</span>
      <div>
        <h1 className="text-xl font-bold text-white mb-2">Accès refusé</h1>
        <p className="text-gray-500 text-sm max-w-sm">
          {email ? <>Le compte <span className="text-gray-300">{email}</span> est authentifié</> : 'Ce compte est authentifié'}
          {' '}mais n'a pas les droits administrateur PULVIS OS.
        </p>
      </div>
      <button
        onClick={onSignOut}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors"
      >
        Se déconnecter
      </button>
    </div>
  )
}
