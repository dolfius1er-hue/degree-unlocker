import React, { useState, useEffect, useRef } from 'react';
import './TrueFocus.css';

export interface TrueFocusProps {
  sentence?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
}

export const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence = 'Degree Unlocker Lite',
  manualMode = false,
  blurAmount = 4,
  borderColor = '#6366f1',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1.2,
  className = ''
}) => {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [borderRect, setBorderRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (manualMode) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % words.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);
    return () => clearInterval(interval);
  }, [manualMode, words.length, animationDuration, pauseBetweenAnimations]);

  useEffect(() => {
    const el = wordRefs.current[currentIndex];
    const container = containerRef.current;
    if (el && container) {
      const elRect = el.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      setBorderRect({
        left: elRect.left - contRect.left - 4,
        top: elRect.top - contRect.top - 2,
        width: elRect.width + 8,
        height: elRect.height + 4
      });
    }
  }, [currentIndex, sentence]);

  return (
    <div 
      ref={containerRef} 
      className={`true-focus ${className}`.trim()}
      style={{
        ['--tf-border-color' as any]: borderColor,
        ['--tf-duration' as any]: `${animationDuration}s`
      }}
    >
      {words.map((word, i) => {
        const isActive = i === currentIndex;
        return (
          <span
            key={`${word}-${i}`}
            ref={el => { wordRefs.current[i] = el; }}
            onClick={() => manualMode && setCurrentIndex(i)}
            onMouseEnter={() => manualMode && setCurrentIndex(i)}
            className={`true-focus__word ${isActive ? 'true-focus__word--active' : 'true-focus__word--blurred'}`}
            style={{
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`
            }}
          >
            {word}
          </span>
        );
      })}
      {borderRect && (
        <span 
          className="true-focus__border"
          style={{
            left: `${borderRect.left}px`,
            top: `${borderRect.top}px`,
            width: `${borderRect.width}px`,
            height: `${borderRect.height}px`
          }}
        />
      )}
    </div>
  );
};

export default TrueFocus;
