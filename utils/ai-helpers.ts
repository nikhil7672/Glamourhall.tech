export const checkARSupport = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
  
    // Check for WebXR support
    if (!navigator.xr) {
      console.log('WebXR not available');
      return false;
    }
  
    // Check for camera permissions
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      console.log('Camera permission denied');
      return false;
    }
  
    // Check for AR session support
    try {
      return await navigator.xr.isSessionSupported('immersive-ar');
    } catch (err) {
      console.log('AR sessions not supported');
      return false;
    }
  };
  
export const getDeviceOrientation = async (): Promise<boolean> => {
  if (typeof DeviceOrientationEvent === 'undefined') {
    return false;
  }

  // Cast to any to access the non-standard requestPermission method
  const DeviceOrientationEventAny = DeviceOrientationEvent as any;
  
  if (
    DeviceOrientationEventAny.requestPermission &&
    typeof DeviceOrientationEventAny.requestPermission === 'function'
  ) {
    try {
      const permission = await DeviceOrientationEventAny.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
      return false;
    }
  }
  
  return true;
};
  