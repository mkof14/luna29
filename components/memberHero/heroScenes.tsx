import React from 'react';
import { TabType } from '../../utils/navigation';
import { DualLayer, MoonPhase, SceneProps, SceneWrap, WindowFrame } from './heroPrimitives';

/* ── Today: dawn window + mirror on sill ── */
const TodayScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#f2ccda" accentDark="#4c1d95">
    <DualLayer
      light={
        <>
          <WindowFrame x={720} y={40} w={180} h={140} glow="rgba(251,191,36,0.55)" />
          <circle cx="810" cy="70" r="28" fill="rgba(251,191,36,0.65)" />
          <rect x="700" y="185" width="220" height="12" rx="4" fill="rgba(180,160,140,0.55)" />
          <rect x="780" y="155" width="60" height="32" rx="4" fill="rgba(200,210,230,0.7)" stroke="rgba(134,120,151,0.45)" strokeWidth="1.5" />
          <ellipse cx="810" cy="168" rx="22" ry="28" fill="rgba(210,220,240,0.5)" stroke="rgba(134,120,151,0.35)" strokeWidth="1.2" />
          <rect x="795" y="187" width="30" height="6" rx="2" fill="rgba(160,150,170,0.4)" />
        </>
      }
      dark={
        <>
          <WindowFrame x={720} y={40} w={180} h={140} glow="rgba(129,140,248,0.35)" />
          <circle cx="810" cy="70" r="22" fill="rgba(196,181,253,0.55)" />
          <rect x="700" y="185" width="220" height="12" rx="4" fill="rgba(55,48,80,0.75)" />
          <rect x="780" y="155" width="60" height="32" rx="4" fill="rgba(67,56,120,0.65)" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" />
          <ellipse cx="810" cy="168" rx="22" ry="28" fill="rgba(76,29,149,0.35)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.2" />
          <rect x="795" y="187" width="30" height="6" rx="2" fill="rgba(109,40,217,0.45)" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Journey: open journal + numbered path ── */
const JourneyScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#d6dff7" accentDark="#312e81">
    <DualLayer
      light={
        <>
          <path d="M380 210 L380 80 Q480 65 520 90 L520 210 Z" fill="rgba(255,252,245,0.85)" stroke="rgba(134,120,151,0.45)" strokeWidth="1.5" />
          <path d="M520 210 L520 85 Q620 70 660 95 L660 210 Z" fill="rgba(242,204,218,0.45)" stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
          <line x1="450" y1="120" x2="500" y2="120" stroke="rgba(109,40,217,0.25)" strokeWidth="1.5" />
          <line x1="450" y1="140" x2="490" y2="140" stroke="rgba(109,40,217,0.2)" strokeWidth="1.5" />
          <line x1="450" y1="160" x2="505" y2="160" stroke="rgba(109,40,217,0.2)" strokeWidth="1.5" />
          <path d="M720 200 C820 170 880 130 980 110" fill="none" stroke="rgba(134,120,151,0.5)" strokeWidth="2.5" strokeDasharray="8 10" />
          {[1, 2, 3, 4, 5].map((n, i) => (
            <g key={n}>
              <circle cx={740 + i * 55} cy={195 - i * 14} r="14" fill="rgba(255,255,255,0.7)" stroke="rgba(109,40,217,0.35)" strokeWidth="1.5" />
              <text x={740 + i * 55} y={200 - i * 14} textAnchor="middle" fill="rgba(109,40,217,0.6)" fontSize="11" fontWeight="600" fontFamily="Georgia, serif">{n}</text>
            </g>
          ))}
        </>
      }
      dark={
        <>
          <path d="M380 210 L380 80 Q480 65 520 90 L520 210 Z" fill="rgba(30,27,75,0.75)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          <path d="M520 210 L520 85 Q620 70 660 95 L660 210 Z" fill="rgba(76,29,149,0.35)" stroke="rgba(167,139,250,0.3)" strokeWidth="1.5" />
          <line x1="450" y1="120" x2="500" y2="120" stroke="rgba(196,181,253,0.3)" strokeWidth="1.5" />
          <line x1="450" y1="140" x2="490" y2="140" stroke="rgba(196,181,253,0.25)" strokeWidth="1.5" />
          <line x1="450" y1="160" x2="505" y2="160" stroke="rgba(196,181,253,0.25)" strokeWidth="1.5" />
          <path d="M720 200 C820 170 880 130 980 110" fill="none" stroke="rgba(167,139,250,0.45)" strokeWidth="2.5" strokeDasharray="8 10" />
          {[1, 2, 3, 4, 5].map((n, i) => (
            <g key={n}>
              <circle cx={740 + i * 55} cy={195 - i * 14} r="14" fill="rgba(49,46,129,0.8)" stroke="rgba(167,139,250,0.45)" strokeWidth="1.5" />
              <text x={740 + i * 55} y={200 - i * 14} textAnchor="middle" fill="rgba(196,181,253,0.85)" fontSize="11" fontWeight="600" fontFamily="Georgia, serif">{n}</text>
            </g>
          ))}
        </>
      }
    />
  </SceneWrap>
);

/* ── Cycle: moon phases arc + 28 day label ── */
const CycleScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#e9dee6" accentDark="#3730a3">
    <DualLayer
      light={
        <>
          <path d="M200 190 Q420 60 600 100 T1000 130" fill="none" stroke="rgba(109,40,217,0.28)" strokeWidth="2" />
          {[0, 0.15, 0.35, 0.5, 0.75, 1].map((phase, i) => (
            <MoonPhase key={i} cx={260 + i * 130} cy={150 - Math.sin(i * 0.9) * 30} r={18} phase={phase} />
          ))}
          <rect x="820" y="170" width="120" height="36" rx="8" fill="rgba(255,255,255,0.6)" stroke="rgba(109,40,217,0.3)" strokeWidth="1.5" />
          <text x="880" y="193" textAnchor="middle" fill="rgba(109,40,217,0.65)" fontSize="16" fontWeight="700" fontFamily="Georgia, serif">28 days</text>
        </>
      }
      dark={
        <>
          <path d="M200 190 Q420 60 600 100 T1000 130" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="2" />
          {[0, 0.15, 0.35, 0.5, 0.75, 1].map((phase, i) => (
            <MoonPhase key={i} cx={260 + i * 130} cy={150 - Math.sin(i * 0.9) * 30} r={18} phase={phase} stroke="rgba(167,139,250,0.45)" fill="rgba(196,181,253,0.55)" />
          ))}
          <rect x="820" y="170" width="120" height="36" rx="8" fill="rgba(49,46,129,0.75)" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" />
          <text x="880" y="193" textAnchor="middle" fill="rgba(196,181,253,0.9)" fontSize="16" fontWeight="700" fontFamily="Georgia, serif">28 days</text>
        </>
      }
    />
  </SceneWrap>
);

/* ── Knowledge: two open books + magnifying glass ── */
const KnowledgeScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#d6dff7" accentDark="#1e3a8a">
    <DualLayer
      light={
        <>
          <path d="M340 210 L340 85 Q420 70 420 130 L420 210 Z" fill="rgba(255,252,245,0.85)" stroke="rgba(134,120,151,0.4)" strokeWidth="1.5" />
          <path d="M430 210 L430 80 Q520 62 520 125 L520 210 Z" fill="rgba(242,204,218,0.5)" stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
          <line x1="360" y1="110" x2="400" y2="110" stroke="rgba(109,40,217,0.2)" strokeWidth="1.2" />
          <line x1="360" y1="130" x2="395" y2="130" stroke="rgba(109,40,217,0.18)" strokeWidth="1.2" />
          <line x1="450" y1="105" x2="500" y2="105" stroke="rgba(109,40,217,0.2)" strokeWidth="1.2" />
          <circle cx="780" cy="130" r="42" fill="none" stroke="rgba(109,40,217,0.45)" strokeWidth="3" />
          <line x1="810" y1="160" x2="840" y2="190" stroke="rgba(134,120,151,0.5)" strokeWidth="4" strokeLinecap="round" />
        </>
      }
      dark={
        <>
          <path d="M340 210 L340 85 Q420 70 420 130 L420 210 Z" fill="rgba(30,58,138,0.55)" stroke="rgba(147,197,253,0.35)" strokeWidth="1.5" />
          <path d="M430 210 L430 80 Q520 62 520 125 L520 210 Z" fill="rgba(76,29,149,0.35)" stroke="rgba(147,197,253,0.3)" strokeWidth="1.5" />
          <line x1="360" y1="110" x2="400" y2="110" stroke="rgba(147,197,253,0.3)" strokeWidth="1.2" />
          <line x1="360" y1="130" x2="395" y2="130" stroke="rgba(147,197,253,0.25)" strokeWidth="1.2" />
          <line x1="450" y1="105" x2="500" y2="105" stroke="rgba(147,197,253,0.3)" strokeWidth="1.2" />
          <circle cx="780" cy="130" r="42" fill="none" stroke="rgba(147,197,253,0.55)" strokeWidth="3" />
          <line x1="810" y1="160" x2="840" y2="190" stroke="rgba(196,181,253,0.5)" strokeWidth="4" strokeLinecap="round" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Profile: portrait frame + settings gear ── */
const ProfileScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#f5ebe4" accentDark="#4c1d95">
    <DualLayer
      light={
        <>
          <rect x="520" y="55" width="160" height="170" rx="10" fill="rgba(255,252,245,0.7)" stroke="rgba(134,120,151,0.45)" strokeWidth="2.5" />
          <ellipse cx="600" cy="115" rx="38" ry="44" fill="rgba(242,204,218,0.55)" />
          <path d="M555 175 Q600 145 645 175" fill="none" stroke="rgba(134,120,151,0.4)" strokeWidth="2" />
          <circle cx="720" cy="100" r="28" fill="rgba(255,255,255,0.65)" stroke="rgba(109,40,217,0.35)" strokeWidth="2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect key={deg} x="717" y="72" width="6" height="14" rx="2" fill="rgba(109,40,217,0.4)" transform={`rotate(${deg} 720 100)`} />
          ))}
          <circle cx="720" cy="100" r="10" fill="rgba(109,40,217,0.25)" />
        </>
      }
      dark={
        <>
          <rect x="520" y="55" width="160" height="170" rx="10" fill="rgba(49,46,129,0.65)" stroke="rgba(167,139,250,0.4)" strokeWidth="2.5" />
          <ellipse cx="600" cy="115" rx="38" ry="44" fill="rgba(76,29,149,0.45)" />
          <path d="M555 175 Q600 145 645 175" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="2" />
          <circle cx="720" cy="100" r="28" fill="rgba(30,27,75,0.8)" stroke="rgba(167,139,250,0.45)" strokeWidth="2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect key={deg} x="717" y="72" width="6" height="14" rx="2" fill="rgba(196,181,253,0.55)" transform={`rotate(${deg} 720 100)`} />
          ))}
          <circle cx="720" cy="100" r="10" fill="rgba(167,139,250,0.35)" />
        </>
      }
    />
  </SceneWrap>
);

/* ── My Day: coffee cup + candle + sun/moon ── */
const MyDayScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#fcefd9" accentDark="#5b21b6">
    <DualLayer
      light={
        <>
          <circle cx="280" cy="90" r="32" fill="rgba(251,191,36,0.6)" stroke="rgba(251,146,60,0.4)" strokeWidth="2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line key={deg} x1="280" y1="90" x2={280 + Math.cos((deg * Math.PI) / 180) * 48} y2={90 + Math.sin((deg * Math.PI) / 180) * 48} stroke="rgba(251,191,36,0.45)" strokeWidth="2" strokeLinecap="round" />
          ))}
          <path d="M480 210 L480 150 Q520 130 560 150 L560 210 Z" fill="rgba(255,255,255,0.7)" stroke="rgba(134,120,151,0.4)" strokeWidth="1.5" />
          <ellipse cx="520" cy="150" rx="42" ry="8" fill="rgba(180,140,100,0.45)" />
          <rect x="515" y="120" width="10" height="18" rx="3" fill="rgba(255,255,255,0.8)" stroke="rgba(134,120,151,0.3)" strokeWidth="1" />
          <ellipse cx="520" cy="118" rx="6" ry="10" fill="rgba(251,191,36,0.55)" />
          <MoonPhase cx={820} cy={95} r={22} phase={0.35} />
        </>
      }
      dark={
        <>
          <circle cx="280" cy="90" r="28" fill="rgba(196,181,253,0.35)" stroke="rgba(167,139,250,0.4)" strokeWidth="2" />
          <path d="M480 210 L480 150 Q520 130 560 150 L560 210 Z" fill="rgba(49,46,129,0.7)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          <ellipse cx="520" cy="150" rx="42" ry="8" fill="rgba(76,29,149,0.5)" />
          <rect x="515" y="120" width="10" height="18" rx="3" fill="rgba(76,29,149,0.6)" stroke="rgba(167,139,250,0.35)" strokeWidth="1" />
          <ellipse cx="520" cy="118" rx="6" ry="10" fill="rgba(251,191,36,0.45)" />
          <MoonPhase cx={820} cy={95} r={22} phase={0.35} stroke="rgba(167,139,250,0.45)" fill="rgba(196,181,253,0.5)" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Voice: studio mic + sound waves ── */
const VoiceScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#f2ccda" accentDark="#4338ca">
    <DualLayer
      light={
        <>
          <line x1="560" y1="210" x2="560" y2="130" stroke="rgba(134,120,151,0.5)" strokeWidth="3" />
          <ellipse cx="560" cy="115" rx="22" ry="28" fill="rgba(60,60,70,0.75)" stroke="rgba(134,120,151,0.4)" strokeWidth="1.5" />
          <rect x="548" y="85" width="24" height="18" rx="4" fill="rgba(80,80,90,0.7)" />
          <path d="M538 115 Q560 145 582 115" fill="none" stroke="rgba(134,120,151,0.35)" strokeWidth="2" />
          {[1, 2, 3].map((i) => (
            <path key={i} d={`M${620 + i * 8} 140 Q${640 + i * 30} ${120 - i * 10} ${660 + i * 55} 140 Q${640 + i * 30} ${160 + i * 10} ${620 + i * 8} 140`} fill="none" stroke="rgba(109,40,217,0.35)" strokeWidth="2" />
          ))}
        </>
      }
      dark={
        <>
          <line x1="560" y1="210" x2="560" y2="130" stroke="rgba(167,139,250,0.45)" strokeWidth="3" />
          <ellipse cx="560" cy="115" rx="22" ry="28" fill="rgba(30,27,75,0.85)" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" />
          <rect x="548" y="85" width="24" height="18" rx="4" fill="rgba(49,46,129,0.8)" />
          <path d="M538 115 Q560 145 582 115" fill="none" stroke="rgba(167,139,250,0.35)" strokeWidth="2" />
          {[1, 2, 3].map((i) => (
            <path key={i} d={`M${620 + i * 8} 140 Q${640 + i * 30} ${120 - i * 10} ${660 + i * 55} 140 Q${640 + i * 30} ${160 + i * 10} ${620 + i * 8} 140`} fill="none" stroke="rgba(196,181,253,0.45)" strokeWidth="2" />
          ))}
        </>
      }
    />
  </SceneWrap>
);

/* ── Voice Files: audio cards + waveform panel ── */
const VoiceFilesScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#e9dee6" accentDark="#312e81">
    <DualLayer
      light={
        <>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${400 + i * 90}, ${90 + i * 6}) rotate(${-4 + i * 4} ${440 + i * 90} 140)`}>
              <rect x="0" y="0" width="72" height="95" rx="10" fill="rgba(255,255,255,0.65)" stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
              <polygon points="28,48 28,68 44,58" fill="rgba(109,40,217,0.5)" />
            </g>
          ))}
          <rect x="780" y="85" width="180" height="110" rx="12" fill="rgba(255,255,255,0.55)" stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <rect key={i} x={800 + i * 14} y={130 - [8, 18, 12, 24, 16, 28, 14, 22, 10, 20][i]} width="8" height={[8, 18, 12, 24, 16, 28, 14, 22, 10, 20][i]} rx="2" fill="rgba(109,40,217,0.4)" />
          ))}
        </>
      }
      dark={
        <>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${400 + i * 90}, ${90 + i * 6}) rotate(${-4 + i * 4} ${440 + i * 90} 140)`}>
              <rect x="0" y="0" width="72" height="95" rx="10" fill="rgba(49,46,129,0.75)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
              <polygon points="28,48 28,68 44,58" fill="rgba(196,181,253,0.55)" />
            </g>
          ))}
          <rect x="780" y="85" width="180" height="110" rx="12" fill="rgba(30,27,75,0.75)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <rect key={i} x={800 + i * 14} y={130 - [8, 18, 12, 24, 16, 28, 14, 22, 10, 20][i]} width="8" height={[8, 18, 12, 24, 16, 28, 14, 22, 10, 20][i]} rx="2" fill="rgba(196,181,253,0.45)" />
          ))}
        </>
      }
    />
  </SceneWrap>
);

/* ── Home: cozy house with lit windows ── */
export const HomeScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#f5ebe4" accentDark="#3730a3">
    <DualLayer
      light={
        <>
          <path d="M500 200 L500 120 L580 70 L660 120 L660 200 Z" fill="rgba(255,252,245,0.8)" stroke="rgba(134,120,151,0.45)" strokeWidth="2" />
          <path d="M480 120 L580 55 L680 120" fill="none" stroke="rgba(134,120,151,0.4)" strokeWidth="2.5" />
          <rect x="535" y="145" width="30" height="30" rx="3" fill="rgba(251,191,36,0.55)" stroke="rgba(134,120,151,0.3)" strokeWidth="1" />
          <rect x="595" y="145" width="30" height="30" rx="3" fill="rgba(251,191,36,0.45)" stroke="rgba(134,120,151,0.3)" strokeWidth="1" />
          <rect x="565" y="175" width="30" height="25" rx="3" fill="rgba(180,140,100,0.5)" stroke="rgba(134,120,151,0.3)" strokeWidth="1" />
        </>
      }
      dark={
        <>
          <path d="M500 200 L500 120 L580 70 L660 120 L660 200 Z" fill="rgba(49,46,129,0.7)" stroke="rgba(167,139,250,0.4)" strokeWidth="2" />
          <path d="M480 120 L580 55 L680 120" fill="none" stroke="rgba(167,139,250,0.35)" strokeWidth="2.5" />
          <rect x="535" y="145" width="30" height="30" rx="3" fill="rgba(251,191,36,0.4)" stroke="rgba(167,139,250,0.3)" strokeWidth="1" />
          <rect x="595" y="145" width="30" height="30" rx="3" fill="rgba(251,191,36,0.35)" stroke="rgba(167,139,250,0.3)" strokeWidth="1" />
          <rect x="565" y="175" width="30" height="25" rx="3" fill="rgba(76,29,149,0.55)" stroke="rgba(167,139,250,0.3)" strokeWidth="1" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Labs: health report + chart line ── */
const LabsScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#d6dff7" accentDark="#1e40af">
    <DualLayer
      light={
        <>
          <rect x="420" y="70" width="200" height="150" rx="8" fill="rgba(255,255,255,0.75)" stroke="rgba(134,120,151,0.4)" strokeWidth="1.5" />
          <text x="440" y="98" fill="rgba(109,40,217,0.55)" fontSize="13" fontWeight="700" fontFamily="Georgia, serif">Health Report</text>
          <line x1="440" y1="110" x2="580" y2="110" stroke="rgba(134,120,151,0.25)" strokeWidth="1" />
          <path d="M440 190 L480 150 L520 165 L560 120 L600 140 L640 105" fill="none" stroke="rgba(109,40,217,0.5)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="640" cy="105" r="5" fill="rgba(109,40,217,0.55)" />
        </>
      }
      dark={
        <>
          <rect x="420" y="70" width="200" height="150" rx="8" fill="rgba(30,58,138,0.65)" stroke="rgba(147,197,253,0.35)" strokeWidth="1.5" />
          <text x="440" y="98" fill="rgba(147,197,253,0.85)" fontSize="13" fontWeight="700" fontFamily="Georgia, serif">Health Report</text>
          <line x1="440" y1="110" x2="580" y2="110" stroke="rgba(147,197,253,0.25)" strokeWidth="1" />
          <path d="M440 190 L480 150 L520 165 L560 120 L600 140 L640 105" fill="none" stroke="rgba(147,197,253,0.55)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="640" cy="105" r="5" fill="rgba(147,197,253,0.7)" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Month: calendar grid + moon ── */
const MonthScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#e9dee6" accentDark="#4c1d95">
    <DualLayer
      light={
        <>
          <rect x="440" y="60" width="220" height="170" rx="10" fill="rgba(255,255,255,0.65)" stroke="rgba(134,120,151,0.4)" strokeWidth="1.5" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <rect key={i} x={455 + (i % 4) * 50} y={85 + Math.floor(i / 4) * 38} width="38" height="28" rx="4" fill={i === 7 ? 'rgba(242,204,218,0.55)' : 'rgba(255,255,255,0.5)'} stroke="rgba(134,120,151,0.25)" strokeWidth="1" />
          ))}
          <MoonPhase cx={780} cy={130} r={32} phase={0.6} />
        </>
      }
      dark={
        <>
          <rect x="440" y="60" width="220" height="170" rx="10" fill="rgba(49,46,129,0.7)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <rect key={i} x={455 + (i % 4) * 50} y={85 + Math.floor(i / 4) * 38} width="38" height="28" rx="4" fill={i === 7 ? 'rgba(76,29,149,0.55)' : 'rgba(30,27,75,0.55)'} stroke="rgba(167,139,250,0.25)" strokeWidth="1" />
          ))}
          <MoonPhase cx={780} cy={130} r={32} phase={0.6} stroke="rgba(167,139,250,0.45)" fill="rgba(196,181,253,0.55)" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Insights: padlock on chart ── */
const InsightsScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#f2ccda" accentDark="#581c87">
    <DualLayer
      light={
        <>
          <rect x="480" y="80" width="200" height="130" rx="12" fill="rgba(255,255,255,0.6)" stroke="rgba(109,40,217,0.3)" strokeWidth="1.5" />
          <path d="M510 170 L540 130 L570 150 L600 110 L630 125" fill="none" stroke="rgba(109,40,217,0.35)" strokeWidth="2" />
          <rect x="565" y="115" width="36" height="32" rx="6" fill="rgba(109,40,217,0.35)" stroke="rgba(109,40,217,0.5)" strokeWidth="1.5" />
          <path d="M573 115 V105 Q583 95 593 105 V115" fill="none" stroke="rgba(109,40,217,0.55)" strokeWidth="2.5" />
        </>
      }
      dark={
        <>
          <rect x="480" y="80" width="200" height="130" rx="12" fill="rgba(49,46,129,0.7)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          <path d="M510 170 L540 130 L570 150 L600 110 L630 125" fill="none" stroke="rgba(196,181,253,0.4)" strokeWidth="2" />
          <rect x="565" y="115" width="36" height="32" rx="6" fill="rgba(76,29,149,0.55)" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" />
          <path d="M573 115 V105 Q583 95 593 105 V115" fill="none" stroke="rgba(196,181,253,0.65)" strokeWidth="2.5" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Bridge: bridge with two figures ── */
const BridgeScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#d6dff7" accentDark="#312e81">
    <DualLayer
      light={
        <>
          <path d="M280 170 L280 130 Q580 90 880 130 L880 170 Z" fill="rgba(255,255,255,0.45)" stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
          <path d="M240 170 Q580 50 920 170" fill="none" stroke="rgba(134,120,151,0.45)" strokeWidth="3" />
          <line x1="380" y1="130" x2="380" y2="170" stroke="rgba(134,120,151,0.35)" strokeWidth="2" />
          <line x1="580" y1="115" x2="580" y2="170" stroke="rgba(134,120,151,0.35)" strokeWidth="2" />
          <line x1="780" y1="130" x2="780" y2="170" stroke="rgba(134,120,151,0.35)" strokeWidth="2" />
          <circle cx="420" cy="145" r="12" fill="rgba(242,204,218,0.6)" />
          <rect x="414" y="157" width="12" height="18" rx="3" fill="rgba(109,40,217,0.3)" />
          <circle cx="740" cy="148" r="12" fill="rgba(214,223,247,0.65)" />
          <rect x="734" y="160" width="12" height="18" rx="3" fill="rgba(109,40,217,0.25)" />
        </>
      }
      dark={
        <>
          <path d="M280 170 L280 130 Q580 90 880 130 L880 170 Z" fill="rgba(49,46,129,0.55)" stroke="rgba(167,139,250,0.3)" strokeWidth="1.5" />
          <path d="M240 170 Q580 50 920 170" fill="none" stroke="rgba(167,139,250,0.45)" strokeWidth="3" />
          <line x1="380" y1="130" x2="380" y2="170" stroke="rgba(167,139,250,0.3)" strokeWidth="2" />
          <line x1="580" y1="115" x2="580" y2="170" stroke="rgba(167,139,250,0.3)" strokeWidth="2" />
          <line x1="780" y1="130" x2="780" y2="170" stroke="rgba(167,139,250,0.3)" strokeWidth="2" />
          <circle cx="420" cy="145" r="12" fill="rgba(76,29,149,0.55)" />
          <rect x="414" y="157" width="12" height="18" rx="3" fill="rgba(196,181,253,0.35)" />
          <circle cx="740" cy="148" r="12" fill="rgba(49,46,129,0.7)" />
          <rect x="734" y="160" width="12" height="18" rx="3" fill="rgba(196,181,253,0.3)" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Relationships: two figures + heart arc ── */
const RelationshipsScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#f2ccda" accentDark="#4338ca">
    <DualLayer
      light={
        <>
          <circle cx="480" cy="130" r="22" fill="rgba(242,204,218,0.6)" stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
          <rect x="468" y="152" width="24" height="38" rx="6" fill="rgba(109,40,217,0.25)" />
          <circle cx="720" cy="130" r="22" fill="rgba(214,223,247,0.65)" stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
          <rect x="708" y="152" width="24" height="38" rx="6" fill="rgba(109,40,217,0.2)" />
          <path d="M510 120 Q600 60 690 120" fill="none" stroke="rgba(242,204,218,0.7)" strokeWidth="3" />
          <path d="M575 85 Q600 70 625 85 Q600 110 575 85" fill="rgba(242,204,218,0.55)" stroke="rgba(109,40,217,0.35)" strokeWidth="1.5" />
        </>
      }
      dark={
        <>
          <circle cx="480" cy="130" r="22" fill="rgba(76,29,149,0.55)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          <rect x="468" y="152" width="24" height="38" rx="6" fill="rgba(196,181,253,0.3)" />
          <circle cx="720" cy="130" r="22" fill="rgba(49,46,129,0.75)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          <rect x="708" y="152" width="24" height="38" rx="6" fill="rgba(196,181,253,0.25)" />
          <path d="M510 120 Q600 60 690 120" fill="none" stroke="rgba(196,181,253,0.45)" strokeWidth="3" />
          <path d="M575 85 Q600 70 625 85 Q600 110 575 85" fill="rgba(76,29,149,0.5)" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Family: house + seasonal orbs ── */
const FamilyScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#fcefd9" accentDark="#3730a3">
    <DualLayer
      light={
        <>
          <path d="M540 200 L540 120 L600 85 L660 120 L660 200 Z" fill="rgba(255,252,245,0.75)" stroke="rgba(134,120,151,0.4)" strokeWidth="2" />
          <path d="M525 120 L600 70 L675 120" fill="none" stroke="rgba(134,120,151,0.35)" strokeWidth="2" />
          {[
            { cx: 720, cy: 110, fill: 'rgba(134,200,120,0.55)', label: 'SPR' },
            { cx: 780, cy: 150, fill: 'rgba(251,191,36,0.55)', label: 'SUM' },
            { cx: 840, cy: 110, fill: 'rgba(251,146,60,0.5)', label: 'AUT' },
            { cx: 900, cy: 150, fill: 'rgba(147,197,253,0.55)', label: 'WIN' },
          ].map(({ cx, cy, fill, label }) => (
            <g key={label}>
              <circle cx={cx} cy={cy} r="22" fill={fill} stroke="rgba(134,120,151,0.3)" strokeWidth="1.5" />
              <text x={cx} y={cy + 4} textAnchor="middle" fill="rgba(80,70,90,0.7)" fontSize="9" fontWeight="700" fontFamily="Georgia, serif">{label}</text>
            </g>
          ))}
        </>
      }
      dark={
        <>
          <path d="M540 200 L540 120 L600 85 L660 120 L660 200 Z" fill="rgba(49,46,129,0.7)" stroke="rgba(167,139,250,0.35)" strokeWidth="2" />
          <path d="M525 120 L600 70 L675 120" fill="none" stroke="rgba(167,139,250,0.3)" strokeWidth="2" />
          {[
            { cx: 720, cy: 110, fill: 'rgba(74,222,128,0.35)', label: 'SPR' },
            { cx: 780, cy: 150, fill: 'rgba(251,191,36,0.4)', label: 'SUM' },
            { cx: 840, cy: 110, fill: 'rgba(251,146,60,0.35)', label: 'AUT' },
            { cx: 900, cy: 150, fill: 'rgba(147,197,253,0.4)', label: 'WIN' },
          ].map(({ cx, cy, fill, label }) => (
            <g key={label}>
              <circle cx={cx} cy={cy} r="22" fill={fill} stroke="rgba(167,139,250,0.3)" strokeWidth="1.5" />
              <text x={cx} y={cy + 4} textAnchor="middle" fill="rgba(196,181,253,0.85)" fontSize="9" fontWeight="700" fontFamily="Georgia, serif">{label}</text>
            </g>
          ))}
        </>
      }
    />
  </SceneWrap>
);

/* ── Creative: palette + brush + canvas ── */
const CreativeScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#f5ebe4" accentDark="#5b21b6">
    <DualLayer
      light={
        <>
          <rect x="680" y="75" width="140" height="120" rx="6" fill="rgba(255,255,255,0.7)" stroke="rgba(134,120,151,0.4)" strokeWidth="2" transform="rotate(3 750 135)" />
          <path d="M700 140 Q730 100 760 130 T820 110" fill="none" stroke="rgba(242,204,218,0.65)" strokeWidth="4" strokeLinecap="round" />
          <path d="M710 155 Q750 125 790 150" fill="none" stroke="rgba(109,40,217,0.35)" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="480" cy="155" rx="55" ry="40" fill="rgba(255,252,245,0.8)" stroke="rgba(134,120,151,0.4)" strokeWidth="1.5" />
          {['rgba(242,204,218,0.7)', 'rgba(214,223,247,0.7)', 'rgba(251,191,36,0.65)', 'rgba(134,200,120,0.6)'].map((c, i) => (
            <circle key={i} cx={455 + (i % 2) * 50} cy={140 + Math.floor(i / 2) * 30} r="10" fill={c} />
          ))}
          <line x1="560" y1="100" x2="620" y2="160" stroke="rgba(180,140,100,0.6)" strokeWidth="4" strokeLinecap="round" />
          <path d="M615 155 L635 175 L625 180 Z" fill="rgba(109,40,217,0.4)" />
        </>
      }
      dark={
        <>
          <rect x="680" y="75" width="140" height="120" rx="6" fill="rgba(49,46,129,0.65)" stroke="rgba(167,139,250,0.35)" strokeWidth="2" transform="rotate(3 750 135)" />
          <path d="M700 140 Q730 100 760 130 T820 110" fill="none" stroke="rgba(196,181,253,0.45)" strokeWidth="4" strokeLinecap="round" />
          <path d="M710 155 Q750 125 790 150" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="480" cy="155" rx="55" ry="40" fill="rgba(30,27,75,0.75)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          {['rgba(76,29,149,0.6)', 'rgba(49,46,129,0.7)', 'rgba(251,191,36,0.45)', 'rgba(74,222,128,0.35)'].map((c, i) => (
            <circle key={i} cx={455 + (i % 2) * 50} cy={140 + Math.floor(i / 2) * 30} r="10" fill={c} />
          ))}
          <line x1="560" y1="100" x2="620" y2="160" stroke="rgba(196,181,253,0.45)" strokeWidth="4" strokeLinecap="round" />
          <path d="M615 155 L635 175 L625 180 Z" fill="rgba(167,139,250,0.45)" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Support (meds): pill organizer + tea cup ── */
const SupportScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#e9dee6" accentDark="#1e3a8a">
    <DualLayer
      light={
        <>
          <rect x="440" y="100" width="160" height="90" rx="8" fill="rgba(255,255,255,0.65)" stroke="rgba(134,120,151,0.4)" strokeWidth="1.5" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={455 + (i % 3) * 48} y={115 + Math.floor(i / 3) * 38} width="38" height="28" rx="4" fill="rgba(242,204,218,0.35)" stroke="rgba(134,120,151,0.25)" strokeWidth="1" />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse key={`p${i}`} cx={474 + (i % 3) * 48} cy={129 + Math.floor(i / 3) * 38} rx="6" ry="4" fill="rgba(109,40,217,0.4)" />
          ))}
          <path d="M680 210 L680 160 Q720 145 760 160 L760 210 Z" fill="rgba(255,255,255,0.7)" stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
          <ellipse cx="720" cy="160" rx="42" ry="8" fill="rgba(134,200,120,0.4)" />
          <path d="M760 175 Q780 170 780 190" fill="none" stroke="rgba(134,120,151,0.35)" strokeWidth="2" />
        </>
      }
      dark={
        <>
          <rect x="440" y="100" width="160" height="90" rx="8" fill="rgba(30,58,138,0.6)" stroke="rgba(147,197,253,0.35)" strokeWidth="1.5" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={455 + (i % 3) * 48} y={115 + Math.floor(i / 3) * 38} width="38" height="28" rx="4" fill="rgba(49,46,129,0.55)" stroke="rgba(147,197,253,0.25)" strokeWidth="1" />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse key={`p${i}`} cx={474 + (i % 3) * 48} cy={129 + Math.floor(i / 3) * 38} rx="6" ry="4" fill="rgba(196,181,253,0.45)" />
          ))}
          <path d="M680 210 L680 160 Q720 145 760 160 L760 210 Z" fill="rgba(49,46,129,0.7)" stroke="rgba(147,197,253,0.35)" strokeWidth="1.5" />
          <ellipse cx="720" cy="160" rx="42" ry="8" fill="rgba(74,222,128,0.3)" />
          <path d="M760 175 Q780 170 780 190" fill="none" stroke="rgba(147,197,253,0.35)" strokeWidth="2" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Reset (crisis): chair + lamp + breathing circles + window ── */
const ResetScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#d6dff7" accentDark="#0f172a">
    <DualLayer
      light={
        <>
          <WindowFrame x={780} y={50} w={120} h={100} glow="rgba(147,197,253,0.35)" />
          <rect x="460" y="130" width="80" height="70" rx="8" fill="rgba(255,252,245,0.7)" stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
          <rect x="475" y="145" width="50" height="40" rx="6" fill="rgba(242,204,218,0.4)" />
          <line x1="420" y1="210" x2="420" y2="120" stroke="rgba(134,120,151,0.4)" strokeWidth="3" />
          <path d="M400 120 Q420 95 440 120" fill="rgba(251,191,36,0.5)" stroke="rgba(251,146,60,0.35)" strokeWidth="1.5" />
          {[1, 2, 3].map((ring) => (
            <circle key={ring} cx="620" cy="140" r={20 + ring * 22} fill="none" stroke="rgba(134,120,151,0.28)" strokeWidth="1.5" />
          ))}
          <circle cx="620" cy="140" r="8" fill="rgba(255,255,255,0.6)" />
        </>
      }
      dark={
        <>
          <WindowFrame x={780} y={50} w={120} h={100} glow="rgba(129,140,248,0.25)" />
          <rect x="460" y="130" width="80" height="70" rx="8" fill="rgba(30,41,59,0.75)" stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" />
          <rect x="475" y="145" width="50" height="40" rx="6" fill="rgba(49,46,129,0.45)" />
          <line x1="420" y1="210" x2="420" y2="120" stroke="rgba(148,163,184,0.4)" strokeWidth="3" />
          <path d="M400 120 Q420 95 440 120" fill="rgba(251,191,36,0.35)" stroke="rgba(251,191,36,0.3)" strokeWidth="1.5" />
          {[1, 2, 3].map((ring) => (
            <circle key={ring} cx="620" cy="140" r={20 + ring * 22} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="1.5" />
          ))}
          <circle cx="620" cy="140" r="8" fill="rgba(196,181,253,0.45)" />
        </>
      }
    />
  </SceneWrap>
);

/* ── FAQ: three speech bubbles with ? ── */
const FaqScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#f2ccda" accentDark="#3730a3">
    <DualLayer
      light={
        <>
          {[
            { x: 420, y: 100, w: 80, h: 55 },
            { x: 560, y: 85, w: 90, h: 60 },
            { x: 710, y: 105, w: 80, h: 55 },
          ].map(({ x, y, w, h }, i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} rx="14" fill="rgba(255,255,255,0.65)" stroke="rgba(109,40,217,0.3)" strokeWidth="1.5" />
              <polygon points={`${x + 20},${y + h} ${x + 10},${y + h + 14} ${x + 35},${y + h}`} fill="rgba(255,255,255,0.65)" stroke="rgba(109,40,217,0.3)" strokeWidth="1" />
              <text x={x + w / 2} y={y + h / 2 + 6} textAnchor="middle" fill="rgba(109,40,217,0.6)" fontSize="22" fontWeight="700" fontFamily="Georgia, serif">?</text>
            </g>
          ))}
        </>
      }
      dark={
        <>
          {[
            { x: 420, y: 100, w: 80, h: 55 },
            { x: 560, y: 85, w: 90, h: 60 },
            { x: 710, y: 105, w: 80, h: 55 },
          ].map(({ x, y, w, h }, i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} rx="14" fill="rgba(49,46,129,0.75)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
              <polygon points={`${x + 20},${y + h} ${x + 10},${y + h + 14} ${x + 35},${y + h}`} fill="rgba(49,46,129,0.75)" stroke="rgba(167,139,250,0.35)" strokeWidth="1" />
              <text x={x + w / 2} y={y + h / 2 + 6} textAnchor="middle" fill="rgba(196,181,253,0.85)" fontSize="22" fontWeight="700" fontFamily="Georgia, serif">?</text>
            </g>
          ))}
        </>
      }
    />
  </SceneWrap>
);

/* ── Partner: two mugs + guide booklet ── */
const PartnerScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#fcefd9" accentDark="#4338ca">
    <DualLayer
      light={
        <>
          <rect x="420" y="175" width="360" height="14" rx="4" fill="rgba(180,160,140,0.5)" />
          <path d="M480 175 L480 130 Q500 115 520 130 L520 175 Z" fill="rgba(255,255,255,0.7)" stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
          <path d="M520 145 Q535 140 550 145" fill="none" stroke="rgba(242,204,218,0.55)" strokeWidth="2" />
          <path d="M660 175 L660 130 Q680 115 700 130 L700 175 Z" fill="rgba(242,204,218,0.55)" stroke="rgba(134,120,151,0.35)" strokeWidth="1.5" />
          <path d="M700 145 Q715 140 730 145" fill="none" stroke="rgba(109,40,217,0.35)" strokeWidth="2" />
          <rect x="560" y="110" width="70" height="55" rx="4" fill="rgba(255,252,245,0.8)" stroke="rgba(134,120,151,0.4)" strokeWidth="1.5" />
          <text x="595" y="135" textAnchor="middle" fill="rgba(109,40,217,0.55)" fontSize="10" fontWeight="700" fontFamily="Georgia, serif">Guide</text>
          <line x1="572" y1="145" x2="618" y2="145" stroke="rgba(109,40,217,0.2)" strokeWidth="1.2" />
          <line x1="572" y1="155" x2="610" y2="155" stroke="rgba(109,40,217,0.18)" strokeWidth="1.2" />
        </>
      }
      dark={
        <>
          <rect x="420" y="175" width="360" height="14" rx="4" fill="rgba(55,48,80,0.75)" />
          <path d="M480 175 L480 130 Q500 115 520 130 L520 175 Z" fill="rgba(49,46,129,0.75)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          <path d="M520 145 Q535 140 550 145" fill="none" stroke="rgba(196,181,253,0.4)" strokeWidth="2" />
          <path d="M660 175 L660 130 Q680 115 700 130 L700 175 Z" fill="rgba(76,29,149,0.5)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          <path d="M700 145 Q715 140 730 145" fill="none" stroke="rgba(196,181,253,0.35)" strokeWidth="2" />
          <rect x="560" y="110" width="70" height="55" rx="4" fill="rgba(30,27,75,0.8)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          <text x="595" y="135" textAnchor="middle" fill="rgba(196,181,253,0.85)" fontSize="10" fontWeight="700" fontFamily="Georgia, serif">Guide</text>
          <line x1="572" y1="145" x2="618" y2="145" stroke="rgba(196,181,253,0.3)" strokeWidth="1.2" />
          <line x1="572" y1="155" x2="610" y2="155" stroke="rgba(196,181,253,0.25)" strokeWidth="1.2" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Admin: dashboard monitor with grid ── */
const AdminScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#d6dff7" accentDark="#1e1b4b">
    <DualLayer
      light={
        <>
          <rect x="460" y="60" width="280" height="170" rx="12" fill="rgba(60,60,70,0.75)" stroke="rgba(134,120,151,0.4)" strokeWidth="2" />
          <rect x="475" y="75" width="250" height="130" rx="6" fill="rgba(255,255,255,0.85)" />
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect key={`${row}-${col}`} x={490 + col * 78} y={90 + row * 38} width="68" height="28" rx="5" fill="rgba(214,223,247,0.55)" stroke="rgba(134,120,151,0.2)" strokeWidth="1" />
            )),
          )}
          <rect x="560" y="235" width="80" height="10" rx="3" fill="rgba(134,120,151,0.35)" />
        </>
      }
      dark={
        <>
          <rect x="460" y="60" width="280" height="170" rx="12" fill="rgba(15,23,42,0.85)" stroke="rgba(167,139,250,0.35)" strokeWidth="2" />
          <rect x="475" y="75" width="250" height="130" rx="6" fill="rgba(30,27,75,0.85)" />
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect key={`${row}-${col}`} x={490 + col * 78} y={90 + row * 38} width="68" height="28" rx="5" fill="rgba(49,46,129,0.65)" stroke="rgba(167,139,250,0.25)" strokeWidth="1" />
            )),
          )}
          <rect x="560" y="235" width="80" height="10" rx="3" fill="rgba(167,139,250,0.35)" />
        </>
      }
    />
  </SceneWrap>
);

/* ── Contact: envelope + moon seal + mailbox ── */
const ContactScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#f5ebe4" accentDark="#312e81">
    <DualLayer
      light={
        <>
          <rect x="780" y="100" width="60" height="90" rx="6" fill="rgba(180,140,100,0.55)" stroke="rgba(134,120,151,0.4)" strokeWidth="1.5" />
          <rect x="770" y="90" width="80" height="18" rx="4" fill="rgba(160,130,100,0.5)" />
          <rect x="790" y="115" width="12" height="8" rx="2" fill="rgba(251,191,36,0.45)" />
          <rect x="480" y="110" width="220" height="90" rx="12" fill="rgba(255,252,245,0.8)" stroke="rgba(134,120,151,0.4)" strokeWidth="1.5" />
          <path d="M480 110 L590 175 L700 110" fill="none" stroke="rgba(109,40,217,0.28)" strokeWidth="1.5" />
          <circle cx="590" cy="155" r="18" fill="rgba(242,204,218,0.55)" stroke="rgba(109,40,217,0.35)" strokeWidth="1.5" />
          <path d="M578 155 Q590 142 602 155 Q590 168 578 155" fill="rgba(109,40,217,0.3)" />
        </>
      }
      dark={
        <>
          <rect x="780" y="100" width="60" height="90" rx="6" fill="rgba(49,46,129,0.7)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          <rect x="770" y="90" width="80" height="18" rx="4" fill="rgba(76,29,149,0.55)" />
          <rect x="790" y="115" width="12" height="8" rx="2" fill="rgba(251,191,36,0.35)" />
          <rect x="480" y="110" width="220" height="90" rx="12" fill="rgba(30,27,75,0.75)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
          <path d="M480 110 L590 175 L700 110" fill="none" stroke="rgba(196,181,253,0.3)" strokeWidth="1.5" />
          <circle cx="590" cy="155" r="18" fill="rgba(76,29,149,0.55)" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" />
          <path d="M578 155 Q590 142 602 155 Q590 168 578 155" fill="rgba(196,181,253,0.35)" />
        </>
      }
    />
  </SceneWrap>
);

/* ── About: Luna crescent in circle + stars ── */
const AboutScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#e9dee6" accentDark="#4c1d95">
    <DualLayer
      light={
        <>
          <circle cx="600" cy="130" r="72" fill="rgba(255,255,255,0.45)" stroke="rgba(109,40,217,0.35)" strokeWidth="2" />
          <path d="M565 130 Q600 90 635 130 Q600 170 565 130" fill="rgba(134,120,151,0.35)" />
          <circle cx="565" cy="130" r="28" fill="rgba(255,249,244,0.9)" />
          {[[720, 70], [780, 95], [840, 65], [760, 180]].map(([x, y]) => (
            <polygon key={`${x}-${y}`} points={`${x},${y - 6} ${x + 2},${y} ${x + 6},${y} ${x + 3},${y + 3} ${x + 4},${y + 7} ${x},${y + 5} ${x - 4},${y + 7} ${x - 3},${y + 3} ${x - 6},${y} ${x - 2},${y}`} fill="rgba(251,191,36,0.55)" />
          ))}
        </>
      }
      dark={
        <>
          <circle cx="600" cy="130" r="72" fill="rgba(49,46,129,0.65)" stroke="rgba(167,139,250,0.4)" strokeWidth="2" />
          <path d="M565 130 Q600 90 635 130 Q600 170 565 130" fill="rgba(196,181,253,0.35)" />
          <circle cx="565" cy="130" r="28" fill="rgba(15,23,42,0.85)" />
          {[[720, 70], [780, 95], [840, 65], [760, 180]].map(([x, y]) => (
            <polygon key={`${x}-${y}`} points={`${x},${y - 6} ${x + 2},${y} ${x + 6},${y} ${x + 3},${y + 3} ${x + 4},${y + 7} ${x},${y + 5} ${x - 4},${y + 7} ${x - 3},${y + 3} ${x - 6},${y} ${x - 2},${y}`} fill="rgba(251,191,36,0.45)" />
          ))}
        </>
      }
    />
  </SceneWrap>
);

const HOW_STEPS = ['Speak', 'Check-in', 'Patterns', 'Insights'] as const;

/* ── How it works: 4 step cards ── */
const HowScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#d6dff7" accentDark="#3730a3">
    <DualLayer
      light={
        <>
          {HOW_STEPS.map((label, i) => (
            <g key={label}>
              <rect x={320 + i * 140} y={90 + i * 4} width="110" height="80" rx="10" fill="rgba(255,255,255,0.65)" stroke="rgba(109,40,217,0.3)" strokeWidth="1.5" />
              <text x={375 + i * 140} y={125 + i * 4} textAnchor="middle" fill="rgba(109,40,217,0.55)" fontSize="11" fontWeight="700" fontFamily="Georgia, serif">{i + 1}</text>
              <text x={375 + i * 140} y={148 + i * 4} textAnchor="middle" fill="rgba(80,70,90,0.75)" fontSize="11" fontWeight="600" fontFamily="Georgia, serif">{label}</text>
            </g>
          ))}
        </>
      }
      dark={
        <>
          {HOW_STEPS.map((label, i) => (
            <g key={label}>
              <rect x={320 + i * 140} y={90 + i * 4} width="110" height="80" rx="10" fill="rgba(49,46,129,0.75)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" />
              <text x={375 + i * 140} y={125 + i * 4} textAnchor="middle" fill="rgba(196,181,253,0.85)" fontSize="11" fontWeight="700" fontFamily="Georgia, serif">{i + 1}</text>
              <text x={375 + i * 140} y={148 + i * 4} textAnchor="middle" fill="rgba(196,181,253,0.7)" fontSize="11" fontWeight="600" fontFamily="Georgia, serif">{label}</text>
            </g>
          ))}
        </>
      }
    />
  </SceneWrap>
);

/* ── Privacy: shield with checkmark ── */
const PrivacyScene = ({ uid }: SceneProps) => (
  <SceneWrap uid={uid} accentLight="#e9dee6" accentDark="#0f172a">
    <DualLayer
      light={
        <>
          <path d="M600 55 L660 80 V130 Q600 175 540 130 V80 Z" fill="rgba(255,255,255,0.65)" stroke="rgba(109,40,217,0.4)" strokeWidth="2" />
          <path d="M575 120 L595 145 L630 100" fill="none" stroke="rgba(74,222,128,0.7)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      }
      dark={
        <>
          <path d="M600 55 L660 80 V130 Q600 175 540 130 V80 Z" fill="rgba(30,41,59,0.8)" stroke="rgba(167,139,250,0.45)" strokeWidth="2" />
          <path d="M575 120 L595 145 L630 100" fill="none" stroke="rgba(74,222,128,0.65)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      }
    />
  </SceneWrap>
);

export const SCENE_BY_TAB: Partial<Record<TabType, React.FC<SceneProps>>> = {
  today_mirror: TodayScene,
  history: JourneyScene,
  cycle: CycleScene,
  library: KnowledgeScene,
  profile: ProfileScene,
  my_day: MyDayScene,
  reflections: VoiceScene,
  voice_files: VoiceFilesScene,
  dashboard: HomeScene,
  labs: LabsScene,
  monthly_reflection: MonthScene,
  insights_paywall: InsightsScene,
  bridge: BridgeScene,
  relationships: RelationshipsScene,
  family: FamilyScene,
  creative: CreativeScene,
  meds: SupportScene,
  crisis: ResetScene,
  faq: FaqScene,
  partner_faq: PartnerScene,
  contact: ContactScene,
  about: AboutScene,
  how_it_works: HowScene,
  privacy: PrivacyScene,
  terms: PrivacyScene,
  medical: ResetScene,
  cookies: PrivacyScene,
  data_rights: PrivacyScene};
