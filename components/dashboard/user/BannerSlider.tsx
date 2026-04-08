import { createClient }   from '@/lib/supabase/server';
import BannerSliderClient from './BannerSliderClient';
import { BANNER_SLIDES }  from '@/constants/dashboard-data';

export default async function BannerSlider() {
  let banners: { id: string; title: string; image_url: string; button_link: string }[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('banners')
      .select('id, title, image_url, button_link')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    banners = (data && data.length > 0)
      ? data
      : BANNER_SLIDES.map(s => ({
          id:          String(s.id),      // ← fix: number → string
          title:       s.title,
          image_url:   s.imagePath,
          button_link: s.buttonLink,
        }));
  } catch {
    banners = BANNER_SLIDES.map(s => ({
      id:          String(s.id),          // ← fix: number → string
      title:       s.title,
      image_url:   s.imagePath,
      button_link: s.buttonLink,
    }));
  }

  return <BannerSliderClient banners={banners} />;
}