import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const rawAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Clean up the URL to guarantee it includes the "https:" protocol
const formattedUrl = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl;

if (!formattedUrl || !rawAnonKey) {
  console.warn('Supabase URL or Anon Key is missing in environment variables. Offline mock fallback or local storage might be preferred for preview.');
}

export const supabase = createClient(formattedUrl || 'https://empty-project.supabase.co', rawAnonKey || 'empty-key');
