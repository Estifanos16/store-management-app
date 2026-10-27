import { StyleSheet, View, Text } from 'react-native';
import { SymbolView } from 'expo-symbols';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ItemStatus } from '@store-management/shared';

interface StatusChipProps {
  status: ItemStatus | string;
  label?: string;
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  in_stock: {
    color: 'success',
    icon: { ios: 'checkmark', android: 'check', web: 'check' },
    label: 'In stock',
  },
  sold: {
    color: 'neutral',
    icon: { ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' },
    label: 'Sold',
  },
  returned: {
    color: 'info',
    icon: { ios: 'arrow.counterclockwise', android: 'refresh', web: 'refresh' },
    label: 'Returned',
  },
  damaged: {
    color: 'error',
    icon: { ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' },
    label: 'Damaged',
  },
  lost: {
    color: 'error',
    icon: { ios: 'questionmark', android: 'help', web: 'help' },
    label: 'Lost',
  },
};

export function StatusChip({ status, label }: StatusChipProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: 'neutral',
    icon: { ios: 'circle', android: 'circle', web: 'circle' },
    label: status,
  };

  const bgColor = colors[`${config.color}Bg` as keyof typeof colors] as string;
  const textColor = colors[`${config.color}Text` as keyof typeof colors] as string;
  const displayLabel = label || config.label;

  return (
    <View style={[styles.chip, { backgroundColor: bgColor }]}>
      <SymbolView
        name={config.icon}
        tintColor={textColor}
        size={12}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: textColor }]}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
