
import React, { useState, useEffect } from 'react';
import { generateStateVisual, startVeoVideo } from '../services/geminiService';
import { Language } from '../constants';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { MemberPageIntro } from './member/MemberPageIntro';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { getLunaPageTheme } from '../utils/lunaPageThemes';

interface CreativeStudioProps {
  lang?: Language;
  onBack?: () => void;
}

interface AiStudioApi {
  hasSelectedApiKey?: () => Promise<boolean>;
  openSelectKey?: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio?: AiStudioApi;
  }
}

export const CreativeStudio: React.FC<CreativeStudioProps> = ({ lang = 'en', onBack }) => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<{ type: 'img' | 'vid', url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Synthesizing state art...");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [serviceFeedback, setServiceFeedback] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = window.aistudio;
      if (aistudio && aistudio.hasSelectedApiKey) {
        try {
          const selected = await aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } catch {
          setHasApiKey(false);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const aistudio = window.aistudio;
    if (aistudio && aistudio.openSelectKey) {
      try {
        await aistudio.openSelectKey();
        setHasApiKey(true);
        return true;
      } catch {
        setServiceFeedback('Could not open API key selector.');
        return false;
      }
    }
    setServiceFeedback('API key integration is unavailable in local mode.');
    return false;
  };

  const handleGenerateImage = async () => {
    setServiceFeedback(null);
    if (!prompt.trim()) {
      setServiceFeedback('Please describe your current state first.');
      return;
    }
    if (!hasApiKey && window.aistudio) {
      const selected = await handleSelectKey();
      if (!selected) return;
    }
    setLoading(true);
    setLoadingMessage("Mapping physiological markers to visual space...");
    const url = await generateStateVisual(prompt, "1:1", "1K");
    if (url) setResult({ type: 'img', url });
    else setServiceFeedback("Image generation is unavailable in local mode.");
    setLoading(false);
  };

  const handleGenerateVideo = async () => {
    setServiceFeedback(null);
    if (!prompt.trim()) {
      setServiceFeedback('Please describe your current state first.');
      return;
    }
    if (!hasApiKey && window.aistudio) {
      const selected = await handleSelectKey();
      if (!selected) return;
    }
    
    const messages = [
      "Simulating internal physiological flow...",
      "Generating cinematic state transitions...",
      "Finalizing temporal rendering...",
      "Your state visualization is almost ready..."
    ];
    
    let msgIdx = 0;
    const interval = setInterval(() => {
      setLoadingMessage(messages[msgIdx % messages.length]);
      msgIdx++;
    }, 15000);

    setLoading(true);
    setLoadingMessage(messages[0]);
    
    try {
      const url = await startVeoVideo(prompt);
      if (url) setResult({ type: 'vid', url });
      else setServiceFeedback("Video generation is unavailable in local mode.");
    } catch (err) {
      console.error(err);
      setServiceFeedback("Video generation failed in local mode.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <>
      {onBack && <MemberIconBackButton lang={lang} onClick={onBack} className="mb-0" />}
      <MemberPageIntro lang={lang} page="creative" tab="creative" />

      <LunaPageContentSection themeClass={getLunaPageTheme('creative').shellClass} padded={false} className="space-y-12">
      <header className="border-b border-slate-200 dark:border-slate-600 pb-6">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Describe what you feel — Luna29 turns it into color and motion.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-4 space-y-8">
          {!hasApiKey && (
            <div className="p-8 border-2 border-pink-500 luna-vivid-card-alt-1 space-y-4">
              <h4 className="text-[10px] font-black uppercase text-pink-500 tracking-widest">Premium System Required</h4>
              <p className="text-xs font-bold leading-relaxed text-slate-600 dark:text-pink-200">
                To use high-resolution imaging and animation, you must select a paid API key.
              </p>
              <button 
                onClick={handleSelectKey}
                className="w-full py-4 bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(236,72,153,0.3)]"
              >
                Select Paid Key
              </button>
            </div>
          )}

          <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed italic">
            "Describe the sensation: wired, heavy, vibrant, grounded, or fluid."
          </p>
        </aside>

        <section className="lg:col-span-8 space-y-8">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe how your body feels right now..."
            className="w-full h-32 p-6 border-2 border-slate-900 dark:border-slate-100 luna-vivid-surface outline-none font-medium text-lg focus:ring-4 ring-pink-500/10"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              disabled={loading}
              onClick={handleGenerateImage}
              className="py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
            >
              Generate Image
            </button>
            <button 
              disabled={loading}
              onClick={handleGenerateVideo}
              className="py-5 border-2 border-slate-900 dark:border-slate-100 font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
            >
              Animate (Veo)
            </button>
          </div>
          {serviceFeedback && (
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{serviceFeedback}</p>
          )}

          <div className="min-h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center luna-vivid-card-soft relative overflow-hidden">
            {loading ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">{loadingMessage}</p>
              </div>
            ) : result ? (
              result.type === 'img' ? (
                <img src={result.url} className="max-w-full max-h-[600px] object-contain shadow-2xl" alt="State Visualization" />
              ) : (
                <video src={result.url} controls autoPlay loop className="max-w-full max-h-[600px] shadow-2xl" />
              )
            ) : (
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.5em]">Output Area</span>
            )}
          </div>
        </section>
      </div>
      </LunaPageContentSection>
    </>
  );
};
