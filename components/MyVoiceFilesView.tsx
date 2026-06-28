import React, { useEffect, useMemo, useState } from 'react';
import { Language } from '../constants';

type SavedVoiceClip = {
  id: string;
  createdAt: string;
  locale: string;
  transcript: string;
  audioDataUrl: string;
  favorite?: boolean;
  tags?: string[];
};

const VOICE_CLIPS_STORAGE_KEY = 'luna_voice_clips_v1';

const AUTO_TAGS = [
  'stress',
  'sleep',
  'energy',
  'mood',
  'work',
  'relationship',
  'anxiety',
  'focus',
  'health',
  'cycle',
];

const inferTags = (transcript: string): string[] => {
  const text = transcript.toLowerCase();
  const matches: string[] = [];
  const rules: Array<{ tag: string; keys: string[] }> = [
    { tag: 'stress', keys: ['stress', 'overload', 'перегруз', 'стресс', 'tension', 'напряж'] },
    { tag: 'sleep', keys: ['sleep', 'insomnia', 'сон', 'спала', 'устал', 'fatigue'] },
    { tag: 'energy', keys: ['energy', 'устал', 'сил', 'vital', 'battery'] },
    { tag: 'mood', keys: ['mood', 'настро', 'sad', 'angry', 'радость', 'emotion'] },
    { tag: 'work', keys: ['work', 'job', 'office', 'работ', 'project', 'deadline'] },
    { tag: 'relationship', keys: ['partner', 'husband', 'wife', 'relationship', 'отнош', 'семья'] },
    { tag: 'anxiety', keys: ['anxiety', 'panic', 'трев', 'panic', 'fear', 'страх'] },
    { tag: 'focus', keys: ['focus', 'concentration', 'концентрац', 'attention'] },
    { tag: 'health', keys: ['health', 'doctor', 'pain', 'symptom', 'здоров', 'боль'] },
    { tag: 'cycle', keys: ['cycle', 'period', 'phase', 'цикл', 'пмс', 'menstrual'] },
  ];

  for (const rule of rules) {
    if (rule.keys.some((key) => text.includes(key))) {
      matches.push(rule.tag);
    }
  }

  return Array.from(new Set(matches)).slice(0, 4);
};

const normalizeClip = (clip: SavedVoiceClip): SavedVoiceClip => {
  const safeTranscript = clip.transcript || '';
  const inferred = inferTags(safeTranscript);
  const inputTags = Array.isArray(clip.tags) ? clip.tags : [];
  const mergedTags = Array.from(new Set([...inputTags, ...inferred])).slice(0, 6);
  return {
    ...clip,
    transcript: safeTranscript,
    favorite: Boolean(clip.favorite),
    tags: mergedTags,
  };
};

export const MyVoiceFilesView: React.FC<{ lang: Language; onBack: () => void }> = ({ lang, onBack }) => {
  const [copy, setCopy] = useState<import('../utils/voiceFilesContent').VoiceFilesCopy>({
    back: 'Back',
    title: 'My Voice Files',
    subtitle: 'Saved recordings from Voice Note. Play, search, filter, and manage your files.',
    search: 'Search transcript...',
    allLanguages: 'All languages',
    fromDate: 'From',
    toDate: 'To',
    clearFilters: 'Clear filters',
    clearAll: 'Clear all files',
    noFiles: 'No saved voice files yet.',
    filesCount: 'files',
    download: 'Download',
    delete: 'Delete',
    transcript: 'Transcript',
  });

  useEffect(() => {
    let alive = true;
    import('../utils/voiceFilesContent').then((module) => {
      if (!alive) return;
      setCopy(module.getVoiceFilesCopy(lang));
    });
    return () => {
      alive = false;
    };
  }, [lang]);

  const [clips, setClips] = useState<SavedVoiceClip[]>(() => {
    try {
      const raw = localStorage.getItem(VOICE_CLIPS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((clip) => normalizeClip(clip as SavedVoiceClip));
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState('');
  const [localeFilter, setLocaleFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortMode, setSortMode] = useState<'newest' | 'oldest'>('newest');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState('all');
  const [feedback, setFeedback] = useState('');

  const actions = lang === 'ru'
    ? {
        copy: 'Копировать',
        share: 'Поделиться',
        downloadAudio: 'Скачать аудио',
        downloadText: 'Скачать текст',
        print: 'Печать',
        exportJson: 'Экспорт JSON',
        shareSummary: 'Поделиться сводкой',
        copied: 'Скопировано',
        shared: 'Отправлено',
        failed: 'Не удалось выполнить действие',
        noTranscript: 'Нет транскрипта',
        newest: 'Сначала новые',
        oldest: 'Сначала старые',
        favorite: 'Избранное',
        favoritesOnly: 'Только избранное',
        allTags: 'Все теги',
      }
    : {
        copy: 'Copy',
        share: 'Share',
        downloadAudio: 'Download Audio',
        downloadText: 'Download Text',
        print: 'Print',
        exportJson: 'Export JSON',
        shareSummary: 'Share Summary',
        copied: 'Copied',
        shared: 'Shared',
        failed: 'Action failed',
        noTranscript: 'No transcript',
        newest: 'Newest first',
        oldest: 'Oldest first',
        favorite: 'Favorite',
        favoritesOnly: 'Favorites only',
        allTags: 'All tags',
      };

  const localeOptions = useMemo(() => {
    const unique = Array.from(new Set(clips.map((clip) => clip.locale))).sort();
    return unique;
  }, [clips]);

  const tagOptions = useMemo(() => {
    const all = new Set<string>();
    for (const clip of clips) {
      (clip.tags || []).forEach((tag) => all.add(tag));
    }
    AUTO_TAGS.forEach((tag) => all.add(tag));
    return Array.from(all).sort();
  }, [clips]);

  const filteredClips = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    const fromTs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const toTs = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null;

    const items = clips.filter((clip) => {
      const clipTs = new Date(clip.createdAt).getTime();
      if (localeFilter !== 'all' && clip.locale !== localeFilter) return false;
      if (favoriteOnly && !clip.favorite) return false;
      if (tagFilter !== 'all' && !(clip.tags || []).includes(tagFilter)) return false;
      if (fromTs && clipTs < fromTs) return false;
      if (toTs && clipTs > toTs) return false;
      if (!searchLower) return true;
      const tagsText = (clip.tags || []).join(' ').toLowerCase();
      const dateText = new Date(clip.createdAt).toLocaleString().toLowerCase();
      const localeText = (clip.locale || '').toLowerCase();
      return (
        (clip.transcript || '').toLowerCase().includes(searchLower) ||
        tagsText.includes(searchLower) ||
        dateText.includes(searchLower) ||
        localeText.includes(searchLower)
      );
    });

    return items.sort((a, b) =>
      sortMode === 'newest'
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [clips, favoriteOnly, fromDate, localeFilter, search, sortMode, tagFilter, toDate]);

  const persist = (next: SavedVoiceClip[]) => {
    setClips(next);
    localStorage.setItem(VOICE_CLIPS_STORAGE_KEY, JSON.stringify(next));
  };

  useEffect(() => {
    if (!clips.length) return;
    const normalized = clips.map((clip) => normalizeClip(clip));
    const changed = normalized.some((clip, index) => {
      const original = clips[index];
      if (!original) return true;
      if (clip.favorite !== original.favorite) return true;
      const a = clip.tags || [];
      const b = original.tags || [];
      if (a.length !== b.length) return true;
      return a.some((tag, i) => tag !== b[i]);
    });
    if (changed) {
      localStorage.setItem(VOICE_CLIPS_STORAGE_KEY, JSON.stringify(normalized));
      setClips(normalized);
    }
  }, [clips]);

  const toggleFavorite = (id: string) => {
    const next = clips.map((clip) => (clip.id === id ? { ...clip, favorite: !clip.favorite } : clip));
    persist(next);
  };

  const toggleTag = (id: string, tag: string) => {
    const next = clips.map((clip) => {
      if (clip.id !== id) return clip;
      const current = new Set(clip.tags || []);
      if (current.has(tag)) current.delete(tag);
      else current.add(tag);
      return { ...clip, tags: Array.from(current) };
    });
    persist(next);
  };

  const deleteClip = (id: string) => {
    persist(clips.filter((clip) => clip.id !== id));
  };

  const clearAll = () => {
    persist([]);
  };

  const downloadClip = (clip: SavedVoiceClip) => {
    const link = document.createElement('a');
    link.href = clip.audioDataUrl;
    const ts = clip.createdAt.replace(/[:.]/g, '-');
    link.download = `luna-voice-${ts}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTranscript = (clip: SavedVoiceClip) => {
    const content = clip.transcript || '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const ts = clip.createdAt.replace(/[:.]/g, '-');
    link.download = `luna-voice-${ts}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyTranscript = async (clip: SavedVoiceClip) => {
    if (!clip.transcript) {
      setFeedback(actions.noTranscript);
      setTimeout(() => setFeedback(''), 1800);
      return;
    }
    try {
      await navigator.clipboard.writeText(clip.transcript);
      setFeedback(actions.copied);
    } catch {
      setFeedback(actions.failed);
    }
    setTimeout(() => setFeedback(''), 1800);
  };

  const shareClip = async (clip: SavedVoiceClip) => {
    const text = `${new Date(clip.createdAt).toLocaleString()} • ${clip.locale}\n\n${clip.transcript || ''}`.trim();
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Luna29 Voice File', text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setFeedback(actions.shared);
    } catch {
      setFeedback(actions.failed);
    }
    setTimeout(() => setFeedback(''), 1800);
  };

  const printClip = (clip: SavedVoiceClip) => {
    const win = window.open('', '_blank', 'noopener,noreferrer,width=700,height=900');
    if (!win) return;
    const body = `
      <html>
        <head><title>Luna29 Voice File</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px; line-height:1.5;">
          <h2>Luna29 Voice File</h2>
          <p><strong>Date:</strong> ${new Date(clip.createdAt).toLocaleString()}</p>
          <p><strong>Locale:</strong> ${clip.locale}</p>
          <h3>Transcript</h3>
          <p>${(clip.transcript || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </body>
      </html>
    `;
    win.document.write(body);
    win.document.close();
    win.focus();
    win.print();
  };

  const exportAllJson = () => {
    const blob = new Blob([JSON.stringify(clips, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'luna-voice-files.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareSummary = async () => {
    const locales = Array.from(new Set(filteredClips.map((clip) => clip.locale))).join(', ') || '-';
    const text = `Luna29 Voice Files\nCount: ${filteredClips.length}\nLocales: ${locales}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Luna29 Voice Summary', text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setFeedback(actions.shared);
    } catch {
      setFeedback(actions.failed);
    }
    setTimeout(() => setFeedback(''), 1800);
  };

  const clearFilters = () => {
    setSearch('');
    setLocaleFilter('all');
    setFromDate('');
    setToDate('');
    setFavoriteOnly(false);
    setTagFilter('all');
  };

  return (
    <div className="max-w-6xl mx-auto luna-page-shell space-y-8 p-6 md:p-8 relative">
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-luna-purple/24 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-sky-300/22 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 w-80 h-80 rounded-full bg-rose-300/20 blur-[130px]" />
      <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all">
        ← {copy.back}
      </button>

      <section className="rounded-[3rem] border border-slate-200/75 dark:border-slate-700/85 bg-gradient-to-br from-[#f7ebf8]/94 via-[#eee7f4]/90 to-[#dde8f8]/86 dark:from-[#081127]/97 dark:via-[#0c1a38]/96 dark:to-[#142b53]/95 p-7 md:p-9 shadow-[0_34px_82px_rgba(93,74,132,0.3),0_14px_34px_rgba(72,124,153,0.2)] dark:shadow-[0_40px_92px_rgba(0,0,0,0.68),0_14px_38px_rgba(14,43,93,0.56)] space-y-6 relative overflow-hidden">
        <div className="absolute -top-14 right-4 w-56 h-56 rounded-full bg-luna-purple/28 blur-3xl" />
        <div className="absolute -bottom-20 left-10 w-64 h-64 rounded-full bg-sky-300/26 blur-3xl" />
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-luna-purple">Voice Archive</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">{copy.title}</h1>
          <p className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 max-w-3xl">{copy.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.search}
            className="md:col-span-2 px-4 py-3 rounded-2xl border border-slate-200/90 dark:!border-[#385683] bg-white/94 dark:!bg-[#0b1b3b] text-sm font-semibold text-slate-800 dark:!text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-300 outline-none shadow-[0_12px_26px_rgba(112,91,150,0.16)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.42)]"
          />
          <select
            value={localeFilter}
            onChange={(e) => setLocaleFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-slate-200 dark:!border-[#385683] bg-white/90 dark:!bg-[#0b1b3b] text-sm font-semibold text-slate-800 dark:!text-slate-100 outline-none shadow-[0_8px_22px_rgba(112,91,150,0.1)] dark:shadow-[0_10px_22px_rgba(0,0,0,0.35)]"
          >
            <option value="all">{copy.allLanguages}</option>
            {localeOptions.map((locale) => (
              <option key={locale} value={locale}>{locale}</option>
            ))}
          </select>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            aria-label={copy.fromDate}
            className="px-4 py-3 rounded-2xl border border-slate-200 dark:!border-[#385683] bg-white/90 dark:!bg-[#0b1b3b] text-sm font-semibold text-slate-800 dark:!text-slate-100 outline-none shadow-[0_8px_22px_rgba(112,91,150,0.1)] dark:shadow-[0_10px_22px_rgba(0,0,0,0.35)]"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            aria-label={copy.toDate}
            className="px-4 py-3 rounded-2xl border border-slate-200 dark:!border-[#385683] bg-white/90 dark:!bg-[#0b1b3b] text-sm font-semibold text-slate-800 dark:!text-slate-100 outline-none shadow-[0_8px_22px_rgba(112,91,150,0.1)] dark:shadow-[0_10px_22px_rgba(0,0,0,0.35)]"
          />
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-slate-200 dark:!border-[#385683] bg-white/90 dark:!bg-[#0b1b3b] text-sm font-semibold text-slate-800 dark:!text-slate-100 outline-none shadow-[0_8px_22px_rgba(112,91,150,0.1)] dark:shadow-[0_10px_22px_rgba(0,0,0,0.35)]"
          >
            <option value="all">{actions.allTags}</option>
            {tagOptions.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
            {filteredClips.length} {copy.filesCount}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSortMode((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-[0_8px_18px_rgba(72,85,109,0.18)] dark:shadow-[0_10px_22px_rgba(0,0,0,0.42)]"
            >
              {sortMode === 'newest' ? actions.newest : actions.oldest}
            </button>
            <button
              onClick={() => setFavoriteOnly((prev) => !prev)}
              className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] ${favoriteOnly ? 'bg-amber-200 text-amber-800 dark:bg-amber-700/40 dark:text-amber-200' : 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-200'} shadow-[0_8px_18px_rgba(72,85,109,0.18)] dark:shadow-[0_10px_22px_rgba(0,0,0,0.42)]`}
            >
              {actions.favoritesOnly}
            </button>
            <button
              onClick={clearFilters}
                className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-[0_8px_18px_rgba(72,85,109,0.18)] dark:shadow-[0_10px_22px_rgba(0,0,0,0.42)]"
              >
              {copy.clearFilters}
            </button>
            {clips.length > 0 && (
              <>
                <button
                  onClick={exportAllJson}
                  className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-luna-purple/15 text-luna-purple shadow-[0_8px_20px_rgba(122,92,179,0.24)]"
                >
                  {actions.exportJson}
                </button>
                <button
                  onClick={shareSummary}
                  className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 shadow-[0_8px_20px_rgba(57,136,192,0.22)]"
                >
                  {actions.shareSummary}
                </button>
              </>
            )}
            {clips.length > 0 && (
              <button
                onClick={clearAll}
                className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300 shadow-[0_8px_20px_rgba(209,96,121,0.2)]"
              >
                {copy.clearAll}
              </button>
            )}
          </div>
        </div>
        {feedback && (
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{feedback}</p>
        )}
      </section>

      <section className="space-y-4">
        {filteredClips.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/55 p-6 text-sm font-semibold text-slate-500 dark:text-slate-300">
            {copy.noFiles}
          </div>
        ) : (
          filteredClips.map((clip, index) => (
            <article key={clip.id} className="rounded-[2rem] border border-slate-200/85 dark:border-slate-700/85 bg-gradient-to-br from-[#f8edf9]/90 via-[#efe8f5]/87 to-[#e3ebfa]/85 dark:from-[#08142d]/95 dark:via-[#10244a]/94 dark:to-[#1a3765]/92 p-5 md:p-6 space-y-4 shadow-[0_24px_56px_rgba(88,70,126,0.3),0_8px_20px_rgba(83,140,167,0.2)] dark:shadow-[0_28px_62px_rgba(0,0,0,0.62),0_12px_28px_rgba(21,51,99,0.44)] relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-luna-purple/22 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-sky-300/22 blur-3xl" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                  File {filteredClips.length - index} • {new Date(clip.createdAt).toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{clip.locale}</p>
                  <button
                    onClick={() => toggleFavorite(clip.id)}
                    className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${clip.favorite ? 'bg-amber-200 text-amber-800 dark:bg-amber-700/40 dark:text-amber-200' : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                  >
                    {clip.favorite ? `★ ${actions.favorite}` : `☆ ${actions.favorite}`}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {AUTO_TAGS.map((tag) => (
                  <button
                    key={`${clip.id}-${tag}`}
                    onClick={() => toggleTag(clip.id, tag)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.14em] transition ${
                      (clip.tags || []).includes(tag)
                        ? 'bg-luna-purple/16 text-luna-purple dark:bg-luna-purple/30 dark:text-violet-200'
                        : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              <audio controls src={clip.audioDataUrl} className="w-full" />

              {clip.transcript && (
                <div className="rounded-2xl border border-slate-200/75 dark:border-slate-700/75 bg-white/82 dark:bg-slate-950/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_12px_26px_rgba(95,79,128,0.16)] dark:shadow-[inset_0_1px_0_rgba(148,163,184,0.14),0_14px_28px_rgba(0,0,0,0.36)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{copy.transcript}</p>
                  <p className="mt-2 text-sm font-semibold italic text-slate-700 dark:text-slate-200">"{clip.transcript}"</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => downloadClip(clip)}
                  className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-luna-purple/15 text-luna-purple shadow-[0_8px_20px_rgba(122,92,179,0.24)]"
                >
                  {actions.downloadAudio}
                </button>
                <button
                  onClick={() => downloadTranscript(clip)}
                  className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-[0_8px_20px_rgba(99,102,241,0.22)]"
                >
                  {actions.downloadText}
                </button>
                <button
                  onClick={() => copyTranscript(clip)}
                  className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shadow-[0_8px_20px_rgba(16,185,129,0.22)]"
                >
                  {actions.copy}
                </button>
                <button
                  onClick={() => shareClip(clip)}
                  className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 shadow-[0_8px_20px_rgba(57,136,192,0.22)]"
                >
                  {actions.share}
                </button>
                <button
                  onClick={() => printClip(clip)}
                  className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shadow-[0_8px_20px_rgba(245,158,11,0.22)]"
                >
                  {actions.print}
                </button>
                <button
                  onClick={() => deleteClip(clip.id)}
                  className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300 shadow-[0_8px_20px_rgba(209,96,121,0.2)]"
                >
                  {copy.delete}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};
