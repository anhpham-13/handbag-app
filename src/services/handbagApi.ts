import { Handbag } from '../types/handbag';
import { getReviewsForHandbag } from '../data/mockReviews';
import { STORES } from '../data/stores';

// ─────────────────────────────────────────────────────────────────────────────
// SETUP: Copy .env.example to .env and fill in your MockAPI project ID.
// 1. Go to https://mockapi.io and create a project.
// 2. Add a resource named "handbags" with the fields listed below.
// 3. Set EXPO_PUBLIC_MOCKAPI_BASE_URL in your .env file.
// Fields: id, handbagName, cost, category, color, gender, uri, brand, percentOff
// If not configured, the app falls back to built-in local data automatically.
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL =
  process.env.EXPO_PUBLIC_MOCKAPI_BASE_URL ??
  'https://YOUR_PROJECT_ID.mockapi.io/api/v1';

const BASE_FALLBACK_HANDBAGS = [
  {
    id: '1',
    handbagName: 'Galuchat Serpenti Forever Crossbody in Red',
    brand: 'Bvlgari',
    cost: 2798,
    category: 'Crossbody',
    color: 'Red',
    gender: 'Female',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/b/v/bvlgari-galuchat-serpenti-forever-crossbody-in-red-287977_4.jpg',
    percentOff: 0.42
  },
  {
    id: '2',
    handbagName: 'Ladies Monogram Print Shoulder Bag',
    brand: 'Michael Kors',
    cost: 215.98,
    category: 'Shoulder',
    color: 'Vanilla',
    gender: 'Female',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/m/i/michael-kors-ladies-monogram-print-shoulder-bag-30h1ggrl8v149_6.jpg',
    percentOff: 0.55
  },
  {
    id: '3',
    handbagName: 'Open Box - Logo Print Large Soft Belt Tote',
    brand: 'Burberry',
    cost: 583.19,
    category: 'Tote',
    color: 'Silver',
    gender: 'Female',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/b/u/burberry-mini-shield-shoulder-bag-8082580_3.jpg',
    percentOff: 0.56
  },
  {
    id: '4',
    handbagName: 'Logo Embroided Shoulder Bag',
    brand: 'Ferragamo',
    cost: 595.00,
    category: 'Shoulder',
    color: 'Red',
    gender: 'Male',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/f/e/ferragamo-logo-embroided-shoulder-bag-241469-769602_3.jpg',
    percentOff: 0.41
  },
  {
    id: '5',
    handbagName: 'Cut Out-Detail Shoulder Bag',
    brand: 'Ferragamo',
    cost: 588.00,
    category: 'Shoulder',
    color: 'Black',
    gender: 'Female',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/f/e/ferragamo-cut-outdetail-shoulder-bag-213942-762299_2.jpg',
    percentOff: 0.4
  },
  {
    id: '6',
    handbagName: 'Peekaboo Iseeu Mini Leather Bag',
    brand: 'Fendi',
    cost: 768.00,
    category: 'Shoulder',
    color: 'Gray',
    gender: 'Male',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/f/e/fendi-peekaboo-iseeu-mini-leather-bag-7va530ark0f0fdy_2.jpg',
    percentOff: 0.37
  },
  {
    id: '7',
    handbagName: 'Olympia Leather Crossbody Card Case',
    brand: 'Burberry',
    cost: 278.00,
    category: 'Crossbody',
    color: 'Light Sesame',
    gender: 'Female',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/b/u/burberry-olympia-leather-leather-crossbody-card-case-8040739_3.jpg',
    percentOff: 0.47
  },
  {
    id: '8',
    handbagName: 'Black Folded Business Card Holder',
    brand: 'Bvlgari',
    cost: 229.00,
    category: 'Clutch',
    color: 'Black',
    gender: 'Female',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/b/v/bvlgari-black-folded-business-card-holder-293552_2.jpg',
    percentOff: 0.38
  },
  {
    id: '9',
    handbagName: 'Small Empire Leather Wallet',
    brand: 'Michael Kors',
    cost: 49.89,
    category: 'Clutch',
    color: 'Beige',
    gender: 'Female',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/m/i/michael-kors-small-empire-leather-wallet-32s3g8ed0l222_2.jpg',
    percentOff: 0.62
  },
  {
    id: '10',
    handbagName: 'Moments Sterling Silver Open Bangle',
    brand: 'Michael Kors',
    cost: 80.98,
    category: 'Clutch',
    color: 'Brown',
    gender: 'Female',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/m/i/michael-kors-ladies-signature-logo-carmen-medium-envelope-trifold-wallet-brownacorn-32s1gnme6b-252.jpg',
    percentOff: 0.55
  },
  {
    id: '11',
    handbagName: 'Peekaboo Leather Card Case Pouch',
    brand: 'Fendi',
    cost: 298.99,
    category: 'Clutch',
    color: 'Edamame',
    gender: 'Female',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/f/e/fendi-peekaboo-leather-card-case-pouch-8ap161a91bf1l1c.jpg',
    percentOff: 0.35
  },
  {
    id: '12',
    handbagName: 'Logo Series Small Leather Tote',
    brand: 'Bvlgari',
    cost: 1560.00,
    category: 'Tote',
    color: 'White',
    gender: 'Female',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/b/v/bvlgari-logo-series-small-leather-tote-291959_3.jpg',
    percentOff: 0.4
  },
  {
    id: '13',
    handbagName: 'First Sight Flap Shoulder Bag',
    brand: 'Fendi',
    cost: 1748.98,
    category: 'Shoulder',
    color: 'Blue',
    gender: 'Female',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/f/e/fendi-first-sight-flap-shoulder-bag-8bs072anx2f1l1k_3.jpg',
    percentOff: 0.37
  },
  {
    id: '14',
    handbagName: 'Serpenti Forever Compact Leather Wallet',
    brand: 'Bvlgari',
    cost: 444.99,
    category: 'Clutch',
    color: 'Light Blue',
    gender: 'Female',
    uri: 'https://cdn2.jomashop.com/media/catalog/product/cache/fc2ff48f80400416c47c36b80c0a3202/a/m/Burberry-amethyst-tassel-bolo-bracelet-in-rose-plated-sterling-silver-jms003978.jpg',
    percentOff: 0.4
  }
];

const FALLBACK_HANDBAGS: Handbag[] = BASE_FALLBACK_HANDBAGS.map(h => ({
  id: h.id,
  handbagName: h.handbagName,
  brand: h.brand,
  cost: h.cost,
  category: h.category,
  color: h.color,
  gender: h.gender as 'Female' | 'Male',
  uri: h.uri,
  percentOff: h.percentOff,
  reviews: getReviewsForHandbag(h.id),
  stores: STORES,
}));

const isApiConfigured = (): boolean => !BASE_URL.includes('YOUR_PROJECT_ID');

const sanitizeHandbag = (h: any): Handbag => {
  const handbagId = String(h.id);
  return {
    id: handbagId,
    handbagName: String(h.handbagName || ''),
    brand: String(h.brand || ''),
    cost: Number(h.cost || 0),
    category: String(h.category || ''),
    color: String(h.color || ''),
    gender: h.gender === 'Male' ? 'Male' : 'Female',
    uri: String(h.uri || ''),
    percentOff: Number(h.percentOff || 0),
    reviews: Array.isArray(h.reviews) ? h.reviews : getReviewsForHandbag(handbagId),
    stores: Array.isArray(h.stores) ? h.stores : STORES,
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
};

export const getHandbags = async (): Promise<Handbag[]> => {
  if (!isApiConfigured()) {
    await new Promise(r => setTimeout(r, 600)); // simulate network delay
    return FALLBACK_HANDBAGS;
  }
  const response = await fetch(`${BASE_URL}/handbags`);
  const data = await handleResponse<any[]>(response);
  return data.map(sanitizeHandbag);
};

export const getHandbagById = async (id: string): Promise<Handbag> => {
  if (!isApiConfigured()) {
    await new Promise(r => setTimeout(r, 300));
    const found = FALLBACK_HANDBAGS.find(h => h.id === id);
    if (!found) throw new Error('Handbag not found');
    return found;
  }
  const response = await fetch(`${BASE_URL}/handbags/${id}`);
  const data = await handleResponse<any>(response);
  return sanitizeHandbag(data);
};

export const searchHandbags = async (keyword: string): Promise<Handbag[]> => {
  if (!isApiConfigured()) {
    await new Promise(r => setTimeout(r, 300));
    const lower = keyword.toLowerCase();
    return FALLBACK_HANDBAGS.filter(h =>
      h.handbagName.toLowerCase().includes(lower) ||
      h.brand.toLowerCase().includes(lower)
    );
  }
  const response = await fetch(
    `${BASE_URL}/handbags?search=${encodeURIComponent(keyword)}`
  );
  const data = await handleResponse<any[]>(response);
  return data.map(sanitizeHandbag);
};

export const filterByBrand = async (brand: string): Promise<Handbag[]> => {
  if (!isApiConfigured()) {
    await new Promise(r => setTimeout(r, 300));
    return FALLBACK_HANDBAGS.filter(h => h.brand === brand);
  }
  const response = await fetch(
    `${BASE_URL}/handbags?brand=${encodeURIComponent(brand)}`
  );
  const data = await handleResponse<any[]>(response);
  return data.map(sanitizeHandbag);
};
