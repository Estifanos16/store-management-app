import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { salesApi } from '@/src/services/api/salesApi';
import { useAuth } from '@/src/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card } from '@/src/components/common';

export default function SaleDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { currentShop } = useAuth();
  const { saleId } = useLocalSearchParams() as { saleId: string };

  const [sale, setSale] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSale = async () => {
    if (!currentShop || !saleId) return;
    try {
      const data = await salesApi.getSaleById(saleId, currentShop.id);
      setSale(data.sale);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sale');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSale();
  }, [currentShop, saleId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
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

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!sale) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Sale not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Sale Info Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Sale Details</Text>
            <Text style={[styles.saleNumber, { color: colors.primary }]}>
              #{sale.saleNumber || sale.id}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
            <Text style={[styles.value, { color: colors.text }]}>{formatDate(sale.createdAt)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Payment Method</Text>
            <View style={styles.paymentMethod}>
              <SymbolView
                name={getPaymentMethodIcon(sale.paymentMethod)}
                tintColor={colors.primary}
                size={18}
              />
              <Text style={[styles.value, { color: colors.text }]}>
                {sale.paymentMethod.replace('_', ' ')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Items Card */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Items</Text>
          {sale.items?.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.product?.name || 'Unknown Product'}
                </Text>
                <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                {formatCurrency(item.unitPrice * item.quantity)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Summary Card */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(sale.subtotal || sale.totalAmount)}
            </Text>
          </View>

          {sale.discount && sale.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Discount</Text>
              <Text style={[styles.summaryValue, { color: colors.error }]}>
                -{formatCurrency(sale.discount)}
              </Text>
            </View>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatCurrency(sale.totalAmount)}
            </Text>
          </View>

          {sale.profit !== undefined && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Profit</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                {formatCurrency(sale.profit)}
              </Text>
            </View>
          )}
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Print Receipt"
            onPress={() => {
              Alert.alert('Print', 'Receipt printing feature coming soon');
            }}
            variant="outline"
            icon={{ ios: 'printer', android: 'print', web: 'print' }}
          />
          <Button
            title="Back to Sales"
            onPress={() => router.back()}
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
  card: {
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saleNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
