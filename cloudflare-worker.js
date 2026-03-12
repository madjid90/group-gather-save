const SUPABASE_PRERENDER_URL = 'https://kaebtbcufbpkhyrhuson.supabase.co/functions/v1/prerender'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZWJ0YmN1ZmJwa2h5cmh1c29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNDA1NzIsImV4cCI6MjA4MDcxNjU3Mn0.NWyh3stqUNjoeW2s3n8HLdWW7167qdhgc11uZh-f6QI'

const BOT_AGENTS = /googlebot|bingbot|yandexbot|duckduckbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|applebot|msnbot/i
const SKIP_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|pdf|zip|mp4|webp)$/i
const SEO_PATHS = ['/electricite/', '/gaz/', '/']

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const userAgent = request.headers.get('User-Agent') || ''

  if (SKIP_EXTENSIONS.test(url.pathname)) return fetch(request)

  const isBotRequest = BOT_AGENTS.test(userAgent)
  const isSeoPage = SEO_PATHS.some(p => url.pathname.startsWith(p))

  if (isBotRequest && isSeoPage) {
    try {
      const prerenderUrl = `${SUPABASE_PRERENDER_URL}?path=${encodeURIComponent(url.pathname)}`
      const response = await fetch(prerenderUrl, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'X-Original-User-Agent': userAgent,
          'X-Forwarded-For': request.headers.get('CF-Connecting-IP') || '',
        },
        cf: { cacheTtl: 3600, cacheEverything: false }
      })
      if (response.ok) {
        const html = await response.text()
        return new Response(html, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600', 'X-Prerendered': 'true' }
        })
      }
    } catch (e) { console.error('Prerender failed:', e) }
  }

  return fetch(request)
}
