import { NextRequest, NextResponse } from "next/server";
import { HfInference } from '@huggingface/inference';

// Initialize HuggingFace client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function GET() {
  return NextResponse.json(
    { status: "healthy", message: "Server is running" }
  );
}

export async function POST(req: NextRequest) {
    console.info("Received processing request");
  
    try {
      // Parse request body
      const data = await req.json();
      const prompt = data.prompt;
      const image = data.image;
  
      if (!prompt && !image) {
        console.error("No prompt or image provided");
        return NextResponse.json(
          { error: "Prompt or image is required" },
          { status: 400 }
        );
      }
  
      let response = null;
  
      if (prompt && image) {
        // Process both together: Ask the image classification model and include the prompt for AI response
        console.info("Processing image and prompt together...");
  
        const imageResult = await hf.zeroShotImageClassification({
          model: "openai/clip-vit-base-patch32",
          inputs: image,
          parameters: { candidate_labels: ["fashion", "casual", "formal"] },
        });
  
        // Use the result of image classification along with the prompt
        const message = `The image is classified as: ${imageResult.label}. ${prompt}`;
  
        // Now generate a response based on both the prompt and image
        const messages = [
          { role: "user", content: message }
        ];
  
        const completion = await hf.chatCompletion({
          model: "mistralai/Mistral-Nemo-Instruct-2407",
          messages: messages,
          max_tokens: 500,
        });
  
        response = completion.choices[0].message;
      } else if (prompt) {
        // Process only text
        console.info("Processing prompt...");
        const messages = [
          { role: "user", content: prompt }
        ];
  
        const completion = await hf.chatCompletion({
          model: "mistralai/Mistral-Nemo-Instruct-2407",
          messages: messages,
          max_tokens: 500,
        });
  
        response = completion.choices[0].message;
      } else if (image) {
        // Process only image
        console.info("Processing image...");
        const imageResult = await hf.zeroShotImageClassification({
          model: "openai/clip-vit-base-patch32",
          inputs: image,
          parameters: { candidate_labels: ["fashion", "casual", "formal"] },
        });
  
        response = imageResult;
      }
  
      return NextResponse.json({ result: response });
  
    } catch (error: any) {
      console.error("Error processing request:", error.message);
      return NextResponse.json(
        { error: error.message || "Something went wrong" },
        { status: 500 }
      );
    }
  }
  