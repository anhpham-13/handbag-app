import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types/navigation';
import { Handbag } from '../types/handbag';
import { Colors } from '../constants/colors';
import { Spacing, FontSize, FontWeight } from '../constants/spacing';

import { useHandbags, SORT_LABELS, SortOption } from '../hooks/useHandbags';
import { useFavorites } from '../hooks/useFavorites';
import { ProductCard } from '../components/product/ProductCard';
import { SearchBar } from '../components/product/SearchBar';
import { BrandFilter } from '../components/product/BrandFilter';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace the JSX in the return() with your Stitch HomeScreen layout.
// Keep the hooks and data logic untouched — only swap the UI.
// ─────────────────────────────────────────────────────────────────────────

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const COLUMN_COUNT = 2;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const tabBarHeight = useBottomTabBarHeight();
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const {
    filteredHandbags,
    handbags,
    loading,
    refreshing,
    error,
    searchTerm,
    setSearchTerm,
    selectedBrand,
    setSelectedBrand,
    sortOption,
    setSortOption,
    onRefresh,
    refetch,
  } = useHandbags();

  const availableBrands = useMemo(() => {
    const uniqueBrands = new Set(handbags.map(h => h.brand).filter(Boolean));
    return ['All', ...Array.from(uniqueBrands).sort()];
  }, [handbags]);

  const { isFavorite, toggleFavorite } = useFavorites();

  const handleProductPress = useCallback(
    (handbag: Handbag) => navigation.navigate('ProductDetail', { handbagId: handbag.id }),
    [navigation]
  );

  const handleToggleFavorite = useCallback(
    (handbag: Handbag) => toggleFavorite(handbag),
    [toggleFavorite]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Handbag; index: number }) => (
      <View style={[styles.cardWrapper, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}>
        <ProductCard
          handbag={item}
          isFavorite={isFavorite(item.id)}
          onPress={() => handleProductPress(item)}
          onToggleFavorite={() => handleToggleFavorite(item)}
        />
      </View>
    ),
    [isFavorite, handleProductPress, handleToggleFavorite]
  );

  const keyExtractor = useCallback((item: Handbag) => item.id, []);

  const ListHeader = (
    <View style={styles.listHeader}>
      <BrandFilter
        selectedBrand={selectedBrand}
        onSelect={setSelectedBrand}
        brands={availableBrands}
      />
      <View style={styles.sortIndicator}>
        <Text style={styles.countText}>{filteredHandbags.length} ITEMS</Text>
        <Pressable style={styles.sortBtn} onPress={() => setSortModalVisible(true)} hitSlop={8}>
          <Text style={styles.sortText}>SORT: {SORT_LABELS[sortOption]}</Text>
          <Ionicons name="chevron-down" size={14} color={Colors.text.primary} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Atelier</Text>
        <Pressable style={styles.iconBtn} hitSlop={8} onPress={() => navigation.navigate('Favorites')}>
          <Ionicons name="heart-outline" size={24} color={Colors.text.secondary} />
        </Pressable>
      </View>

      {/* Search + filter sticky section */}
      <View style={styles.stickySection}>
        <SearchBar
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search brands, styles..."
        />
      </View>

      {/* Content */}
      {loading ? (
        <LoadingState count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : filteredHandbags.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No handbags found"
          message={
            searchTerm
              ? `No results for "${searchTerm}"`
              : `No handbags for ${selectedBrand}`
          }
          actionLabel="Clear filters"
          onAction={() => { setSearchTerm(''); setSelectedBrand('All'); }}
        />
      ) : (
        <FlatList
          data={filteredHandbags}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={COLUMN_COUNT}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 8 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.secondary}
              colors={[Colors.secondary]}
            />
          }
          removeClippedSubviews
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
        />
      )}

      {/* Sort modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSortModalVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Sort by</Text>
            {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => {
              const active = sortOption === opt;
              return (
                <Pressable
                  key={opt}
                  style={[styles.modalOption, active && styles.modalOptionActive]}
                  onPress={() => { setSortOption(opt); setSortModalVisible(false); }}
                >
                  <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>
                    {SORT_LABELS[opt]}
                  </Text>
                  {active && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  iconBtn: { padding: Spacing.xs },
  logoText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  stickySection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.background,
  },
  listHeader: { paddingBottom: Spacing.xs },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  cardLeft: { paddingLeft: 0 },
  cardRight: { paddingRight: 0 },
  sortIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sortText: {
    fontSize: FontSize.xs,
    color: Colors.text.primary,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
  },
  countText: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.0,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.muted,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalOptionActive: {},
  modalOptionText: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  modalOptionTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
