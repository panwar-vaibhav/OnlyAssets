import React from 'react';
import MarketTabs from '@/components/marketplace/MarketTabs';
import { marketData } from '@/components/marketplace/marketData.ts';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

const Marketplace: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <BackgroundBeamsWithCollision>
        <div className="container mx-auto px-4 py-8 relative z-10">
          
          <MarketTabs marketData={marketData} />
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
};

export default Marketplace;