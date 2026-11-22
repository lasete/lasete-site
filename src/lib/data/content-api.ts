import { supabase, type ContentTable, type ContentRow } from './supabase';
import type { ContentItem, ContentType, Settings, SiteData } from './content';
export const contentTables: Record<ContentType, ContentTable> = {
  member: 'members',
  research: 'researches',
  activity: 'activities',
  media: 'media',
  project: 'projects',
  notice: 'notices',
};
export async function fetchContent(signal: AbortSignal): Promise<SiteData> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const entries = Object.entries(contentTables) as [
    ContentType,
    ContentTable,
  ][];
  const [settingsResult, results] = await Promise.all([
    supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .abortSignal(signal)
      .single(),
    Promise.all(
      entries.map(([, table]) =>
        supabase!
          .from(table)
          .select('*')
          .order('sort_order')
          .order('id')
          .abortSignal(signal),
      ),
    ),
  ]);
  if (settingsResult.error) throw settingsResult.error;
  for (const result of results) if (result.error) throw result.error;
  const s = settingsResult.data;
  const settings: Settings = {
    email: s.email,
    instagram: s.instagram,
    linkedin: s.linkedin,
    aiUrl: s.ai_url,
    selectionOpen: s.selection_open,
    selectionNote: s.selection_note,
    editalUrl: s.edital_url,
    formUrl: s.form_url,
  };
  const items = results.flatMap((result, index) =>
    (result.data ?? []).map(
      (row) =>
        ({
          id: row.id,
          type: entries[index][0],
          title: row.title,
          subtitle: row.subtitle,
          description: row.description,
          author: row.author ?? undefined,
          image: row.image,
          url: row.id === 'lasete-ai' ? settings.aiUrl : row.url,
          category: row.category,
          published: row.published,
          role: row.role ?? undefined,
          area: row.area ?? undefined,
          group: row.group ?? undefined,
          date: row.date ?? undefined,
          postCrop: row.post_crop,
        }) satisfies ContentItem,
    ),
  );
  return { version: 1, settings, items };
}
export function itemRow(item: ContentItem, sortOrder: number): ContentRow {
  const { id, title, subtitle, description, image, url, category, published } =
    item;
  return {
    id,
    title,
    subtitle,
    description,
    image,
    url,
    category,
    published,
    post_crop: item.postCrop ?? false,
    sort_order: sortOrder,
    ...(item.type === 'member'
      ? {
          role: item.role ?? null,
          area: item.area ?? null,
          group: item.group ?? null,
        }
      : item.type === 'research'
        ? {
            author: item.author?.trim() ?? '',
            date: item.date ?? null,
          }
        : { date: item.date ?? null }),
  };
}
export function settingsRow(s: Settings) {
  return {
    email: s.email,
    instagram: s.instagram,
    linkedin: s.linkedin,
    ai_url: s.aiUrl,
    selection_open: s.selectionOpen,
    selection_note: s.selectionNote,
    edital_url: s.editalUrl,
    form_url: s.formUrl,
  };
}
