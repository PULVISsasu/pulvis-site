export interface FragranceNote {
  label: string
  descriptor: string
}

export interface Fragrance {
  slug: string
  name: string
  signature: string
  description: string
  notes: FragranceNote[]
  image: string
}

export const fragrances: Fragrance[] = [
  {
    slug: 'vital',
    name: 'VITAL',
    signature: 'Délicat. Éclatant. L’énergie de la vie.',
    description:
      'Une fragrance lumineuse et délicate, pensée pour apporter une sensation de fraîcheur élégante et positive après l’effort.',
    notes: [
      { label: 'Fleurs blanches', descriptor: 'Pureté florale et lumineuse.' },
      { label: 'Fruits pétillants', descriptor: 'Fraîcheur juteuse et joyeuse.' },
      { label: 'Musc doux', descriptor: 'Sillage doux et réconfortant.' },
    ],
    image: '/images/fragrances/vital.webp',
  },
  {
    slug: 'nova',
    name: 'NOVA',
    signature: 'Chaleureux. Lumineux. L’éclat d’une nouvelle aura.',
    description:
      'Une signature chaleureuse et rayonnante, qui mêle douceur orientale et éclat raffiné pour prolonger le moment.',
    notes: [
      { label: 'Floral oriental', descriptor: 'Élégant et captivant.' },
      { label: 'Épices douces', descriptor: 'Chaleur réconfortante et raffinée.' },
      { label: 'Ambre lumineux', descriptor: 'Sillage enveloppant et inoubliable.' },
    ],
    image: '/images/fragrances/nova.webp',
  },
  {
    slug: 'forge',
    name: 'FORGE',
    signature: 'Force. Caractère. L’énergie de la nature.',
    description:
      'Une fragrance au caractère affirmé, entre fraîcheur végétale et profondeur boisée, pour une présence nette et énergique.',
    notes: [
      { label: 'Herbacé', descriptor: 'Fraîcheur verte et aromatique.' },
      { label: 'Boisé', descriptor: 'Profondeur boisée et résineuse.' },
      { label: 'Épicé', descriptor: 'Touche épicée et vibrante.' },
    ],
    image: '/images/fragrances/forge.webp',
  },
  {
    slug: 'aero',
    name: 'AERO',
    signature: 'Fraîcheur. Liberté. L’évasion à chaque souffle.',
    description:
      'Un souffle frais et vivifiant, aux accents hespéridés et marins, pour une impression de propreté et de liberté.',
    notes: [
      { label: 'Agrumes', descriptor: 'Éclatants et pétillants.' },
      { label: 'Marine', descriptor: 'Accord aquatique et vivifiant.' },
      { label: 'Musqué', descriptor: 'Sillage propre et élégant.' },
    ],
    image: '/images/fragrances/aero.webp',
  },
  {
    slug: 'elixir',
    name: 'ELIXIR',
    signature: 'Intense. Envoûtant. L’essence du mystère.',
    description:
      'Une composition intense et enveloppante, où vanille, ambre et bois ambrés créent un sillage sensuel et mémorable.',
    notes: [
      { label: 'Vanille', descriptor: 'Douceur profonde et addictive.' },
      { label: 'Ambre', descriptor: 'Chaleur sensuelle et enveloppante.' },
      { label: 'Bois ambrés', descriptor: 'Puissance boisée et mystérieuse.' },
    ],
    image: '/images/fragrances/elixir.webp',
  },
]
