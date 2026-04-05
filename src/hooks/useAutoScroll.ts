import { useRef, useEffect } from 'react';

// This hook automatically scrolls the referenced element to the bottom
// whenever the dependency array changes.
export const useAutoScroll = (dependency: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dependency]);

  return scrollRef;
};
