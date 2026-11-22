import type { ContentItem } from './content';
export const memberGroups = [
  'Todos',
  'Diretoria',
  'Ligantes',
  'Orientadores',
] as const;
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
// Positions remain stable even when a record is updated or inserted first by the API.
function rank(member: ContentItem) {
  if (member.group === 'Diretoria') {
    const role = normalize(member.role || member.subtitle);
    if (/^vice[ -]?president[ae]/.test(role)) return 1;
    if (/^president[ae]/.test(role)) return 0;
    if (/secretari/.test(role)) return 2;
    // The existing league order is retained among directors of equal authority.
    if (/pesquisa/.test(role)) return 3;
    if (/ensino/.test(role)) return 4;
    if (/comunicacao/.test(role)) return 5;
    if (/extensao/.test(role)) return 6;
    if (/projetos/.test(role)) return 7;
    if (/financeir/.test(role)) return 8;
    return 9;
  }
  if (member.group === 'Ligantes') return 20;
  if (member.group === 'Orientadores') return 30;
  return 40;
}
export function orderMembers(members: ContentItem[]) {
  return [...members].sort((a, b) => rank(a) - rank(b));
}
