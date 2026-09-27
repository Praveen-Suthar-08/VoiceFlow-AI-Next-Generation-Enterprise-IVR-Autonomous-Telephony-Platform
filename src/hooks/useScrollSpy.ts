import { useState, useEffect } from 'react';

/**
 * useScrollSpy
 * Tracks the current active section ID based on scroll position in the viewport.
 * 
 * @param sectionIds - List of HTML element IDs to track
 * @param offset - Offset in pixels from top of viewport (defaults to 120px for fixed navbars)
 */
export function useScrollSpy(sectionIds: string[], offset: number = 120): string {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined' || sectionIds.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // If user has scrolled to the very bottom of the page, activate the last section
      if (window.scrollY + windowHeight >= docHeight - 50) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        return;
      }

      // Find the current section in view
      let currentActive = '';

      for (let i = 0; i < sectionIds.length; i++) {
        const id = sectionIds[i];
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;

          if (scrollPosition >= top && scrollPosition < top + height) {
            currentActive = id;
            break;
          } else if (scrollPosition >= top) {
            // Tentatively set as active if we passed its top
            currentActive = id;
          }
        }
      }

      setActiveId(currentActive);
    };

    // Run on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [sectionIds, offset]);

  return activeId;
}
