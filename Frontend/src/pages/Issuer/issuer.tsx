import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BottomGradient, LabelInputContainer } from '@/components/ui/form-utils';
import { BackgroundLines } from "@/components/ui/background-lines";
import Header from '@/components/Header';

const assetTypes = [
  'Real Estate',
  'Invoice',
  'Commodity',
];

const Issuer: React.FC = () => {
  const [showNFTDialog, setShowNFTDialog] = useState(false);
  const [showFTDialog, setShowFTDialog] = useState(false);

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

  // Handlers for NFT mint
  const handleMintNFT = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call Sui contract for mint_asset_nft
    setShowNFTDialog(false);
  };

  // Handlers for FT mint
  const handleMintFT = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call Sui contract for mint_asset_ft
    setShowFTDialog(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <Header />
        </div>
      </nav>
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 min-h-screen">
        <div className="relative z-10 w-full flex flex-col items-center">
          <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 font-bold tracking-tight">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500">
              Issuer Dashboard
            </span>
          </h2>
          <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
            Manage and issue your RWA tokens, track performance, and handle distributions.
          </p>
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            <Button className="px-8 py-3 text-lg font-semibold bg-marketplace-blue text-white rounded-lg shadow hover:bg-marketplace-blue/90" onClick={() => setShowNFTDialog(true)}>
              Mint Non fungible Asset
            </Button>
            <Button className="px-8 py-3 text-lg font-semibold bg-marketplace-blue text-white rounded-lg shadow hover:bg-marketplace-blue/90" onClick={() => setShowFTDialog(true)}>
              Mint Fungible Asset
            </Button>
          </div>

          {/* NFT Mint Dialog */}
          <Dialog open={showNFTDialog} onOpenChange={setShowNFTDialog}>
            <DialogContent className="sm:max-w-lg shadow-input bg-white dark:bg-black p-4 md:p-8">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Mint Real-World Asset NFT</DialogTitle>
                <DialogDescription>Fill in the details to mint a new RWA NFT.</DialogDescription>
              </DialogHeader>
              <form className="my-6 space-y-4" onSubmit={handleMintNFT}>
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
                  <Button type="button" variant="outline" onClick={() => setShowNFTDialog(false)}>Cancel</Button>
                  <Button type="submit" className="bg-marketplace-blue text-white hover:bg-marketplace-blue/90">Mint NFT</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* FT Mint Dialog */}
          <Dialog open={showFTDialog} onOpenChange={setShowFTDialog}>
            <DialogContent className="sm:max-w-lg shadow-input bg-white dark:bg-black p-4 md:p-8">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Mint Real-World Asset Fungible Token</DialogTitle>
                <DialogDescription>Fill in the details to mint a new RWA Fungible Token.</DialogDescription>
              </DialogHeader>
              <form className="my-6 space-y-4" onSubmit={handleMintFT}>
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
                  <Button type="button" variant="outline" onClick={() => setShowFTDialog(false)}>Cancel</Button>
                  <Button type="submit" className="bg-marketplace-blue text-white hover:bg-marketplace-blue/90">Mint FT</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </BackgroundLines>
    </div>
  );
};

export default Issuer;