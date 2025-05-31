import React, { useEffect, useState } from 'react';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

interface MarketplaceListing {
  asset_id: string;
  is_nft: boolean;
  seller: string;
  price: string;
  timestamp: string;
  metadata_uri?: string; // Add this field
}

const MARKETPLACE_ID = '0x6d678b07f64e6e6359e750f6d65018f75485ba3d3a30bdf74c517e0afaf7bfae';

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        console.log('Fetching listings...');
        const client = new SuiClient({ url: getFullnodeUrl('testnet') });

        // First, get the marketplace object
        const marketplaceObj = await client.getObject({
          id: MARKETPLACE_ID,
          options: { 
            showContent: true,
            showType: true
          }
        });

        console.log('Marketplace object:', marketplaceObj);

        // Get the table fields from the marketplace object
        const fields = (marketplaceObj.data?.content as any)?.fields;
        if (!fields?.listings) {
          console.log('No listings table found');
          setLoading(false);
          return;
        }

        // Get the listings table object ID
        const listingsTableId = fields.listings.fields.id.id;
        console.log('Listings table ID:', listingsTableId);

        // Fetch all dynamic fields (listings) from the table
        const dynamicFields = await client.getDynamicFields({
          parentId: listingsTableId
        });

        console.log('Dynamic fields:', dynamicFields);

        if (!dynamicFields.data || !Array.isArray(dynamicFields.data)) {
          console.error('Invalid dynamic fields response');
          setLoading(false);
          return;
        }

        // Fetch each listing's details
        const listingsPromises = dynamicFields.data.map(async (field) => {
          try {
            const listingObj = await client.getObject({
              id: field.objectId,
              options: { showContent: true }
            });
            return listingObj.data?.content;
          } catch (error) {
            console.warn(`Error fetching listing ${field.objectId}:`, error);
            return null;
          }
        });

        const listingsData = await Promise.all(listingsPromises);
        console.log('Listings data:', listingsData);

        const isMoveObject = (content: any): content is MoveObject => 
          content && content.dataType === "moveObject";

        const validListings = listingsData
          .filter(isMoveObject);

        console.log('Valid listings:', validListings);
        
        // Extract and set the listings in one step
        const extractedListings = await Promise.all(
          validListings.map(async (listing) => {
            const baseFields = listing.fields.value.fields;
            const metadata_uri = await getMetadataUri(baseFields.asset_id, client);
            return {
              ...baseFields,
              metadata_uri: metadata_uri || 'N/A'
            };
          })
        );
        
        console.log('Extracted listings:', extractedListings);
        setListings(extractedListings); // Use extractedListings instead of the previous mapping

      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen h-screen w-full bg-white flex items-center justify-center">
        <BackgroundBeamsWithCollision>
          <div className="text-black text-xl">Loading listings...</div>
        </BackgroundBeamsWithCollision>
      </div>
    );
  }

  // Add null check for listings
  if (!listings) {
    return (
      <div className="min-h-screen h-screen w-full bg-white flex items-center justify-center">
        <BackgroundBeamsWithCollision>
          <div className="text-black text-xl">No listings data available</div>
        </BackgroundBeamsWithCollision>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen w-full bg-white flex flex-col">
      <BackgroundBeamsWithCollision className="flex-1 h-full w-full flex flex-col">
        <div className="container mx-auto p-8 relative z-10">
          <h1 className="text-4xl font-bold mb-8 text-black">Marketplace Listings</h1>
          {listings.length === 0 ? (
            <div className="text-black text-xl text-center">No listings available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div 
                  key={listing.asset_id || `listing-${Math.random()}`}
                  className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="text-black">
                    <p className="font-semibold mb-2">Asset ID: {listing.asset_id ?? 'N/A'}</p>
                    <p>Type: {typeof listing.is_nft === 'boolean' ? (listing.is_nft ? 'NFT' : 'FT') : 'Unknown'}</p>
                    <p>Price: {listing.price ? `${Number(listing.price) / 1e9} SUI` : 'N/A'}</p>
                    <p className="text-sm opacity-75">
                      Seller: {listing.seller ? `${listing.seller.slice(0, 6)}...${listing.seller.slice(-4)}` : 'N/A'}
                    </p>
                    <p className="text-sm opacity-75">
                      Listed: {listing.timestamp ? new Date(Number(listing.timestamp)).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm mt-2 break-all">
                      Metadata URI: {listing.metadata_uri || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
};

// Update the MoveObject interface to match the actual response structure
interface MoveObject {
  dataType: "moveObject";
  fields: {
    id: {
      id: string;
    };
    name: string;
    value: {
      fields: {
        asset_id: string;
        is_nft: boolean;
        price: string;
        seller: string;
        timestamp: string;
      };
      type: string;
    };
  };
  hasPublicTransfer: boolean;
  type: string;
}

interface PackageObject {
  disassembled: Record<string, string>;
  dataType: "package";
}

interface DynamicFieldInfo {
  name: {
    type: string;
    value: string;
  };
  bcsEncoding: string;
  bcsName: string;
  type: string;
  objectType: string;
  objectId: string;
  version: number;
  digest: string;
}

interface DynamicFieldResponse {
  data: DynamicFieldInfo[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

type ContentType = MoveObject | PackageObject;

const getMetadataUri = async (objectId: string, client: SuiClient) => {
  try {
    // 1. Fetch the Marketplace object
    const marketplace = await client.getObject({
      id: MARKETPLACE_ID,
      options: { showContent: true }
    });

    // 2. Get the nft_escrow and ft_escrow table IDs
    const nftEscrowTableId = (marketplace.data?.content as any)?.fields?.nft_escrow?.fields?.id?.id;
    const ftEscrowTableId = (marketplace.data?.content as any)?.fields?.ft_escrow?.fields?.id?.id;

    console.log('NFT Escrow Table ID:', nftEscrowTableId);
    console.log('FT Escrow Table ID:', ftEscrowTableId);

    // 3. First try NFT escrow
    
      const nftInEscrow = await client.getDynamicFieldObject({
        parentId: nftEscrowTableId,
        name: { 
          type: '0x2::object::ID', 
          value: objectId 
        }
      });

      console.dir(nftInEscrow, { depth: null });

      const metadata_uri = (nftInEscrow.data?.content as any)?.fields?.value?.fields?.metadata_uri;
      if (metadata_uri) {
        console.log(`Found NFT metadata_uri:`, metadata_uri);
        return metadata_uri;
      }
    

    console.log(`No metadata found for asset ${objectId}`);
    return null;

  } catch (error) {
    console.error(`Error fetching metadata URI for ${objectId}:`, error);
    return null;
  }
};

export default Marketplace;