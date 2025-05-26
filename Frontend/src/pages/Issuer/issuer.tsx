import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LabelInputContainer } from '@/components/ui/form-utils';
import { BackgroundLines } from "@/components/ui/background-lines";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconMessage, IconUser } from "@tabler/icons-react";
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useConnectWallet, useWallets } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Link } from 'react-router-dom';

const assetTypes = [
  'Real Estate',
  'Invoice',
  'Commodity',
];

const RWA_ASSET_PACKAGE_ID = '0xf62c99a340ecd1ae3faf18133f007ee1a391335202291394d3fab96957ca6d1c';
const MARKETPLACE_PACKAGE_ID = '0xf3523d1917b7e6bbae4b8ccfdfcf091f6759eb2a29b5a01480f029fca16e7dbf';

const navItems = [
  {
    name: "Home",
    link: "/",
    icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
  },
  {
    name: "About",
    link: "/about",
    icon: <IconUser className="h-4 w-4 text-neutral-500 dark:text-white" />,
  },
  {
    name: "Tokenize your asset",
    link: "/issuer",
    icon: <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />,
  },
];

const Issuer: React.FC = () => {
  const [showNFTDialog, setShowNFTDialog] = useState(false);
  const [showFTDialog, setShowFTDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);

  // NFT form state
  const [nftCap, setNftCap] = useState('');
  const [nftMetadataUri, setNftMetadataUri] = useState('');
  const [nftAssetType, setNftAssetType] = useState(0);
  const [nftValuation, setNftValuation] = useState('');
  const [nftHasMaturity, setNftHasMaturity] = useState(false);
  const [nftMaturity, setNftMaturity] = useState('');
  const [nftHasApy, setNftHasApy] = useState(false);
  const [nftApy, setNftApy] = useState('');
  const [nftRegistry, setNftRegistry] = useState('');

  // FT form state
  const [ftCap, setFtCap] = useState('');
  const [ftMetadataUri, setFtMetadataUri] = useState('');
  const [ftAssetType, setFtAssetType] = useState(0);
  const [ftTotalSupply, setFtTotalSupply] = useState('');
  const [ftRegistry, setFtRegistry] = useState('');

  // List Asset form state
  const [listType, setListType] = useState<'nft' | 'ft'>('nft');
  const [listMarketplace, setListMarketplace] = useState('');
  const [listRegistry, setListRegistry] = useState('');
  const [listAssetId, setListAssetId] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [listClock, setListClock] = useState('');

  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteMintNFT } = useSignAndExecuteTransaction();
  const { mutate: signAndExecuteMintFT } = useSignAndExecuteTransaction();
  const { mutate: connectWallet } = useConnectWallet();
  const { mutate: signAndExecuteList } = useSignAndExecuteTransaction();
  const wallets = useWallets();
  const [showWallets, setShowWallets] = useState(false);
  const [pendingMint, setPendingMint] = useState<'nft' | 'ft' | null>(null);

  // Helper to trigger the ConnectButton in the header
  const triggerHeaderConnect = () => {
    const headerConnectBtn = document.querySelector(
      '.admin-header-connect-btn, [data-dapp-kit-connect-button]'
    ) as HTMLElement | null;
    if (headerConnectBtn) {
      headerConnectBtn.click();
    }
  };

  // Helper to connect wallet, then mint
  const ensureWalletAndMint = async (mintType: 'nft' | 'ft', mintFn: () => void) => {
    if (!currentAccount) {
      setPendingMint(mintType);
      setShowWallets(true);
      return;
    }
    mintFn();
  };

  // Handlers for NFT mint
  const handleMintNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nftCap || !nftMetadataUri || nftAssetType === undefined || !nftValuation || !nftRegistry) return;
    await ensureWalletAndMint('nft', () => {
      const tx = new Transaction();
      tx.moveCall({
        target: `${RWA_ASSET_PACKAGE_ID}::rwaasset::mint_asset_nft`,
        arguments: [
          tx.object(nftCap),
          tx.pure.vector('u8', new TextEncoder().encode(nftMetadataUri)),
          tx.pure.u8(Number(nftAssetType)),
          tx.pure.u64(nftValuation),
          tx.pure.bool(nftHasMaturity),
          tx.pure.u64(nftHasMaturity ? Number(nftMaturity) : 0),
          tx.pure.bool(nftHasApy),
          tx.pure.u64(nftHasApy ? Number(nftApy) : 0),
          tx.object(nftRegistry),
        ],
      });
      signAndExecuteMintNFT({ transaction: tx, chain: 'sui:testnet' });
      setShowNFTDialog(false);
    });
  };

  // Handlers for FT mint
  const handleMintFT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ftCap || !ftMetadataUri || ftAssetType === undefined || !ftTotalSupply || !ftRegistry) return;
    await ensureWalletAndMint('ft', () => {
      const tx = new Transaction();
      tx.moveCall({
        target: `${RWA_ASSET_PACKAGE_ID}::rwaasset::mint_asset_ft`,
        arguments: [
          tx.object(ftCap),
          tx.pure.vector('u8', new TextEncoder().encode(ftMetadataUri)),
          tx.pure.u8(Number(ftAssetType)),
          tx.pure.u64(ftTotalSupply),
          tx.object(ftRegistry),
        ],
      });
      signAndExecuteMintFT({ transaction: tx, chain: 'sui:testnet' });
      setShowFTDialog(false);
    });
  };

  // Handler for listing asset
  const handleListAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listMarketplace || !listRegistry || !listAssetId || !listPrice || !listClock) return;
    const tx = new Transaction();
    if (listType === 'nft') {
      tx.moveCall({
        target: `${MARKETPLACE_PACKAGE_ID}::marketplace::list_asset_nft`,
        arguments: [
          tx.object(listMarketplace),
          tx.object(listRegistry),
          tx.object(listAssetId),
          tx.pure.u64(listPrice),
          tx.object(listClock),
        ],
      });
    } else {
      tx.moveCall({
        target: `${MARKETPLACE_PACKAGE_ID}::marketplace::list_asset_ft`,
        arguments: [
          tx.object(listMarketplace),
          tx.object(listRegistry),
          tx.object(listAssetId),
          tx.pure.u64(listPrice),
          tx.object(listClock),
        ],
      });
    }
    signAndExecuteList({ transaction: tx, chain: 'sui:testnet' });
    setShowListDialog(false);
  };

  const { mutate: signAndExecuteMint } = useSignAndExecuteTransaction();

  // Wallet selection dialog
  const WalletSelectDialog = () => (
    <Dialog open={showWallets} onOpenChange={setShowWallets}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Select a wallet to connect before minting.</DialogDescription>
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
                        if (pendingMint === 'nft') {
                          setTimeout(() => handleMintNFT(new Event('submit') as any), 100);
                        } else if (pendingMint === 'ft') {
                          setTimeout(() => handleMintFT(new Event('submit') as any), 100);
                        }
                        setPendingMint(null);
                      },
                    }
                  );
                }}
              >
                Connect to Sui wallet
              </Button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );

  if (!currentAccount) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <ConnectButton className="mb-6" />
        <div className="text-lg text-white/80 font-semibold mt-4">Please connect your wallet</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header: match About page, always visible on refresh */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <FloatingNav navItems={navItems} />
        </div>
      </nav>
      <main className="w-full">
        <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 min-h-screen pt-32">
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Move Welcome text to top */}
            <div className="w-full max-w-3xl rounded-2xl border border-neutral-200/30 dark:border-neutral-800 bg-white/80 dark:bg-black/80 shadow-xl p-8 mb-12">
              <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 font-bold tracking-tight mb-8">
                Welcome to{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500">
                  Issuer Dashboard
                </span>
              </h2>
              <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center mb-8">
                Manage and issue your RWA tokens, track performance, and handle distributions.
              </p>
              {/* Mint buttons vertical, styled like admin dashboard */}
              <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl mx-auto mb-4 justify-center">
                <div className="flex flex-col gap-4 w-full max-w-xs">
                  <Button className="h-12 w-full text-lg font-semibold bg-marketplace-blue text-white rounded-lg shadow hover:bg-marketplace-blue/90 transition-all" onClick={() => setShowNFTDialog(true)}>
                    Mint Non fungible Asset
                  </Button>
                  <Button className="h-12 w-full text-lg font-semibold bg-marketplace-blue text-white rounded-lg shadow hover:bg-marketplace-blue/90 transition-all" onClick={() => setShowFTDialog(true)}>
                    Mint Fungible Asset
                  </Button>
                </div>
                {/* List Asset Section */}
                <div className="flex flex-col items-center justify-center w-full max-w-xs">
                  <div className="text-center text-base font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Already minted your asset?</div>
                  <Button className="h-12 w-full text-lg font-semibold bg-marketplace-blue text-white rounded-lg shadow hover:bg-marketplace-blue/90 transition-all" onClick={() => setShowListDialog(true)}>
                    List Asset to Market
                  </Button>
                </div>
              </div>
            </div>

            {/* NFT Mint Dialog */}
            <Dialog open={showNFTDialog} onOpenChange={setShowNFTDialog}>
              <DialogContent className="sm:max-w-lg rounded-2xl border border-neutral-200/30 dark:border-neutral-800 bg-white/90 dark:bg-black/90 shadow-2xl p-6 md:p-10">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Mint Real-World Asset NFT</DialogTitle>
                  <DialogDescription className="text-base text-neutral-600 dark:text-neutral-300 mb-4">Fill in the details to mint a new RWA NFT.</DialogDescription>
                </DialogHeader>
                <form className="my-6 space-y-5" onSubmit={handleMintNFT}>
                  <LabelInputContainer>
                    <Label htmlFor="nftCap">IssuerCap Object ID</Label>
                    <Input id="nftCap" value={nftCap} onChange={e => setNftCap(e.target.value)} placeholder="Enter IssuerCap Object ID" type="text" className="shadow-input font-mono text-sm" />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="nftMetadataUri">Metadata URI</Label>
                    <Input id="nftMetadataUri" value={nftMetadataUri} onChange={e => setNftMetadataUri(e.target.value)} placeholder="Enter IPFS/HTTP link" type="text" className="shadow-input" />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="nftAssetType">Asset Type</Label>
                    <select id="nftAssetType" value={nftAssetType} onChange={e => setNftAssetType(Number(e.target.value))} className="shadow-input rounded-md px-3 py-2">
                      {assetTypes.map((type, idx) => (
                        <option key={type} value={idx}>{type}</option>
                      ))}
                    </select>
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="nftValuation">Valuation (u64)</Label>
                    <Input id="nftValuation" value={nftValuation} onChange={e => setNftValuation(e.target.value)} placeholder="Enter asset valuation" type="number" className="shadow-input" />
                  </LabelInputContainer>
                  <div className="flex items-center gap-2">
                    <input id="nftHasMaturity" type="checkbox" checked={nftHasMaturity} onChange={e => setNftHasMaturity(e.target.checked)} />
                    <Label htmlFor="nftHasMaturity">Has Maturity?</Label>
                  </div>
                  {nftHasMaturity && (
                    <LabelInputContainer>
                      <Label htmlFor="nftMaturity">Maturity (u64)</Label>
                      <Input id="nftMaturity" value={nftMaturity} onChange={e => setNftMaturity(e.target.value)} placeholder="Enter maturity value" type="number" className="shadow-input" />
                    </LabelInputContainer>
                  )}
                  <div className="flex items-center gap-2">
                    <input id="nftHasApy" type="checkbox" checked={nftHasApy} onChange={e => setNftHasApy(e.target.checked)} />
                    <Label htmlFor="nftHasApy">Has APY?</Label>
                  </div>
                  {nftHasApy && (
                    <LabelInputContainer>
                      <Label htmlFor="nftApy">APY (u64)</Label>
                      <Input id="nftApy" value={nftApy} onChange={e => setNftApy(e.target.value)} placeholder="Enter APY value" type="number" className="shadow-input" />
                    </LabelInputContainer>
                  )}
                  <LabelInputContainer>
                    <Label htmlFor="nftRegistry">IssuerRegistry Object ID</Label>
                    <Input id="nftRegistry" value={nftRegistry} onChange={e => setNftRegistry(e.target.value)} placeholder="Enter IssuerRegistry Object ID" type="text" className="shadow-input font-mono text-sm" />
                  </LabelInputContainer>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowNFTDialog(false)} className="rounded-md">Cancel</Button>
                    <Button type="submit" className="bg-marketplace-blue text-white hover:bg-marketplace-blue/90 rounded-md">Mint NFT</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* FT Mint Dialog */}
            <Dialog open={showFTDialog} onOpenChange={setShowFTDialog}>
              <DialogContent className="sm:max-w-lg rounded-2xl border border-neutral-200/30 dark:border-neutral-800 bg-white/90 dark:bg-black/90 shadow-2xl p-6 md:p-10">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Mint Real-World Asset Fungible Token</DialogTitle>
                  <DialogDescription className="text-base text-neutral-600 dark:text-neutral-300 mb-4">Fill in the details to mint a new RWA Fungible Token.</DialogDescription>
                </DialogHeader>
                <form className="my-6 space-y-5" onSubmit={handleMintFT}>
                  <LabelInputContainer>
                    <Label htmlFor="ftCap">IssuerCap Object ID</Label>
                    <Input id="ftCap" value={ftCap} onChange={e => setFtCap(e.target.value)} placeholder="Enter IssuerCap Object ID" type="text" className="shadow-input font-mono text-sm" />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="ftMetadataUri">Metadata URI</Label>
                    <Input id="ftMetadataUri" value={ftMetadataUri} onChange={e => setFtMetadataUri(e.target.value)} placeholder="Enter IPFS/HTTP link" type="text" className="shadow-input" />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="ftAssetType">Asset Type</Label>
                    <select id="ftAssetType" value={ftAssetType} onChange={e => setFtAssetType(Number(e.target.value))} className="shadow-input rounded-md px-3 py-2">
                      {assetTypes.map((type, idx) => (
                        <option key={type} value={idx}>{type}</option>
                      ))}
                    </select>
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="ftTotalSupply">Total Supply (u64)</Label>
                    <Input id="ftTotalSupply" value={ftTotalSupply} onChange={e => setFtTotalSupply(e.target.value)} placeholder="Enter total supply" type="number" className="shadow-input" />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="ftRegistry">IssuerRegistry Object ID</Label>
                    <Input id="ftRegistry" value={ftRegistry} onChange={e => setFtRegistry(e.target.value)} placeholder="Enter IssuerRegistry Object ID" type="text" className="shadow-input font-mono text-sm" />
                  </LabelInputContainer>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowFTDialog(false)} className="rounded-md">Cancel</Button>
                    <Button type="submit" className="bg-marketplace-blue text-white hover:bg-marketplace-blue/90 rounded-md">Mint FT</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* List Asset Dialog */}
            <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
              <DialogContent className="sm:max-w-lg rounded-2xl border border-neutral-200/30 dark:border-neutral-800 bg-white/90 dark:bg-black/90 shadow-2xl p-6 md:p-10">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">List Asset to Marketplace</DialogTitle>
                  <DialogDescription className="text-base text-neutral-600 dark:text-neutral-300 mb-4">Fill in the details to list your asset (NFT or FT) on the marketplace.</DialogDescription>
                </DialogHeader>
                <form className="my-6 space-y-5" onSubmit={handleListAsset}>
                  <LabelInputContainer>
                    <Label htmlFor="listType">Asset Type</Label>
                    <select id="listType" value={listType} onChange={e => setListType(e.target.value as 'nft' | 'ft')} className="shadow-input rounded-md px-3 py-2">
                      <option value="nft">NFT</option>
                      <option value="ft">Fungible Token</option>
                    </select>
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="listMarketplace">Marketplace Object ID</Label>
                    <Input id="listMarketplace" value={listMarketplace} onChange={e => setListMarketplace(e.target.value)} placeholder="Enter Marketplace Object ID" type="text" className="shadow-input font-mono text-sm" />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="listRegistry">IssuerRegistry Object ID</Label>
                    <Input id="listRegistry" value={listRegistry} onChange={e => setListRegistry(e.target.value)} placeholder="Enter IssuerRegistry Object ID" type="text" className="shadow-input font-mono text-sm" />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="listAssetId">Asset Object ID</Label>
                    <Input id="listAssetId" value={listAssetId} onChange={e => setListAssetId(e.target.value)} placeholder="Enter Asset NFT/FT Object ID" type="text" className="shadow-input font-mono text-sm" />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="listPrice">Price (u64)</Label>
                    <Input id="listPrice" value={listPrice} onChange={e => setListPrice(e.target.value)} placeholder="Enter listing price" type="number" className="shadow-input" />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="listClock">Clock Object ID</Label>
                    <Input id="listClock" value={listClock} onChange={e => setListClock(e.target.value)} placeholder="Enter Clock Object ID" type="text" className="shadow-input font-mono text-sm" />
                  </LabelInputContainer>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowListDialog(false)} className="rounded-md">Cancel</Button>
                    <Button type="submit" className="bg-green-600 text-white hover:bg-green-700 rounded-md">List Asset</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <WalletSelectDialog />
          </div>
        </BackgroundLines>
      </main>
    </div>
  );
};

export default Issuer;