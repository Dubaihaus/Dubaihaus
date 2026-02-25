import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { translateTextToGerman } from './openaiClient';

// Dictionary mapping for static/short strings to save tokens & ensure consistency
const GERMAN_DICTIONARY = {
    'Apartment': 'Wohnung',
    'Apartments': 'Wohnungen',
    'Villa': 'Villa',
    'Villas': 'Villen',
    'Townhouse': 'Reihenhaus',
    'Townhouses': 'Reihenhäuser',
    'Penthouse': 'Penthaus',
    'Penthouses': 'Penthäuser',
    'Studio': 'Studio',
    'Studios': 'Studios',
    'Duplex': 'Maisonette',
    'Loft': 'Loft',
    'Lofts': 'Lofts',
    'Mansion': 'Herrenhaus',
    'Mansions': 'Herrenhäuser',
    'Residential Complex': 'Wohnkomplex',
    'Apartment Building': 'Mehrfamilienhaus',
    'Payment Plan': 'Zahlungsplan',
    'On Booking': 'Bei Buchung',
    'Handover': 'Übergabe',
    'On Handover': 'Bei Übergabe',
    'Coming Soon': 'Demnächst',
    'On Sale': 'Im Verkauf',
    'Under Construction': 'Im Bau',
    'Completed': 'Abgeschlossen',
};

function getDictionaryTranslation(text) {
    if (!text || typeof text !== 'string') return text;
    return GERMAN_DICTIONARY[text.trim()] || null;
}

export function hashSource(sourceText) {
    return crypto.createHash('sha256').update(String(sourceText)).digest('hex');
}

/**
 * High-level field translator that handles DB caching.
 * @param {number} projectId 
 * @param {string} lang 
 * @param {string} fieldKey 
 * @param {any} sourceData - Can be string, array, or object
 * @param {Function} translatorFn - Async function to translate the sourceData
 */
export async function translateField(projectId, lang, fieldKey, sourceData, translatorFn) {
    if (sourceData == null || sourceData === '') return sourceData;
    // If globally disabled or no key, bypass entire translation layer
    if (!process.env.OPENAI_API_KEY && process.env.TRANSLATION_ENABLED !== 'true') {
        return sourceData;
    }

    // Hash the JSON representation of the data to capture any changes
    const sourceStr = typeof sourceData === 'string' ? sourceData : JSON.stringify(sourceData);
    const hash = hashSource(sourceStr);

    try {
        const existing = await prisma.projectTranslation.findUnique({
            where: {
                projectId_lang_fieldKey: {
                    projectId: Number(projectId),
                    lang,
                    fieldKey,
                },
            },
        });

        if (existing && existing.originalHash === hash) {
            // Safe to return the cached Json because it matches the shape we stored
            return existing.translated;
        }

        // Hash mismatch or missing -> re-translate
        const translatedData = await translatorFn(sourceData);

        // Save back to DB securely
        await prisma.projectTranslation.upsert({
            where: {
                projectId_lang_fieldKey: {
                    projectId: Number(projectId),
                    lang,
                    fieldKey,
                },
            },
            update: {
                originalHash: hash,
                translated: translatedData,
            },
            create: {
                projectId: Number(projectId),
                lang,
                fieldKey,
                originalHash: hash,
                translated: translatedData,
                provider: 'openai',
            },
        });

        return translatedData;
    } catch (err) {
        console.error(`Error in translateField [${projectId}/${fieldKey}]:`, err.message);
        // In case of DB or translation errors, fallback gracefully to original text
        return sourceData;
    }
}

/**
 * Translates a single string property using Dictionary then OpenAI.
 */
async function translateStringField(text) {
    if (!text || typeof text !== 'string') return text;
    const directDict = getDictionaryTranslation(text);
    if (directDict) return directDict;
    return await translateTextToGerman(text);
}

/**
 * The main service entrypoint for a project detail page.
 * Deep-clones the Reelly project object and mutates textual fields to `lang` (e.g. 'de').
 */
export async function translateProjectDetail(project, lang) {
    if (!project || lang !== 'de') return project;

    // Clone to avoid mutating original memory object
    const clone = JSON.parse(JSON.stringify(project));

    // --- 1. Top-Level Text Fields ---
    if (clone.description) {
        clone.description = await translateField(
            clone.id, lang, 'description', clone.description, translateStringField
        );
    }
    if (clone.depositDescription) {
        clone.depositDescription = await translateField(
            clone.id, lang, 'depositDescription', clone.depositDescription, translateStringField
        );
    }
    if (clone.propertyType) {
        clone.propertyType = await translateField(
            clone.id, lang, 'propertyType', clone.propertyType, translateStringField
        );
    }

    // --- 2. Arrays of Strings ---
    if (clone.propertyTypes && clone.propertyTypes.length) {
        clone.propertyTypes = await translateField(
            clone.id, lang, 'propertyTypes', clone.propertyTypes,
            async (types) => Promise.all(types.map(t => translateStringField(t)))
        );
    }

    // --- 3. Structured Arrays ---

    // Amenities Array: { name: 'Pool', icon: '...' }
    if (clone.amenities && clone.amenities.length) {
        clone.amenities = await translateField(
            clone.id, lang, 'amenities', clone.amenities,
            async (amArr) => {
                const translatedArr = [];
                for (const am of amArr) {
                    if (!am.name) {
                        translatedArr.push(am);
                        continue;
                    }
                    const tName = await translateStringField(am.name);
                    translatedArr.push({ ...am, name: tName });
                }
                return translatedArr;
            }
        );
    }

    // Payment Plans Array: { name: 'Plan 1', steps: [ { name: 'On Booking', percentage: 20 } ] }
    if (clone.paymentPlans && clone.paymentPlans.length) {
        clone.paymentPlans = await translateField(
            clone.id, lang, 'paymentPlans', clone.paymentPlans,
            async (planArr) => {
                const translatedPlans = [];
                for (const plan of planArr) {
                    const tPlan = { ...plan };
                    if (tPlan.name) {
                        tPlan.name = await translateStringField(tPlan.name);
                    }
                    if (tPlan.steps && tPlan.steps.length) {
                        const tSteps = [];
                        for (const step of tPlan.steps) {
                            if (step.name) {
                                const stepNameT = await translateStringField(step.name);
                                tSteps.push({ ...step, name: stepNameT });
                            } else {
                                tSteps.push(step);
                            }
                        }
                        tPlan.steps = tSteps;
                    }
                    translatedPlans.push(tPlan);
                }
                return translatedPlans;
            }
        );
    }

    // Unit Types Array: { unitCategory: 'Apartment', unitType: '2 Bedroom', ... }
    if (clone.unitTypes && clone.unitTypes.length) {
        clone.unitTypes = await translateField(
            clone.id, lang, 'unitTypes', clone.unitTypes,
            async (unitTypesArr) => {
                const tArr = [];
                for (const ut of unitTypesArr) {
                    const tUt = { ...ut };
                    if (tUt.unitCategory) tUt.unitCategory = await translateStringField(tUt.unitCategory);
                    if (tUt.unitType) tUt.unitType = await translateStringField(tUt.unitType);
                    tArr.push(tUt);
                }
                return tArr;
            }
        );
    }

    // --- 4. RawData Fallbacks ---
    // The UI occasionally falls back to `rawData.description` or `rawData.overview` directly.
    if (clone.rawData) {
        const fieldsToTranslate = ['description', 'overview', 'about'];
        for (const f of fieldsToTranslate) {
            if (clone.rawData[f]) {
                clone.rawData[f] = await translateField(
                    clone.id, lang, `rawData_${f}`, clone.rawData[f], translateStringField
                );
            }
        }
    }

    return clone;
}
