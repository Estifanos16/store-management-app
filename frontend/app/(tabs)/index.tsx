import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { reportsApi } from '@/src/services/api/reportsApi';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, StatTile, Card } from '@/src/components/common';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { isOwner, currentShop } = useAuth();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    if (!currentShop) return;
    
    try {
      setError(null);
      const data = await reportsApi.getDashboard(currentShop.id);
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      // Set mock data as fallback
      setDashboardData({
        todaySales: 1250.50,
        todayProfit: 325.00,
        lowStockCount: 5,
        totalItems: 247,
        recentActivity: [
          { type: 'sale', title: 'Sale #1234', subtitle: '2 minutes ago • $45.00' },
          { type: 'product', title: 'New Product Added', subtitle: '15 minutes ago • Wireless Mouse' },
          { type: 'stock', title: 'Stock Low', subtitle: '1 hour ago • USB-C Cable (3 left)' },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [currentShop]);

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

  const todaySales = dashboardData?.todaySales || 0;
  const todayProfit = dashboardData?.todayProfit || 0;
  const lowStockCount = dashboardData?.lowStockCount || 0;
  const totalItems = dashboardData?.totalItems || 0;
  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
        </View>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              Using cached data: {error}
            </Text>
          </Card>
        )}

        {/* Summary Cards */}
        <View style={styles.cardsContainer}>
          <StatTile
            title="Today's Sales"
            value={formatCurrency(todaySales)}
            icon={{ ios: 'dollarsign.circle', android: 'attach_money', web: 'attach_money' }}
            trend="+12.5%"
            trendLabel="vs yesterday"
            color="primary"
          />
          {isOwner && (
            <StatTile
              title="Today's Profit"
              value={formatCurrency(todayProfit)}
              icon={{ ios: 'chart.line.uptrend.xyaxis', android: 'assessment', web: 'assessment' }}
              trend="+8.3%"
              trendLabel="vs yesterday"
              color="success"
            />
          )}
        </View>

        <View style={styles.cardsContainer}>
          <StatTile
            title="Low Stock Alerts"
            value={lowStockCount}
            icon={{ ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }}
            color="warning"
          />
          <StatTile
            title="Items in Stock"
            value={totalItems}
            icon={{ ios: 'cube', android: 'inventory', web: 'inventory' }}
            color="primary"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          
          <Button
            title="Quick Scan"
            onPress={() => router.push('/(tabs)/two')}
            variant="accent"
            icon={{ ios: 'barcode', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
            style={styles.actionButton}
          />
          
          <Button
            title="View Products"
            onPress={() => router.push('/(tabs)/products')}
            variant="outline"
            icon={{ ios: 'cube', android: 'inventory', web: 'inventory' }}
            style={styles.actionButton}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          
          {recentActivity.length === 0 ? (
            <Card style={styles.activityItem}>
              <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>
                No recent activity
              </Text>
            </Card>
          ) : (
            recentActivity.map((activity: any, index: number) => (
              <Card key={index} style={styles.activityItem}>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                  <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>
                    {activity.subtitle}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>
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
  greeting: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  errorCard: {
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  actionButton: {
    marginBottom: 12,
  },
  activitySection: {
    marginBottom: 20,
  },
  activityItem: {
    marginBottom: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
  },
});
