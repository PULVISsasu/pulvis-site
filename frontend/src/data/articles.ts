export interface Article {
  slug: string
  category: string
  title: string
  summary: string
  readTime: string
  date: string
  intro: string
  quote: string
  content: { heading: string; paragraphs: string[] }[]
}

export const articles: Article[] = [
  {
    slug: 'parfum-reflexe-apres-sport',
    category: 'Usages',
    title: 'Pourquoi le parfum devient un nouveau réflexe après le sport',
    summary:
      'De plus en plus de sportifs intègrent une touche de parfum à leur routine post-entraînement. Décryptage d\'une habitude qui s\'installe.',
    readTime: '4 min',
    date: '12 mars 2026',
    intro:
      'Sortir de la salle de sport propre et frais ne suffit plus toujours. Une nouvelle génération de sportifs ajoute une dernière étape à sa routine : une touche de parfum, en quelques secondes, avant de reprendre sa journée.',
    quote: 'Le parfum n\'efface pas l\'effort, il le prolonge autrement.',
    content: [
      {
        heading: 'Une routine qui évolue',
        paragraphs: [
          'La douche post-sport reste incontournable, mais elle ne marque plus systématiquement la fin du rituel. De plus en plus de pratiquants cherchent un geste supplémentaire, rapide et discret, pour faire la transition entre l\'effort et le reste de la journée.',
          'Ce geste, c\'est souvent une touche de parfum. Non pas pour masquer, mais pour ponctuer : signaler, à soi-même autant qu\'aux autres, que l\'on passe à autre chose.',
        ],
      },
      {
        heading: 'Un moment plutôt qu\'un produit',
        paragraphs: [
          'Ce qui change avec ce nouveau réflexe, c\'est le rapport au temps. On ne parle plus d\'un flacon que l\'on transporte, mais d\'un accès ponctuel, au bon endroit, au bon moment.',
          'C\'est précisément l\'idée derrière les stations PULVIS installées en sortie de salle : permettre cette touche finale sans avoir à y penser à l\'avance.',
        ],
      },
    ],
  },
  {
    slug: 'choisir-fragrance-selon-moment',
    category: 'Conseils',
    title: 'Comment choisir une fragrance selon le moment',
    summary:
      'Toutes les fragrances ne se valent pas selon l\'heure et le contexte. Quelques repères simples pour s\'y retrouver.',
    readTime: '5 min',
    date: '2 mars 2026',
    intro:
      'Une fragrance fraîche le matin, une fragrance plus enveloppante le soir : le choix d\'un parfum dépend autant du moment que de la personne qui le porte.',
    quote: 'Le bon parfum n\'est pas le plus fort. C\'est celui qui correspond à l\'instant.',
    content: [
      {
        heading: 'Le matin et la journée',
        paragraphs: [
          'En journée, les fragrances fraîches et aromatiques dominent naturellement : agrumes, notes marines, herbes aromatiques. Elles se portent facilement et ne saturent pas l\'espace autour de vous.',
        ],
      },
      {
        heading: 'La fin de journée et la soirée',
        paragraphs: [
          'Le soir laisse plus de place aux fragrances boisées, ambrées ou gourmandes. Plus enveloppantes, elles accompagnent des contextes où l\'on prend le temps.',
          'PULVIS propose volontairement cinq profils olfactifs distincts, pour que chaque moment de la journée trouve sa fragrance.',
        ],
      },
    ],
  },
  {
    slug: 'frais-boise-ambre-differences',
    category: 'Découverte',
    title: 'Les différences entre une fragrance fraîche, boisée et ambrée',
    summary:
      'Frais, boisé, ambré : ces mots reviennent partout, mais que désignent-ils vraiment ? Petit guide des familles olfactives.',
    readTime: '6 min',
    date: '20 février 2026',
    intro:
      'Comprendre les grandes familles olfactives permet de choisir une fragrance en confiance, sans avoir besoin d\'un vocabulaire d\'expert.',
    quote: 'Chaque famille olfactive raconte une histoire différente.',
    content: [
      {
        heading: 'Les fragrances fraîches',
        paragraphs: [
          'Agrumes, notes aromatiques, accords marins : les fragrances fraîches se distinguent par leur légèreté et leur pouvoir énergisant. Ce sont souvent les plus faciles à porter au quotidien.',
        ],
      },
      {
        heading: 'Les fragrances boisées',
        paragraphs: [
          'Cèdre, vétiver, bois secs : les fragrances boisées apportent structure et assurance. Elles conviennent particulièrement aux moments où l\'on souhaite affirmer sa présence sans excès.',
        ],
      },
      {
        heading: 'Les fragrances ambrées',
        paragraphs: [
          'Vanille, résines, fleurs blanches : les fragrances ambrées sont chaleureuses et enveloppantes. Elles se révèlent pleinement en fin de journée.',
        ],
      },
    ],
  },
  {
    slug: 'changer-parfum-selon-humeur',
    category: 'Réflexion',
    title: 'Peut-on changer de parfum selon son humeur ?',
    summary:
      'Longtemps réservé à un flacon unique, le parfum devient un choix que l\'on ajuste, jour après jour.',
    readTime: '3 min',
    date: '8 février 2026',
    intro:
      'Pendant longtemps, avoir « son » parfum signifiait en porter un seul, en toute circonstance. Cette approche évolue.',
    quote: 'Un parfum différent, une intention différente.',
    content: [
      {
        heading: 'La fin du flacon unique',
        paragraphs: [
          'À mesure que l\'accès aux fragrances se simplifie, l\'idée de varier son parfum selon le contexte gagne du terrain. Un parfum énergique le matin, une fragrance plus profonde le soir.',
          'Ce n\'est plus une question de fidélité à une marque, mais d\'adéquation avec un moment précis.',
        ],
      },
    ],
  },
  {
    slug: 'pulvis-parfum-en-quelques-secondes',
    category: 'PULVIS',
    title: 'PULVIS : le parfum en quelques secondes',
    summary:
      'Comment fonctionne une station PULVIS, et pourquoi cette simplicité change la manière d\'accéder au parfum.',
    readTime: '4 min',
    date: '25 janvier 2026',
    intro:
      'Pas d\'application, pas de compte, pas d\'attente : une station PULVIS se pense en quelques secondes, du choix du parfum à la vaporisation.',
    quote: 'Choisissez. Payez. Vaporisez.',
    content: [
      {
        heading: 'Un accès direct',
        paragraphs: [
          'Chaque station PULVIS propose cinq fragrances distinctes, accessibles pour 1 € et deux pulvérisations. Le paiement se fait exclusivement sans contact, directement sur la station.',
        ],
      },
      {
        heading: 'Pensé pour les lieux de vie',
        paragraphs: [
          'Salles de sport, hôtels, bars : les stations PULVIS s\'installent dans les lieux où une touche de parfum a du sens, au moment où elle a du sens.',
        ],
      },
    ],
  },
  {
    slug: 'gestes-essentiels-bien-se-parfumer',
    category: 'Conseils',
    title: 'Les gestes essentiels pour bien se parfumer',
    summary:
      'Quelques repères simples pour appliquer son parfum efficacement, sans le gaspiller.',
    readTime: '3 min',
    date: '14 janvier 2026',
    intro:
      'Bien se parfumer ne dépend pas seulement du parfum choisi, mais aussi de la manière de l\'appliquer.',
    quote: 'Un bon geste vaut souvent mieux qu\'un flacon entier.',
    content: [
      {
        heading: 'Viser les zones de chaleur',
        paragraphs: [
          'Poignets, cou, intérieur des coudes : ces zones diffusent naturellement mieux les fragrances grâce à la chaleur corporelle.',
        ],
      },
      {
        heading: 'Ne pas frotter',
        paragraphs: [
          'Contrairement à une idée reçue, frotter les poignets après application altère la fragrance. Laissez-la simplement sécher à l\'air libre.',
        ],
      },
    ],
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}
