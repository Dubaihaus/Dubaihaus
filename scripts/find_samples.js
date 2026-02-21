const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const property = await prisma.property.findFirst({
        select: { id: true, title: true }
    });
    console.log('Sample Property:', property);

    const reellyProject = await prisma.reellyProject.findFirst({
        select: { id: true, title: true }
    });
    console.log('Sample ReellyProject:', reellyProject);

    const post = await prisma.blogPost.findFirst({
        where: { status: 'PUBLISHED' },
        include: { seo: { select: { slug: true } } }
    });
    console.log('Sample Post Slug:', post?.seo?.slug);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
