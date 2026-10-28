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
import { expensesApi } from '@/src/services/api/expensesApi';
import { useAuth } from '@/src/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card } from '@/src/components/common';

export default function ExpensesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { currentShop } = useAuth();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    amount: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadExpenses = async () => {
    if (!currentShop) return;
    
    try {
      setError(null);
      const data = await expensesApi.getExpenses(currentShop.id);
      setExpenses(data.expenses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [currentShop]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadExpenses();
    setIsRefreshing(false);
  };

  const handleAddExpense = async () => {
    if (!currentShop) return;
    
    if (!newExpense.category || !newExpense.description || !newExpense.amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await expensesApi.createExpense({
        shopId: currentShop.id,
        category: newExpense.category,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
      });
      setShowAddModal(false);
      setNewExpense({ category: '', description: '', amount: '' });
      loadExpenses();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toFixed(2)}`;
  };

  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('rent')) return { ios: 'house', android: 'home', web: 'home' };
    if (lowerCategory.includes('utility')) return { ios: 'bolt', android: 'electric_bolt', web: 'electric_bolt' };
    if (lowerCategory.includes('salary')) return { ios: 'person', android: 'person', web: 'person' };
    if (lowerCategory.includes('inventory')) return { ios: 'cube', android: 'inventory', web: 'inventory' };
    if (lowerCategory.includes('marketing')) return { ios: 'megaphone', android: 'campaign', web: 'campaign' };
    return { ios: 'banknote', android: 'payments', web: 'payments' };
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <SymbolView
            name={getCategoryIcon(item.category)}
            tintColor={colors.primary}
            size={24}
          />
          <View style={styles.expenseText}>
            <Text style={[styles.expenseCategory, { color: colors.text }]}>
              {item.category}
            </Text>
            <Text style={[styles.expenseDescription, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
        </View>
        <Text style={[styles.expenseAmount, { color: colors.error }]}>
          {formatCurrency(item.amount)}
        </Text>
      </View>
      <Text style={[styles.expenseDate, { color: colors.textSecondary }]}>
        {formatDate(item.expenseDate || item.createdAt)}
      </Text>
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
        <Text style={[styles.title, { color: colors.text }]}>Expenses</Text>
        <Button
          title="Add Expense"
          onPress={() => setShowAddModal(true)}
          icon={{ ios: 'plus', android: 'add', web: 'add' }}
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SymbolView
            name={{ ios: 'banknote', android: 'payments', web: 'payments' }}
            tintColor={colors.textSecondary}
            size={64}
          />
          <Text style={[styles.emptyText, { color: colors.text }]}>No expenses yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Track your business expenses here
          </Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {/* Add Expense Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Expense</Text>
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
              <Text style={[styles.label, { color: colors.text }]}>Category</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Rent, Utilities, Salary"
                placeholderTextColor={colors.textSecondary}
                value={newExpense.category}
                onChangeText={(text) => setNewExpense({ ...newExpense, category: text })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="Expense description"
                placeholderTextColor={colors.textSecondary}
                value={newExpense.description}
                onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                keyboardType="decimal-pad"
              />

              <Button
                title={isSubmitting ? 'Adding...' : 'Add Expense'}
                onPress={handleAddExpense}
                disabled={isSubmitting}
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
  expenseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  expenseText: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 14,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  expenseDate: {
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
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
});
