// components/SpeechControl.tsx
import React, { useEffect } from 'react';
import { FaVolumeUp, FaVolumeOff } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useSpeechSynthesis } from './useSpeechSynthesis';

interface SpeechControlProps {
  isSpeechEnabled: boolean;
  setIsSpeechEnabled: (enabled: boolean) => void;
  currentlySpeakingIndex: number;
  stopSpeech: () => void;
  voicesLoaded: boolean;
  handleFirstInteraction: () => void;
}

export const SpeechControl: React.FC<SpeechControlProps> = ({
  isSpeechEnabled,
  setIsSpeechEnabled,
  currentlySpeakingIndex,
  stopSpeech,
  voicesLoaded,
  handleFirstInteraction
}) => {
  useEffect(() => {
    if (!isSpeechEnabled) {
      stopSpeech();
    }
  }, [isSpeechEnabled, stopSpeech]);

  const handleClick = () => {
    if (!voicesLoaded) {
      toast.error('Voice synthesis loading...');
      return;
    }
    
    handleFirstInteraction();
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      onTouchStart={handleFirstInteraction}
      className="w-10 h-10 flex items-center justify-center rounded-full 
                hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
      title={!voicesLoaded ? "Loading voices..." : 
             isSpeechEnabled ? "Disable voice" : "Enable voice"}
      disabled={!voicesLoaded}
    >
      {!voicesLoaded ? (
        <div className="w-5 h-5 border-2 border-gray-400 rounded-full animate-spin" />
      ) : isSpeechEnabled ? (
        currentlySpeakingIndex !== -1 ? (
          <FaVolumeUp className="w-5 h-5 text-purple-500 animate-pulse" />
        ) : (
          <FaVolumeUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )
      ) : (
        <FaVolumeOff className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      )}
    </motion.button>
  );
};