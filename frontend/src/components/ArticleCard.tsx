import { Link } from 'react-router-dom'
import { Clock, ArrowUpRight, BookOpen } from 'lucide-react'
import { type Article } from '../data/articles'
import PlaceholderImage from './PlaceholderImage'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      to={`/journal/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-pulvis-bgLight transition-all duration-500 ease-smooth hover:-translate-y-1 hover:border-pulvis-gold/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <PlaceholderImage
          label={article.title}
          icon={BookOpen}
          className="h-full w-full transition-transform duration-700 ease-smooth group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="eyebrow">{article.category}</span>
        <h3 className="font-serif text-xl leading-snug text-pulvis-cream sm:text-2xl">{article.title}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-pulvis-muted">{article.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-pulvis-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readTime} · {article.date}
          </span>
          <span className="link-underline flex items-center gap-1 text-pulvis-cream group-hover:text-pulvis-gold">
            Lire
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
