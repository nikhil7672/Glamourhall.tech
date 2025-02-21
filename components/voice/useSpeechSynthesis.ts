import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { Howl, Howler } from 'howler';

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
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
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

      // Create Howler instance
      const howl = new Howl({
        src: [audioUrl],
        html5: true, // Force HTML5 Audio
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
          toast.error('Audio loading failed');
          setCurrentlySpeaking(false);
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
      howl.play();
      howl.on('playerror', (id, error) => {
        console.error('Howler play error:', error);
        if (String(error).includes('interrupted')) {
          toast.error('Click speaker icon to enable audio');
          setIsSpeechEnabled(false);
        }
        setCurrentlySpeaking(false);
      });

    } catch (error) {
      console.error('Synthesis Error:', error);
      toast.error('Error synthesizing speech.');
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
