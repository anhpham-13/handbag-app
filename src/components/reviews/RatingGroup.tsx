import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Review, RatingGroup } from '../../types/review';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius, FontWeight } from '../../constants/spacing';
import { RatingStars } from './RatingStars';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace JSX with Stitch RatingGroup. Keep props as-is.
// ─────────────────────────────────────────────────────────────────────────

interface RatingGroupProps {
  reviews: Review[];
}

export const RatingGroupComponent: React.FC<RatingGroupProps> = ({ reviews }) => {
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { average: 0, groups: [] as RatingGroup[], total: 0 };

    const countMap: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    for (const r of reviews) {
      countMap[r.rating] = (countMap[r.rating] ?? 0) + 1;
      sum += r.rating;
    }

    const groups: RatingGroup[] = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: countMap[stars] ?? 0,
      percentage: total > 0 ? ((countMap[stars] ?? 0) / total) * 100 : 0,
    }));

    return { average: sum / total, groups, total };
  }, [reviews]);

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.averageScore}>{stats.average.toFixed(1)}</Text>
        <RatingStars rating={stats.average} size={20} />
        <Text style={styles.totalLabel}>{stats.total} reviews</Text>
      </View>

      {/* Grouped bars */}
      <View style={styles.bars}>
        {stats.groups.map(g => (
          <View key={g.stars} style={styles.row}>
            <RatingStars rating={g.stars} size={12} />
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${g.percentage}%` }]} />
            </View>
            <Text style={styles.count}>{g.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.lg,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summary: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    gap: Spacing.xs,
  },
  averageScore: {
    fontSize: 38,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    lineHeight: 44,
  },
  totalLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
  },
  bars: {
    flex: 1,
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.star.filled,
    borderRadius: BorderRadius.round,
  },
  count: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    minWidth: 18,
    textAlign: 'right',
  },
});
