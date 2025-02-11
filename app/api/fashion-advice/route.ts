import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import * as fs from 'fs/promises'; // For handling image conversion if needed

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Supabase
const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// POST Request Handler
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("text") as string | null;
    const imagePaths = formData.getAll("imagePaths") as string[];
    const conversationId = formData.get("conversationId") as string;
    const userId = formData.get("userId") as string;

    let conversationContext = "";
    let preferences = '';

    // Fetch previous conversation context if exists
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

    // Fetch user preferences
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
    const finalHistoryContext = messages.slice(-5)
      .map((msg: any) => `${msg.type}: ${msg.content.slice(0, 100)}`)
      .join('\n');

    if (prompt && imagePaths.length === 0) {
      return NextResponse.json({ 
        result: await handleFashionQuery(prompt, finalHistoryContext, preferences) 
      });
    }

    if (prompt && imagePaths.length > 0) {
      return NextResponse.json({ 
        result: await analyzeOutfitWithContext(imagePaths, prompt, finalHistoryContext, preferences) 
      });
    }

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

// Handle text-only fashion queries
async function handleFashionQuery(
  prompt: string, 
  messagesStr: string,
  preferences: string,
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: `
          Imagine you're a professional fashion assistant. Respond to the following prompt:
          "${prompt}"
          
          User Preferences:
          ${preferences}

          Previous Conversation Context:
          ${messagesStr}
          
          Final Response should be optimised to the point with nice emojis.
        `
        
     }],
      },
    ],
  });

  return (await result.response).text() || "No style advice available.";
}

// Handle both image and text analysis
async function analyzeOutfitWithContext(
  imagePaths: string[], 
  prompt: string,
  messagesStr: string,
  preferences: string
): Promise<string> {
  const results = await Promise.all(
    imagePaths.map(async (imagePath) => {
      try {
        const initialAnalysis = await getOutfitAnalysis(imagePath, preferences, messagesStr, prompt);
        return initialAnalysis;
      } catch (error) {
        console.error("Image Analysis Error:", error);
        return "I couldn't analyze this look. Want to try another photo? 📸";
      }
    })
  );

  return results.join("\n\n") + "\n\nNeed specific styling suggestions? Just ask! ✨";
}

// Analyze outfit from image
async function getOutfitAnalysis(imagePath: string, preferences:string, messagesStr:string, prompt:string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const imageBase64 = await fetchImageAsBase64(imagePath); // Convert image URL to Base64

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: `Imagine you're a professional fashion stylist. Analyze the outfit in this image and give and suggestions and feeback.
           ` },
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
        ],
      },
    ],
  });

  return (await result.response).text() || "Could not analyze the outfit.";
}

// Refine fashion advice based on user input and previous analysis
async function refineFashionAdvice(
  initialAnalysis: string, 
  prompt: string,
  messagesStr: string,
  preferences: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: `
          Previous Conversation:
          ${messagesStr}

          Initial Analysis of User's Outfit:
          ${initialAnalysis}

          User Prompt: "${prompt}"

          User Preferences:
          ${preferences}

          Please provide refined and personalized fashion advice based on the above information.
        ` }],
      },
    ],
  });

  return (await result.response).text() || "No style advice available.";
}

// Analyze images without additional prompts
async function generateStyleAnalysis(
  imagePaths: string[], 
  messagesStr: string,
  preferences: string
): Promise<string> {
  const analyses = await Promise.all(
    imagePaths.map(async (imagePath) => {
      try {
        const analysis = await getOutfitAnalysis(imagePath, preferences, messagesStr, '');
        // const enhancedAdvice = await refineFashionAdvice(
        //   analysis,
        //   "",
        //   messagesStr,
        //   preferences
        // );
        return analysis;
      } catch (error) {
        console.error("Error analyzing image:", error);
        return "I couldn't analyze this look. Let's try another photo! 📸";
      }
    })
  );

  return analyses.join('\n\n');
}

// Convert Image URL to Base64 (for Gemini inlineData)
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}
