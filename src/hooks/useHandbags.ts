import { useState, useEffect, useCallback, useMemo } from 'react';
import { Handbag } from '../types/handbag';
import { getHandbags } from '../services/handbagApi';
import { sortByCostDescending, sortByCostAscending, sortByName } from '../utils/sort';
import { useDebounce } from './useDebounce';

export type SortOption = 'price_desc' | 'price_asc' | 'name_asc';

export const SORT_LABELS: Record<SortOption, string> = {
  price_desc: 'PRICE (HIGH TO LOW)',
  price_asc:  'PRICE (LOW TO HIGH)',
  name_asc:   'NAME (A–Z)',
};

function applySort(list: Handbag[], sort: SortOption): Handbag[] {
  if (sort === 'price_asc') return sortByCostAscending(list);
  if (sort === 'name_asc')  return sortByName(list);
  return sortByCostDescending(list);
}

export const useHandbags = () => {
  const [handbags, setHandbags] = useState<Handbag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('price_desc');

  const debouncedSearch = useDebounce(searchTerm, 350);

  const fetchHandbags = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await getHandbags();
      setHandbags(data);
    } catch (e) {
      setError('Failed to load handbags. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHandbags();
  }, [fetchHandbags]);

  const filteredHandbags = useMemo(() => {
    let result = handbags;

    if (selectedBrand !== 'All') {
      result = result.filter(h => h.brand === selectedBrand);
    }

    if (debouncedSearch.trim()) {
      const lower = debouncedSearch.toLowerCase();
      result = result.filter(
        h =>
          h.handbagName.toLowerCase().includes(lower) ||
          h.brand.toLowerCase().includes(lower)
      );
    }

    return applySort(result, sortOption);
  }, [handbags, selectedBrand, debouncedSearch, sortOption]);


  const onRefresh = useCallback(() => fetchHandbags(true), [fetchHandbags]);

  return {
    handbags,
    filteredHandbags,
    loading,
    refreshing,
    error,
    searchTerm,
    setSearchTerm,
    selectedBrand,
    setSelectedBrand,
    sortOption,
    setSortOption,
    onRefresh,
    refetch: fetchHandbags,
  };
};
