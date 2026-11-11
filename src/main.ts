import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';
import { load, markOnboardingDone } from './services/save';
import { initI18n, isLocale, type Locale } from './services/i18n';
import { startApp } from './ui/app';
import { renderOnboarding } from './ui/screens/onboarding';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Elemento #app nao encontrado');

async function bootstrap(): Promise<void> {
  const save = load();
  const browser = navigator.language;
  const initial: Locale = isLocale(save.settings.locale)
    ? save.settings.locale
    : isLocale(browser)
      ? browser
      : 'pt-PT';

  await initI18n(initial);

  if (!save.onboardingDone) {
    renderOnboarding(root!, () => {
      markOnboardingDone();
      void startApp(root!);
    });
  } else {
    await startApp(root!);
  }
}

bootstrap().catch((error) => {
  root!.innerHTML = `<main class="screen"><h1>Erro</h1><p>${(error as Error).message}</p></main>`;
  console.error(error);
});
