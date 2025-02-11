import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
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
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });
  
    await page.setViewport({
      width: 1920,
      height: 1080
    });
  
    const myntraUrl = `https://www.myntra.com/${encodeURIComponent(keyTerms)}`;
    let products: Product[] = [];
  
    try {
      await page.goto(myntraUrl, {
        waitUntil: 'networkidle0',
        timeout: 90000
      });
  
      await Promise.race([
        page.waitForSelector('.product-base', { timeout: 45000 }),
        page.waitForSelector('.results-notFound', { timeout: 45000 })
      ]);
  
      await autoScroll(page);
      await new Promise(r => setTimeout(r, 2000));
      const html = await page.content();
      products = await parseMyntra(html);
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
