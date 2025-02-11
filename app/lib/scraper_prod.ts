import puppeteer from 'puppeteer-core';
import * as cheerio from 'cheerio';

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

// Sleep function for adding delays
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main scraping function for production
export async function scrapeProducts(keyTerms: string): Promise<Product[]> {
  const browserWSEndpoint = `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}`;
  let browser;
  const products: Product[] = [];

  try {
    // Connect to Browserless
    browser = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser.newPage();

    // Randomize User-Agent for each request
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUserAgent);

    // Set realistic HTTP headers to mimic a browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': 'https://www.google.com/'
    });

    await page.setViewport({ width: 1920, height: 1080 });

    const myntraUrl = `https://www.myntra.com/${encodeURIComponent(keyTerms)}`;
    console.log(`Navigating to: ${myntraUrl}`);

    // Block unnecessary resources like images, fonts, and stylesheets to speed up loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font'].includes(resourceType)) {
        req.abort();  // Skip these resources
      } else {
        req.continue();
      }
    });

    // Navigate to the Myntra page with optimized settings
    await page.goto(myntraUrl, {
      waitUntil: 'domcontentloaded',  // Faster than networkidle0
      timeout: 30000  // 30 seconds timeout
    });

    // Wait for products to load or show no results
    await Promise.race([
      page.waitForSelector('.product-base', { timeout: 15000 }),
      page.waitForSelector('.results-notFound', { timeout: 15000 })
    ]);

    // Scroll to load dynamic content
    await autoScroll(page);
    await sleep(2000);  // Wait 2 seconds after scrolling

    // Get the HTML content and parse it
    const html = await page.content();
    const parsedProducts = parseMyntra(html);
    products.push(...parsedProducts);

  } catch (error) {
    console.error('Scraping Error:', error);
  } finally {
    if (browser) await browser.close();
  }

  // Return filtered products (limit to first 10)
  return products.filter(p => p.name && p.price).slice(0, 10);
}

// Function to parse Myntra product data using Cheerio
function parseMyntra(html: string): Product[] {
  const $ = cheerio.load(html);
  const products: Product[] = [];

  $('.product-base').each((_, element) => {
    const anchor = $(element).find('a');
    const href = anchor.attr('href') || '';

    const product: Product = {
      name: $(element).find('.product-product').text().trim(),
      brand: $(element).find('.product-brand').text().trim(),
      price: $(element).find('.product-price').text().trim(),
      image: $(element).find('picture img').attr('src') || '',
      url: href.startsWith('http') ? href : `https://www.myntra.com/${href.replace(/^\//, '')}`
    };

    products.push(product);
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
