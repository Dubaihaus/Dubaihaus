/**
 * One-time data migration script for blog taxonomy refactoring
 * 
 * This script migrates from post-scoped categories/tags to global entities.
 * 
 * IMPORTANT: Run this AFTER the Prisma migration creates the new tables
 * but BEFORE dropping the old BlogCategory/BlogTag tables.
 * 
 * Usage:
 *   node prisma/blog-migration-script.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

async function migrateBlogTaxonomy() {
    console.log('🚀 Starting blog taxonomy migration...\n');

    try {
        // Step 1: Fetch all blog posts  
        console.log('📊 Step 1: Fetching existing blog posts...');
        const posts = await prisma.blogPost.findMany({
            select: { id: true }
        });
        console.log(`   Found ${posts.length} blog posts\n`);

        // Step 2: Fetch old categories directly from DB (they still exist as regular DB tables)
        console.log('🏷️  Step 2: Fetching old category data directly from database...');
        const oldCategories = await prisma.$queryRaw`
      SELECT bc.id, bc.name, bc."blogId", bp.id as "postId"
      FROM "BlogCategory" bc
      LEFT JOIN "BlogPost" bp ON bc."blogId" = bp.id
      ORDER BY bc.id
    `;
        console.log(`   Found ${oldCategories.length} old category records\n`);

        // Step 3: Fetch old tags directly from DB
        console.log('🔖 Step 3: Fetching old tag data directly from database...');
        const oldTags = await prisma.$queryRaw`
      SELECT bt.id, bt.name, bt."blogId", bp.id as "postId"
      FROM "BlogTag" bt
      LEFT JOIN "BlogPost" bp ON bt."blogId" = bp.id
      ORDER BY bt.id
    `;
        console.log(`   Found ${oldTags.length} old tag records\n`);

        // Step 4: Extract unique category names and create global categories
        console.log('✨ Step 4: Creating global category records...');
        const categoryNames = new Set();
        oldCategories.forEach(cat => {
            if (cat.name) categoryNames.add(cat.name.trim());
        });

        const categoryMap = new Map(); // name -> {id, postIds}
        let categoryOrder = 0;

        for (const name of categoryNames) {
            const slug = slugify(name);

            // Create or find category
            const category = await prisma.blogCategory.upsert({
                where: { slug },
                update: {},
                create: {
                    name,
                    slug,
                    order: categoryOrder++,
                },
            });

            // Track which posts had this category
            const postIds = oldCategories
                .filter(c => c.name && c.name.trim() === name && c.postId)
                .map(c => c.postId);

            categoryMap.set(name, { id: category.id, postIds });
            console.log(`   ✓ Created/found category: "${name}" (${category.id}) - used in ${postIds.length} posts`);
        }
        console.log(`   Created ${categoryMap.size} global categories\n`);

        // Step 5: Extract unique tag names and create global tags
        console.log('📌 Step 5: Creating global tag records...');
        const tagNames = new Set();
        oldTags.forEach(tag => {
            if (tag.name) tagNames.add(tag.name.trim());
        });

        const tagMap = new Map(); // name -> {id, postIds}

        for (const name of tagNames) {
            const slug = slugify(name);

            // Create or find tag
            const tag = await prisma.blogTag.upsert({
                where: { slug },
                update: {},
                create: {
                    name,
                    slug,
                },
            });

            // Track which posts had this tag
            const postIds = oldTags
                .filter(t => t.name && t.name.trim() === name && t.postId)
                .map(t => t.postId);

            tagMap.set(name, { id: tag.id, postIds });
            console.log(`   ✓ Created/found tag: "${name}" (${tag.id}) - used in ${postIds.length} posts`);
        }
        console.log(`   Created ${tagMap.size} global tags\n`);

        // Step 6: Create join table records
        console.log('🔗 Step 6: Creating join table records...');
        let categoryLinksCreated = 0;
        let tagLinksCreated = 0;

        // Create category links
        for (const [categoryName, categoryData] of categoryMap) {
            for (let i = 0; i < categoryData.postIds.length; i++) {
                const postId = categoryData.postIds[i];

                try {
                    await prisma.blogPostCategory.create({
                        data: {
                            blogId: postId,
                            categoryId: categoryData.id,
                            position: i,
                        },
                    });
                    categoryLinksCreated++;
                } catch (err) {
                    // Might already exist due to upsert or duplicate constraint
                    console.warn(`   ⚠️  Could not create category link for post ${postId} and category ${categoryName}: ${err.message}`);
                }
            }
        }

        // Create tag links
        for (const [tagName, tagData] of tagMap) {
            for (const postId of tagData.postIds) {
                try {
                    await prisma.blogPostTag.create({
                        data: {
                            blogId: postId,
                            tagId: tagData.id,
                        },
                    });
                    tagLinksCreated++;
                } catch (err) {
                    // Might already exist
                    console.warn(`   ⚠️  Could not create tag link for post ${postId} and tag ${tagName}: ${err.message}`);
                }
            }
        }

        console.log(`   ✓ Created ${categoryLinksCreated} category links`);
        console.log(`   ✓ Created ${tagLinksCreated} tag links\n`);

        // Step 7: Verification
        console.log('✅ Step 7: Verifying migration...');
        const postsWithLinks = await prisma.blogPost.findMany({
            include: {
                categoryLinks: true,
                tagLinks: true,
            },
        });

        const totalCategoryLinks = postsWithLinks.reduce((sum, p) => sum + p.categoryLinks.length, 0);
        const totalTagLinks = postsWithLinks.reduce((sum, p) => sum + p.tagLinks.length, 0);

        console.log(`   ✓ Total posts: ${postsWithLinks.length}`);
        console.log(`   ✓ Total category links: ${totalCategoryLinks}`);
        console.log(`   ✓ Total tag links: ${totalTagLinks}`);
        console.log(`   ✓ Migration verification complete\n`);

        console.log('🎉 Migration completed successfully!\n');
        console.log('📝 Next steps:');
        console.log('   1. Verify the data in your database');
        console.log('   2. Update your application code to use new relations');
        console.log('   3. Once verified, you can drop old BlogCategory and BlogTag tables');
        console.log('      with: npx prisma migrate dev --name cleanup-old-blog-tables\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateBlogTaxonomy()
    .then(() => {
        console.log('✅ Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
