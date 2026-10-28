import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useAuth } from '@/src/contexts/AuthContext';
import { reportsApi } from '@/src/services/api/reportsApi';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Card, StatTile } from '@/src/components/common';

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { currentShop, isOwner } = useAuth();

  const [profitData, setProfitData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    if (!currentShop) return;
    
    try {
      setError(null);
      const data = await reportsApi.getProfitReport(currentShop.id);
      setProfitData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [currentShop]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadReports();
    setIsRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Reports</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Financial Analytics
          </Text>
        </View>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </Card>
        )}

        {!isOwner && (
          <Card style={styles.accessCard}>
            <SymbolView
              name={{ ios: 'lock', android: 'lock', web: 'lock' }}
              tintColor={colors.warning}
              size={32}
            />
            <Text style={[styles.accessText, { color: colors.text }]}>
              Owner Access Required
            </Text>
            <Text style={[styles.accessSubtext, { color: colors.textSecondary }]}>
              Detailed financial reports are only available to shop owners
            </Text>
          </Card>
        )}

        {isOwner && profitData && (
          <>
            {/* Revenue Section */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Revenue</Text>
            <View style={styles.cardsContainer}>
              <StatTile
                title="Total Revenue"
                value={formatCurrency(profitData.revenue || 0)}
                icon={{ ios: 'dollarsign.circle', android: 'attach_money', web: 'attach_money' }}
                color="primary"
              />
              <StatTile
                title="Gross Profit"
                value={formatCurrency(profitData.grossProfit || 0)}
                icon={{ ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' }}
                color="success"
              />
            </View>

            {/* Costs Section */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Costs</Text>
            <Card style={styles.card}>
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Cost of Goods Sold</Text>
                <Text style={[styles.costValue, { color: colors.text }]}>
                  {formatCurrency(profitData.cogs || 0)}
                </Text>
              </View>
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Expenses</Text>
                <Text style={[styles.costValue, { color: colors.text }]}>
                  {formatCurrency(profitData.expenses || 0)}
                </Text>
              </View>
              <View style={[styles.costRow, styles.totalCostRow]}>
                <Text style={[styles.totalCostLabel, { color: colors.text }]}>Total Costs</Text>
                <Text style={[styles.totalCostValue, { color: colors.error }]}>
                  {formatCurrency((profitData.cogs || 0) + (profitData.expenses || 0))}
                </Text>
              </View>
            </Card>

            {/* Net Profit Section */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Net Profit</Text>
            <Card style={[styles.profitCard, { backgroundColor: colors.success + '10' }]}>
              <View style={styles.profitHeader}>
                <SymbolView
                  name={{ ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' }}
                  tintColor={colors.success}
                  size={48}
                />
                <View style={styles.profitAmount}>
                  <Text style={[styles.profitLabel, { color: colors.textSecondary }]}>Net Profit</Text>
                  <Text style={[styles.profitValue, { color: colors.success }]}>
                    {formatCurrency(profitData.netProfit || 0)}
                  </Text>
                </View>
              </View>
              <View style={styles.profitMargin}>
                <Text style={[styles.marginLabel, { color: colors.textSecondary }]}>
                  Profit Margin
                </Text>
                <Text style={[styles.marginValue, { color: colors.success }]}>
                  {profitData.profitMargin ? `${profitData.profitMargin.toFixed(1)}%` : '0%'}
                </Text>
              </View>
            </Card>

            {/* Additional Metrics */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>
            <View style={styles.cardsContainer}>
              <StatTile
                title="Total Sales"
                value={profitData.totalSales || 0}
                icon={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }}
                color="primary"
              />
              <StatTile
                title="Avg. Sale Value"
                value={formatCurrency(profitData.avgSaleValue || 0)}
                icon={{ ios: 'equal', android: 'equal', web: 'equal' }}
                color="primary"
              />
            </View>
          </>
        )}

        {!isOwner && !profitData && (
          <Card style={styles.emptyCard}>
            <SymbolView
              name={{ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }}
              tintColor={colors.textSecondary}
              size={64}
            />
            <Text style={[styles.emptyText, { color: colors.text }]}>No Reports Available</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Reports will appear here once you have sales data
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  errorCard: {
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
  },
  accessCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  accessText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  accessSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    padding: 20,
    marginBottom: 20,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 15,
  },
  costValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  totalCostRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalCostLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalCostValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  profitCard: {
    padding: 24,
    marginBottom: 20,
  },
  profitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profitAmount: {
    marginLeft: 16,
    flex: 1,
  },
  profitLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  profitMargin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marginLabel: {
    fontSize: 14,
  },
  marginValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
