import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/spacing';

const TAB_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  Home: {
    icon: 'bag-handle-outline',
    activeIcon: 'bag-handle',
    label: 'Discover',
  },
  AIStylist: {
    icon: 'sparkles-outline',
    activeIcon: 'sparkles',
    label: 'AI Stylist',
  },
  StoreLocator: {
    icon: 'storefront-outline',
    activeIcon: 'storefront',
    label: 'Stores',
  },
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width - 40);

  const focusedRouteKey = state.routes[state.index].key;
  const focusedDescriptor = descriptors[focusedRouteKey];
  const tabBarStyle = focusedDescriptor?.options?.tabBarStyle;

  // Horizontal animation for the active indicator pill
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Scale animations for each individual tab item
  const scaleAnims = useRef(state.routes.map(() => new Animated.Value(1))).current;

  // Dynamic layout calculations
  const numTabs = state.routes.length;
  // Padding horizontal inside card is 8
  const innerWidth = containerWidth - 16;
  const tabWidth = innerWidth / numTabs;
  // Let the pill occupy the tab width minus a margin for visual separation
  const pillWidth = tabWidth - 8;
  const targetX = 8 + state.index * tabWidth + 4; // 8 is paddingHorizontal, 4 is gap offset

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: targetX,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  }, [state.index, targetX]);

  useEffect(() => {
    state.routes.forEach((_, index) => {
      Animated.spring(scaleAnims[index], {
        toValue: state.index === index ? 1.08 : 1.0,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();
    });
  }, [state.index]);

  if (tabBarStyle && (tabBarStyle as any).display === 'none') {
    return null;
  }

  const renderContent = () => (
    <>
      {/* Animated Background Pill */}
      <Animated.View
        style={[
          styles.activePill,
          {
            width: pillWidth,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [styles.tab, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={config.label}
          >
            <Animated.View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: scaleAnims[index] }],
              }}
            >
              <Ionicons
                name={isFocused ? config.activeIcon : config.icon}
                size={21}
                color={isFocused ? Colors.secondary : Colors.tab.inactive}
              />
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {config.label}
              </Text>
            </Animated.View>
          </Pressable>
        );
      })}
    </>
  );

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={75}
          tint="light"
          style={styles.card}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0) {
              setContainerWidth(w);
            }
          }}
        >
          {renderContent()}
        </BlurView>
      ) : (
        <View
          style={[styles.card, styles.cardAndroid]}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0) {
              setContainerWidth(w);
            }
          }}
        >
          {renderContent()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 6,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  card: {
    flexDirection: 'row',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    position: 'relative',
  },
  cardAndroid: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative',
    zIndex: 2,
  },
  activePill: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    borderRadius: 22,
    backgroundColor: 'rgba(119, 90, 25, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(119, 90, 25, 0.16)',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.tab.inactive,
    marginTop: 2,
  },
  labelActive: {
    color: Colors.secondary,
    fontWeight: '700',
  },
});
