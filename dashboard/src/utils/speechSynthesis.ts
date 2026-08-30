/**
 * Utility for Text-to-Speech feedback using Browser Web Speech Synthesis API.
 */

let cachedVoices: SpeechSynthesisVoice[] = [];
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Helper to prefetch voices when available
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Check if the browser supports SpeechSynthesis.
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Stops any active speech synthesis immediately.
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    } catch {
      // Ignore
    }
  }
}

/**
 * Finds the best matching voice for the requested language code (e.g. 'hi-IN', 'en-IN', 'en-US').
 */
function findBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const targetLang = lang.toLowerCase();
  const baseLang = targetLang.split('-')[0];

  // 1. Exact match (e.g. 'en-in', 'hi-in')
  const exact = voices.find((v) => v.lang.toLowerCase() === targetLang);
  if (exact) return exact;

  // 2. If English requested (e.g., 'en-IN' or 'en')
  if (baseLang === 'en') {
    // Prefer Indian English voice if available
    const indianEnglish = voices.find(
      (v) =>
        v.lang.toLowerCase() === 'en-in' ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('indian')
    );
    if (indianEnglish) return indianEnglish;

    // Prefer high-quality standard English voice (US / GB / Google)
    const naturalEnglish = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha'))
    );
    if (naturalEnglish) return naturalEnglish;

    // Any English voice
    const anyEnglish = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    if (anyEnglish) return anyEnglish;
  }

  // 3. If Hindi requested (e.g., 'hi-IN' or 'hi')
  if (baseLang === 'hi') {
    const hindiVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi')
    );
    if (hindiVoice) return hindiVoice;

    // Fallback to Indian English voice if Hindi voice is not installed on system
    const indianEnglish = voices.find(
      (v) => v.lang.toLowerCase() === 'en-in' || v.name.toLowerCase().includes('india')
    );
    if (indianEnglish) return indianEnglish;
  }

  // 4. General prefix match (e.g. 'es', 'fr', etc.)
  const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(baseLang));
  if (prefixMatch) return prefixMatch;

  // 5. System default voice
  const defaultVoice = voices.find((v) => v.default);
  return defaultVoice || voices[0] || null;
}

/**
 * Speaks text back to the user with speech synthesis.
 * Cancels any ongoing synthesis to avoid audio overlapping.
 */
export function speakFeedback(text: string, lang: string = 'en-IN'): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported() || !text || !text.trim()) {
      resolve();
      return;
    }

    try {
      // Cancel previous utterances to avoid overlapping stutter
      window.speechSynthesis.cancel();

      // Resume in case speech synthesis was paused in browser
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voice = findBestVoice(lang);
      if (voice) {
        utterance.voice = voice;
      }

      // Store module reference to protect from garbage collection in Chrome
      currentUtterance = utterance;

      utterance.onend = () => {
        currentUtterance = null;
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        currentUtterance = null;
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Failed to speak feedback:', err);
      currentUtterance = null;
      resolve();
    }
  });
}
