import { NextRequest, NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("text") as string | null;
    const imagePaths = formData.getAll("imagePaths") as string[];

    let response = null;

    // Case 1: Only prompt (text) - Use Mistral
    if (prompt && imagePaths.length === 0) {
      const beautyPrompt = `
        As a beauty and fashion consultant, help with this question: ${prompt}
        Consider:
        - Fashion and style advice
        - Skincare recommendations 
        - Hair care tips
        - Makeup suggestions (if applicable)
        Provide practical and specific recommendations.
      `;

      const completion = await hf.chatCompletion({
        model: "mistralai/Mistral-Nemo-Instruct-2407",
        messages: [{ role: "user", content: beautyPrompt }],
        max_tokens: 500,
      });

      response = completion.choices[0].message.content;
    }

    // Case 2: Both image and prompt - Use Llama
   // Case 2: Both image and prompt - Use Llama then refine with Mistral
else if (prompt && imagePaths.length > 0) {
  const results = await Promise.all(
    imagePaths.map(async (imagePath) => {
      try {
        // Initial analysis with Llama
        const personalPrompt = `
          Analyze this person as a beauty and fashion consultant:
          1. Overall appearance and features
          2. Skin type and tone analysis
          3. Current hairstyle and suggestions
          4. For women: Makeup look and recommendations
          5. Fashion and outfit analysis
          6. Style enhancement suggestions
          Additional request: ${prompt}
          Be supportive and specific in recommendations.
        `;

        const initialAnalysis = await hf.chatCompletion({
          model: "meta-llama/Llama-3.2-11B-Vision-Instruct",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: personalPrompt },
                { type: "image_url", image_url: { url: imagePath } },
              ],
            },
          ],
          max_tokens: 500,
        });

        // Refine with Mistral
        const refinementPrompt = `
          As a high-end fashion and beauty consultant, please enhance this analysis while addressing the specific request: "${prompt}"

          Initial Analysis:
          ${initialAnalysis.choices[0].message.content}

          Please provide a refined response with:
          1. More detailed style analysis and recommendations
          2. Specific fashion advice related to the user's request
          3. Personalized beauty and skincare suggestions
          4. Current trend connections
          5. Practical implementation steps

          Format the response with:
          ✨ Overall Impression
          [Enhanced analysis of their current style and appearance]

          💆‍♀️ Beauty Tips
          1. Skin Care Suggestions
          2. Hair Care Recommendations
          3. Makeup Tips (if applicable)

          👗 Style Advice
          1. Fashion Recommendations
          2. Color Palette Suggestions
          3. Outfit Combinations

          🎯 Specific Advice for User's Request
          [Detailed response to their specific question/prompt]
        `;

        const refinedAnalysis = await hf.chatCompletion({
          model: "mistralai/Mistral-Nemo-Instruct-2407",
          messages: [
            {
              role: "user",
              content: refinementPrompt,
            },
          ],
          max_tokens: 500,
        });

        return refinedAnalysis.choices[0].message.content;

      } catch (error) {
        console.error(`Image processing failed:`, error);
        return "Sorry, I couldn't analyze this image. Please try again.";
      }
    })
  );

  response = results.join("\n");
}

    // Case 3: Only image - Use Ollama first, then refine with Mistral
    else if (imagePaths.length > 0) {
      // First get Ollama analysis
      const imageTextResult = await Promise.all(
        imagePaths.map(async (imagePath) => {
          try {
            const imageAnalysis = await hf.chatCompletion({
              model: "meta-llama/Llama-3.2-11B-Vision-Instruct", // Replace with actual Ollama endpoint
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: "Analyze this person's style and appearance" },
                    { type: "image_url", image_url: { url: imagePath } },
                  ],
                },
              ],
              max_tokens: 300,
            });

            // Refine with Mistral
            const refinedAnalysis = await hf.chatCompletion({
              model: "mistralai/Mistral-Nemo-Instruct-2407",
              messages: [
                {
                  role: "user",
                  content: `As a refined personal fashion consultant, please enhance and elaborate on this initial analysis: ${imageAnalysis.choices[0].message.content}`,
                },
              ],
              max_tokens: 500,
            });

            return `
✨ Overall Impression
${refinedAnalysis.choices[0].message.content}

💆‍♀️ Beauty Tips
1. Skin Care Suggestions
2. Hair Care Recommendations
3. Makeup Tips (for women)

👗 Style Advice
1. Fashion Recommendations
2. Color Palette Suggestions
3. Outfit Combinations

Want specific advice about any of these areas? Feel free to ask!
            `;
          } catch (error) {
            console.error(`Image processing failed:`, error);
            return "Sorry, I couldn't analyze this image. Please try again.";
          }
        })
      );

      response = imageTextResult.join("\n");
    }

    else {
      return NextResponse.json(
        { error: "Please provide an image or a beauty/fashion question" },
        { status: 400 }
      );
    }

    return NextResponse.json({ result: response });
  } catch (error: any) {
    console.error("Error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}