import { useParams, Navigate } from 'react-router-dom'
import { Clock, BookOpen } from 'lucide-react'
import { getArticleBySlug, articles } from '../data/articles'
import PlaceholderImage from '../components/PlaceholderImage'
import ArticleCard from '../components/ArticleCard'
import ScrollReveal from '../components/ScrollReveal'
import CTASection from '../components/CTASection'

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const article = getArticleBySlug(slug ?? '')

  if (!article) {
    return <Navigate to="/journal" replace />
  }

  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3)

  return (
    <div>
      <article>
        <div className="container-pulvis flex flex-col gap-6 py-14 sm:py-20">
          <ScrollReveal className="flex flex-col gap-5">
            <span className="eyebrow">{article.category}</span>
            <h1 className="max-w-3xl font-serif text-4xl font-medium leading-tight text-pulvis-cream sm:text-5xl">
              {article.title}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-pulvis-muted sm:text-lg">
              {article.intro}
            </p>
            <span className="flex items-center gap-2 text-xs uppercase tracking-widest2 text-pulvis-muted">
              <Clock className="h-3.5 w-3.5" />
              {article.readTime} · {article.date}
            </span>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <PlaceholderImage
            label={article.title}
            icon={BookOpen}
            className="aspect-[16/8] w-full"
          />
        </ScrollReveal>

        <div className="container-pulvis flex flex-col gap-12 py-14 sm:py-20">
          <div className="mx-auto flex max-w-2xl flex-col gap-10">
            {article.content.map((block, i) => (
              <ScrollReveal key={block.heading} delay={i * 0.06} className="flex flex-col gap-4">
                <h2 className="font-serif text-2xl text-pulvis-cream sm:text-3xl">{block.heading}</h2>
                {block.paragraphs.map((p, j) => (
                  <p key={j} className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
                    {p}
                  </p>
                ))}
              </ScrollReveal>
            ))}

            <ScrollReveal className="border-l-2 border-pulvis-gold py-1 pl-6">
              <p className="font-serif text-2xl italic leading-snug text-pulvis-cream sm:text-3xl">
                « {article.quote} »
              </p>
            </ScrollReveal>
          </div>
        </div>
      </article>

      <section className="border-t border-white/10 py-16 sm:py-20">
        <div className="container-pulvis flex flex-col gap-8">
          <span className="eyebrow">À lire aussi</span>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((a, i) => (
              <ScrollReveal key={a.slug} delay={i * 0.08}>
                <ArticleCard article={a} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Trouvez la fragrance qui vous correspond."
        buttonLabel="Découvrir les parfums"
        buttonTo="/parfums"
      />
    </div>
  )
}
