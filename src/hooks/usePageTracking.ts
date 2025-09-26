import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePageTracking = () => {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        const { error } = await supabase
          .from('page_views')
          .insert({
            path: window.location.pathname,
            user_agent: navigator.userAgent,
            referrer: document.referrer || null,
          });
        
        if (error) {
          console.error('Failed to track page view:', error);
        }
      } catch (err) {
        console.error('Page tracking error:', err);
      }
    };

    trackPageView();
  }, []);
};