/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  reactStrictMode: true,
  images: {
    // do NOT use `domains` anymore
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.reelly.io',          // <- where your vault images come from
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'reelly-public.s3.amazonaws.com', // any S3 images you show
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'search-listings-production.up.railway.app', // if any images come from here
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
