export interface SheetOptions {
  title: string;
}

export function openSheet(options: SheetOptions, build: (body: HTMLElement) => void): void {
  const dialog = document.createElement('dialog');
  dialog.className = 'sheet';

  const header = document.createElement('div');
  header.className = 'sheet__header';
  const title = document.createElement('h2');
  title.textContent = options.title;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'sheet__close';
  close.textContent = '\u00d7';
  close.setAttribute('aria-label', 'Fechar');
  header.append(title, close);

  const body = document.createElement('div');
  body.className = 'sheet__body';

  dialog.append(header, body);
  document.body.append(dialog);

  const finish = (): void => {
    dialog.close();
    dialog.remove();
  };

  close.addEventListener('click', finish);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    finish();
  });

  build(body);
  dialog.showModal();
}
