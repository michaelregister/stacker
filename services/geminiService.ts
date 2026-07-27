
import { GoogleGenAI, Type } from "@google/genai";
import { ParsedItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function parseSilverInput(input: string): Promise<ParsedItem> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse the following silver item description and extract details: "${input}". 
    Standardize the name (e.g., "ASE" to "American Silver Eagle"). 
    Assume 1 oz if not specified. 
    Common silver items: 
    - Coins (ASE, Maple, Britannia, Krugerrand) are usually 1oz 0.999. 
    - Constitutional silver (junk) like Roosevelt dimes or Washington quarters have specific weights. 
    - Bars/Rounds are usually labeled (1oz, 5oz, 10oz, 1kg).
    Return weight in TROY OUNCES.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Normalized product name" },
          ozPerUnit: { type: Type.NUMBER, description: "Troy ounces per single unit" },
          quantity: { type: Type.NUMBER, description: "Number of units specified" },
          purity: { type: Type.NUMBER, description: "Silver purity (e.g. 0.999 or 0.90)" },
          category: { type: Type.STRING, description: "Type: Coin, Bar, Round, Junk, Other" }
        },
        required: ["name", "ozPerUnit", "quantity", "purity", "category"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    throw new Error("Failed to parse AI response for silver item.");
  }
}
