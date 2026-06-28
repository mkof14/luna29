import { Language, LangCopy, getLang } from '../constants';

export type VoiceFilesCopy = {
  back: string;
  title: string;
  subtitle: string;
  search: string;
  allLanguages: string;
  fromDate: string;
  toDate: string;
  clearFilters: string;
  clearAll: string;
  noFiles: string;
  filesCount: string;
  download: string;
  delete: string;
  transcript: string;
};

  const copyByLang: LangCopy< {
    back: string;
    title: string;
    subtitle: string;
    search: string;
    allLanguages: string;
    fromDate: string;
    toDate: string;
    clearFilters: string;
    clearAll: string;
    noFiles: string;
    filesCount: string;
    download: string;
    delete: string;
    transcript: string;
  }> = {
    en: {
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
    },
    ru: {
      back: 'Назад',
      title: 'Мои голосовые файлы',
      subtitle: 'Сохраненные записи из Voice Note. Прослушивайте, ищите, фильтруйте и управляйте файлами.',
      search: 'Поиск по тексту...',
      allLanguages: 'Все языки',
      fromDate: 'От',
      toDate: 'До',
      clearFilters: 'Сбросить фильтры',
      clearAll: 'Удалить все файлы',
      noFiles: 'Сохраненных голосовых файлов пока нет.',
      filesCount: 'файлов',
      download: 'Скачать',
      delete: 'Удалить',
      transcript: 'Транскрипт',
    },
    uk: {
      back: 'Назад',
      title: 'Мої голосові файли',
      subtitle: 'Збережені записи з Voice Note. Прослуховуйте, шукайте, фільтруйте та керуйте файлами.',
      search: 'Пошук за текстом...',
      allLanguages: 'Усі мови',
      fromDate: 'Від',
      toDate: 'До',
      clearFilters: 'Скинути фільтри',
      clearAll: 'Видалити всі файли',
      noFiles: 'Поки немає збережених голосових файлів.',
      filesCount: 'файлів',
      download: 'Завантажити',
      delete: 'Видалити',
      transcript: 'Транскрипт',
    },
    es: {
      back: 'Atrás',
      title: 'Mis archivos de voz',
      subtitle: 'Grabaciones guardadas de Voice Note. Reproduce, busca, filtra y gestiona tus archivos.',
      search: 'Buscar en transcripción...',
      allLanguages: 'Todos los idiomas',
      fromDate: 'Desde',
      toDate: 'Hasta',
      clearFilters: 'Limpiar filtros',
      clearAll: 'Borrar todos los archivos',
      noFiles: 'Aún no hay archivos de voz guardados.',
      filesCount: 'archivos',
      download: 'Descargar',
      delete: 'Eliminar',
      transcript: 'Transcripción',
    },
    fr: {
      back: 'Retour',
      title: 'Mes fichiers vocaux',
      subtitle: 'Enregistrements sauvegardés du Voice Note. Écoutez, recherchez, filtrez et gérez vos fichiers.',
      search: 'Rechercher dans la transcription...',
      allLanguages: 'Toutes les langues',
      fromDate: 'De',
      toDate: 'À',
      clearFilters: 'Réinitialiser filtres',
      clearAll: 'Supprimer tous les fichiers',
      noFiles: 'Aucun fichier vocal sauvegardé pour le moment.',
      filesCount: 'fichiers',
      download: 'Télécharger',
      delete: 'Supprimer',
      transcript: 'Transcription',
    },
    de: {
      back: 'Zurück',
      title: 'Meine Sprachdateien',
      subtitle: 'Gespeicherte Aufnahmen aus dem Voice Note. Abspielen, suchen, filtern und verwalten.',
      search: 'Transkript durchsuchen...',
      allLanguages: 'Alle Sprachen',
      fromDate: 'Von',
      toDate: 'Bis',
      clearFilters: 'Filter löschen',
      clearAll: 'Alle Dateien löschen',
      noFiles: 'Noch keine gespeicherten Sprachdateien.',
      filesCount: 'Dateien',
      download: 'Download',
      delete: 'Löschen',
      transcript: 'Transkript',
    },
    zh: {
      back: '返回',
      title: '我的语音文件',
      subtitle: '来自 Voice Note 的已保存录音。可播放、搜索、筛选和管理文件。',
      search: '搜索转写内容...',
      allLanguages: '全部语言',
      fromDate: '开始',
      toDate: '结束',
      clearFilters: '清除筛选',
      clearAll: '清空全部文件',
      noFiles: '暂无已保存语音文件。',
      filesCount: '个文件',
      download: '下载',
      delete: '删除',
      transcript: '转写文本',
    },
    ja: {
      back: '戻る',
      title: 'マイ音声ファイル',
      subtitle: 'Voice Note で保存した録音です。再生、検索、フィルタ、管理ができます。',
      search: '文字起こしを検索...',
      allLanguages: 'すべての言語',
      fromDate: '開始',
      toDate: '終了',
      clearFilters: 'フィルタをクリア',
      clearAll: 'すべて削除',
      noFiles: '保存済みの音声ファイルはまだありません。',
      filesCount: '件',
      download: 'ダウンロード',
      delete: '削除',
      transcript: '文字起こし',
    },
    pt: {
      back: 'Voltar',
      title: 'Meus arquivos de voz',
      subtitle: 'Gravações salvas do Voice Note. Reproduza, pesquise, filtre e gerencie seus arquivos.',
      search: 'Buscar na transcrição...',
      allLanguages: 'Todos os idiomas',
      fromDate: 'De',
      toDate: 'Até',
      clearFilters: 'Limpar filtros',
      clearAll: 'Apagar todos os arquivos',
      noFiles: 'Ainda não há arquivos de voz salvos.',
      filesCount: 'arquivos',
      download: 'Baixar',
      delete: 'Excluir',
      transcript: 'Transcrição',
    },
  };

export function getVoiceFilesCopy(lang: Language): VoiceFilesCopy {
  return getLang(copyByLang, lang) || copyByLang.en;
}
