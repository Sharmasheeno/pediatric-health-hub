import React, { useEffect, useRef } from 'react';

/**
 * Reveal — scroll-triggered entrance animation for the public landing page.
 *
 * Wraps content in a div that starts hidden (see the `.reveal` classes in
 * index.css) and fades/slides in the first time it enters the viewport.
 * `variant`: up (default) | left | right | zoom. `delay` staggers groups
 * of cards (milliseconds). Reduced-motion users are covered by the global
 * prefers-reduced-motion rule in index.css.
 */
export const Reveal = ({ children, variant = 'up', delay = 0, className = '', ...props }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const variantClass = variant === 'up' ? '' : `reveal-${variant}`;

  return (
    <div
      ref={ref}
      className={`reveal ${variantClass} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
};
