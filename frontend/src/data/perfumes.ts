export type PerfumeGender = 'Homme' | 'Femme' | 'Mixte'
export type PerfumeFamily = 'Frais' | 'Boisé' | 'Floral' | 'Ambré'

export interface Perfume {
  slug: string
  name: string
  profile: PerfumeGender
  family: PerfumeFamily
  familyLabel: string
  tagline: string
  description: string
  notesTop: string[]
  notesHeart: string[]
  notesBase: string[]
  intensity: 'Légère' | 'Modérée' | 'Intense'
  moments: string[]
  color: string
}

export const perfumes: Perfume[] = [
  {
    slug: 'vital',
    name: 'VITAL',
    profile: 'Mixte',
    family: 'Frais',
    familyLabel: 'Aromatique frais',
    tagline: 'Net. Aromatique. Éveillé.',
    description:
      'Une fragrance vive et aromatique, pensée pour marquer un nouveau départ dans la journée. VITAL réveille les sens sans jamais forcer le trait.',
    notesTop: ['Bergamote'],
    notesHeart: ['Lavande'],
    notesBase: ['Bois clair'],
    intensity: 'Modérée',
    moments: ['Sortie de sport', 'Début de journée', 'Après la douche'],
    color: '#8FA98F',
  },
  {
    slug: 'nova',
    name: 'NOVA',
    profile: 'Femme',
    family: 'Floral',
    familyLabel: 'Floral lumineux',
    tagline: 'Lumineux. Floral. Vibrant.',
    description:
      'Une signature florale et pétillante, portée par une poire juteuse et un jasmin délicat. NOVA illumine chaque entrée en scène.',
    notesTop: ['Poire'],
    notesHeart: ['Jasmin'],
    notesBase: ['Muscs blancs'],
    intensity: 'Modérée',
    moments: ['Journée en ville', 'Rendez-vous', 'Après-midi entre amis'],
    color: '#E7C7D6',
  },
  {
    slug: 'forge',
    name: 'FORGE',
    profile: 'Homme',
    family: 'Boisé',
    familyLabel: 'Boisé ambré',
    tagline: 'Intense. Boisé. Ambré.',
    description:
      'Une fragrance dense et assurée, entre poivre noir et ambre chaud. FORGE s\'impose avec caractère, sans jamais crier.',
    notesTop: ['Poivre'],
    notesHeart: ['Cèdre'],
    notesBase: ['Ambre'],
    intensity: 'Intense',
    moments: ['Soirée', 'Dîner', 'Sortie en fin de journée'],
    color: '#B08655',
  },
  {
    slug: 'aero',
    name: 'AERO',
    profile: 'Homme',
    family: 'Frais',
    familyLabel: 'Frais aquatique',
    tagline: 'Frais. Aquatique. Boisé.',
    description:
      'Une fragrance nette et énergique, pensée pour accompagner les moments où vous souhaitez retrouver une sensation de fraîcheur.',
    notesTop: ['Agrumes'],
    notesHeart: ['Accord marin'],
    notesBase: ['Bois'],
    intensity: 'Légère',
    moments: ['Sortie de salle de sport', 'Journée active', 'Avant un rendez-vous'],
    color: '#7FAFC4',
  },
  {
    slug: 'elixir',
    name: 'ELIXIR',
    profile: 'Femme',
    family: 'Ambré',
    familyLabel: 'Ambré gourmand',
    tagline: 'Chaud. Ambré. Gourmand.',
    description:
      'Une fragrance enveloppante entre vanille et fleurs blanches, réchauffée par un fond boisé. ELIXIR accompagne les soirées qui comptent.',
    notesTop: ['Vanille'],
    notesHeart: ['Fleurs blanches'],
    notesBase: ['Bois chaud'],
    intensity: 'Intense',
    moments: ['Soirée', 'Sortie nocturne', 'Moment pour soi'],
    color: '#C99A6A',
  },
]

export function getPerfumeBySlug(slug: string): Perfume | undefined {
  return perfumes.find((p) => p.slug === slug)
}
