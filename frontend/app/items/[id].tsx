import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { itemsApi } from '@/src/services/api/itemsApi';
import { useAuth } from '@/src/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card, StatusChip } from '@/src/components/common';

const STATUS_OPTIONS = ['IN_STOCK', 'SOLD', 'RETURNED', 'DAMAGED'];

export default function ItemDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { currentShop } = useAuth();
  const { itemId } = router.useLocalSearchParams() as { itemId: string };

  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');

  const loadItem = async () => {
    if (!currentShop || !itemId) return;
    try {
      const data = await itemsApi.getItemById(itemId, currentShop.id);
      setItem(data.item);
      setNewStatus(data.item.status);
    } catch (error) {
      Alert.alert('Error', 'Failed to load item');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadItem();
  }, [currentShop, itemId]);

  const handleStatusUpdate = async () => {
    if (!currentShop || !item) return;
    setIsUpdating(true);
    try {
      await itemsApi.updateItemStatus(itemId, {
        shopId: currentShop.id,
        status: newStatus as any,
        reason: reason || undefined,
      });
      Alert.alert('Success', 'Item status updated');
      loadItem();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Text style={[styles.title, { color: colors.text }]}>Item Details</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Product:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{item?.product?.name}</Text>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>ID:</Text>
          <Text style={[styles.value, styles.code, { color: colors.text }]}>{item?.publicIdentifier}</Text>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>QR Code:</Text>
          <Text style={[styles.value, styles.code, { color: colors.text }]}>{item?.uniqueQrCode}</Text>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Status:</Text>
          <StatusChip status={item?.status.toLowerCase()} />
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Cost Price:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{item?.costPrice} ETB</Text>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Selling Price:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{item?.sellingPrice || 'N/A'} ETB</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Update Status</Text>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Select Status:</Text>
          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  newStatus === status && { backgroundColor: colors.primary },
                ]}
                onPress={() => setNewStatus(status)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    newStatus === status && { color: '#FFFFFF' },
                    { color: colors.text },
                  ]}
                >
                  {status.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Reason (Optional):</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Reason for status change"
            placeholderTextColor={colors.textSecondary}
            value={reason}
            onChangeText={setReason}
          />

          <Button
            title={isUpdating ? 'Updating...' : 'Update Status'}
            onPress={handleStatusUpdate}
            disabled={isUpdating}
          />
        </Card>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
  },
  code: {
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 16,
    minHeight: 40,
  },
});
