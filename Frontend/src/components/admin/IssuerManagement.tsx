import React from 'react';
import { Button } from "@/components/ui/button";

interface IssuerManagementProps {
  onShowAddIssuerDialog: () => void;
  onShowDeactivateIssuerDialog: () => void;
  onShowIssueCapsDialog: () => void;
  onShowCheckIssuerDialog: () => void;
}

const IssuerManagement: React.FC<IssuerManagementProps> = ({
  onShowAddIssuerDialog,
  onShowDeactivateIssuerDialog,
  onShowIssueCapsDialog,
  onShowCheckIssuerDialog,
}) => (
  <div>
    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-6">
      Issuer Management
    </h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <Button
        variant="outline"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/40 dark:hover:to-emerald-900/40 border border-neutral-200/20 backdrop-blur-sm hover:text-black dark:hover:text-black"
        onClick={onShowAddIssuerDialog}
      >
        <span className="text-2xl">➕</span>
        <span className="text-sm font-medium text-center">Add Verified Issuer</span>
      </Button>
      <Button
        variant="outline"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/40 dark:hover:to-rose-900/40 border border-neutral-200/20 backdrop-blur-sm hover:text-black dark:hover:text-black"
        onClick={onShowDeactivateIssuerDialog}
      >
        <span className="text-2xl">🚫</span>
        <span className="text-sm font-medium text-center">Deactivate Issuer</span>
      </Button>
      <Button
        variant="outline"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 hover:from-yellow-100 hover:to-amber-100 dark:hover:from-yellow-900/40 dark:hover:to-amber-900/40 border border-neutral-200/20 backdrop-blur-sm hover:text-black dark:hover:text-black"
        onClick={onShowIssueCapsDialog}
      >
        <span className="text-2xl">🎫</span>
        <span className="text-sm font-medium text-center">Issue IssuerCap</span>
      </Button>
      <Button
        variant="outline"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 hover:from-indigo-100 hover:to-violet-100 dark:hover:from-indigo-900/40 dark:hover:to-violet-900/40 border border-neutral-200/20 backdrop-blur-sm hover:text-black dark:hover:text-black"
        onClick={onShowCheckIssuerDialog}
      >
        <span className="text-2xl">✓</span>
        <span className="text-sm font-medium text-center">Check Issuer Status</span>
      </Button>
    </div>
  </div>
);

export default IssuerManagement;
