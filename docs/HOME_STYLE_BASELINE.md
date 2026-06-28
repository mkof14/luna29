# Home Style Baseline (Public)

This document fixes the current Public Home visual language as the primary style reference for further development across the site.

## Source of Truth

- Primary implementation: `components/PublicLandingView.tsx`
- Scope: `activePage === 'home'` (`.luna-home-ref` block)

All future public pages should inherit this style direction unless a page requires a justified exception.

## Core Visual Direction

- Atmosphere: calm, premium, soft, feminine, spacious.
- Layout feel: large breathing space, rounded glass-like cards, low-contrast shadows.
- Contrast: readable but restrained; avoid sharp black/white jumps.
- Motion: subtle only.

## Theme Rules

### Light Theme (default baseline)

- Soft pearl background with smooth gradients.
- Card surfaces: translucent, lightly layered, gentle borders.
- Text: darker and consistent for headings/links in footer and content.
- Accent controls: semi-transparent pink-violet buttons with clean hover lift.

### Dark Theme

- Same structure and spacing as light theme.
- Dark cosmic base with muted overlays.
- Keep readability high without neon contrast.

## Section Styling Rules

- Hero is compact, not oversized, with right visual integrated into the card.
- `Why Luna exists`, `Voice Journal`, `The Bridge`, `Reset Room` use image-backed softened overlays.
- `Your rhythm becomes visible` uses a clear horizontal visual timeline:
  - left/right progression
  - highlighted `Today` marker
  - clean labels

## Buttons

- Shared `.cta` style:
  - semi-transparent fill
  - soft border
  - visible hover/active feedback
- `Record` keeps stronger hover emphasis (recording intent).

## Footer Baseline

- Thin, elegant link typography in light theme.
- Even column distribution for readability.
- Brand mark image appears before `Luna` in header and footer.
- `Admin Login` remains in footer account block.

## Asset Baseline (current)

- Header/Footer mark: `/images/luna-logo-transparent.webp`
- Hero visual: `/images/F1.png`
- Why section bg: `/images/bg1.webp`
- Voice + Bridge bg: `/images/voice-journal-bg.webp`
- Reset bg: `/images/BG3.png`

## Developer Rule

When updating other public pages:

1. Reuse spacing rhythm, card radii, border softness, and typography hierarchy from Home.
2. Reuse button treatment and hover behavior from Home.
3. Keep tonal consistency between light and dark themes.
4. Do not introduce hard-edged dashboard styling.

If a page intentionally diverges, document the reason in the PR/commit note.
