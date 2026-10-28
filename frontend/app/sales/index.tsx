import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { salesApi } from '@/src/services/api/salesApi';
import { useAuth } from '@/src/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Card, StatusChip } from '@/src/components/common';

export default function SalesListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { currentShop } = useAuth();

  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSales = async () => {
    if (!currentShop) return;
    
    try {
      setError(null);
      const data = await salesApi.getSales(currentShop.id);
      setSales(data.sales || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [currentShop]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSales();
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toFixed(2)}`;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return { ios: 'banknote', android: 'payments', web: 'payments' };
      case 'MOBILE_MONEY':
        return { ios: 'iphone', android: 'smartphone', web: 'smartphone' };
      case 'CARD':
        return { ios: 'creditcard', android: 'credit_card', web: 'credit_card' };
      case 'BANK_TRANSFER':
        return { ios: 'building.columns', android: 'account_balance', web: 'account_balance' };
      default:
        return { ios: 'banknote', android: 'payments', web: 'payments' };
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.saleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/sales/${item.id}`)}
    >
      <View style={styles.saleHeader}>
        <View style={styles.saleInfo}>
          <Text style={[styles.saleNumber, { color: colors.text }]}>
            #{item.saleNumber || item.id}
          </Text>
          <Text style={[styles.saleDate, { color: colors.textSecondary }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <View style={styles.saleAmount}>
          <Text style={[styles.amount, { color: colors.primary }]}>
            {formatCurrency(item.totalAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.saleDetails}>
        <View style={styles.detailRow}>
          <SymbolView
            name={getPaymentMethodIcon(item.paymentMethod)}
            tintColor={colors.textSecondary}
            size={16}
          />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.paymentMethod.replace('_', ' ')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <SymbolView
            name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }}
            tintColor={colors.textSecondary}
            size={16}
          />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.items?.length || 0} items
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Sales History</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : sales.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SymbolView
            name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }}
            tintColor={colors.textSecondary}
            size={64}
          />
          <Text style={[styles.emptyText, { color: colors.text }]}>No sales yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Start making sales to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sales}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  listContent: {
    padding: 20,
  },
  saleCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  saleInfo: {
    flex: 1,
  },
  saleNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  saleDate: {
    fontSize: 13,
  },
  saleAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  saleDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
