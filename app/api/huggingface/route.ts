import { NextRequest, NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

interface StylePreferences {
  styleType?: string;
  occasion?: string;
  colorPreferences?: string[];
  seasonalPreference?: string;
}

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
    As a luxury fashion consultant, provide detailed advice for: "${prompt}"
    
    Style Context:
    - Preferred Style: ${preferences.styleType || 'Not specified'}
    - Occasion: ${preferences.occasion || 'Not specified'}
    - Color Preferences: ${preferences.colorPreferences?.join(', ') || 'Not specified'}
    - Season: ${preferences.seasonalPreference || 'Not specified'}

    Provide:
    1. Personalized style recommendations
    2. Current trend connections
    3. Practical styling tips
    4. Accessorizing suggestions
    5. Alternative options
  `;

  const completion = await hf.chatCompletion({
    model: "mistralai/Mistral-Nemo-Instruct-2407",
    messages: [{ role: "user", content: fashionPrompt }],
    max_tokens: 500,
  });

  return formatStyleAdvice(completion.choices[0].message.content);
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
    Analyze this outfit as a high-end fashion consultant:
    1. Style categorization and mood
    2. Silhouette and fit analysis
    3. Color palette evaluation
    4. Fabric and texture assessment
    5. Styling potential and versatility
    
    Additional Context: ${prompt}
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

  return analysis.choices[0].message.content;
}

async function refineFashionAdvice(
  initialAnalysis: string, 
  prompt: string,
  preferences: StylePreferences
): Promise<string> {
  const refinementPrompt = `
    Enhance this style analysis with luxury fashion expertise:

    Initial Analysis:
    ${initialAnalysis}

    User Request: "${prompt}"
    Style Preferences: ${JSON.stringify(preferences)}

    Provide:
    ✨ Style Profile
    [Comprehensive style analysis]

    👗 Outfit Enhancement
    1. Styling Recommendations
    2. Color Coordination
    3. Accessory Suggestions
    4. Proportion Optimization

    🎯 Personalized Advice
    [Specific recommendations based on preferences]

    🌟 Style Evolution
    [Trend-forward suggestions]
  `;

  const refinement = await hf.chatCompletion({
    model: "mistralai/Mistral-Nemo-Instruct-2407",
    messages: [{ role: "user", content: refinementPrompt }],
    max_tokens: 500,
  });

  return formatStyleAdvice(refinement.choices[0].message.content);
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
      } catch {
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