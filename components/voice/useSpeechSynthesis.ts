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
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{27BF}]/gu, '')
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
            { className: 'flex items-center space-x-4' },
            React.createElement(
              'div',
              { 
                className: 'flex items-center justify-center w-10 h-10'
              },
              React.createElement(
                'span',
                { 
                  role: 'img', 
                  'aria-label': 'muted', 
                  className: 'text-2xl'
                },
                '🔇'
              )
            ),
            React.createElement(
              'div',
              { className: 'flex-1' },
              React.createElement(
                'p', 
                { 
                  className: 'font-semibold text-sm'
                }, 
                'Audio Blocked'
              ),
              React.createElement(
                'p', 
                { 
                  className: 'text-xs opacity-90'
                }, 
                'Tap the speaker icon to enable voice'
              )
            )
          ),
          {
            duration: 4000,
            icon: null,
            style: {
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: `
                0 1px 1px rgba(0, 0, 0, 0.02),
                0 2px 2px rgba(0, 0, 0, 0.02),
                0 4px 4px rgba(0, 0, 0, 0.02),
                0 8px 8px rgba(0, 0, 0, 0.02),
                0 16px 16px rgba(0, 0, 0, 0.02),
                0 2px 4px rgba(17, 24, 39, 0.05),
                0 -1px 0px rgba(255, 255, 255, 1),
                0 1px 0px rgba(17, 24, 39, 0.1)
              `,
              padding: '14px 18px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              maxWidth: '380px',
              width: '100%',
              transform: 'translateY(0) scale(1)',
              transition: 'all 0.2s ease',
              position: 'relative',
              backdropFilter: 'blur(8px)',
            },
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
  const enableSpeech = () => setIsSpeechEnabled(true);

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
