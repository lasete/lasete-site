import { createClient } from '@supabase/supabase-js';

export type ContentRow = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  url: string;
  category: string;
  published: boolean;
  post_crop: boolean;
  sort_order: number;
  author?: string | null;
  role?: string | null;
  area?: string | null;
  group?: string | null;
  date?: string | null;
};
type Table<Row, Insert = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
  Relationships: [];
};
export type ContentTable =
  'members' | 'researches' | 'activities' | 'media' | 'projects' | 'notices';
type SettingsRow = {
  id: number;
  email: string;
  instagram: string;
  linkedin: string;
  ai_url: string;
  selection_open: boolean;
  selection_note: string;
  edital_url: string;
  form_url: string;
};
type Database = {
  public: {
    Tables: {
      [K in ContentTable]: Table<
        ContentRow,
        Partial<ContentRow> & { id: string; title: string }
      >;
    } & {
      site_settings: Table<SettingsRow>;
      lasete_admins: Table<{ user_id: string; created_at: string }>;
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
export const supabase = url && key ? createClient<Database>(url, key) : null;
