import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Language, getLang } from '../../constants';
import { ADMIN_EMAIL_TEMPLATES, AdminTemplateDef, getTemplateLocalized } from '../../utils/adminTemplatesCatalog';
import { AdminZoneCopy, ADMIN_ZONE_COPY } from '../../utils/adminZoneCopy';
import { useAdminTheme } from './AdminThemeContext';
import { adminCardInner, adminHeading, adminInput, adminLabel, adminMuted, adminSubheading } from './adminStyles';
import { versionedStaticAsset } from '../../utils/staticAssetUrl';

type AdminTemplatePickerProps = {
  lang: Language;
  selectedId: string;
  onSelect: (templateId: string) => void;
  /** Optional zone copy; falls back to i18n map. */
  zone?: AdminZoneCopy;
  label?: string;
  className?: string;
};

/** Collapsible dropdown menu for choosing a branded Luna29 email template. */
export const AdminTemplatePicker: React.FC<AdminTemplatePickerProps> = ({
  lang,
  selectedId,
  onSelect,
  zone: zoneProp,
  label,
  className = '',
}) => {
  const zone = zoneProp || getLang(ADMIN_ZONE_COPY, lang);
  const { mode } = useAdminTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => ADMIN_EMAIL_TEMPLATES.find((t) => t.id === selectedId) || ADMIN_EMAIL_TEMPLATES[0],
    [selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ADMIN_EMAIL_TEMPLATES;
    return ADMIN_EMAIL_TEMPLATES.filter((tpl) => {
      const loc = getTemplateLocalized(tpl, lang);
      return (
        tpl.id.toLowerCase().includes(q) ||
        loc.subject.toLowerCase().includes(q) ||
        loc.trigger.toLowerCase().includes(q)
      );
    });
  }, [query, lang]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const pick = (tpl: AdminTemplateDef) => {
    onSelect(tpl.id);
    setOpen(false);
    setQuery('');
  };

  const renderRow = (tpl: AdminTemplateDef, active: boolean) => {
    const loc = getTemplateLocalized(tpl, lang);
    return (
      <button
        key={tpl.id}
        type="button"
        onClick={() => pick(tpl)}
        className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-colors ${
          active
            ? 'bg-luna-purple/15 border border-luna-purple/40'
            : mode === 'dark'
              ? 'hover:bg-white/5 border border-transparent'
              : 'hover:bg-slate-50 border border-transparent'
        }`}
      >
        <img
          src={versionedStaticAsset(`/images/heroes/r2/${tpl.hero}`)}
          alt=""
          className="w-14 h-10 rounded-lg object-cover shrink-0 ring-1 ring-black/10"
        />
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-bold truncate ${adminHeading(mode)}`}>{loc.subject}</p>
          <p className={`text-[10px] truncate ${adminMuted(mode)}`}>{zone.templatesTrigger}: {loc.trigger}</p>
        </div>
      </button>
    );
  };

  const selectedLoc = selected ? getTemplateLocalized(selected, lang) : null;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <p className={`mb-2 ${adminLabel(mode)}`}>{label || zone.templatePickerLabel}</p>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
          mode === 'dark'
            ? 'bg-[#0a101c] border-white/15 hover:border-luna-purple/40'
            : 'bg-white border-slate-300 hover:border-luna-purple/40 shadow-sm'
        } ${open ? 'ring-2 ring-luna-purple/30' : ''}`}
      >
        {selected && (
          <img
            src={versionedStaticAsset(`/images/heroes/r2/${selected.hero}`)}
            alt=""
            className="w-16 h-11 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-black truncate ${adminHeading(mode)}`}>{selectedLoc?.subject || '—'}</p>
          <p className={`text-[10px] ${adminMuted(mode)}`}>{selected?.id}</p>
        </div>
        <ChevronDown size={18} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${adminMuted(mode)}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute z-50 mt-2 w-full rounded-2xl border shadow-2xl overflow-hidden ${
            mode === 'dark' ? 'bg-[#0c1220] border-white/15' : 'bg-white border-slate-200'
          }`}
        >
          <div className={`p-3 border-b ${mode === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="relative">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${adminMuted(mode)}`} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={zone.templatePickerSearch}
                className={`w-full pl-9 pr-3 py-2.5 text-sm ${adminInput(mode)}`}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[min(420px,60vh)] overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <p className={`p-4 text-center text-sm ${adminMuted(mode)}`}>{zone.templatePickerEmpty}</p>
            ) : (
              filtered.map((tpl) => renderRow(tpl, tpl.id === selectedId))
            )}
          </div>
          <div className={`px-3 py-2 text-[10px] ${adminMuted(mode)} border-t ${mode === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
            {filtered.length} / {ADMIN_EMAIL_TEMPLATES.length} · {zone.templatesBrandNote}
          </div>
        </div>
      )}
    </div>
  );
};

/** Compact inline trigger for marketing cards. */
export const AdminTemplatePickerInline: React.FC<AdminTemplatePickerProps> = (props) => (
  <AdminTemplatePicker {...props} className={`${props.className || ''} max-w-md`} />
);

export const MARKETING_HERO_OPTIONS = [
  { id: 'dashboard.webp', label: 'Home / Welcome' },
  { id: 'library.webp', label: 'Knowledge / Newsletter' },
  { id: 'creative.webp', label: 'Creative / Campaign' },
  { id: 'cycle.webp', label: 'Rhythm / Cycle' },
  { id: 'labs.webp', label: 'Health reports' },
  { id: 'bridge.webp', label: 'Bridge / Retention' },
  { id: 'insights_paywall.webp', label: 'Membership / Pricing' },
  { id: 'today_mirror.webp', label: 'Daily check-in' },
  { id: 'admin.webp', label: 'Admin / Team' },
] as const;

type HeroPickerProps = {
  lang: Language;
  value: string;
  onChange: (hero: string) => void;
  label?: string;
};

export const AdminHeroPicker: React.FC<HeroPickerProps> = ({ lang, value, onChange, label }) => {
  const zone = getLang(ADMIN_ZONE_COPY, lang);
  const { mode } = useAdminTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const current = MARKETING_HERO_OPTIONS.find((h) => h.id === value) || MARKETING_HERO_OPTIONS[0];

  return (
    <div ref={rootRef} className="relative">
      <p className={`mb-2 ${adminLabel(mode)}`}>{label || zone.marketingHero}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left ${
          mode === 'dark' ? 'bg-[#0a101c] border-white/10' : 'bg-white border-slate-300'
        }`}
      >
        <img src={versionedStaticAsset(`/images/heroes/r2/${current.id}`)} alt="" className="w-12 h-9 rounded object-cover" />
        <span className={`text-sm font-semibold ${adminSubheading(mode)}`}>{current.label}</span>
        <ChevronDown size={16} className={`ml-auto ${adminMuted(mode)}`} />
      </button>
      {open && (
        <div className={`absolute z-40 mt-1 w-full rounded-xl border shadow-xl p-2 space-y-1 max-h-64 overflow-y-auto ${
          mode === 'dark' ? 'bg-[#0c1220] border-white/15' : 'bg-white border-slate-200'
        }`}>
          {MARKETING_HERO_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left ${
                value === opt.id ? 'bg-luna-purple/15' : mode === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'
              }`}
            >
              <img src={versionedStaticAsset(`/images/heroes/r2/${opt.id}`)} alt="" className="w-10 h-8 rounded object-cover" />
              <span className="text-xs font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
