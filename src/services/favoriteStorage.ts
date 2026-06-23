import AsyncStorage from '@react-native-async-storage/async-storage';
import { Handbag } from '../types/handbag';

const FAVORITES_KEY = '@atelier_favorites';

export const getFavorites = async (): Promise<Handbag[]> => {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Handbag[];
};

export const addFavorite = async (handbag: Handbag): Promise<Handbag[]> => {
  const current = await getFavorites();
  if (current.some(h => h.id === handbag.id)) return current;
  const updated = [...current, handbag];
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
};

export const removeFavorite = async (id: string): Promise<Handbag[]> => {
  const current = await getFavorites();
  const updated = current.filter(h => h.id !== id);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
};

export const removeMultipleFavorites = async (ids: string[]): Promise<Handbag[]> => {
  const current = await getFavorites();
  const idSet = new Set(ids);
  const updated = current.filter(h => !idSet.has(h.id));
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
};

export const removeAllFavorites = async (): Promise<void> => {
  await AsyncStorage.removeItem(FAVORITES_KEY);
};

export const isFavorite = async (id: string): Promise<boolean> => {
  const current = await getFavorites();
  return current.some(h => h.id === id);
};
