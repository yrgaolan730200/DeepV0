"use client";

import { useState, useEffect } from "react";
import { fetchHealth, type ServerHealth } from "@/lib/api";

export function useServerHealth() {
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const data = await fetchHealth();
        if (!cancelled) {
          setHealth(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setHealth(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    check();
    const interval = setInterval(check, 15_000); // poll every 15s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const status: "connected" | "disconnected" | "checking" = loading
    ? "checking"
    : health?.ok
      ? "connected"
      : "disconnected";

  return { health, error, loading, status };
}
