
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BuyModalProps {
  asset: {
    id: string;
    title: string;
    price: string;
    tokenSymbol: string;
  };
  onClose: () => void;
}

const BuyModal: React.FC<BuyModalProps> = ({ asset, onClose }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [amount, setAmount] = useState("1");
  const [processing, setProcessing] = useState(false);

  const handleConnectWallet = () => {
    // Mock wallet connection
    setProcessing(true);
    
    setTimeout(() => {
      setWalletConnected(true);
      setProcessing(false);
    }, 1000);
  };

  const handleBuy = () => {
    // Mock purchase
    setProcessing(true);
    
    setTimeout(() => {
      setProcessing(false);
      onClose();
    }, 2000);
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{walletConnected ? "Purchase Token" : "Connect Wallet"}</DialogTitle>
          <DialogDescription>
            {walletConnected 
              ? `Purchase ${asset.tokenSymbol} tokens for ${asset.title}`
              : "Connect your wallet to continue with the purchase"
            }
          </DialogDescription>
        </DialogHeader>

        {!walletConnected ? (
          <div className="grid gap-4 py-4">
            <p className="text-sm text-gray-600 mb-2">
              Select a wallet provider to connect and proceed with your purchase
            </p>
            <Button
              onClick={handleConnectWallet}
              className="bg-marketplace-blue hover:bg-marketplace-blue/90 text-white"
              disabled={processing}
            >
              {processing ? "Connecting..." : "Connect with Rainbow Kit"}
            </Button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">Available Wallets</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" disabled={processing}>MetaMask</Button>
              <Button variant="outline" disabled={processing}>WalletConnect</Button>
              <Button variant="outline" disabled={processing}>Coinbase</Button>
              <Button variant="outline" disabled={processing}>Trust Wallet</Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="token" className="text-right">
                Token
              </Label>
              <div className="col-span-3">
                <span className="text-sm font-medium">{asset.tokenSymbol}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <div className="col-span-3">
                <span className="text-sm font-medium">{asset.price}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                defaultValue="1"
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                type="number"
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total" className="text-right">
                Total
              </Label>
              <div className="col-span-3">
                <span className="text-sm font-medium">
                  {parseInt(amount) > 0
                    ? `${parseInt(amount)} × ${asset.price.split(' ')[0]} = ${parseInt(amount) * parseInt(asset.price.replace(/\D/g, ""))} USDC`
                    : "0 USDC"}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {walletConnected ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={processing}>
                Cancel
              </Button>
              <Button 
                className="bg-marketplace-blue hover:bg-marketplace-blue/90 text-white"
                onClick={handleBuy}
                disabled={processing || parseInt(amount) <= 0}
              >
                {processing ? "Processing..." : "Buy Now"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose} disabled={processing}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BuyModal;
