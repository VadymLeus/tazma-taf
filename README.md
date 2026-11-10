# tazma-taf

Фреймворк автоматизації тестування (TAF) для браузерного відеоредактора [TAZMA](https://github.com/VadymLeus/TAZMA).
Playwright + TypeScript, архітектура gTAA з чотирма шарами, Page Object Model, Data-Driven Testing на JSON.
Оригінальний проєкт: <https://github.com/VadymLeus/TAZMA>. Застосунок лишається окремим проєктом і цим фреймворком не змінюється.

## Архітектура

| Шар gTAA | Папка | Зміст |
|---|---|---|
| 1. Test Scripts | `tests/` | сценарії TC-IMP, TC-EXP, TC-SEG, TC-CAN, TC-EMP, TC-NET, TC-DEMO; жодних селекторів |
| 2. Business Logic | `src/business/` | page objects (`pages/`), фасад `VideoEditorApp`, бізнес-кроки (`steps/`), тексти інтерфейсу (`ui-texts.ts`), фікстури |
| 3. Core / Adaptation | `src/core/`, `playwright.config.ts` | середовища, логер, збір HTTP/консолі, обгортка кроку з перехопленням виняткових ситуацій, явні очікування, перевірка сигнатур файлів, звіти |
| 4. Test Data | `src/testdata/` | `datasets/*.json`, провайдер даних, фабрика вхідних файлів, медіафікстури, `config/environments.json` |

Залежності йдуть лише вниз: сценарій → бізнес-логіка → ядро, дані не залежать ні від чого.

## Швидкий старт (Windows, PowerShell)

Потрібен Node.js 22.6+ (модульні тести фреймворку, як і тести застосунку, використовують `--experimental-strip-types`). У папці застосунку мають бути встановлені залежності (`npm install`).

```powershell
cd tazma-taf
npm install
npx playwright install chromium
npm test
npm run report
```

Застосунок має бути поруч і з встановленими залежностями. Якщо його ще нема: `git clone https://github.com/VadymLeus/TAZMA.git`, потім `npm install` у його папці.
За замовчуванням застосунок шукається в сусідній папці `..\app`; інше місце задається змінною `APP_DIR`, наприклад `setx APP_DIR "D:\path\to\TAZMA"` (після цього відкрийте новий термінал).
Фреймворк сам запускає `npm run dev` у папці застосунку (`webServer` у `playwright.config.ts`).

## Змінні середовища

| Змінна | Значення за замовчуванням | Призначення |
|---|---|---|
| `TAF_ENV` | `dev` | `dev` (сервер розробки Vite), `staging` (production-збірка через `vite preview`), `prod` (розгорнута адреса) |
| `APP_DIR` | `..\app` | де лежать вихідні коди застосунку |
| `APP_BASE_URL` | | вже запущений екземпляр; сервер не стартує |
| `APP_PROD_URL` | | адреса для `TAF_ENV=prod` |
| `TAF_SETS` | усі | `valid,boundary,invalid` - які набори даних виконувати |
| `TAF_WORKERS` | за кількістю ядер (у CI - 2) | паралельність |
| `TAF_RETRIES` | 0 (у CI - 1) | повтори; тест, що пройшов лише з повтору, у звіті має статус flaky |
| `TAF_CHANNEL` | | `chrome` - встановлений Chrome (вміє кодувати H.264) |
| `TAF_REPORTERS` | `list,html,junit,json` | у CI - `blob,list` |
| `TAF_EXPORT_TIMEOUT_MS` | 120000 | ліміт очікування експорту |
| `TAF_LOG_STDOUT` | `warn` | що з логу дублювати в консоль; повний лог завжди у вкладенні `test.log` |

## Команди

| Команда | Що робить |
|---|---|
| `npm test` | усі сценарії |
| `npm run test:smoke` | лише `@smoke` |
| `npm run test:ddt` | лише керовані даними (`@ddt`) |
| `npm run test:staging` | на production-збірці застосунку |
| `npm run test:flaky-check` | smoke-набір 5 разів поспіль без повторів |
| `npm run test:demo-failure` | свідомо падаючий тест: показує скриншот, trace, відео, логи |
| `npm run test:unit` | модульні тести самого фреймворку (провайдер, середовища, сигнатури, логер) |
| `npm run lint:waits` | перевірка, що в коді немає фіксованих пауз |
| `npm run typecheck` | перевірка типів |
| `npm run report` | відкрити HTML-звіт (`reports/html`) |

Теги: `@smoke`, `@ddt`, `@import`, `@export`, `@validation`, `@security`, `@regression`, `@slow`, `@needs-mp4`, `@demo`.
Приклад: `npx playwright test --grep "@export" --grep-invert "@slow"`.

## Дані

`src/testdata/datasets/` - три файли, у кожному набори `valid`, `boundary`, `invalid`:

- `import-files.json` - що показує медіатека після імпорту (справжній файл, пакет з поганим файлом, текст під виглядом .webm, порожній файл);
- `export-scenarios.json` - налаштування експорту й очікуваний результат (формат, розмір кадру, розширення збереженого файлу, сигнатура збереженого файлу);
- `segment-length.json` - довжина частини відновлюваного експорту: класи еквівалентності та граничні значення 1.99 / 2 / 600 / 600.01.

Провайдер `src/testdata/provider.ts` читає файл, перевіряє форму (унікальні `id`, обов'язкові поля, відомі набори), а сценарій створює по одному тесту на запис. Новий випадок - це новий запис у JSON без зміни коду.

Медіафікстури (`src/testdata/media/`): `short.webm` (VP9, 640x480, 2 с, без звуку) і `long.webm` (VP9, 1920x1080, 30 с, для скасування). Створені так:

```
ffmpeg -f lavfi -i testsrc2=size=640x480:rate=30:duration=2 -c:v libvpx-vp9 -b:v 200k -pix_fmt yuv420p -an short.webm
ffmpeg -f lavfi -i testsrc2=size=1920x1080:rate=30:duration=30 -c:v libvpx-vp9 -b:v 80k -maxrate 120k -bufsize 240k -deadline realtime -cpu-used 8 -pix_fmt yuv420p -an long.webm
```

## Стабільність (проти flaky)

- кожен тест має власний контекст браузера, спільного стану між тестами немає;
- жодних `sleep` / `waitForTimeout`: очікування лише за умовою (`expect(...).toBeVisible()`, `expect.poll`), це контролює `npm run lint:waits` у CI;
- детерміновані вхідні файли замість випадкових даних;
- сценарій, що потребує кодека, якого нема в цьому браузері (наприклад MP4 з H.264), пропускається з причиною, а не падає;
- після кожного вибору в списку перевіряється, що сторінка його зберегла;
- повтор у CI лише один, а статус flaky виноситься у звіт.

## Що лишається після збою

Скриншот, відео, trace (`npx playwright show-trace`), `test.log` (кроки сценарію), `http.log` (усі запити та відповіді), `console.log` (консоль і неперехоплені помилки сторінки), `dom-snapshot.html`. Усе це вкладено у HTML-звіт.

## CI/CD

`.github/workflows/taf.yml`: перевірки (типи, відсутність пауз, модульні тести) -> E2E у двох шардах -> об'єднаний HTML- і JUnit-звіт.
Запуск вручну приймає параметри: середовище, теги, кількість воркерів, гілку застосунку. Також є нічний прогін у будні.
Після першого `npm install` закомітьте `package-lock.json`, щоб CI використовував `npm ci`.
Щоб CI міг завантажити застосунок, у Settings -> Secrets and variables -> Actions -> Variables створіть змінну `APP_REPOSITORY` зі значенням `VadymLeus/TAZMA` (або вкажіть репозиторій у полі `app_repo` при ручному запуску).
