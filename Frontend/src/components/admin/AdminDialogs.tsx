import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomGradient, LabelInputContainer } from "@/components/ui/form-utils";
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = '0x229c1e2dbe5490188769620bdd3abfd5b593491d97d93ed16d49d505039dc1aa';
const PACKAGE_ID_admin = '0x4834efbf750e8215714738f047a940dcb330431c61d95d5c544975ca97157d77';

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
  showGetRegistryDialog: boolean;
  setShowGetRegistryDialog: (v: boolean) => void;
  showGetBalanceBookDialog: boolean;
  setShowGetBalanceBookDialog: (v: boolean) => void;
  showIsPausedDialog: boolean;
  setShowIsPausedDialog: (v: boolean) => void;
  showAdminAddressDialog: boolean;
  setShowAdminAddressDialog: (v: boolean) => void;
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
  showGetRegistryDialog,
  setShowGetRegistryDialog,
  showGetBalanceBookDialog,
  setShowGetBalanceBookDialog,
  showIsPausedDialog,
  setShowIsPausedDialog,
  showAdminAddressDialog,
  setShowAdminAddressDialog,
}) => {
  const { mutate: signAndExecuteAddIssuer } = useSignAndExecuteTransaction();
  const { mutate: signAndExecuteDeactivate } = useSignAndExecuteTransaction();
  const { mutate: signAndExecuteIssueCap } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [digest, setDigest] = useState('');

  // --- New Admin State for Dialogs ---
  const [adminCapId, setAdminCapId] = useState("");
  const [platformStateId, setPlatformStateId] = useState("");
  const [pauseError, setPauseError] = useState<string | null>(null);
  const [unpauseError, setUnpauseError] = useState<string | null>(null);
  const [newRegistryResult, setNewRegistryResult] = useState<string | null>(null);
  const [newBalanceBookResult, setNewBalanceBookResult] = useState<string | null>(null);
  const [getRegistryResult, setGetRegistryResult] = useState<string | null>(null);
  const [getBalanceBookResult, setGetBalanceBookResult] = useState<string | null>(null);
  const [isPausedResult, setIsPausedResult] = useState<string | null>(null);
  const [adminAddressResult, setAdminAddressResult] = useState<string | null>(null);
  const { mutate: signAndExecuteAdmin } = useSignAndExecuteTransaction();

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

  // --- Handlers for new admin contract functions ---
  const handlePausePlatform = () => {
    setPauseError(null);
    if (!adminCapId || !platformStateId) return setPauseError("AdminCap and PlatformState IDs required");
    if (!currentAccount) { triggerHeaderConnect(); return; }
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID_admin}::admin::pause_platform`,
      arguments: [tx.object(adminCapId), tx.object(platformStateId), tx.object(currentAccount.address)],
    });
    signAndExecuteAdmin({ transaction: tx, chain: 'sui:testnet' }, {
      onSuccess: (result) => setDigest(result.digest),
      onError: (err) => setPauseError(err?.message || 'Pause failed'),
    });
  };

  const handleUnpausePlatform = () => {
    setUnpauseError(null);
    if (!adminCapId || !platformStateId) return setUnpauseError("AdminCap and PlatformState IDs required");
    if (!currentAccount) { triggerHeaderConnect(); return; }
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID_admin}::admin::unpause_platform`,
      arguments: [tx.object(adminCapId), tx.object(platformStateId), tx.object(currentAccount.address)],
    });
    signAndExecuteAdmin({ transaction: tx, chain: 'sui:testnet' }, {
      onSuccess: (result) => setDigest(result.digest),
      onError: (err) => setUnpauseError(err?.message || 'Unpause failed'),
    });
  };

  const handleNewRegistry = () => {
    setNewRegistryResult(null);
    if (!currentAccount) { triggerHeaderConnect(); return; }
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID_admin}::admin::new_registry`,
      arguments: [tx.object(currentAccount.address)],
    });
    signAndExecuteAdmin({ transaction: tx, chain: 'sui:testnet' }, {
      onSuccess: (result) => setNewRegistryResult('New registry created! Tx: ' + result.digest),
      onError: (err) => setNewRegistryResult('Error: ' + (err?.message || 'Failed')),
    });
  };

  const handleNewBalanceBook = () => {
    setNewBalanceBookResult(null);
    if (!currentAccount) { triggerHeaderConnect(); return; }
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID_admin}::admin::new_balance_book`,
      arguments: [tx.object(currentAccount.address)],
    });
    signAndExecuteAdmin({ transaction: tx, chain: 'sui:testnet' }, {
      onSuccess: (result) => setNewBalanceBookResult('New balance book created! Tx: ' + result.digest),
      onError: (err) => setNewBalanceBookResult('Error: ' + (err?.message || 'Failed')),
    });
  };

  const handleGetRegistry = async () => {
    setGetRegistryResult(null);
    if (!platformStateId) return setGetRegistryResult('PlatformState ID required');
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID_admin}::admin::get_registry`,
        arguments: [tx.object(platformStateId)],
      });
      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: currentAccount?.address || '',
      });
      const returnValues = (result as any)?.results?.[0]?.returnValues;
      let registryId = '';
      if (returnValues && returnValues.length > 0) {
        registryId = (returnValues[0][0] as string);
      }
      setGetRegistryResult(registryId ? `Registry ID: ${registryId}` : 'No registry found');
    } catch (err: any) {
      setGetRegistryResult('Error: ' + (err?.message || 'Failed'));
    }
  };

  const handleGetBalanceBook = async () => {
    setGetBalanceBookResult(null);
    if (!platformStateId) return setGetBalanceBookResult('PlatformState ID required');
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID_admin}::admin::get_balance_book`,
        arguments: [tx.object(platformStateId)],
      });
      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: currentAccount?.address || '',
      });
      const returnValues = (result as any)?.results?.[0]?.returnValues;
      let bookId = '';
      if (returnValues && returnValues.length > 0) {
        bookId = (returnValues[0][0] as string);
      }
      setGetBalanceBookResult(bookId ? `Balance Book ID: ${bookId}` : 'No balance book found');
    } catch (err: any) {
      setGetBalanceBookResult('Error: ' + (err?.message || 'Failed'));
    }
  };

  const handleIsPaused = async () => {
    setIsPausedResult(null);
    if (!platformStateId) return setIsPausedResult('PlatformState ID required');
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID_admin}::admin::is_paused`,
        arguments: [tx.object(platformStateId)],
      });
      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: currentAccount?.address || '',
      });
      const returnValues = (result as any)?.results?.[0]?.returnValues;
      let isPaused = false;
      if (returnValues && returnValues.length > 0) {
        const bcsBytes = returnValues[0][0];
        isPaused = bcsBytes && bcsBytes.length > 0 && bcsBytes[0] === 1;
      }
      setIsPausedResult(isPaused ? 'Platform is paused' : 'Platform is active');
    } catch (err: any) {
      setIsPausedResult('Error: ' + (err?.message || 'Failed'));
    }
  };

  const handleAdminAddress = async () => {
    setAdminAddressResult(null);
    if (!adminCapId) return setAdminAddressResult('AdminCap ID required');
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID_admin}::admin::admin_address`,
        arguments: [tx.object(adminCapId)],
      });
      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: currentAccount?.address || '',
      });
      const returnValues = (result as any)?.results?.[0]?.returnValues;
      let adminAddr = '';
      if (returnValues && returnValues.length > 0) {
        adminAddr = (returnValues[0][0] as string);
      }
      setAdminAddressResult(adminAddr ? `Admin Address: ${adminAddr}` : 'No admin address found');
    } catch (err: any) {
      setAdminAddressResult('Error: ' + (err?.message || 'Failed'));
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
              Pause all marketplace and minting operations. Requires AdminCap and PlatformState IDs.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => { e.preventDefault(); handlePausePlatform(); }}>
            <LabelInputContainer>
              <Label htmlFor="adminCapId">AdminCap Object ID</Label>
              <Input id="adminCapId" value={adminCapId} onChange={e => setAdminCapId(e.target.value)} placeholder="Enter AdminCap Object ID" type="text" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="platformStateId">PlatformState Object ID</Label>
              <Input id="platformStateId" value={platformStateId} onChange={e => setPlatformStateId(e.target.value)} placeholder="Enter PlatformState Object ID" type="text" />
            </LabelInputContainer>
            {pauseError && <div className="text-red-600 mt-2">{pauseError}</div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPauseDialog(false)}>Cancel</Button>
              <Button variant="destructive" type="submit">Pause Platform</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resume Marketplace Dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unpause Marketplace</DialogTitle>
            <DialogDescription>
              Resume all marketplace and minting operations. Requires AdminCap and PlatformState IDs.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => { e.preventDefault(); handleUnpausePlatform(); }}>
            <LabelInputContainer>
              <Label htmlFor="adminCapId2">AdminCap Object ID</Label>
              <Input id="adminCapId2" value={adminCapId} onChange={e => setAdminCapId(e.target.value)} placeholder="Enter AdminCap Object ID" type="text" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="platformStateId2">PlatformState Object ID</Label>
              <Input id="platformStateId2" value={platformStateId} onChange={e => setPlatformStateId(e.target.value)} placeholder="Enter PlatformState Object ID" type="text" />
            </LabelInputContainer>
            {unpauseError && <div className="text-red-600 mt-2">{unpauseError}</div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResumeDialog(false)}>Cancel</Button>
              <Button type="submit">Unpause Platform</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Registry Replacement Dialog */}
      <Dialog open={showRegistryDialog} onOpenChange={setShowRegistryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Issuer Registry</DialogTitle>
            <DialogDescription>
              Create a new Issuer Registry. No input required.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => { e.preventDefault(); handleNewRegistry(); }}>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegistryDialog(false)}>Cancel</Button>
              <Button type="submit">Create Registry</Button>
            </DialogFooter>
            {newRegistryResult && <div className="text-green-600 mt-2">{newRegistryResult}</div>}
          </form>
        </DialogContent>
      </Dialog>

      {/* Balance Book Replacement Dialog */}
      <Dialog open={showBalanceBookDialog} onOpenChange={setShowBalanceBookDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Balance Book</DialogTitle>
            <DialogDescription>
              Create a new Balance Book. No input required.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => { e.preventDefault(); handleNewBalanceBook(); }}>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBalanceBookDialog(false)}>Cancel</Button>
              <Button type="submit">Create Balance Book</Button>
            </DialogFooter>
            {newBalanceBookResult && <div className="text-green-600 mt-2">{newBalanceBookResult}</div>}
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

      {/* --- New Admin Dialogs --- */}
      {/* Pause Platform Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pause Platform</DialogTitle>
            <DialogDescription>
              Pause all marketplace and minting operations. Requires AdminCap and PlatformState IDs.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => { e.preventDefault(); handlePausePlatform(); }}>
            <LabelInputContainer>
              <Label htmlFor="adminCapId">AdminCap Object ID</Label>
              <Input id="adminCapId" value={adminCapId} onChange={e => setAdminCapId(e.target.value)} placeholder="Enter AdminCap Object ID" type="text" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="platformStateId">PlatformState Object ID</Label>
              <Input id="platformStateId" value={platformStateId} onChange={e => setPlatformStateId(e.target.value)} placeholder="Enter PlatformState Object ID" type="text" />
            </LabelInputContainer>
            {pauseError && <div className="text-red-600 mt-2">{pauseError}</div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPauseDialog(false)}>Cancel</Button>
              <Button variant="destructive" type="submit">Pause Platform</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unpause Platform Dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unpause Platform</DialogTitle>
            <DialogDescription>
              Resume all marketplace and minting operations. Requires AdminCap and PlatformState IDs.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => { e.preventDefault(); handleUnpausePlatform(); }}>
            <LabelInputContainer>
              <Label htmlFor="adminCapId2">AdminCap Object ID</Label>
              <Input id="adminCapId2" value={adminCapId} onChange={e => setAdminCapId(e.target.value)} placeholder="Enter AdminCap Object ID" type="text" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="platformStateId2">PlatformState Object ID</Label>
              <Input id="platformStateId2" value={platformStateId} onChange={e => setPlatformStateId(e.target.value)} placeholder="Enter PlatformState Object ID" type="text" />
            </LabelInputContainer>
            {unpauseError && <div className="text-red-600 mt-2">{unpauseError}</div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResumeDialog(false)}>Cancel</Button>
              <Button type="submit">Unpause Platform</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Registry Dialog */}
      <Dialog open={showRegistryDialog} onOpenChange={setShowRegistryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Issuer Registry</DialogTitle>
            <DialogDescription>
              Create a new Issuer Registry. No input required.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => { e.preventDefault(); handleNewRegistry(); }}>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegistryDialog(false)}>Cancel</Button>
              <Button type="submit">Create Registry</Button>
            </DialogFooter>
            {newRegistryResult && <div className="text-green-600 mt-2">{newRegistryResult}</div>}
          </form>
        </DialogContent>
      </Dialog>

      {/* New Balance Book Dialog */}
      <Dialog open={showBalanceBookDialog} onOpenChange={setShowBalanceBookDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Balance Book</DialogTitle>
            <DialogDescription>
              Create a new Balance Book. No input required.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => { e.preventDefault(); handleNewBalanceBook(); }}>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBalanceBookDialog(false)}>Cancel</Button>
              <Button type="submit">Create Balance Book</Button>
            </DialogFooter>
            {newBalanceBookResult && <div className="text-green-600 mt-2">{newBalanceBookResult}</div>}
          </form>
        </DialogContent>
      </Dialog>

      {/* Get Registry Dialog */}
      <Dialog open={showGetRegistryDialog} onOpenChange={setShowGetRegistryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Get Registry</DialogTitle>
            <DialogDescription>
              Get the current Issuer Registry from PlatformState.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => { e.preventDefault(); handleGetRegistry(); }}>
            <LabelInputContainer>
              <Label htmlFor="platformStateIdGetReg">PlatformState Object ID</Label>
              <Input id="platformStateIdGetReg" value={platformStateId} onChange={e => setPlatformStateId(e.target.value)} placeholder="Enter PlatformState Object ID" type="text" />
            </LabelInputContainer>
            <DialogFooter>
              <Button type="submit">Get Registry</Button>
            </DialogFooter>
            {getRegistryResult && <div className="text-blue-600 mt-2">{getRegistryResult}</div>}
          </form>
        </DialogContent>
      </Dialog>

      {/* Get Balance Book Dialog */}
      <Dialog open={showGetBalanceBookDialog} onOpenChange={setShowGetBalanceBookDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Get Balance Book</DialogTitle>
            <DialogDescription>
              Get the current Balance Book from PlatformState.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => { e.preventDefault(); handleGetBalanceBook(); }}>
            <LabelInputContainer>
              <Label htmlFor="platformStateIdGetBook">PlatformState Object ID</Label>
              <Input id="platformStateIdGetBook" value={platformStateId} onChange={e => setPlatformStateId(e.target.value)} placeholder="Enter PlatformState Object ID" type="text" />
            </LabelInputContainer>
            <DialogFooter>
              <Button type="submit">Get Balance Book</Button>
            </DialogFooter>
            {getBalanceBookResult && <div className="text-blue-600 mt-2">{getBalanceBookResult}</div>}
          </form>
        </DialogContent>
      </Dialog>

      {/* Is Paused Dialog */}
      <Dialog open={showIsPausedDialog} onOpenChange={setShowIsPausedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check Platform Paused</DialogTitle>
            <DialogDescription>
              Check if the platform is currently paused.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => { e.preventDefault(); handleIsPaused(); }}>
            <LabelInputContainer>
              <Label htmlFor="platformStateIdPaused">PlatformState Object ID</Label>
              <Input id="platformStateIdPaused" value={platformStateId} onChange={e => setPlatformStateId(e.target.value)} placeholder="Enter PlatformState Object ID" type="text" />
            </LabelInputContainer>
            <DialogFooter>
              <Button type="submit">Check Paused</Button>
            </DialogFooter>
            {isPausedResult && <div className="text-blue-600 mt-2">{isPausedResult}</div>}
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Address Dialog */}
      <Dialog open={showAdminAddressDialog} onOpenChange={setShowAdminAddressDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Get Admin Address</DialogTitle>
            <DialogDescription>
              Get the admin address from AdminCap.
            </DialogDescription>
          </DialogHeader>
          <form className="my-8" onSubmit={e => { e.preventDefault(); handleAdminAddress(); }}>
            <LabelInputContainer>
              <Label htmlFor="adminCapIdAddr">AdminCap Object ID</Label>
              <Input id="adminCapIdAddr" value={adminCapId} onChange={e => setAdminCapId(e.target.value)} placeholder="Enter AdminCap Object ID" type="text" />
            </LabelInputContainer>
            <DialogFooter>
              <Button type="submit">Get Admin Address</Button>
            </DialogFooter>
            {adminAddressResult && <div className="text-blue-600 mt-2">{adminAddressResult}</div>}
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminDialogs;
