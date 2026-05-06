import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GG as EV } from '@/constants/theme';

function TabIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

function HomeTabIcon({ color, focused }: { color: string; focused: boolean }) {
  return (
    <View style={[styles.homeBtn, focused && styles.homeBtnActive]}>
      <Ionicons name="home" size={24} color={focused ? EV.white : EV.primary} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: EV.primary,
        tabBarInactiveTintColor: EV.textDim,
        tabBarLabelStyle: styles.label,
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="map-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="stations"
        options={{
          title: 'Stations',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="flash-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <HomeTabIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="wallet-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="carbon"
        options={{
          title: 'Carbon',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="leaf-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="score"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: EV.bgCard,
    borderTopColor: EV.border,
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 10,
    paddingTop: 6,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  iconWrap: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  iconWrapActive: {
    backgroundColor: EV.primary + '20',
  },
  homeBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: EV.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: EV.primary,
    marginBottom: 20,
    shadowColor: EV.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  homeBtnActive: {
    backgroundColor: EV.primary,
    borderColor: EV.primary,
  },
});
