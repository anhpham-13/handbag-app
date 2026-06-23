import { useState, useEffect, useCallback } from 'react';
import { Review } from '../types/review';
import { getLikedIds, getLikeCounts, toggleReviewLike } from '../services/reviewLikesStorage';

export const useReviewLikes = (reviews: Review[]) => {
  const [likedIds,   setLikedIds]   = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [ids, counts] = await Promise.all([getLikedIds(), getLikeCounts()]);
      if (cancelled) return;

      // Seed counts from mock data for reviews not yet in storage
      const seeded = { ...counts };
      for (const r of reviews) {
        if (!(r.id in seeded)) seeded[r.id] = r.helpful ?? 0;
      }

      setLikedIds(ids);
      setLikeCounts(seeded);
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [reviews]);

  const toggleLike = useCallback(async (reviewId: string) => {
    const baseCount = likeCounts[reviewId] ?? 0;
    const { likedIds: nextIds, likeCounts: nextCounts } =
      await toggleReviewLike(reviewId, baseCount);
    setLikedIds(nextIds);
    setLikeCounts(nextCounts);
  }, [likeCounts]);

  const isLiked     = useCallback((id: string) => likedIds.has(id),       [likedIds]);
  const getLikeCount = useCallback((id: string) => likeCounts[id] ?? 0,   [likeCounts]);

  return { isLiked, getLikeCount, toggleLike, loading };
};
