import React from 'react';
import { PUBLIC_SHELL, PUBLIC_SHELL_INNER, PUBLIC_SHELL_PAD, PUBLIC_SURFACE } from '../public/publicPageStyles';

type LunaPageContentSectionProps = {
  themeClass: string;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
};

export const LunaPageContentSection: React.FC<LunaPageContentSectionProps> = ({
  themeClass,
  children,
  className = '',
  padded = true,
}) => (
  <section className={`${PUBLIC_SHELL} ${themeClass} ${PUBLIC_SHELL_PAD}`}>
    <div className={`${PUBLIC_SHELL_INNER} ${padded ? `${PUBLIC_SURFACE} space-y-5` : ''} ${className}`.trim()}>
      {children}
    </div>
  </section>
);
