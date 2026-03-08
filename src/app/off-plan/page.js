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
  const isTypeApartment = pTypes === 'apartments';
  const isTypePenthouse = pTypes === 'penthouses';
  const isTypeTownhouse = pTypes === 'townhouses';

  // Whitelisted districts (Targeting specific SEO requirements)
  const whitelistedDistricts = ['palm-jebel-ali', 'palm-jumeirah', 'dubai-hills-estate'];
  const isTargetDistrict = districts && whitelistedDistricts.includes(districts);

  // Whitelist: base (/off-plan), Coming Soon, On Sale, and specific types/districts
  const isWhitelist = !minPrice && (
    (!pTypes && !districts && (!saleStatus || saleStatus === 'presale' || saleStatus === 'start_of_sales')) ||
    isTypeApartment || isTypePenthouse || isTypeTownhouse || isTargetDistrict
  );

  const t = await getTranslations({ namespace: 'seo.offPlan' });
  const dt = await getTranslations({ namespace: 'seo.districts' });

  let title = t('title');
  let description = t('description');
  let keywords = t('keywords');

  if (saleStatus === 'presale') {
    title = t('comingSoon');
    keywords = t('comingSoonKeywords');
  } else if (saleStatus === 'start_of_sales') {
    title = t('onSale');
    keywords = t('onSaleKeywords');
  } else if (isTypeApartment) {
    title = t('apartments');
    description = t('apartmentsDesc');
    keywords = t('apartmentsKeywords');
  } else if (isTypePenthouse) {
    title = t('penthouses');
    description = t('penthousesDesc');
    keywords = t('penthousesKeywords');
  } else if (isTypeTownhouse) {
    title = t('townhouses');
    description = t('townhousesDesc');
    keywords = t('townhousesKeywords');
  } else if (isTargetDistrict) {
    title = dt(`${districts}.title`);
    description = dt(`${districts}.description`);
    keywords = dt(`${districts}.keywords`);
  }

  // Build canonical query string
  let queryParts = [];
  if (saleStatus) queryParts.push(`sale_status=${saleStatus}`);
  if (pTypes) queryParts.push(`propertyTypes=${pTypes}`);
  if (districts) queryParts.push(`districts=${districts}`);
  const queryString = isWhitelist ? queryParts.join('&') : '';

  return generateStandardMetadata({
    pathname: 'off-plan',
    queryString,
    title,
    description,
    keywords,
    index: isWhitelist,
    follow: true,
  });
}

export default async function OffPlanPageServer() {
  // Full page → no `limit`, filters panel visible
  return <OffPlanClient />;
}
