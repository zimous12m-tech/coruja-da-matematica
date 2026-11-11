import { icon, type IconName } from './icons';

let container: HTMLDivElement | null = null;

function getContainer(): HTMLDivElement {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message: string, iconName: IconName = 'star'): void {
  const c = getContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `${icon(iconName, 20)}<span>${message}</span>`;
  c.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
