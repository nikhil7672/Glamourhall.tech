import { NextResponse } from "next/server";
import { scrapeProducts } from "@/app/lib/scraper_prod";

export async function POST(req: Request) {
  try {
    const { keyword } = await req.json();
    const products = await scrapeProducts(keyword);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "Failed to scrape products" },
      { status: 500 }
    );
  }
}