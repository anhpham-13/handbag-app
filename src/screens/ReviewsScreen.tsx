import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { Review } from '../types/review';
import { getHandbagById } from '../services/handbagApi';
import { Colors } from '../constants/colors';
import { Spacing, FontSize, BorderRadius, FontWeight } from '../constants/spacing';
import { ReviewCard } from '../components/reviews/ReviewCard';
import { useReviewLikes } from '../hooks/useReviewLikes';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace JSX with Stitch ReviewsScreen layout.
// ─────────────────────────────────────────────────────────────────────────

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'Reviews'>;

type SortOption = 'highest' | 'lowest' | 'recent';

const SORT_OPTIONS: { key: SortOption; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'highest', label: 'Highest', icon: 'arrow-up' },
  { key: 'lowest', label: 'Lowest', icon: 'arrow-down' },
  { key: 'recent', label: 'Recent', icon: 'time-outline' },
];

const HIGHLIGHTS = ['Premium Material', 'True to Size', 'Easy Care'];

export const ReviewsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { handbagId, handbagName } = route.params;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<SortOption>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const { isLiked, getLikeCount, toggleLike } = useReviewLikes(reviews);

  useEffect(() => {
    let cancelled = false;
    const loadReviews = async () => {
      try {
        setLoading(true);
        const data = await getHandbagById(handbagId);
        if (!cancelled) {
          setReviews(data.reviews || []);
        }
      } catch (e) {
        console.error('Failed to load reviews from MockAPI', e);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [handbagId]);

  // Count per star for filter chips
  const ratingCounts = useMemo(
    () => ([5, 4, 3, 2, 1] as const).map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
    })),
    [reviews],
  );

  const displayedReviews = useMemo(() => {
    let list = filterRating !== null
      ? reviews.filter(r => r.rating === filterRating)
      : [...reviews];
    if (sort === 'highest') list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === 'lowest') list = [...list].sort((a, b) => a.rating - b.rating);
    return list;
  }, [reviews, filterRating, sort]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const renderReview = ({ item }: { item: Review }) => (
    <ReviewCard
      review={item}
      isLiked={isLiked(item.id)}
      likeCount={getLikeCount(item.id)}
      onLike={() => toggleLike(item.id)}
    />
  );
  const keyExtractor = (item: Review) => item.id;

  const ListHeader = (
    <View>
      {/* Product summary */}
      <View style={styles.summarySection}>
        <Text style={styles.productName} numberOfLines={2}>{handbagName}</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(s => (
            <Ionicons
              key={s}
              name={s <= Math.round(avgRating) ? 'star' : 'star-outline'}
              size={16}
              color={Colors.star.filled}
            />
          ))}
          <Text style={styles.ratingCount}>
            {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* View Product button */}
        <Pressable
          style={styles.viewProductBtn}
          onPress={() => navigation.navigate('ProductDetail', { handbagId })}
        >
          <Ionicons name="bag-outline" size={14} color={Colors.secondary} />
          <Text style={styles.viewProductText}>View Product</Text>
          <Ionicons name="chevron-forward" size={13} color={Colors.secondary} />
        </Pressable>
      </View>

      {/* Customer highlights */}
      <View style={styles.highlightsSection}>
        <Text style={styles.highlightsTitle}>CUSTOMER HIGHLIGHTS</Text>
        <View style={styles.highlightsRow}>
          {HIGHLIGHTS.map(h => (
            <View key={h} style={styles.highlightTag}>
              <Text style={styles.highlightTagText}>{h}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Sort row */}
      <View style={styles.sortSection}>
        <Text style={styles.sortLabel}>Sort by</Text>
        <View style={styles.sortChips}>
          {SORT_OPTIONS.map(opt => {
            const active = sort === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setSort(opt.key)}
                style={[styles.sortChip, active && styles.sortChipActive]}
              >
                <Ionicons
                  name={opt.icon}
                  size={12}
                  color={active ? Colors.text.inverse : Colors.text.secondary}
                />
                <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Star filter row */}
      <View style={styles.filterSection}>
        <Text style={styles.sortLabel}>Filter</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {/* All chip */}
          <Pressable
            onPress={() => setFilterRating(null)}
            style={[styles.filterChip, filterRating === null && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filterRating === null && styles.filterChipTextActive]}>
              All
            </Text>
            <Text style={[styles.filterChipCount, filterRating === null && styles.filterChipCountActive]}>
              {reviews.length}
            </Text>
          </Pressable>

          {ratingCounts.map(({ star, count }) => {
            const active = filterRating === star;
            return (
              <Pressable
                key={star}
                onPress={() => setFilterRating(active ? null : star)}
                style={[styles.filterChip, active && styles.filterChipActive]}
                disabled={count === 0}
              >
                <Ionicons
                  name="star"
                  size={11}
                  color={active ? Colors.text.inverse : Colors.star.filled}
                />
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {star}
                </Text>
                <Text style={[styles.filterChipCount, active && styles.filterChipCountActive]}>
                  {count}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Result count */}
      <View style={styles.resultRow}>
        <Text style={styles.resultText}>
          {displayedReviews.length} of {reviews.length} reviews
        </Text>
        {filterRating !== null && (
          <Pressable onPress={() => setFilterRating(null)} style={styles.clearFilter}>
            <Ionicons name="close-circle" size={14} color={Colors.text.muted} />
            <Text style={styles.clearFilterText}>Clear filter</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Nav bar */}
      <View style={styles.navBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.navBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.navTitle}>Reviews</Text>
        <Pressable
          onPress={() => navigation.navigate('ProductDetail', { handbagId })}
          style={styles.navBtn}
          hitSlop={8}
        >
          <Ionicons name="bag-outline" size={22} color={Colors.text.primary} />
        </Pressable>
      </View>

      <FlatList
        data={displayedReviews}
        renderItem={renderReview}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="star-outline" size={36} color={Colors.border} />
            <Text style={styles.emptyText}>No reviews for this rating</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  navBtn: { padding: Spacing.xs, width: 36 },
  navTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },

  summarySection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  productName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    lineHeight: 26,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: Spacing.xs,
  },
  ratingCount: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    marginLeft: 4,
  },
  viewProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1.5,
    borderColor: Colors.secondary + '55',
    backgroundColor: Colors.secondary + '0D',
  },
  viewProductText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.secondary,
  },

  highlightsSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  highlightsTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text.muted,
    letterSpacing: 1.2,
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  highlightTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  highlightTagText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },

  // Sort
  sortSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sortLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text.muted,
    letterSpacing: 0.5,
    minWidth: 44,
  },
  sortChips: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sortChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  sortChipTextActive: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.semibold,
  },

  // Star filter
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterChips: {
    gap: Spacing.xs,
    paddingRight: Spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  filterChipTextActive: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.semibold,
  },
  filterChipCount: {
    fontSize: 10,
    color: Colors.text.muted,
    fontWeight: FontWeight.medium,
  },
  filterChipCountActive: {
    color: Colors.text.inverse + 'CC',
  },

  // Result row
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  resultText: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
  },
  clearFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  clearFilterText: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    fontWeight: FontWeight.medium,
  },

  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.text.muted,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
