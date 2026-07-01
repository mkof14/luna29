import React from 'react';
import { PublicHeroBlock } from '../public/PublicHeroBlock';
import {
  PUBLIC_BODY,
  PUBLIC_CARD_SOFT,
  PUBLIC_H3,
  PUBLIC_SHELL,
  PUBLIC_SHELL_INNER,
  PUBLIC_SHELL_PAD,
} from '../public/publicPageStyles';

export type LunaPageHeroSectionProps = {
  themeClass: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  caption?: string;
  chip?: React.ReactNode;
  tips?: string[];
  tipsTitle?: string;
};

export const LunaPageHeroSection: React.FC<LunaPageHeroSectionProps> = ({
  themeClass,
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  imagePosition = 'center 32%',
  caption,
  chip,
  tips,
  tipsTitle,
}) => (
  <>
    <section className={`${PUBLIC_SHELL} ${themeClass} ${PUBLIC_SHELL_PAD}`}>
      <div className={PUBLIC_SHELL_INNER}>
        <PublicHeroBlock
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          image={image}
          imageAlt={imageAlt}
          imagePosition={imagePosition}
          caption={caption}
          chip={chip}
        />
      </div>
    </section>

    {tips && tips.length > 0 && (
      <section className={`${PUBLIC_SHELL} ${themeClass} ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} space-y-4`}>
          {tipsTitle && <h2 className={PUBLIC_H3}>{tipsTitle}</h2>}
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tips.map((tip) => (
              <li key={tip} className={`${PUBLIC_CARD_SOFT} list-none`}>
                <p className={PUBLIC_BODY}>{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )}
  </>
);
