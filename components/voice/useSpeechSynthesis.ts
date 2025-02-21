import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { Howl, Howler } from 'howler';
import React from 'react';

// Note: In production, do not expose credentials on the client.
// Use a backend service or AWS Cognito to provide temporary credentials.
const pollyClient = new PollyClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  }
});

interface SpeechSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: { name: string; lang: string } | null; // simplified for Polly
  style?: 'natural' | 'default';
  mood?: 'warm' | 'gentle' | 'friendly' | 'soothing' | 'neutral';
}

export const usePollySpeechSynthesis = () => {
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [currentlySpeaking, setCurrentlySpeaking] = useState(false);
  const [speechSettings, setSpeechSettings] = useState<SpeechSettings>({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voice: { name: 'Joanna', lang: 'en-US' },
    style: 'natural',
    mood: 'warm'
  });
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(true); // Polly voices are always available
  const [currentHowl, setCurrentHowl] = useState<Howl | null>(null);

  // Function to clean and possibly split text if needed.
  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}]/gu, '')
      .replace(/[*#\[\]`~]/g, '')
      .replace(/\n/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const stopSpeech = useCallback(() => {
    if (currentHowl) {
      currentHowl.stop();
      setCurrentlySpeaking(false);
    }
  }, [currentHowl]);

  // This function uses Amazon Polly to synthesize speech and then plays it.
  const speakText = useCallback(async (text: string, index?: number, setIndex?: React.Dispatch<React.SetStateAction<number>>) => {
    if (!isSpeechEnabled) {
    //   toast.error('Speech is not enabled.');
      return;
    }

    setCurrentlySpeaking(true);
    const cleanText = cleanTextForSpeech(text);
    
    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: cleanText,
          voice: speechSettings.voice?.name 
        })
      });

      if (!response.ok) throw new Error('Synthesis failed');
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioBlob.type !== 'audio/mpeg') {
        toast.error(`Invalid audio format: ${audioBlob.type}, expected MP3`);
        return;
      }

      // Create Howler instance
      const howl = new Howl({
        src: [audioUrl],
        format: ['mp3'],
        html5: true,
        volume: speechSettings.volume,
        rate: speechSettings.rate,
        onend: () => {
          setCurrentlySpeaking(false);
          setIndex?.(-1);
        },
        onplayerror: () => {
          howl.once('unlock', () => howl.play());
        },
        onloaderror: (_, error) => {
          console.error('Howler load error:', error);
        },
        onplay: () => {
          // Resume Howler's audio context if needed
          if (Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
          }
        }
      });

      setCurrentHowl(howl);
      
      // Play with error handling
      const soundId = howl.play();
      howl.once('playerror', (id, error) => {
        console.error('Play failed:', error);
        
        toast.error(
          React.createElement(
            'div',
            { 
              className: 'flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-800/50 shadow-lg' 
            },
            [
              React.createElement('div', { 
                className: 'p-2 rounded-full bg-red-100 dark:bg-red-900/30 animate-pulse' 
              }, '🔇'),
              React.createElement('div', { className: 'flex flex-col' }, [
                React.createElement('span', { className: 'font-medium dark:text-white' }, 'Audio Disabled'),
                React.createElement('button', {
                  onClick: enableSpeech,
                  className: 'mt-1 text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-400 ' +
                             'underline underline-offset-4 transition-colors duration-200 flex items-center gap-1'
                }, [
                  'Tap to Enable ',
                  React.createElement('span', { className: 'text-lg' }, '🔊')
                ])
              ])
            ]
          ),
          { 
            duration: 5000,
            icon: null,
            style: {
              animation: 'slideInRight 0.3s ease-out',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none'
            }
          }
        );

        setIsSpeechEnabled(false);
        setCurrentlySpeaking(false);
      });

    } catch (error) {
      console.error('Synthesis Error:', error);
      setCurrentlySpeaking(false);
    }
  }, [isSpeechEnabled, speechSettings, stopSpeech]);

  // Example function to enable speech (e.g., after a user interaction)
  const enableSpeech = async () => {
    try {
      // Create and play silent audio through user interaction
      const silentAudio = new Audio('/silent.mp3');
      silentAudio.volume = 0;
      
      // Must play/pause during the click handler
      await silentAudio.play();
      silentAudio.pause();
      
      // Initialize Howler context after user interaction
      Howler.autoUnlock = true;
      Howler.usingWebAudio = true;
      Howler.ctx?.resume();
      
      setIsSpeechEnabled(true);
      return true;
    } catch (error) {
      console.error('Enable failed:', error);
      toast.error('Click "Enable" then allow audio');
      return false;
    }
  };

  return {
    voicesLoaded,
    isSpeechEnabled,
    setIsSpeechEnabled,
    currentlySpeaking,
    speechSettings,
    setSpeechSettings,
    speakText,
    enableSpeech,
    stopSpeech,
    
  };
};

