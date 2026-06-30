import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'text' | 'animated';
}

/**
 * Luna29 Logo Component
 * Renders the brand wordmark "Luna29".
 */
export const Logo: React.FC<LogoProps> = ({ className = "", size = "md", variant = 'text' }) => {
  const gradientSeed = useId().replace(/:/g, '');
  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
    xl: 'text-9xl',
  };

  if (variant === 'animated') {
    const strokeGradientId = `luna-ink-stroke-${gradientSeed}`;
    const fillGradientId = `luna-ink-fill-${gradientSeed}`;
    const suffixGradientId = `luna-ink-suffix-${gradientSeed}`;
    const letters = [
      { char: 'L', x: 30, dash: 170, delay: 0 },
      { char: 'u', x: 95, dash: 150, delay: 0.5 },
      { char: 'n', x: 140, dash: 150, delay: 1.0 },
      { char: 'a', x: 184, dash: 150, delay: 1.5 },
    ];

    return (
      <div className={`${className} flex items-center justify-center`}>
        <svg 
          viewBox="0 0 240 100" 
          className="w-full h-auto overflow-visible luna-ink-scene"
          style={{ maxWidth: '450px' }}
        >
          <defs>
            <linearGradient id={strokeGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f766e">
                <animate
                  attributeName="stop-color"
                  values="#0f766e;#7c3aed;#be123c;#1d4ed8;#0f766e"
                  dur="14.4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#0ea5e9">
                <animate
                  attributeName="stop-color"
                  values="#0ea5e9;#ec4899;#f97316;#14b8a6;#0ea5e9"
                  dur="14.4s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
            <linearGradient id={fillGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9">
                <animate
                  attributeName="stop-color"
                  values="#0ea5e9;#ec4899;#f97316;#14b8a6;#0ea5e9"
                  dur="14.4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#0f766e">
                <animate
                  attributeName="stop-color"
                  values="#0f766e;#7c3aed;#be123c;#1d4ed8;#0f766e"
                  dur="14.4s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
            <linearGradient id={suffixGradientId} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b">
                <animate
                  attributeName="stop-color"
                  values="#f59e0b;#ec4899;#a855f7;#2dd4bf;#f59e0b"
                  dur="20s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#f97316">
                <animate
                  attributeName="stop-color"
                  values="#f97316;#8b5cf6;#14b8a6;#fb7185;#f97316"
                  dur="20s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>

          <style>
            {`
              @keyframes luna-script-letter {
                0%, 12% {
                  stroke-dashoffset: var(--word-dash);
                  stroke-opacity: 0;
                  fill-opacity: 0;
                  opacity: 0;
                }
                42%, 74% {
                  stroke-dashoffset: 0;
                  stroke-opacity: 1;
                  fill-opacity: 1;
                  opacity: 1;
                }
                100% {
                  stroke-dashoffset: 0;
                  stroke-opacity: 0;
                  fill-opacity: 0;
                  opacity: 0;
                }
              }
              @keyframes luna-ink-float {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-1.5px) scale(1.008); }
              }
              .luna-ink-letters {
                animation: luna-ink-float 5s ease-in-out infinite;
                transform-origin: center;
              }
              .luna-ink-letter {
                stroke: url(#${strokeGradientId});
                fill: url(#${fillGradientId});
                stroke-width: 1.85;
                stroke-linecap: round;
                stroke-linejoin: round;
                fill-opacity: 0;
                stroke-opacity: 0;
                opacity: 0;
                filter: drop-shadow(0 0 3px rgba(34, 211, 238, 0.35));
              }
              .luna-ink-suffix {
                fill: url(#${suffixGradientId});
                opacity: 0.95;
              }
            `}
          </style>

          <g className="font-brand luna-ink-letters" style={{ fontSize: '6.5rem' }}>
            {letters.map((letter) => (
              <text
                key={letter.char}
                x={letter.x}
                y="68"
                className="luna-ink-letter"
                strokeDasharray={letter.dash}
                strokeDashoffset={letter.dash}
                style={{
                  ['--word-dash' as string]: `${letter.dash}`,
                  animation: 'luna-script-letter 4.2s cubic-bezier(0.22, 0.61, 0.36, 1) infinite',
                  animationDelay: `${letter.delay}s`,
                }}
              >
                {letter.char}
              </text>
            ))}
            <text x="228" y="68" className="luna-ink-suffix font-brand" style={{ fontSize: '3.8rem', fontWeight: 900 }}>
              29
            </text>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <span className={`font-brand leading-none pt-1 select-none transition-all hover:scale-105 active:scale-95 cursor-pointer inline-flex items-baseline gap-[0.14em] drop-shadow-sm ${sizeClasses[size]} ${className}`}>
      <span className="animate-color-shift-luna shrink-0">Luna</span>
      <span className="text-[0.58em] font-black tracking-tight leading-none translate-y-[0.04em] ml-[0.06em] shrink-0 animate-color-shift-luna-suffix">29</span>
    </span>
  );
};
