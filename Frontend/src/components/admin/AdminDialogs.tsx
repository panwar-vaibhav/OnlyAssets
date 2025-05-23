import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomGradient, LabelInputContainer } from "@/components/ui/form-utils";
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = '0x64e58ad8ab4db950c7a556ac118003e3cae885ae2e18cf92a6b1131b3e4aba69';

interface AdminDialogsProps {
  showPauseDialog: boolean;
  setShowPauseDialog: (v: boolean) => void;
  showResumeDialog: boolean;
  setShowResumeDialog: (v: boolean) => void;
  showRegistryDialog: boolean;
  setShowRegistryDialog: (v: boolean) => void;
  showBalanceBookDialog: boolean;
  setShowBalanceBookDialog: (v: boolean) => void;
  showAddIssuerDialog: boolean;
  setShowAddIssuerDialog: (v: boolean) => void;
  showDeactivateIssuerDialog: boolean;
  setShowDeactivateIssuerDialog: (v: boolean) => void;
  showIssueCapsDialog: boolean;
  setShowIssueCapsDialog: (v: boolean) => void;
  showCheckIssuerDialog: boolean;
  setShowCheckIssuerDialog: (v: boolean) => void;
  handlePauseMarketplace: () => void;
  handleResumeMarketplace: () => void;
}

const AdminDialogs: React.FC<AdminDialogsProps> = ({
  showPauseDialog,
  setShowPauseDialog,
  showResumeDialog,
  setShowResumeDialog,
  showRegistryDialog,
  setShowRegistryDialog,
  showBalanceBookDialog,
  setShowBalanceBookDialog,
  showAddIssuerDialog,
  setShowAddIssuerDialog,
  showDeactivateIssuerDialog,
  setShowDeactivateIssuerDialog,
  showIssueCapsDialog,
  setShowIssueCapsDialog,
  showCheckIssuerDialog,
  setShowCheckIssuerDialog,
  handlePauseMarketplace,
  handleResumeMarketplace,
}) => {
  const { mutate: signAndExecuteAddIssuer } = useSignAndExecuteTransaction();
  const { mutate: signAndExecuteDeactivate } = useSignAndExecuteTransaction();
  const { mutate: signAndExecuteIssueCap } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [digest, setDigest] = useState('');

  // Add Verified Issuer
  const handleAddIssuer = (
    issuerRegistryId: string,
    issuerAddress: string,
    issuerName: string,
    metadataUri: string
  ) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::issuer_registry::add_issuer`,
      arguments: [
        tx.object(issuerRegistryId),
        tx.pure.address(issuerAddress),
        tx.pure.vector('u8', new TextEncoder().encode(issuerName)),
        tx.pure.vector('u8', new TextEncoder().encode(metadataUri) ),
      ],
    });
    signAndExecuteAddIssuer({ transaction: tx, chain: 'sui:testnet' }, {
      onSuccess: (result) => setDigest(result.digest),
    });
  };

  // Deactivate Issuer
  const handleDeactivateIssuer = (
    deactivateRegistryId: string,
    deactivateAddress: string
  ) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::issuer_registry::deactivate_issuer`,
      arguments: [
        tx.object(deactivateRegistryId),
        tx.pure.address(deactivateAddress),
      ],
    });
    signAndExecuteDeactivate({ transaction: tx, chain: 'sui:testnet' }, {
      onSuccess: (result) => setDigest(result.digest),
    });
  };

  // Issue IssuerCap
  const handleIssueCap = (
    capRegistryId: string,
    capIssuerAddress: string
  ) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::issuer_registry::issue_cap`,
      arguments: [
        tx.object(capRegistryId),
        tx.pure.address(capIssuerAddress)
      ],
    });
    signAndExecuteIssueCap({ transaction: tx, chain: 'sui:testnet' }, {
      onSuccess: (result) => setDigest(result.digest),
    });
  };

  // Check Issuer Status (read-only)
  const [checkIssuerResult, setCheckIssuerResult] = useState<string | null>(null);
  const [checkIssuerLoading, setCheckIssuerLoading] = useState(false);
  const [checkIssuerError, setCheckIssuerError] = useState<string | null>(null);

  const handleCheckIssuer = async (checkRegistryId: string, checkIssuerAddress: string) => {
    setCheckIssuerLoading(true);
    setCheckIssuerResult(null);
    setCheckIssuerError(null);
    try {
      // Use devInspectTransactionBlock with a Transaction for read-only Move view
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::issuer_registry::is_valid_issuer`,
        arguments: [
          tx.object(checkRegistryId),
          tx.pure.address(checkIssuerAddress),
        ],
      });
      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: currentAccount?.address || '',
      });
      // Parse the BCS-encoded boolean result
      const returnValues = (result as any)?.results?.[0]?.returnValues;
      let isValid = false;
      if (returnValues && returnValues.length > 0) {
        // BCS bool: 0x01 = true, 0x00 = false
        const bcsBytes = returnValues[0][0];
        isValid = bcsBytes && bcsBytes.length > 0 && bcsBytes[0] === 1;
      }
      setCheckIssuerResult(isValid ? "Valid Issuer" : "Not a Valid Issuer");
    } catch (err: any) {
      setCheckIssuerError(err?.message || "Error checking issuer status");
    } finally {
      setCheckIssuerLoading(false);
    }
  };

  // Add Verified Issuer Dialog
  const [addIssuerAddress, setAddIssuerAddress] = useState("");
  const [addIssuerName, setAddIssuerName] = useState("");
  const [addIssuerMetadataUri, setAddIssuerMetadataUri] = useState("");
  const [addIssuerRegistryId, setAddIssuerRegistryId] = useState("");

  // Deactivate Issuer Dialog
  const [deactivateAddress, setDeactivateAddress] = useState("");
  const [deactivateRegistryId, setDeactivateRegistryId] = useState("");

  // Issue Cap Dialog
  const [capIssuerAddress, setCapIssuerAddress] = useState("");
  const [capRegistryId, setCapRegistryId] = useState("");

  // Helper to trigger the ConnectButton in the header
  const triggerHeaderConnect = () => {
    // Try to find the ConnectButton in the header (should be unique)
    const headerConnectBtn = document.querySelector(
      '.admin-header-connect-btn, [data-dapp-kit-connect-button]'
    ) as HTMLElement | null;
    if (headerConnectBtn) {
      headerConnectBtn.click();
    }
  };

  return (
    <>
      {/* Pause Marketplace Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pause Marketplace</DialogTitle>
            <DialogDescription>
              Are you sure you want to pause the marketplace? This will temporarily suspend all trading activities.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handlePauseMarketplace}>
              Pause Marketplace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resume Marketplace Dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resume Marketplace</DialogTitle>
            <DialogDescription>
              Are you sure you want to resume the marketplace? This will enable all trading activities.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResumeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResumeMarketplace}>
              Resume Marketplace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Registry Replacement Dialog */}
      <Dialog open={showRegistryDialog} onOpenChange={setShowRegistryDialog}>
        <DialogContent className="sm:max-w-lg shadow-input bg-white dark:bg-black p-4 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Replace Registry</DialogTitle>
            <DialogDescription className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
              Enter the required object IDs to replace the current registry.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => e.preventDefault()}>
            <div className="space-y-4">
              <LabelInputContainer>
                <Label htmlFor="platformStateId">PlatformState Object ID</Label>
                <Input id="platformStateId" placeholder="Enter PlatformState Object ID" type="text" className="shadow-input dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="adminCapId">AdminCap Object ID</Label>
                <Input id="adminCapId" placeholder="Enter AdminCap Object ID" type="text" className="shadow-input dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="newRegistryId">New Issuer Registry Object ID</Label>
                <Input id="newRegistryId" placeholder="Enter New Issuer Registry Object ID" type="text" className="shadow-input dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <div className="mt-8">
                <button type="submit" className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]">
                  Replace Registry →
                  <BottomGradient />
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Balance Book Replacement Dialog */}
      <Dialog open={showBalanceBookDialog} onOpenChange={setShowBalanceBookDialog}>
        <DialogContent className="sm:max-w-lg shadow-input bg-white dark:bg-black p-4 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Replace Balance Book</DialogTitle>
            <DialogDescription className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
              Enter the required object IDs to replace the current balance book.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => e.preventDefault()}>
            <div className="space-y-4">
              <LabelInputContainer>
                <Label htmlFor="platformStateId2">PlatformState Object ID</Label>
                <Input id="platformStateId2" placeholder="Enter PlatformState Object ID" type="text" className="shadow-input dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="adminCapId2">AdminCap Object ID</Label>
                <Input id="adminCapId2" placeholder="Enter AdminCap Object ID" type="text" className="shadow-input dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="newBalanceBookId">New Balance Book Object ID</Label>
                <Input id="newBalanceBookId" placeholder="Enter New Balance Book Object ID" type="text" className="shadow-input dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <div className="mt-8">
                <button type="submit" className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]">
                  Replace Balance Book →
                  <BottomGradient />
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Verified Issuer Dialog */}
      <Dialog open={showAddIssuerDialog} onOpenChange={setShowAddIssuerDialog}>
        <DialogContent className="sm:max-w-lg shadow-input bg-white dark:bg-black p-4 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Add Verified Issuer</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Add a new verified issuer to the registry. Please ensure all information is accurate.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => {
            e.preventDefault();
            if (!addIssuerRegistryId || !addIssuerAddress || !addIssuerName || !addIssuerMetadataUri) return;
            if (!currentAccount) {
              triggerHeaderConnect();
              return;
            }
            handleAddIssuer(addIssuerRegistryId, addIssuerAddress, addIssuerName, addIssuerMetadataUri);
          }}>
            <div className="space-y-4">
              <LabelInputContainer>
                <Label htmlFor="issuerAddress">Issuer Address</Label>
                <Input id="issuerAddress" value={addIssuerAddress} onChange={e => setAddIssuerAddress(e.target.value)} placeholder="Enter wallet address" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="issuerName">Name</Label>
                <Input id="issuerName" value={addIssuerName} onChange={e => setAddIssuerName(e.target.value)} placeholder="Enter issuer name" type="text" className="shadow-input dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="metadataUri">Metadata URI</Label>
                <Input id="metadataUri" value={addIssuerMetadataUri} onChange={e => setAddIssuerMetadataUri(e.target.value)} placeholder="Enter IPFS/HTTP link with KYC docs" type="text" className="shadow-input dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="issuerRegistryId">IssuerRegistry Object ID</Label>
                <Input id="issuerRegistryId" value={addIssuerRegistryId} onChange={e => setAddIssuerRegistryId(e.target.value)} placeholder="Enter Registry Object ID" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              
              <div className="mt-8">
                <button type="submit" className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] hover:text-black dark:hover:text-black">
                  Add Issuer →
                  <BottomGradient />
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Issuer Dialog */}
      <Dialog open={showDeactivateIssuerDialog} onOpenChange={setShowDeactivateIssuerDialog}>
        <DialogContent className="sm:max-w-lg shadow-input bg-white dark:bg-black p-4 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Deactivate Issuer</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Deactivate a previously verified issuer. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => {
            e.preventDefault();
            if (!deactivateRegistryId || !deactivateAddress) return;
            if (!currentAccount) {
              triggerHeaderConnect();
              return;
            }
            handleDeactivateIssuer(deactivateRegistryId, deactivateAddress);
          }}>
            <div className="space-y-4">
              <LabelInputContainer>
                <Label htmlFor="deactivateAddress">Issuer Address</Label>
                <Input id="deactivateAddress" value={deactivateAddress} onChange={e => setDeactivateAddress(e.target.value)} placeholder="Enter issuer wallet address" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="deactivateRegistryId">IssuerRegistry Object ID</Label>
                <Input id="deactivateRegistryId" value={deactivateRegistryId} onChange={e => setDeactivateRegistryId(e.target.value)} placeholder="Enter Registry Object ID" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              
              <div className="mt-8">
                <button type="submit" className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-red-500 to-red-800 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]">
                  Deactivate Issuer →
                  <BottomGradient />
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Issue Caps Dialog */}
      <Dialog open={showIssueCapsDialog} onOpenChange={setShowIssueCapsDialog}>
        <DialogContent className="sm:max-w-lg shadow-input bg-white dark:bg-black p-4 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Issue Caps</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Issue new caps to an issuer. Ensure the registry ID and issuer address are correct.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => {
            e.preventDefault();
            if (!capRegistryId || !capIssuerAddress) return;
            if (!currentAccount) {
              triggerHeaderConnect();
              return;
            }
            handleIssueCap(capRegistryId, capIssuerAddress);
          }}>
            <div className="space-y-4">
              <LabelInputContainer>
                <Label htmlFor="capIssuerAddress">Issuer Address</Label>
                <Input id="capIssuerAddress" value={capIssuerAddress} onChange={e => setCapIssuerAddress(e.target.value)} placeholder="Enter wallet address" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="capRegistryId">IssuerRegistry Object ID</Label>
                <Input id="capRegistryId" value={capRegistryId} onChange={e => setCapRegistryId(e.target.value)} placeholder="Enter Registry Object ID" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              
              <div className="mt-8">
                <button type="submit" className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]">
                  Issue Cap →
                  <BottomGradient />
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Check Issuer Status Dialog */}
      <Dialog open={showCheckIssuerDialog} onOpenChange={setShowCheckIssuerDialog}>
        <DialogContent className="sm:max-w-lg shadow-input bg-white dark:bg-black p-4 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Check Issuer Status</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Check if an address is a valid issuer in the registry.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={async e => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const registryId = (form.elements.namedItem("checkRegistryId") as HTMLInputElement).value.trim();
            const issuerAddress = (form.elements.namedItem("checkIssuerAddress") as HTMLInputElement).value.trim();
            if (!registryId || !issuerAddress) {
              setCheckIssuerError("Both fields are required.");
              return;
            }
            if (!currentAccount) {
              triggerHeaderConnect();
              return;
            }
            await handleCheckIssuer(registryId, issuerAddress);
          }}>
            <div className="space-y-4">
              <LabelInputContainer>
                <Label htmlFor="checkIssuerAddress">Issuer Address</Label>
                <Input id="checkIssuerAddress" name="checkIssuerAddress" placeholder="Enter issuer wallet address" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="checkRegistryId">IssuerRegistry Object ID</Label>
                <Input id="checkRegistryId" name="checkRegistryId" placeholder="Enter Registry Object ID" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
              </LabelInputContainer>
              <div className="mt-8">
                <button type="submit" className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-blue-500 to-blue-800 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]">
                  {checkIssuerLoading ? "Checking..." : "Check Issuer Status →"}
                  <BottomGradient />
                </button>
              </div>
              {checkIssuerResult && (
                <div className="mt-4 text-green-600 dark:text-green-400 font-semibold">{checkIssuerResult}</div>
              )}
              {checkIssuerError && (
                <div className="mt-4 text-red-600 dark:text-red-400 font-semibold">{checkIssuerError}</div>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminDialogs;
