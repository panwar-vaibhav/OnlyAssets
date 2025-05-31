import React, { useEffect, useState, useRef, useId } from 'react';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchIPFSContent } from '@/utils/ipfs';
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from '@mysten/sui/transactions';
import { useCurrentAccount, useSignAndExecuteTransaction, useConnectWallet, useWallets, useSuiClient } from '@mysten/dapp-kit';
import { ConnectButton } from '@mysten/dapp-kit';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import WormholeConnect, { WormholeConnectConfig } from '@wormhole-foundation/wormhole-connect';

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

const MARKETPLACE_PACKAGE_ID = '0x113c52ac2155d7f2d98f0b99cf5587e11e38e4c1bfa323213845d4d2269408d5';
const MARKETPLACE_OBJECT_ID = '0x6d678b07f64e6e6359e750f6d65018f75485ba3d3a30bdf74c517e0afaf7bfae';


interface MarketplaceListing {
  asset_id: string;
  is_nft: boolean;
  seller: string;
  price: string;
  timestamp: string;
  metadata_uri?: string;
  name?: string;
  description?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
    image?: string;
  }


const MARKETPLACE_ID = '0x6d678b07f64e6e6359e750f6d65018f75485ba3d3a30bdf74c517e0afaf7bfae';

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>();
  const [loading, setLoading] = useState(true);

  // Add these states at the top of the Marketplace component
  const [showWallets, setShowWallets] = useState(false);
  const [pendingBuy, setPendingBuy] = useState<any>(null);
  const navigate = useNavigate();
  const [showSwap, setShowSwap] = useState(false);

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

        // After getting extractedListings, fetch metadata for each listing
        const listingsWithMetadata = await Promise.all(
          extractedListings.map(async (listing) => {
            if (listing.metadata_uri) {
              const metadata = await fetchIPFSContent(listing.metadata_uri);
              console.log(`Fetched metadata for ${listing.asset_id}:`, metadata);
              if (metadata) {
                // Also fetch the image if it's an IPFS URI
                let imageUrl = metadata.image;
                if (imageUrl?.startsWith('ipfs://')) {
                  imageUrl = `${IPFS_GATEWAY}${imageUrl.replace('ipfs://', '')}`;
                }
                return {
                  ...listing,
                  name: metadata.name,
                  description: metadata.description,
                  attributes: metadata.attributes,
                  image: imageUrl
                };
              }
            }
            return listing;
          })
        );

        setListings(listingsWithMetadata);
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

  // Filter listings by category based on metadata
  const realEstateListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'real estate';
  }) || [];

  const invoiceListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'invoice';
  }) || [];

  const commodityListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'commodity';
  }) || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div 
            className="text-2xl font-bold text-marketplace-blue cursor-pointer hover:opacity-80"
            onClick={() => navigate('/')}
          >
            Home
          </div>
          <div className="flex items-center gap-4">
            <ConnectButton />
            <button 
              onClick={() => setShowSwap(true)}
              className="px-4 py-2 bg-marketplace-blue text-white rounded-lg hover:bg-marketplace-blue/90"
            >
              Swap Tokens
            </button>
          </div>
        </div>
      </header>

      {/* Add the Swap Dialog */}
      <SwapDialog open={showSwap} onClose={() => setShowSwap(false)} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="realEstate" className="w-full">
          <TabsList className="w-[800px] mx-auto grid grid-cols-3 gap-4 mb-8 bg-transparent">
            <TabCard
              title="Real Estate"
              subtitle="Premium Properties"
              bgImage="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60"
              value="realEstate"
            />
            <TabCard
              title="Invoices"
              subtitle="Corporate Finance"
              bgImage="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=60"
              value="invoices"
            />
            <TabCard
              title="Commodities"
              subtitle="Physical Assets"
              bgImage="https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=60"
              value="commodities"
            />
          </TabsList>

          <TabsContent value="realEstate">
            <ListingsGrid listings={realEstateListings} />
          </TabsContent>
          <TabsContent value="invoices">
            <ListingsGrid listings={invoiceListings} />
          </TabsContent>
          <TabsContent value="commodities">
            <ListingsGrid listings={commodityListings} />
          </TabsContent>
        </Tabs>

        {/* Add WalletSelectDialog */}
        <WalletSelectDialog
          showWallets={showWallets}
          setShowWallets={setShowWallets}
          pendingBuy={pendingBuy}
          setPendingBuy={setPendingBuy}
          handleBuy={() => {}} // You'll need to implement this
        />
      </div>
    </div>
  );
};

// Create a reusable ListingsGrid component
interface ActiveListing extends MarketplaceListing {
  isActive?: boolean;
}

const ListingsGrid: React.FC<{ listings: MarketplaceListing[] }> = ({ listings }) => {
  // Add sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: 'price' | 'earnXP';
    direction: 'asc' | 'desc';
  } | null>(null);

  // Sort listings
  const sortedListings = React.useMemo(() => {
    if (!sortConfig) return listings;

    return [...listings].sort((a, b) => {
      if (sortConfig.key === 'price') {
        const aValue = Number(a.price);
        const bValue = Number(b.price);
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (sortConfig.key === 'earnXP') {
        const aValue = Number(a.attributes?.find(attr => attr.trait_type === 'Earn XP')?.value || 0);
        const bValue = Number(b.attributes?.find(attr => attr.trait_type === 'Earn XP')?.value || 0);
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [listings, sortConfig]);

  const requestSort = (key: 'price' | 'earnXP') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const [activeListing, setActiveListing] = useState<ActiveListing | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransaction();

  const getFirstSuiCoinId = async (address: string) => {
    const coins = await client.getCoins({ 
      owner: address, 
      coinType: '0x2::sui::SUI' 
    });
    
    // Sort coins by balance to get the one with highest balance
    const sortedCoins = coins.data.sort((a, b) => 
      Number(BigInt(b.balance) - BigInt(a.balance))
    );
    
    return sortedCoins[0]?.coinObjectId || null;
  };

  

  const handleBuy = async (assetId: string, price: number) => {
    if (!currentAccount) {
      return;
    }

    try {
      // Get a coin with sufficient balance
      const coinObjectId = await getFirstSuiCoinId(currentAccount.address);
      if (!coinObjectId) {
        console.error('No SUI coins found');
        return;
      }

      // Convert price to MIST
      const priceInMist = BigInt(Math.floor(price * 1e9));

      // Create the transaction
      const tx = new Transaction();

      // Split the coin for payment
      const [paymentCoin] = tx.splitCoins(
        tx.gas,
        [priceInMist]
      );

      // Call the buy_asset function with the payment coin
      tx.moveCall({
        target: `${MARKETPLACE_PACKAGE_ID}::marketplace::buy_asset`,
        arguments: [
          tx.object(MARKETPLACE_OBJECT_ID),
          tx.pure.id(assetId),
          paymentCoin,
        ],
      });

      // Execute the transaction
      signAndExecuteTransactionBlock(
        {
          transaction: tx,
          chain: 'sui:testnet',
          
        },
        {
          onSuccess: (result) => {
            console.log('Purchase successful:', result);
            setActiveListing(null);
          },
          onError: (error) => {
            console.error('Purchase failed:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error during purchase:', error);
    }
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveListing(null);
      }
    }

    if (activeListing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeListing]);

  return (
    <>
      <AnimatePresence>
        {activeListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeListing && (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              className="absolute top-4 right-4 bg-white rounded-full p-2"
              onClick={() => setActiveListing(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${activeListing.asset_id}-${id}`}
              ref={cardRef}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${activeListing.asset_id}-${id}`}>
                <img
                  src={activeListing.image}
                  alt={activeListing.name}
                  className="w-full h-80 object-cover"
                />
              </motion.div>

              <div className="p-6">
                <motion.h3
                  layoutId={`title-${activeListing.asset_id}-${id}`}
                  className="text-xl font-bold mb-2"
                >
                  {activeListing.name}
                </motion.h3>
                <motion.p className="text-gray-600 mb-4">
                  {activeListing.description}
                </motion.p>
                <div className="flex justify-between items-center">
                  <div className="text-marketplace-blue font-medium">
                    {Number(activeListing.price) / 1e9} SUI
                  </div>
                  <button
                    onClick={() => handleBuy(activeListing.asset_id, Number(activeListing.price) / 1e9)}
                    className="px-6 py-2 bg-marketplace-blue text-black rounded-lg"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-lg shadow">
        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-500">
          <div className="col-span-2">Assets</div>
          <div className=" flex items-center gap-1" onClick={() => requestSort('price')}>
            Price {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </div>
          <div>Category</div>
          <div>Type</div>
          <div className=" flex items-center gap-1" onClick={() => requestSort('earnXP')}>
            Earn XP {sortConfig?.key === 'earnXP' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </div>
          <div>Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y">
          {sortedListings.map((listing) => (
            <motion.div
              key={listing.asset_id}
              layoutId={`listing-${listing.asset_id}`}
              onClick={() => setActiveListing(listing)}
              className="grid grid-cols-7 gap-4 p-4 items-center hover:bg-gray-50 cursor-pointer"
            >
              <div className="col-span-2 flex items-center gap-4">
                <img
                  src={listing.image}
                  alt={listing.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{listing.name}</h3>
                  <p className="text-sm text-gray-500">#{listing.asset_id.slice(-6)}</p>
                </div>
              </div>
              <div className="text-marketplace-blue font-medium">
                {Number(listing.price).toLocaleString()} 
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{listing.attributes?.find(attr => attr.trait_type === 'Asset Type')?.value}</span>
              </div>
              <div className="text-gray-600">Asset NFT (ERC721)</div>
              <div className="text-green-600">
                Earn up to {listing.attributes?.find(attr => attr.trait_type === 'Earn XP')?.value || 0} XP
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuy(listing.asset_id, Number(listing.price) / 1e9);
                  }}
                  className="px-3 py-1.5 text-sm rounded-full font-medium bg-marketplace-blue text-white hover:bg-marketplace-blue/90"
                >
                  Buy
                </button>
                <button className="px-3 py-1.5 text-sm rounded-full font-medium bg-gray-100 hover:bg-gray-200">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      
    </>
  );
};

// Add this expanded detail component
const ExpandedDetail: React.FC<{
  listing: MarketplaceListing;
  onClose: () => void;
}> = ({ listing, onClose }) => (
  <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40"
      onClick={onClose}
    />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
      >
        <CloseIcon />
      </button>

      <div className="aspect-video w-full">
        <img
          src={listing.image}
          alt={listing.name}
          className="w-full h-full object-cover rounded-t-2xl"
        />
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{listing.name}</h2>
          <div className="text-3xl font-bold text-marketplace-blue mt-2">
            {Number(listing.price).toLocaleString()} USDC
          </div>
          <div className="text-green-600">8.5% Expected Yield</div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-600">{listing.description}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Investment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-gray-600">Minimum Investment</div>
              <div className="font-medium">1,000 USDC</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-gray-600">Lock-up Period</div>
              <div className="font-medium">12 months</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-gray-600">Distribution</div>
              <div className="font-medium">Monthly</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-gray-600">Total Supply</div>
              <div className="font-medium">100,000 Tokens</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// Update the TabCard component
const TabCard: React.FC<{
  title: string;
  subtitle: string;
  bgImage: string;
  value: string;
}> = ({ title, subtitle, bgImage, value }) => (
  <TabsTrigger 
    value={value}
    className="relative w-full h-[65px] overflow-hidden rounded-xl border-none p-0 data-[state=active]:bg-transparent shadow-lg"
  >
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/50" />
    </div>
    <div className="relative z-10 p- text-left text-white">
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-sm text-white/80">{subtitle}</p>
    </div>
  </TabsTrigger>
);

// Add the CloseIcon component
const CloseIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
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

// Update the WalletSelectDialog component
const WalletSelectDialog: React.FC<{
  showWallets: boolean;
  setShowWallets: (show: boolean) => void;
  pendingBuy: any;
  setPendingBuy: (pending: any) => void;
  handleBuy: (assetId: string, price: number) => void;
}> = ({ showWallets, setShowWallets, pendingBuy, setPendingBuy, handleBuy }) => {
  const { mutate: connectWallet } = useConnectWallet();
  const wallets = useWallets();

  return (
    <Dialog open={showWallets} onOpenChange={setShowWallets}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Select a wallet to connect before buying.</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {wallets.map((wallet) => (
            <li key={wallet.name}>
              <Button
                className="w-full"
                onClick={() => {
                  connectWallet(
                    { wallet },
                    {
                      onSuccess: () => {
                        setShowWallets(false);
                        if (pendingBuy) {
                          setTimeout(() => handleBuy(pendingBuy.assetId, pendingBuy.price), 100);
                          setPendingBuy(null);
                        }
                      },
                    }
                  );
                }}
              >
                Connect to {wallet.name}
              </Button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

// Update the SwapDialog component
const SwapDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  // Define Wormhole Connect config with proper typing
  const config: WormholeConnectConfig = {
    network: "Testnet" as const, // explicitly type as "Testnet"
    chains: ['Ethereum', 'Sui'],
    rpcs: {
      Sui: 'https://fullnode.testnet.sui.io',
      Ethereum: 'https://eth-sepolia.public.blastapi.io'
    }
  };

  const theme = {
    background: {
      default: '#ffffff'
    },
    text: {
      primary: '#000000'
    },
    button: {
      action: '#1E40AF',
      actionText: '#FFFFFF'
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Swap Tokens</DialogTitle>
          <DialogDescription>Transfer tokens across chains</DialogDescription>
        </DialogHeader>
        <div className="h-[600px] w-full">
          <WormholeConnect 
            config={config}
            theme={theme}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Marketplace;