import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface SpeechSettings {
  stability: number;
  similarityBoost: number;
  voiceId: string;
  modelId: string;
}

export const useSpeechSynthesis = () => {
  const [currentlySpeaking, setCurrentlySpeaking] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [speechSettings, setSpeechSettings] = useState<SpeechSettings>({
    stability: 0.5,
    similarityBoost: 0.75,
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    modelId: 'eleven_monolingual_v1'
  });
  const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState(-1);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);

  const ELEVEN_LABS_API_KEY = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY;
  const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

  const controllerRef = useRef<AbortController | null>(null);

  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}]/gu, '')
      .replace(/[*#\[\]`~]/g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const stopSpeech = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    controllerRef.current?.abort();
  }, [audioElement]);

  const speakText = useCallback(async (text: string, index: number, setCurrentlySpeakingIndex: (index: number) => void) => {
    const controller = new AbortController();
    try {
      stopSpeech();
      setCurrentlySpeaking(true);
      setCurrentlySpeakingIndex(index);

      const cleanText = cleanTextForSpeech(text);

      const response = await fetch(`${ELEVEN_LABS_API_URL}/${speechSettings.voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_LABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: speechSettings.modelId,
          voice_settings: {
            stability: speechSettings.stability,
            similarity_boost: speechSettings.similarityBoost
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setCurrentlySpeaking(false);
        setCurrentlySpeakingIndex(-1);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        setCurrentlySpeaking(false);
        setCurrentlySpeakingIndex(-1);
        URL.revokeObjectURL(audioUrl);
      };

      setAudioElement(audio);
      await audio.play().catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Playback error:', error);
        }
      });

    } catch (error) {
      if (error.name === 'AbortError') return;
      setCurrentlySpeakingIndex(-1);
      console.error('ElevenLabs synthesis error:', error);
      setCurrentlySpeaking(false);
    } finally {
      setCurrentlySpeaking(false);
    }
  }, [ELEVEN_LABS_API_KEY, speechSettings, stopSpeech]);

  return {
    isSpeechEnabled,
    setIsSpeechEnabled,
    currentlySpeaking,
    speechSettings,
    setSpeechSettings,
    speakText,
    stopSpeech,
    currentlySpeakingIndex,
    setCurrentlySpeakingIndex,
    voicesLoaded: true,
  };
};