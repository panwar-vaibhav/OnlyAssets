export interface NetworkInfo {
  name: string;
  logo: string;
}

export interface ListingItem {
  id: string; // asset_id
  title: string; // from NFT/FT metadata
  description: string; // from NFT/FT metadata
  imageUrl: string; // from NFT/FT metadata (or a default if not present)
  price: number;
  priceToken: string;
  category: string; // "Real Estate" | "Invoices" | "Commodities"
  network: { name: string; logo: string };
  type: string; // "NFT" or "FT"
  tier?: string;
  earnXP?: number;
  assetNumber?: string; // <-- Add this line
  yield?: number;
  tokenSymbol?: string;
  assetTypeIndex?: number; // 0: RealEstate, 1: Invoice, 2: Gold/Commodity
  metadataUri?: string;
}

export interface MarketData {
  realEstate: ListingItem[];
  invoices: ListingItem[];
  commodities: ListingItem[];
}
