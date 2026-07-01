import { AdminThemeMode } from './AdminThemeContext';

export const adminShellBg = (mode: AdminThemeMode) =>
  mode === 'dark'
    ? 'bg-[#070b14] text-slate-100'
    : 'bg-[#eef1f8] text-slate-900';

export const adminSidebarBg = (mode: AdminThemeMode) =>
  mode === 'dark'
    ? 'bg-[#0c1220] border-r border-white/[0.08]'
    : 'bg-white border-r border-slate-200/90 shadow-sm';

export const adminTopbarBg = (mode: AdminThemeMode) =>
  mode === 'dark'
    ? 'bg-[#0c1220]/95 border-b border-white/[0.08] backdrop-blur-md'
    : 'bg-white/95 border-b border-slate-200/90 backdrop-blur-md shadow-sm';

export const adminCard = (mode: AdminThemeMode) =>
  mode === 'dark'
    ? 'rounded-2xl bg-[#121a2e] border border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.35)]'
    : 'rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.06)]';

export const adminCardInner = (mode: AdminThemeMode) =>
  mode === 'dark'
    ? 'rounded-xl bg-[#0a101c] border border-white/[0.06]'
    : 'rounded-xl bg-slate-50 border border-slate-200/80';

export const adminHeading = (mode: AdminThemeMode) =>
  mode === 'dark' ? 'text-white font-bold' : 'text-slate-900 font-bold';

export const adminSubheading = (mode: AdminThemeMode) =>
  mode === 'dark' ? 'text-slate-300 font-semibold' : 'text-slate-700 font-semibold';

export const adminMuted = (mode: AdminThemeMode) =>
  mode === 'dark' ? 'text-slate-400' : 'text-slate-600';

export const adminLabel = (mode: AdminThemeMode) =>
  mode === 'dark'
    ? 'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500'
    : 'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500';

export const adminInput = (mode: AdminThemeMode) =>
  mode === 'dark'
    ? 'px-4 py-3 rounded-xl border border-white/10 bg-[#0a101c] text-slate-100 placeholder:text-slate-500 focus:border-luna-purple/60 focus:outline-none focus:ring-2 focus:ring-luna-purple/20'
    : 'px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-luna-purple/50 focus:outline-none focus:ring-2 focus:ring-luna-purple/15';

export const adminBtnPrimary = 'px-4 py-2.5 rounded-xl bg-luna-purple text-white text-xs font-bold uppercase tracking-wider hover:bg-luna-purple/90 transition-colors disabled:opacity-50';

export const adminBtnSecondary = (mode: AdminThemeMode) =>
  mode === 'dark'
    ? 'px-4 py-2.5 rounded-xl border border-white/15 text-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors'
    : 'px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors';

export const adminNavItem = (mode: AdminThemeMode, active: boolean) => {
  if (active) {
    return mode === 'dark'
      ? 'bg-luna-purple/20 text-white border border-luna-purple/40 shadow-[inset_3px_0_0_0_#a855f7]'
      : 'bg-luna-purple/10 text-luna-purple border border-luna-purple/25 shadow-[inset_3px_0_0_0_#7c3aed]';
  }
  return mode === 'dark'
    ? 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent';
};

export const adminStatHealthy = (mode: AdminThemeMode) =>
  mode === 'dark'
    ? 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300'
    : 'bg-emerald-50 border-emerald-200 text-emerald-800';

export const adminStatWarn = (mode: AdminThemeMode) =>
  mode === 'dark'
    ? 'bg-amber-950/40 border-amber-700/40 text-amber-300'
    : 'bg-amber-50 border-amber-200 text-amber-800';

export const adminStatDown = (mode: AdminThemeMode) =>
  mode === 'dark'
    ? 'bg-rose-950/40 border-rose-700/40 text-rose-300'
    : 'bg-rose-50 border-rose-200 text-rose-800';
