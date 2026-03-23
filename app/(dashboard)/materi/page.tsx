import { createClient } from '@/lib/supabase/server';
import MateriPageClient from './materi-client';

interface Material {
  id: string;
  title: string;
  description: string | null;
  category: 'TWK' | 'TIU' | 'TKP' | 'INFORMASI';
  type: 'video' | 'pdf';
  content_url: string;
  tier: 'free' | 'premium' | 'platinum';
  duration_minutes: number | null;
  is_active: boolean;
  is_new: boolean;
  order_index: number;
  created_at: string;
}

export default async function MateriPage() {
  const supabase = await createClient();

  const { data: materials } = await supabase
    .from('materials')
    .select('*')
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  return <MateriPageClient materials={(materials as Material[]) || []} />;
}