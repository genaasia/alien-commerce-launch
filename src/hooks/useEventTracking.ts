import { useEffect } from 'react';
import { api } from '@/lib/api';

export const useEventTracking = () => {
  useEffect(() => {
    // Track click events
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const elementInfo = {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        textContent: target.textContent?.substring(0, 50), // First 50 chars
        xpath: getElementXPath(target),
        timestamp: new Date().toISOString()
      };
      
      api.trackEvent('click', elementInfo);
    };

    // Track scroll events (throttled)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        api.trackEvent('scroll', {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
          timestamp: new Date().toISOString()
        });
      }, 1000); // Throttle to once per second
    };

    // Track form submissions
    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      api.trackEvent('form_submit', {
        formId: form.id,
        formAction: form.action,
        timestamp: new Date().toISOString()
      });
    };

    // Track input focus (for form engagement)
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        api.trackEvent('input_focus', {
          inputType: (target as HTMLInputElement).type || target.tagName,
          inputId: target.id,
          inputName: (target as HTMLInputElement).name,
          timestamp: new Date().toISOString()
        });
      }
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('submit', handleSubmit);
    document.addEventListener('focus', handleFocus, true);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('submit', handleSubmit);
      document.removeEventListener('focus', handleFocus, true);
      clearTimeout(scrollTimeout);
    };
  }, []);
};

// Helper function to generate XPath for an element
function getElementXPath(element: HTMLElement): string {
  if (element.id !== '') {
    return `id("${element.id}")`;
  }
  
  if (element === document.body) {
    return '/html/body';
  }

  let ix = 0;
  const siblings = element.parentNode?.childNodes || [];
  
  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i];
    if (sibling === element) {
      const parent = element.parentNode as HTMLElement;
      return getElementXPath(parent) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
    }
    if (sibling.nodeType === 1 && (sibling as HTMLElement).tagName === element.tagName) {
      ix++;
    }
  }
  
  return '';
}