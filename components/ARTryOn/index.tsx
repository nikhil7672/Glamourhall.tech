import { Canvas } from '@react-three/fiber';
import { XR, XRButton } from '@react-three/xr';
import { Suspense, useEffect, useState } from 'react';
import { ARProduct } from './ARProduct';
import { ARControls } from './ARControls';
import { checkARSupport } from '../../utils/ai-helpers';
import { useXR } from '@/components/XRProvider';
import { CameraControls } from './CameraControls';
import { Loader } from '@/components/Loader';
import { Environment } from '@react-three/drei';

interface ARTryOnProps {
  productImage: any;
  onExit: () => void;
}

export const ARTryOn: React.FC<ARTryOnProps> = ({ productImage, onExit }) => {
  const store = useXR();
  const [isARSupported, setIsARSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Request camera permissions first
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Then check AR support
        const supported = await checkARSupport();
        setIsARSupported(supported);
        
        if (!supported) {
          setError('AR requires a compatible device and browser');
        }
      } catch (err) {
        setError('Camera access required for AR experience');
        console.error('Permission error:', err);
      }
    };
    init();
  }, []);

  const handleARStart = async () => {
    try {
      const session = await navigator.xr?.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        domOverlay: { root: document.body }
      });
      
      if (session) {
        // Session started successfully
        console.log('AR session started');
      }
    } catch (err) {
      console.error('Failed to start AR session:', err);
      setError('Failed to start AR session');
    }
  };

  if (error) {
    return (
      <div className="ar-error">
        <p>{error}</p>
        <button onClick={onExit}>Back to Product</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {isARSupported && (
        <>
          {/* <XRButton
            store={store}
            mode="immersive-ar"
            className="absolute top-4 right-4 z-50 px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={handleARStart}
          >
            Start AR
          </XRButton> */}
          <Canvas
            camera={{ 
              position: [0, 1.6, 3], 
              fov: 60,
              near: 0.1,
              far: 1000
            }}
            gl={{ 
              antialias: true,
              alpha: true 
            }}
          >
            <XR store={store}>
              <CameraControls />
              <ambientLight intensity={1} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Environment 
                preset="sunset"
                background
                blur={0.5}
              />
              <Suspense fallback={<Loader />}>
                <ARProduct imageUrl={productImage} />
              </Suspense>
            </XR>
          </Canvas>
          
          <ARControls
            onExit={onExit}
          />
        </>
      )}
    </div>
  );
};