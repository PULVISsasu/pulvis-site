import { ArrowRight, CreditCard, Droplet, MapPin, Sparkles } from 'lucide-react'
import Button from '../components/Button'
import Badge from '../components/Badge'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import PlaceholderImage from '../components/PlaceholderImage'
import PerfumeCard from '../components/PerfumeCard'
import ArticleCard from '../components/ArticleCard'
import LocationCard from '../components/LocationCard'
import CTASection from '../components/CTASection'
import { perfumes } from '../data/perfumes'
import { articles } from '../data/articles'
import { stations } from '../data/stations'

const steps = [
  {
    icon: Droplet,
    title: 'Choisissez votre parfum',
    description: 'Cinq fragrances distinctes, disponibles directement sur la station.',
  },
  {
    icon: CreditCard,
    title: 'Payez sans contact',
    description: 'Carte bancaire ou mobile. 1 € par utilisation, sans inscription.',
  },
  {
    icon: Sparkles,
    title: 'Profitez de vos pulvérisations',
    description: 'Deux pulvérisations, prêtes en quelques secondes.',
  },
]

export default function Home() {
  const featuredStations = stations.slice(0, 3)
  const featuredArticles = articles.slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden border-b border-white/10 sm:min-h-screen">
        <PlaceholderImage
          label="Personne utilisant une station PULVIS"
          icon={Sparkles}
          tone="deep"
          className="absolute inset-0 h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-pulvis-bg via-pulvis-bg/60 to-transparent" />

        <div className="container-pulvis relative z-10 flex flex-col gap-6 pb-16 pt-32 sm:pb-24">
          <span className="eyebrow animate-fadeUp" style={{ animationDelay: '0.05s' }}>
            PULVIS
          </span>
          <h1
            className="max-w-3xl animate-fadeUp font-serif text-5xl font-medium leading-[1.05] text-pulvis-cream opacity-0 sm:text-6xl lg:text-7xl"
            style={{ animationDelay: '0.15s' }}
          >
            Le parfum, au bon moment.
          </h1>
          <p
            className="max-w-xl animate-fadeUp text-base leading-relaxed text-pulvis-muted opacity-0 sm:text-lg"
            style={{ animationDelay: '0.3s' }}
          >
            Découvrez une sélection de fragrances et parfumez-vous en quelques secondes,
            directement dans vos lieux préférés.
          </p>
          <div
            className="flex animate-fadeUp flex-col gap-3 pt-2 opacity-0 sm:flex-row"
            style={{ animationDelay: '0.45s' }}
          >
            <Button to="/parfums" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
              Découvrir les parfums
            </Button>
            <Button to="/trouver-pulvis" variant="secondary" size="lg">
              Trouver une station
            </Button>
          </div>
        </div>
      </section>

      {/* Fonctionnement rapide */}
      <section className="border-b border-white/10 py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-14">
          <SectionTitle
            eyebrow="Fonctionnement"
            title="Trois gestes. Quelques secondes."
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 0.1}>
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-pulvis-gold/30 text-pulvis-gold">
                    <step.icon className="h-6 w-6" strokeWidth={1.4} />
                  </div>
                  <span className="text-xs uppercase tracking-widest2 text-pulvis-gold">
                    Étape {i + 1}
                  </span>
                  <h3 className="font-serif text-2xl text-pulvis-cream">{step.title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-pulvis-muted">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="flex flex-wrap items-center justify-center gap-3">
            <Badge>1 €</Badge>
            <Badge>2 pulvérisations</Badge>
            <Badge>Aucune application nécessaire</Badge>
          </ScrollReveal>
        </div>
      </section>

      {/* Parfums */}
      <section className="border-b border-white/10 py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="Collection"
              title="Cinq fragrances, cinq intentions."
              description="Chaque station PULVIS propose une sélection pensée pour accompagner tous les moments de la journée."
            />
            <Button to="/parfums" variant="ghost" icon={<ArrowRight className="h-4 w-4" />} className="shrink-0">
              Tous les parfums
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {perfumes.map((perfume, i) => (
              <ScrollReveal key={perfume.slug} delay={(i % 3) * 0.08}>
                <PerfumeCard perfume={perfume} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Expérience */}
      <section className="border-b border-white/10 bg-pulvis-bgLight py-20 sm:py-28">
        <div className="container-pulvis grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <PlaceholderImage
              label="Moment de fraîcheur PULVIS"
              icon={Droplet}
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="flex flex-col gap-6">
            <span className="eyebrow">L'expérience</span>
            <h2 className="font-serif text-3xl font-medium leading-tight text-pulvis-cream sm:text-4xl">
              Un réflexe pour chaque moment de la journée.
            </h2>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Après le sport, avant une soirée ou simplement lorsque vous avez envie de vous
              rafraîchir : PULVIS vous permet d'accéder à une fragrance en quelques secondes.
            </p>
            <Button to="/comment-ca-marche" variant="secondary" className="w-fit">
              Comment ça marche
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Localisation */}
      <section className="border-b border-white/10 py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle
            eyebrow="À proximité"
            title="Des stations dans vos lieux préférés."
            description="Salles de sport, hôtels, bars, centres commerciaux : PULVIS s'installe là où vous en avez besoin."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {featuredStations.map((station, i) => (
              <ScrollReveal key={station.id} delay={i * 0.08}>
                <LocationCard station={station} compact />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="flex justify-center">
            <Button to="/trouver-pulvis" size="lg" icon={<MapPin className="h-4 w-4" />}>
              Trouver PULVIS près de moi
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Journal */}
      <section className="py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="Le Journal"
              title="Parfum, mouvement et nouveaux usages."
            />
            <Button to="/journal" variant="ghost" icon={<ArrowRight className="h-4 w-4" />} className="shrink-0">
              Tous les articles
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {featuredArticles.map((article, i) => (
              <ScrollReveal key={article.slug} delay={i * 0.08}>
                <ArticleCard article={article} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Votre prochain parfum est peut-être à quelques mètres."
        description="Trouvez la station PULVIS la plus proche et laissez votre empreinte, où que vous soyez."
        buttonLabel="Trouver une station"
        buttonTo="/trouver-pulvis"
      />
    </>
  )
}
