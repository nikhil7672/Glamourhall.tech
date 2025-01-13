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
    const image = data.image; // Check for image data

    if (!prompt && !image) {
      console.error("No prompt or image provided");
      return NextResponse.json(
        { error: "Prompt or image is required" },
        { status: 400 }
      );
    }

    if (prompt) {
      // Prepare messages for the model
      const messages = [
        {
          role: "user",
          content: prompt
        }
      ];

      console.info("Processing text...");

      // Call HuggingFace API using InferenceClient
      const completion = await hf.chatCompletion({
        model: "mistralai/Mistral-Nemo-Instruct-2407",
        messages: messages,
        max_tokens: 500
      });
      console.log(completion, 'completion');
      console.info("Text processed successfully");

      return NextResponse.json({ result: completion.choices[0].message });
    }

    if (image) {
      console.info("Processing image...");
      // Use a model that supports image processing, such as CLIP
      const imageResult = await hf.zeroShotImageClassification({
        model: "openai/clip-vit-base-patch32",
        inputs: image,
        parameters: { candidate_labels: ["fashion", "casual", "formal"] },
      });
      console.log(imageResult, 'imageResult');
      console.info("Image processed successfully");

      return NextResponse.json({ result: imageResult });
    }

  } catch (error: any) {
    console.error("Error processing request:", error.message);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}