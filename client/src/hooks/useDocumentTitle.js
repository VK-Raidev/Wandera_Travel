import { useEffect } from 'react'

function useDocumentTitle(title, description = 'Explore considered trips and destinations with Wanderlust Travels.', robots = 'index,follow') {
  useEffect(() => {
    const summary = description.replace(/\s+/g, ' ').trim().slice(0, 160)
    document.title = `${title} | Wanderlust Travels`
    document.querySelector('meta[name="description"]')?.setAttribute('content', summary)
    document.querySelector('meta[name="robots"]')?.setAttribute('content', robots)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', summary)
  }, [description, robots, title])
}

export { useDocumentTitle }