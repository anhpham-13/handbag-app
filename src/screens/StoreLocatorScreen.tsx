import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../types/store';
import { STORES } from '../data/stores';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// ── Stitch integration point ─────────────────────────────────────────────────
// Replace JSX with Stitch StoreLocatorScreen layout.
// ────────────────────────────────────────────────────────────────────────────

type Mode = 'browse' | 'directions';
type LatLng = { latitude: number; longitude: number };

// ── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<Store['type'], string> = {
  flagship: 'Flagship',
  boutique: 'Boutique',
  outlet: 'Outlet',
};
const TYPE_COLORS: Record<Store['type'], string> = {
  flagship: Colors.primary,
  boutique: Colors.secondary,
  outlet: '#7BC8A4',
};
const TYPE_ICONS: Record<Store['type'], React.ComponentProps<typeof Ionicons>['name']> = {
  flagship: 'diamond',
  boutique: 'storefront',
  outlet: 'pricetag',
};

const HCM_LAT = 10.7769;
const HCM_LNG = 106.7009;

const SHEET_H = 600;
const DEFAULT_TAB_BAR_HEIGHT = 79 + 24; // estimate for initial render before safe area loads
const SNAP = {
  BROWSE_PEEK: SHEET_H - (195 + DEFAULT_TAB_BAR_HEIGHT),
  BROWSE_FULL: 60,
  STORE_DETAIL: SHEET_H - 265, // 265px visible height for store detail (tab bar hidden)
  DIRECTIONS: SHEET_H - 175,  // 175px visible height for directions (tab bar hidden)
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
    Math.cos((b.latitude * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function fmtDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function fmtEta(km: number): string {
  const min = Math.round((km / 30) * 60);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}m`;
}

// ── Leaflet HTML builder ──────────────────────────────────────────────────────

function buildMapHtml(): string {
  const storesJson = JSON.stringify(
    STORES.map(s => ({ id: s.id, latitude: s.latitude, longitude: s.longitude, type: s.type }))
  );
  const colorsJson = JSON.stringify(TYPE_COLORS);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;background:#e8e0d8}
#map{width:100%;height:100%}
</style>
</head>
<body>
<div id="map"></div>
<script>
var STORES=${storesJson};
var TC=${colorsJson};
var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([${HCM_LAT},${HCM_LNG}],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
var mm={},routeLine=null,userMark=null,selId=null;
function mkIcon(s,sel){
  var c=TC[s.type]||'#666',sz=sel?36:30,isz=sel?12:10;
  var bg=sel?c:'#fff',ibg=sel?'#fff':c;
  var shadow=sel?'0 3px 10px rgba(0,0,0,0.38)':'0 2px 6px rgba(0,0,0,0.22)';
  var html='<div style="width:'+sz+'px;height:'+sz+'px;background:'+bg+';border:2.5px solid '+c+';border-radius:8px;display:flex;align-items:center;justify-content:center;box-shadow:'+shadow+'"><div style="width:'+isz+'px;height:'+isz+'px;background:'+ibg+';border-radius:50%"></div></div>';
  return L.divIcon({html:html,className:'',iconSize:[sz,sz],iconAnchor:[sz/2,sz/2]});
}
STORES.forEach(function(s){
  var m=L.marker([s.latitude,s.longitude],{icon:mkIcon(s,false)}).addTo(map);
  m.on('click',function(){window.ReactNativeWebView.postMessage(JSON.stringify({type:'storeClick',storeId:s.id}));});
  mm[s.id]={m:m,s:s};
});
window.rn={
  select:function(id){
    if(selId&&mm[selId])mm[selId].m.setIcon(mkIcon(mm[selId].s,false));
    selId=id;
    if(routeLine){map.removeLayer(routeLine);routeLine=null;}
    if(id&&mm[id]){mm[id].m.setIcon(mkIcon(mm[id].s,true));map.flyTo([mm[id].s.latitude,mm[id].s.longitude],15,{duration:0.5});}
  },
  reset:function(){
    if(selId&&mm[selId])mm[selId].m.setIcon(mkIcon(mm[selId].s,false));
    selId=null;
    if(routeLine){map.removeLayer(routeLine);routeLine=null;}
    Object.keys(mm).forEach(function(id){if(!map.hasLayer(mm[id].m))mm[id].m.addTo(map);});
    map.flyTo([${HCM_LAT},${HCM_LNG}],13,{duration:0.5});
  },
  dirs:function(ulat,ulng,slat,slng){
    if(routeLine)map.removeLayer(routeLine);
    if(userMark)map.removeLayer(userMark);
    routeLine=L.polyline([[ulat,ulng],[slat,slng]],{color:'${Colors.secondary}',weight:4,dashArray:'10,7',opacity:0.9}).addTo(map);
    userMark=L.circleMarker([ulat,ulng],{radius:8,fillColor:'#4285F4',color:'#fff',weight:2.5,fillOpacity:1}).addTo(map);
    map.fitBounds([[ulat,ulng],[slat,slng]],{paddingTopLeft:[40,80],paddingBottomRight:[40,220]});
  },
  showUserLocation:function(ulat,ulng,fly){
    if(userMark)map.removeLayer(userMark);
    userMark=L.circleMarker([ulat,ulng],{radius:8,fillColor:'#4285F4',color:'#fff',weight:2.5,fillOpacity:1}).addTo(map);
    if(fly){map.flyTo([ulat,ulng],15,{duration:0.5});}
  },
  filter:function(ids){
    Object.keys(mm).forEach(function(id){
      var show=ids.indexOf(id)>=0,has=map.hasLayer(mm[id].m);
      if(show&&!has)mm[id].m.addTo(map);
      else if(!show&&has)map.removeLayer(mm[id].m);
    });
  }
};
window.ReactNativeWebView.postMessage(JSON.stringify({type:'ready'}));
</script>
</body>
</html>`;
}

const MAP_HTML = buildMapHtml();

// ── Mini card for browse carousel ─────────────────────────────────────────────

const MiniCard: React.FC<{ store: Store; distance?: string; onPress: () => void }> = ({ store, distance, onPress }) => {
  const color = TYPE_COLORS[store.type];
  return (
    <Pressable onPress={onPress} style={mc.card}>
      <View style={[mc.stripe, { backgroundColor: color }]} />
      <View style={mc.body}>
        <View style={mc.topRow}>
          <View style={[mc.badge, { backgroundColor: color + '1A' }]}>
            <Text style={[mc.badgeText, { color }]}>{TYPE_LABELS[store.type]}</Text>
          </View>
          <Text style={mc.dist}>{distance || store.distance}</Text>
        </View>
        <Text style={mc.name} numberOfLines={2}>{store.name}</Text>
        <Text style={mc.city} numberOfLines={1}>{store.city}</Text>
      </View>
      <View style={mc.footer}>
        <Ionicons name="time-outline" size={10} color={Colors.text.muted} />
        <Text style={mc.hours} numberOfLines={1}>{store.hours.split(',')[0]}</Text>
      </View>
    </Pressable>
  );
};

const mc = StyleSheet.create({
  card: {
    width: 155,
    height: 140,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'space-between',
  },
  stripe: { height: 3 },
  body: { padding: Spacing.sm, gap: 3 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
  },
  badgeText: { fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.3 },
  dist: { fontSize: FontSize.xs, color: Colors.text.muted },
  name: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    lineHeight: 16,
    marginTop: 1,
  },
  city: { fontSize: FontSize.xs, color: Colors.text.muted },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  hours: { fontSize: 9, color: Colors.text.muted, flex: 1 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

export const StoreLocatorScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [mode, setMode] = useState<Mode>('browse');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [filterType, setFilterType] = useState<Store['type'] | 'all'>('all');
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [loadingDir, setLoadingDir] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const webRef = useRef<WebView>(null);
  const sheetAnim = useRef(new Animated.Value(SNAP.BROWSE_PEEK)).current;

  const inject = useCallback((script: string) => {
    webRef.current?.injectJavaScript(`${script};true;`);
  }, []);

  const snapTo = useCallback((y: number) => {
    Animated.spring(sheetAnim, {
      toValue: y,
      useNativeDriver: true,
      friction: 9,
      tension: 58,
    }).start();
  }, [sheetAnim]);

  const tabBarHeight = 79 + Math.max(insets.bottom, 12);

  const snaps = React.useMemo(() => ({
    BROWSE_PEEK: SHEET_H - (195 + tabBarHeight),
    BROWSE_FULL: 60,
    STORE_DETAIL: SHEET_H - 265,
    DIRECTIONS: SHEET_H - 175,
  }), [tabBarHeight]);

  useEffect(() => {
    if (mode === 'browse' && !selectedStore && !sheetExpanded) {
      snapTo(snaps.BROWSE_PEEK);
    }
  }, [snaps.BROWSE_PEEK, mode, selectedStore, sheetExpanded, snapTo]);

  const locateUser = useCallback(async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please allow location access to find your current location.');
        return;
      }

      let ul: LatLng;
      try {
        const pos = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        if (pos) {
          ul = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } else {
          throw new Error('No fresh position returned');
        }
      } catch (freshErr) {
        console.warn('Could not get fresh location, trying last known location:', freshErr);
        try {
          const lastKnown = await Location.getLastKnownPositionAsync({});
          if (lastKnown) {
            ul = { latitude: lastKnown.coords.latitude, longitude: lastKnown.coords.longitude };
          } else {
            throw new Error('No last known position available');
          }
        } catch (lastKnownErr) {
          console.warn('GPS and last known location failed, using mock location:', lastKnownErr);
          ul = { latitude: 10.7756, longitude: 106.7019 };
          Alert.alert(
            'GPS Offline',
            'Could not retrieve your current location. Showing mock location at Ho Chi Minh City.',
            [{ text: 'OK' }]
          );
        }
      }

      if (ul && ul.longitude < -50) {
        ul = { latitude: 10.7756, longitude: 106.7019 };
        Alert.alert(
          'Emulator Location Detected',
          'Your emulator is currently set to the default USA location. We have mocked your location to Ho Chi Minh City.',
          [{ text: 'OK' }]
        );
      }

      setUserLocation(ul);
      inject(`window.rn.showUserLocation(${ul.latitude},${ul.longitude},true)`);
    } catch {
      Alert.alert('Location error', 'An unexpected error occurred while locating.');
    } finally {
      setLoadingLocation(false);
    }
  }, [inject]);

  // Auto-fetch location silently if permission already granted
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const getInitialLocation = async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status !== 'granted') return;

          const pos = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }),
            new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
          ]);
          if (!active) return;
          if (pos) {
            let ul = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            if (ul.longitude < -50) {
              ul = { latitude: 10.7756, longitude: 106.7019 };
            }
            setUserLocation(ul);
            if (mapReady) {
              inject(`window.rn.showUserLocation(${ul.latitude},${ul.longitude},false)`);
            }
          }
        } catch (err) {
          console.warn('Silent location fetch failed:', err);
        }
      };

      getInitialLocation();
      return () => {
        active = false;
      };
    }, [mapReady, inject])
  );

  const getStoreDistance = useCallback((store: Store) => {
    if (!userLocation) return store.distance;
    const km = haversineKm(userLocation, {
      latitude: store.latitude,
      longitude: store.longitude,
    });
    return fmtDist(km);
  }, [userLocation]);

  // Hide bottom tab when selectedStore is not null (detail mode)
  useFocusEffect(
    useCallback(() => {
      if (selectedStore !== null) {
        navigation.setOptions({
          tabBarStyle: { display: 'none' },
        });
      } else {
        navigation.setOptions({
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
        });
      }
      return () => {
        navigation.setOptions({
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
        });
      };
    }, [navigation, selectedStore])
  );

  const filtered = filterType === 'all' ? STORES : STORES.filter(s => s.type === filterType);

  // Sync filter to map
  useEffect(() => {
    if (!mapReady) return;
    const ids = filtered.map(s => s.id);
    inject(`window.rn.filter(${JSON.stringify(ids)})`);
  }, [filterType, mapReady, inject, filtered]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const onMapMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ready') {
        setMapReady(true);
      } else if (data.type === 'storeClick') {
        const store = STORES.find(s => s.id === data.storeId);
        if (store) selectStore(store);
      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectStore = useCallback((store: Store) => {
    setSelectedStore(store);
    setSheetExpanded(false);
    inject(`window.rn.select("${store.id}")`);
    snapTo(snaps.STORE_DETAIL);
  }, [inject, snapTo, snaps]);

  const goBackToBrowse = useCallback(() => {
    setMode('browse');
    setSelectedStore(null);
    setSheetExpanded(false);
    inject('window.rn.reset()');
    snapTo(snaps.BROWSE_PEEK);
  }, [inject, snapTo, snaps]);

  const startDirections = useCallback(async () => {
    if (!selectedStore) return;
    setLoadingDir(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location required', 'Please allow location access to show directions.');
        return;
      }

      let ul: LatLng;
      try {
        // 1. Try to get current fresh location first (with a 5-second timeout)
        const pos = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        if (pos) {
          ul = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } else {
          throw new Error('No fresh position returned');
        }
      } catch (freshErr) {
        console.warn('Could not get fresh location, trying last known location:', freshErr);
        try {
          // 2. Fallback to last known cached position
          const lastKnown = await Location.getLastKnownPositionAsync({});
          if (lastKnown) {
            ul = { latitude: lastKnown.coords.latitude, longitude: lastKnown.coords.longitude };
          } else {
            throw new Error('No last known position available');
          }
        } catch (lastKnownErr) {
          console.warn('GPS and last known location failed, using mock location:', lastKnownErr);
          // 3. Fallback to mock central HCM City location
          ul = { latitude: 10.7756, longitude: 106.7019 };
          Alert.alert(
            'GPS Offline',
            'Could not retrieve your current location. Drawing directions from Central District 1 (Mock Location).',
            [{ text: 'OK' }]
          );
        }
      }

      // Detect default emulator USA location
      if (ul && ul.longitude < -50) {
        console.warn('USA location detected (likely default emulator), swapping to mock HCMC coordinates');
        ul = { latitude: 10.7756, longitude: 106.7019 };
        Alert.alert(
          'Emulator Location Detected',
          'Your emulator is currently set to the default USA location. We have mocked your location to Central District 1 (Ho Chi Minh City) for a local routing demo. You can set your custom location in the emulator\'s Extended Controls (...) -> Location tab.',
          [{ text: 'OK' }]
        );
      }

      setUserLocation(ul);
      setMode('directions');
      snapTo(snaps.DIRECTIONS);
      inject(
        `window.rn.dirs(${ul.latitude},${ul.longitude},${selectedStore.latitude},${selectedStore.longitude})`
      );
    } catch {
      Alert.alert('Location error', 'An unexpected error occurred while showing directions.');
    } finally {
      setLoadingDir(false);
    }
  }, [selectedStore, inject, snapTo, snaps]);

  const endDirections = useCallback(() => {
    setMode('browse');
    if (selectedStore) {
      inject(`window.rn.select("${selectedStore.id}")`);
    }
    snapTo(snaps.STORE_DETAIL);
  }, [selectedStore, inject, snapTo, snaps]);

  const toggleExpand = useCallback(() => {
    if (mode !== 'browse' || selectedStore) return;
    const next = !sheetExpanded;
    setSheetExpanded(next);
    snapTo(next ? snaps.BROWSE_FULL : snaps.BROWSE_PEEK);
  }, [mode, selectedStore, sheetExpanded, snapTo, snaps]);

  const distKm =
    selectedStore && userLocation
      ? haversineKm(userLocation, {
        latitude: selectedStore.latitude,
        longitude: selectedStore.longitude,
      })
      : null;

  const topPad = insets.top + (Platform.OS === 'android' ? 10 : 6);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={s.root}>
      {/* ── MAP ── */}
      <WebView
        ref={webRef}
        style={StyleSheet.absoluteFill}
        source={{ html: MAP_HTML }}
        onMessage={onMapMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />

      {/* ── FLOATING TOP BAR ── */}
      <View style={[s.topBar, { paddingTop: topPad }]}>
        <View style={s.topBarInner}>
          {/* Left */}
          <View style={s.topBarLeft}>
            <View style={s.topBarIconWrap}>
              <Ionicons name="location" size={16} color={Colors.secondary} />
            </View>
            <Text style={s.topBarTitle}>Store Locator</Text>
          </View>

          {/* Center */}
          {mode === 'directions' && (
            <View style={s.navPill}>
              <Ionicons name="navigate" size={11} color={Colors.surface} />
              <Text style={s.navPillText}>Navigating</Text>
            </View>
          )}

          {/* Right */}
          {!selectedStore ? (
            <Pressable
              onPress={locateUser}
              style={s.topBarActionBtn}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color={Colors.text.secondary} />
              ) : (
                <Ionicons name="locate-outline" size={18} color={Colors.text.secondary} />
              )}
            </Pressable>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        {/* Filter chips — only when no store selected */}
        {!selectedStore && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chips}
          >
            {(['all', 'flagship', 'boutique', 'outlet'] as const).map(t => {
              const active = filterType === t;
              const color = t === 'all' ? Colors.primary : TYPE_COLORS[t];
              return (
                <Pressable
                  key={t}
                  onPress={() => setFilterType(t)}
                  style={[s.chip, active && { backgroundColor: color, borderColor: color }]}
                >
                  {t !== 'all' && (
                    <View style={[s.chipDot, { backgroundColor: active ? Colors.surface : color }]} />
                  )}
                  <Text style={[s.chipText, active && s.chipTextActive]}>
                    {t === 'all' ? 'All stores' : TYPE_LABELS[t]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* ── BOTTOM SHEET ── */}
      <Animated.View
        style={[
          s.sheetContainer,
          { transform: [{ translateY: sheetAnim }] },
        ]}
      >
        <View style={[s.sheetInner, { paddingBottom: insets.bottom + 2 }]}>
          {/* Handle */}
          <View style={s.handleArea}>
            <View style={s.handle} />
            <View style={s.sheetMeta}>
              {selectedStore && mode === 'browse' ? (
                <>
                  <View style={[s.sheetBadge, { backgroundColor: TYPE_COLORS[selectedStore.type] + '1A' }]}>
                    <View style={[s.sheetBadgeDot, { backgroundColor: TYPE_COLORS[selectedStore.type] }]} />
                    <Text style={[s.sheetBadgeText, { color: TYPE_COLORS[selectedStore.type] }]}>
                      {TYPE_LABELS[selectedStore.type]}
                    </Text>
                  </View>
                  <Text style={s.sheetMetaCount} numberOfLines={1}>{selectedStore.name}</Text>
                </>
              ) : mode === 'directions' ? (
                <Text style={s.sheetMetaCount}>Route info</Text>
              ) : (
                <>
                  <Text style={s.sheetMetaCount}>
                    {filtered.length} store{filtered.length !== 1 ? 's' : ''} nearby
                  </Text>
                  <Pressable onPress={toggleExpand} style={s.sheetMetaRight}>
                    <Text style={s.sheetMetaAction}>{sheetExpanded ? 'Collapse' : 'See all'}</Text>
                    <Ionicons
                      name={sheetExpanded ? 'chevron-down' : 'chevron-up'}
                      size={13}
                      color={Colors.secondary}
                    />
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* ── BROWSE: store selected — compact card ── */}
          {mode === 'browse' && selectedStore && (
            <View style={s.compact}>
              <View style={s.compactInfo}>
                <View style={s.compactRow}>
                  <Ionicons name="location-outline" size={13} color={Colors.secondary} />
                  <Text style={s.compactAddr} numberOfLines={1}>{selectedStore.address}</Text>
                  <Text style={s.compactDist}>{getStoreDistance(selectedStore)}</Text>
                </View>
                <View style={s.compactRow}>
                  <Ionicons name="time-outline" size={13} color={Colors.secondary} />
                  <Text style={s.compactHours} numberOfLines={1}>{selectedStore.hours}</Text>
                </View>
              </View>
              <View style={s.compactActions}>
                <Pressable
                  style={[s.actionBtn, s.actionOutline]}
                  onPress={() =>
                    Linking.openURL(`tel:${selectedStore.phone.replace(/\s/g, '')}`).catch(() =>
                      Alert.alert('Cannot call', selectedStore.phone)
                    )
                  }
                >
                  <Ionicons name="call-outline" size={15} color={Colors.primary} />
                  <Text style={s.actionOutlineText}>Call</Text>
                </Pressable>
                <Pressable
                  style={[s.actionBtn, s.actionFilled]}
                  onPress={startDirections}
                  disabled={loadingDir}
                >
                  {loadingDir ? (
                    <ActivityIndicator size="small" color={Colors.text.inverse} />
                  ) : (
                    <>
                      <Ionicons name="navigate" size={15} color={Colors.text.inverse} />
                      <Text style={s.actionFilledText}>Directions</Text>
                    </>
                  )}
                </Pressable>
              </View>
              <Pressable
                style={[s.actionBtn, s.backListBtn]}
                onPress={goBackToBrowse}
              >
                <Ionicons name="list-outline" size={16} color={Colors.text.secondary} />
                <Text style={s.backListText}>Back to Shop List</Text>
              </Pressable>
            </View>
          )}

          {/* ── BROWSE: horizontal card carousel ── */}
          {mode === 'browse' && !selectedStore && !sheetExpanded && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[s.carousel, { paddingBottom: tabBarHeight + Spacing.sm }]}
              decelerationRate="fast"
              snapToInterval={163}
            >
              {filtered.map(store => (
                <MiniCard
                  key={store.id}
                  store={store}
                  distance={getStoreDistance(store)}
                  onPress={() => selectStore(store)}
                />
              ))}
            </ScrollView>
          )}

          {/* ── BROWSE: expanded full list ── */}
          {mode === 'browse' && !selectedStore && sheetExpanded && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[s.listPad, { paddingBottom: tabBarHeight + Spacing.lg }]}
            >
              {filtered.map(store => (
                <Pressable key={store.id} onPress={() => selectStore(store)} style={s.listRow}>
                  <View style={[s.listIcon, { backgroundColor: TYPE_COLORS[store.type] + '15' }]}>
                    <Ionicons name={TYPE_ICONS[store.type]} size={17} color={TYPE_COLORS[store.type]} />
                  </View>
                  <View style={s.listInfo}>
                    <View style={s.listInfoTop}>
                      <Text style={s.listName} numberOfLines={1}>{store.name}</Text>
                      <Text style={s.listDist}>{getStoreDistance(store)}</Text>
                    </View>
                    <Text style={s.listAddr} numberOfLines={1}>{store.address}</Text>
                    <Text style={s.listHours} numberOfLines={1}>{store.hours}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={15} color={Colors.border} />
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* ── DIRECTIONS ── */}
          {mode === 'directions' && selectedStore && (
            <View style={s.navPanel}>
              <View style={s.navRow}>
                <View style={s.navIconBox}>
                  <Ionicons name="navigate" size={20} color={Colors.secondary} />
                </View>
                <View style={s.navText}>
                  <Text style={s.navStoreName} numberOfLines={1}>{selectedStore.name}</Text>
                  <Text style={s.navAddr} numberOfLines={1}>{selectedStore.address}</Text>
                </View>
                <Pressable onPress={endDirections} style={s.endDirBtn}>
                  <Ionicons name="close" size={16} color={Colors.text.secondary} />
                </Pressable>
              </View>

              {distKm !== null && (
                <View style={s.navStats}>
                  <View style={s.navStat}>
                    <Text style={s.navStatVal}>{fmtDist(distKm)}</Text>
                    <Text style={s.navStatLabel}>Distance</Text>
                  </View>
                  <View style={s.navDivider} />
                  <View style={s.navStat}>
                    <Text style={s.navStatVal}>{fmtEta(distKm)}</Text>
                    <Text style={s.navStatLabel}>Est. time</Text>
                  </View>
                  <View style={s.navDivider} />
                  <View style={s.navStat}>
                    <Ionicons name="car" size={20} color={Colors.secondary} />
                    <Text style={s.navStatLabel}>By car</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const TOPBAR_RADIUS = BorderRadius.xl;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceAlt },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderBottomLeftRadius: TOPBAR_RADIUS,
    borderBottomRightRadius: TOPBAR_RADIUS,
  },
  topBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    height: 48,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flex: 1 },
  topBarIconWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  topBarCenter: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
  },
  topBarActionBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.secondary,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    marginHorizontal: Spacing.sm,
  },
  navPillText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.inverse },

  chips: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    paddingBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.text.secondary },
  chipTextActive: { color: Colors.text.inverse, fontWeight: FontWeight.semibold },

  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
    backgroundColor: 'transparent',
  },
  sheetInner: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  handleArea: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.xs + 2,
  },
  sheetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sheetMetaCount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  sheetMetaRight: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  sheetMetaAction: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.secondary,
  },
  sheetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.xs,
  },
  sheetBadgeDot: { width: 5, height: 5, borderRadius: 3 },
  sheetBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 0.3 },

  carousel: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
    alignItems: 'flex-start',
  },

  listPad: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listInfo: { flex: 1, gap: 2 },
  listInfoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.primary, flex: 1 },
  listDist: { fontSize: FontSize.xs, color: Colors.text.muted, marginLeft: 4 },
  listAddr: { fontSize: FontSize.xs, color: Colors.text.secondary },
  listHours: { fontSize: FontSize.xs, color: Colors.text.muted },

  compact: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  compactInfo: {
    gap: 5,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
  },
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  compactAddr: { fontSize: FontSize.sm, color: Colors.text.secondary, flex: 1 },
  compactDist: { fontSize: FontSize.xs, color: Colors.text.muted },
  compactHours: { fontSize: FontSize.sm, color: Colors.text.secondary, flex: 1 },
  compactActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    minHeight: 46,
  },
  actionOutline: { borderWidth: 1.5, borderColor: Colors.primary },
  actionFilled: { backgroundColor: Colors.primary },
  actionOutlineText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.primary },
  actionFilledText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.inverse },
  backListBtn: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
  },
  backListText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
  },

  navPanel: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    gap: Spacing.sm,
  },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  navIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: { flex: 1 },
  navStoreName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  navAddr: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: 2 },
  endDirBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
  },
  navStat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navStatVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  navStatLabel: { fontSize: FontSize.xs, color: Colors.text.muted },
  navDivider: { width: 1, height: 36, backgroundColor: Colors.border },
});
