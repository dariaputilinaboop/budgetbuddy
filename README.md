# Голосовой бюджет

Приложение для iPhone и Android: учёт трат голосом. Скажите фразу вроде «вчера продукты 1240 и такси 380, пришла зарплата 65 000», и приложение само определит суммы, даты и категории.

- Траты по дням и по категориям
- Доходы по видам: зарплата, аванс, премия, отпускные и свои виды
- Счета: карта, наличные, отложенные; переводы голосом («отложила 5000», «сняла 3000»)

## Установка

**iPhone через TestFlight.** Когда в Secrets репозитория заданы `APPLE_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID` и `ASC_KEY_P8`, каждая сборка сама загружается в App Store Connect и появляется в TestFlight.

**iPhone без аккаунта разработчика.** Скачайте на компьютер [budget-buddy.ipa](https://github.com/dariaputilinaboop/budgetbuddy/releases/latest/download/budget-buddy.ipa) и установите его программой [Sideloadly](https://sideloadly.io) (Windows или Mac) со своим Apple ID. С бесплатным Apple ID приложение нужно переустанавливать раз в 7 дней, записи при этом сохраняются.

**Android.** Скачайте на телефоне [budget-buddy.apk](https://github.com/dariaputilinaboop/budgetbuddy/releases/latest/download/budget-buddy.apk) и откройте файл.

Все записи хранятся только на телефоне, в репозиторий они не попадают.

## Как устроено

- `src/app.html` — интерфейс и разбор фраз, `src/native.js` — распознавание речи и хранение через Capacitor.
- `npm run build` собирает `www/`.
- GitHub Actions (`.github/workflows/apps.yml`) при каждом изменении в `main` собирает APK и неподписанный IPA и выкладывает их в релиз `latest`.
- `signing/debug.keystore` — ключ подписи, чтобы новые версии ставились поверх старой без потери данных.
