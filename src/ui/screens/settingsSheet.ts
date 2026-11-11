import type { Settings } from '../../services/save';
import { LOCALE_LABELS, SUPPORTED_LOCALES, t } from '../../services/i18n';
import { openSheet } from '../components/dialog';

type BooleanKey =
  | 'soundEnabled'
  | 'musicEnabled'
  | 'timedMode'
  | 'buttonsOnly'
  | 'highContrast'
  | 'dyslexiaFont';

interface SettingsDeps {
  current: Settings;
  onChange: (change: Partial<Settings>) => void;
}

function toggleRow(
  label: string,
  checked: boolean,
  onChange: (value: boolean) => void
): HTMLElement {
  const row = document.createElement('label');
  row.className = 'row';
  const span = document.createElement('span');
  span.textContent = label;
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  row.append(span, input);
  return row;
}

const TOGGLES: Array<[BooleanKey, string]> = [
  ['soundEnabled', 'settings.sound'],
  ['musicEnabled', 'settings.music'],
  ['timedMode', 'settings.timed'],
  ['buttonsOnly', 'settings.buttonsOnly'],
  ['highContrast', 'settings.highContrast'],
  ['dyslexiaFont', 'settings.dyslexia']
];

export function openSettings(deps: SettingsDeps): void {
  openSheet({ title: t('settings.title') }, (body) => {
    for (const [key, label] of TOGGLES) {
      body.append(
        toggleRow(t(label), deps.current[key], (value) =>
          deps.onChange({ [key]: value } as Partial<Settings>)
        )
      );
    }

    const localeRow = document.createElement('div');
    localeRow.className = 'row';
    const localeLabel = document.createElement('span');
    localeLabel.textContent = t('menu.language');
    const select = document.createElement('select');
    for (const locale of SUPPORTED_LOCALES) {
      const option = document.createElement('option');
      option.value = locale;
      option.textContent = LOCALE_LABELS[locale];
      option.selected = deps.current.locale === locale;
      select.append(option);
    }
    select.addEventListener('change', () => {
      deps.onChange({ locale: select.value as Settings['locale'] });
    });
    localeRow.append(localeLabel, select);
    body.append(localeRow);
  });
}
