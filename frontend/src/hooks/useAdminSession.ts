'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adminCheckSession } from '@/lib/admin-api';

export interface AdminSession {
  loading: boolean;
  authenticated: boolean;
  refresh: () => Promise<void>;
}

export function useAdminSession(): AdminSession {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminCheckSession();
      setAuthenticated(result);
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, authenticated, refresh };
}

export const AdminSessionContext = createContext<AdminSession | null>(null);

export function useAdminSessionContext(): AdminSession {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error('useAdminSessionContext must be used within AdminSessionContext.Provider');
  }
  return context;
}
