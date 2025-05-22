import React from 'react';
import MarketTabs from '@/components/marketplace/MarketTabs';
import { marketData } from '@/components/marketplace/marketData.ts';

const Marketplace: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        
        <MarketTabs marketData={marketData} />
      </div>
    </div>
  );
};

export default Marketplace;