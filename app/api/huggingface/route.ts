import { NextRequest, NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import { createClient } from '@supabase/supabase-js';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const openai = new ChatOpenAI({
  openAIApiKey: process.env.DEEPSEEK_API_KEY,
  configuration: { baseURL: 'https://api.deepseek.com' },
  modelName: "deepseek-chat"
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("text") as string | null;
    const imagePaths = formData.getAll("imagePaths") as string[];
    const conversationId = formData.get("conversationId") as string;
    const userId = formData.get("userId") as string;

    const conversationContext = await getConversationContext(conversationId);
    const preferences = await getUserPreferences(userId);

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

async function getConversationContext(conversationId: string) {
  if (!conversationId) return '';
  const { data: conversation } = await supabase
    .from('conversations')
    .select('messages')
    .eq('id', conversationId)
    .single();
  return conversation?.messages ? JSON.stringify(conversation.messages) : '';
}

async function getUserPreferences(userId: string) {
  if (!userId) return '';
  const { data: user_preferences } = await supabase
    .from('user_preferences')
    .select('preferences')
    .eq('user_id', userId)
    .single();
  return user_preferences?.preferences ? JSON.stringify(user_preferences.preferences) : '';
}

async function handleFashionQuery(prompt: string, messagesStr: string, preferences: string): Promise<string> {
  const fashionPrompt = `
 You are a pro personal fashion assistant of user 
 User prompt:
 ${prompt}
 User preferences:
 ${preferences}
Previous conversation Context:
  ${messagesStr}.
  Give to the point answer to make user satisfied and also add engaging emojis 
  `;

  const response = await openai.call([new HumanMessage(fashionPrompt)]);
  return response.text || "No style advice available.";
}

async function analyzeOutfitWithContext(imagePaths: string[], prompt: string, messagesStr: string, preferences: string): Promise<string> {
  const results = await Promise.all(
    imagePaths.map(async (imagePath) => {
      try {
        const initialAnalysis = await getOutfitAnalysis(imagePath);
        return await refineFashionAdvice(initialAnalysis, prompt, messagesStr, preferences);
      } catch {
        return "I couldn't analyze this look. Want to try another photo? 📸";
      }
    })
  );
  return results.join("\n\n") + "\n\nNeed specific styling suggestions? Just ask! ✨";
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

async function refineFashionAdvice(initialAnalysis: string, prompt: string, messagesStr: string, preferences: string): Promise<string> {
  const refinementPrompt = `
    Previous conversation:
  ${messagesStr}////
    you are a pro fashion assistant:
    Initial Analysis of Image uploaded by user:
    ${initialAnalysis}/////
    User Prompt: "${prompt}",
     User preferences:
 ${preferences}, give to the point proper fashion feedback and suggestions with engaging emojis
  `;

  const response = await openai.call([new HumanMessage(refinementPrompt)]);
  return response.text || "No style advice available.";
}

async function generateStyleAnalysis(imagePaths: string[], messagesStr: string, preferences: string): Promise<string> {
  const analyses = await Promise.all(
    imagePaths.map(async (imagePath) => {
      try {
        const analysis = await getOutfitAnalysis(imagePath);
        return await refineFashionAdvice(analysis, "", messagesStr, preferences);
      } catch {
        return "I couldn't analyze this look. Let's try another photo! 📸";
      }
    })
  );
  return analyses.join('\n\n');
}
