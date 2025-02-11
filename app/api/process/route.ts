import { NextRequest, NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import { createClient } from "@supabase/supabase-js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

import pLimit from "p-limit";
import { scrapeProducts } from "@/app/lib/scraper_prod";



const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const openai = new ChatOpenAI({
  openAIApiKey: process.env.DEEPSEEK_API_KEY,
  configuration: { baseURL: "https://api.deepseek.com" },
  modelName: "deepseek-chat",
});

// Simple in-memory cache for product scraping
const productCache = new Map<string, any[]>();

async function cachedScrapeProducts(keyword: string): Promise<any[]> {
  if (productCache.has(keyword)) {
    return productCache.get(keyword)!;
  }
  const products = await scrapeProducts(keyword);
  productCache.set(keyword, products);
  return products;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("text") as string | null;
    const imagePaths = formData.getAll("imagePaths") as string[];
    const conversationId = formData.get("conversationId") as string;
    const userId = formData.get("userId") as string;

    const conversationContext = await getConversationContext(conversationId);
    const preferences = await getUserPreferences(userId);
    const parsedPreferences = JSON.parse(preferences || "{}");

    const messages = JSON.parse(conversationContext || "[]");
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg: any) => msg.type === "user");

    const lastAssistantResponse = messages
      .slice()
      .reverse()
      .find(
        (msg: any) =>
          msg.type === "assistant" &&
          msg.timestamp > (lastUserMessage?.timestamp || 0)
      );

    const finalHistoryContext = [lastUserMessage, lastAssistantResponse]
      .filter(Boolean) // Remove undefined values
      .map((msg: any) => `${msg.type}: ${msg.content.slice(0, 100)}`)
      .join("\n");

    if (prompt && imagePaths.length === 0) {
      const preProcessed = preProcessPrompt(prompt);
      if (preProcessed) {
        if (preProcessed) {
          return NextResponse.json({
            result: preProcessed.advice,
            products: [],
          });
        }
      }
      const { advice, keywords } = await handleFashionQuery(
        prompt,
        finalHistoryContext,
        parsedPreferences
      );

      // Increased concurrency limit to 4
      const limit = pLimit(2);
      const limitedKeywords = keywords.slice(0, 2);

      const productPromises = limitedKeywords.map((term) =>
        limit(() => cachedScrapeProducts(term))
      );

      const productArrays = await Promise.all(productPromises);
      const products = productArrays.flat().slice(0, 6);

      const filteredProducts = filterProductsByGender(
        products,
        parsedPreferences
      );

      return NextResponse.json({
        result: advice,
        products: filteredProducts,
      });
    }

    if (prompt && imagePaths.length > 0) {
      const { result, products } = await analyzeOutfitWithContext(
        imagePaths,
        prompt,
        finalHistoryContext,
        preferences
      );

      const filteredProducts = filterProductsByGender(
        products,
        parsedPreferences
      );

      return NextResponse.json({
        result,
        products: filteredProducts,
      });
    }

    if (imagePaths.length > 0) {
      const { result, products } = await generateStyleAnalysis(
        imagePaths,
        finalHistoryContext,
        preferences
      );

      const filteredProducts = filterProductsByGender(
        products,
        parsedPreferences
      );

      return NextResponse.json({
        result,
        products: filteredProducts,
      });
    }

    return NextResponse.json(
      {
        error:
          "Share your style question or upload a photo for personalized fashion advice! ✨",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error:", error.message);
    return NextResponse.json(
      { error: "Fashion emergency! Let's try that again? 👗" },
      { status: 500 }
    );
  }
}

function filterProductsByGender(products: any[], preferences: any) {
  return products.filter((product) => {
    const productName = product.name.toLowerCase();

    if (preferences?.gender === "male") {
      return !(
        productName.includes("women") ||
        productName.includes("woman") ||
        productName.includes("girl")
      );
    }
    if (preferences?.gender === "female") {
      return !(
        productName.includes("men") ||
        productName.includes("man") ||
        productName.includes("boy")
      );
    }
    return true;
  });
}

async function getConversationContext(conversationId: string) {
  if (!conversationId) return "";
  const { data: conversation } = await supabase
    .from("conversations")
    .select("messages")
    .eq("id", conversationId)
    .single();
  return conversation?.messages ? JSON.stringify(conversation.messages) : "";
}

async function getUserPreferences(userId: string) {
  if (!userId) return "";
  const { data: user_preferences } = await supabase
    .from("user_preferences")
    .select("preferences")
    .eq("user_id", userId)
    .single();
  return user_preferences?.preferences
    ? JSON.stringify(user_preferences.preferences)
    : "";
}

async function handleFashionQuery(
  prompt: string,
  messagesStr: string,
  preferences: any
): Promise<{ advice: string; keywords: string[] }> {
  const fashionPrompt = `
    Act as a friendly fashion-conscious assistant. Follow these instructions:

    1. First, give personalized fashion advice:
       - Be conversational and use emojis naturally.
       - Consider previous chats: ${messagesStr}
       - Consider user gender: ${preferences?.gender}
        - Consider user age: ${preferences?.age}
         - Consider user height: ${preferences?.height}cm
       - Example: "Hey! 👋 That's a great question. For your love of neutral tones, I'd suggest..."

    2. Only if your advice includes specific product recommendations, provide 2-3 product search keywords at the end:
       - Format the keywords like this when needed:
         Search Keywords: [keyword1], [keyword2], [keyword3]
         
    Current User Message: "${prompt}"
  `;

  const response = await openai.invoke([new HumanMessage(fashionPrompt)]);
  const fullResponse =
    response.content?.toString() || "Hmm, let me think about that...";

  const keywordMatch = fullResponse.match(/Search Keywords:\s*(.*)/i);
  const keywords = keywordMatch
    ? keywordMatch[1].split(",").map((k) => k.trim())
    : [];

  const advice = fullResponse.replace(/Search Keywords:.*/i, "").trim();

  return { advice, keywords };
}

async function analyzeOutfitWithContext(
  imagePaths: string[],
  prompt: string,
  messagesStr: string,
  preferences: string
): Promise<{ result: string; products: any[] }> {
  const results = await Promise.all(
    imagePaths.map(async (imagePath) => {
      try {
        const initialAnalysis = await getOutfitAnalysis(imagePath);
        const { advice, keywords } = await refineFashionAdvice(
          initialAnalysis,
          prompt,
          messagesStr,
          preferences
        );

        const limit = pLimit(2);
        const limitedKeywords = keywords.slice(0, 2);
        const productPromises = limitedKeywords.map((term) =>
          limit(() => cachedScrapeProducts(term))
        );
        const productArrays = await Promise.all(productPromises);
        const products = productArrays.flat().slice(0, 6);

        return {
          analysis: advice,
          products: products,
        };
      } catch {
        return {
          analysis:
            "I couldn't analyze this look. Want to try another photo? 📸",
          products: [],
        };
      }
    })
  );

  const allProducts = results.flatMap((r) => r.products);
  const allAnalysis =
    results.map((r) => r.analysis).join("\n\n") +
    "\n\nNeed specific styling suggestions? Just ask! ✨";

  return {
    result: allAnalysis,
    products: allProducts.slice(0, 10),
  };
}

async function getOutfitAnalysis(imagePath: string): Promise<string> {
  const analysisPrompt = `You are a pro personal fashion assistant of user, analyze this image`;
  const analysis = await hf.chatCompletion({
    model: "meta-llama/Llama-3.2-11B-Vision-Instruct",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: analysisPrompt },
          { type: "image_url", image_url: { url: imagePath } },
        ],
      },
    ],
    max_tokens: 500,
  });
  return analysis.choices[0].message.content || "Could not analyze the outfit.";
}

async function refineFashionAdvice(
  initialAnalysis: string,
  prompt: string,
  messagesStr: string,
  preferences: string
): Promise<{ advice: string; keywords: string[] }> {
  const refinementPrompt = `
    Act as a fashion-conscious assistant. Follow these rules:

    1. Analyze this image description: ${initialAnalysis || "No image provided"}
       - Note colors, styles, and body features
       - Identify potential improvements or complements

    2. Provide advice considering:
       - Image analysis: ${
         initialAnalysis
           ? "Use details from uploaded photo"
           : "No photo reference"
       }
       - User preferences: ${preferences}
       - Chat history: ${messagesStr}

    3. If suggesting items:
       - Recommend 2-3 items that work with analyzed image
       - Include 2-3 search keywords at the end:
         Format: Search Keywords: [keyword1], [keyword2]
       - Example: "Try a belt to accentuate your waist! 
         Search Keywords: wide leather belts, gold buckle accessories"

    Current query: "${prompt}"
  `;

  try {
    const response = await openai.call([new HumanMessage(refinementPrompt)]);
    const fullResponse =
      response.text || "Let me visualize some options for you...";

    const keywordMatch = fullResponse.match(/Search Keywords:\s*(.*)/i);
    const keywords = keywordMatch
      ? keywordMatch[1].split(",").map((k) => k.trim().replace(/\[|\]/g, ""))
      : [];

    const advice = fullResponse
      .replace(/Search Keywords:.*/i, "")
      .trim()
      .replace(/\n+/g, "\n");

    return { advice, keywords };
  } catch (error) {
    console.error("Image advice error:", error);
    return {
      advice: initialAnalysis
        ? "Let me take another look at your photo..."
        : "Hmm, let me think about that...",
      keywords: [],
    };
  }
}

async function generateStyleAnalysis(
  imagePaths: string[],
  messagesStr: string,
  preferences: string
): Promise<{ result: string; products: any[] }> {
  const analyses = await Promise.all(
    imagePaths.map(async (imagePath) => {
      try {
        const analysis = await getOutfitAnalysis(imagePath);
        const { advice, keywords } = await refineFashionAdvice(
          analysis,
          "",
          messagesStr,
          preferences
        );

        const limit = pLimit(2);
        const limitedKeywords = keywords.slice(0, 2);
        const productPromises = limitedKeywords.map((term) =>
          limit(() => cachedScrapeProducts(term))
        );
        const productArrays = await Promise.all(productPromises);
        const products = productArrays.flat().slice(0, 6);

        return {
          analysis: advice,
          products: products,
        };
      } catch {
        return {
          analysis: "I couldn't analyze this look. Let's try another photo! 📸",
          products: [],
        };
      }
    })
  );

  const allProducts = analyses.flatMap((a) => a.products);
  const allAnalysis = analyses.map((a) => a.analysis).join("\n\n");

  return {
    result: allAnalysis,
    products: allProducts.slice(0, 10),
  };
}

function preProcessPrompt(
  prompt: string
): { advice: string; keywords: string[] } | null {
  const lowerPrompt = prompt.toLowerCase().trim();

  // Handle greetings
  if (/^(hi|hello|hey|hola|namaste)/i.test(lowerPrompt)) {
    return {
      advice:
        "Hey there! 👋 I'm excited to help you discover amazing fashion ideas. What style or occasion are you thinking about today? Let's dive into some details so we can craft the perfect look together!",
      keywords: [],
    };
  }
  

  // Handle thanks
  if (/(thanks|thank you|thx|cheers|well done|good|outstanding|fantastic|excellect|mindblowing)/.test(lowerPrompt)) {
    return {
      advice: "You're welcome! 😊 Let me know if you need more style advice!",
      keywords: [],
    };
  }

  // Handle name inquiries
  if (/(what is|what's|tell me) (your|ur) name/i.test(lowerPrompt)) {
    return {
      advice: "I'm your personal fashion assistant, StyleMate! 👗✨ How can I help you look fabulous today?",
      keywords: [],
    };
  }

  if (/(what is|what's|tell me) (my|the|gender|location|address)/i.test(lowerPrompt)) {
    return {
      advice: "You're my favorite fashion enthusiast! 😊 Let's focus on creating your perfect look!",
      keywords: [],
    };
  }

  // Handle direct price inquiries
  if (
    /(price|cost|cheap|expensive)/.test(lowerPrompt) &&
    !/(shirt|dress|pant|shoe|outfit)/.test(lowerPrompt)
  ) {
    return {
      advice:
        "As your style guide, I focus on helping you discover looks that make you shine! 💫 While I can suggest options in different ranges, let's focus on your perfect style first.",
      keywords: [],
    };
  }

  // Handle help requests
  // if (/(help|how does this work|what can you do)/.test(lowerPrompt)) {
  //   return {
  //     advice:
  //       "I'm here to help you discover your best looks! 💄 You can ask me about outfits, styles, or get personalized fashion advice. What would you like to explore today?",
  //     keywords: [],
  //   };
  // }

  // Handle non-fashion queries
  if (
    !/(fashion|style|outfit|dress|shirt|pants?|t[- ]?shirt|skirt|trouser|suit|tie|scarf|hat|cap|sweater|cardigan|blazer|coat|jacket|underwear|lingerie|accessory|bag|backpack|jewelry|jewellery|earrings?|necklace|bracelet|ring|watch|shoes?|sneaker|boot|sandal|heel|loafers?|oxford|jumpsuit|romper|activewear|sportswear|casual|formal|vintage|boho|makeup|cosmetics|beauty|primer|concealer|foundation|contour|highlighter|blush|bronzer|lipstick|lip gloss|eyeliner|mascara|eyeshadow|nail|nail polish|nail art|skincare|cleanser|moisturizer|serum|toner|exfoliator|mask|sunscreen|perfume|lotion|hair|hairstyle|haircare|dye|look|hoodie|hoodies)/i.test(
      lowerPrompt
    )
  ) {
    return {
      advice:
        "I specialize in fashion advice! 👗 Let me know what you're looking to wear or what style you'd like to explore.",
      keywords: [],
    };
  }
  

  // If none of the above, proceed to handleFashionQuery
  return null;
}
