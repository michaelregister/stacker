
import { SpotPriceData } from "../types";

const SYMBOLS: Record<"silver" | "gold", string> = {
  gold: "XAU",
  silver: "XAG"
};

interface GoldApiResponse {
  price: number;
  updatedAt: string;
}

export async function fetchSpotPrice(metal: "silver" | "gold"): Promise<SpotPriceData> {
  const response = await fetch(`https://api.gold-api.com/price/${SYMBOLS[metal]}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${metal} spot price: ${response.status}`);
  }

  const data: GoldApiResponse = await response.json();

  return {
    price: data.price,
    currency: "USD",
    lastUpdated: data.updatedAt
  };
}
