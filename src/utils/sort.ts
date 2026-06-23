import { Handbag } from '../types/handbag';

export const sortByCostDescending = (handbags: Handbag[]): Handbag[] =>
  [...handbags].sort((a, b) => b.cost - a.cost);

export const sortByCostAscending = (handbags: Handbag[]): Handbag[] =>
  [...handbags].sort((a, b) => a.cost - b.cost);

export const sortByName = (handbags: Handbag[]): Handbag[] =>
  [...handbags].sort((a, b) => a.handbagName.localeCompare(b.handbagName));
