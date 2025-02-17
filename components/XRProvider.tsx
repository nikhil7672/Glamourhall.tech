'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';
import { createXRStore, XRStore } from '@react-three/xr';

const XRContext = createContext<XRStore | null>(null);

interface XRProviderProps {
  children: ReactNode;
}

export function XRProvider({ children }: XRProviderProps) {
  const storeRef = useRef<XRStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createXRStore();
  }
  
  return (
    <XRContext.Provider value={storeRef.current}>
      {children}
    </XRContext.Provider>
  );
}

export function useXR(): XRStore {
  const context = useContext(XRContext);
  if (!context) {
    throw new Error("useXR must be used within a XRProvider");
  }
  return context;
}
