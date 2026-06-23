# CONTEXT SYSTEM: HANDBAG APP DATABASE SCHEMA (EMBEDDED MODEL)

> **Role for AI:** You are an expert React Native / TypeScript developer assisting in refactoring the UI screens.
> **Database Type:** Document-oriented Mock API (MockAPI.io / json-server) with Embedded Relations.
> **Current Year Context:** 2026.

---

## 📐 1. GLOBAL TYPESCRIPT INTERFACES

Use these strict TypeScript types to handle data structures across all components and screens:

```typescript
export interface Review {
  id: string;      // Format: "r1", "r2"...
  author: string;
  rating: number;  // Scale 1 to 5 stars
  comment: string;
  date: string;    // ISO Date string format "YYYY-MM-DD"
  avatar: string;  // Initials like "SL", "EK"
}

export interface Store {
  id: string;      // Format: "s1", "s2"...
  name: string;
  address: string;
  city: string;    // e.g., "Ho Chi Minh City", "Hanoi"
  country: string; // e.g., "Vietnam"
  latitude: number;   // Floating point for GPS Map
  longitude: number;  // Floating point for GPS Map
  phone: string;
  hours: string;
  type: 'flagship' | 'boutique' | 'outlet';
}

export interface Handbag {
  id: string;          // Auto-generated ID from MockAPI (1 to 14)
  handbagName: string;
  brand: string;       // e.g., "Bvlgari", "Michael Kors", "Burberry", "Fendi", "Ferragamo"
  cost: number;        // Floating point or Integer cost
  category: string;    // e.g., "Crossbody", "Shoulder", "Tote", "Clutch"
  color: string;       // Normalized to single String representation for easy UI filters
  gender: 'Female' | 'Male'; // Normalized string from original Boolean ('Female' = true, 'Male' = false)
  uri: string;         // Remote CDN Image URL
  percentOff: number;  // Decimal representation (e.g., 0.42 = 42%) or integer percentage.
  reviews: Review[];   // EMBEDDED RELATION: Array of reviews for this specific product
  stores: Store[];     // EMBEDDED RELATION: Array of stores distributing this specific product
}