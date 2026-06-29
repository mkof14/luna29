import React, { useState } from 'react';
import { Language, LangCopy, getLang } from '../constants';
import {
  isSecureHealthStorageSupported,
  isHealthStorageUnlocked,
  unlockHealthStorage,
  lockHealthStorage,
  migrateSensitiveKeysToEncrypted,
} from '../services/secureHealthStorage';

const copyByLang: LangCopy<{
  title: string;
  body: string;
  passphrase: string;
  unlock: string;
  lock: string;
  unlocked: string;
  unsupported: string;
  error: string;
  migrated: string;
}> = {
  en: {
    title: 'Encrypt local health data',
    body: 'Optional passphrase encrypts your journal, voice clips, and lab drafts on this device.',
    passphrase: 'Passphrase',
    unlock: 'Unlock & encrypt',
    lock: 'Lock storage',
    unlocked: 'Health data is encrypted on this device.',
    unsupported: 'Encryption is not available in this browser.',
    error: 'Could not unlock. Check your passphrase.',
    migrated: 'Sensitive data encrypted.',
  },
  ru: {
    title: 'Шифрование локальных данных',
    body: 'Опциональная фраза шифрует дневник, голосовые заметки и черновики анализов на устройстве.',
    passphrase: 'Фраза-пароль',
    unlock: 'Разблокировать и шифровать',
    lock: 'Заблокировать',
    unlocked: 'Данные здоровья зашифрованы на этом устройстве.',
    unsupported: 'Шифрование недоступно в этом браузере.',
    error: 'Не удалось разблокировать. Проверьте фразу.',
    migrated: 'Чувствительные данные зашифрованы.',
  },
  uk: {
    title: 'Шифрування локальних даних',
    body: 'Опційна фраза шифрує щоденник, голосові нотатки та чернетки на пристрої.',
    passphrase: 'Фраза-пароль',
    unlock: 'Розблокувати',
    lock: 'Заблокувати',
    unlocked: 'Дані здоров\'я зашифровані.',
    unsupported: 'Шифрування недоступне.',
    error: 'Не вдалося розблокувати.',
    migrated: 'Дані зашифровано.',
  },
  es: { title: 'Cifrar datos locales', body: 'Frase opcional para cifrar diario y notas.', passphrase: 'Frase', unlock: 'Desbloquear', lock: 'Bloquear', unlocked: 'Datos cifrados.', unsupported: 'No disponible.', error: 'Error.', migrated: 'Cifrado.' },
  fr: { title: 'Chiffrer les données locales', body: 'Phrase optionnelle pour chiffrer journal et notes.', passphrase: 'Phrase', unlock: 'Déverrouiller', lock: 'Verrouiller', unlocked: 'Données chiffrées.', unsupported: 'Indisponible.', error: 'Erreur.', migrated: 'Chiffré.' },
  de: { title: 'Lokale Daten verschlüsseln', body: 'Optionale Passphrase für Tagebuch und Notizen.', passphrase: 'Passphrase', unlock: 'Entsperren', lock: 'Sperren', unlocked: 'Daten verschlüsselt.', unsupported: 'Nicht verfügbar.', error: 'Fehler.', migrated: 'Verschlüsselt.' },
  zh: { title: '加密本地健康数据', body: '可选口令加密日记与语音。', passphrase: '口令', unlock: '解锁', lock: '锁定', unlocked: '已加密。', unsupported: '不支持。', error: '失败。', migrated: '已迁移。' },
  ja: { title: 'ローカルデータを暗号化', body: '任意のパスフレーズで日記等を暗号化。', passphrase: 'パスフレーズ', unlock: '解除', lock: 'ロック', unlocked: '暗号化済み。', unsupported: '非対応。', error: '失敗。', migrated: '完了。' },
  pt: { title: 'Criptografar dados locais', body: 'Frase opcional para diário e notas.', passphrase: 'Frase', unlock: 'Desbloquear', lock: 'Bloquear', unlocked: 'Dados criptografados.', unsupported: 'Indisponível.', error: 'Erro.', migrated: 'Migrado.' },
  ar: {
    title: 'Encrypt local health data',
    body: 'Optional passphrase encrypts your journal, voice clips, and lab drafts on this device.',
    passphrase: 'Passphrase',
    unlock: 'Unlock & encrypt',
    lock: 'Lock storage',
    unlocked: 'Health data is encrypted on this device.',
    unsupported: 'Encryption is not available in this browser.',
    error: 'Could not unlock. Check your passphrase.',
    migrated: 'Sensitive data encrypted.',
  },
  he: {
    title: 'Encrypt local health data',
    body: 'Optional passphrase encrypts your journal, voice clips, and lab drafts on this device.',
    passphrase: 'Passphrase',
    unlock: 'Unlock & encrypt',
    lock: 'Lock storage',
    unlocked: 'Health data is encrypted on this device.',
    unsupported: 'Encryption is not available in this browser.',
    error: 'Could not unlock. Check your passphrase.',
    migrated: 'Sensitive data encrypted.',
  },
};

type HealthStorageUnlockPanelProps = {
  lang: Language;
};

export const HealthStorageUnlockPanel: React.FC<HealthStorageUnlockPanelProps> = ({ lang }) => {
  const copy = getLang(copyByLang, lang);
  const supported = isSecureHealthStorageSupported();
  const [unlocked, setUnlocked] = useState(() => isHealthStorageUnlocked());
  const [passphrase, setPassphrase] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);

  if (!supported) {
    return (
      <p className="text-xs font-semibold text-slate-500">{copy.unsupported}</p>
    );
  }

  const handleUnlock = async () => {
    if (!passphrase.trim()) return;
    setBusy(true);
    setFeedback('');
    const ok = await unlockHealthStorage(passphrase.trim());
    if (!ok) {
      setFeedback(copy.error);
      setBusy(false);
      return;
    }
    const migrated = await migrateSensitiveKeysToEncrypted();
    setUnlocked(true);
    setPassphrase('');
    setFeedback(migrated > 0 ? copy.migrated : copy.unlocked);
    setBusy(false);
  };

  const handleLock = () => {
    lockHealthStorage();
    setUnlocked(false);
    setFeedback('');
  };

  return (
    <div className="space-y-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-900/40">
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-luna-purple">{copy.title}</p>
        <p className="text-xs font-semibold text-slate-500 mt-2">{copy.body}</p>
      </div>
      {unlocked ? (
        <div className="space-y-3">
          <p className="text-xs font-bold text-emerald-600">{feedback || copy.unlocked}</p>
          <button type="button" onClick={handleLock} className="px-5 py-3 rounded-full border-2 border-slate-200 text-[10px] font-black uppercase tracking-widest">
            {copy.lock}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder={copy.passphrase}
            className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold text-sm"
            autoComplete="new-password"
          />
          {feedback && <p className="text-xs font-bold text-rose-500">{feedback}</p>}
          <button
            type="button"
            disabled={busy || !passphrase.trim()}
            onClick={() => handleUnlock()}
            className="px-5 py-3 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
          >
            {copy.unlock}
          </button>
        </div>
      )}
    </div>
  );
};
