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

// User-Agent rotation to mimic different browsers
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
];

// Sleep function for delays
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Connect to Browserless with retry logic to handle 429 rate limiting errors
async function connectBrowser(browserWSEndpoint: string): Promise<puppeteer.Browser> {
  const maxRetries = 5;
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      console.log(`Attempting to connect to Browserless...`);
      const browser = await puppeteer.connect({ browserWSEndpoint });
      return browser;
    } catch (error: any) {
      if (error.message && error.message.includes("429")) {
        const waitTime = Math.pow(2, retryCount) * 1000;
        console.log(`Rate limited while connecting. Retrying in ${waitTime} ms...`);
        await sleep(waitTime);
        retryCount++;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed to connect to Browserless after multiple retries");
}

// Main scraping function
export async function scrapeProducts(keyTerms: string): Promise<Product[]> {
  const browserWSEndpoint = `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}`;
  let products: Product[] = [];

  try {
    // Use the connection function with retry logic
    const browser = await connectBrowser(browserWSEndpoint);
    const page = await browser.newPage();

    // Rotate User-Agent for each request
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

    let retryCount = 0;
    const maxRetries = 5;

    // Retry mechanism for handling 429 and 503 errors during page navigation
    while (retryCount < maxRetries) {
      try {
        console.log(`Navigating to: ${myntraUrl}`);
        await page.goto(myntraUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for product listings or "no results" message
        await Promise.race([
          page.waitForSelector('.product-base', { timeout: 45000 }),
          page.waitForSelector('.results-notFound', { timeout: 45000 })
        ]);

        // Scroll to load dynamic content
        await autoScroll(page);

        // Extra delay before scraping
        await sleep(2000);

        const html = await page.content();
        products = parseMyntra(html);
        // Break on successful scraping
        break;
      } catch (error: any) {
        if (error.message && (error.message.includes('429') || error.message.includes('503'))) {
          const waitTime = Math.pow(2, retryCount) * 1000;  // Exponential backoff
          console.log(`Encountered error (${error.message}). Retrying in ${waitTime} ms...`);
          await sleep(waitTime);
          retryCount++;
        } else {
          console.error('Scraping Error:', error);
          break;
        }
      }
    }

    // Close the browser session
    await browser.close();
  } catch (error) {
    console.error('Connection Error:', error);
  }

  // Filter out incomplete products
  return products.filter(p => p.name && p.price);
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
