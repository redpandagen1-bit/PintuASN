import { 
  LayoutDashboard, 
  BarChart2, 
  BookOpen, 
  PlayCircle, 
  History, 
  ShoppingCart,
  MessageCircle,
  Zap,
  Users
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  isActive?: boolean;
}

export const MAIN_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    isActive: true
  },
  {
    id: 'statistik',
    label: 'Statistik',
    href: '/statistics',
    icon: 'BarChart2',
    isActive: false
  },
  {
    id: 'materi',
    label: 'Materi',
    href: '/materi',
    icon: 'BookOpen',
    isActive: false
  },
  {
    id: 'daftar-tryout',
    label: 'Daftar Tryout',
    href: '/daftar-tryout',       // ← fix: huruf kecil semua, tanpa typo
    icon: 'PlayCircle',
    isActive: true         // ← aktifkan karena halaman sudah ada
  },
  {
    id: 'riwayat',
    label: 'Riwayat & Pembahasan',
    href: '/history',
    icon: 'History',
    isActive: true
  },
  {
    id: 'beli-paket',
    label: 'Beli Paket',
    href: '/beli-paket',
    icon: 'ShoppingCart',
    isActive: false
  }
];

export const SECONDARY_MENU_ITEMS: MenuItem[] = [
  {
    id: 'konsultasi',
    label: 'Konsultasi',
    href: '/konsultasi',
    icon: 'MessageCircle',
    isActive: false
  },
  {
    id: 'event-promo',
    label: 'Event & Promo',
    href: '/promo',
    icon: 'Zap',
    isActive: false
  },
  {
    id: 'grup',
    label: 'Grup',
    href: '/grup',
    icon: 'Users',
    isActive: false
  }
];

// For Feature Grid (mobile) - excludes Dashboard
export const FEATURE_GRID_ITEMS: MenuItem[] = [
  ...MAIN_MENU_ITEMS.filter(item => item.id !== 'dashboard'),
  ...SECONDARY_MENU_ITEMS
];