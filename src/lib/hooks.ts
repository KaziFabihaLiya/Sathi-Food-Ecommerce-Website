"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const res = await api<T>(url);
      setData(res);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    let ignore = false;
    api<T>(url)
      .then((res) => {
        if (!ignore) {
          setData(res);
          setError(null);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!ignore) {
          setError((e as Error).message);
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [url]);

  return { data, error, loading, reload };
}
