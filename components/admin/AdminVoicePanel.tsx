import React, { useCallback, useEffect, useState } from 'react';
import { Language, getLang } from '../../constants';
import { ADMIN_WORKSPACE_COPY } from '../../utils/adminWorkspaceI18n';
import { useAdminTheme } from './AdminThemeContext';
import { adminBtnPrimary, adminCardInner, adminHeading, adminInput, adminLabel, adminMuted, adminStatHealthy, adminStatWarn, adminSubheading } from './adminStyles';

type VoiceConfig = {
  enabled: boolean;
  ttsEnabled: boolean;
  llmEnabled: boolean;
  provider: string;
  modelId: string;
  personas: Array<{ id: string; name: string; tagline: string; description: string }>;
};

type VoiceRow = {
  voiceId: string;
  name: string;
  previewUrl?: string | null;
};

type AdminVoicePanelProps = {
  lang: Language;
  onFeedback?: (message: string) => void;
};

export const AdminVoicePanel: React.FC<AdminVoicePanelProps> = ({ lang, onFeedback }) => {
  const { mode } = useAdminTheme();
  const ws = getLang(ADMIN_WORKSPACE_COPY, lang);
  const [config, setConfig] = useState<VoiceConfig | null>(null);
  const [voices, setVoices] = useState<VoiceRow[]>([]);
  const [personaId, setPersonaId] = useState('luna');
  const [testLine, setTestLine] = useState('Take one gentle breath with me.');
  const [lastReply, setLastReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [configRes, voicesRes] = await Promise.all([
        fetch('/api/voice/config', { credentials: 'include' }),
        fetch('/api/voice/voices', { credentials: 'include' }),
      ]);
      const configJson = configRes.ok ? await configRes.json() : null;
      const voicesJson = voicesRes.ok ? await voicesRes.json() : { voices: [] };
      setConfig(configJson);
      setVoices(Array.isArray(voicesJson.voices) ? voicesJson.voices : []);
    } catch (e) {
      onFeedback?.(e instanceof Error ? e.message : 'Unable to load voice status.');
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    void load();
  }, [load]);

  const runTest = async () => {
    const transcript = testLine.trim();
    if (transcript.length < 3) return onFeedback?.('Enter a short test line.');
    setBusy(true);
    try {
      const res = await fetch('/api/voice/respond', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, lang, personaId, mode: 'admin_test' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Voice test failed.');
      setLastReply(String(data.text || data.reply || ''));
      onFeedback?.(data.audio ? 'Voice test returned audio.' : 'Voice test returned text.');
    } catch (e) {
      onFeedback?.(e instanceof Error ? e.message : 'Voice test failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <p className={`text-sm ${adminMuted(mode)}`}>{ws.loading}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className={`p-4 ${adminCardInner(mode)}`}>
          <p className={adminLabel(mode)}>Provider</p>
          <p className={`mt-1 font-bold ${adminHeading(mode)}`}>{config?.provider || 'local'}</p>
        </div>
        <div className={`p-4 ${adminCardInner(mode)}`}>
          <p className={adminLabel(mode)}>LLM</p>
          <p className={config?.llmEnabled ? adminStatHealthy(mode) : adminStatWarn(mode)}>{config?.llmEnabled ? ws.configured : 'Missing'}</p>
        </div>
        <div className={`p-4 ${adminCardInner(mode)}`}>
          <p className={adminLabel(mode)}>ElevenLabs TTS</p>
          <p className={config?.ttsEnabled ? adminStatHealthy(mode) : adminStatWarn(mode)}>{config?.ttsEnabled ? ws.configured : 'Missing'}</p>
        </div>
      </div>

      <div className={`p-5 space-y-3 ${adminCardInner(mode)}`}>
        <p className={`text-sm font-black ${adminSubheading(mode)}`}>Personas</p>
        <div className="grid gap-2">
          {(config?.personas || []).map((persona) => (
            <div key={persona.id} className={`p-3 rounded-xl ${mode === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
              <p className={`font-bold ${adminHeading(mode)}`}>{persona.name}</p>
              <p className={`text-xs ${adminMuted(mode)}`}>{persona.tagline}</p>
              <p className={`text-sm mt-1 ${adminMuted(mode)}`}>{persona.description}</p>
            </div>
          ))}
        </div>
      </div>

      {voices.length > 0 && (
        <div className={`p-5 space-y-2 ${adminCardInner(mode)}`}>
          <p className={`text-sm font-black ${adminSubheading(mode)}`}>Account voices ({voices.length})</p>
          <ul className={`text-sm max-h-40 overflow-y-auto space-y-1 ${adminMuted(mode)}`}>
            {voices.slice(0, 12).map((voice) => (
              <li key={voice.voiceId}>{voice.name} · <span className="font-mono text-xs">{voice.voiceId}</span></li>
            ))}
          </ul>
        </div>
      )}

      <div className={`p-5 space-y-3 ${adminCardInner(mode)}`}>
        <p className={`text-sm font-black ${adminSubheading(mode)}`}>Quick test</p>
        <select className={`w-full ${adminInput(mode)}`} value={personaId} onChange={(e) => setPersonaId(e.target.value)}>
          {(config?.personas || []).map((persona) => (
            <option key={persona.id} value={persona.id}>{persona.name}</option>
          ))}
        </select>
        <input className={`w-full ${adminInput(mode)}`} value={testLine} onChange={(e) => setTestLine(e.target.value)} />
        <button type="button" className={adminBtnPrimary} disabled={busy} onClick={() => void runTest()}>
          {busy ? ws.loading : 'Run voice test'}
        </button>
        {lastReply ? <p className={`text-sm whitespace-pre-wrap ${adminMuted(mode)}`}>{lastReply}</p> : null}
      </div>

      <button type="button" className={adminBtnPrimary} onClick={() => void load()}>{ws.refreshOps}</button>
    </div>
  );
};
