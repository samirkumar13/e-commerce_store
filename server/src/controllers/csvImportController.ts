import asyncHandler from 'express-async-handler';
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prisma';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseCSV(raw: string): Record<string, string>[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle quoted fields with commas inside
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        cells.push(cur.trim());
        cur = '';
        continue;
      }
      cur += ch;
    }
    cells.push(cur.trim());

    if (cells.every((c) => !c)) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

export const importProductsCSV = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No CSV file uploaded');
  }

  const raw = req.file.buffer.toString('utf-8');
  const rows = parseCSV(raw);

  if (rows.length === 0) {
    res.status(400);
    throw new Error('CSV is empty or has no data rows');
  }

  // Pre-load all categories for lookup by name
  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((c) => [c.name.toLowerCase(), c.id]));

  const results: {
    row: number;
    name: string;
    status: 'created' | 'skipped' | 'error';
    reason?: string;
  }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-based + header row
    const name = row['name']?.trim();

    if (!name) {
      results.push({ row: rowNum, name: '(empty)', status: 'skipped', reason: 'Missing name' });
      continue;
    }

    const priceStr = row['price']?.trim();
    const price = parseFloat(priceStr);
    if (!priceStr || isNaN(price)) {
      results.push({ row: rowNum, name, status: 'error', reason: 'Invalid or missing price' });
      continue;
    }

    // Resolve category
    const categoryName = row['category']?.trim() || '';
    let categoryId = categoryMap.get(categoryName.toLowerCase());
    if (!categoryId) {
      // Create category on-the-fly if it doesn't exist
      if (categoryName) {
        const newCat = await prisma.category.create({
          data: { name: categoryName, slug: slugify(categoryName) },
        });
        categoryMap.set(categoryName.toLowerCase(), newCat.id);
        categoryId = newCat.id;
      } else {
        // Use first available category as fallback
        if (allCategories.length > 0) {
          categoryId = allCategories[0].id;
        } else {
          results.push({
            row: rowNum,
            name,
            status: 'error',
            reason: 'No category specified and no categories exist',
          });
          continue;
        }
      }
    }

    const slug = row['slug']?.trim() || slugify(name);
    // Make slug unique by appending index if needed
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}-${i}` : slug;

    try {
      await prisma.product.create({
        data: {
          name,
          slug: finalSlug,
          description: row['description']?.trim() || '',
          price,
          originalPrice: row['originalPrice'] ? parseFloat(row['originalPrice']) : null,
          stock: row['stock'] ? parseInt(row['stock'], 10) : 0,
          imageUrl: row['imageUrl']?.trim() || 'https://placehold.co/400x400?text=No+Image',
          images: [],
          sku: row['sku']?.trim() || null,
          categoryId: categoryId!,
          metaTitle: row['metaTitle']?.trim() || null,
          metaDescription: row['metaDescription']?.trim() || null,
        },
      });
      results.push({ row: rowNum, name, status: 'created' });
    } catch (err: any) {
      results.push({
        row: rowNum,
        name,
        status: 'error',
        reason: err.message?.includes('Unique') ? 'Duplicate SKU or slug' : err.message,
      });
    }
  }

  const created = results.filter((r) => r.status === 'created').length;
  const errors = results.filter((r) => r.status === 'error').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  res.json({ created, errors, skipped, total: rows.length, results });
});
