/**
 * A safe wrapper for database operations to prevent application crashes
 * when Prisma or the database is unavailable.
 *
 * @param {Function} operation - The async database operation to perform.
 * @param {any} fallback - The value to return if the operation fails.
 * @param {string} context - A description of the operation for logging.
 * @returns {Promise<any>} The result of the operation or the fallback value.
 */
export async function dbSafe(operation, fallback, context = "Database Operation") {
    try {
        return await operation();
    } catch (error) {
        console.error(`[dbSafe] Error in ${context}:`, error.message || error);

        // Log more details in non-production
        if (process.env.NODE_ENV !== 'production') {
            console.error(error);
        }

        return fallback;
    }
}
