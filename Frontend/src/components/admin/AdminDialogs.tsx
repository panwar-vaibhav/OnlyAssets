import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomGradient, LabelInputContainer } from "@/components/ui/form-utils";

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
}) => (
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
        <form className="my-8" onSubmit={e => e.preventDefault()}>
          <div className="space-y-4">
            <LabelInputContainer>
              <Label htmlFor="issuerAddress">Issuer Address</Label>
              <Input id="issuerAddress" placeholder="Enter wallet address" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="issuerName">Name</Label>
              <Input id="issuerName" placeholder="Enter issuer name" type="text" className="shadow-input dark:shadow-[0px_0px_1px_1px_#262626]" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="metadataUri">Metadata URI</Label>
              <Input id="metadataUri" placeholder="Enter IPFS/HTTP link with KYC docs" type="text" className="shadow-input dark:shadow-[0px_0px_1px_1px_#262626]" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="issuerRegistryId">IssuerRegistry Object ID</Label>
              <Input id="issuerRegistryId" placeholder="Enter Registry Object ID" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
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
        <form className="my-8" onSubmit={e => e.preventDefault()}>
          <div className="space-y-4">
            <LabelInputContainer>
              <Label htmlFor="deactivateAddress">Issuer Address</Label>
              <Input id="deactivateAddress" placeholder="Enter issuer wallet address" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="deactivateRegistryId">IssuerRegistry Object ID</Label>
              <Input id="deactivateRegistryId" placeholder="Enter Registry Object ID" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
            </LabelInputContainer>
            <div className="mt-8">
              <button type="submit" className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-red-500 to-red-800 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:text-black dark:hover:text-black">
                Deactivate Issuer →
                <BottomGradient />
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Issue IssuerCap Dialog */}
    <Dialog open={showIssueCapsDialog} onOpenChange={setShowIssueCapsDialog}>
      <DialogContent className="sm:max-w-lg shadow-input bg-white dark:bg-black p-4 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Issue IssuerCap</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Issue an IssuerCap to a verified issuer, enabling them to mint RWA tokens.
          </DialogDescription>
        </DialogHeader>
        <form className="my-8" onSubmit={e => e.preventDefault()}>
          <div className="space-y-4">
            <LabelInputContainer>
              <Label htmlFor="capIssuerAddress">Issuer Address</Label>
              <Input id="capIssuerAddress" placeholder="Enter issuer wallet address" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="capRegistryId">IssuerRegistry Object ID</Label>
              <Input id="capRegistryId" placeholder="Enter Registry Object ID" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
            </LabelInputContainer>
            <div className="mt-8">
              <button type="submit" className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-yellow-400 to-amber-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:text-black dark:hover:text-black">
                Issue Cap →
                <BottomGradient />
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Check Valid Issuer Dialog */}
    <Dialog open={showCheckIssuerDialog} onOpenChange={setShowCheckIssuerDialog}>
      <DialogContent className="sm:max-w-lg shadow-input bg-white dark:bg-black p-4 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Check Issuer Status</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Verify if an address is registered as an active issuer.
          </DialogDescription>
        </DialogHeader>
        <form className="my-8" onSubmit={e => e.preventDefault()}>
          <div className="space-y-4">
            <LabelInputContainer>
              <Label htmlFor="checkIssuerAddress">Issuer Address</Label>
              <Input id="checkIssuerAddress" placeholder="Enter issuer wallet address" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="checkRegistryId">IssuerRegistry Object ID</Label>
              <Input id="checkRegistryId" placeholder="Enter Registry Object ID" type="text" className="shadow-input font-mono text-sm dark:shadow-[0px_0px_1px_1px_#262626]" />
            </LabelInputContainer>
            <div className="mt-8">
              <button type="submit" className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-indigo-400 to-violet-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:text-black dark:hover:text-black">
                Check Status →
                <BottomGradient />
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </>
);

export default AdminDialogs;
