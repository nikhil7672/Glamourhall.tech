import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

interface Product {
  name: string;
  price: string;
  image: string;
  url: string;
  brand: string;
}

const BROWSERLESS_API_KEY = 'RktIzwq6WkOQLVb6670d38d6014a1417b54cbb9fef';

export async function scrapeProducts(keyTerms: string): Promise<Product[]> {
  const myntraUrl = `https://www.myntra.com/${encodeURIComponent(keyTerms)}`;

  try {
    // Call Browserless REST API
    const response = await fetch(`https://chrome.browserless.io/content?token=${BROWSERLESS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: myntraUrl }),
    });

    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

    const html = await response.text();
    const products = parseMyntra(html);

    return products.filter(p => p.name && p.price);
  } catch (error) {
    console.error('Scraping Error:', error);
    return [];
  }
}

// Function to parse Myntra product data using Cheerio
function parseMyntra(html: string): Product[] {
  const $ = cheerio.load(html);
  const products: Product[] = [];

  $('.product-base').each((_, element) => {
    const href = $(element).find('a').attr('href') || '';

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
