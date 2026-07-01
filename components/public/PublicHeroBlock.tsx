import React from 'react';
import {
  PUBLIC_EYEBROW,
  PUBLIC_H1,
  PUBLIC_HERO_FRAME,
  PUBLIC_HERO_IMG,
  PUBLIC_LEAD,
} from './publicPageStyles';

export type PublicHeroBlockProps = {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  caption?: string;
  chip?: React.ReactNode;
  children?: React.ReactNode;
};

export const PublicHeroBlock: React.FC<PublicHeroBlockProps> = ({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  image,
  imageAlt,
  imagePosition = 'center 38%',
  caption,
  chip,
  children,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-6 sm:gap-8 items-center min-w-0 w-full">
    <header className="space-y-4 min-w-0">
      {eyebrow && <p className={PUBLIC_EYEBROW}>{eyebrow}</p>}
      <h1 className={PUBLIC_H1}>
        {title}
        {titleAccent && <span className="block text-luna-purple">{titleAccent}</span>}
      </h1>
      {subtitle && <p className={PUBLIC_LEAD}>{subtitle}</p>}
      {chip}
      {children}
    </header>

    <div className={`${PUBLIC_HERO_FRAME} h-52 sm:h-56 md:h-72 lg:h-80 shrink-0`}>
      <img
        src={image}
        alt={imageAlt}
        loading="eager"
        decoding="async"
        className={`h-full ${PUBLIC_HERO_IMG}`}
        style={{ objectPosition: imagePosition }}
      />
      {caption && (
        <p className="absolute inset-x-0 bottom-0 z-10 px-5 pb-4 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-gradient-to-t from-slate-100/95 via-slate-100/70 to-transparent dark:from-slate-950/95 dark:via-slate-950/70">
          {caption}
        </p>
      )}
    </div>
  </div>
);
