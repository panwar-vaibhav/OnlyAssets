import React from 'react';
import { Button } from "@/components/ui/button";

interface AdminToolsProps {
  onShowRegistryDialog: () => void;
  onShowBalanceBookDialog: () => void;
}

const AdminTools: React.FC<AdminToolsProps> = ({ onShowRegistryDialog, onShowBalanceBookDialog }) => (
  <div className="mb-12">
    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-6">
      Admin Tools
    </h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <Button
        variant="outline"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/40 dark:hover:to-violet-900/40 border border-neutral-200/20 backdrop-blur-sm hover:text-black dark:hover:text-black"
        onClick={onShowRegistryDialog}
      >
        <span className="text-2xl">📝</span>
        <span className="text-sm font-medium text-center">Replace Registry</span>
      </Button>
      <Button
        variant="outline"
        className="aspect-square p-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/40 dark:hover:to-cyan-900/40 border border-neutral-200/20 backdrop-blur-sm hover:text-black dark:hover:text-black"
        onClick={onShowBalanceBookDialog}
      >
        <span className="text-2xl">📊</span>
        <span className="text-sm font-medium text-center">Replace Balance Book</span>
      </Button>
    </div>
  </div>
);

export default AdminTools;
