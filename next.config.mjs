// next.config.mjs
/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      /**
       * ✅ (Optional but recommended) Force apex -> www
       * Best handled at DNS/CDN/hosting (Vercel/Cloudflare), but this can help too.
       * NOTE: This works only if your platform forwards host header and honors Next redirects with `has`.
       */
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'dubaihaus.com' }],
        destination: 'https://www.dubaihaus.com/:path*',
        permanent: true,
      },

      /**
       * ✅ Existing redirects (keep as-is)
       */
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

      /**
       * ✅ SEO/Noise reduction: common WordPress probe URLs
       * We redirect them to / (or you can redirect to /en).
       *
       * NOTE: A cleaner approach is returning 404/410 for these paths via middleware or route handlers.
       * But redirecting away will reduce repeated probing and GSC clutter.
       */
      {
        source: '/wp-login.php',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-admin/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/xmlrpc.php',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wordpress/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp/:path*',
        destination: '/',
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      // cloudinary
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/dy3w8iw3h/**' },

      // brave search images
      { protocol: 'https', hostname: 'imgs.search.brave.com' },

      // reelly
      { protocol: 'https', hostname: 'api.reelly.io', pathname: '/**' },
      { protocol: 'https', hostname: 'reelly-public.s3.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'reelly-backend.s3.amazonaws.com', pathname: '/**' },

      // general cloudinary
      { protocol: 'https', hostname: 'res.cloudinary.com' },

      // imgix
      { protocol: 'https', hostname: 'images.imgix.net' },

      // localhost testing
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/**' },

      // railway image/search listings
      { protocol: 'https', hostname: 'search-listings-production.up.railway.app', pathname: '/**' },
    ],
  },
};

export default withNextIntl(nextConfig);