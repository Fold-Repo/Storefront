"use client"

import { useState, useEffect, useCallback } from 'react';

interface UseCountdownOptions {
  initialCount?: number;
  onCountdownChange?: (countdown: number) => void;
  onCountdownComplete?: () => void;
  autoStart?: boolean;
}

interface UseCountdownReturn {
  countdown: number;
  isActive: boolean;
  start: (initialCount?: number) => void;
  reset: (initialCount?: number) => void;
  stop: () => void;
}

export const useCountdown = ({
  initialCount = 60,
  onCountdownChange,
  onCountdownComplete,
  autoStart = false
}: UseCountdownOptions = {}): UseCountdownReturn => {
  const [countdown, setCountdown] = useState<number>(initialCount);
  const [isActive, setIsActive] = useState<boolean>(autoStart);

  // Notify parent of countdown changes
  useEffect(() => {
    if (onCountdownChange) {
      onCountdownChange(countdown);
    }
  }, [countdown, onCountdownChange]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prevCountdown => {
          const newCountdown = prevCountdown - 1;
          
          // Call onCountdownComplete when countdown reaches 0
          if (newCountdown === 0 && onCountdownComplete) {
            onCountdownComplete();
          }
          
          return newCountdown;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isActive, countdown, onCountdownComplete]);

  const start = useCallback((startCount?: number) => {
    const count = startCount ?? initialCount;
    setCountdown(count);
    setIsActive(true);
  }, [initialCount]);

  const reset = useCallback((resetCount?: number) => {
    const count = resetCount ?? initialCount;
    setCountdown(count);
    setIsActive(true);
  }, [initialCount]);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    countdown,
    isActive,
    start,
    reset,
    stop
  };
};

export default useCountdown;
