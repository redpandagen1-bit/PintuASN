import { createAdminClient } from '@/lib/supabase/server';
import BannerSliderClient from './BannerSliderClient';
import { BANNER_SLIDES }  from '@/constants/dashboard-data';

export default async function BannerSlider() {
  let banners: {
    id: string;
    title: string;
    image_url: string;
    image_url_mobile: string | null;
    button_link: string;
  }[] = [];

  const fallback = () =>
    BANNER_SLIDES.map(s => ({
      id:               String(s.id),      // ← fix: number → string
      title:            s.title,
      image_url:        s.imagePath,
      image_url_mobile: null,
      button_link:      s.buttonLink,
    }));

  try {
    const supabase = await createAdminClient();
    const { data } = await supabase
      .from('banners')
      .select('id, title, image_url, image_url_mobile, button_link')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    banners = (data && data.length > 0) ? data : fallback();
  } catch {
    banners = fallback();
  }

  return <BannerSliderClient banners={banners} />;
}