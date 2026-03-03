import { prisma } from '@/lib/prisma';
import { hashSource } from './projectTranslationService';
import { translateTextToGerman } from './openaiClient';

/**
 * Handles fetching from cache or requesting OpenAI translation for a Blog field.
 * @param {string} blogId 
 * @param {string} lang 
 * @param {string} fieldKey 
 * @param {any} sourceData
 * @param {Function} translatorFn
 */
export async function translateBlogField(blogId, lang, fieldKey, sourceData, translatorFn) {
    if (sourceData == null || sourceData === '') return sourceData;

    // Bypass if not enabled
    if (!process.env.OPENAI_API_KEY && process.env.TRANSLATION_ENABLED !== 'true') {
        return sourceData;
    }

    const sourceStr = typeof sourceData === 'string' ? sourceData : JSON.stringify(sourceData);
    const hash = hashSource(sourceStr);

    try {
        const existing = await prisma.blogTranslation.findUnique({
            where: {
                blogId_lang_fieldKey: {
                    blogId,
                    lang,
                    fieldKey,
                },
            },
        });

        if (existing && existing.originalHash === hash) {
            return existing.translated;
        }

        const translatedData = await translatorFn(sourceData);

        await prisma.blogTranslation.upsert({
            where: {
                blogId_lang_fieldKey: {
                    blogId,
                    lang,
                    fieldKey,
                },
            },
            update: {
                originalHash: hash,
                translated: translatedData,
            },
            create: {
                blogId,
                lang,
                fieldKey,
                originalHash: hash,
                translated: translatedData,
                provider: 'openai',
            },
        });

        return translatedData;
    } catch (err) {
        console.error(`Error in translateBlogField [${blogId}/${fieldKey}]:`, err.message);
        return sourceData;
    }
}

/**
 * Main service to deeply translate a BlogPost payload.
 */
export async function translateBlog(blog, lang) {
    if (!blog || lang !== 'de') return blog;

    const clone = JSON.parse(JSON.stringify(blog));

    // Metadata block mapped for AI usage logs
    const commonContext = {
        source: 'blog',
        locale: lang,
        entityType: 'blog',
        entityId: clone.id,
        routePath: `/blog/${clone.seo?.slug || clone.id}`
    };

    // Helper to translate single string
    const translateString = async (text, key) => {
        if (!text) return text;
        return await translateTextToGerman(text, { ...commonContext, fieldKey: key });
    };

    // 1. Basic textual fields
    if (clone.title) {
        clone.title = await translateBlogField(
            clone.id, lang, 'title', clone.title,
            (t) => translateString(t, 'title')
        );
    }

    if (clone.excerpt) {
        clone.excerpt = await translateBlogField(
            clone.id, lang, 'excerpt', clone.excerpt,
            (t) => translateString(t, 'excerpt')
        );
    }

    // 2. Main Markdown Content
    if (clone.content) {
        clone.content = await translateBlogField(
            clone.id, lang, 'content', clone.content,
            (t) => translateString(t, 'content')
        );
    }

    // 3. Category Names
    if (clone.categoryLinks && clone.categoryLinks.length > 0) {
        // Strip volatile fields from array to avoid caching drops 
        const strippedCats = clone.categoryLinks.map(cl => ({
            category: { name: cl.category?.name }
        }));

        const translatedCats = await translateBlogField(
            clone.id, lang, 'categoryLinks', strippedCats,
            async (catLinks) => {
                const results = [];
                for (const cl of catLinks) {
                    const c = { ...cl };
                    if (c.category?.name) {
                        c.category.name = await translateString(c.category.name, 'category_name');
                    }
                    results.push(c);
                }
                return results;
            }
        );

        // Re-inject the mutated strings back onto the large nested property tree safely
        translatedCats.forEach((tCat, i) => {
            if (tCat.category?.name && clone.categoryLinks[i]?.category) {
                clone.categoryLinks[i].category.name = tCat.category.name;
            }
        });
    }

    if (clone.tagLinks && clone.tagLinks.length > 0) {
        const strippedTags = clone.tagLinks.map(tl => ({
            tag: { name: tl.tag?.name }
        }));

        const translatedTags = await translateBlogField(
            clone.id, lang, 'tagLinks', strippedTags,
            async (tagLinks) => {
                const results = [];
                for (const tl of tagLinks) {
                    const t = { ...tl };
                    if (t.tag?.name) {
                        t.tag.name = await translateString(t.tag.name, 'tag_name');
                    }
                    results.push(t);
                }
                return results;
            }
        );

        translatedTags.forEach((tTag, i) => {
            if (tTag.tag?.name && clone.tagLinks[i]?.tag) {
                clone.tagLinks[i].tag.name = tTag.tag.name;
            }
        });
    }

    // 4. SEO block
    if (clone.seo) {
        if (clone.seo.metaTitle) {
            clone.seo.metaTitle = await translateBlogField(
                clone.id, lang, 'seo_metaTitle', clone.seo.metaTitle,
                (t) => translateString(t, 'seo_metaTitle')
            );
        }
        if (clone.seo.metaDesc) {
            clone.seo.metaDesc = await translateBlogField(
                clone.id, lang, 'seo_metaDesc', clone.seo.metaDesc,
                (t) => translateString(t, 'seo_metaDesc')
            );
        }
    }

    return clone;
}

/**
 * Translates an array of independent Category objects 
 */
export async function translateCategoryList(categories, lang) {
    if (!categories || lang !== 'de') return categories;

    const results = [];
    for (const cat of categories) {
        const c = { ...cat };
        if (c.name) {
            c.name = await translateBlogField(
                c.id || 'cat_unknown',
                lang,
                'name',
                c.name,
                async (text) => await translateTextToGerman(text, { source: 'blog', locale: lang, entityType: 'category', entityId: c.id, fieldKey: 'name' })
            );
        }
        results.push(c);
    }
    return results;
}
