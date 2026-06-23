import { Handbag } from '../types/handbag';

// ─────────────────────────────────────────────────────────────────────────────
// AI Service – abstraction layer for style recommendations.
// Currently uses rule-based mock logic. Replace getGeminiRecommendation()
// body with real Gemini API call when you have an API key.
//
// To use Gemini: npm install @google/generative-ai
// Then set GEMINI_API_KEY and call the SDK in getGeminiRecommendation().
// ─────────────────────────────────────────────────────────────────────────────

export interface AIStyleInput {
  occasion: string;
  preferredColor: string;
  budget: number;
  stylePreference: string;
}

export interface AIRecommendation {
  recommendedCategory: string;
  recommendedColors: string[];
  explanation: string;
  matchingHandbags: Handbag[];
  confidence: 'high' | 'medium' | 'low';
}

export type Occasion = 'work' | 'casual' | 'party' | 'travel' | 'date' | 'luxury';

export interface OccasionSuggestion {
  occasion: Occasion;
  label: string;
  icon: string;
  category: string;
  colors: string[];
  reason: string;
  matchingHandbags: Handbag[];
}

// ── Rule-based matching engine ───────────────────────────────────────────────

const OCCASION_RULES: Record<Occasion, { category: string; colors: string[]; reason: string }> = {
  work: {
    category: 'Tote, Satchel, Briefcase',
    colors: ['Black', 'Dark Brown', 'Navy', 'Cognac', 'Grey'],
    reason: 'Structured and spacious bags project professionalism and keep you organized.',
  },
  casual: {
    category: 'Shoulder, Crossbody, Hobo',
    colors: ['Beige', 'Tan', 'Camel', 'White', 'Monogram'],
    reason: 'Relaxed silhouettes and neutral tones pair effortlessly with everyday looks.',
  },
  party: {
    category: 'Clutch, Mini Bag',
    colors: ['Black', 'Gold', 'Silver', 'Emerald', 'Red'],
    reason: 'Compact and striking – these bags complete an evening ensemble without overpowering it.',
  },
  travel: {
    category: 'Tote, Backpack, Shoulder',
    colors: ['Black', 'Navy', 'Tan', 'Olive', 'Cognac'],
    reason: 'Durable and spacious options that keep essentials accessible throughout your journey.',
  },
  date: {
    category: 'Shoulder, Crossbody, Clutch',
    colors: ['Black', 'Red', 'Blush', 'Emerald', 'Ivory'],
    reason: 'Elegant yet approachable bags that enhance romance without fussiness.',
  },
  luxury: {
    category: 'Tote, Satchel, Shoulder',
    colors: ['Black', 'Tan', 'Beige', 'Monogram', 'Cognac'],
    reason: 'Investment pieces with iconic designs that signal refined taste at any high-profile event.',
  },
};

const COLOR_ALIASES: Record<string, string[]> = {
  black: ['Black', 'Noir', 'Ebony'],
  brown: ['Brown', 'Tan', 'Cognac', 'Camel', 'Dark Brown'],
  beige: ['Beige', 'Ivory', 'Cream', 'Off-white'],
  red: ['Red', 'Burgundy', 'Wine'],
  blue: ['Blue', 'Navy', 'Cobalt'],
  green: ['Green', 'Emerald', 'Olive', 'Forest'],
  gold: ['Gold', 'C9A227', 'Caramel'],
  white: ['White', 'Ivory', 'Cream'],
};

const expandColor = (color: string): string[] => {
  const lower = color.toLowerCase();
  for (const [key, aliases] of Object.entries(COLOR_ALIASES)) {
    if (lower.includes(key) || aliases.some(a => a.toLowerCase().includes(lower))) {
      return aliases;
    }
  }
  return [color];
};

const scoreHandbag = (handbag: Handbag, input: AIStyleInput): number => {
  let score = 0;
  const colorLower = input.preferredColor.toLowerCase();

  if (colorLower === 'all') {
    score += 3;
  } else {
    const expandedColors = expandColor(input.preferredColor);
    if (expandedColors.some(c => handbag.color.toLowerCase().includes(c.toLowerCase()))) score += 3;
  }

  if (handbag.cost <= input.budget) score += 2;
  if (handbag.cost <= input.budget * 1.15) score += 1;

  const styleLower = input.stylePreference.toLowerCase();
  if (styleLower.includes('luxury') || styleLower.includes('premium')) {
    if (handbag.cost > 1500) score += 2;
  }
  if (styleLower.includes('minimal') || styleLower.includes('classic')) {
    if (['Black', 'Beige', 'Tan', 'Cognac'].some(c => handbag.color.includes(c))) score += 1;
  }
  if (styleLower.includes('bold') || styleLower.includes('statement')) {
    if (['Emerald', 'Red', 'Gold', 'Silver'].some(c => handbag.color.includes(c))) score += 1;
  }

  return score;
};

export const getMockRecommendation = (
  input: AIStyleInput,
  allHandbags: Handbag[]
): AIRecommendation => {
  const occasionRule = OCCASION_RULES[input.occasion as Occasion] ?? OCCASION_RULES.casual;

  const scored = allHandbags
    .filter(h => h.cost <= input.budget * 1.2)
    .map(h => ({ handbag: h, score: scoreHandbag(h, input) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => s.handbag);

  const isAllColors = input.preferredColor.toLowerCase() === 'all';
  const expandedColors = isAllColors ? [] : expandColor(input.preferredColor);
  const recommendedColors = [...new Set([...expandedColors, ...occasionRule.colors])].slice(0, 4);

  const colorExplanation = isAllColors
    ? 'no specific color preference'
    : `your preference for ${input.preferredColor} tones`;

  return {
    recommendedCategory: occasionRule.category,
    recommendedColors,
    explanation: `For a ${input.occasion} occasion with ${colorExplanation} and a budget of $${input.budget.toLocaleString()}, ${occasionRule.reason}`,
    matchingHandbags: scored,
    confidence: scored.length >= 3 ? 'high' : scored.length >= 1 ? 'medium' : 'low',
  };
};

export const getOccasionSuggestion = (
  occasion: Occasion,
  allHandbags: Handbag[]
): OccasionSuggestion => {
  const rule = OCCASION_RULES[occasion];
  const categoryKeywords = rule.category.toLowerCase().split(', ');

  const matching = allHandbags
    .filter(h =>
      categoryKeywords.some(cat => h.category.toLowerCase().includes(cat)) ||
      rule.colors.some(c => h.color.toLowerCase().includes(c.toLowerCase()))
    )
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 4);

  const labels: Record<Occasion, string> = {
    work: 'Business Meeting',
    casual: 'Daily Casual',
    party: 'Party Night',
    travel: 'Travel',
    date: 'Date Night',
    luxury: 'Luxury Event',
  };

  const icons: Record<Occasion, string> = {
    work: 'briefcase-outline',
    casual: 'sunny-outline',
    party: 'sparkles-outline',
    travel: 'airplane-outline',
    date: 'heart-outline',
    luxury: 'diamond-outline',
  };

  return {
    occasion,
    label: labels[occasion],
    icon: icons[occasion],
    category: rule.category,
    colors: rule.colors,
    reason: rule.reason,
    matchingHandbags: matching,
  };
};

// ── n8n Integration Webhook Configuration ─────────────────────────────────────
// Replace these URLs with your actual n8n trigger webhooks (active production/tunnel URLs)
// Example: 'https://YOUR_N8N_INSTANCE.ngrok-free.app/webhook/style-quiz'
const N8N_QUIZ_WEBHOOK_URL = 'https://YOUR_N8N_INSTANCE.ngrok-free.app/webhook/style-quiz';
const N8N_IMAGE_WEBHOOK_URL = 'https://YOUR_N8N_INSTANCE.ngrok-free.app/webhook/image-style';

export const getAIRecommendation = async (
  input: AIStyleInput,
  allHandbags: Handbag[]
): Promise<AIRecommendation> => {
  if (
    !N8N_QUIZ_WEBHOOK_URL ||
    N8N_QUIZ_WEBHOOK_URL.includes('YOUR_N8N_INSTANCE') ||
    N8N_QUIZ_WEBHOOK_URL.includes('example.com')
  ) {
    console.warn('n8n Quiz Webhook not configured. Falling back to rule-based mock recommendation.');
    return getMockRecommendation(input, allHandbags);
  }

  try {
    const handbagCatalog = allHandbags.map(h => ({
      id: h.id,
      handbagName: h.handbagName,
      brand: h.brand,
      cost: h.cost,
      color: h.color,
      category: h.category,
    }));

    const response = await fetch(N8N_QUIZ_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        occasion: input.occasion,
        preferredColor: input.preferredColor,
        budget: input.budget,
        stylePreference: input.stylePreference,
        handbags: handbagCatalog,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n Quiz Webhook returned status: ${response.status}`);
    }

    let data = await response.json();
    if (Array.isArray(data)) {
      data = data.length > 0 ? data[0] : {};
    }

    const matchingHandbagIds = Array.isArray(data.matchingHandbagIds)
      ? data.matchingHandbagIds.map(String)
      : [];

    const matchingHandbags = allHandbags.filter(h => matchingHandbagIds.includes(String(h.id)));

    return {
      recommendedCategory: data.recommendedCategory || 'Shoulder',
      recommendedColors: data.recommendedColors || [input.preferredColor],
      explanation: data.explanation || 'Personalized recommendation from AI.',
      matchingHandbags: matchingHandbags.length > 0 ? matchingHandbags : allHandbags.slice(0, 4),
      confidence: data.confidence || 'medium',
    };
  } catch (error) {
    console.error('Error fetching recommendation from n8n:', error);
    return getMockRecommendation(input, allHandbags);
  }
};

// ── Image style analysis (n8n & mock) ──────────────────────────────────────────

export interface ImageStyleResult {
  detectedStyle: string;
  detectedColors: string[];
  detectedCategory: string;
  confidence: 'high' | 'medium' | 'low';
  matchingHandbags: Handbag[];
}

const IMAGE_STYLE_PROFILES = [
  { style: 'Classic Minimalist', colors: ['Black', 'Beige', 'Ivory'], category: 'Tote, Satchel' },
  { style: 'Bold & Statement', colors: ['Red', 'Emerald', 'Gold'], category: 'Clutch, Shoulder' },
  { style: 'Casual Chic', colors: ['Tan', 'Camel', 'White'], category: 'Crossbody, Hobo' },
  { style: 'Luxury Heritage', colors: ['Cognac', 'Brown', 'Black'], category: 'Tote, Satchel' },
  { style: 'Modern Edge', colors: ['Black', 'Silver', 'Navy'], category: 'Shoulder, Clutch' },
];

export const getMockImageAnalysis = (allHandbags: Handbag[]): ImageStyleResult => {
  const profile = IMAGE_STYLE_PROFILES[Math.floor(Math.random() * IMAGE_STYLE_PROFILES.length)];
  const categoryKeywords = profile.category.toLowerCase().split(', ');

  const matching = allHandbags
    .filter(h =>
      profile.colors.some(c => h.color.toLowerCase().includes(c.toLowerCase())) ||
      categoryKeywords.some(cat => h.category.toLowerCase().includes(cat))
    )
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 4);

  return {
    detectedStyle: profile.style,
    detectedColors: profile.colors,
    detectedCategory: profile.category,
    confidence: matching.length >= 3 ? 'high' : 'medium',
    matchingHandbags: matching,
  };
};

export const analyzeImageStyle = async (
  imageUri: string | null,
  allHandbags: Handbag[]
): Promise<ImageStyleResult> => {
  if (
    !imageUri ||
    !N8N_IMAGE_WEBHOOK_URL ||
    N8N_IMAGE_WEBHOOK_URL.includes('YOUR_N8N_INSTANCE') ||
    N8N_IMAGE_WEBHOOK_URL.includes('example.com')
  ) {
    console.warn('n8n Image Webhook not configured or imageUri is null. Falling back to mock image analysis.');
    return getMockImageAnalysis(allHandbags);
  }

  try {
    const handbagCatalog = allHandbags.map(h => ({
      id: h.id,
      handbagName: h.handbagName,
      brand: h.brand,
      cost: h.cost,
      color: h.color,
      category: h.category,
    }));

    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'outfit.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : 'jpg';
    const type = ext === 'png' ? 'image/png' : 'image/jpeg';
 
    formData.append('data', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    formData.append('handbags', JSON.stringify(handbagCatalog));

    let data = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', N8N_IMAGE_WEBHOOK_URL);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`n8n Image Webhook returned status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network request failed'));
      };

      xhr.send(formData);
    });

    if (Array.isArray(data)) {
      data = data.length > 0 ? data[0] : {};
    }

    const matchingHandbagIds = Array.isArray(data.matchingHandbagIds)
      ? data.matchingHandbagIds.map(String)
      : [];

    const matchingHandbags = allHandbags.filter(h => matchingHandbagIds.includes(String(h.id)));

    return {
      detectedStyle: data.detectedStyle || 'Casual Chic',
      detectedColors: data.detectedColors || ['Neutral'],
      detectedCategory: data.detectedCategory || 'Shoulder',
      confidence: data.confidence || 'medium',
      matchingHandbags: matchingHandbags.length > 0 ? matchingHandbags : allHandbags.slice(0, 4),
    };
  } catch (error) {
    console.error('Error analyzing image via n8n:', error);
    return getMockImageAnalysis(allHandbags);
  }
};
