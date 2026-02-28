import OpenAI from 'openai';
import { logAIUsage } from '../ai/usageLogger';

// Graceful fallback if no key
const hasKey = !!process.env.OPENAI_API_KEY;
const openai = hasKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Only one retry to avoid hanging too long
const MAX_RETRIES = 1;

export async function translateTextToGerman(text, context = {}) {
    if (!text) return text;

    const {
        source = "unknown",
        locale = "de",
        entityType,
        entityId,
        routePath,
        fieldKey,
        chunkIndex,
        chunkCount
    } = context;
    const startTime = Date.now();
    if (!hasKey) {
        console.warn("⚠️ OPENAI_API_KEY is missing. Falling back to English for translation.");
        return text; // Graceful fallback
    }

    const prompt = `Translate the following real estate text to German. 
Strict rules:
- Do not translate numbers, currency codes (like AED, USD), measurements (like sq.ft., m2), addresses, or proper nouns (like Dubai, Abu Dhabi, developer names).
- DO NOT translate Markdown headers (any line starting with # like "### Amenities", "##### Project general facts"). Keep the headers exactly in English so regex extractors still work.
- Preserve any markdown structure exactly as it is (including headers like ###, bold **, lists *, etc.).
- Return ONLY the translated text, no commentary, no starting phrases.

Text to translate:
${text}`;

    let attempts = 0;
    while (attempts <= MAX_RETRIES) {
        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1, // low temp for translation reliability
            });

            const durationMs = Date.now() - startTime;
            const usage = completion.usage;

            // Passive logging
            logAIUsage({
                model: 'gpt-4o-mini',
                source,
                locale,
                entityType,
                entityId,
                routePath,
                fieldKey,
                chunkIndex,
                chunkCount,
                inputTokens: usage?.prompt_tokens,
                outputTokens: usage?.completion_tokens,
                totalTokens: usage?.total_tokens,
                durationMs,
                status: 'success',
                requestId: completion.id,
            }).catch(() => { });

            return completion.choices[0]?.message?.content?.trim() || text;
        } catch (error) {
            attempts++;
            const durationMs = Date.now() - startTime;

            // Log failure
            logAIUsage({
                model: 'gpt-4o-mini',
                source,
                locale,
                entityType,
                entityId,
                routePath,
                fieldKey,
                chunkIndex,
                chunkCount,
                durationMs,
                status: 'failed',
                errorCode: error.code || error.name,
                errorMessage: error.message,
            }).catch(() => { });

            console.error(`OpenAI translation attempt ${attempts} failed:`, error.message);
            if (attempts > MAX_RETRIES) {
                console.warn("⚠️ OpenAI translation failed after retries. Falling back to English.");
                return text;
            }
        }
    }

    return text;
}
