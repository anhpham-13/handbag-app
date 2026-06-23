import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKED_IDS_KEY   = '@atelier_review_liked_ids';
const LIKE_COUNTS_KEY = '@atelier_review_like_counts';

export const getLikedIds = async (): Promise<Set<string>> => {
  const raw = await AsyncStorage.getItem(LIKED_IDS_KEY);
  if (!raw) return new Set();
  return new Set(JSON.parse(raw) as string[]);
};

export const getLikeCounts = async (): Promise<Record<string, number>> => {
  const raw = await AsyncStorage.getItem(LIKE_COUNTS_KEY);
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, number>;
};

export const toggleReviewLike = async (
  reviewId: string,
  baseCount: number
): Promise<{ likedIds: Set<string>; likeCounts: Record<string, number> }> => {
  const [likedIds, likeCounts] = await Promise.all([getLikedIds(), getLikeCounts()]);

  if (likedIds.has(reviewId)) {
    likedIds.delete(reviewId);
    likeCounts[reviewId] = Math.max(0, (likeCounts[reviewId] ?? baseCount) - 1);
  } else {
    likedIds.add(reviewId);
    likeCounts[reviewId] = (likeCounts[reviewId] ?? baseCount) + 1;
  }

  await Promise.all([
    AsyncStorage.setItem(LIKED_IDS_KEY, JSON.stringify(Array.from(likedIds))),
    AsyncStorage.setItem(LIKE_COUNTS_KEY, JSON.stringify(likeCounts)),
  ]);

  return { likedIds, likeCounts };
};
