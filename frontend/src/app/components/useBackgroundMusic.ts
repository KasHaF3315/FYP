import { useEffect, useRef } from 'react';

type BackgroundMusicOptions = {
  volume?: number;
  /** When false, music is stopped and no audio element is kept for this hook. */
  enabled?: boolean;
};

export function useBackgroundMusic(src: string, options: BackgroundMusicOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { volume = 0.25, enabled = true } = options;

  useEffect(() => {
    if (!enabled) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      return;
    }

    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = volume;
    audioRef.current = audio;

    const tryPlay = () => {
      if (!audioRef.current) return;
      audioRef.current.play().catch(() => {
        // Browser autoplay can be blocked until user interaction.
      });
    };

    tryPlay();

    window.addEventListener('click', tryPlay, { once: true });
    window.addEventListener('keydown', tryPlay, { once: true });
    window.addEventListener('touchstart', tryPlay, { once: true });

    return () => {
      window.removeEventListener('click', tryPlay);
      window.removeEventListener('keydown', tryPlay);
      window.removeEventListener('touchstart', tryPlay);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = null;
    };
  }, [src, volume, enabled]);
}
