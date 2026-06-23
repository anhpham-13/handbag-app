import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../types/review';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius, FontWeight } from '../../constants/spacing';
import { RatingStars } from './RatingStars';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace JSX with Stitch ReviewCard. Keep props as-is.
// ─────────────────────────────────────────────────────────────────────────

interface ReviewCardProps {
  review: Review;
  isLiked: boolean;
  likeCount: number;
  onLike: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, isLiked, likeCount, onLike }) => {
  const initials = review.avatar ?? review.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.author}>{review.author}</Text>
          <Text style={styles.date}>{formatDate(review.date)}</Text>
        </View>
        <RatingStars rating={review.rating} size={12} />
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
      <Pressable
        style={styles.helpfulBtn}
        onPress={onLike}
        hitSlop={8}
      >
        <Ionicons
          name={isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
          size={13}
          color={isLiked ? Colors.secondary : Colors.text.muted}
        />
        <Text style={[styles.helpfulText, isLiked && styles.helpfulTextActive]}>
          Helpful ({likeCount})
        </Text>
      </Pressable>
    </View>
  );
};

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  authorInfo: { flex: 1, gap: 2 },
  author: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
  },
  comment: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 21,
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  helpfulText: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    fontWeight: FontWeight.medium,
  },
  helpfulTextActive: {
    color: Colors.secondary,
    fontWeight: FontWeight.semibold,
  },
});
