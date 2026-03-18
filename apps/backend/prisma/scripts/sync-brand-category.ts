import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.productTemplate.findMany({
    select: { brandId: true, categoryId: true },
  });

  const uniquePairs = new Map<string, { brandId: string; categoryId: string }>();
  for (const t of templates) {
    if (!t.brandId || !t.categoryId) continue;
    uniquePairs.set(`${t.brandId}:${t.categoryId}`, {
      brandId: t.brandId,
      categoryId: t.categoryId,
    });
  }

  const pairs = Array.from(uniquePairs.values());
  if (pairs.length === 0) {
    console.log('No brand-category pairs found in product_templates.');
    return;
  }

  const result = await prisma.brandCategory.createMany({
    data: pairs,
    skipDuplicates: true,
  });

  console.log(`Upserted ${result.count} brand-category pairs.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
