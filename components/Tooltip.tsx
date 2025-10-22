'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

// Global event system for tooltip management
const TOOLTIP_SHOW_EVENT = 'tooltip-show';
const TOOLTIP_HIDE_EVENT = 'tooltip-hide';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-left' | 'bottom-right';
  children: ReactNode;
  className?: string;
}

export default function Tooltip({ content, position = 'top', children, className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const componentId = useRef(Math.random().toString(36).substr(2, 9));

  const isAbsolutePositioned = position === 'bottom-left' || position === 'bottom-right';

  const clearTooltipTimeout = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleGlobalTooltipShow = (event: CustomEvent) => {
    const { id } = event.detail;
    if (id !== componentId.current && isAbsolutePositioned) {
      // Another absolute tooltip is showing, hide this one immediately
      setIsVisible(false);
      clearTooltipTimeout();
    }
  };

  const handleGlobalTooltipHide = (event: CustomEvent) => {
    // Handle hide events if needed
  };

  useEffect(() => {
    // Listen for global tooltip events
    window.addEventListener(TOOLTIP_SHOW_EVENT, handleGlobalTooltipShow as EventListener);
    window.addEventListener(TOOLTIP_HIDE_EVENT, handleGlobalTooltipHide as EventListener);

    return () => {
      window.removeEventListener(TOOLTIP_SHOW_EVENT, handleGlobalTooltipShow as EventListener);
      window.removeEventListener(TOOLTIP_HIDE_EVENT, handleGlobalTooltipHide as EventListener);
      clearTooltipTimeout();
    };
  }, []);

  const showTooltip = () => {
    // Dispatch global show event to hide other absolute tooltips
    window.dispatchEvent(new CustomEvent(TOOLTIP_SHOW_EVENT, {
      detail: { id: componentId.current }
    }));

    setIsVisible(true);

    if (isAbsolutePositioned) {
      // Clear any existing timeout
      clearTooltipTimeout();

      // Set timeout for absolute positioned tooltips
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
        window.dispatchEvent(new CustomEvent(TOOLTIP_HIDE_EVENT, {
          detail: { id: componentId.current }
        }));
      }, 5000); // 5 seconds
    }
  };

  const handleMouseEnter = () => {
    showTooltip();
  };

  const handleMouseLeave = () => {
    if (!isAbsolutePositioned) {
      setIsVisible(false);
    }
    // For absolute positioned tooltips, rely on the timeout
  };

  const getTooltipClasses = () => {
    const baseClasses = 'px-3 py-2 bg-zinc-800 text-white text-sm rounded shadow-lg z-50 border border-zinc-700';

    if (isAbsolutePositioned) {
      // Absolute positioned tooltips: max 25% width, allow text wrapping
      const absoluteClasses = `${baseClasses} max-w-[25%] whitespace-normal break-words`;

      switch (position) {
        case 'bottom-left':
          return `${absoluteClasses} fixed bottom-4 left-4`;
        case 'bottom-right':
          return `${absoluteClasses} fixed bottom-4 right-4`;
        default:
          return absoluteClasses;
      }
    }

    // Regular tooltips: no wrapping
    const regularClasses = `${baseClasses} whitespace-nowrap`;

    switch (position) {
      case 'top':
        return `${regularClasses} absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${regularClasses} absolute top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${regularClasses} absolute right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${regularClasses} absolute left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${regularClasses} absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute border-4 border-transparent';

    switch (position) {
      case 'top':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 border-t-zinc-800`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 border-b-zinc-800`;
      case 'left':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 border-l-zinc-800`;
      case 'right':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 border-r-zinc-800`;
      case 'bottom-left':
      case 'bottom-right':
        return ''; // No arrow for fixed positioned tooltips
      default:
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 border-t-zinc-800`;
    }
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <>
          <div className={getTooltipClasses()}>
            {content}
          </div>
          <div className={getArrowClasses()} />
        </>
      )}
    </div>
  );
}