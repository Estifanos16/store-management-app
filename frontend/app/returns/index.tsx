import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { returnsApi } from '@/src/services/api/returnsApi';
import { itemsApi } from '@/src/services/api/itemsApi';
import { useAuth } from '@/src/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card, StatusChip } from '@/src/components/common';

export default function ReturnsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { currentShop } = useAuth();

  const [returns, setReturns] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReturn, setNewReturn] = useState({
    itemId: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReturns = async () => {
    if (!currentShop) return;
    
    try {
      setError(null);
      const data = await returnsApi.getReturns(currentShop.id);
      setReturns(data.returns || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load returns');
    } finally {
      setIsLoading(false);
    }
  };

  const loadItems = async () => {
    if (!currentShop) return;
    try {
      const data = await itemsApi.getItems(currentShop.id, 'SOLD');
      setItems(data.items || []);
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  };

  useEffect(() => {
    loadReturns();
    loadItems();
  }, [currentShop]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadReturns();
    setIsRefreshing(false);
  };

  const handleAddReturn = async () => {
    if (!currentShop) return;
    
    if (!newReturn.itemId || !newReturn.reason) {
      Alert.alert('Error', 'Please select an item and provide a reason');
      return;
    }

    setIsSubmitting(true);
    try {
      await returnsApi.createReturn({
        shopId: currentShop.id,
        itemId: newReturn.itemId,
        reason: newReturn.reason,
      });
      setShowAddModal(false);
      setNewReturn({ itemId: '', reason: '' });
      loadReturns();
      Alert.alert('Success', 'Return registered successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to register return');
    } finally {
      setIsSubmitting(false);
    }
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

  const renderItem = ({ item }: { item: any }) => (
    <Card style={[styles.returnCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.returnHeader}>
        <View style={styles.returnInfo}>
          <Text style={[styles.returnId, { color: colors.text }]}>
            Return #{item.id.slice(0, 8)}
          </Text>
          <Text style={[styles.returnDate, { color: colors.textSecondary }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <StatusChip status="returned" />
      </View>

      <View style={styles.returnDetails}>
        <Text style={[styles.itemName, { color: colors.text }]}>
          {item.item?.product?.name || 'Unknown Product'}
        </Text>
        <Text style={[styles.itemSku, { color: colors.textSecondary }]}>
          {item.item?.publicIdentifier || 'N/A'}
        </Text>
      </View>

      <View style={styles.reasonSection}>
        <Text style={[styles.reasonLabel, { color: colors.textSecondary }]}>Reason:</Text>
        <Text style={[styles.reasonText, { color: colors.text }]}>{item.reason}</Text>
      </View>
    </Card>
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
        <Text style={[styles.title, { color: colors.text }]}>Returns</Text>
        <Button
          title="Register Return"
          onPress={() => {
            loadItems();
            setShowAddModal(true);
          }}
          icon={{ ios: 'arrow.uturn.backward', android: 'keyboard_return', web: 'keyboard_return' }}
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : returns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SymbolView
            name={{ ios: 'arrow.uturn.backward', android: 'keyboard_return', web: 'keyboard_return' }}
            tintColor={colors.textSecondary}
            size={64}
          />
          <Text style={[styles.emptyText, { color: colors.text }]}>No returns yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Register product returns here
          </Text>
        </View>
      ) : (
        <FlatList
          data={returns}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {/* Add Return Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Register Return</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <SymbolView
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                tintColor={colors.text}
                size={24}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card style={styles.formCard}>
              <Text style={[styles.label, { color: colors.text }]}>Select Item</Text>
              {items.length === 0 ? (
                <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>
                  No sold items available for return
                </Text>
              ) : (
                <ScrollView style={styles.itemsList} nestedScrollEnabled>
                  {items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.itemOption,
                        newReturn.itemId === item.id && { backgroundColor: colors.primary + '20' },
                      ]}
                      onPress={() => setNewReturn({ ...newReturn, itemId: item.id })}
                    >
                      <Text style={[styles.itemOptionName, { color: colors.text }]}>
                        {item.product?.name}
                      </Text>
                      <Text style={[styles.itemOptionSku, { color: colors.textSecondary }]}>
                        {item.publicIdentifier}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Text style={[styles.label, { color: colors.text }]}>Reason</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Defective, Wrong item, Customer changed mind"
                placeholderTextColor={colors.textSecondary}
                value={newReturn.reason}
                onChangeText={(text) => setNewReturn({ ...newReturn, reason: text })}
                multiline
                numberOfLines={3}
              />

              <Button
                title={isSubmitting ? 'Registering...' : 'Register Return'}
                onPress={handleAddReturn}
                disabled={isSubmitting || !newReturn.itemId}
              />
            </Card>
          </ScrollView>
        </View>
      </Modal>
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
  returnCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  returnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  returnInfo: {
    flex: 1,
  },
  returnId: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  returnDate: {
    fontSize: 13,
  },
  returnDetails: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 13,
  },
  reasonSection: {
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formCard: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  noItemsText: {
    fontSize: 14,
    marginBottom: 20,
  },
  itemsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  itemOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  itemOptionName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemOptionSku: {
    fontSize: 12,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 20,
    minHeight: 80,
  },
});
