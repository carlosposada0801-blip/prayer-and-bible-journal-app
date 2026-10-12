import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { listPrayers, type Prayer } from '@/db/prayers';
import { formatDate } from '@/lib/dates';

/** Exports the whole prayer journal as a beautifully formatted PDF and opens the share sheet. */

function escape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
}

function prayerHtml(p: Prayer) {
  return `
  <article>
    <div class="date">${formatDate(p.created_at, 'long')}</div>
    <h2>${escape(p.title)}</h2>
    ${p.tags.length ? `<div class="tags">${p.tags.map((t) => `<span>${escape(t.name)}</span>`).join('')}</div>` : ''}
    ${p.body ? `<p class="body">${escape(p.body)}</p>` : ''}
    ${
      p.answered_at
        ? `<div class="answer"><strong>✓ Answered ${formatDate(p.answered_at)}</strong>${p.answer_note ? `<p>${escape(p.answer_note)}</p>` : ''}</div>`
        : ''
    }
  </article>`;
}

export async function exportPrayerJournalPdf() {
  const prayers = listPrayers();
  const answered = prayers.filter((p) => p.answered_at).length;
  const html = `<!doctype html><html><head><meta charset="utf-8"/>
  <style>
    @page { margin: 54px 60px; }
    body { font-family: 'New York', Georgia, serif; color: #1C2333; }
    .cover { text-align: center; padding: 180px 0 120px; page-break-after: always; }
    .cover h1 { font-size: 40px; font-weight: 400; margin: 0 0 12px; letter-spacing: 1px; }
    .cover .sub { font-family: -apple-system, Helvetica, sans-serif; color: #C49A3C; letter-spacing: 3px; text-transform: uppercase; font-size: 12px; }
    .cover .stats { margin-top: 36px; font-family: -apple-system, Helvetica, sans-serif; color: #5F6675; font-size: 14px; }
    article { page-break-inside: avoid; border-bottom: 1px solid #EEE7D8; padding: 22px 0; }
    .date { font-family: -apple-system, Helvetica, sans-serif; font-size: 11px; color: #C49A3C; letter-spacing: 1.5px; text-transform: uppercase; }
    h2 { font-size: 22px; font-weight: 600; margin: 6px 0 8px; }
    .tags span { display: inline-block; font-family: -apple-system, Helvetica, sans-serif; font-size: 11px; color: #5F6675; background: #F3EEE3; border-radius: 10px; padding: 2px 9px; margin-right: 6px; }
    .body { font-size: 15px; line-height: 1.65; }
    .answer { background: #E3ECDF; border-radius: 10px; padding: 12px 16px; margin-top: 10px; font-size: 14px; }
    .answer strong { font-family: -apple-system, Helvetica, sans-serif; color: #4F7A57; font-size: 12px; }
    .answer p { margin: 6px 0 0; line-height: 1.55; }
  </style></head><body>
    <div class="cover">
      <div class="sub">Abide</div>
      <h1>My Prayer Journal</h1>
      <div class="stats">${prayers.length} prayers · ${answered} answered<br/>Exported ${formatDate(new Date(), 'long')}</div>
    </div>
    ${prayers.map(prayerHtml).join('')}
  </body></html>`;

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Prayer Journal', UTI: 'com.adobe.pdf' });
  }
  return uri;
}
