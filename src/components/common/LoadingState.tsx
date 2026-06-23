import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';

const SkeletonBlock: React.FC<{ width: number | string; height: number; style?: object }> = ({
  width, height, style,
}) => {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        { width, height, backgroundColor: Colors.skeleton, borderRadius: BorderRadius.sm },
        { opacity: anim },
        style,
      ]}
    />
  );
};

const ProductCardSkeleton: React.FC = () => (
  <View style={styles.card}>
    <SkeletonBlock width="100%" height={160} style={{ borderRadius: BorderRadius.md }} />
    <View style={styles.cardBody}>
      <SkeletonBlock width="60%" height={12} />
      <SkeletonBlock width="80%" height={16} style={{ marginTop: Spacing.xs }} />
      <SkeletonBlock width="40%" height={14} style={{ marginTop: Spacing.xs }} />
    </View>
  </View>
);

interface LoadingStateProps {
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ count = 6 }) => {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  );
};

export const InlineLoader: React.FC = () => (
  <View style={styles.inline}>
    {[0, 1, 2].map(i => (
      <SkeletonBlock key={i} width={8} height={8} style={[styles.dot, { opacity: 0.6 + i * 0.1 }]} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md - Spacing.xs,
    paddingTop: Spacing.md,
  },
  card: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardBody: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
  },
  dot: {
    borderRadius: BorderRadius.round,
  },
});
