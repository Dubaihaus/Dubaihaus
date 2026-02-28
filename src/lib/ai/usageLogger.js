import { prisma } from '../prisma';

/**
 * Logs AI usage metrics to the database.
 * This is designed to be a passive, non-blocking logger.
 * 
 * @param {Object} data - Usage metadata
 * @param {string} data.provider - AI provider (default: "openai")
 * @param {string} data.model - Model name (e.g. "gpt-4o-mini")
 * @param {string} data.source - Feature or route name
 * @param {string} data.locale - Target locale
 * @param {number} data.inputTokens - Input tokens used
 * @param {number} data.outputTokens - Output tokens used
 * @param {number} data.totalTokens - Total tokens used
 * @param {number} data.durationMs - Time taken for the request
 * @param {string} data.status - "success" or "failed"
 * @param {string} [data.errorCode] - Error code if failed
 * @param {string} [data.errorMessage] - Error message if failed
 * @param {string} [data.requestId] - Provider request ID
 * @param {Object} [data.metadata] - Arbitrary small metadata (no raw text)
 */
export async function logAIUsage(data) {
    try {
        // Validation/Truncation
        const errorMessage = data.errorMessage
            ? data.errorMessage.substring(0, 1000)
            : null;

        await prisma.aIUsageLog.create({
            data: {
                provider: data.provider || "openai",
                model: data.model,
                purpose: "translation",
                source: data.source || "unknown",
                locale: data.locale,
                inputTokens: data.inputTokens,
                outputTokens: data.outputTokens,
                totalTokens: data.totalTokens,
                durationMs: data.durationMs,
                status: data.status,
                errorCode: data.errorCode,
                errorMessage,
                requestId: data.requestId,
                metadata: data.metadata || {},
                // NEW: Entity Tracking
                entityType: data.entityType,
                entityId: data.entityId ? String(data.entityId) : null,
                routePath: data.routePath,
                fieldKey: data.fieldKey,
                chunkIndex: data.chunkIndex,
                chunkCount: data.chunkCount,
            }
        });
    } catch (err) {
        // Passive logging: warn but do not throw
        console.warn("⚠️ Failed to log AI usage:", err.message);
    }
}
