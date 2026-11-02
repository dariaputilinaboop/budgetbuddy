// Мост к нативным возможностям телефона (Capacitor). В браузере isNative = false.
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Preferences } from '@capacitor/preferences';

const isNative = Capacitor.isNativePlatform();

window.NativeBudget = {
  isNative,
  async listen() {
    const { available } = await SpeechRecognition.available();
    if (!available) throw { code: 'unavailable' };
    let perm = await SpeechRecognition.checkPermissions();
    if (perm.speechRecognition !== 'granted') perm = await SpeechRecognition.requestPermissions();
    if (perm.speechRecognition !== 'granted') throw { code: 'denied' };
    const res = await SpeechRecognition.start({
      language: 'ru-RU',
      maxResults: 1,
      partialResults: false,
      popup: true,
      prompt: 'Говорите: «такси 450 и кофе 200»',
    });
    return (res && res.matches && res.matches[0]) || '';
  },
  async load(key) {
    const { value } = await Preferences.get({ key });
    return value;
  },
  async save(key, value) {
    await Preferences.set({ key, value });
  },
};
