import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(_context: APIContext) {
  const posts = await getCollection('blog');

  const staticUrls = [
    { url: 'https://zamechek.com/', changefreq: 'monthly', priority: '1.0' },
    { url: 'https://zamechek.com/blog/', changefreq: 'weekly', priority: '0.8' },
  ];

  const postUrls = posts.map(post => ({
    url: `https://zamechek.com/blog/${post.slug}/`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: post.data.published.toISOString().split('T')[0],
  }));

  const allUrls = [...staticUrls, ...postUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(({ url, changefreq, priority, lastmod }) => `  <url>
    <loc>${url}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>\n    ` : ''}<changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
