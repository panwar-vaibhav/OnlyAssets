import React, { useState } from 'react';
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import AdminHeader from "./AdminHeader";
import AdminTools from "./AdminTools";
import IssuerManagement from "./IssuerManagement";
import AdminDialogs from "./AdminDialogs";
import { useCurrentAccount, ConnectButton } from '@mysten/dapp-kit';

const AdminSection = () => {
  // State declarations
  const [isMarketplacePaused, setIsMarketplacePaused] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showRegistryDialog, setShowRegistryDialog] = useState(false);
  const [showBalanceBookDialog, setShowBalanceBookDialog] = useState(false);
  const [showAddIssuerDialog, setShowAddIssuerDialog] = useState(false);
  const [showDeactivateIssuerDialog, setShowDeactivateIssuerDialog] = useState(false);
  const [showIssueCapsDialog, setShowIssueCapsDialog] = useState(false);
  const [showCheckIssuerDialog, setShowCheckIssuerDialog] = useState(false);
  const [showGetRegistryDialog, setShowGetRegistryDialog] = useState(false);
  const [showGetBalanceBookDialog, setShowGetBalanceBookDialog] = useState(false);
  const [showIsPausedDialog, setShowIsPausedDialog] = useState(false);
  const [showAdminAddressDialog, setShowAdminAddressDialog] = useState(false);
  const currentAccount = useCurrentAccount();

  const handlePauseMarketplace = () => {
    setIsMarketplacePaused(true);
    setShowPauseDialog(false);
  };

  const handleResumeMarketplace = () => {
    setIsMarketplacePaused(false);
    setShowResumeDialog(false);
  };

  if (!currentAccount) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <ConnectButton className="mb-6" />
        <div className="text-lg text-white/80 font-semibold mt-4">Please connect using admin wallet</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BackgroundBeamsWithCollision className="min-h-screen">
        <div className="relative z-10">
          <AdminHeader onPause={() => setShowPauseDialog(true)} onResume={() => setShowResumeDialog(true)} />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <AdminTools
              onShowPauseDialog={() => setShowPauseDialog(true)}
              onShowResumeDialog={() => setShowResumeDialog(true)}
              onShowRegistryDialog={() => setShowRegistryDialog(true)}
              onShowBalanceBookDialog={() => setShowBalanceBookDialog(true)}
              onShowGetRegistryDialog={() => setShowGetRegistryDialog(true)}
              onShowGetBalanceBookDialog={() => setShowGetBalanceBookDialog(true)}
              onShowIsPausedDialog={() => setShowIsPausedDialog(true)}
              onShowAdminAddressDialog={() => setShowAdminAddressDialog(true)}
            />
            <IssuerManagement
              onShowAddIssuerDialog={() => setShowAddIssuerDialog(true)}
              onShowDeactivateIssuerDialog={() => setShowDeactivateIssuerDialog(true)}
              onShowIssueCapsDialog={() => setShowIssueCapsDialog(true)}
              onShowCheckIssuerDialog={() => setShowCheckIssuerDialog(true)}
            />
          </div>
          <AdminDialogs
            showPauseDialog={showPauseDialog}
            setShowPauseDialog={setShowPauseDialog}
            showResumeDialog={showResumeDialog}
            setShowResumeDialog={setShowResumeDialog}
            showRegistryDialog={showRegistryDialog}
            setShowRegistryDialog={setShowRegistryDialog}
            showBalanceBookDialog={showBalanceBookDialog}
            setShowBalanceBookDialog={setShowBalanceBookDialog}
            showAddIssuerDialog={showAddIssuerDialog}
            setShowAddIssuerDialog={setShowAddIssuerDialog}
            showDeactivateIssuerDialog={showDeactivateIssuerDialog}
            setShowDeactivateIssuerDialog={setShowDeactivateIssuerDialog}
            showIssueCapsDialog={showIssueCapsDialog}
            setShowIssueCapsDialog={setShowIssueCapsDialog}
            showCheckIssuerDialog={showCheckIssuerDialog}
            setShowCheckIssuerDialog={setShowCheckIssuerDialog}
            handlePauseMarketplace={handlePauseMarketplace}
            handleResumeMarketplace={handleResumeMarketplace}
            showGetRegistryDialog={showGetRegistryDialog}
            setShowGetRegistryDialog={setShowGetRegistryDialog}
            showGetBalanceBookDialog={showGetBalanceBookDialog}
            setShowGetBalanceBookDialog={setShowGetBalanceBookDialog}
            showIsPausedDialog={showIsPausedDialog}
            setShowIsPausedDialog={setShowIsPausedDialog}
            showAdminAddressDialog={showAdminAddressDialog}
            setShowAdminAddressDialog={setShowAdminAddressDialog}
          />
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
};

export default AdminSection;
