export function owlSvg(size = 132): string {
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">
    <ellipse cx="60" cy="70" rx="34" ry="38" fill="#8e7cf0" stroke="#241c2e" stroke-width="3" />
    <ellipse cx="30" cy="74" rx="10" ry="21" fill="#5b48c9" stroke="#241c2e" stroke-width="3" />
    <ellipse cx="90" cy="74" rx="10" ry="21" fill="#5b48c9" stroke="#241c2e" stroke-width="3" />
    <circle cx="48" cy="50" r="14" fill="#ffffff" stroke="#241c2e" stroke-width="3" />
    <circle cx="72" cy="50" r="14" fill="#ffffff" stroke="#241c2e" stroke-width="3" />
    <circle cx="48" cy="51" r="6" fill="#241c2e" />
    <circle cx="72" cy="51" r="6" fill="#241c2e" />
    <path d="M60 62 L52 74 L68 74 Z" fill="#fdcb6e" stroke="#241c2e" stroke-width="3" />
  </svg>`;
}
