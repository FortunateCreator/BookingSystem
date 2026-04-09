import { useState, useEffect } from 'react';

export function useSecretAdmin(onTrigger: () => void) {
  const [clicks, setClicks] = useState<number[]>([]);

  useEffect(() => {
    const handleClick = () => {
      const now = Date.now();
      const newClicks = [...clicks, now].filter(t => now - t < 3000);
      
      if (newClicks.length >= 3) {
        onTrigger();
        setClicks([]);
      } else {
        setClicks(newClicks);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [clicks, onTrigger]);
}
