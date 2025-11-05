// Google Analytics helper (gtag)
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-Q5HTRSYCMN';

type GTagEventParams = Record<string, unknown>;

function safeGtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (typeof w.gtag !== 'function') return;
  try {
    w.gtag(...args);
  } catch {
    // swallow errors in analytics calls
  }
}

export function pageview(url: string) {
  safeGtag('config', GA_ID, { page_path: url });
}

export function event(action: string, params: GTagEventParams = {}) {
  safeGtag('event', action, params);
}

const gtag = {
  GA_ID,
  pageview,
  event,
};

export default gtag;
