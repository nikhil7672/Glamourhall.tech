import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';
import * as cheerio from 'cheerio';

interface Product {
  name: string;
  price: string;
  image: string;
  url: string;
  brand: string;
}

export async function scrapeProducts(keyTerms: string): Promise<Product[]> {
  const browser = await puppeteer.launch({
    args: chromium.args,  // Arguments needed for serverless environments
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,  // Vercel-compatible Chromium path
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  // Set User-Agent and other headers to avoid detection
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });

  const myntraUrl = `https://www.myntra.com/${encodeURIComponent(keyTerms)}`;
  let products: Product[] = [];

  try {
    await page.goto(myntraUrl, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.waitForSelector('.product-base', { timeout: 45000 });

    await autoScroll(page);  // Scroll to load more products
    const html = await page.content();
    products = parseMyntra(html);  // Extract product details
  } catch (error) {
    console.error('Scraping error:', error);
  } finally {
    await browser.close();
  }

  return products.filter(p => p.name && p.price);
}

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
      url: href.startsWith('http') ? href : `https://www.myntra.com/${href.replace(/^\//, '')}`,
    };

    products.push(product);
  });

  return products;
}

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
