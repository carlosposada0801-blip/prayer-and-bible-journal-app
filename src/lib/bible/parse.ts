import type { Verse } from './types';

/** Text parsers for the licensed-translation APIs (kept pure so they're easy to test). */

export type ParsedChapter = { verses: Verse[]; title: string | null };

/**
 * Splits text like "[1] In the beginning… [2] Now the earth…" into verses.
 * Text before the first number is a psalm title when the first number is 1,
 * otherwise it's verse 1 (some APIs leave the first number off).
 */
export function splitNumberedVerses(content: string): ParsedChapter {
  const parts = content.split(/\[(\d+)\]/);
  const clean = (t: string) => t.replace(/\s+/g, ' ').trim();
  const verses: Verse[] = [];
  let title: string | null = null;
  const lead = clean(parts[0] ?? '');
  if (lead) {
    if (parts[1] === '1') title = lead;
    else verses.push({ verse: 1, text: lead });
  }
  for (let i = 1; i < parts.length; i += 2) {
    const text = clean(parts[i + 1] ?? '');
    if (text) verses.push({ verse: Number(parts[i]), text });
  }
  return { verses, title };
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '’', nbsp: ' ' };

export function decodeEntities(text: string) {
  return text.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

/** Removes every element whose class is one of `classes`, including nested children. */
export function removeElements(html: string, classes: string[]) {
  const open = new RegExp(`<(\\w+)[^>]*\\bclass="(?:${classes.join('|')})"[^>]*>`, 'i');
  let out = html;
  for (let m = open.exec(out); m; m = open.exec(out)) {
    const tag = m[1].toLowerCase();
    const tagRe = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    tagRe.lastIndex = m.index + m[0].length;
    let depth = 1;
    let end = out.length;
    for (let t = tagRe.exec(out); t; t = tagRe.exec(out)) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) {
        end = t.index + t[0].length;
        break;
      }
    }
    out = out.slice(0, m.index) + out.slice(end);
  }
  return out;
}


/** Tyndale's NLT API returns HTML; this turns it into plain verses. */
export function parseNltHtml(html: string, book: number): ParsedChapter {

  // Each verse is wrapped like <verse_export … vn="16">…</verse_export>.
  const verses: Verse[] = [];
  let title: string | null = null;
  const verseRe = /<verse_export\b[^>]*\bvn="(\d+)"[^>]*>([\s\S]*?)<\/verse_export>/gi;
  for (let m = verseRe.exec(html); m; m = verseRe.exec(html)) {
    let body = m[2];
    if (book === 19 && m[1] === '1' && !title) {
      const sup = /<[^>]*\bclass="psa-title"[^>]*>([\s\S]*?)<\/\w+>/i.exec(body);
      if (sup) title = decodeEntities(sup[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim() || null;
    }
    body = body.replace(/<h\d\b[\s\S]*?<\/h\d>/gi, '');
    // Small caps (LORD for God's name) → capitals, as printed Bibles show it.
    body = body.replace(/<span\b[^>]*\bclass="sc"[^>]*>([^<]*)<\/span>/gi, (_, t: string) => t.toUpperCase());
    body = removeElements(body, ['vn', 'tn', 'a-tn', 'tn-ref', 'psa-title', 'cw_ch', 'chapter-number', 'subhead[\\w-]*']);
    const text = decodeEntities(body.replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:!?’”)])/g, '$1')
      .replace(/([“‘(])\s+/g, '$1')
      .trim();
    if (text) verses.push({ verse: Number(m[1]), text });
  }
  if (!verses.length) throw new Error('The NLT returned no text for this chapter.');
  return { verses, title };
}
