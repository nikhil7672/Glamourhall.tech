import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface SpeechSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
  style?: 'natural' | 'default';
  mood?: 'warm' | 'gentle' | 'friendly' | 'soothing' | 'neutral';
}

export const useSpeechSynthesis = () => {
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentlySpeaking, setCurrentlySpeaking] = useState(false);
  const [speechSettings, setSpeechSettings] = useState<SpeechSettings>({
    rate: 1.05,    // increased from 0.85 for faster speech
    pitch: 0.95,
    volume: 0.85,
    voice: null,
    style: 'natural',
    mood: 'warm'
  });

  const [userInteractionRequired, setUserInteractionRequired] = useState(true);

  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}]/gu, '')
      .replace(/[*#\[\]`~]/g, '')
      .replace(/\n/g, '. ')  // Convert newlines to pauses
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Improved natural pauses and flow
  const splitIntoSentences = (text: string): string[] => {
    // Split on periods, commas, and natural pause points
    const segments = text.match(/[^.,;?!]+[.,;?!]+|\s*[.,;]\s*[^.,;?!]+/g);
    return segments ? segments.map(s => s.trim()).filter(s => s) : [text];
  };

  const stopSpeech = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeaking(false);
  }, []);

  const speakText = useCallback((text: string, index: number, setIndex: (index: number) => void) => {
    if (userInteractionRequired) {
      console.warn('Speech blocked - require user interaction');
      toast.error('Tap screen first to enable speech');
      setIsSpeechEnabled(false);
      return;
    }

    if (!isSpeechEnabled || !text || !window.speechSynthesis) return;

    stopSpeech();

    const cleanText = cleanTextForSpeech(text);
    const segments = splitIntoSentences(cleanText);
    if (!segments.length) return;

    setCurrentlySpeaking(true);
    let currentSegment = 0;

    const speakNextSegment = () => {
      if (currentSegment >= segments.length) {
        setCurrentlySpeaking(false);
        return;
      }

      const segment = segments[currentSegment];
      const utterance = new SpeechSynthesisUtterance(segment);

      // Base settings for pleasant voice
      let rate = speechSettings.rate;
      let pitch = speechSettings.pitch;
      let volume = speechSettings.volume;

      // Natural speech pattern adjustments
      const isQuestion = segment.endsWith('?');
      const isEndOfSentence = segment.endsWith('.') || segment.endsWith('!');
      const hasComma = segment.includes(',');

      // Gentle mood adjustments
      switch (speechSettings.mood) {
        case 'warm':
          pitch *= 0.98;
          rate *= 0.95;
          break;
        case 'gentle':
          pitch *= 0.96;
          rate *= 0.9;
          volume *= 0.9;
          break;
        case 'friendly':
          pitch *= 1.02;
          rate *= 1.05;
          break;
        case 'soothing':
          pitch *= 0.94;
          rate *= 0.88;
          volume *= 0.85;
          break;
      }

      // Subtle variations for natural flow
      if (isQuestion) {
        pitch *= 1.02;  // Gentle rise for questions
        rate *= 0.98;   // Slightly slower for clarity
      }

      if (hasComma) {
        rate *= 0.96;  // Natural slowing at commas
      }

      if (isEndOfSentence) {
        pitch *= 0.98;  // Slight drop at end of sentences
        rate *= 0.95;   // Natural slowdown
      }

      // Very subtle random variations
      rate *= 0.98 + Math.random() * 0.04;  // +/- 2% variation
      pitch *= 0.99 + Math.random() * 0.02;  // +/- 1% variation

      utterance.rate = Math.max(0.7, Math.min(1.2, rate));
      utterance.pitch = Math.max(0.8, Math.min(1.1, pitch));
      utterance.volume = Math.max(0.6, Math.min(0.9, volume));
      utterance.voice = speechSettings.voice;
      utterance.lang = speechSettings.voice?.lang || 'en-US';

      // Natural pauses between segments
      utterance.onend = () => {
        currentSegment++;
        const pauseDuration = isEndOfSentence ? 
          400 + Math.random() * 200 :  // Longer pause at sentences
          150 + Math.random() * 100;   // Shorter pause within sentences
        setTimeout(speakNextSegment, pauseDuration);
      };

      utterance.onerror = (event) => {
        console.error('Speech Error:', event.error);
        currentSegment++;
        setTimeout(speakNextSegment, 200);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextSegment();
  }, [isSpeechEnabled, speechSettings, stopSpeech, userInteractionRequired]);

  const loadVoices = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    setAvailableVoices(voices);
    setVoicesLoaded(true);

    if (!speechSettings.voice || !voices.includes(speechSettings.voice)) {
      // Mobile-friendly voice prioritization
      const preferredVoices = voices.filter(voice => (
        voice.name.includes('Premium') ||
        voice.name.includes('Enhanced') ||
        voice.name.includes('Neural') ||
        voice.name.includes('WaveNet') ||
        voice.name.includes('Samantha') ||  // Known for natural sound
        voice.name.includes('Daniel') ||    // Known for warmth
        voice.name.includes('Karen')        // Known for clarity

      ));

      // Fallback to any good English voice
      const defaultVoice = preferredVoices[0] ||
        voices.find(voice => 
          voice.lang === 'en-US' && 
          voice.localService    // Prefer local voices for consistency
        ) ||
        voices.find(voice => voice.lang === 'en-US') ||
        voices[0];

      if (defaultVoice) {
        setSpeechSettings(prev => ({
          ...prev,
          voice: defaultVoice,
          rate: 1.05,  // increased from 0.85 to match new default
          pitch: 0.95,
          volume: 0.85,
          style: 'natural',
          mood: 'warm'
        }));
      }
    }
  }, [speechSettings.voice]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Add mobile-specific initialization
      if ('onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      } else {
        // Fallback for browsers that don't support voiceschanged event
        setTimeout(loadVoices, 1000);
      }
      
      // Mobile browsers often require immediate voice loading
      if (window.speechSynthesis.getVoices().length === 0) {
        setTimeout(loadVoices, 500);
      }
    }

    return () => {
      stopSpeech();
      setIsSpeechEnabled(false);
    };
  }, [stopSpeech, loadVoices]);

  const handleFirstInteraction = useCallback(() => {
    setUserInteractionRequired(false);
    if (!voicesLoaded) {
      loadVoices();
    }
  }, [voicesLoaded, loadVoices]);

  return {
    isSpeechEnabled,
    setIsSpeechEnabled,
    voicesLoaded,
    availableVoices,
    currentlySpeaking,
    speechSettings,
    setSpeechSettings,
    speakText,
    stopSpeech,
    handleFirstInteraction,
  };
};