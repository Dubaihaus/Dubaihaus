// next.config.mjs
/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  reactStrictMode: true,
   async redirects() {
    return [
      {
        source: '/about',
        destination: '/en/contact',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/en/contact',
        permanent: true,
      },
      {
        source: '/buy-a-home',
        destination: '/en/off-plan',
        permanent: true,
      },
      {
        source: '/rent-a-home',
        destination: '/en/off-plan',
        permanent: true,
      },
    ];
  },  

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.reelly.io', pathname: '/**' },
      { protocol: 'https', hostname: 'reelly-public.s3.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'reelly-backend.s3.amazonaws.com', pathname: '/**' }, // ← add this
       { protocol: 'https', hostname: 'res.cloudinary.com' },
    { protocol: 'https', hostname: 'images.imgix.net' },
      //for localhost testing
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/**' },

      // or, if you have multiple buckets:
      // { protocol: 'https', hostname: '**.s3.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'search-listings-production.up.railway.app', pathname: '/**' },
    ],
  },
};

export default withNextIntl(nextConfig);
