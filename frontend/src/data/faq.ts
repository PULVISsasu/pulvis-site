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
    title: 'Utilisation',
    items: [
      {
        question: 'Comment utiliser une station PULVIS ?',
        answer:
          'Choisissez votre parfum parmi les cinq fragrances proposées, payez 1 € sans contact directement sur la station, puis placez-vous devant la buse pour recevoir vos deux pulvérisations.',
      },
      {
        question: 'Combien coûte une utilisation ?',
        answer: 'Chaque utilisation coûte 1 €, quel que soit le parfum choisi.',
      },
      {
        question: 'Combien de pulvérisations vais-je recevoir ?',
        answer: 'Chaque paiement donne droit à deux pulvérisations du parfum sélectionné.',
      },
      {
        question: 'Quels moyens de paiement sont acceptés ?',
        answer:
          'Les stations PULVIS acceptent uniquement le paiement sans contact : carte bancaire, smartphone ou montre connectée.',
      },
      {
        question: 'Ai-je besoin d\'une application ?',
        answer:
          'Non. Aucune application ni aucun compte n\'est nécessaire pour utiliser une station PULVIS.',
      },
    ],
  },
  {
    title: 'Parfums',
    items: [
      {
        question: 'Quels parfums sont disponibles ?',
        answer:
          'PULVIS propose cinq fragrances : VITAL, NOVA, FORGE, AERO et ELIXIR, chacune avec un profil olfactif distinct.',
      },
      {
        question: 'Les parfums sont-ils prêts à l\'emploi ?',
        answer: 'Oui, chaque fragrance est vaporisée directement, sans préparation ni dilution.',
      },
      {
        question: 'Puis-je les appliquer sur mes vêtements ?',
        answer:
          'Les fragrances PULVIS sont conçues pour une application sur la peau. Certains tissus peuvent réagir différemment aux parfums.',
      },
      {
        question: 'Comment connaître les notes d\'un parfum ?',
        answer:
          'Chaque fiche parfum, accessible depuis la page Parfums, détaille les notes de tête, de cœur et de fond ainsi que le profil olfactif complet.',
      },
    ],
  },
  {
    title: 'Paiement et assistance',
    items: [
      {
        question: 'J\'ai été débité mais je n\'ai pas reçu de pulvérisation',
        answer:
          'Rendez-vous sur la page Aide et assistance pour signaler l\'incident avec le numéro de la station. Notre équipe examine chaque demande individuellement.',
      },
      {
        question: 'La machine semble indisponible',
        answer:
          'Certaines stations peuvent être temporairement indisponibles pour maintenance ou réapprovisionnement. Consultez la page Trouver PULVIS pour vérifier l\'état des stations à proximité.',
      },
      {
        question: 'Comment contacter PULVIS ?',
        answer:
          'Le formulaire de la page Aide et assistance permet de nous contacter directement pour toute question ou incident.',
      },
      {
        question: 'Comment demander l\'examen d\'un paiement ?',
        answer:
          'Utilisez le formulaire d\'assistance en précisant la date, l\'heure et le numéro de la station concernée. Une réponse vous sera apportée après vérification.',
      },
    ],
  },
]
