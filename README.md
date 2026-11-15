# ORBITAL FORGE — самостоятельный проект

3D-игра о сборке ракет и полётах на Луну и Марс. Работает как обычный статический сайт без ChatGPT, базы данных и платных API.

## Структура

```text
ORBITAL_FORGE/
├── dist/
│   ├── index.html       ← игра
│   ├── pitch.html       ← презентация (7 слайдов)
│   ├── game.js
│   ├── physics.mjs
│   ├── guide.mjs
│   ├── renderer.mjs
│   ├── i18n.mjs
│   ├── styles.css
│   ├── pitch.css
│   └── space-cover.png
├── .github/workflows/deploy-pages.yml
├── vercel.json
└── netlify.toml
```

В `dist/` уже лежит готовая игра: ничего собирать и устанавливать не нужно. Не перемещай `index.html` из `dist` и не разрывай его связь с файлами `.js`, `.mjs`, `.css`.

## 1. Vercel — рекомендуемый способ

1. Распакуй архив проекта.
2. Создай на [GitHub](https://github.com/new) репозиторий `orbital-forge` (можно **Public** или **Private**).
3. Загрузи **содержимое распакованной папки** в корень репозитория: `dist`, `vercel.json`, `netlify.toml`, `README.md` и каталог `.github`. Не загружай один ZIP вместо файлов.
4. Открой [Vercel → Add New Project](https://vercel.com/new), подключи GitHub и выбери этот репозиторий.
5. Проверь параметры: **Framework Preset: Other**, **Root Directory: `./`**, **Output Directory: `dist`** (уже указан в `vercel.json`), **Build Command: пусто / без сборки**.
6. Нажми **Deploy**. Игра откроется на `https://твой-проект.vercel.app/`, презентация — на `https://твой-проект.vercel.app/pitch.html`.

После изменения кода и `git push` в ветку GitHub Vercel автоматически создаст новое развёртывание.

## 2. GitHub Pages — бесплатная статическая публикация

1. Создай репозиторий и загрузи файлы как в шагах выше.
2. Открой в GitHub **Settings → Pages**.
3. В **Build and deployment → Source** выбери **GitHub Actions**.
4. Вкладка **Actions** покажет запуск готового сценария `Publish ORBITAL FORGE to GitHub Pages`. При необходимости запусти его вручную через **Run workflow**.
5. Открой `https://твой-логин.github.io/orbital-forge/` (для репозитория с таким именем). Презентация находится по адресу `/pitch.html`.

Сценарий сам публикует папку `dist` при каждом новом коммите в `main`. Никаких токенов в код добавлять не нужно.

## 3. Netlify

### Через GitHub

Открой [Netlify → Add new project](https://app.netlify.com/start), выбери **Import an existing project**, GitHub и репозиторий. Настройки: **Publish directory: `dist`** (уже указана в `netlify.toml`), **Build command: пусто**. Опубликуй сайт.

### Без GitHub

Открой [Netlify Drop](https://app.netlify.com/drop) и перетащи **папку `dist`**, а не корень проекта. В ней находится `index.html`.

## 4. Vercel Drop — без GitHub

Если нужен однократный деплой без репозитория, открой [Vercel Drop](https://vercel.com/drop) и загрузи **весь ZIP проекта**, затем выбери имя проекта и Deploy. В архиве уже есть `vercel.json`, указывающий папку `dist`.

## 5. Запуск на компьютере

Из папки проекта выполни (если установлен Python):

```bash
python -m http.server 8000 --directory dist
```

Открой `http://localhost:8000/`. Если ты используешь Windows и команда `python` не работает, попробуй `py -m http.server 8000 --directory dist`.

Не запускай `dist/index.html` двойным кликом: браузер может заблокировать JavaScript-модули для `file://`.

## Как редактировать игру

- Сборка, миссии, события и интерфейс: `dist/game.js`.
- Баланс, детали, топливо и модели расчёта: `dist/physics.mjs`.
- Справочник двигателей, топлива и материалов: `dist/guide.mjs`.
- 3D-визуализация: `dist/renderer.mjs`.
- Языки: `dist/i18n.mjs`.
- Внешний вид: `dist/styles.css`.
- Презентация: `dist/pitch.html`, `dist/pitch.css`.

Сейчас включён тестовый режим с бесконечными деньгами и материалами: `TEST_MODE = true` в `dist/physics.mjs`. Чтобы включить реальную игровую экономику, поставь `false` и заново опубликуй сайт.

Сохранения хранятся в `localStorage` конкретного браузера и устройства. Онлайн-аккаунтов и синхронизации прогресса в этой версии нет.

## Частые ошибки

- **404 на Vercel:** проверь Root Directory `./` и Output Directory `dist`.
- **404 на Netlify:** Publish directory должна быть `dist`, а при Drag & Drop загружай саму папку `dist`.
- **404 на GitHub Pages:** выбери Source `GitHub Actions` и дождись успешного завершения workflow.
- **Белый экран:** проверь, что все файлы из `dist` загружены, а не только `index.html`; открой консоль браузера (F12).

Это учебная симуляция. Модель полёта и цены настроены для игры, а не для настоящего проектирования космических миссий.
