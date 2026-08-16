export interface FaqItem {
  question: string
  answer: string
}

export interface FaqCategory {
  title: string
  items: FaqItem[]
}

export const faqCategories: FaqCategory[] = [
  {
    title: 'Partenariat & modèle économique',
    items: [
      {
        question: 'Combien coûte l’installation pour mon établissement ?',
        answer:
          'L’installation d’une station PULVIS ne nécessite aucun investissement financier direct de votre part. PULVIS prend en charge la station, sa mise en service, les parfums, le réapprovisionnement, la maintenance et la gestion des paiements.',
      },
      {
        question: 'Mon établissement reçoit-il une commission sur les ventes ?',
        answer:
          'Le modèle PULVIS ne prévoit actuellement aucune commission reversée à l’établissement. La station et son exploitation restent entièrement gérées par PULVIS. Votre établissement bénéficie en retour d’un nouveau service pour ses adhérents et d’une image premium, sans aucune gestion opérationnelle de votre part.',
      },
      {
        question: 'Comment devenir établissement partenaire ?',
        answer:
          'Il vous suffit de remplir le formulaire de contact. Notre équipe étudie votre établissement et revient vers vous pour évaluer la pertinence d’une installation PULVIS.',
      },
      {
        question: 'Combien de temps dure l’installation ?',
        answer:
          'La durée dépend de la configuration de chaque établissement. Elle vous est précisée lors de l’étude de votre emplacement.',
      },
    ],
  },
  {
    title: 'Exploitation & maintenance',
    items: [
      {
        question: 'Qui s’occupe du réapprovisionnement ?',
        answer:
          'PULVIS. Nos équipes suivent les niveaux de stock et réapprovisionnent les stations, sans aucune action nécessaire de votre part.',
      },
      {
        question: 'Qui entretient la station ?',
        answer: 'PULVIS assure le suivi technique et la maintenance de chaque station installée.',
      },
      {
        question: 'Qui gère les paiements ?',
        answer:
          'PULVIS gère l’intégralité des paiements réalisés sur les stations. Votre établissement n’a aucune caisse supplémentaire à gérer.',
      },
      {
        question: 'Que se passe-t-il en cas de panne ?',
        answer:
          'PULVIS assure le suivi et la maintenance de ses stations. En cas d’incident, notre équipe intervient pour rétablir le service dans les meilleurs délais.',
      },
      {
        question: 'Mon établissement doit-il gérer du stock ?',
        answer: 'Non. PULVIS gère l’intégralité du réapprovisionnement des stations.',
      },
      {
        question: 'Combien de place faut-il pour installer une station ?',
        answer:
          'L’espace nécessaire dépend de la configuration de votre établissement. Nos équipes évaluent l’emplacement le plus pertinent lors de l’étude préalable à l’installation.',
      },
    ],
  },
  {
    title: 'Parfums',
    items: [
      {
        question: 'Quels parfums sont disponibles ?',
        answer:
          'Chaque station propose une sélection de parfums premium. Retrouvez un aperçu de la sélection actuelle sur la page dédiée aux parfums.',
      },
      {
        question: 'Peut-on changer les parfums proposés ?',
        answer:
          'La sélection peut évoluer dans le temps, selon la stratégie PULVIS et les usages observés sur chaque station.',
      },
    ],
  },
]
