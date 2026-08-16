import { useEffect } from 'react'

const SITE_NAME = 'PULVIS'
const BASE_DESCRIPTION =
  'PULVIS installe des stations de parfum premium en libre-service dans les salles de sport et prend en charge leur exploitation.'

export function usePageMeta(title: string, description: string = BASE_DESCRIPTION) {
  useEffect(() => {
    document.title = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`

    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)

    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) ogDescription.setAttribute('content', description)
  }, [title, description])
}
