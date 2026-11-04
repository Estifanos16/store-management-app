import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export function OfflineIndicator() {
  const networkStatus = useNetworkStatus();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  if (networkStatus.isConnected && networkStatus.isInternetReachable) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.warning }]}>
      <Text style={[styles.text, { color: colors.warningText }]}>
        {networkStatus.isConnected ? 'No Internet Connection' : 'Offline Mode'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
