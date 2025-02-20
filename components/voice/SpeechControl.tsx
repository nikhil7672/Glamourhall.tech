// components/SpeechControl.tsx
import React, { useEffect } from 'react';
import { FaVolumeUp, FaVolumeOff } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface SpeechControlProps {
  isSpeechEnabled: boolean;
  setIsSpeechEnabled: (enabled: boolean) => void;
  currentlySpeakingIndex: number;
  stopSpeech: () => void;
  currentlySpeaking: boolean;
}

export const SpeechControl: React.FC<SpeechControlProps> = ({
  isSpeechEnabled,
  setIsSpeechEnabled,
  currentlySpeakingIndex,
  stopSpeech,
  currentlySpeaking
}) => {
  useEffect(() => {
    if (!isSpeechEnabled) {
      stopSpeech();
    }
  }, [isSpeechEnabled, stopSpeech]);

  const handleClick = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="w-10 h-10 flex items-center justify-center rounded-full 
                hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
      title={isSpeechEnabled ? "Disable voice" : "Enable voice"}
    >
      {isSpeechEnabled ? (
        currentlySpeaking ? (
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