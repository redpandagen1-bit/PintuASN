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
  icon: string; // Icon name as string (will be mapped in component)
  isActive?: boolean; // Has working route
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
    href: '/dashboard',
    icon: 'BookOpen',
    isActive: false
  },
  {
    id: 'daftar-tryout',
    label: 'Daftar Tryout',
    href: '/dashboard',
    icon: 'PlayCircle',
    isActive: false
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
    href: '/dashboard',
    icon: 'ShoppingCart',
    isActive: false
  }
];

export const SECONDARY_MENU_ITEMS: MenuItem[] = [
  {
    id: 'konsultasi',
    label: 'Konsultasi',
    href: '/dashboard',
    icon: 'MessageCircle',
    isActive: false
  },
  {
    id: 'event-promo',
    label: 'Event & Promo',
    href: '/dashboard',
    icon: 'Zap',
    isActive: false
  },
  {
    id: 'grup',
    label: 'Grup',
    href: '/dashboard',
    icon: 'Users',
    isActive: false
  }
];

// For Feature Grid (mobile) - excludes Dashboard
export const FEATURE_GRID_ITEMS: MenuItem[] = [
  ...MAIN_MENU_ITEMS.filter(item => item.id !== 'dashboard'),
  ...SECONDARY_MENU_ITEMS
];
