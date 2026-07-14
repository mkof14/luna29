import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { ProfileData } from '../types';
import { normalizeProfileData } from '../utils/profile';
import { billingService, BillingStatusPayload } from '../services/billingService';
import { Language } from '../constants';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { MemberPageIntro } from './member/MemberPageIntro';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { getLunaPageTheme } from '../utils/lunaPageThemes';
import { MEMBER_CHIP_ACTIVE, MEMBER_CHIP_INACTIVE } from '../utils/memberPageStyles';
import { MemoryControls } from './MemoryControls';
import { HealthProfilePanel } from './HealthProfilePanel';
import { trackHealthProfileOpened } from '../utils/healthProfileAnalytics';
import { needsBillingRecovery } from '../utils/subscriptionAccess';
import { conversionEvents } from '../utils/conversionEvents';

interface ProfileViewProps {
  lang: Language;
  onBack: () => void;
  onOpenSupport?: () => void;
  onOpenPrivacy?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ lang, onBack, onOpenSupport, onOpenPrivacy }) => {
  const [log, setLog] = useState(() => dataService.getLog());
  const systemState = dataService.projectState(log);
  const [profile, setProfile] = useState<ProfileData>(systemState.profile);
  const [isSaved, setIsSaved] = useState(false);
  const [billing, setBilling] = useState<BillingStatusPayload>({ status: 'inactive', plan: 'none' });
  const [billingEnabled, setBillingEnabled] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingFeedback, setBillingFeedback] = useState('');

  const refreshBillingStatus = () => {
    return billingService
      .getStatus()
      .then((payload) => {
        setBilling(payload.billing || { status: 'inactive', plan: 'none' });
        setBillingEnabled(Boolean(payload.enabled));
      })
      .catch(() => {
        setBillingEnabled(false);
      });
  };

  const updateProfile = (updates: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setIsSaved(false);
  };

  const handleSave = () => {
    const normalizedProfile = normalizeProfileData(profile);
    const updatedProfile = { ...normalizedProfile, lastUpdated: new Date().toISOString() };
    setProfile(updatedProfile);
    dataService.logEvent('PROFILE_UPDATE', updatedProfile);
    setLog(dataService.getLog());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const calculateAge = (bday: string) => {
    if (!bday) return null;
    const birthDate = new Date(bday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const sectionClasses = "luna-vivid-surface p-10 rounded-[3.5rem] space-y-10 transition-all relative overflow-hidden group hover:border-luna-purple/40";
  const labelClasses = "text-sm md:text-base font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.14em] ml-1 block mb-3";
  const helpTextClasses = "text-[12px] font-bold text-slate-400 dark:text-slate-500 italic leading-relaxed";
  const inputClasses = "w-full luna-vivid-chip p-5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 outline-none font-bold text-base focus:ring-4 ring-luna-purple/5 focus:border-luna-purple/40 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner";
  const areaClasses = "w-full luna-vivid-chip p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 outline-none font-bold text-base focus:ring-4 ring-luna-purple/5 focus:border-luna-purple/40 transition-all resize-none text-slate-800 dark:text-slate-200 min-h-[120px] shadow-inner";

  useEffect(() => {
    let alive = true;
    refreshBillingStatus().catch(() => undefined);

    const billingResult = new URLSearchParams(window.location.search).get('billing');
    if (billingResult === 'success') {
      setBillingFeedback('Payment completed. Updating subscription status...');
      setTimeout(() => {
        if (!alive) return;
        refreshBillingStatus().then(() => setBillingFeedback('Subscription updated.'));
      }, 1200);
    } else if (billingResult === 'canceled') {
      setBillingFeedback('Checkout canceled. No charges were made.');
    }

    return () => {
      alive = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openBillingPortal = async () => {
    setBillingFeedback('');
    setBillingLoading(true);
    try {
      const payload = await billingService.createPortalSession();
      window.location.assign(payload.url);
    } catch (error) {
      setBillingFeedback(error instanceof Error ? error.message : 'Could not open billing portal.');
    } finally {
      setBillingLoading(false);
    }
  };

  const startCheckout = async (period: 'month' | 'year') => {
    setBillingFeedback('');
    setBillingLoading(true);
    try {
      conversionEvents.checkoutStarted(period);
      const payload = await billingService.createCheckoutSession(period);
      conversionEvents.trialStarted();
      window.location.assign(payload.url);
    } catch (error) {
      setBillingFeedback(error instanceof Error ? error.message : 'Could not start checkout.');
    } finally {
      setBillingLoading(false);
    }
  };

  return (
    <>
      <MemberIconBackButton lang={lang} onClick={onBack} className="mb-0" />
      <MemberPageIntro lang={lang} page="profile" tab="profile" />

      <LunaPageContentSection themeClass={getLunaPageTheme('profile').shellClass} padded={false}>
      <div className="space-y-8">
        <nav
          data-testid="settings-directory"
          aria-label="Settings sections"
          className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/40 px-4 py-4"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Settings</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Account and billing live here. Clinical health information is in Personal Health Profile below.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { id: 'settings-account', label: 'Account' },
              { id: 'settings-billing', label: 'Billing' },
              { id: 'settings-privacy', label: 'Privacy' },
              { id: 'settings-memory', label: 'Memory' },
              { id: 'personal-health-profile', label: 'Personal Health Profile' },
              { id: 'settings-support', label: 'Support' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={MEMBER_CHIP_INACTIVE}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Notifications and Connected Services are not included in Closed Paid Beta.
          </p>
        </nav>

        <div id="settings-billing" className="scroll-mt-28 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple">Billing</p>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {billingEnabled ? `${billing.status}${billing.period ? ` • ${billing.period}` : ''}` : 'Disabled'}
              </span>
            </div>
            {profile.lastUpdated && (
              <div>
                <span className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Calibration</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{new Date(profile.lastUpdated).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          {needsBillingRecovery(billing.status) && (
            <div
              data-testid="billing-recovery-banner"
              className="rounded-2xl border border-slate-300/80 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
            >
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Payment needs attention. Update billing to keep premium access.
              </p>
              <button type="button" className={MEMBER_CHIP_ACTIVE} disabled={billingLoading} onClick={() => void openBillingPortal()}>
                Update billing
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={openBillingPortal}
              disabled={!billingEnabled || billingLoading}
              className={`px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.16em] transition-all ${
                billingEnabled && !billingLoading
                  ? `${MEMBER_CHIP_INACTIVE} hover:border-luna-purple/50`
                  : 'opacity-50 cursor-not-allowed border border-slate-300/60 dark:border-slate-600/50 px-5 py-3 rounded-full text-[10px] font-black uppercase text-slate-500'
              }`}
            >
              {billingLoading ? 'Opening...' : 'Manage Subscription'}
            </button>
            <button
              data-testid="profile-save"
              type="button"
              onClick={handleSave}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.16em] transition-all ${
                isSaved
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : `${MEMBER_CHIP_ACTIVE} hover:brightness-110`
              }`}
            >
              {isSaved ? 'Identity Synced' : 'Sync Profile'}
            </button>
          </div>
        </div>

        {billingFeedback && <p className="text-xs font-bold text-rose-500 dark:text-rose-300">{billingFeedback}</p>}

        <div className="rounded-2xl border border-slate-200/75 dark:border-slate-600/45 bg-slate-50/80 dark:bg-slate-950/40 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 break-words">
              Status: {billing.status}
              {billing.period ? ` • ${billing.period}` : ''} • Plan: {billing.plan || 'none'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              disabled={!billingEnabled || billingLoading}
              onClick={() => startCheckout('month')}
              className={billingEnabled && !billingLoading ? MEMBER_CHIP_INACTIVE : 'opacity-50 cursor-not-allowed px-4 py-2 rounded-full text-xs font-black uppercase'}
            >
              {billingLoading ? 'Opening...' : 'Start Monthly'}
            </button>
            <button
              type="button"
              disabled={!billingEnabled || billingLoading}
              onClick={() => startCheckout('year')}
              className={billingEnabled && !billingLoading ? MEMBER_CHIP_ACTIVE : 'opacity-50 cursor-not-allowed px-4 py-2 rounded-full text-xs font-black uppercase'}
            >
              {billingLoading ? 'Opening...' : 'Start Yearly'}
            </button>
          </div>
        </div>
        </div>

        <div id="settings-privacy" className="scroll-mt-28 rounded-2xl border border-luna-purple/20 bg-luna-purple/5 p-4 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple">Privacy</p>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Review how Luna29 uses your information. You can edit or remove your information at any time.
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <button
              type="button"
              className="underline underline-offset-2 text-slate-500 hover:text-luna-purple"
              onClick={() => (onOpenPrivacy ? onOpenPrivacy() : window.location.assign('/privacy'))}
            >
              Privacy Notice
            </button>
            <a href="/data-rights" className="underline underline-offset-2 text-slate-500 hover:text-luna-purple">
              Data Protection
            </a>
          </div>
        </div>

        <div id="settings-support" className="scroll-mt-28 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Support</p>
            <p className="text-sm text-slate-700 dark:text-slate-200">Contact Luna29 for Closed Paid Beta help.</p>
          </div>
          <button
            type="button"
            data-testid="settings-open-support"
            className={MEMBER_CHIP_ACTIVE}
            onClick={() => onOpenSupport?.()}
          >
            Contact
          </button>
        </div>

        <div id="settings-memory" className="scroll-mt-28 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Memory</p>
          <MemoryControls
            lang={lang}
            surface="profile"
            onOpenHealthProfile={() =>
              document.getElementById('personal-health-profile')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          />
        </div>

        <div id="personal-health-profile" className="scroll-mt-28 space-y-3">
          <HealthProfilePanel lang={lang} showIntro={false} />
        </div>
      </div>

      <p className="text-base font-medium text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-center">
        Account details below are optional baseline markers. Clinical health information stays in Personal Health Profile.
      </p>

      <div className="grid grid-cols-1 gap-12">
        
        {/* PILLAR 1: PERSONAL PROFILE */}
        <section id="settings-account" className={`${sectionClasses} scroll-mt-28`}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-luna-purple/10 dark:bg-luna-purple/20 flex items-center justify-center rounded-[1.8rem] text-3xl shadow-sm">👤</div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">Account</h3>
                <p className={helpTextClasses}>Your identification and physical baseline markers.</p>
              </div>
            </div>
            <div className="flex luna-vivid-chip p-2 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-inner w-fit self-end md:self-start">
              <button onClick={() => updateProfile({ units: 'metric' })} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${profile.units === 'metric' ? 'bg-white dark:bg-slate-800 text-luna-purple shadow-lg' : 'text-slate-400 dark:text-slate-600'}`}>Metric</button>
              <button onClick={() => updateProfile({ units: 'imperial' })} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${profile.units === 'imperial' ? 'bg-white dark:bg-slate-800 text-luna-purple shadow-lg' : 'text-slate-400 dark:text-slate-600'}`}>Imperial</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            <div className="space-y-2 lg:col-span-1">
              <label className={labelClasses}>Identity Name</label>
              <input data-testid="profile-name-input" type="text" value={profile.name} onChange={e => updateProfile({ name: e.target.value })} placeholder="Preferred name" className={inputClasses} />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>Temporal Origin (Birth Date)</label>
              <input type="date" value={profile.birthDate} onChange={e => updateProfile({ birthDate: e.target.value })} className={inputClasses} />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>Current Age</label>
              <div className="p-5 bg-white dark:bg-slate-800 rounded-[1.5rem] font-black text-xl text-luna-purple text-center border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                {calculateAge(profile.birthDate) || '--'} <span className="text-[10px] uppercase tracking-widest text-slate-400">Solar Years</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Weight ({profile.units === 'metric' ? 'kg' : 'lb'})</label>
              <input type="number" value={profile.weight} onChange={e => updateProfile({ weight: e.target.value })} className={inputClasses} />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>Height ({profile.units === 'metric' ? 'cm' : 'in'})</label>
              <input type="number" value={profile.height} onChange={e => updateProfile({ height: e.target.value })} className={inputClasses} />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>Physiological Type (Blood)</label>
              <div className="grid grid-cols-4 gap-2">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                  <button key={type} onClick={() => updateProfile({ bloodType: type })} className={`py-3 rounded-xl text-[10px] font-black transition-all border-2 ${profile.bloodType === type ? 'bg-slate-900 text-white border-slate-900 shadow-lg dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}>{type}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PILLAR 2: CLINICAL HEALTH — Personal Health Profile is the source of truth */}
        <section className={sectionClasses} data-testid="profile-health-pillar-php">
          <div className="flex items-center gap-6 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center rounded-[1.8rem] text-3xl shadow-sm">🏥</div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">Health Information</h3>
              <p className={helpTextClasses}>
                Allergies, conditions, surgeries, and medications are managed in your Personal Health Profile — not duplicated here.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-luna-purple/20 bg-luna-purple/5 p-5 space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-200">
              Update medical history, medications, allergies, and family history in one place so Labs, Reports, and Live stay personalized.
            </p>
            <button
              type="button"
              className={MEMBER_CHIP_ACTIVE}
              onClick={() => {
                trackHealthProfileOpened('settings', null);
                document.getElementById('personal-health-profile')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Open Personal Health Profile
            </button>
          </div>
        </section>

        {/* PILLAR 3: MIND PILLAR */}
        <section className={sectionClasses}>
          <div className="flex items-center gap-6 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center rounded-[1.8rem] text-3xl shadow-sm">🧠</div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">Mind Pillar</h3>
              <p className={helpTextClasses}>How you process stress and environmental inputs.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-4">
              <label className={labelClasses}>Stress Sensitivity Quotient</label>
              <div className="relative">
                <select 
                  value={profile.stressBaseline} 
                  onChange={e => updateProfile({ stressBaseline: e.target.value })}
                  className={`${inputClasses} appearance-none cursor-pointer pr-12`}
                >
                  <option value="low">Low Sensitivity</option>
                  <option value="medium">Medium Sensitivity</option>
                  <option value="high">High Sensitivity</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic font-bold px-2 leading-tight">Defines your system's baseline resilience map for observation.</p>
            </div>
            
            <div className="space-y-4">
              <label className={labelClasses}>External Peace Disruptors</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Noise', 'Bright Light', 'Crowds', 'Cold', 'Heat', 'Scents', 'Textures', 'Predictability'].map(item => {
                  const isActive = (profile.sensitivities || []).includes(item);
                  return (
                    <button 
                      key={item} 
                      type="button"
                      onClick={() => { 
                        const current = profile.sensitivities || []; 
                        const next = isActive ? current.filter(i => i !== item) : [...current, item]; 
                        updateProfile({ sensitivities: next }); 
                      }} 
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        isActive 
                          ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white shadow-md' 
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        isActive 
                          ? 'bg-luna-purple border-luna-purple text-white' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}>
                        {isActive && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400'}`}>
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* PILLAR 4: BIOLOGICAL HERITAGE */}
        <section className={sectionClasses}>
          <div className="flex items-center gap-6 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center rounded-[1.8rem] text-3xl shadow-sm">🌳</div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">Heritage Pillar</h3>
              <p className={helpTextClasses}>Genetic roots and developmental landmarks.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-3">
              <label className={labelClasses}>Cycle Initiation (Age)</label>
              <input type="number" value={profile.menarcheAge} onChange={e => updateProfile({ menarcheAge: e.target.value })} placeholder="e.g. 13" className={inputClasses} />
              <p className="text-[10px] text-slate-400 font-bold px-2 italic">Age of first menstruation.</p>
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className={labelClasses}>Family History</label>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Family medical history is managed in your Personal Health Profile so it is not asked twice.
              </p>
              <button
                type="button"
                className={MEMBER_CHIP_INACTIVE}
                onClick={() => {
                  trackHealthProfileOpened('settings', null);
                  document.getElementById('personal-health-profile')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Open Personal Health Profile
              </button>
            </div>
          </div>
        </section>

      </div>
      
      <div className="p-14 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-[4rem] border-4 border-luna-purple/30 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.6em] mb-6 animate-pulse">Sovereign Data Protocol</p>
        <p className="text-lg font-bold italic max-w-2xl mx-auto leading-relaxed uppercase tracking-tighter">
          Luna29 operates as a closed system. This identity is stored exclusively on your device hardware. It is never transmitted, sold, or shared with external entities.
        </p>
      </div>
      </LunaPageContentSection>
    </>
  );
};
