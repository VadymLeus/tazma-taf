// Layer 2 (Business Logic). Every visible string of the application that the locators depend
// on lives here, so a change of wording is a one-file fix.
export const UI = {
  nav: { label: 'Сторінки', editor: 'Редактор', export: 'Експорт', stand: 'Стенд випробувань' },
  regions: { editor: 'Редактор', export: 'Експорт' },
  library: { title: 'Медіатека', pending: /^Читаю файли/ },
  export: {
    title: 'Експорт',
    mainGroup: 'Основне',
    idleCard: 'Що буде записано',
    running: 'Експорт іде',
    result: 'Результат',
    failed: 'Експорт не вдався',
    start: 'Експортувати',
    cancel: 'Скасувати',
    closeResult: 'Закрити результат',
    closeError: 'Закрити',
    save: 'Зберегти',
    // The application names a saved file <base>.<container>.
    savedFileBase: 'tazma-export',
    emptyNotice: 'На таймлайні немає кліпів, експортувати нічого.',
    toEditor: 'До редактора',
    segmentErrorStart: 'Довжина частини',
    resumable: /Відновлюваний експорт/,
    fields: {
      container: 'Формат',
      mode: 'Режим',
      videoCodec: 'Відеокодек',
      audioCodec: 'Аудіокодек',
      quality: 'Якість',
      size: 'Розмір кадру',
      gifFps: 'Частота кадрів',
      segment: 'Довжина частини, с',
    },
    rows: { format: 'Формат', frame: 'Кадр' },
  },
} as const
