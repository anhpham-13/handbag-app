# Atelier Handbag App – Setup Guide

## 1. Install dependencies

```bash
cd handbag-app
npm install
```

## 2. Set up environment variables

```bash
# Copy the example file
copy .env.example .env
```

Then open `.env` and fill in your values:

```env
# MockAPI — product data (optional, app uses built-in fallback if not set)
EXPO_PUBLIC_MOCKAPI_BASE_URL=https://YOUR_PROJECT_ID.mockapi.io/api/v1

# n8n AI webhooks (optional, app uses rule-based fallback if not set)
EXPO_PUBLIC_N8N_QUIZ_WEBHOOK=https://xxx.ngrok-free.app/webhook/style-quiz
EXPO_PUBLIC_N8N_IMAGE_WEBHOOK=https://xxx.ngrok-free.app/webhook/image-style
```

> **Note:** All variables are **optional**. Without them, the app runs perfectly using built-in fallback data and local AI logic — great for quick demos.

### Setting up MockAPI (optional)

1. Go to https://mockapi.io and create a free account
2. Create a new project
3. Add a resource named **handbags** with these fields:

| Field        | Type   | Example                |
|-------------|--------|------------------------|
| id          | String | auto-generated         |
| handbagName | String | Serpenti Forever       |
| cost        | Number | 3850                   |
| category    | String | Crossbody              |
| color       | String | Emerald                |
| gender      | String | Female                 |
| uri         | String | https://...image.jpg   |
| brand       | String | Bvlgari                |
| percentOff  | Number | 15                     |

4. Copy your project ID from the URL (e.g. `https://abc123.mockapi.io`) and paste it into `.env`

## 3. Run the app

```bash
# Start Expo dev server
npx expo start

# Android
npx expo start --android

npx expo run:android


# iOS
npx expo start --ios
```

## 4. Optional: Add Gemini AI

Keep the Gemini API key **in your n8n workflow** (not in the app) to avoid exposing it in the bundle.
The `aiService.ts` already integrates with n8n webhooks — set `EXPO_PUBLIC_N8N_QUIZ_WEBHOOK` and
`EXPO_PUBLIC_N8N_IMAGE_WEBHOOK` in your `.env` to activate the real AI flow.

## 5. Map support (already configured)

`react-native-maps` is already installed and configured. The Store Locator screen uses a **Leaflet.js map inside a WebView** (`react-native-webview`) for cross-platform compatibility — no additional setup required.

## Demo Flow (for grading)

1. Open Home → shows handbags sorted price high→low
2. Filter by brand chip (Bvlgari, Fendi, etc.)
3. Search by name → debounced live filter
4. Tap product → Detail screen
5. On Detail → tap Reviews → grouped star ratings
6. On Detail → favorite heart → saved to AsyncStorage
7. Tab to Favorites → see saved items
8. Long-press or tap select mode → remove one / multiple / all
9. Tab to AI Stylist → **Style Quiz** tab → choose occasion / color / budget / style → get AI recommendations
10. AI Stylist → **Image Search** tab → choose photo from gallery or take a photo → AI detects style → shows matching bags
11. Tab to Stores → see store list with expand/call/directions

## Architecture Notes

```
src/
  app/navigation/     → RootNavigator + BottomTabNavigator
  screens/            → One file per screen (UI only, logic in hooks)
  components/         → Reusable, Stitch-ready components
  services/           → API + AsyncStorage + AI (pure functions)
  hooks/              → useHandbags, useFavorites, useDebounce
  types/              → TypeScript interfaces
  utils/              → formatCurrency, formatPercent, sort
  data/               → mockReviews, stores
  constants/          → colors, spacing, brands
```
