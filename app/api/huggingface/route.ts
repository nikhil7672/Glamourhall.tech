import { NextRequest, NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import OpenAI from "openai";
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl:string = process.env.SUPABASE_URL || '';
const supabaseAnonKey:string = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("text") as string | null;
    const imagePaths = formData.getAll("imagePaths") as string[];
    const conversationId = formData.get("conversationId") as string;
    const userId = formData.get("userId") as string;

    let conversationContext = "";
    let preferences = ''
    if (conversationId) {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('messages')
        .eq('id', conversationId)
        .single();
      
      if (conversation?.messages) {
        conversationContext = JSON.stringify(conversation.messages);
      }
    }
    if (userId) {
      const { data: user_preferences } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();
      
      if (user_preferences?.preferences) {
        preferences = JSON.stringify(user_preferences.preferences);
      }
    }
    const messages = JSON.parse(conversationContext || '[]');
    
    // Take only last 10 messages to reduce processing time
    const finalHistoryContext = messages.slice(-5)
    .map((msg:any) => `${msg.type}: ${msg.content.slice(0, 100)}`)
    .join('\n');
    // Handle text-only fashion queries
    if (prompt && imagePaths.length === 0) {
      return NextResponse.json({ 
        result: await handleFashionQuery(prompt, finalHistoryContext, preferences) 
      });
    }

    // Handle both image and text analysis
    if (prompt && imagePaths.length > 0) {
      return NextResponse.json({ 
        result: await analyzeOutfitWithContext(imagePaths, prompt, finalHistoryContext, preferences) 
      });
    }

    // Handle image-only analysis
    if (imagePaths.length > 0) {
      return NextResponse.json({ 
        result: await generateStyleAnalysis(imagePaths, finalHistoryContext, preferences) 
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
  messagesStr: string,
  preferences: string,
): Promise<string> {
  const fashionPrompt = `
 Now Imagine you are a pro fashion assistant so reply to this and here is the prompt ${prompt}
 User preferences:
 ${preferences}
  dont show color code name it,
Previous conversation Context:
  ${messagesStr}.
  `;

  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "user",
        content: fashionPrompt
      }
    ],
    max_tokens: 500
  });

  return completion.choices[0].message.content || "No style advice available.";
}

async function analyzeOutfitWithContext(
  imagePaths: string[], 
  prompt: string,
  messagesStr: string,
  preferences: string
): Promise<string> {
  const results = await Promise.all(
    imagePaths.map(async (imagePath) => {
      try {
        const initialAnalysis = await getOutfitAnalysis(imagePath);
        return await refineFashionAdvice(initialAnalysis, prompt, messagesStr, preferences);
      } catch (error) {
        return "I couldn't analyze this look. Want to try another photo? 📸";
      }
    })
  );

  return results.join("\n\n") + "\n\nNeed specific styling suggestions? Just ask! ✨";
}

async function getOutfitAnalysis(imagePath: string): Promise<string> {
  const analysisPrompt = `
    Imagine you are a pro fashion assistant so analyze given image
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
    max_tokens: 500,
  });

  return analysis.choices[0].message.content || "Could not analyze the outfit.";
}

async function refineFashionAdvice(
  initialAnalysis: string, 
  prompt: string,
  messagesStr: string,
  preferences: string
): Promise<string> {
  const refinementPrompt = `
    Previous conversation:
  ${messagesStr}////
    Now Imagine you are a pro fashion assistant:
    Initial Analysis of Image uploaded by user:
    ${initialAnalysis}/////
    User Prompt: "${prompt}",
     User preferences:
 ${preferences}, dont show color code name it
  `;

  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: refinementPrompt }],
    max_tokens: 500,
  });

  return completion.choices[0].message.content || "No style advice available.";
}

async function generateStyleAnalysis(
  imagePaths: string[], 
  messagesStr: string,
  preferences: string
): Promise<string> {
  const analyses = await Promise.all(
    imagePaths.map(async (imagePath) => {
      try {
        const analysis = await getOutfitAnalysis(imagePath);
        const enhancedAdvice = await refineFashionAdvice(
          analysis,
          "",
          messagesStr,
          preferences
        );
        return enhancedAdvice;
      } catch(error) {
        console.log(error)
        return "I couldn't analyze this look. Let's try another photo! 📸";
      }
    })
  );

  return analyses.join('\n\n');
}


