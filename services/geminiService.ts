import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// We use process.env.API_KEY as per the requirements.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a styled portrait based on an input image and a text prompt.
 * Uses the 'gemini-2.5-flash-image' model (Nano banana).
 */
export const generatePortrait = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    // Ensure base64 string is raw (remove data:image/png;base64, prefix if present)
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `Follow this strict visual instruction to transform the attached image: ${prompt}`,
          },
        ],
      },
      // Note: responseMimeType and responseSchema are NOT supported for nano banana models
    });

    // Iterate through parts to find the image part
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          // Return the full data URL
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data returned from Gemini.");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};
