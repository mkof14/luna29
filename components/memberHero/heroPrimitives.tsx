import React from 'react';

/** Shared SVG helpers — light/dark layers toggled via styles.css */
export type SceneProps = { uid: string };

export const HeroLayerLight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g className="hero-layer-light">{children}</g>
);

export const HeroLayerDark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g className="hero-layer-dark hidden">{children}</g>
);

export const DualLayer: React.FC<{ light: React.ReactNode; dark: React.ReactNode }> = ({ light, dark }) => (
  <>
    <HeroLayerLight>{light}</HeroLayerLight>
    <HeroLayerDark>{dark}</HeroLayerDark>
  </>
);

export const Atmosphere: React.FC<{ uid: string; accentLight: string; accentDark: string }> = ({
  uid,
  accentLight,
  accentDark,
}) => (
  <>
    <defs>
      <linearGradient id={`${uid}-sky-light`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff9f4" />
        <stop offset="40%" stopColor={accentLight} stopOpacity="0.55" />
        <stop offset="100%" stopColor="#ebe3ea" stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id={`${uid}-sky-dark`} x1="0%" y1="0%" x2="90%" y2="100%">
        <stop offset="0%" stopColor="#0c1222" />
        <stop offset="45%" stopColor={accentDark} stopOpacity="0.7" />
        <stop offset="100%" stopColor="#151038" />
      </linearGradient>
      <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#000" stopOpacity="0" />
        <stop offset="78%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.12" />
      </linearGradient>
    </defs>
    <rect className="hero-sky-light" width="100%" height="100%" fill={`url(#${uid}-sky-light)`} />
    <rect className="hero-sky-dark hidden" width="100%" height="100%" fill={`url(#${uid}-sky-dark)`} />
  </>
);

export const SceneWrap: React.FC<{
  uid: string;
  accentLight: string;
  accentDark: string;
  children: React.ReactNode;
}> = ({ uid, accentLight, accentDark, children }) => (
  <svg viewBox="0 0 1200 280" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
    <Atmosphere uid={uid} accentLight={accentLight} accentDark={accentDark} />
    <g opacity="0.98">{children}</g>
    <rect width="100%" height="100%" fill={`url(#${uid}-fade)`} opacity="0.35" />
  </svg>
);

/** Moon phase disc: 0=new … 1=full */
export const MoonPhase: React.FC<{ cx: number; cy: number; r: number; phase: number; stroke?: string; fill?: string }> = ({
  cx,
  cy,
  r,
  phase,
  stroke = 'rgba(109,40,217,0.35)',
  fill = 'rgba(255,255,255,0.75)',
}) => {
  const shadow = r * 2 * (1 - phase);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth="1.5" />
      {phase < 1 && <circle cx={cx + r - shadow} cy={cy} r={r} fill="rgba(80,70,100,0.22)" />}
    </g>
  );
};

export const WindowFrame: React.FC<{ x: number; y: number; w: number; h: number; glow?: string }> = ({
  x,
  y,
  w,
  h,
  glow = 'rgba(251,191,36,0.35)',
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(134,120,151,0.45)" strokeWidth="2" />
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
    <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
    <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx="4" fill={glow} opacity="0.5" />
  </g>
);
