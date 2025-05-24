import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketplaceListing from './MarketplaceListing';
import { MarketData } from './types';
import { useNavigate } from 'react-router-dom';
import WormholeModal from './wormhole';

interface MarketTabsProps {
  marketData: MarketData;
}

const MarketTabs: React.FC<MarketTabsProps> = ({ marketData }) => {
  const [wormholeOpen, setWormholeOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative w-full">
      {/* Home button top left */}
      <button
        className="absolute top-0 left-0 m-4 px-4 py-2 rounded-lg bg-white/80 hover:bg-marketplace-blue text-marketplace-blue hover:text-white font-semibold shadow transition-all z-20"
        onClick={() => navigate('/')}
      >
        Home
      </button>
      {/* Swap tokens info and button top right */}
      <div className="absolute top-0 right-0 flex flex-col items-end m-4 z-20">
        <span className="mb-1 text-xs text-gray-500 font-medium">have funds on another chain?</span>
        <button
          className="px-4 py-2 rounded-lg bg-marketplace-blue text-white font-semibold shadow hover:bg-marketplace-blue/90 transition-all"
          onClick={() => setWormholeOpen(true)}
        >
          Swap Tokens
        </button>
      </div>
      <WormholeModal open={wormholeOpen} onClose={() => setWormholeOpen(false)} />

      <Tabs defaultValue="realEstate" className="w-full rounded-xl p-4">
        <TabsList className="max-w-2xl mx-auto grid grid-cols-3 gap-3 h-16 p-0 mb-8 bg-gray-50/50 rounded-lg">
          <TabsTrigger 
            value="realEstate"
            className="group relative w-full h-full overflow-hidden rounded-lg border border-gray-100 transition-all 
            hover:bg-marketplace-blue/5
            data-[state=active]:border-transparent data-[state=active]:shadow-lg
            data-[state=active]:bg-white"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60" 
                alt="Real Estate" 
                className="w-full h-full object-cover opacity-20"
              />
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <span className="text-gray-800 text-sm font-medium group-hover:text-marketplace-blue group-data-[state=active]:text-marketplace-blue">Real Estate</span>
              <span className="text-gray-500 text-xs mt-0.5 group-hover:text-marketplace-blue/70 group-data-[state=active]:text-marketplace-blue/70">Premium Properties</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="invoices"
            className="group relative w-full h-full overflow-hidden rounded-lg border border-gray-100 transition-all 
            hover:bg-marketplace-blue/5
            data-[state=active]:border-transparent data-[state=active]:shadow-lg
            data-[state=active]:bg-white"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=60" 
                alt="Invoices" 
                className="w-full h-full object-cover opacity-20"
              />
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <span className="text-gray-800 text-sm font-medium group-hover:text-marketplace-blue group-data-[state=active]:text-marketplace-blue">Invoices</span>
              <span className="text-gray-500 text-xs mt-0.5 group-hover:text-marketplace-blue/70 group-data-[state=active]:text-marketplace-blue/70">Corporate Finance</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="commodities"
            className="group relative w-full h-full overflow-hidden rounded-lg border border-gray-100 transition-all 
            hover:bg-marketplace-blue/5
            data-[state=active]:border-transparent data-[state=active]:shadow-lg
            data-[state=active]:bg-white"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=60" 
                alt="Commodities" 
                className="w-full h-full object-cover opacity-20"
              />
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <span className="text-gray-800 text-sm font-medium group-hover:text-marketplace-blue group-data-[state=active]:text-marketplace-blue">Commodities</span>
              <span className="text-gray-500 text-xs mt-0.5 group-hover:text-marketplace-blue/70 group-data-[state=active]:text-marketplace-blue/70">Physical Assets</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realEstate">
          <MarketplaceListing items={marketData.realEstate} />
        </TabsContent>
        <TabsContent value="invoices">
          <MarketplaceListing items={marketData.invoices} />
        </TabsContent>
        <TabsContent value="commodities">
          <MarketplaceListing items={marketData.commodities} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketTabs;
