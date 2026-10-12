/**
 * Bible translations.
 *
 * "bundled" translations are public domain and ship inside the app, so they
 * work offline. "api" translations are copyrighted; they load from their
 * official sources with your own keys (src/lib/bible/licensed.ts) and are
 * saved on the device once read. Personal use only.
 */

export type BundledTranslationId = 'BSB' | 'WEB' | 'KJV' | 'ASV' | 'YLT' | 'DARBY';
export type ApiTranslationId = 'NIV' | 'ESV' | 'NLT' | 'NKJV' | 'CSB' | 'NASB';
export type TranslationId = BundledTranslationId | ApiTranslationId;

export type Translation = {
  id: TranslationId;
  name: string;
  year: string;
  description: string;
  source: 'bundled' | 'api';
  /** Notice shown under each chapter (required by the publishers). */
  copyright?: string;
};

export const BUNDLED_TRANSLATIONS: Translation[] = [
  {
    id: 'BSB',
    name: 'Berean Standard Bible',
    year: '2022',
    description: 'Modern, clear and faithful to the original languages.',
    source: 'bundled',
  },
  {
    id: 'WEB',
    name: 'World English Bible',
    year: '2000',
    description: 'A modern update of the ASV. Uses the name "Yahweh."',
    source: 'bundled',
  },
  {
    id: 'KJV',
    name: 'King James Version',
    year: '1769',
    description: 'The beloved classic, with majestic, poetic language.',
    source: 'bundled',
  },
  {
    id: 'ASV',
    name: 'American Standard Version',
    year: '1901',
    description: 'A precise, literal revision of the KJV.',
    source: 'bundled',
  },
  {
    id: 'YLT',
    name: "Young's Literal Translation",
    year: '1898',
    description: 'Extremely literal, word-for-word. Great for study.',
    source: 'bundled',
  },
  {
    id: 'DARBY',
    name: 'Darby Translation',
    year: '1890',
    description: 'A careful, literal translation by J. N. Darby.',
    source: 'bundled',
  },
];

export const API_TRANSLATIONS: Translation[] = [
  {
    id: 'NIV',
    name: 'New International Version',
    year: '2011',
    description: 'Clear, balanced and widely read.',
    source: 'api',
    copyright: 'Scripture quotations taken from The Holy Bible, New International Version® NIV®. Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.™ Used by permission. All rights reserved worldwide.',
  },
  {
    id: 'ESV',
    name: 'English Standard Version',
    year: '2016',
    description: 'Word-for-word, with a readable, literary style.',
    source: 'api',
    copyright: 'Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.',
  },
  {
    id: 'NLT',
    name: 'New Living Translation',
    year: '2015',
    description: 'Warm, natural, thought-for-thought English.',
    source: 'api',
    copyright: 'Scripture quotations are taken from the Holy Bible, New Living Translation, copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers, Carol Stream, Illinois 60188. All rights reserved.',
  },
  {
    id: 'NKJV',
    name: 'New King James Version',
    year: '1982',
    description: 'The KJV’s beauty in modern wording.',
    source: 'api',
    copyright: 'Scripture taken from the New King James Version®. Copyright © 1982 by Thomas Nelson. Used by permission. All rights reserved.',
  },
  {
    id: 'CSB',
    name: 'Christian Standard Bible',
    year: '2017',
    description: 'Accurate and readable, a careful balance.',
    source: 'api',
    copyright: 'Scripture quotations marked CSB have been taken from the Christian Standard Bible®, Copyright © 2017 by Holman Bible Publishers. Used by permission. Christian Standard Bible® and CSB® are federally registered trademarks of Holman Bible Publishers.',
  },
  {
    id: 'NASB',
    name: 'New American Standard Bible',
    year: '2020',
    description: 'Very literal; a favorite for close study.',
    source: 'api',
    copyright: 'Scripture quotations taken from the (NASB®) New American Standard Bible®, Copyright © 1960, 1971, 1977, 1995, 2020 by The Lockman Foundation. Used by permission. All rights reserved. lockman.org',
  },
];

/** Metro bundles these files as assets; they are copied into SQLite on first use. */
export const TRANSLATION_ASSETS: Record<BundledTranslationId, number> = {
  BSB: require('@/assets/bible/bsb.db'),
  WEB: require('@/assets/bible/web.db'),
  KJV: require('@/assets/bible/kjv.db'),
  ASV: require('@/assets/bible/asv.db'),
  YLT: require('@/assets/bible/ylt.db'),
  DARBY: require('@/assets/bible/darby.db'),
};

export const XREFS_ASSET: number = require('@/assets/bible/xrefs.db');

/** Bump when the bundled .db files are rebuilt so devices re-import them. */
export const BIBLE_DATA_VERSION = 2;

export function isBundled(id: TranslationId): id is BundledTranslationId {
  return id in TRANSLATION_ASSETS;
}

export function translationInfo(id: TranslationId): Translation {
  return [...BUNDLED_TRANSLATIONS, ...API_TRANSLATIONS].find((t) => t.id === id) ?? BUNDLED_TRANSLATIONS[0];
}
