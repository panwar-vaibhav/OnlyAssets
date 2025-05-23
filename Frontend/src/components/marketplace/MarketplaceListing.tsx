import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { ListingItem } from './types';
import { CATEGORY_ICONS } from './constants';
import { CloseIcon } from './CloseIcon';

interface MarketplaceListingGridProps {
  items: ListingItem[];
}

const MarketplaceListing: React.FC<MarketplaceListingGridProps> = ({ items }) => {
  const [active, setActive] = useState<ListingItem | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ListingItem;
    direction: 'asc' | 'desc';
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof ListingItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActive(null);
      }
    }
    if (active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  // Expandable Card
  const ExpandableCard: React.FC<ListingItem & { onClick: () => void; isExpanded?: boolean }> = ({
    id,
    title,
    price,
    imageUrl,
    priceToken,
    category,
    network,
    type,
    earnXP,
    assetNumber,
    onClick,
    isExpanded,
  }) => {
    const elementId = useId();
    return (
      <motion.div
        layoutId={`card-${title}-${elementId}`}
        onClick={onClick}
        className="grid grid-cols-7 gap-4 px-6 py-4 items-center"
      >
        {/* Asset Name */}
        <div className="col-span-2 flex items-center gap-4">
          <img src={imageUrl} alt={title} className="h-12 w-12 rounded-lg object-cover" />
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            {assetNumber && <p className="text-sm text-gray-500">#{assetNumber}</p>}
          </div>
        </div>
        {/* Price */}
        <div className="text-marketplace-blue font-medium">
          {price.toLocaleString()} {priceToken}
        </div>
        {/* Category with Icon */}
        <div className="flex items-center gap-2">
          <span>{category}</span>
          <img src={CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]} alt={`${category} icon`} className="h-5 w-5 object-contain" />
        </div>
        {/* Type */}
        <div className="text-gray-600">{type}</div>
        {/* Earn XP */}
        <div className="text-green-600">Earn up to {earnXP.toLocaleString()} XP</div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={e => { e.stopPropagation(); /* Handle buy action */ }} className="px-3 py-1.5 text-sm rounded-full font-medium bg-marketplace-blue text-white hover:bg-marketplace-blue/90">Buy</Button>
          <Button className="px-3 py-1.5 text-black text-sm rounded-full font-medium bg-gray-100 hover:bg-gray-200">View Details</Button>
        </div>
      </motion.div>
    );
  };

  // Expanded Detail View
  const ExpandedDetailView: React.FC<ListingItem & { onClose: () => void }> = ({
    id,
    title,
    price,
    description,
    imageUrl,
    yield: yieldValue,
    tokenSymbol,
    onClose,
  }) => {
    const elementId = useId();
    return (
      <div className="p-4">
        <motion.button
          key={`close-${id}-${elementId}`}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="flex absolute top-4 right-4 lg:top-8 lg:right-8 items-center justify-center bg-white rounded-full h-8 w-8 shadow-lg hover:scale-110 active:scale-95"
          onClick={onClose}
        >
          <CloseIcon />
        </motion.button>
        <motion.div
          layoutId={`card-${id}-${elementId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-full max-w-[500px] max-h-[90vh] flex flex-col bg-white sm:rounded-3xl overflow-hidden shadow-xl"
        >
          <motion.div layoutId={`image-${id}-${elementId}`} transition={{ duration: 0.3 }}>
            <img src={imageUrl} alt={title} className="w-full h-64 object-cover" />
          </motion.div>
          <div className="flex flex-col p-6 overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <motion.h3 layoutId={`title-${id}-${elementId}`} transition={{ duration: 0.3 }} className="text-xl font-semibold text-gray-900">{title}</motion.h3>
                <motion.div layoutId={`price-${id}-${elementId}`} transition={{ duration: 0.3 }} className="text-marketplace-blue text-lg font-semibold mt-2">{price.toLocaleString()} {tokenSymbol}</motion.div>
                <motion.p layoutId={`yield-${id}-${elementId}`} transition={{ duration: 0.3 }} className="text-green-600 font-medium">{yieldValue}% Expected Yield</motion.p>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3, delay: 0.1 }} className="mt-6 text-gray-600">
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-sm leading-relaxed">{description}</p>
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-gray-900">Investment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, delay: 0.2 }} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600">Minimum Investment</div>
                    <div className="font-medium text-gray-900">1,000 USDC</div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, delay: 0.3 }} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600">Lock-up Period</div>
                    <div className="font-medium text-gray-900">12 months</div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, delay: 0.4 }} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600">Distribution</div>
                    <div className="font-medium text-gray-900">Monthly</div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, delay: 0.5 }} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600">Total Supply</div>
                    <div className="font-medium text-gray-900">100,000 Tokens</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 h-full w-full z-10" />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100] p-4 overflow-auto">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-4 right-4 items-center justify-center bg-white rounded-full h-8 w-8 shadow-lg z-[101]"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <div ref={ref} className="relative">
              <ExpandedDetailView {...active} onClose={() => setActive(null)} />
            </div>
          </div>
        ) : null}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto w-full">
        {/* Headers */}
        <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50 rounded-t-lg">
          <div className="col-span-2 flex items-center gap-2">
            <span className="font-medium">Assets</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Price</span>
            <button onClick={() => requestSort('price')} className="text-gray-500 hover:text-gray-700">
              {sortConfig?.key === 'price' && sortConfig.direction === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Category</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Type</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Earn XP</span>
            <button onClick={() => requestSort('earnXP')} className="text-gray-500 hover:text-gray-700">
              {sortConfig?.key === 'earnXP' && sortConfig.direction === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <div className="flex items-center">
            <span className="font-medium">Actions</span>
          </div>
        </div>
        {/* List Items */}
        <ul className="divide-y divide-gray-100">
          {sortedItems.map(item => (
            <motion.div layoutId={`card-${item.title}-${id}`} key={`card-${item.title}-${id}`} className="hover:bg-gray-50">
              <ExpandableCard {...item} onClick={() => setActive(item)} isExpanded={active?.id === item.id} />
            </motion.div>
          ))}
        </ul>
      </div>
    </>
  );
};

export default MarketplaceListing;
