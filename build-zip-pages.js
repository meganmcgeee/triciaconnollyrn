const fs = require('fs');
const path = require('path');

// Paths
const locationsPath = path.join(__dirname, 'locations.json');
const templatePath = path.join(__dirname, 'local-seo-template.html');
const sitemapPath = path.join(__dirname, 'sitemap.xml');

// Load files
if (!fs.existsSync(locationsPath)) {
  console.error('Error: locations.json not found!');
  process.exit(1);
}
if (!fs.existsSync(templatePath)) {
  console.error('Error: local-seo-template.html not found!');
  process.exit(1);
}

const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
const template = fs.readFileSync(templatePath, 'utf8');

console.log(`Loaded ${locations.length} target locations.`);

const introTemplates = [
  "For high-profile individuals, executives, and families seeking clinical excellence without compromise, Tricia Connolly, RN offers a completely bespoke medical management service inside your residence or estate in {{ENCLAVE}}.",
  "Tricia Connolly, RN provides discrete private duty nursing and premium healthcare coordination for clients residing in the exclusive {{ENCLAVE}} community.",
  "Designed for high-net-worth families, prominent executives, and public figures, Tricia Connolly, RN offers comprehensive, NDA-protected home nursing care throughout the {{ENCLAVE}} area.",
  "Elite medical management and professional private duty nursing are now available directly in your home. Tricia Connolly, RN delivers personalized clinical services inside {{ENCLAVE}}."
];

const bulletSets = [
  `<ul>
                    <li>Absolute privacy protection and extensive experience with celebrity and high-net-worth clientele.</li>
                    <li>Tailored, comprehensive home wellness coordination and triage in private residences.</li>
                    <li>Postoperative transport and direct clinical discharge coordination from {{LOCAL_HOSPITAL}}.</li>
                    <li>Direct interfacing with premier specialists at Cedars-Sinai, UCLA Health, and exclusive local pharmacy networks.</li>
                </ul>`,
  `<ul>
                    <li>Uncompromising privacy safeguards and extensive experience with high-profile clientele.</li>
                    <li>Personalized home wellness plans and preventative clinical coordination.</li>
                    <li>Seamless discharge coordination and private medical transport from {{LOCAL_HOSPITAL}}.</li>
                    <li>Direct communication lines with top specialists at UCLA, Cedars-Sinai, and local clinical networks.</li>
                </ul>`,
  `<ul>
                    <li>Absolute confidentiality under strict NDAs for public figures and executives.</li>
                    <li>Comprehensive home health triage, clinical vitals monitoring, and medication management.</li>
                    <li>Post-surgical recovery oversight working closely with surgical teams at {{LOCAL_HOSPITAL}}.</li>
                    <li>Access to elite local pharmacy networks and expedited custom medicine deliveries.</li>
                </ul>`,
  `<ul>
                    <li>Discreet bedside manner tailored for high-security residences and gated estates.</li>
                    <li>Preventative wellness checks, home IV hydration drips, and symptom management.</li>
                    <li>Direct transport coordination and post-op care plans from {{LOCAL_HOSPITAL}}.</li>
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

  // Write file
  const filename = `${loc.slug}.html`;
  const outputPath = path.join(__dirname, filename);
  fs.writeFileSync(outputPath, pageContent, 'utf8');
  console.log(`Generated: ${filename}`);

  generatedSlugs.push(loc.slug);
});

// Generate sitemap.xml
let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://triciaconnollyrn.com/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
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
