/**
 * Rewrite legacy .html links in CMS HTML content to Next.js routes
 */
export function rewriteCmsLinks(html: string): string {
  return html
    .replace(/href="photography\.html"/g, 'href="/photography"')
    .replace(/href="film-motion\.html"/g, 'href="/film-motion"')
    .replace(/href="art-direction\.html"/g, 'href="/art-direction"')
    .replace(/href="contact\.html"/g, 'href="/contact"')
    .replace(/href="index\.html"/g, 'href="/"')
}
