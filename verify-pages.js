const fs = require('fs');
const path = require('path');

const locationsPath = path.join(__dirname, 'locations.json');
const sitemapPath = path.join(__dirname, 'sitemap.xml');

if (!fs.existsSync(locationsPath)) {
  console.error('locations.json is missing');
  process.exit(1);
}
if (!fs.existsSync(sitemapPath)) {
  console.error('sitemap.xml is missing');
  process.exit(1);
}

const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

console.log('--- STARTING VERIFICATION AUDIT ---');

let errors = 0;

// Verify Sitemap has basic entries
const mainUrls = [
  'https://triciaconnollyrn.com/',
  'https://triciaconnollyrn.com/locations',
  'https://triciaconnollyrn.com/concierge',
  'https://triciaconnollyrn.com/post-op',
  'https://triciaconnollyrn.com/iv-therapy',
  'https://triciaconnollyrn.com/partners'
];

mainUrls.forEach(url => {
  if (!sitemapContent.includes(url)) {
    console.error(`Error: sitemap.xml is missing main URL: ${url}`);
    errors++;
  }
});

locations.forEach((loc) => {
  const filename = `${loc.slug}.html`;
  const filePath = path.join(__dirname, filename);

  // 1. Verify file exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File does not exist: ${filename}`);
    errors++;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // 2. Verify basic tags and GA4 Measurement ID
  if (!content.includes('<title>')) {
    console.error(`Error: ${filename} is missing <title> tag`);
    errors++;
  }
  if (!content.includes('name="description"')) {
    console.error(`Error: ${filename} is missing description meta tag`);
    errors++;
  }
  if (!content.includes('G-E703GBGQLN')) {
    console.error(`Error: ${filename} is missing Google Analytics Measurement ID (G-E703GBGQLN)`);
    errors++;
  }

  // 3. Verify hyper-local copy replacement
  if (content.includes('{{NEIGHBORHOOD}}') || content.includes('{{ZIP_CODE}}') || content.includes('{{ENCLAVE}}') ||
      content.includes('{{INTRO_PARAGRAPH}}') || content.includes('{{BULLET_POINTS}}') || content.includes('{{LAYOUT_CLASS}}') ||
      content.includes('{{SPECIALTY_NAME}}') || content.includes('{{CLINICAL_CONDITION}}') ||
      content.includes('{{PROCEDURE_FAQ_QUESTION}}') || content.includes('{{PROCEDURE_FAQ_ANSWER}}')) {
    console.error(`Error: ${filename} still contains unreplaced template tokens`);
    errors++;
  }

  // 4. Verify Sitemap inclusion
  const sitemapUrl = `https://triciaconnollyrn.com/${loc.slug}`;
  if (!sitemapContent.includes(sitemapUrl)) {
    console.error(`Error: sitemap.xml is missing URL for: ${filename}`);
    errors++;
  }

  // 5. Verify JSON-LD Schema
  if (!content.includes('"@type": "MedicalBusiness"') || !content.includes('"@type": "FAQPage"')) {
    console.error(`Error: ${filename} is missing structured JSON-LD schemas`);
    errors++;
  }

  // 6. Verify Footer presence and token replacement
  if (!content.includes('<footer class="site-footer">')) {
    console.error(`Error: ${filename} is missing site footer`);
    errors++;
  }
  if (content.includes('{{SITE_FOOTER}}')) {
    console.error(`Error: ${filename} contains unreplaced {{SITE_FOOTER}} token`);
    errors++;
  }
});

// Verify main static pages have footer and no leftovers
const staticFiles = ['index.html', 'locations.html', 'post-op.html', 'concierge.html', 'iv-therapy.html', 'partners.html'];
staticFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Static file does not exist: ${file}`);
    errors++;
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('<footer class="site-footer">')) {
    console.error(`Error: Static file ${file} is missing site footer`);
    errors++;
  }
  if (content.includes('{{SITE_FOOTER}}')) {
    console.error(`Error: Static file ${file} contains unreplaced {{SITE_FOOTER}} token`);
    errors++;
  }
});

console.log('--- VERIFICATION AUDIT COMPLETE ---');
if (errors === 0) {
  console.log(`SUCCESS: All ${locations.length} local landing pages are 100% verified and valid!`);
  process.exit(0);
} else {
  console.error(`FAILURE: Found ${errors} verification errors.`);
  process.exit(1);
}
