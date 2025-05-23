import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onPause: () => void;
  onResume: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onPause, onResume }) => (
  <div className="w-full border-b border-neutral-200/10 bg-white/5 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400">
          Admin Dashboard
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Manage your platform settings
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <span className="mr-2">☰</span> Quick Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={onPause}>
            <span className="mr-2">⏸️</span> Pause Marketplace
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onResume}>
            <span className="mr-2">▶️</span> Resume Marketplace
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span className="mr-2">🔍</span> Check Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

export default AdminHeader;
