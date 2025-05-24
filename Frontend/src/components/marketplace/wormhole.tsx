import React from 'react';
import WormholeConnect from '@wormhole-foundation/wormhole-connect';

const config = {
  // Example: restrict to Ethereum and Solana, you can customize
  // chains: ['Ethereum', 'Solana'],
  // network: 'Mainnet',
};

const theme = {
  // Example: customize background color
  // background: { default: '#212b4a' },
};

const WormholeModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl p-0 wormhole-modal-hide-scrollbar"
        style={{
          background: 'rgba(30, 32, 48, 0.65)', // more transparent
          boxShadow: '0 4px 32px 0 rgba(0,0,0,0.25)',
          backdropFilter: 'blur(24px) saturate(1.5)',
          border: '1px solid rgba(255,255,255,0.10)',
          maxHeight: '90vh',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style>{`
          .wormhole-modal-hide-scrollbar::-webkit-scrollbar { display: none; }
          .wormhole-modal-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <div style={{maxHeight: '90vh', overflow: 'auto'}}>
          <button
            className="sticky top-2 right-2 float-right text-xl text-gray-400 hover:text-white z-10 bg-transparent border-none outline-none"
            onClick={onClose}
            aria-label="Close Wormhole Connect"
            style={{marginLeft: 'auto', display: 'block'}}
          >
            ×
          </button>
          <div className="p-6">
            <WormholeConnect config={config} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WormholeModal;
