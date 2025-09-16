'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AccessLogEntry } from '@/lib/types';

const STORAGE_KEY = 'accessKeyLog';

export function useAccessLog() {
  const [accessLog, setAccessLog] = useState<AccessLogEntry[]>([]);

  useEffect(() => {
    try {
      const storedLog = localStorage.getItem(STORAGE_KEY);
      if (storedLog) {
        setAccessLog(JSON.parse(storedLog));
      }
    } catch (error) {
      console.error('Failed to read access log from localStorage', error);
    }
  }, []);

  const addLogEntry = useCallback((newEntry: Omit<AccessLogEntry, 'id' | 'timestamp'>) => {
    setAccessLog((prevLog) => {
      const entryWithMetadata: AccessLogEntry = {
        ...newEntry,
        id: new Date().getTime().toString(),
        timestamp: new Date().toISOString(),
      };
      const updatedLog = [entryWithMetadata, ...prevLog].slice(0, 50); // Keep last 50 entries
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLog));
      } catch (error) {
        console.error('Failed to save access log to localStorage', error);
      }
      return updatedLog;
    });
  }, []);

  return { accessLog, addLogEntry };
}
