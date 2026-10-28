import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useAuth } from '../src/contexts/AuthContext';
import Colors from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';
import { Card, Button } from '../src/components/common';

export default function ShopSelectionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user, shops, setCurrentShop, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectShop = async (shop: any) => {
    setIsLoading(true);
    try {
      await setCurrentShop(shop);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to select shop:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <SymbolView
            name={{ ios: 'storefront', android: 'store', web: 'store' }}
            tintColor={colors.primary}
            size={64}
          />
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Welcome back
          </Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user.name}
          </Text>
        </View>

        {/* Shop Selection */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Select a Shop
        </Text>

        {shops.length === 0 ? (
          <Card style={styles.emptyCard}>
            <SymbolView
              name={{ ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }}
              tintColor={colors.warning}
              size={48}
            />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No shops available
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Contact your administrator to get access to a shop
            </Text>
          </Card>
        ) : (
          shops.map((shop) => (
            <TouchableOpacity
              key={shop.id}
              style={[styles.shopCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSelectShop(shop)}
              disabled={isLoading}
            >
              <View style={styles.shopCardHeader}>
                <SymbolView
                  name={{ ios: 'building.2', android: 'business', web: 'business' }}
                  tintColor={colors.primary}
                  size={32}
                />
                <View style={styles.shopRoleBadge}>
                  <Text style={[styles.shopRoleText, { color: '#FFFFFF' }]}>
                    {shop.role}
                  </Text>
                </View>
              </View>
              <Text style={[styles.shopName, { color: colors.text }]}>{shop.name}</Text>
              <Text style={[styles.shopCurrency, { color: colors.textSecondary }]}>
                Currency: {shop.currency}
              </Text>
              {isLoading && (
                <ActivityIndicator size="small" color={colors.primary} style={styles.loading} />
              )}
            </TouchableOpacity>
          ))
        )}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Switch Account"
            onPress={handleLogout}
            variant="outline"
            icon={{ ios: 'arrow.right.square', android: 'exit_to_app', web: 'exit_to_app' }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 15,
    marginTop: 16,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  shopCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  shopCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopRoleBadge: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  shopRoleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  shopName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  shopCurrency: {
    fontSize: 14,
  },
  loading: {
    marginTop: 12,
  },
  logoutSection: {
    marginTop: 32,
  },
});
