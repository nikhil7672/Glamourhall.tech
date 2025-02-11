import puppeteer from 'puppeteer-core';
import * as cheerio from 'cheerio';
import { setTimeout } from 'timers/promises';
import { addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Define the product structure
interface Product {
  name: string;
  price: string;
  image: string;
  url: string;
  brand: string;
}

// Replace with your actual Browserless API key
const BROWSERLESS_API_KEY = 'RktIzwq6WkOQLVb6670d38d6014a1417b54cbb9fef';

// User-Agent rotation to mimic different browsers and avoid detection
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
];

// Initialize puppeteer-extra with stealth plugin
const puppeteerExtra = addExtra(puppeteer);
puppeteerExtra.use(StealthPlugin());

// Enhanced configuration
const SCRAPING_CONFIG = {
  maxRetries: 3,
  retryDelay: 5000,
  timeout: 45000,
  browserlessEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}`,
  headers: {
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Fetch-Mode': 'navigate',
  },
  viewports: [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 414, height: 896 },
  ],
};

// Sleep function for adding delays
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main scraping function for production
export async function scrapeProducts(keyTerms: string): Promise<Product[]> {
  let retries = SCRAPING_CONFIG.maxRetries;
  const cleanedTerms = keyTerms.replace(/[\[\]]/g, '').trim();

  while (retries > 0) {
    const browser = await puppeteerExtra.connect({ 
      browserWSEndpoint: SCRAPING_CONFIG.browserlessEndpoint,
      headers: SCRAPING_CONFIG.headers,
    });

    try {
      const page = await browser.newPage();
      
      // Configure browser environment
      await page.setJavaScriptEnabled(true);
      await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
      await page.setExtraHTTPHeaders(SCRAPING_CONFIG.headers);
      
      // Set random viewport
      const viewport = SCRAPING_CONFIG.viewports[
        Math.floor(Math.random() * SCRAPING_CONFIG.viewports.length)
      ];
      await page.setViewport(viewport);

      // Configure request interception
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        req.resourceType() === 'document' ? req.continue() : req.abort();
      });

      // Build proper Myntra search URL
      const searchParams = new URLSearchParams({
        rawQuery: cleanedTerms,
        sort: 'relevance',
      });
      const myntraUrl = `https://www.myntra.com/${encodeURIComponent(cleanedTerms)}?${searchParams}`;

      // Navigate with enhanced timeout handling
      await page.goto(myntraUrl, {
        waitUntil: 'domcontentloaded',
        timeout: SCRAPING_CONFIG.timeout,
      });

      // Improved element waiting with fallback
      await Promise.race([
        page.waitForSelector('.product-base, .results-items', { timeout: 15000 }),
        page.waitForSelector('.empty-search-title', { timeout: 15000 }),
      ]);

      // Dynamic scrolling with randomized behavior
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.8));
        await setTimeout(1000 + Math.random() * 2000);
      }

      // Content extraction with fallback parsing
      const html = await page.content();
      const products = parseMyntra(html);

      if (products.length > 0) {
        return products.slice(0, 10);
      }

      retries--;
      await setTimeout(SCRAPING_CONFIG.retryDelay * (SCRAPING_CONFIG.maxRetries - retries));
      
    } catch (error) {
      console.error(`Scraping attempt ${4 - retries} failed:`, error);
      retries--;
      await setTimeout(SCRAPING_CONFIG.retryDelay);
    } finally {
      await browser?.close();
    }
  }

  return [];
}

// Function to parse Myntra product data using Cheerio
function parseMyntra(html: string): Product[] {
  const $ = cheerio.load(html);
  const products: Product[] = [];

  $('[class*="product-base"], [class*="productCard"]').each((_, element) => {
    try {
      const product: Product = {
        name: $(element).find('[class*="product-product"], [class*="title"]').text().trim(),
        price: $(element).find('[class*="product-discountedPrice"], [class*="price"]').text().trim(),
        image: $(element).find('img:first').attr('src') || '',
        url: $(element).find('a:first').attr('href') || '',
        brand: $(element).find('[class*="product-brand"], [class*="brand"]').text().trim(),
      };

      if (product.name && product.price) {
        products.push({
          ...product,
          url: product.url.startsWith('http') ? product.url : `https://www.myntra.com/${product.url.replace(/^\//, '')}`
        });
      }
    } catch (error) {
      console.error('Error parsing product element:', error);
    }
  });

  return products;
}

// Function to auto-scroll the page to load dynamic content
async function autoScroll(page: any): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
