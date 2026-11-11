let seed = 20261110;

export const setSeed = (value) => {
  seed = value;
};

export const rnd = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};

export const int = (min, max) => min + Math.floor(rnd() * (max - min + 1));

export const pick = (list) => list[Math.floor(rnd() * list.length)];

export const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

export const pt = (value) => String(value).replace('.', ',');

export function build(correct, wrongs, near) {
  const options = [String(correct), ...wrongs.map(String), String(near)];
  assert(options.length === 4, `esperava 4 opções, recebi ${options.length}`);
  const unique = new Set(options);
  assert(unique.size === 4, `opções colidem: ${options.join(' | ')}`);
  const shuffled = shuffle(options);
  return { opcoes: shuffled, resposta: shuffled.indexOf(String(correct)) };
}