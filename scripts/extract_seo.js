const fs = require('fs');
const path = require('path');

function extractSEO(html) {
    const data = {};

    // Status (not in HTML, but captured by curl -i)

    // Title
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    data.title = titleMatch ? titleMatch[1].trim() : 'MISSING';

    // Description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    data.description = descMatch ? descMatch[1] : 'MISSING';

    // Canonical
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
    data.canonical = canonicalMatch ? canonicalMatch[1] : 'MISSING';

    // Hreflang
    const hreflangs = [];
    const hreflangRegex = /<link\s+rel=["']alternate["']\s+hreflang=["']([^"']*)["']\s+href=["']([^"']*)["']/gi;
    let match;
    while ((match = hreflangRegex.exec(html)) !== null) {
        hreflangs.push(`${match[1]}:${match[2]}`);
    }
    data.hreflang = hreflangs.join(', ') || 'MISSING';

    // Robots
    const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
    data.robots = robotsMatch ? robotsMatch[1] : 'MISSING';

    // OG Tags
    const og = {};
    ['title', 'description', 'image', 'url'].forEach(tag => {
        const regex = new RegExp(`<meta\\s+property=["']og:${tag}["']\\s+content=["']([^"']*)["']`, 'i');
        const m = html.match(regex);
        og[tag] = m ? m[1] : 'MISSING';
    });
    data.og = og;

    // Twitter Tags
    const twitter = {};
    ['card', 'title', 'description', 'image'].forEach(tag => {
        const regex = new RegExp(`<meta\\s+name=["']twitter:${tag}["']\\s+content=["']([^"']*)["']`, 'i');
        const m = html.match(regex);
        twitter[tag] = m ? m[1] : 'MISSING';
    });
    data.twitter = twitter;

    // Structured Data Types
    const ldJsonRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const ldTypes = [];
    while ((match = ldJsonRegex.exec(html)) !== null) {
        try {
            const json = JSON.parse(match[1]);
            const extractTypes = (obj) => {
                if (obj['@type']) ldTypes.push(obj['@type']);
                if (obj['@graph']) obj['@graph'].forEach(extractTypes);
            };
            extractTypes(json);
        } catch (e) { }
    }
    data.jsonLd = Array.from(new Set(ldTypes)).join(', ') || 'MISSING';

    return data;
}

const htmlFile = process.argv[2];
if (htmlFile && fs.existsSync(htmlFile)) {
    const html = fs.readFileSync(htmlFile, 'utf8');
    console.log(JSON.stringify(extractSEO(html), null, 2));
}
