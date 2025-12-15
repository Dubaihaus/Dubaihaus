"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
}

export async function createProperty(formData) {
    await checkAdmin();

    // Basic Fields
    const title = formData.get("title");
    const description = formData.get("description");
    const location = formData.get("location");
    const price = parseFloat(formData.get("price"));
    const area = parseFloat(formData.get("area"));
    const bedrooms = parseInt(formData.get("bedrooms"));
    const bathrooms = parseInt(formData.get("bathrooms"));
    const status = formData.get("status");
    const featured = formData.get("featured") === "on";
    const mainImageUrl = formData.get("imageUrl");
    const oldAmenitiesStr = formData.get("amenities");

    // JSON Fields (New)
    const rawDetails = formData.get("details");
    const rawGallery = formData.get("gallery"); // Array of { url, category, position }
    const rawTypes = formData.get("types"); // Array of { name, ... }
    const rawPaymentPlan = formData.get("paymentPlan"); // Object { title, subtitle, steps: [] }
    const rawFeatures = formData.get("features"); // Array of { text, position }

    const details = rawDetails ? JSON.parse(rawDetails) : null;
    const gallery = rawGallery ? JSON.parse(rawGallery) : [];
    const types = rawTypes ? JSON.parse(rawTypes) : [];
    const paymentPlan = rawPaymentPlan ? JSON.parse(rawPaymentPlan) : null;
    const features = rawFeatures ? JSON.parse(rawFeatures) : [];

    // Create Property
    await prisma.property.create({
        data: {
            title,
            description,
            location,
            price,
            area,
            bedrooms,
            bathrooms,
            status,
            featured,

            // Old Relations (Backward Compat)
            images: mainImageUrl ? {
                create: { url: mainImageUrl }
            } : undefined,
            amenities: oldAmenitiesStr ? {
                create: oldAmenitiesStr.split(",").map(a => ({ name: a.trim() })).filter(a => a.name)
            } : undefined,

            // New Relations
            details: details ? {
                create: {
                    developerName: details.developerName,
                    constructionStatus: details.constructionStatus,
                    saleStatus: details.saleStatus,
                    furnishing: details.furnishing,
                    overviewTitle: details.overviewTitle,
                    overviewText: details.overviewText,
                    locationDescription: details.locationDescription,
                    locationBenefits: details.locationBenefits, // JSON
                    signatureTitle: details.signatureTitle,
                    signatureSubtitle: details.signatureSubtitle
                }
            } : undefined,

            gallery: {
                create: gallery.map(img => ({
                    url: img.url,
                    category: img.category || "EXTERIOR",
                    position: img.position || 0
                }))
            },

            types: {
                create: types.map(t => ({
                    name: t.name,
                    sizeFrom: t.sizeFrom,
                    sizeTo: t.sizeTo,
                    priceFrom: t.priceFrom,
                    position: t.position || 0
                }))
            },

            features: {
                create: features.map(f => ({
                    text: f.text,
                    position: f.position || 0
                }))
            },

            // Nested Payment Plan
            paymentPlans: paymentPlan ? {
                create: {
                    title: paymentPlan.title,
                    subtitle: paymentPlan.subtitle,
                    steps: {
                        create: paymentPlan.steps.map(s => ({
                            percent: s.percent,
                            label: s.label,
                            position: s.position || 0
                        }))
                    }
                }
            } : undefined
        }
    });

    revalidatePath("/admin/properties");
    revalidatePath("/featured-properties");
    redirect("/admin/properties");
}

export async function updateProperty(id, formData) {
  await checkAdmin();

  const title = formData.get("title") || "";
  const description = formData.get("description") || "";
  const location = formData.get("location") || "";
  const status = formData.get("status") || "DRAFT";
  const featured = formData.get("featured") === "on";
  const mainImageUrl = formData.get("imageUrl") || "";
  const oldAmenitiesStr = formData.get("amenities"); // could be "" or null

  const price = Number(formData.get("price") || 0);
  const area = Number(formData.get("area") || 0);
  const bedrooms = Number(formData.get("bedrooms") || 0);
  const bathrooms = Number(formData.get("bathrooms") || 0);

  const details = JSON.parse(formData.get("details") || "null");
  const gallery = JSON.parse(formData.get("gallery") || "[]");
  const types = JSON.parse(formData.get("types") || "[]");
  const paymentPlan = JSON.parse(formData.get("paymentPlan") || "null");
  const features = JSON.parse(formData.get("features") || "[]");

  const ops = [];

  // 1) base property
  ops.push(
    prisma.property.update({
      where: { id },
      data: { title, description, location, price, area, bedrooms, bathrooms, status, featured },
    })
  );

  // 2) main image (replace)
  if (mainImageUrl) {
    ops.push(prisma.propertyImage.deleteMany({ where: { propertyId: id } }));
    ops.push(prisma.propertyImage.create({ data: { propertyId: id, url: mainImageUrl } }));
  }

  // 3) amenities (replace) — allow clearing
  if (oldAmenitiesStr !== null) {
    ops.push(prisma.propertyAmenity.deleteMany({ where: { propertyId: id } }));
    const ams = (oldAmenitiesStr || "")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    if (ams.length) {
      ops.push(
        prisma.propertyAmenity.createMany({
          data: ams.map((name) => ({ propertyId: id, name })),
        })
      );
    }
  }

  // 4) details (upsert) — allow partial edit
  if (details) {
    const data = {
      developerName: details.developerName,
      constructionStatus: details.constructionStatus,
      saleStatus: details.saleStatus,
      furnishing: details.furnishing,
      overviewTitle: details.overviewTitle,
      overviewText: details.overviewText,
      locationDescription: details.locationDescription,
      locationBenefits: details.locationBenefits,
      signatureTitle: details.signatureTitle,
      signatureSubtitle: details.signatureSubtitle,
    };

    ops.push(
      prisma.propertyDetails.upsert({
        where: { propertyId: id },
        create: { propertyId: id, ...data },
        update: data,
      })
    );
  }

  // 5) gallery/types/features — IMPORTANT: delete always so user can clear to empty
  ops.push(prisma.propertyGalleryImage.deleteMany({ where: { propertyId: id } }));
  if (gallery.length) {
    ops.push(
      prisma.propertyGalleryImage.createMany({
        data: gallery.map((img) => ({
          propertyId: id,
          url: img.url,
          category: img.category || "EXTERIOR",
          position: img.position || 0,
        })),
      })
    );
  }

  ops.push(prisma.propertyType.deleteMany({ where: { propertyId: id } }));
  if (types.length) {
    ops.push(
      prisma.propertyType.createMany({
        data: types.map((t) => ({
          propertyId: id,
          name: t.name,
          sizeFrom: t.sizeFrom,
          sizeTo: t.sizeTo,
          priceFrom: t.priceFrom,
          position: t.position || 0,
        })),
      })
    );
  }

  ops.push(prisma.propertyFeature.deleteMany({ where: { propertyId: id } }));
  if (features.length) {
    ops.push(
      prisma.propertyFeature.createMany({
        data: features.map((f) => ({
          propertyId: id,
          text: f.text,
          position: f.position || 0,
        })),
      })
    );
  }

  // 6) payment plan — replace safely
  ops.push(prisma.propertyPaymentPlanStep.deleteMany({ where: { plan: { propertyId: id } } }));
  ops.push(prisma.propertyPaymentPlan.deleteMany({ where: { propertyId: id } }));

  if (paymentPlan) {
    ops.push(
      prisma.propertyPaymentPlan.create({
        data: {
          propertyId: id,
          title: paymentPlan.title,
          subtitle: paymentPlan.subtitle,
          steps: {
            create: (paymentPlan.steps || []).map((s) => ({
              percent: s.percent,
              label: s.label,
              position: s.position || 0,
            })),
          },
        },
      })
    );
  }

  await prisma.$transaction(ops);

  revalidatePath("/admin/properties");
  revalidatePath("/featured-properties");
  redirect("/admin/properties");
}

export async function deleteProperty(id) {
  await checkAdmin();

  await prisma.$transaction(async (tx) => {
    // payment plan children first
   await tx.propertyPaymentPlanStep.deleteMany({
  where: { plan: { propertyId: id } }, // ✅ plan (not paymentPlan)
});
await tx.propertyPaymentPlan.deleteMany({ where: { propertyId: id } });

    // other children
    await tx.propertyGalleryImage.deleteMany({ where: { propertyId: id } });
    await tx.propertyType.deleteMany({ where: { propertyId: id } });
    await tx.propertyFeature.deleteMany({ where: { propertyId: id } });
    await tx.propertyAmenity.deleteMany({ where: { propertyId: id } });
    await tx.propertyImage.deleteMany({ where: { propertyId: id } });

    // details (1-1 usually)
    await tx.propertyDetails.deleteMany({ where: { propertyId: id } });

    // finally delete the property
    await tx.property.delete({ where: { id } });
  });

  revalidatePath("/admin/properties");
  revalidatePath("/featured-properties");
}
