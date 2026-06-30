import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

type SmoothLangTextProps = {
  text: string;
  className?: string;
  as?: 'span' | 'p';
};

/**
 * Cross-fades label text when language (or any copy) changes — same easing family as Luna29 ink motion.
 */
export const SmoothLangText: React.FC<SmoothLangTextProps> = ({ text, className = '', as: Tag = 'span' }) => (
  <Tag className="relative inline-grid align-middle [grid-template-columns:max-content]" aria-live="polite">
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={text}
        initial={{ opacity: 0, y: 5, filter: 'blur(3px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -5, filter: 'blur(3px)' }}
        transition={{ duration: 0.42, ease: [0.22, 0.61, 0.36, 1] }}
        className={`col-start-1 row-start-1 inline-block ${className}`.trim()}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  </Tag>
);

/** Same stepped color cycle as the Luna29 wordmark (`animate-color-shift-luna`, 12s). */
export const LunaShimmerText: React.FC<SmoothLangTextProps> = ({ text, className = '', as }) => (
  <SmoothLangText text={text} as={as} className={`animate-color-shift-luna ${className}`.trim()} />
);

type LunaMenuLabelProps = {
  text: string;
  active?: boolean;
  muted?: boolean;
  className?: string;
};

/** Nav / footer label: lang morph + Luna29 wordmark color cycle. */
export const LunaMenuLabel: React.FC<LunaMenuLabelProps> = ({ text, active = false, muted = false, className = '' }) => (
  <LunaShimmerText
    text={text}
    className={`transition-opacity duration-300 ${
      active ? 'font-bold opacity-100' : muted ? 'opacity-75 hover:opacity-100' : 'opacity-90 hover:opacity-100'
    } ${className}`.trim()}
  />
);
