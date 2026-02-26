import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  const sortedPosts = posts.sort((a, b) => b.data.published.getTime() - a.data.published.getTime());

  return rss({
    title: 'Shawn Zamechek',
    description: 'Writing on AI, research, and learning.',
    site: context.site ?? 'https://zamechek.com',
    items: sortedPosts.map(post => ({
      title: post.data.title,
      pubDate: post.data.published,
      description: post.data.description ?? post.data.title,
      link: `/blog/${post.slug}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
