import { NextRequest, NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userInput = formData.get("text") as string | null;
    const imagePaths = formData.getAll("imagePaths") as string[];

    // Handle conversation flow
    if (userInput) {
      if (isGreeting(userInput)) {
        return NextResponse.json({ result: handleGreeting(userInput) });
      } else if (isFashionRelated(userInput)) {
        return NextResponse.json({ result: await handleFashionQuery(userInput) });
      } else if (userInput.toLowerCase().includes("date")) {
        return NextResponse.json({ result: await handleDateQuery(userInput) });
      } else {
        return NextResponse.json({ result: redirectToFashion(userInput) });
      }
    } else if (imagePaths.length > 0) {
      return NextResponse.json({ result: await handleImageAnalysis(imagePaths) });
    } else {
      return NextResponse.json(
        { error: "Need help with fashion or beauty? Share your thoughts or upload an image! ✨" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    return NextResponse.json(
      { error: "Oops! Something went wrong. Let's try again? 💄" },
      { status: 500 }
    );
  }
}

// Greeting handler
function isGreeting(text: string): boolean {
  const greetings = ["hi", "hello", "hey", "how are you", "good morning", "good evening", "what is your name"];
  return greetings.some((greeting) => text.toLowerCase().includes(greeting));
}

function handleGreeting(text: string): string {
  return `Hey there! 👋 I'm GlamBot, your personal fashion assistant. I’m here to help you with:
  - Outfit suggestions for any occasion 👗
  - Beauty tips and skincare advice 💆‍♀️
  - Makeup looks and tips 💄
  - Personalized style guidance based on your needs 🎯

Feel free to ask about anything fashion-related, or share your thoughts for personalized advice! ✨`;
}

// Fashion-related query detection
function isFashionRelated(text: string): boolean {
  const keywords = [
    "fashion", "style", "beauty", "skincare", "makeup", "outfit", "trend", "accessories",
    "hair", "hairstyle", "shoes", "bags", "clothing", "dresses", "jeans", "jackets", "coats", 
    "casual wear", "formal wear", "evening wear", "street style", "vintage", "modern", "chic", 
    "elegant", "comfortable", "sustainable fashion", "color palette", "trendy", "bold", "minimalist", 
    "boho", "layering", "statement pieces", "personal style", "fashion tips", "skirt", "blouse", 
    "tops", "pants", "accessorize", "personalized outfits", "wardrobe", "clothing combinations", 
    "seasonal fashion", "fashion hacks", "style guide", "fashion inspiration", "styling advice", 
    "outfit combinations", "fashion accessories", "color matching", "pattern mixing", "textiles", "couture"
  ];
  return keywords.some((keyword) => text.toLowerCase().includes(keyword));
}


// Handle date-specific queries
async function handleDateQuery(prompt: string): Promise<string> {
  const datePrompt = `
    A user mentioned a date. Guide them with tips for:
    1. Dressing confidently for their date.
    2. Grooming or skincare tips for the day.
    3. Suggesting outfit ideas based on casual, formal, or trendy looks.
    User's input: "${prompt}"
  `;
  const completion = await hf.chatCompletion({
    model: "mistralai/Mistral-Nemo-Instruct-2407",
    messages: [{ role: "user", content: datePrompt }],
    max_tokens: 200,
  });
  return `${completion.choices[0].message.content}\n\nWant to share more about the vibe of your date? I can suggest something extra special! 🌟`;
}

// Redirect unrelated queries
function redirectToFashion(userInput: string): string {
  return `That sounds interesting! 💡 By the way, do you need any fashion or beauty advice? I’m here to help you slay your style! 👗`;
}

// Handle fashion-related text queries
async function handleFashionQuery(prompt: string): Promise<string> {
  const fashionPrompt = `Provide concise advice for this fashion-related question: "${prompt}"`;
  const completion = await hf.chatCompletion({
    model: "mistralai/Mistral-Nemo-Instruct-2407",
    messages: [{ role: "user", content: fashionPrompt }],
    max_tokens: 150,
  });
  return `${completion.choices[0].message.content}\n\nNeed more details or options? Let me know! 💄`;
}

// Analyze images for fashion context
async function handleImageAnalysis(imagePaths: string[]): Promise<string> {
  const results = await Promise.all(
    imagePaths.map(async (imagePath) => {
      try {
        const analysis = await hf.chatCompletion({
          model: "meta-llama/Llama-3.2-11B-Vision-Instruct",
          messages: [
            { role: "user", content: "Analyze this image for style and beauty tips." },
            { role: "image_url", content: { url: imagePath } },
          ],
          max_tokens: 150,
        });
        return `${analysis.choices[0].message.content}\n\nDoes this match your style goals? Let me know! ✨`;
      } catch {
        return "Couldn't process the image—maybe try another one? 📸";
      }
    })
  );
  return results.join("\n\n") + `\n\nHave another look you'd like me to review? 👚`;
}
