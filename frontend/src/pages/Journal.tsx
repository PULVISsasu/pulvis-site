import SectionTitle from '../components/SectionTitle'
import ArticleCard from '../components/ArticleCard'
import ScrollReveal from '../components/ScrollReveal'
import { articles } from '../data/articles'

export default function Journal() {
  return (
    <div className="container-pulvis flex flex-col gap-12 py-16 sm:py-24">
      <SectionTitle
        eyebrow="Le Journal PULVIS"
        title="Parfum, mouvement, style et nouveaux usages."
        description="Des repères et des réflexions autour du parfum, pour mieux choisir votre fragrance au bon moment."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, i) => (
          <ScrollReveal key={article.slug} delay={(i % 3) * 0.06}>
            <ArticleCard article={article} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
