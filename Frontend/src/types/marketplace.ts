export interface MarketplaceListing {
  asset_id: string;
  is_nft: boolean;
  seller: string;
  price: string;
  timestamp: string;
  metadata_uri?: string;
  // Metadata fields
  name?: string;
  description?: string;
  attributes?: {
    'Asset Type': string;
    'Price Token': string;
    'Earn XP': string;
  };
  image?: string;
}