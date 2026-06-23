import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Handbag } from '../../types/handbag';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius, FontWeight } from '../../constants/spacing';
import { ProductImage } from './ProductImage';
import { FavoriteButton } from './FavoriteButton';
import { formatCurrency, formatDiscountedPrice } from '../../utils/formatCurrency';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace the JSX inside the return() with your Stitch ProductCard UI.
// Props interface is the contract between UI and logic – keep it unchanged.
// ─────────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  handbag: Handbag;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  handbag,
  isFavorite,
  onPress,
  onToggleFavorite,
}) => {
  const handleFavPress = useCallback(() => {
    onToggleFavorite();
  }, [onToggleFavorite]);

  const discountedPrice = handbag.percentOff > 0
    ? formatDiscountedPrice(handbag.cost, handbag.percentOff)
    : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Image section */}
      <View style={styles.imageWrapper}>
        <ProductImage uri={handbag.uri} style={styles.image} />
        <View style={styles.imageTopRow}>
          <View style={styles.discountWrapper}>
            {handbag.percentOff > 0 && (
              <View style={styles.discountPill}>
                <Text style={styles.discountText}>-{Math.round(handbag.percentOff > 1 ? handbag.percentOff : handbag.percentOff * 100)}%</Text>
              </View>
            )}
          </View>
          <FavoriteButton isFavorite={isFavorite} onToggle={handleFavPress} size="sm" />
        </View>
      </View>

      {/* Info section */}
      <View style={styles.info}>
        <Text style={styles.brand}>{handbag.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{handbag.handbagName}</Text>
        <Text style={styles.gender}>{handbag.gender}</Text>
        <View style={styles.priceRow}>
          {discountedPrice ? (
            <>
              <Text style={styles.price}>{formatCurrency(discountedPrice)}</Text>
              <Text style={styles.originalPrice}>{formatCurrency(handbag.cost)}</Text>
            </>
          ) : (
            <Text style={styles.price}>{formatCurrency(handbag.cost)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
});

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'transparent',
    gap: Spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  imageWrapper: {
    aspectRatio: 4 / 5,
    position: 'relative',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageTopRow: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    right: Spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  discountWrapper: { flex: 1 },
  discountPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: BorderRadius.xs,
  },
  discountText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  info: {
    paddingTop: Spacing.xs,
    gap: 2,
  },
  brand: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    lineHeight: 20,
    height: 40,
  },
  gender: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  price: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  originalPrice: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    textDecorationLine: 'line-through',
  },
});
