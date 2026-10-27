import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, StatTile, Card } from '@/src/components/common';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { isOwner } = useAuth();

  const todaySales = 1250.50;
  const todayProfit = 325.00;
  const lowStockCount = 5;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.cardsContainer}>
          <StatTile
            title="Today's Sales"
            value={`$${todaySales.toFixed(2)}`}
            icon={{ ios: 'dollarsign.circle', android: 'attach_money', web: 'attach_money' }}
            trend="+12.5%"
            trendLabel="vs yesterday"
            color="primary"
          />
          {isOwner && (
            <StatTile
              title="Today's Profit"
              value={`$${todayProfit.toFixed(2)}`}
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
            value="247"
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
          
          <Card style={styles.activityItem}>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>Sale #1234</Text>
              <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>2 minutes ago • $45.00</Text>
            </View>
          </Card>

          <Card style={styles.activityItem}>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>New Product Added</Text>
              <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>15 minutes ago • Wireless Mouse</Text>
            </View>
          </Card>

          <Card style={styles.activityItem}>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>Stock Low</Text>
              <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>1 hour ago • USB-C Cable (3 left)</Text>
            </View>
          </Card>
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
