'use client';

import { useState } from 'react';
import TryoutFilterTabs from './TryoutFilterTabs';

type TierFilter = 'Semua' | 'Gratis' | 'Premium' | 'Platinum';

/**
 * Server-page-safe wrapper: manages filter state client-side.
 * For dashboard, filter visually works but the full list is fetched server-side (6 items).
 * Full filtering is on the /daftar-tryout page.
 */
export function TryoutFilterTabsServer() {
  const [filter, setFilter] = useState<TierFilter>('Semua');
  return <TryoutFilterTabs activeFilter={filter} onFilterChange={setFilter} />;
}