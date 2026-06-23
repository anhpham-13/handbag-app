import { Review } from './review';
import { Store } from './store';

export interface Handbag {
  id: string;
  handbagName: string;
  brand: string;
  cost: number;
  category: string;
  color: string;
  gender: 'Female' | 'Male';
  uri: string;
  percentOff: number;
  reviews: Review[];
  stores: Store[];
}
