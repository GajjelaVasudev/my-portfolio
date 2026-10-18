import React, { useEffect, useRef, useState } from 'react';

type CursorMode = 'default' | 'hover' | 'view' | 'text';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [cursorMode, setCursorMode] = useState<CursorMode>('default');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if device supports fine hover pointer
    const isTouch = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      return;
    }

    // Add class to documentElement to hide native cursor on desktop
    document.documentElement.classList.add('has-custom-cursor');

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      // Contextual inspection of target
      const target = e.target as HTMLElement | null;
      if (target) {
        // Dark section detection
        const darkSection = target.closest('.contact-footer, .terminal-window');
        setIsDarkMode(!!darkSection);

        // 1. Text editing detection
        const isTextInput = target.closest('input, textarea, [contenteditable="true"]');
        if (isTextInput) {
          setCursorMode('text');
          return;
        }

        // 2. Specific buttons & controls take precedence
        const isButton = target.closest('button, .btn-primary, .btn-secondary, .btn-lets-talk, .social-tag-btn, .btn-copy-email, .btn-send-email, .btn-back-to-top, .btn-navbar-resume, .terminal-title-btn');
        if (isButton) {
          setCursorMode('hover');
          return;
        }

        // 3. Project preview view detection (clickable project previews)
        const viewTarget = target.closest('[data-cursor="view"], .card-image-link, .card-image-container, .terminal-screen-link, .terminal-screen');
        if (viewTarget) {
          setCursorMode('view');
          return;
        }

        // 4. Standard interactive link/button detection
        const interactive = target.closest('a, [role="button"], .nav-link, .navbar-nav-item, .notes-banner-card');
        if (interactive) {
          setCursorMode('hover');
          return;
        }

        setCursorMode('default');
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      document.documentElement.classList.remove('has-custom-cursor');
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
      document.documentElement.classList.add('has-custom-cursor');
    };

    // Smooth trailing ring lerp loop
    const render = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      animFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    animFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.documentElement.classList.remove('has-custom-cursor');
      cancelAnimationFrame(animFrameId);
    };
  }, [isVisible]);

  return (
    <>
      <div
        ref={dotRef}
        className={`custom-cursor-dot ${!isVisible ? 'cursor--hidden' : ''} ${cursorMode === 'hover' ? 'cursor--hover' : ''} ${cursorMode === 'view' ? 'cursor--view' : ''} ${cursorMode === 'text' ? 'cursor--text-mode' : ''} ${isDarkMode ? 'cursor--dark-mode' : ''}`}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${!isVisible ? 'cursor--hidden' : ''} ${cursorMode === 'hover' ? 'cursor--hover' : ''} ${cursorMode === 'view' ? 'cursor--view' : ''} ${cursorMode === 'text' ? 'cursor--text-mode' : ''} ${isDarkMode ? 'cursor--dark-mode' : ''}`}
        aria-hidden="true"
      >
        <span className="cursor-badge-text" aria-hidden="true">
          VIEW ↗
        </span>
      </div>
    </>
  );
};
