
export interface SilverItem {
  id: string;
  name: string;
  quantity: number;
  ozPerUnit: number;
  totalOz: number;
  category: string;
  purity: number; // e.g., 0.999
  addedAt: number;
}

export interface SpotPriceData {
  price: number;
  currency: string;
  lastUpdated: string;
  sources: { title: string; uri: string }[];
}

export interface ParsedItem {
  name: string;
  ozPerUnit: number;
  quantity: number;
  purity: number;
  category: string;
}
