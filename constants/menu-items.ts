export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;        // lucide icon name (untuk sidebar desktop)
  iconFile: string;    // SVG filename di /images/icons/
  isActive?: boolean;
  external?: boolean;  // buka di tab baru (mis. link WhatsApp)
}

export const MAIN_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    iconFile: 'dashboard',
    isActive: true,
  },
  {
    id: 'statistik',
    label: 'Statistik',
    href: '/statistics',
    icon: 'BarChart2',
    iconFile: 'statistik',
    isActive: false,
  },
  {
    id: 'materi',
    label: 'Materi',
    href: '/materi',
    icon: 'BookOpen',
    iconFile: 'materi',
    isActive: false,
  },
  {
    id: 'daftar-tryout',
    label: 'Daftar Tryout',
    href: '/daftar-tryout',
    icon: 'ClipboardList',
    iconFile: 'daftar_tryout',
    isActive: true,
  },
  {
    id: 'riwayat',
    label: 'Riwayat & Pembahasan',
    href: '/history',
    icon: 'History',
    iconFile: 'riwayat',
    isActive: true,
  },
  {
    id: 'beli-paket',
    label: 'Beli Paket',
    href: '/beli-paket',
    icon: 'ShoppingCart',
    iconFile: 'beli_paket',
    isActive: false,
  },
];

export const SECONDARY_MENU_ITEMS: MenuItem[] = [
  {
    id: 'event-promo',
    label: 'Event & Promo',
    href: '/events-promo',
    icon: 'Megaphone',
    iconFile: 'event_promo',
    isActive: false,
  },
  {
    id: 'grup',
    label: 'Grup',
    href: 'https://wa.me/6585190868980?text=halo%20admin%20pintuASN%2C%20saya%20ingin%20join%20grup',
    icon: 'Users',
    iconFile: 'grup',
    isActive: false,
    external: true,
  },
];

// Untuk FeatureGrid mobile — exclude Dashboard
export const FEATURE_GRID_ITEMS: MenuItem[] = [
  ...MAIN_MENU_ITEMS.filter((item) => item.id !== 'dashboard'),
  ...SECONDARY_MENU_ITEMS,
];