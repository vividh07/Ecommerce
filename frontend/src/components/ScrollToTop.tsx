import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll window to top on every route change (pathname + search). */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}
