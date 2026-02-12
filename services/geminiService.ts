
import { GoogleGenAI, Type } from "@google/genai";
import { ParsedItem, SpotPriceData } from "../types";

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

export async function fetchSpotPrice(metal: 'silver' | 'gold'): Promise<SpotPriceData> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `What is the current ${metal} spot price per troy ounce in USD right now?`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text;
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => ({
      title: chunk.web?.title || "Search Source",
      uri: chunk.web?.uri || ""
    }))
    .filter((s: any) => s.uri) || [];

  // Extract numerical price from the AI text using a second pass if needed, 
  // or just rely on a follow-up parsing step.
  const priceExtractor = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract ONLY the current ${metal} spot price as a number from this text: "${text}". If multiple are mentioned, pick the most recent/accurate one.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          price: { type: Type.NUMBER }
        },
        required: ["price"]
      }
    }
  });

  const priceResult = JSON.parse(priceExtractor.text.trim());

  return {
    price: priceResult.price,
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    sources
  };
}
