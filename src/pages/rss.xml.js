import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { cleanSlug } from '../utils';

export async function GET(context) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Mike Ayles',
    description: 'Trucks, engines, emissions, and the software around them.',
    site: context.site,
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${cleanSlug(post.id)}/`,
      categories: post.data.tags,
    })),
  });
}
