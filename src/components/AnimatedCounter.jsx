import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'motion/react';

export default function AnimatedCounter({ target, suffix = '', duration = 1.6 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = parseInt(target, 10);
    if (isNaN(end)) {
      setCount(target);
      return;
    }

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
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}
