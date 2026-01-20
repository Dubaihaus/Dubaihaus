
export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/'], // optional: hide admin/api routes
        },
        sitemap: 'https://dubaihaus.com/sitemap.xml',
    }
}
