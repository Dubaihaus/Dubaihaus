// src/lib/reellySync.js
import { prisma } from './prisma';
import { searchAllProjects, getPropertyById } from './reellyApi';// import { normalizeProject } from './ProjectNormalizer'; // not needed here

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function normalizeStringField(value) {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  // If Reelly ever sends objects here, you can expand this later
  return null;
}

function getMinBedrooms(rangeStr) {
  if (!rangeStr) return null;
  const match = rangeStr.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function getMaxBedrooms(rangeStr) {
  if (!rangeStr) return null;
  // matches "1-3BR" -> 3
  const match = rangeStr.match(/-(\d+)BR/);
  if (match) return parseInt(match[1], 10);
  // matches "2BR" -> 2
  const matchSingle = rangeStr.match(/^(\d+)BR/);
  return matchSingle ? parseInt(matchSingle[1], 10) : null;
}

// Helper to map normalized project to Prisma input
function mapProjectToPrisma(p) {
  return {
    id: p.id,
    slug: p.id.toString(),
    title: p.title || p.name,
    description: p.description ? p.description.slice(0, 5000) : null,

    locationString: p.location || null,

    // 🔧 Normalize all these – Reelly sometimes sends numbers (e.g. 89)
    city: normalizeStringField(p.locationObj?.city ?? p.city),
    area: normalizeStringField(p.locationObj?.area ?? p.locationObj?.sector ?? p.area),
    region: normalizeStringField(p.locationObj?.region ?? p.region),
    district: normalizeStringField(p.locationObj?.district ?? p.district),

    latitude: p.lat ?? null,
    longitude: p.lng ?? null,

    developerName: normalizeStringField(p.developerObj?.name ?? p.developer),

    status: p.status || null,
    saleStatus: p.saleStatus || null,
    constructionStatus: p.constructionStatus || null,

    priceFrom: p.minPrice ?? null,
    priceTo: p.maxPrice ?? null,
    currency: p.priceCurrency || 'AED',

    bedroomsMin: getMinBedrooms(p.bedroomsRange),
    bedroomsMax: getMaxBedrooms(p.bedroomsRange),

    areaFrom: p.minSize ?? null,
    areaTo: p.maxSize ?? null,
    areaUnit: p.areaUnit || null,

    completionDate: safeDate(p.completionDate),
    handoverDate: safeDate(p.handoverDate || p.completionDate),

    mainImageUrl: p.coverPhoto || null,

    isFeatured: !!p.isFeatured,

    isComingSoon:
      p.saleStatus === 'presale' ||
      p.saleStatus === 'announced',

    lastSyncedAt: new Date(),
  };
}

// 🔒 Concurrency guard: only one sync runs at a time in this process
let currentSyncPromise = null;

export async function syncProjects() {
  if (currentSyncPromise) {
    console.log('⏳ Reelly sync already running, waiting for existing job...');
    return currentSyncPromise;
  }

  currentSyncPromise = (async () => {
    console.log('🔄 Starting Reelly project sync...');

    // 1. Fetch all projects (iterates pages)
    const result = await searchAllProjects({
      pageSize: 500,
      maxPages: 10,  // safety cap; 5000 projects
      pricedOnly: false, // get everything
    });

    const allProjects = result.results || [];
    if (!allProjects.length) {
      console.log('⚠️ No projects found to sync.');
      return { count: 0 };
    }

    console.log(`📦 Found ${allProjects.length} projects. Upserting to DB...`);

    let count = 0;

   for (const base of allProjects) {
  let p = base;

  // If list endpoint didn’t give relations, fetch detail for this project
  const missingPlans = !Array.isArray(p.paymentPlans) || p.paymentPlans.length === 0;
  const missingTypes = !Array.isArray(p.unitTypes) || p.unitTypes.length === 0;

  if (missingPlans || missingTypes) {
    const detail = await getPropertyById(p.id);
    if (detail) {
      // merge only if detail has data
      p.paymentPlans = (detail.paymentPlans && detail.paymentPlans.length > 0)
        ? detail.paymentPlans
        : (p.paymentPlans || []);

      p.unitTypes = (detail.unitTypes && detail.unitTypes.length > 0)
        ? detail.unitTypes
        : (p.unitTypes || []);

      // keep rawData if your normalizer uses it
      p.rawData = detail.rawData || p.rawData;
    } else {
      p.paymentPlans = p.paymentPlans || [];
      p.unitTypes = p.unitTypes || [];
    }
  } else {
    p.paymentPlans = p.paymentPlans || [];
    p.unitTypes = p.unitTypes || [];
  }
      const data = mapProjectToPrisma(p);

      try {
        await prisma.$transaction(async (tx) => {
          // Upsert project WITHOUT deleting relations
          await tx.reellyProject.upsert({
            where: { id: p.id },
            update: data,
            create: data,
          });

          // 🔹 2) Store payment plans (from DETAIL)
          if (Array.isArray(p.paymentPlans) && p.paymentPlans.length > 0) {
            // Only drop relations if we are successfully inserting new ones
            await tx.reellyProjectPaymentPlan.deleteMany({
              where: { projectId: p.id }
            });

            await tx.reellyProjectPaymentPlan.createMany({
              data: p.paymentPlans.map((plan) => ({
                projectId: p.id,
                name: plan.name || plan.title || 'Payment Plan',
                rawData: plan, // JSON – includes steps, etc.
              })),
              skipDuplicates: true,
            });
          }

          // 🔹 3) Store property types / unit types (from DETAIL)
          if (Array.isArray(p.unitTypes) && p.unitTypes.length > 0) {
            // Only drop relations if we are successfully inserting new ones
            await tx.reellyProjectPropertyType.deleteMany({
              where: { projectId: p.id }
            });

            await tx.reellyProjectPropertyType.createMany({
              data: p.unitTypes.map((u) => {
                const type =
                  u.unitCategory ||
                  u.unitType ||
                  u.unit_category ||
                  u.unit_type ||
                  u.name ||
                  'Unit';

                const priceFrom =
                  Number(u.priceFromAED ?? u.price_from_aed ?? u.price_from) || null;

                const sizeFrom =
                  Number(u.sizeFromM2 ?? u.size_from_m2 ?? u.area_from_m2) || null;

                return {
                  projectId: p.id,
                  type,
                  priceFrom,
                  sizeFrom,
                  rawData: u,
                };
              }),
              skipDuplicates: true,
            });
          }
        });

        count++;
      } catch (err) {
        console.error(`❌ Failed to sync project ${p.id}:`, err);
      }
    }

    console.log(`✅ Sync complete. Updated ${count} projects.`);
    return { count };
  })();

  try {
    return await currentSyncPromise;
  } finally {
    // allow future syncs after this one finishes
    currentSyncPromise = null;
  }
}
