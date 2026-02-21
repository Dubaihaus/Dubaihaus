// src/app/off-plan/page.jsx  (SERVER)
import { getTranslations } from "next-intl/server";
import { generateStandardMetadata } from "@/lib/seo";
import OffPlanClient from "../../components/OffPlanClient";

export async function generateMetadata({ searchParams }) {
  // Wait for searchParams if using Next 15+ (as noted in search page comments)
  const resolvedParams = await searchParams;
  const pTypes = resolvedParams?.propertyTypes;
  const saleStatus = resolvedParams?.sale_status;
  const minPrice = resolvedParams?.minPrice;
  const districts = resolvedParams?.districts;

  // Determine if this exact URL configuration is indexable
  // Whitelist: base (/off-plan), Coming Soon (?sale_status=presale), On Sale (?sale_status=start_of_sales)
  const isWhitelist = !pTypes && !minPrice && !districts && (!saleStatus || saleStatus === 'presale' || saleStatus === 'start_of_sales');

  const t = await getTranslations({ namespace: 'seo.offPlan' });

  let title = t('title');
  let description = t('description');

  if (saleStatus === 'presale') {
    title = t('comingSoon');
  } else if (saleStatus === 'start_of_sales') {
    title = t('onSale');
  }

  const queryString = isWhitelist && saleStatus ? `sale_status=${saleStatus}` : '';

  return generateStandardMetadata({
    pathname: 'off-plan', // base route
    queryString,
    title,
    description,
    index: isWhitelist,
    follow: true,
  });
}

export default async function OffPlanPageServer() {
  // Full page → no `limit`, filters panel visible
  return <OffPlanClient />;
}
