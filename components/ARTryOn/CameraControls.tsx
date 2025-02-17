'use client';

import { useThree } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import { useEffect } from 'react';

// Option 1: If XRState is exported from '@react-three/xr'
// import type { XRState } from '@react-three/xr';

// Option 2: Define your own type for our usage:
type XRState = {
  isPresenting: boolean;
  // ... include other properties as needed
};

export function CameraControls() {
  const { camera } = useThree();
  // Assert the type so TS knows that useXR returns an XRState object.
  const { isPresenting } = useXR() as XRState;

  useEffect(() => {
    if (isPresenting) {
      // Reset camera when AR session starts
      camera.position.set(0, 1.6, 3);
      camera.lookAt(0, 1.6, 0);
    }
  }, [isPresenting, camera]);

  return null;
}
