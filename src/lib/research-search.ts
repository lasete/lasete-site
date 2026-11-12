import type { ContentItem } from './content';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

// Uma busca só cobre título, subtítulo, autores e categoria ("Tipo · Tema").
// Todas as palavras digitadas precisam aparecer; busca vazia aceita tudo.
export function matchesResearch(item: ContentItem, query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = normalize(
    [item.title, item.subtitle, item.author ?? '', item.category].join(' '),
  );
  return words.every((word) => text.includes(word));
}
