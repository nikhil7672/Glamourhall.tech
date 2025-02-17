'use client';

import { extend, useLoader, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useState, useRef } from 'react';
import { Html } from '@react-three/drei';

// Extending THREE classes
extend({
  Group: THREE.Group,
  Mesh: THREE.Mesh,
  PlaneGeometry: THREE.PlaneGeometry,
  MeshStandardMaterial: THREE.MeshStandardMaterial
});

interface ARProductProps {
  imageUrl: string;
  position?: [number, number, number];
  scale?: number;
}

export const ARProduct: React.FC<ARProductProps> = ({
  imageUrl,
  position = [0, 0, -1],
  scale = 1,
}) => {
  const [productPosition, setProductPosition] = useState<[number, number, number]>(position);
  const [productScale, setProductScale] = useState(scale);
  const [isARSupported, setIsARSupported] = useState(false);
  const [session, setSession] = useState<XRSession | null>(null);
  
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  const meshRef = useRef<THREE.Mesh>();
  const { gl, camera, scene } = useThree();
  const videoRef = useRef<HTMLVideoElement>();

  // Check AR support on component mount
  useEffect(() => {
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await navigator.xr?.isSessionSupported('immersive-ar');
          setIsARSupported(supported);
        } catch (error) {
          console.error('Error checking AR support:', error);
          setIsARSupported(false);
        }
      }
    };
    checkARSupport();
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          setProductPosition((prev) => [prev[0], prev[1] + 0.1, prev[2]]);
          break;
        case 'ArrowDown':
          setProductPosition((prev) => [prev[0], prev[1] - 0.1, prev[2]]);
          break;
        case 'ArrowLeft':
          setProductPosition((prev) => [prev[0] - 0.1, prev[1], prev[2]]);
          break;
        case 'ArrowRight':
          setProductPosition((prev) => [prev[0] + 0.1, prev[1], prev[2]]);
          break;
        case '+':
          setProductScale((prev) => prev * 1.1);
          break;
        case '-':
          setProductScale((prev) => prev * 0.9);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Initialize AR
  useEffect(() => {
    const initAR = async () => {
      try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight }
          }
        });

        // Create and setup video element
        const video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true;
        await video.play();
        videoRef.current = video;

        // Setup WebXR session
        if (navigator.xr) {
          const xrSession = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['local', 'hit-test', 'dom-overlay'],
            domOverlay: { root: document.body }
          });

          // Configure WebGL renderer
          gl.xr.enabled = true;
          await gl.xr.setSession(xrSession);
          gl.xr.setReferenceSpaceType('local');
          
          // Set transparent background
          gl.setClearColor(0x000000, 0);
          gl.setSize(window.innerWidth, window.innerHeight);

          setSession(xrSession);

          // Handle session end
          xrSession.addEventListener('end', () => {
            setSession(null);
            gl.xr.enabled = false;
            gl.setClearColor(0x000000, 1);
          });

        } else {
          throw new Error('WebXR not supported');
        }
      } catch (error) {
        console.error('AR initialization failed:', error);
        alert('Failed to initialize AR. Please ensure you have a compatible device and browser.');
      }
    };

    if (isARSupported) {
      initAR();
    }

    return () => {
      if (session) {
        session.end();
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isARSupported, gl]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      gl.setAnimationLoop((timestamp, frame) => {
        if (frame) {
          const referenceSpace = gl.xr.getReferenceSpace();
          if (referenceSpace) {
            const pose = frame.getViewerPose(referenceSpace);
            if (pose) {
              // Update camera with pose data
              camera.matrix.fromArray(pose.transform.matrix);
              camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
            }
          }
        }
        gl.render(scene, camera);
      });
    };

    if (session) {
      animate();
    }

    return () => {
      gl.setAnimationLoop(null);
    };
  }, [session, gl, scene, camera]);

  // Frame updates
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.1;
      
      // Follow camera
      meshRef.current.position.x = camera.position.x;
      meshRef.current.position.z = camera.position.z - 1.5;
      meshRef.current.rotation.y = camera.rotation.y;
    }
  });

  if (!isARSupported) {
    return (
      <Html>
        <div className="text-red-500">
          AR is not supported on this device or browser.
        </div>
      </Html>
    );
  }

  return (
    <group>
      {/* Environment lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, 5]} intensity={1} />

      {/* Product mesh */}
      <mesh 
        ref={meshRef} 
        rotation={[0, Math.PI, 0]}
        scale={[productScale, productScale, productScale]}
        position={productPosition}
      >
        <planeGeometry args={[1, 1, 32, 32]} />
        <meshStandardMaterial 
          map={texture}
          transparent
          opacity={0.8}
          depthWrite={false}
          depthTest={false}
          premultipliedAlpha={true}
        />
        <Html
          transform
          wrapperClass="ar-hud"
          distanceFactor={0.5}
          position={[0, 0.6, 0]}
        >
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
            👆 Drag to rotate
          </div>
        </Html>
      </mesh>
    </group>
  );
};

// Add to your app's root layout or page: