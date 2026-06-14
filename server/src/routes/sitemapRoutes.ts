import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../prisma';
import config from '../config';

const router = Router();

const siteUrl = config.frontendUrl.replace(/\/$/, '');

function urlEntry(loc: string, lastmod?: Date, priority = '0.7') {
  const date = lastmod ? lastmod.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${date}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
}

router.get(
  '/sitemap.xml',
  asyncHandler(async (_req: Request, res: Response) => {
    const [products, categories, blogs] = await Promise.all([
      prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ where: { status: 'ACTIVE' }, select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
    ]);

    const staticPages = [
      urlEntry(`${siteUrl}/#/`, undefined, '1.0'),
      urlEntry(`${siteUrl}/#/products`, undefined, '0.9'),
      urlEntry(`${siteUrl}/#/categories`, undefined, '0.8'),
      urlEntry(`${siteUrl}/#/blogs`, undefined, '0.7'),
      urlEntry(`${siteUrl}/#/brands`, undefined, '0.6'),
      urlEntry(`${siteUrl}/#/faq`, undefined, '0.6'),
    ];

    const productEntries = products.map(p =>
      urlEntry(`${siteUrl}/#/product/${p.slug}`, p.updatedAt, '0.8')
    );
    const categoryEntries = categories.map(c =>
      urlEntry(`${siteUrl}/#/category/${c.slug}`, c.updatedAt, '0.7')
    );
    const blogEntries = blogs.map(b =>
      urlEntry(`${siteUrl}/#/blogs`, b.updatedAt, '0.6')
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...productEntries, ...categoryEntries, ...blogEntries].join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  })
);

router.get('/robots.txt', (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/api/sitemap.xml\n`);
});

export default router;
