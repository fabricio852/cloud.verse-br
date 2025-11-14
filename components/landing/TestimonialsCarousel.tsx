import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { seededShuffle } from '../../utils';

type TestimonialItem = {
  src: string;
  alt?: string;
  text?: string;
};

interface TestimonialsCarouselProps {
  items?: TestimonialItem[];
  autoPlayMs?: number;
  seed?: string;
  max?: number;
  height?: number; // px
  variant?: 'standalone' | 'embedded';
  className?: string;
  wrapClassName?: string;
}

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  items,
  autoPlayMs = 3500,
  seed,
  max = 12,
  height = 320,
  variant = 'standalone',
  className = '',
  wrapClassName = '',
}) => {
  const [loadedItems, setLoadedItems] = useState<TestimonialItem[]>([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Load from /testimonials/index.json if items not provided
  useEffect(() => {
    if (items && items.length) {
      setLoadedItems(items);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const base = (import.meta as any)?.env?.BASE_URL || '/';
        const url = `${base.replace(/\/$/, '')}/testimonials/index.json`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return;
        const data: TestimonialItem[] = await res.json();
        if (!cancelled) setLoadedItems(data || []);
      } catch {
        // fallback silencioso para evitar quebra se o JSON nao estiver presente
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [items]);

  // Shuffle deterministically (seed) or randomly
  const ordered = useMemo(() => {
    const base = [...loadedItems];
    const list = seed ? seededShuffle(base, seed) : base.sort(() => Math.random() - 0.5);
    return list.slice(0, Math.max(1, max));
  }, [loadedItems, seed, max]);

  // Autoplay
  useEffect(() => {
    if (ordered.length <= 1) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % ordered.length);
    }, autoPlayMs) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [ordered.length, autoPlayMs]);

  if (ordered.length === 0) {
    return null;
  }

  const current = ordered[index];
  const base = (import.meta as any)?.env?.BASE_URL || '/';
  const resolveSrc = (src?: string) => {
    if (!src) return '';
    // se comecar com '/', prefixa base (suporte a subpath)
    if (src.startsWith('/')) return `${base.replace(/\/$/, '')}${src}`;
    // se vier so o nome do arquivo, assume dentro de /testimonials
    return `${base.replace(/\/$/, '')}/testimonials/${src}`;
  };

  const cardHeight = Math.max(180, height);

  const card = (
    <div className={className} style={{ minHeight: cardHeight }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${index}-${current.src}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="w-full flex items-center justify-center"
          style={{ minHeight: cardHeight, height: cardHeight }}
        >
          <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_35px_120px_-70px_rgba(15,23,42,0.95)]">
            <img
              src={resolveSrc(current.src)}
              alt={current.alt || 'Depoimento'}
              className="h-full w-full object-cover object-top select-none"
              loading="lazy"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  if (variant === 'embedded') {
    return card;
  }

  const sectionClasses = ['px-4', 'pt-4'].filter(Boolean).join(' ');
  const wrapperClasses = ['max-w-5xl', 'mx-auto', wrapClassName].filter(Boolean).join(' ');

  return (
    <section className={sectionClasses}>
      <div className={wrapperClasses}>{card}</div>
    </section>
  );
};
