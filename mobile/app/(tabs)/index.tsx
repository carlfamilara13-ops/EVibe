import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Dimensions, Animated, PanResponder, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { EV } from '@/constants/theme';
import { fetchStations } from '@/services/ocm';
import { getRoute, geocode } from '@/services/ors';

const { height } = Dimensions.get('window');
const PEEK = 72;
const FULL = 304;

export default function MapScreen() {
  const [destination, setDestination] = useState('');
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [routeActive, setRouteActive] = useState(false);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: string; durationMin: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [STATIONS, setSTATIONS] = useState<any[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const mapRef = useRef<MapView>(null);
  const sheetAnim = useRef(new Animated.Value(PEEK)).current;
  const startY = useRef(PEEK);         // sheet height when finger touches down
  const handleScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setUserLocation(coords);
        const data = await fetchStations(coords.latitude, coords.longitude);
        setSTATIONS(data);
      }
    })();
  }, []);

  const snapTo = (target: number, vy = 0) => {
    Animated.spring(sheetAnim, {
      toValue: target,
      velocity: vy,
      tension: 200,
      friction: 25,
      overshootClamping: true,
      useNativeDriver: false,
    }).start(() => {
      startY.current = target;
    });
    Animated.spring(handleScale, {
      toValue: 1,
      tension: 300,
      friction: 15,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderGrant: (_, g) => {
      // capture current sheet height synchronously
      (sheetAnim as any)._value !== undefined
        ? (startY.current = (sheetAnim as any)._value)
        : null;
      Animated.spring(handleScale, {
        toValue: 1.8,
        tension: 400,
        friction: 10,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderMove: (_, g) => {
      const next = Math.max(PEEK, Math.min(FULL, startY.current - g.dy));
      sheetAnim.setValue(next);
    },
    onPanResponderRelease: (_, g) => {
      const flickUp   = g.vy < -0.3;
      const flickDown = g.vy > 0.3;
      const dragUp    = g.dy < -10;
      const dragDown  = g.dy > 10;

      if (flickUp || dragUp) {
        snapTo(FULL, g.vy * 20);
      } else if (flickDown || dragDown) {
        snapTo(PEEK, g.vy * 20);
      } else {
        // tiny movement — snap based on midpoint
        const cur = (sheetAnim as any)._value ?? startY.current;
        snapTo(cur > (PEEK + FULL) / 2 ? FULL : PEEK);
      }
    },
    onPanResponderTerminate: () => {
      Animated.spring(handleScale, { toValue: 1, tension: 300, friction: 15, useNativeDriver: true }).start();
    },
  }), []);

  const selectedS = STATIONS.find(s => s.id === selectedStation);

  const handleStationPress = (id: string) => {
    setSelectedStation(id);
    const s = STATIONS.find(x => x.id === id)!;
    mapRef.current?.animateToRegion({
      latitude: s.coordinate.latitude - 0.003,
      longitude: s.coordinate.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 600);
  };

  const handleNavigate = async () => {
    if (!selectedS || !userLocation) return;
    setRouteLoading(true);
    try {
      const result = await getRoute(userLocation, selectedS.coordinate);
      setRouteCoords(result.coordinates);
      setRouteInfo({ distanceKm: result.distanceKm, durationMin: result.durationMin });
      setRouteActive(true);
      mapRef.current?.fitToCoordinates(result.coordinates, {
        edgePadding: { top: 120, right: 40, bottom: FULL + 20, left: 40 },
        animated: true,
      });
    } catch (err) {
      console.log('Route error', err);
    } finally {
      setRouteLoading(false);
    }
  };

  const locateMe = async () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({ ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 600);
    }
  };

  const handleSearch = async () => {
    if (!destination.trim()) return;
    setSearchLoading(true);
    try {
      const result = await geocode(destination);
      mapRef.current?.animateToRegion({
        latitude: result.latitude,
        longitude: result.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 800);
      const data = await fetchStations(result.latitude, result.longitude);
      setSTATIONS(data);

      if (userLocation) {
        const route = await getRoute(userLocation, { latitude: result.latitude, longitude: result.longitude });
        setRouteCoords(route.coordinates);
        setRouteInfo({ distanceKm: route.distanceKm, durationMin: route.durationMin });
        setRouteActive(true);
        mapRef.current?.fitToCoordinates(route.coordinates, {
          edgePadding: { top: 120, right: 40, bottom: FULL + 20, left: 40 },
          animated: true,
        });
      }
    } catch (err) {
      console.log('Search failed:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={undefined}
        initialRegion={{
          latitude: userLocation?.latitude ?? 14.5995,
          longitude: userLocation?.longitude ?? 120.9842,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}>
        {STATIONS.map((s, index) => (
          <Marker key={`${s.id}-${index}`} coordinate={s.coordinate} onPress={() => handleStationPress(s.id)}>
            <View style={[styles.markerWrap, s.type === 'DC Fast' && styles.markerFast, selectedStation === s.id && styles.markerSelected]}>
              <Ionicons name="flash" size={14} color={EV.bg} />
            </View>
          </Marker>
        ))}
        {routeCoords.length > 1 && (
          <Polyline coordinates={routeCoords} strokeColor={EV.primary} strokeWidth={4} />
        )}
      </MapView>

      {/* Search overlay */}
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <View style={styles.searchBar}>
          <View style={[styles.searchInput, searchFocused && styles.searchFocused]}>
            <View style={styles.dotA}><View style={styles.dotAInner} /></View>
            <TextInput
              style={styles.searchText}
              placeholder="Where are you going?"
              placeholderTextColor={EV.textDim}
              value={destination}
              onChangeText={setDestination}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchLoading
              ? <ActivityIndicator size="small" color={EV.primary} />
              : destination
              ? <TouchableOpacity onPress={() => { setDestination(''); setRouteActive(false); setSelectedStation(null); setRouteCoords([]); setRouteInfo(null); }}>
                  <Ionicons name="close-circle" size={16} color={EV.textDim} />
                </TouchableOpacity>
              : <TouchableOpacity onPress={handleSearch}><Ionicons name="search" size={16} color={EV.primary} /></TouchableOpacity>}
          </View>
        </View>

        {routeActive && routeInfo && (
          <View style={styles.routeBar}>
            <View style={styles.routeItem}><Ionicons name="navigate" size={13} color={EV.primary} /><Text style={styles.routeVal}>{routeInfo.distanceKm} km</Text></View>
            <View style={styles.routeDivider} />
            <View style={styles.routeItem}><Ionicons name="time-outline" size={13} color={EV.accent} /><Text style={styles.routeVal}>{routeInfo.durationMin} min</Text></View>
            {selectedS && (<><View style={styles.routeDivider} />
            <View style={styles.routeItem}><Ionicons name="flash-outline" size={13} color={EV.neon} /><Text style={styles.routeVal}>{selectedS.cost}</Text></View></>)}
            <TouchableOpacity style={{ marginLeft: 'auto' as any }} onPress={() => { setRouteActive(false); setSelectedStation(null); setRouteCoords([]); setRouteInfo(null); }}>
              <Ionicons name="close" size={14} color={EV.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* Map controls */}
      <Animated.View style={[styles.mapControls, { bottom: Animated.add(sheetAnim, new Animated.Value(12)) }]}>
        <TouchableOpacity style={styles.mapBtn} onPress={locateMe}>
          <Ionicons name="locate" size={20} color={EV.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapBtn}>
          <Ionicons name="layers-outline" size={20} color={EV.textMuted} />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View style={[styles.sheet, { height: sheetAnim }]}>

        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.sheetHeader}>
          <Animated.View style={[styles.handleBar, { transform: [{ scaleX: handleScale }] }]} />
          <View style={styles.peekRow}>
            <View style={styles.peekLeft}>
              <Text style={styles.sheetTitle}>NEARBY STATIONS</Text>
              <View style={styles.sheetBadge}>
                <Text style={styles.sheetBadgeText}>{STATIONS.length}</Text>
              </View>
            </View>
            <Ionicons name="chevron-up" size={16} color={EV.textDim} />
          </View>
        </View>

        {/* Selected station */}
        {selectedS ? (
          <View style={styles.selectedDetail}>
            <View style={styles.selectedTop}>
              <View style={[styles.selectedIcon, selectedS.type === 'DC Fast' && styles.selectedIconFast]}>
                <Ionicons name="flash" size={22} color={EV.bg} />
              </View>
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>{selectedS.name}</Text>
                <View style={styles.selectedTags}>
                  <View style={[styles.tag, selectedS.type === 'DC Fast' && styles.tagFast]}>
                    <Text style={[styles.tagText, selectedS.type === 'DC Fast' && styles.tagTextFast]}>{selectedS.type}</Text>
                  </View>
                  <View style={styles.tag}><Text style={styles.tagText}>{selectedS.power}</Text></View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedStation(null)}>
                <Ionicons name="close-circle" size={22} color={EV.textDim} />
              </TouchableOpacity>
            </View>
            <View style={styles.selectedStats}>
              {[
                { icon: 'cash-outline', val: selectedS.cost, lbl: 'Cost', color: EV.primary },
                { icon: 'time-outline', val: selectedS.time, lbl: 'Charge Time', color: EV.accent },
                { icon: 'battery-charging-outline', val: `${selectedS.available}/${selectedS.total}`, lbl: 'Available', color: EV.neon },
              ].map(item => (
                <View key={item.lbl} style={styles.selectedStat}>
                  <View style={[styles.selectedStatIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <Text style={styles.selectedStatVal}>{item.val}</Text>
                  <Text style={styles.selectedStatLbl}>{item.lbl}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.navigateBtn} onPress={handleNavigate} disabled={routeLoading}>
              {routeLoading
                ? <ActivityIndicator color={EV.bg} />
                : <><Ionicons name="navigate" size={17} color={EV.bg} /><Text style={styles.navigateBtnText}>Navigate to Station</Text></>
              }
            </TouchableOpacity>
          </View>

        ) : (
          <View
            style={styles.sheetContent}
            onLayout={e => {
              const total = e.nativeEvent.layout.height + 72;
              if (total > PEEK) startY.current = startY.current; // keep ref
            }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stationList}>
              {STATIONS.map((s, index) => (
                <TouchableOpacity key={`sheet-${s.id}-${index}`} style={styles.stationCard} onPress={() => handleStationPress(s.id)} activeOpacity={0.85}>
                  <View style={styles.stationCardTop}>
                    <View style={[styles.stationCardIcon, s.type === 'DC Fast' && styles.stationCardIconFast]}>
                      <Ionicons name="flash" size={16} color={EV.bg} />
                    </View>
                    <View style={[styles.availPill, s.available === 0 && styles.availPillEmpty]}>
                      <Text style={styles.availPillText}>{s.available}/{s.total}</Text>
                    </View>
                  </View>
                  <Text style={styles.stationCardName} numberOfLines={1}>{s.name}</Text>
                  <Text style={styles.stationCardType}>{s.type}</Text>
                  <View style={styles.stationCardDivider} />
                  <View style={styles.stationCardStats}>
                    <View style={styles.stationStat}><Text style={styles.stationStatVal}>{s.cost}</Text><Text style={styles.stationStatLbl}>Cost</Text></View>
                    <View style={styles.stationStat}><Text style={styles.stationStatVal}>{s.time}</Text><Text style={styles.stationStatLbl}>Time</Text></View>
                    <View style={styles.stationStat}><Text style={styles.stationStatVal}>{s.power}</Text><Text style={styles.stationStatLbl}>Power</Text></View>
                  </View>
                  <TouchableOpacity style={styles.cardNavBtn} onPress={() => handleStationPress(s.id)}>
                    <Ionicons name="navigate" size={13} color={EV.bg} />
                    <Text style={styles.cardNavBtnText}>Go Here</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0a1a0f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6DBF8A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#050F0A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#0D2B1A' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1A4A2A' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#112E1C' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#00C853' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#030a06' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0A1F14' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0d2b1a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#0A1F14' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1A4A2A' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#071409' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: EV.bg },
  safeTop: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },

  searchBar: { paddingHorizontal: 16, paddingBottom: 8 },
  searchInput: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: EV.bgCard + 'F5', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: EV.border,
  },
  searchFocused: { borderColor: EV.primary },
  dotA: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: EV.primary, alignItems: 'center', justifyContent: 'center' },
  dotAInner: { width: 5, height: 5, borderRadius: 3, backgroundColor: EV.primary },
  searchText: { flex: 1, color: EV.text, fontSize: 15, fontWeight: '500' },

  routeBar: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16,
    backgroundColor: EV.bgCard + 'F5', borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 16,
    borderWidth: 1, borderColor: EV.primaryDark, gap: 12,
  },
  routeItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  routeVal: { fontSize: 13, fontWeight: '700', color: EV.text },
  routeDivider: { width: 1, height: 16, backgroundColor: EV.border },

  mapControls: { position: 'absolute', right: 16, gap: 10, zIndex: 5 },
  mapBtn: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: EV.bgCard + 'F0', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: EV.border,
  },

  markerWrap: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: EV.primaryDeep, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: EV.primary,
  },
  markerFast: { backgroundColor: EV.primary },
  markerSelected: {
    width: 38, height: 38, borderRadius: 12,
    borderColor: EV.white, borderWidth: 2.5,
    shadowColor: EV.primary, shadowOpacity: 0.8, shadowRadius: 8, elevation: 8,
  },

  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: EV.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderBottomWidth: 0, borderColor: EV.border,
    zIndex: 20, overflow: 'hidden',
  },
  sheetHeader: {
    alignItems: 'center', paddingTop: 10,
    paddingBottom: 10, paddingHorizontal: 16, gap: 8,
  },
  handleBar: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: EV.primary + '80',
  },
  peekRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  peekLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sheetTitle: { fontSize: 11, fontWeight: '700', color: EV.primary, letterSpacing: 1.5 },
  sheetBadge: { backgroundColor: EV.primary, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  sheetBadgeText: { fontSize: 11, fontWeight: '800', color: EV.bg },

  sheetContent: { paddingLeft: 16, paddingBottom: 16 },
  stationList: { gap: 10, paddingRight: 16 },
  stationCard: {
    width: 160, height: 200,
    backgroundColor: EV.bgSurface, borderRadius: 18,
    padding: 14, borderWidth: 1, borderColor: EV.border,
  },
  stationCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stationCardIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: EV.primaryDeep, alignItems: 'center', justifyContent: 'center' },
  stationCardIconFast: { backgroundColor: EV.primary },
  availPill: { backgroundColor: EV.bgCard, borderRadius: 7, paddingHorizontal: 6, paddingVertical: 3, borderWidth: 1, borderColor: EV.primaryDark },
  availPillEmpty: { borderColor: EV.danger },
  availPillText: { fontSize: 10, color: EV.primary, fontWeight: '700' },
  stationCardName: { fontSize: 13, fontWeight: '700', color: EV.text, marginBottom: 2 },
  stationCardType: { fontSize: 11, color: EV.textMuted, marginBottom: 10 },
  stationCardDivider: { height: 1, backgroundColor: EV.border, marginBottom: 10 },
  stationCardStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  stationStat: { alignItems: 'center' },
  stationStatVal: { fontSize: 11, fontWeight: '700', color: EV.text },
  stationStatLbl: { fontSize: 9, color: EV.textMuted, marginTop: 2 },
  cardNavBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: EV.primary, borderRadius: 10, paddingVertical: 8,
  },
  cardNavBtnText: { fontSize: 12, fontWeight: '700', color: EV.bg },

  selectedDetail: { flex: 1, paddingHorizontal: 16 },
  selectedTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  selectedIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: EV.primaryDeep, alignItems: 'center', justifyContent: 'center' },
  selectedIconFast: { backgroundColor: EV.primary },
  selectedInfo: { flex: 1 },
  selectedName: { fontSize: 16, fontWeight: '800', color: EV.text, marginBottom: 5 },
  selectedTags: { flexDirection: 'row', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: EV.bgSurface, borderWidth: 1, borderColor: EV.border },
  tagFast: { backgroundColor: EV.primary + '20', borderColor: EV.primaryDark },
  tagText: { fontSize: 10, color: EV.textMuted, fontWeight: '600' },
  tagTextFast: { color: EV.primary },
  selectedStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  selectedStat: { alignItems: 'center', gap: 6 },
  selectedStatIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  selectedStatVal: { fontSize: 15, fontWeight: '800', color: EV.text },
  selectedStatLbl: { fontSize: 10, color: EV.textMuted },
  navigateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: EV.primary, borderRadius: 14, paddingVertical: 15,
  },
  navigateBtnText: { color: EV.bg, fontWeight: '800', fontSize: 15 },
});
