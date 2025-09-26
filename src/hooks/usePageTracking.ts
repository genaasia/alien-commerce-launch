import { useEffect } from 'react';
import { api } from '@/lib/api';

export const usePageTracking = () => {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await api.trackVisitor(
          window.location.pathname,
          navigator.userAgent,
          document.referrer || null
        );
      } catch (err) {
        console.error('Page tracking error:', err);
      }
    };

    trackPageView();
  }, []);
};