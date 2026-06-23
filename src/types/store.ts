export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  hours: string;
  distance?: string;
  type: 'flagship' | 'boutique' | 'outlet';
}
