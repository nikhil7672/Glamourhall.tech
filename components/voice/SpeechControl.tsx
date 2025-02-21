import React, { useEffect } from 'react';
import { FaVolumeUp, FaVolumeOff } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { IoMdVolumeOff } from "react-icons/io";

interface SpeechControlProps {
  isSpeechEnabled: boolean;
  setIsSpeechEnabled: (enabled: boolean) => void;
  currentlySpeakingIndex: number;
  stopSpeech: () => void;
  currentlySpeaking: boolean;
  className?: string;
  iconClassName?: string;
}

export const SpeechControl: React.FC<SpeechControlProps> = ({
  isSpeechEnabled,
  setIsSpeechEnabled,
  currentlySpeakingIndex,
  stopSpeech,
  currentlySpeaking,
  className = '',
  iconClassName = 'w-6 h-6'
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
    if (!isSpeechEnabled) {
      const enableAudio = async () => {
        try {
          // 1. Create and resume audio context
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          await audioContext.resume();
          
          // 2. Play your silent.mp3 file
          const silentAudio = new Audio('/silent.mp3');
          silentAudio.volume = 0; // Ensure silent playback
          await silentAudio.play();
          
          // 3. Enable speech after successful playback
          setIsSpeechEnabled(true);
          
          
          // 4. Clean up after short delay
          setTimeout(() => {
            silentAudio.pause();
            silentAudio.remove();
          }, 500);
        } catch (error) {
          console.error('Audio enable failed:', error);
          toast.error('Enable audio: Click speaker then allow permissions');
          setIsSpeechEnabled(false);
        }
      };
      
      enableAudio();
    }
  };

  return (
    <motion.button
      whileHover={{ 
        scale: 1.1,
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.6 }
      }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={`${className} relative group transition-all duration-300
        bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/30 dark:to-blue-900/30
        hover:from-purple-100/70 hover:to-blue-100/70 dark:hover:from-purple-800/50 dark:hover:to-blue-800/50`}
      title={isSpeechEnabled ? 'Disable voice' : 'Enable voice'}
    >
      <AnimatePresence mode="wait">
        {isSpeechEnabled ? (
          currentlySpeaking ? (
            <motion.div
              key="speaking"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))'
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <FaVolumeUp className={`${iconClassName} text-purple-500 animate-pulse`} />
            </motion.div>
          ) : (
            <motion.div
              key="enabled"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="relative"
            >
              <FaVolumeUp className={`${iconClassName} text-purple-600 dark:text-purple-300`} />
              <div className="absolute inset-0 animate-ping-slow opacity-20">
                <FaVolumeUp className={`${iconClassName} text-purple-400`} />
              </div>
            </motion.div>
          )
        ) : (
          <motion.div
            key="disabled"
            initial={{ opacity: 0, rotate: 180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
          >
            <IoMdVolumeOff className={`${iconClassName} text-gray-600 dark:text-gray-300`} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
