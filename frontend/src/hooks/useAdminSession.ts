'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminCheckSession } from '@/lib/admin-api';

export function useAdminSession() {
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
