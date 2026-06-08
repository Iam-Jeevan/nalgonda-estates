'use client';

import { useCallback, useEffect, useState } from 'react';

const SAVED_KEY = 'app:saved:v1';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

async function jsonOrThrow(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export function usePropertyStore() {
  const [properties, setProperties] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/properties', { cache: 'no-store' });
      const data = await jsonOrThrow(res);
      setProperties(data.properties || []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addProperty = useCallback(async (p) => {
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(p),
    });
    const data = await jsonOrThrow(res);
    setProperties((prev) => [data.property, ...prev]);
    return data.property;
  }, []);

  const updateProperty = useCallback(async (id, patch) => {
    const res = await fetch(`/api/properties/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(patch),
    });
    const data = await jsonOrThrow(res);
    setProperties((prev) => prev.map((p) => (p.id === id ? data.property : p)));
    return data.property;
  }, []);

  const deleteProperty = useCallback(async (id) => {
    const res = await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await jsonOrThrow(res);
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleSold = useCallback(async (id) => {
    const res = await fetch(`/api/properties/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ action: 'toggleSold' }),
    });
    const data = await jsonOrThrow(res);
    setProperties((prev) => prev.map((p) => (p.id === id ? data.property : p)));
  }, []);

  // "Reset" no longer makes sense client-side. We just refetch.
  const resetAll = refresh;

  return {
    properties,
    loaded,
    error,
    refresh,
    addProperty,
    updateProperty,
    deleteProperty,
    toggleSold,
    resetAll,
  };
}

/* useSaved unchanged: still a personal browser-only feature, fine in localStorage */
export function useSaved() {
  const [saved, setSaved] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch (e) {}
  }, []);
  const toggle = useCallback((id) => {
    setSaved((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }, []);
  const isSaved = (id) => saved.includes(id);
  return { saved, toggle, isSaved };
}