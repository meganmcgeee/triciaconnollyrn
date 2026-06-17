# SEO, Geo-Targeting, AI Search & Google Analytics Guide

We have implemented an optimization system across all pages of Tricia's concierge nursing website to ensure high visibility on search engines, tracking of ad spend, and readability by AI search assistants.

---

## 1. Google Analytics 4 (GA4) Setup
We have injected the Google Tag manager tracking script into the `<head>` of all 4 HTML pages:
* `index.html`
* `post-op.html`
* `concierge.html`
* `iv-therapy.html`

### Active Google Analytics Property:
We have already configured and embedded your live Measurement ID: **`G-E703GBGQLN`** into all four HTML files. 

If you ever need to change your data streams or update the property in the future:
1. Go to [Google Analytics](https://analytics.google.com/) and sign in.
2. Under Admin, find your **Web Data Stream** for `https://triciaconnollyrn.com`.
3. Copy the **Measurement ID** and replace `G-E703GBGQLN` with the new ID in the `<head>` of all four HTML files.

---

## 2. Generative Engine Optimization (GEO) & AI Search
AI search engines (like Perplexity, Google Gemini, and ChatGPT Search) crawl and summarize local businesses by reading clear factual details, service parameters, and verified social proof.

We optimized for AI engines in three ways:
1. **JSON-LD Schema Markup (Structured Data)**: Injected a `MedicalBusiness` structured data tag into the home page. This feeds AI search crawlers verified facts (e.g. phone number, operating hours, price tier, and exact services) in a highly readable format.
2. **Plain-Text Credentials & Service Radius**: Highlighted locations (Beverly Hills, Bel Air, Santa Monica, Greater LA) and credentials (RN, perioperative, concierge) in normal headings and paragraphs.
3. **Structured Testimonials**: Included clear verified testimonials with locations (e.g. "Bel Air, CA"), helping search models index Tricia's local authority.

---

## 3. SEO & Geo-Targeting (Traditional Search)
* **Metadata**: Added canonical tags, optimized keywords, and Open Graph tags. Open Graph tags ensure that when you text or email your link to someone, it shows a premium image card with a description of your services.
* **Geographical Keywords**: Targeted the highest-value local markets in Los Angeles:
  * *Beverly Hills*
  * *Bel Air*
  * *Santa Monica*
  * *West LA / Greater LA*

---

## 4. Tracking Leads from Ads (UTM Parameters)
When you run search ads (Google Ads, Meta/Facebook Ads), you can track which exact ad converted by adding UTM parameters to the landing page URLs. 

`leads.js` automatically detects these parameters and appends them to the lead row in your Google Sheet!

### Example URLs to use for your Ads:
* **For Post-Op Recovery Ads**:
  `https://triciaconnollyrn.com/post-op.html?utm_source=google&utm_medium=cpc&utm_campaign=post-op-beverly-hills`
* **For Concierge Nursing Ads**:
  `https://triciaconnollyrn.com/concierge.html?utm_source=meta&utm_medium=social&utm_campaign=vip-concierge-la`
* **For IV/Palliative Care Ads**:
  `https://triciaconnollyrn.com/iv-therapy.html?utm_source=google&utm_medium=cpc&utm_campaign=iv-hydration-wellness`
