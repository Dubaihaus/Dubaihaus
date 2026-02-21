#!/bin/bash

URLS=(
    "http://localhost:3002/en"
    "http://localhost:3002/de"
    "http://localhost:3002/en/off-plan"
    "http://localhost:3002/de/off-plan"
    "http://localhost:3002/en/off-plan?sale_status=presale"
    "http://localhost:3002/de/off-plan?sale_status=presale"
    "http://localhost:3002/en/off-plan?sale_status=start_of_sales"
    "http://localhost:3002/de/off-plan?sale_status=start_of_sales"
    "http://localhost:3002/en/off-plan?propertyTypes=apartments&minPrice=100000"
    "http://localhost:3002/en/ui/project_details/8"
    "http://localhost:3002/de/ui/project_details/8"
    "http://localhost:3002/en/blog"
    "http://localhost:3002/de/blog"
    "http://localhost:3002/en/blog/hilton-residences-abu-dhabi-al-raha"
    "http://localhost:3002/de/blog/hilton-residences-abu-dhabi-al-raha"
    "http://localhost:3002/en/contact"
    "http://localhost:3002/de/contact"
    "http://localhost:3002/en/faq"
    "http://localhost:3002/de/faq"
)

OUT_DIR="/tmp/seo_audit"
mkdir -p "$OUT_DIR"

echo "URL,Status,SEO_JSON" > "$OUT_DIR/results.csv"

for url in "${URLS[@]}"; do
    echo "Crawling $url..."
    filename=$(echo "$url" | sed 's/[^a-zA-Z0-9]/_/g')
    
    # Fetch with status code
    status=$(curl -s -L -o "$OUT_DIR/$filename.html" -w "%{http_code}" "$url")
    
    # Extract SEO
    seo_json=$(node scripts/extract_seo.js "$OUT_DIR/$filename.html" | tr -d '\n')
    
    echo "\"$url\",$status,'$seo_json'" >> "$OUT_DIR/results.csv"
done

echo "Crawl complete. Results in $OUT_DIR/results.csv"
