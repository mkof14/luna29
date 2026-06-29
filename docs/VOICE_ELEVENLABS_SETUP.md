# ElevenLabs для Luna29

Luna29 говорит голосом через **ElevenLabs** (TTS). Текст ответа — **Gemini** (если ключ есть) или локальный fallback.

## Минимальная настройка (только ElevenLabs)

Достаточно для живого голоса Luna:

```bash
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

## Полная настройка (голос + умные ответы)

```bash
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL

GEMINI_API_KEY=your-gemini-key
```

## Три голоса Luna (один дух, разный тон)

```bash
ELEVENLABS_VOICE_LUNA=EXAVITQu4vr4xnSDxMaL      # Luna — тёплый, ежедневный
ELEVENLABS_VOICE_LUNA_SOFT=XB0fDUnXU5powFXDhCwa  # Luna Soft — мягкое заземление
ELEVENLABS_VOICE_LUNA_CLEAR=21m00Tcm4TlvDq8ikWAM # Luna Clear — ясность и шаг
```

Свои voice ID возьми в [ElevenLabs Voice Library](https://elevenlabs.io/app/voice-library) или проверь:

```bash
curl http://localhost:8787/api/voice/voices
# (нужен ELEVENLABS_API_KEY на сервере)
```

## Локально

1. Добавь переменные в `.env` (корень проекта).
2. Запусти:

```bash
npm run dev:full
```

3. Открой зону участника → **Live Assistant** или **Voice Reflection**.
4. Говори — Luna ответит текстом и голосом ElevenLabs.

Проверка конфигурации:

```bash
curl http://localhost:8787/api/voice/config
# ttsEnabled: true — ElevenLabs подключён
```

## Vercel (production)

В **Project → Settings → Environment Variables**:

| Variable | Value |
|----------|--------|
| `ELEVENLABS_API_KEY` | `sk_...` |
| `ELEVENLABS_MODEL_ID` | `eleven_multilingual_v2` |
| `ELEVENLABS_VOICE_ID` | твой voice id |
| `GEMINI_API_KEY` | опционально, для умных ответов |

Redeploy после сохранения.

## API

| Route | Описание |
|-------|----------|
| `GET /api/voice/config` | статус ElevenLabs + персоны |
| `GET /api/voice/voices` | список голосов из твоего ElevenLabs аккаунта |
| `POST /api/voice/respond` | `{ transcript, lang, personaId? }` → `{ text, audio }` |

`audio` — MP3 в base64, воспроизводится в браузере.

## Отключить голос в браузере

```bash
VITE_ENABLE_VOICE_AI=false
```
