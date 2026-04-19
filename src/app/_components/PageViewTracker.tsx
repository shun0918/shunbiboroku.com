'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { pageview } from '~/lib/ga/ga';

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const url = query ? pathname + '?' + query : pathname;
    pageview(url);
  }, [pathname, searchParams]);

  return null;
}
