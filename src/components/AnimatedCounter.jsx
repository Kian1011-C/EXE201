import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'motion/react';

export default function AnimatedCounter({ target, suffix = '', duration = 1.6 }) {
  // Initialize with target value so text crawlers and scrapers extract the full number
  const [count, setCount] = useState(target);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView || hasAnimated) return;
    setHasAnimated(true);

    let start = 0;
    const end = parseInt(target, 10);
    if (isNaN(end)) {
      setCount(target);
      return;
    }

    // Reset to 0 when user scrolls into view to trigger smooth count-up
    setCount(0);

    const totalSteps = 60;
    const stepTime = (duration * 1000) / totalSteps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const easeOut = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(start + (end - start) * easeOut);
      
      setCount(current);

      if (step >= totalSteps) {
        clearInterval(timer);
        setCount(end);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, target, duration, hasAnimated]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}
