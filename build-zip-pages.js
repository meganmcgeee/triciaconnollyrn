const fs = require('fs');
const path = require('path');

// Paths
const locationsPath = path.join(__dirname, 'locations.json');
const templatePath = path.join(__dirname, 'local-seo-template.html');
const sitemapPath = path.join(__dirname, 'sitemap.xml');
const navPath = path.join(__dirname, 'nav.html');

// Load files
if (!fs.existsSync(locationsPath)) {
  console.error('Error: locations.json not found!');
  process.exit(1);
}
if (!fs.existsSync(templatePath)) {
  console.error('Error: local-seo-template.html not found!');
  process.exit(1);
}
if (!fs.existsSync(navPath)) {
  console.error('Error: nav.html not found!');
  process.exit(1);
}

const navHTML = fs.readFileSync(navPath, 'utf8').trim();

// Update navigation menu in-place in all source files
const filesWithNav = [
  'index.html',
  'post-op.html',
  'concierge.html',
  'iv-therapy.html',
  'partners.html',
  'locations-template.html',
  'local-seo-template.html'
];

filesWithNav.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const startTag = '<!-- SITE_NAV_START -->';
    const endTag = '<!-- SITE_NAV_END -->';
    const startIndex = content.indexOf(startTag);
    const endIndex = content.indexOf(endTag);
    
    if (startIndex !== -1 && endIndex !== -1) {
      const before = content.substring(0, startIndex + startTag.length);
      const after = content.substring(endIndex);
      content = before + '\n' + navHTML + '\n        ' + after;
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated navigation menu in: ${file}`);
    } else {
      console.warn(`Warning: Could not find navigation placeholder tags in ${file}`);
    }
  }
});

const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
const template = fs.readFileSync(templatePath, 'utf8');

console.log(`Loaded ${locations.length} target locations.`);

// Group locations by neighborhood for structured footer linking
const groupedLocations = {};
locations.forEach(loc => {
  const nh = loc.neighborhood;
  if (!groupedLocations[nh]) {
    groupedLocations[nh] = [];
  }
  groupedLocations[nh].push(loc);
});

const sortedNeighborhoods = Object.keys(groupedLocations).sort();
let footerGeoHTML = '';
sortedNeighborhoods.forEach(nh => {
  const locs = groupedLocations[nh];
  locs.sort((a, b) => a.enclave.localeCompare(b.enclave));
  
  footerGeoHTML += `\n            <div class="geo-group">`;
  footerGeoHTML += `\n                <h4 class="geo-group-title">${nh}</h4>`;
  footerGeoHTML += `\n                <ul class="geo-group-links">`;
  locs.forEach(loc => {
    footerGeoHTML += `\n                    <li><a href="/${loc.slug}">${loc.enclave}</a></li>`;
  });
  footerGeoHTML += `\n                </ul>`;
  footerGeoHTML += `\n            </div>`;
});

const currentYear = new Date().getFullYear();
const siteFooterHTML = `
        <footer class="site-footer">
            <div class="footer-divider"></div>
            <div class="footer-content">
                <p class="footer-tagline">Tricia Connolly, RN &bull; Bespoke Concierge Nursing &amp; Private Duty Care</p>
                
                <div class="footer-contact-info">
                    <span class="footer-loc">Beverly Hills, LA &amp; Orange County</span>
                    <span class="footer-separator" aria-hidden="true">|</span>
                    <a href="/locations" aria-label="View Service Locations">Locations Served</a>
                    <span class="footer-separator" aria-hidden="true">|</span>
                    <a href="/partners" aria-label="B2B Partners and Referrals">Partners &amp; Referrals</a>
                    <span class="footer-separator" aria-hidden="true">|</span>
                    <a href="mailto:book@triciaconnollyrn.com" aria-label="Email Tricia Connolly at book@triciaconnollyrn.com">book@triciaconnollyrn.com</a>
                    <span class="footer-separator" aria-hidden="true">|</span>
                    <a href="tel:3108894846" aria-label="Call Tricia Connolly at 310-889-4846">(310) 889-4846</a>
                </div>

                <!-- Collapsible Geo-Targeted Service Areas -->
                <div class="footer-geo-section">
                    <details class="geo-details">
                        <summary class="geo-summary">
                            <span>Exclusive Los Angeles Service Areas</span>
                            <svg class="geo-chevron" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                            </svg>
                        </summary>
                        <div class="geo-content">
                            <p class="geo-intro">Providing professional private duty nursing, high-acuity postoperative recovery monitoring, and concierge wellness coordination directly in private residences and estates across these exclusive Southern California communities. View our full <a href="/locations" style="color:var(--champagne); text-decoration:underline;">Locations Index</a> or explore the individual enclaves below:</p>
                            <div class="geo-groups-grid">${footerGeoHTML}
                            </div>
                        </div>
                    </details>
                </div>

                <p class="footer-compliance">Professional nursing services are provided in strict accordance with the California Board of Registered Nursing. All care is delivered under the direction of the client's attending physician. Discretion and NDA-protected privacy are guaranteed.</p>
                
                <p class="footer-copyright">&copy; ${currentYear} Tricia Connolly, RN. All rights reserved.</p>
            </div>
        </footer>`;

// Update static files with the new footer in-place
const staticFiles = ['index.html', 'post-op.html', 'concierge.html', 'iv-therapy.html', 'partners.html'];
staticFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const startTag = '<!-- SITE_FOOTER_START -->';
    const endTag = '<!-- SITE_FOOTER_END -->';
    const startIndex = content.indexOf(startTag);
    const endIndex = content.indexOf(endTag);
    
    if (startIndex !== -1 && endIndex !== -1) {
      const before = content.substring(0, startIndex + startTag.length);
      const after = content.substring(endIndex);
      content = before + '\n' + siteFooterHTML + '\n        ' + after;
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated footer in: ${file}`);
    } else {
      console.warn(`Warning: Could not find footer placeholder tags in ${file}`);
    }
  }
});

const introTemplates = [
  "For high-profile individuals, executives, and families seeking clinical excellence without compromise, Tricia Connolly, RN offers a completely bespoke medical management service inside your residence or estate in {{ENCLAVE}}.",
  "Tricia Connolly, RN provides discrete private duty nursing and premium healthcare coordination for clients residing in the exclusive {{ENCLAVE}} community.",
  "Designed for high-net-worth families, prominent executives, and public figures, Tricia Connolly, RN offers comprehensive, NDA-protected home nursing care throughout the {{ENCLAVE}} area.",
  "Elite medical management and professional private duty nursing are now available directly in your home. Tricia Connolly, RN delivers personalized clinical services inside {{ENCLAVE}}."
];

const bulletSets = [
  `<ul>
                    <li>Absolute privacy protection and extensive experience with celebrity and high-net-worth clientele.</li>
                    <li>Tailored, comprehensive clinical care in private estates, residences, and luxury hotel suites.</li>
                    <li>Postoperative transport and direct clinical discharge coordination from {{LOCAL_HOSPITAL}}.</li>
                    <li>Direct interfacing with premier specialists at Cedars-Sinai, UCLA Health, and exclusive local pharmacy networks.</li>
                </ul>`,
  `<ul>
                    <li>Uncompromising privacy safeguards and extensive experience with high-profile clientele.</li>
                    <li>Personalized wellness plans and private duty nursing inside residences or luxury hotels.</li>
                    <li>Seamless discharge coordination and private medical transport from {{LOCAL_HOSPITAL}}.</li>
                    <li>Direct communication lines with top specialists at UCLA, Cedars-Sinai, and local clinical networks.</li>
                </ul>`,
  `<ul>
                    <li>Absolute confidentiality under strict NDAs in private residences, estates, or premier luxury hotels.</li>
                    <li>Comprehensive home health triage, clinical vitals monitoring, and medication management.</li>
                    <li>Post-surgical recovery oversight working closely with surgical teams at {{LOCAL_HOSPITAL}}.</li>
                    <li>Access to elite local pharmacy networks and expedited custom medicine deliveries.</li>
                </ul>`,
  `<ul>
                    <li>Discreet bedside manner tailored for high-security residences, gated estates, and luxury hotel rooms.</li>
                    <li>Preventative wellness checks, home IV hydration drips, and symptom management.</li>
                    <li>Direct transport coordination and post-op care plans from {{LOCAL_HOSPITAL}} to home or hotel.</li>
                    <li>Liaison services connecting family offices, security details, and concierge physicians.</li>
                </ul>`
];

// Track generated filenames for sitemap
const generatedSlugs = [];

locations.forEach((loc, index) => {
  // Generate JSON-LD Schema
  const schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalBusiness",
        "@id": "https://triciaconnollyrn.com/#business",
        "name": "Tricia Connolly, RN - Bespoke Concierge Nursing",
        "image": "https://triciaconnollyrn.com/assets/concierge.png",
        "logo": "https://triciaconnollyrn.com/assets/concierge.png",
        "url": "https://triciaconnollyrn.com",
        "telephone": "+1-310-889-4846",
        "priceRange": "$$$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": `Serving ${loc.enclave}`,
          "addressLocality": loc.neighborhood,
          "addressRegion": "CA",
          "postalCode": loc.zip,
          "addressCountry": "US"
        }
      },
      {
        "@type": "MedicalWebPage",
        "@id": `https://triciaconnollyrn.com/${loc.slug}#webpage`,
        "url": `https://triciaconnollyrn.com/${loc.slug}`,
        "name": `Private Duty Nursing & Concierge Care in ${loc.enclave} | Tricia Connolly, RN`,
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "@id": `https://triciaconnollyrn.com/${loc.slug}#primaryimage`,
          "url": "https://triciaconnollyrn.com/assets/concierge.png"
        },
        "reviewedBy": {
          "@type": "Person",
          "name": "Tricia Connolly, RN",
          "jobTitle": "Registered Nurse"
        }
      },
      {
        "@type": "FAQPage",
        "@id": `https://triciaconnollyrn.com/${loc.slug}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is concierge private duty nursing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "It is a premium, individualized model of health management where a dedicated registered nurse provides direct clinical care, wellness oversight, and specialist coordination inside your home or during travel."
            }
          },
          {
            "@type": "Question",
            "name": "Do you work under Non-Disclosure Agreements (NDAs)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, absolutely. Uncompromising discretion and absolute privacy are core tenets of Tricia's practice. She routinely operates under strict NDAs for celebrity, executive, and high-net-worth clients."
            }
          },
          {
            "@type": "Question",
            "name": "Is 24/7 care available?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Depending on clinical needs, Tricia can coordinate round-the-clock shift nursing or provide dedicated daytime/nighttime support."
            }
          },
          {
            "@type": "Question",
            "name": loc.faqQuestion,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": loc.faqAnswer
            }
          }
        ]
      }
    ]
  };

  const schemaMarkup = `<script type="application/ld+json">\n    ${JSON.stringify(schemaObj, null, 2).replace(/\n/g, '\n    ')}\n    </script>`;

  // Alternate layouts: standard, reversed, stacked
  const layoutVariants = ['', 'reversed', 'stacked'];
  const layoutClass = layoutVariants[index % 3];

  // Dynamic copy selection to prevent duplicate content penalties
  const introTemplate = introTemplates[index % introTemplates.length];
  const bulletTemplate = bulletSets[index % bulletSets.length];

  let introParagraph = introTemplate.replace(/{{ENCLAVE}}/g, loc.enclave);
  let bulletPoints = bulletTemplate.replace(/{{LOCAL_HOSPITAL}}/g, loc.hospital);

  // Replace tokens in template
  let pageContent = template;
  pageContent = pageContent.replace(/{{NEIGHBORHOOD}}/g, loc.neighborhood);
  pageContent = pageContent.replace(/{{ZIP_CODE}}/g, loc.zip);
  pageContent = pageContent.replace(/{{SLUG}}/g, loc.slug);
  pageContent = pageContent.replace(/{{ENCLAVE}}/g, loc.enclave);
  pageContent = pageContent.replace(/{{LOCAL_HOSPITAL}}/g, loc.hospital);
  pageContent = pageContent.replace(/{{CUSTOM_COPY}}/g, loc.customCopy);
  pageContent = pageContent.replace(/{{FAQ_QUESTION}}/g, loc.faqQuestion);
  pageContent = pageContent.replace(/{{FAQ_ANSWER}}/g, loc.faqAnswer);
  pageContent = pageContent.replace(/{{SCHEMA_MARKUP}}/g, schemaMarkup);
  pageContent = pageContent.replace(/{{LAYOUT_CLASS}}/g, layoutClass);
  pageContent = pageContent.replace(/{{INTRO_PARAGRAPH}}/g, introParagraph);
  pageContent = pageContent.replace(/{{BULLET_POINTS}}/g, bulletPoints);
  pageContent = pageContent.replace(/{{SPECIALTY_NAME}}/g, loc.specialtyName);
  pageContent = pageContent.replace(/{{CLINICAL_CONDITION}}/g, loc.clinicalCondition);
  pageContent = pageContent.replace(/{{PROCEDURE_FAQ_QUESTION}}/g, loc.procedureFAQQuestion);
  pageContent = pageContent.replace(/{{PROCEDURE_FAQ_ANSWER}}/g, loc.procedureFAQAnswer);
  pageContent = pageContent.replace(/{{SITE_FOOTER}}/g, siteFooterHTML);

  // Write file
  const filename = `${loc.slug}.html`;
  const outputPath = path.join(__dirname, filename);
  fs.writeFileSync(outputPath, pageContent, 'utf8');
  console.log(`Generated: ${filename}`);

  generatedSlugs.push(loc.slug);
});

// Generate locations.html from template
const locationsTemplatePath = path.join(__dirname, 'locations-template.html');
if (fs.existsSync(locationsTemplatePath)) {
  const locationsTemplate = fs.readFileSync(locationsTemplatePath, 'utf8');
  
  // Build main grid HTML
  let mainGridHTML = '';
  sortedNeighborhoods.forEach(nh => {
    const locs = groupedLocations[nh];
    locs.sort((a, b) => a.enclave.localeCompare(b.enclave));
    
    mainGridHTML += `\n            <div class="neighborhood-card-main">`;
    mainGridHTML += `\n                <h3>${nh}</h3>`;
    mainGridHTML += `\n                <ul>`;
    locs.forEach(loc => {
      mainGridHTML += `\n                    <li><a href="/${loc.slug}">${loc.enclave}</a></li>`;
    });
    mainGridHTML += `\n                </ul>`;
    mainGridHTML += `\n            </div>`;
  });

  // Build locations page schema
  const locationsSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalBusiness",
        "@id": "https://triciaconnollyrn.com/#business",
        "name": "Tricia Connolly, RN - Bespoke Concierge Nursing",
        "image": "https://triciaconnollyrn.com/assets/concierge.png",
        "logo": "https://triciaconnollyrn.com/assets/concierge.png",
        "url": "https://triciaconnollyrn.com",
        "telephone": "+1-310-889-4846",
        "priceRange": "$$$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Beverly Hills",
          "addressLocality": "Los Angeles",
          "addressRegion": "CA",
          "postalCode": "90210",
          "addressCountry": "US"
        }
      },
      {
        "@type": "MedicalWebPage",
        "@id": "https://triciaconnollyrn.com/locations#webpage",
        "url": "https://triciaconnollyrn.com/locations",
        "name": "Service Locations & Areas Served | Tricia Connolly, RN",
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "@id": "https://triciaconnollyrn.com/locations#primaryimage",
          "url": "https://triciaconnollyrn.com/assets/concierge.png"
        },
        "reviewedBy": {
          "@type": "Person",
          "name": "Tricia Connolly, RN",
          "jobTitle": "Registered Nurse"
        }
      },
      {
        "@type": "ItemList",
        "@id": "https://triciaconnollyrn.com/locations#itemlist",
        "name": "Los Angeles Private Duty Nursing Locations",
        "numberOfItems": locations.length,
        "itemListElement": locations.map((loc, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "url": `https://triciaconnollyrn.com/${loc.slug}`,
          "name": `${loc.enclave} Concierge Nursing Care`
        }))
      }
    ]
  };

  const locationsSchemaMarkup = `<script type="application/ld+json">\n    ${JSON.stringify(locationsSchema, null, 2).replace(/\n/g, '\n    ')}\n    </script>`;

  let locationsContent = locationsTemplate;
  locationsContent = locationsContent.replace(/{{SCHEMA_MARKUP}}/g, locationsSchemaMarkup);
  locationsContent = locationsContent.replace(/{{LOCATIONS_GRID}}/g, mainGridHTML);
  
  if (locationsContent.includes('<!-- SITE_FOOTER_START -->')) {
    const startTag = '<!-- SITE_FOOTER_START -->';
    const endTag = '<!-- SITE_FOOTER_END -->';
    const startIdx = locationsContent.indexOf(startTag);
    const endIdx = locationsContent.indexOf(endTag);
    locationsContent = locationsContent.substring(0, startIdx + startTag.length) + '\n' + siteFooterHTML + '\n        ' + locationsContent.substring(endIdx);
  }

  const locationsOutputPath = path.join(__dirname, 'locations.html');
  fs.writeFileSync(locationsOutputPath, locationsContent, 'utf8');
  console.log('Generated: locations.html');
}

// Generate sitemap.xml
let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://triciaconnollyrn.com/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://triciaconnollyrn.com/locations</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://triciaconnollyrn.com/concierge</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://triciaconnollyrn.com/post-op</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://triciaconnollyrn.com/iv-therapy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://triciaconnollyrn.com/partners</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

generatedSlugs.forEach((slug) => {
  sitemapContent += `\n  <url>
    <loc>https://triciaconnollyrn.com/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
});

sitemapContent += `\n</urlset>\n`;

fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
console.log('Generated: sitemap.xml');
console.log('All local SEO pages compiled successfully!');
