import { useState, useEffect, useCallback, useMemo } from 'react';
import { Handbag } from '../types/handbag';
import {
  getFavorites,
  addFavorite as storageAdd,
  removeFavorite as storageRemove,
  removeMultipleFavorites as storageRemoveMultiple,
  removeAllFavorites as storageRemoveAll,
} from '../services/favoriteStorage';
import { useDebounce } from './useDebounce';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Handbag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      setFavorites(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (id: string) => favorites.some(h => h.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(async (handbag: Handbag) => {
    if (favorites.some(h => h.id === handbag.id)) {
      const updated = await storageRemove(handbag.id);
      setFavorites(updated);
    } else {
      const updated = await storageAdd(handbag);
      setFavorites(updated);
    }
  }, [favorites]);

  const removeSingle = useCallback(async (id: string) => {
    const updated = await storageRemove(id);
    setFavorites(updated);
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }, []);

  const removeSelected = useCallback(async () => {
    const updated = await storageRemoveMultiple(Array.from(selectedIds));
    setFavorites(updated);
    setSelectedIds(new Set());
    setIsSelectMode(false);
  }, [selectedIds]);

  const removeAll = useCallback(async () => {
    await storageRemoveAll();
    setFavorites([]);
    setSelectedIds(new Set());
    setIsSelectMode(false);
  }, []);

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode(prev => !prev);
    setSelectedIds(new Set());
  }, []);

  const toggleSelectItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(favorites.map(h => h.id)));
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    if (!debouncedSearch.trim()) return favorites;
    const lower = debouncedSearch.toLowerCase();
    return favorites.filter(
      h =>
        h.handbagName.toLowerCase().includes(lower) ||
        h.brand.toLowerCase().includes(lower)
    );
  }, [favorites, debouncedSearch]);

  return {
    favorites,
    filteredFavorites,
    loading,
    isFavorite,
    toggleFavorite,
    removeSingle,
    removeSelected,
    removeAll,
    selectedIds,
    isSelectMode,
    toggleSelectMode,
    toggleSelectItem,
    selectAll,
    searchTerm,
    setSearchTerm,
  };
};
