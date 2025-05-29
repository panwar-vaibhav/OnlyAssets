import { SuiClient } from '@mysten/sui/client';
import { ListingItem } from './types';

const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });

const MARKETPLACE_OBJECT_ID = '0x6d678b07f64e6e6359e750f6d65018f75485ba3d3a30bdf74c517e0afaf7bfae';

function getFields(obj: any): any | undefined {
  // Defensive: Check for expected structure
  if (
    obj &&
    obj.data &&
    obj.data.content &&
    typeof obj.data.content === 'object' &&
    'fields' in obj.data.content
  ) {
    return (obj.data.content as any).fields;
  }
  return undefined;
}

export async function fetchMarketplaceListings(): Promise<ListingItem[]> {
  // 1. Get Marketplace object
  const marketplace = await suiClient.getObject({
    id: MARKETPLACE_OBJECT_ID,
    options: { showContent: true },
  });

  const marketplaceFields = getFields(marketplace);
  const listingsTableId =
    marketplaceFields?.listings?.fields?.id?.id as string | undefined;
  if (!listingsTableId || typeof listingsTableId !== 'string') return [];

  // 2. Get all asset IDs in the listings table
  const dynamicFields = await suiClient.getDynamicFields({ parentId: listingsTableId });
  const assetIds = dynamicFields.data.map(f => String(f.name.value));

  // 3. For each asset ID, get the listing and asset metadata
  const listings: ListingItem[] = [];
  for (const assetId of assetIds) {
    // Get listing
    const listingObj = await suiClient.getDynamicFieldObject({
      parentId: listingsTableId,
      name: { type: 'address', value: assetId },
    });
    const listing = getFields(listingObj);
    if (!listing) continue;

    // Get asset metadata (NFT or FT)
    const assetObj = await suiClient.getObject({
      id: assetId,
      options: { showContent: true },
    });
    const assetFields = getFields(assetObj);
    if (!assetFields) continue;

    // Parse asset type and category
    let assetTypeIndex = 0;
    let category = 'Real Estate';
    let type = 'NFT';
    if ('asset_type' in assetFields) {
      const assetTypeKey = Object.keys(assetFields.asset_type)[0];
      switch (assetTypeKey) {
        case 'RealEstate':
          assetTypeIndex = 0;
          category = 'Real Estate';
          break;
        case 'Invoice':
          assetTypeIndex = 1;
          category = 'Invoices';
          break;
        case 'Gold':
          assetTypeIndex = 2;
          category = 'Commodities';
          break;
        default:
          category = assetTypeKey;
      }
    }
    if ('total_supply' in assetFields) type = 'FT';

    // Optionally fetch metadata from IPFS if you want richer info
    let title = typeof assetFields.metadata_uri === 'string' ? assetFields.metadata_uri : 'Untitled';
    let description = '';
    let imageUrl = '';
    if (typeof assetFields.metadata_uri === 'string' && assetFields.metadata_uri.startsWith('ipfs://')) {
      try {
        const url = `https://ipfs.io/ipfs/${assetFields.metadata_uri.replace('ipfs://', '')}`;
        const meta = await fetch(url).then(r => r.json());
        title = meta.name || title;
        description = meta.description || '';
        imageUrl = meta.image || '';
      } catch (e) {}
    }

    listings.push({
      id: assetId,
      title,
      description,
      imageUrl,
      price: Number(listing.price),
      priceToken: 'SUI',
      category,
      network: { name: 'Sui', logo: '/images/sui-logo.svg' },
      type,
      assetTypeIndex,
      metadataUri: assetFields.metadata_uri,
    });
  }

  return listings;
}