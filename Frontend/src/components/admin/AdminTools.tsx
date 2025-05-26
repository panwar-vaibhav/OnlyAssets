import React from 'react';
import { Button } from "@/components/ui/button";

interface AdminToolsProps {
  onShowPauseDialog: () => void;
  onShowResumeDialog: () => void;
  onShowRegistryDialog: () => void;
  onShowBalanceBookDialog: () => void;
  onShowGetRegistryDialog: () => void;
  onShowGetBalanceBookDialog: () => void;
  onShowIsPausedDialog: () => void;
  onShowAdminAddressDialog: () => void;
}

const AdminTools: React.FC<AdminToolsProps> = ({
  onShowPauseDialog,
  onShowResumeDialog,
  onShowRegistryDialog,
  onShowBalanceBookDialog,
  onShowGetRegistryDialog,
  onShowGetBalanceBookDialog,
  onShowIsPausedDialog,
  onShowAdminAddressDialog,
}) => (
  <div className="mb-12">
    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-6">
      Admin Tools
    </h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <Button
        variant="destructive"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/40 dark:hover:to-pink-900/40 border border-neutral-200/20 backdrop-blur-sm"
        onClick={onShowPauseDialog}
      >
        <span className="text-2xl">⏸️</span>
        <span className="text-sm font-medium text-center text-black dark:text-black">Pause Platform</span>
      </Button>
      <Button
        variant="default"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/40 dark:hover:to-emerald-900/40 border border-neutral-200/20 backdrop-blur-sm"
        onClick={onShowResumeDialog}
      >
        <span className="text-2xl">▶️</span>
        <span className="text-sm font-medium text-center text-black dark:text-black">Unpause Platform</span>
      </Button>
      <Button
        variant="outline"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/40 dark:hover:to-violet-900/40 border border-neutral-200/20 backdrop-blur-sm"
        onClick={onShowRegistryDialog}
      >
        <span className="text-2xl">📝</span>
        <span className="text-sm font-medium text-center text-black dark:text-black">New Registry</span>
      </Button>
      <Button
        variant="outline"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/40 dark:hover:to-cyan-900/40 border border-neutral-200/20 backdrop-blur-sm"
        onClick={onShowBalanceBookDialog}
      >
        <span className="text-2xl">📊</span>
        <span className="text-sm font-medium text-center text-black dark:text-black">New Balance Book</span>
      </Button>
      <Button
        variant="secondary"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 hover:from-yellow-100 hover:to-amber-100 dark:hover:from-yellow-900/40 dark:hover:to-amber-900/40 border border-neutral-200/20 backdrop-blur-sm"
        onClick={onShowGetRegistryDialog}
      >
        <span className="text-2xl">🔍</span>
        <span className="text-sm font-medium text-center text-black dark:text-black">Get Registry</span>
      </Button>
      <Button
        variant="secondary"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 hover:from-yellow-100 hover:to-amber-100 dark:hover:from-yellow-900/40 dark:hover:to-amber-900/40 border border-neutral-200/20 backdrop-blur-sm"
        onClick={onShowGetBalanceBookDialog}
      >
        <span className="text-2xl">🔍</span>
        <span className="text-sm font-medium text-center text-black dark:text-black">Get Balance Book</span>
      </Button>
      <Button
        variant="secondary"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 hover:from-yellow-100 hover:to-amber-100 dark:hover:from-yellow-900/40 dark:hover:to-amber-900/40 border border-neutral-200/20 backdrop-blur-sm"
        onClick={onShowIsPausedDialog}
      >
        <span className="text-2xl">❓</span>
        <span className="text-sm font-medium text-center text-black dark:text-black">Is Paused?</span>
      </Button>
      <Button
        variant="secondary"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 hover:from-yellow-100 hover:to-amber-100 dark:hover:from-yellow-900/40 dark:hover:to-amber-900/40 border border-neutral-200/20 backdrop-blur-sm"
        onClick={onShowAdminAddressDialog}
      >
        <span className="text-2xl">👤</span>
        <span className="text-sm font-medium text-center text-black dark:text-black">Admin Address</span>
      </Button>
    </div>
  </div>
);

export default AdminTools;
