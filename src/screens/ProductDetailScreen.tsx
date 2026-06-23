import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { Handbag } from '../types/handbag';
import { getHandbagById, getHandbags } from '../services/handbagApi';
import { Colors } from '../constants/colors';
import { Spacing, FontSize, BorderRadius, FontWeight } from '../constants/spacing';
import { formatCurrency, formatDiscountedPrice } from '../utils/formatCurrency';
import { ProductImage } from '../components/product/ProductImage';
import { FavoriteButton } from '../components/product/FavoriteButton';
import { RatingGroupComponent } from '../components/reviews/RatingGroup';
import { useFavorites } from '../hooks/useFavorites';
import { ErrorState } from '../components/common/ErrorState';
import { ProductCard } from '../components/product/ProductCard';


// ── Stitch integration point ──────────────────────────────────────────────
// Replace the JSX in the return() with your Stitch ProductDetailScreen.
// Keep hooks and data logic (useEffect, navigation handlers) unchanged.
// ─────────────────────────────────────────────────────────────────────────

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'ProductDetail'>;

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { handbagId } = route.params;

  const [handbag, setHandbag] = useState<Handbag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Handbag[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Handbag[]>([]);

  const { isFavorite, toggleFavorite } = useFavorites();
  const reviews = handbag ? handbag.reviews : [];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getHandbagById(handbagId);
        setHandbag(data);

        // Fetch other handbags for related and recommendations
        const allHandbags = await getHandbags();

        // Same brand (excluding current handbag)
        const sameBrand = allHandbags.filter(
          (h) => h.brand.toLowerCase() === data.brand.toLowerCase() && h.id !== data.id
        );
        setRelatedProducts(sameBrand);

        // Recommended: other brands (excluding current handbag & same brand)
        const recs = allHandbags.filter(
          (h) => h.id !== data.id && h.brand.toLowerCase() !== data.brand.toLowerCase()
        );
        setRecommendedProducts(recs);
      } catch {
        setError('Could not load handbag details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [handbagId]);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleGoHome = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  }, [navigation]);
  const handleGoReviews = useCallback(() => {
    if (!handbag) return;
    navigation.navigate('Reviews', { handbagId: handbag.id, handbagName: handbag.handbagName });
  }, [navigation, handbag]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !handbag) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorState message={error ?? 'Handbag not found.'} onRetry={handleBack} />
      </SafeAreaView>
    );
  }

  const discountedPrice = handbag.percentOff > 0
    ? formatDiscountedPrice(handbag.cost, handbag.percentOff)
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Sticky top bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Pressable onPress={handleBack} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </Pressable>
        </View>
        <Text style={styles.topBarBrand} numberOfLines={1}>{handbag.brand}</Text>
        <View style={styles.topBarRight}>
          <FavoriteButton
            isFavorite={isFavorite(handbag.id)}
            onToggle={() => toggleFavorite(handbag)}
            size="md"
            variant="inline"
          />
          <Pressable onPress={handleGoHome} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="home-outline" size={22} color={Colors.text.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.hero}>
          <ProductImage uri={handbag.uri} resizeMode="cover" />
          {discountedPrice && (
            <View style={styles.heroDiscount}>
              <Text style={styles.heroDicountText}>
                -{Math.round(handbag.percentOff > 1 ? handbag.percentOff : handbag.percentOff * 100)}%
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.content}>
          {/* Name + Price row */}
          <View style={styles.nameRow}>
            <View style={styles.nameBlock}>
              <Text style={styles.name}>{handbag.handbagName}</Text>
              <Text style={styles.subtitle}>{handbag.category}, {handbag.color}</Text>
            </View>
            <View style={styles.priceBlock}>
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

          {/* In stock */}
          <View style={styles.stockRow}>
            <View style={styles.stockDot} />
            <Text style={styles.stockText}>In Stock · Ships Tomorrow</Text>
          </View>

          {/* Add to Bag */}
          <Pressable style={({ pressed }) => [styles.addToBag, pressed && { opacity: 0.85 }]}>
            <Text style={styles.addToBagText}>Add to Bag</Text>
          </Pressable>

          {/* Why clients love this */}
          <View style={styles.loveDivider}>
            <Text style={styles.loveTitle}>Why Clients Love This</Text>
            <View style={styles.loveList}>
              {['Premium quality & craftsmanship', 'Timeless elegant design', 'Authentication guaranteed'].map(item => (
                <View key={item} style={styles.loveItem}>
                  <Ionicons name="checkmark" size={16} color={Colors.primary} />
                  <Text style={styles.loveText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews preview (Fully Clickable) */}
          <Pressable
            onPress={handleGoReviews}
            style={({ pressed }) => [styles.section, pressed && { opacity: 0.7 }]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              <View style={styles.seeAllContainer}>
                <Text style={styles.seeAll}>See all</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.secondary} />
              </View>
            </View>
            <RatingGroupComponent reviews={reviews} />
          </Pressable>

          {/* More from Brand */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedSectionTitle}>More from {handbag.brand}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScrollContent}
              >
                {relatedProducts.map(item => (
                  <View key={item.id} style={styles.relatedCardContainer}>
                    <ProductCard
                      handbag={item}
                      isFavorite={isFavorite(item.id)}
                      onPress={() => navigation.push('ProductDetail', { handbagId: item.id })}
                      onToggleFavorite={() => toggleFavorite(item)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Recommended For You */}
          {recommendedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedSectionTitle}>Recommended For You</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScrollContent}
              >
                {recommendedProducts.map(item => (
                  <View key={item.id} style={styles.relatedCardContainer}>
                    <ProductCard
                      handbag={item}
                      isFavorite={isFavorite(item.id)}
                      onPress={() => navigation.push('ProductDetail', { handbagId: item.id })}
                      onToggleFavorite={() => toggleFavorite(item)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Back to Home Feed Banner */}
          <View style={styles.homeBannerContainer}>
            <View style={styles.homeBannerCard}>
              <Ionicons name="bag-handle" size={28} color={Colors.secondary} style={styles.homeBannerIcon} />
              <View style={styles.homeBannerTextContainer}>
                <Text style={styles.homeBannerTitle}>Atelier Collection</Text>
                <Text style={styles.homeBannerSubtitle}>Discover our latest designer handbags and accessories.</Text>
              </View>
              <Pressable
                onPress={handleGoHome}
                style={({ pressed }) => [styles.homeBannerBtn, pressed && { opacity: 0.9 }]}
              >
                <Text style={styles.homeBannerBtnText}>Back to Home Feed</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(249,249,249,0.85)',
    gap: Spacing.sm,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 68,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 68,
    gap: Spacing.xs,
  },
  iconBtn: { padding: Spacing.xs },
  topBarBrand: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  scroll: { flex: 1 },
  hero: {
    height: 380,
    position: 'relative',
    backgroundColor: Colors.surfaceContainerLow,
  },
  heroDiscount: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BorderRadius.xs,
  },
  heroDicountText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  nameBlock: { flex: 1 },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginTop: 3,
  },
  priceBlock: { alignItems: 'flex-end' },
  price: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  originalPrice: {
    fontSize: FontSize.md,
    color: Colors.text.muted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  stockText: {
    fontSize: FontSize.sm,
    color: Colors.secondary,
    fontWeight: FontWeight.medium,
  },
  addToBag: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 4,
  },
  addToBagText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  loveDivider: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(207,196,197,0.3)',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  loveTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  loveList: { gap: Spacing.sm },
  loveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loveText: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
  },
  section: { gap: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  seeAll: { fontSize: FontSize.sm, color: Colors.secondary, fontWeight: FontWeight.medium },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  relatedSection: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  relatedSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.xs,
  },
  relatedScrollContent: {
    paddingHorizontal: Spacing.xs,
    gap: Spacing.md,
  },
  relatedCardContainer: {
    width: 155,
  },
  homeBannerContainer: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  homeBannerCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.sm,
  },
  homeBannerIcon: {
    marginBottom: Spacing.xs,
  },
  homeBannerTextContainer: {
    alignItems: 'center',
    gap: 4,
  },
  homeBannerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    letterSpacing: 1,
  },
  homeBannerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.sm,
  },
  homeBannerBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
  },
  homeBannerBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.inverse,
  },
});
