'use client';

import { useThree } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import { useEffect } from 'react';

export const ARControls = ({ onExit }: { onExit: () => void }) => {
  // Move controls inside Canvas context
  return (
    <div className="ar-controls">
      <button 
        onClick={onExit}
        className="fixed bottom-4 right-4 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        Exit AR
      </button>
    </div>
  );
};