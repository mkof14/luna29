/** Shared document actions for Admin Zone: copy, share, print, download, PDF. */

export const copyTextSafely = async (text: string): Promise<boolean> => {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
      return true;
    } catch {
      return false;
    }
  }
};

export const shareContent = async (payload: { title: string; text: string; url?: string }): Promise<boolean> => {
  if (typeof navigator.share !== 'function') return false;
  try {
    await navigator.share(payload);
    return true;
  } catch {
    return false;
  }
};

export const printHtmlDocument = (title: string, html: string): boolean => {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=920,height=720');
  if (!win) return false;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title></head><body>${html}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
  return true;
};

export const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const downloadTextFile = (filename: string, content: string, mime = 'text/plain;charset=utf-8') => {
  downloadBlob(filename, new Blob([content], { type: mime }));
};

export const downloadHtmlFile = (filename: string, html: string) => {
  downloadTextFile(filename.endsWith('.html') ? filename : `${filename}.html`, html, 'text/html;charset=utf-8');
};

/** Opens print dialog — user can choose “Save as PDF” in the system dialog. */
export const exportHtmlAsPdf = (title: string, html: string): boolean => printHtmlDocument(title, html);
