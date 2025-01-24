import { NextRequest, NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import OpenAI from "openai";
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

interface StylePreferences {
  styleType?: string;
  occasion?: string;
  colorPreferences?: string[];
  seasonalPreference?: string;
}
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("text") as string | null;
    const imagePaths = formData.getAll("imagePaths") as string[];
    const preferences = JSON.parse(formData.get("preferences") as string || "{}") as StylePreferences;

    // Handle text-only fashion queries
    if (prompt && imagePaths.length === 0) {
      return NextResponse.json({ 
        result: await handleFashionQuery(prompt, preferences) 
      });
    }

    // Handle both image and text analysis
    if (prompt && imagePaths.length > 0) {
      return NextResponse.json({ 
        result: await analyzeOutfitWithContext(imagePaths, prompt, preferences) 
      });
    }

    // Handle image-only analysis
    if (imagePaths.length > 0) {
      return NextResponse.json({ 
        result: await generateStyleAnalysis(imagePaths, preferences) 
      });
    }

    return NextResponse.json(
      { error: "Share your style question or upload a photo for personalized fashion advice! ✨" },
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

async function handleFashionQuery(
  prompt: string, 
  preferences: StylePreferences
): Promise<string> {
  const fashionPrompt = `
  Imagine you are a pro fashion assistant so reply to this and here is the prompt ${prompt}
  `;

  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: fashionPrompt }],
    max_tokens: 500,
  });

  return formatStyleAdvice(completion.choices[0].message.content || "No style advice available.");
}

async function analyzeOutfitWithContext(
  imagePaths: string[], 
  prompt: string,
  preferences: StylePreferences
): Promise<string> {
  const results = await Promise.all(
    imagePaths.map(async (imagePath) => {
      try {
        const initialAnalysis = await getOutfitAnalysis(imagePath, prompt);
        return await refineFashionAdvice(initialAnalysis, prompt, preferences);
      } catch (error) {
        return "I couldn't analyze this look. Want to try another photo? 📸";
      }
    })
  );

  return results.join("\n\n") + "\n\nNeed specific styling suggestions? Just ask! ✨";
}

async function getOutfitAnalysis(imagePath: string, prompt: string): Promise<string> {
  const analysisPrompt = `
    Imagine you are a pro fashion assistant so analyze given image  ${prompt}
  `;

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
    max_tokens: 400,
  });

  return analysis.choices[0].message.content || "Could not analyze the outfit.";
}

async function refineFashionAdvice(
  initialAnalysis: string, 
  prompt: string,
  preferences: StylePreferences
): Promise<string> {
  const refinementPrompt = `
    Imagine you are a pro fashion assistant:

    Initial Analysis:
    ${initialAnalysis}

    User Prompt: "${prompt}"
    Style Preferences: ${JSON.stringify(preferences)}
  `;

  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: refinementPrompt }],
    max_tokens: 500,
  });

  return formatStyleAdvice(completion.choices[0].message.content || "No style advice available.");
}

async function generateStyleAnalysis(
  imagePaths: string[], 
  preferences: StylePreferences
): Promise<string> {
  const analyses = await Promise.all(
    imagePaths.map(async (imagePath) => {
      try {
        const analysis = await getOutfitAnalysis(imagePath, "");
        const enhancedAdvice = await refineFashionAdvice(
          analysis,
          "Provide comprehensive style analysis",
          preferences
        );
        return enhancedAdvice;
      } catch(error) {
        console.log(error)
        return "I couldn't analyze this look. Let's try another photo! 📸";
      }
    })
  );

  return formatStyleAnalysis(analyses);
}

function formatStyleAdvice(content: string): string {
  return `${content.trim()}\n\nWant to explore more styling options? I'm here to help! ✨`;
}

function formatStyleAnalysis(analyses: string[]): string {
  return analyses.join("\n\n") + "\n\nLet me know if you'd like specific styling tips for any of these looks! 🌟";
}