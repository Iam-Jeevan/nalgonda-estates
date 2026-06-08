'use client';

// Lightweight client-side translation using Google Translate's public gtx endpoint.
// No API key required, CORS-friendly. Falls back gracefully on network failure.

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single';

// Translate a single string from sourceLang -> targetLang.
export async function translateText(text, targetLang, sourceLang = 'en') {
  if (!text || !text.trim()) return '';
  if (targetLang === sourceLang) return text;

  const url =
    `${ENDPOINT}?client=gtx&sl=${sourceLang}&tl=${targetLang}` +
    `&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Translation HTTP ' + res.status);
    const data = await res.json();
    // Response shape: [[["translated","original",null,null,1], ...], null, "en"]
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0]
        .map((seg) => (Array.isArray(seg) ? seg[0] : ''))
        .filter(Boolean)
        .join('');
    }
    return '';
  } catch (err) {
    console.warn('translateText failed:', err);
    return '';
  }
}

// Convenience: translate English text into both Telugu and Hindi in parallel.
export async function translateToAll(text) {
  if (!text || !text.trim()) return { te: '', hi: '' };
  const [te, hi] = await Promise.all([
    translateText(text, 'te'),
    translateText(text, 'hi'),
  ]);
  return { te, hi };
}