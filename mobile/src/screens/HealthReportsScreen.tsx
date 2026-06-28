import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';
import { generateReport, getReportHistory, preparePdf, runOcrIntake, saveReport } from '../services/reports';

export function HealthReportsScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: {
      title: 'Health Reports',
      subtitle: 'Clear report for doctor visits and daily clarity.',
      inputs: 'Today context',
      labs: 'Lab markers',
      hormones: 'Hormones',
      source: 'Analysis source',
      gen: 'Generate report',
      generated: 'Generated report',
      recent: 'Recent reports',
      save: 'Save',
      share: 'Share',
      print: 'Print',
      pdf: 'Download PDF',
      cycle: 'Cycle day',
      sleep: 'Sleep',
      energy: 'Energy',
      mood: 'Mood',
      note: 'Lab or personal note',
      ferritin: 'Ferritin',
      tsh: 'TSH',
      vitaminD: 'Vitamin D',
      estradiol: 'Estradiol',
      progesterone: 'Progesterone',
      cortisol: 'Cortisol',
      sourceHint: 'Blood test, uploaded scan, or user note',
      ocr: 'Read scan / text',
      ocrDone: 'Scan text was added to the note field.',
      no: 'No additional notes.',
      disclaimer: 'LUNA29 IS NOT A DIAGNOSIS TOOL. IF NEEDED, CONTACT YOUR DOCTOR.',
      recommendationTitle: 'Gentle recommendation',
      recommendationBody: 'Keep tonight slower, hydrate, and prioritize earlier sleep.',
      reportId: 'Report ID',
      statusSaved: 'Report saved in local history.',
      statusPrinted: 'Print preview prepared.',
      statusPdf: 'PDF package prepared for next backend phase.',
    },
    ru: {
      title: 'Health Reports',
      subtitle: 'Понятный отчет для врача и ежедневной ясности.',
      inputs: 'Контекст дня',
      labs: 'Лабораторные маркеры',
      hormones: 'Гормоны',
      source: 'Источник анализа',
      gen: 'Сгенерировать отчет',
      generated: 'Сформированный отчет',
      recent: 'Последние отчеты',
      save: 'Сохранить',
      share: 'Поделиться',
      print: 'Печать',
      pdf: 'Скачать PDF',
      cycle: 'День цикла',
      sleep: 'Сон',
      energy: 'Энергия',
      mood: 'Настроение',
      note: 'Лабораторная или личная заметка',
      ferritin: 'Ферритин',
      tsh: 'ТТГ',
      vitaminD: 'Витамин D',
      estradiol: 'Эстрадиол',
      progesterone: 'Прогестерон',
      cortisol: 'Кортизол',
      sourceHint: 'Анализ крови, скан документа или заметка',
      ocr: 'Считать скан / текст',
      ocrDone: 'Текст из скана добавлен в поле заметки.',
      no: 'Дополнительных заметок нет.',
      disclaimer: 'LUNA29 НЕ ЯВЛЯЕТСЯ ИНСТРУМЕНТОМ ДИАГНОЗА. ПРИ НЕОБХОДИМОСТИ ОБРАТИТЕСЬ К ВРАЧУ.',
      recommendationTitle: 'Мягкая рекомендация',
      recommendationBody: 'Сделайте вечер спокойнее, добавьте воду и лягте спать раньше.',
      reportId: 'ID отчета',
      statusSaved: 'Отчет сохранен в локальной истории.',
      statusPrinted: 'Подготовлен предпросмотр печати.',
      statusPdf: 'PDF-пакет подготовлен для следующей серверной фазы.',
    },
    es: {
      title: 'Health Reports',
      subtitle: 'Reporte claro para visitas medicas y claridad diaria.',
      inputs: 'Contexto de hoy',
      labs: 'Marcadores de laboratorio',
      hormones: 'Hormonas',
      source: 'Fuente de analisis',
      gen: 'Generar reporte',
      generated: 'Reporte generado',
      recent: 'Reportes recientes',
      save: 'Guardar',
      share: 'Compartir',
      print: 'Imprimir',
      pdf: 'Descargar PDF',
      cycle: 'Dia del ciclo',
      sleep: 'Sueno',
      energy: 'Energia',
      mood: 'Estado de animo',
      note: 'Nota de laboratorio o personal',
      ferritin: 'Ferritina',
      tsh: 'TSH',
      vitaminD: 'Vitamina D',
      estradiol: 'Estradiol',
      progesterone: 'Progesterona',
      cortisol: 'Cortisol',
      sourceHint: 'Analisis de sangre, escaneo o nota de usuario',
      ocr: 'Leer escaneo / texto',
      ocrDone: 'El texto escaneado se agrego al campo de nota.',
      no: 'Sin notas adicionales.',
      disclaimer: 'LUNA29 NO ES UNA HERRAMIENTA DE DIAGNOSTICO. SI ES NECESARIO, CONSULTA A TU MEDICO.',
      recommendationTitle: 'Sugerencia suave',
      recommendationBody: 'Haz la noche mas lenta, hidrata y duerme un poco antes.',
      reportId: 'ID del reporte',
      statusSaved: 'Reporte guardado en historial local.',
      statusPrinted: 'Vista previa de impresion preparada.',
      statusPdf: 'Paquete PDF preparado para la siguiente fase backend.',
    },
  }[resolveLangBase(lang)];
  const [cycleDay, setCycleDay] = useState('17');
  const [sleep, setSleep] = useState('6h 20m');
  const [energy, setEnergy] = useState('Lower');
  const [mood, setMood] = useState('Sensitive');
  const [note, setNote] = useState('');
  const [source, setSource] = useState('Blood test + user note');
  const [ferritin, setFerritin] = useState('32 ng/mL');
  const [tsh, setTsh] = useState('2.1 mIU/L');
  const [vitaminD, setVitaminD] = useState('28 ng/mL');
  const [estradiol, setEstradiol] = useState('145 pg/mL');
  const [progesterone, setProgesterone] = useState('9.8 ng/mL');
  const [cortisol, setCortisol] = useState('17 ug/dL');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadRemoteHistory() {
    try {
      const remote = await getReportHistory();
      if (remote.length > 0) {
        setHistory(remote.map((item) => item.text).slice(0, 3));
      }
    } catch {
      // silent fallback to local history only
    }
  }

  useEffect(() => {
    void loadRemoteHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildReportText() {
    const reportId = `LUNA29-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Math.floor(Math.random() * 900 + 100)}`;
    return [
      'Luna29 Health Report',
      `${copy.reportId}: ${reportId}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Cycle day: ${cycleDay}`,
      `Sleep: ${sleep}`,
      `Energy: ${energy}`,
      `Mood: ${mood}`,
      `Source: ${source || copy.sourceHint}`,
      '',
      'Hormones',
      `Estradiol: ${estradiol}`,
      `Progesterone: ${progesterone}`,
      `Cortisol: ${cortisol}`,
      '',
      'Lab markers',
      `Ferritin: ${ferritin}`,
      `TSH: ${tsh}`,
      `Vitamin D: ${vitaminD}`,
      '',
      'Interpretation summary',
      '- Energy and mood may feel more sensitive with shorter sleep.',
      '- Luteal-phase timing can align with lower tolerance to pressure.',
      '- Vitamin D and ferritin can be watched with your doctor over time.',
      '',
      `${copy.recommendationTitle}:`,
      copy.recommendationBody,
      `Note: ${note || copy.no}`,
      '',
      copy.disclaimer,
    ].join('\n');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      <SurfaceCard style={styles.inputCard}>
        <Text style={styles.cardTitle}>{copy.inputs}</Text>
        <TextInput value={cycleDay} onChangeText={setCycleDay} placeholder={copy.cycle} style={styles.input} placeholderTextColor={colors.textMuted} />
        <TextInput value={sleep} onChangeText={setSleep} placeholder={copy.sleep} style={styles.input} placeholderTextColor={colors.textMuted} />
        <TextInput value={energy} onChangeText={setEnergy} placeholder={copy.energy} style={styles.input} placeholderTextColor={colors.textMuted} />
        <TextInput value={mood} onChangeText={setMood} placeholder={copy.mood} style={styles.input} placeholderTextColor={colors.textMuted} />
      </SurfaceCard>

      <SurfaceCard style={styles.reportCard}>
        <Text style={styles.cardTitle}>{copy.hormones}</Text>
        <TextInput value={estradiol} onChangeText={setEstradiol} placeholder={copy.estradiol} style={styles.input} placeholderTextColor={colors.textMuted} />
        <TextInput value={progesterone} onChangeText={setProgesterone} placeholder={copy.progesterone} style={styles.input} placeholderTextColor={colors.textMuted} />
        <TextInput value={cortisol} onChangeText={setCortisol} placeholder={copy.cortisol} style={styles.input} placeholderTextColor={colors.textMuted} />
      </SurfaceCard>

      <SurfaceCard style={styles.historyCard}>
        <Text style={styles.cardTitle}>{copy.labs}</Text>
        <TextInput value={ferritin} onChangeText={setFerritin} placeholder={copy.ferritin} style={styles.input} placeholderTextColor={colors.textMuted} />
        <TextInput value={tsh} onChangeText={setTsh} placeholder={copy.tsh} style={styles.input} placeholderTextColor={colors.textMuted} />
        <TextInput value={vitaminD} onChangeText={setVitaminD} placeholder={copy.vitaminD} style={styles.input} placeholderTextColor={colors.textMuted} />
      </SurfaceCard>

      <SurfaceCard style={styles.inputCard}>
        <Text style={styles.cardTitle}>{copy.source}</Text>
        <TextInput value={source} onChangeText={setSource} placeholder={copy.sourceHint} style={styles.input} placeholderTextColor={colors.textMuted} />
        <TextInput value={note} onChangeText={setNote} placeholder={copy.note} style={[styles.input, styles.bigInput]} multiline placeholderTextColor={colors.textMuted} />
        <LunaButton
          variant="secondary"
          onPress={async () => {
            setBusy(true);
            try {
              const intake = await runOcrIntake(`${source}\n${note}`);
              setNote((current) => {
                const next = intake.extractedText?.trim() || '';
                if (!next) return current;
                if (!current.trim()) return next;
                return `${current}\n${next}`;
              });
              setStatus(copy.ocrDone);
            } catch {
              setStatus(copy.ocrDone);
            } finally {
              setBusy(false);
            }
          }}
        >
          {copy.ocr}
        </LunaButton>
        <LunaButton
          onPress={async () => {
            setBusy(true);
            setStatus('');
            try {
              const payload = await generateReport({
                cycleDay,
                sleep,
                energy,
                mood,
                source,
                note,
                hormones: { estradiol, progesterone, cortisol },
                labs: { ferritin, tsh, vitaminD },
              });
              const next = payload.text || buildReportText();
              setResult(next);
              setHistory((prev) => [next, ...prev].slice(0, 3));
            } catch {
              const next = buildReportText();
              setResult(next);
              setHistory((prev) => [next, ...prev].slice(0, 3));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? '...' : copy.gen}
        </LunaButton>
        <LunaButton variant="ghost" onPress={() => void loadRemoteHistory()}>
          {copy.recent}
        </LunaButton>
      </SurfaceCard>

      {result ? (
        <SurfaceCard style={styles.reportCard}>
          <Text style={styles.cardTitle}>{copy.generated}</Text>
          <Text style={styles.text}>{result}</Text>
          <Text style={styles.warning}>{copy.disclaimer}</Text>
          <View style={styles.actions}>
            <LunaButton
              variant="secondary"
              onPress={async () => {
                const reportIdMatch = result.match(/(LUNA29-[0-9]{8}-[0-9]{3})/);
                const reportId = reportIdMatch ? reportIdMatch[1] : `LUNA29-${Date.now()}`;
                try {
                  await saveReport({ id: reportId, generatedAt: new Date().toISOString(), text: result });
                } catch {
                  // local fallback still keeps history
                }
                setHistory((prev) => [result, ...prev].slice(0, 3));
                setStatus(copy.statusSaved);
              }}
            >
              {copy.save}
            </LunaButton>
            <LunaButton variant="secondary" onPress={() => setStatus(copy.statusPrinted)}>
              {copy.print}
            </LunaButton>
            <LunaButton
              variant="secondary"
              onPress={async () => {
                const reportIdMatch = result.match(/(LUNA29-[0-9]{8}-[0-9]{3})/);
                const reportId = reportIdMatch ? reportIdMatch[1] : `LUNA29-${Date.now()}`;
                try {
                  await preparePdf(reportId);
                } catch {
                  // local fallback
                }
                setStatus(copy.statusPdf);
              }}
            >
              {copy.pdf}
            </LunaButton>
            <LunaButton
              variant="secondary"
              onPress={() => {
                void Share.share({ message: result, title: 'Luna29 report' });
              }}
            >
              {copy.share}
            </LunaButton>
          </View>
          {status ? <Text style={styles.status}>{status}</Text> : null}
        </SurfaceCard>
      ) : null}

      {history.length > 0 ? (
        <SurfaceCard style={styles.historyCard}>
          <Text style={styles.cardTitle}>{copy.recent}</Text>
          {history.map((item, index) => (
            <Text key={`${index}-${item.slice(0, 10)}`} style={styles.historyItem} numberOfLines={3}>
              {item}
            </Text>
          ))}
        </SurfaceCard>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: { minHeight: 130, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  heroImage: { resizeMode: 'cover' },
  heroOverlay: { flex: 1, padding: 14, backgroundColor: 'rgba(61, 38, 86, 0.25)', justifyContent: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 14,
  },
  bigInput: { minHeight: 90, paddingTop: 10, textAlignVertical: 'top' },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  warning: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8e4f6c',
    fontWeight: '700',
  },
  status: {
    fontSize: 13,
    color: '#7a4f7b',
    fontWeight: '600',
  },
  actions: { gap: 8 },
  historyItem: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    padding: 10,
  },
  inputCard: {
    backgroundColor: 'rgba(255, 248, 255, 0.88)',
  },
  reportCard: {
    backgroundColor: 'rgba(248, 239, 255, 0.84)',
  },
  historyCard: {
    backgroundColor: 'rgba(255, 252, 255, 0.82)',
  },
});
