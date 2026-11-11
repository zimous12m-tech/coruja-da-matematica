const PATHS = {
  star: '<path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18l-5.9 3 1.2-6.5L2.5 9.9 9.1 9z" />',
  feather: '<path d="M12 3c-3.2 3.2-5 6.3-5 9.4A5 5 0 0 0 12 17a5 5 0 0 0 5-4.6c0-3.1-1.8-6.2-5-9.4z" /><path d="M12 17v4" />',
  left: '<path d="M15 6l-6 6 6 6" />',
  next: '<path d="M5 12h14" /><path d="M13 6l6 6-6 6" />',
  exit: '<path d="M6 6l12 12" /><path d="M18 6L6 18" />',
  lock: '<rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />',
  crown: '<path d="M3 8l4 4 5-6 5 6 4-4v9H3z" />',
  settings: '<circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />',
  family: '<circle cx="8" cy="7" r="3" /><circle cx="16" cy="7" r="3" /><path d="M3 21v-2a5 5 0 0 1 5-5M21 21v-2a5 5 0 0 0-5-5M12 21v-3a4 4 0 0 1 4-4" />',
  info: '<circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 8v.01" />',
  up: '<path d="M6 15l6-6 6 6" />',
  right: '<path d="M9 6l6 6-6 6" />',
  flame: '<path d="M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z" />',
  sun: '<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />',
  check: '<path d="M4 12l5 5L20 6" />',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0zM7 4H4v3a3 3 0 0 0 3 3M17 4h3v3a3 3 0 0 1-3 3" />'
} as const;

const WORLD_PATHS = {
  numeros: '<path d="M6 4v16" /><path d="M18 4v16" /><path d="M3 9h18" /><path d="M3 15h18" />',
  fracoes: '<circle cx="9" cy="9" r="5" /><path d="M14 14l6 6" />',
  geometria: '<path d="M12 3l9 17H3z" /><path d="M12 10v6" />',
  percentagens: '<circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /><path d="M19 5L5 19" />',
  estatistica: '<path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" />',
  logica: '<circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" />'
} as const;

export type IconName = keyof typeof PATHS;
export type WorldIconName = keyof typeof WORLD_PATHS;

export function icon(name: IconName, size = 24): string {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name]}</svg>`;
}

export function worldIcon(name: string, size = 32): string {
  const path = WORLD_PATHS[name as WorldIconName] ?? WORLD_PATHS.logica;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
