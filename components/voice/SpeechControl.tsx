import React, { useEffect } from 'react';
import { FaVolumeUp, FaVolumeOff } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
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
  currentlySpeaking,
}) => {
  useEffect(() => {
    if (!isSpeechEnabled) {
      stopSpeech();
    }
  }, [isSpeechEnabled, stopSpeech]);

  const handleClick = (): void => {
    setIsSpeechEnabled(!isSpeechEnabled);
    toast(isSpeechEnabled ? 'Voice disabled' : 'Voice enabled', {
      icon: isSpeechEnabled ? '🔇' : '🔊',
      style: {
        background: '#333',
        color: '#fff',
      },
    });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.15, boxShadow: '0px 0px 12px rgba(0, 0, 0, 0.2)' }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="w-12 h-12 flex items-center justify-center rounded-full 
                 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 
                 hover:from-gray-300 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 
                 transition-all duration-300 group"
      title={isSpeechEnabled ? 'Disable voice' : 'Enable voice'}
    >
      <AnimatePresence mode="wait">
        {isSpeechEnabled ? (
          currentlySpeaking ? (
            <motion.div
              key="speaking"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <FaVolumeUp className="w-6 h-6 text-purple-500 animate-pulse" />
            </motion.div>
          ) : (
            <motion.div
              key="enabled"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <FaVolumeUp className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </motion.div>
          )
        ) : (
          <motion.div
            key="disabled"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <FaVolumeOff className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
