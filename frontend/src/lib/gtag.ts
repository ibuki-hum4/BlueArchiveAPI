// Google Analytics helper (gtag)
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-Q5HTRSYCMN';

type GTagEventParams = Record<string, any>;

function safeGtag(...args: any[]) {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (typeof w.gtag !== 'function') return;
  try {
    w.gtag(...args);
  } catch (e) {
    // swallow errors in analytics calls
    // console.debug('gtag call failed', e);
  }
}

export function pageview(url: string) {
  safeGtag('config', GA_ID, { page_path: url });
}

export function event(action: string, params: GTagEventParams = {}) {
  safeGtag('event', action, params);
}

export default {
  GA_ID,
  pageview,
  event,
};
