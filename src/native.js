// Мост к нативным возможностям телефона (Capacitor). В браузере isNative = false.
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Preferences } from '@capacitor/preferences';

const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform();

async function ensurePermission() {
  const { available } = await SpeechRecognition.available();
  if (!available) throw { code: 'unavailable' };
  let perm = await SpeechRecognition.checkPermissions();
  if (perm.speechRecognition !== 'granted') perm = await SpeechRecognition.requestPermissions();
  if (perm.speechRecognition !== 'granted') throw { code: 'denied' };
}

let session = null;

window.NativeBudget = {
  isNative,
  platform,
  // Android: системное окно Google «Говорите», возвращает готовый текст.
  async listen() {
    await ensurePermission();
    const res = await SpeechRecognition.start({
      language: 'ru-RU',
      maxResults: 1,
      partialResults: false,
      popup: true,
      prompt: 'Говорите: «такси 450 и кофе 200»',
    });
    return (res && res.matches && res.matches[0]) || '';
  },
  // iPhone: распознавание Apple с живым текстом. Останавливается само после паузы
  // или по повторному нажатию (stopListening). Возвращает итоговый текст.
  async listenStream(onText) {
    await ensurePermission();
    if (session) return '';
    return new Promise(async (resolve, reject) => {
      let last = '';
      let done = false;
      let silenceTimer = null;
      const startedAt = Date.now();
      const finish = async () => {
        if (done) return;
        done = true;
        clearTimeout(silenceTimer);
        clearInterval(maxTimer);
        await new Promise((r) => setTimeout(r, 350)); // дождаться последнего результата
        try { await SpeechRecognition.removeAllListeners(); } catch (e) {}
        session = null;
        resolve(last);
      };
      const stop = async () => {
        try { await SpeechRecognition.stop(); } catch (e) {}
        setTimeout(finish, 900);
      };
      const armSilence = (ms) => {
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(stop, ms);
      };
      const maxTimer = setInterval(() => { if (Date.now() - startedAt > 45000) stop(); }, 1000);
      session = { stop };
      try {
        await SpeechRecognition.removeAllListeners();
        await SpeechRecognition.addListener('partialResults', (d) => {
          const t = d && d.matches && d.matches[0];
          if (t) { last = t; onText && onText(t); armSilence(2200); }
        });
        await SpeechRecognition.addListener('listeningState', (d) => {
          if (d && d.status === 'stopped') setTimeout(finish, 300);
        });
        armSilence(8000);
        await SpeechRecognition.start({ language: 'ru-RU', maxResults: 1, partialResults: true });
      } catch (e) {
        done = true;
        clearTimeout(silenceTimer);
        clearInterval(maxTimer);
        session = null;
        try { await SpeechRecognition.removeAllListeners(); } catch (_) {}
        reject(e);
      }
    });
  },
  stopListening() {
    if (session) session.stop();
  },
  async load(key) {
    const { value } = await Preferences.get({ key });
    return value;
  },
  async save(key, value) {
    await Preferences.set({ key, value });
  },
};
