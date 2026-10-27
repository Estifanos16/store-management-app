import { StyleSheet, View, Text } from 'react-native';
import { SymbolView } from 'expo-symbols';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface StatTileProps {
  title: string;
  value: string | number;
  icon?: any;
  trend?: string;
  trendLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export function StatTile({ title, value, icon, trend, trendLabel, color = 'primary' }: StatTileProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const iconBgColor = colors[color] + '20';
  const iconTintColor = colors[color];

  return (
    <View style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
            <SymbolView name={icon} tintColor={iconTintColor} size={28} />
          </View>
        )}
        <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      {trend && (
        <View style={styles.footer}>
          <SymbolView
            name={{ ios: 'arrow.up', android: 'trending_up', web: 'trending_up' }}
            tintColor={colors.success}
            size={16}
          />
          <Text style={[styles.trend, { color: colors.success }]}>{trend}</Text>
          <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>{trendLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trend: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  trendLabel: {
    fontSize: 12,
  },
});
