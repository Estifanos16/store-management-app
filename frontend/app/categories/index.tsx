import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card } from '@/src/components/common';
import { useAuth } from '@/src/contexts/AuthContext';

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { currentShop } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // TODO: Connect to real API when backend supports categories
  useEffect(() => {
    // Mock data for now
    const mockCategories: Category[] = [
      { id: '1', name: 'Electronics', createdAt: new Date().toISOString() },
      { id: '2', name: 'Accessories', createdAt: new Date().toISOString() },
      { id: '3', name: 'Clothing', createdAt: new Date().toISOString() },
      { id: '4', name: 'Cosmetics', createdAt: new Date().toISOString() },
    ];
    setCategories(mockCategories);
    setIsLoading(false);
  }, []);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      createdAt: new Date().toISOString(),
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setShowAddForm(false);
    Alert.alert('Success', 'Category added successfully');
  };

  const handleDeleteCategory = (id: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCategories(categories.filter(c => c.id !== id));
            Alert.alert('Success', 'Category deleted');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage product categories
          </Text>
        </View>

        {showAddForm && (
          <Card style={styles.addFormCard}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Category name"
              placeholderTextColor={colors.textSecondary}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <View style={styles.formButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowAddForm(false);
                  setNewCategoryName('');
                }}
                variant="outline"
                style={styles.formButton}
              />
              <Button
                title="Add"
                onPress={handleAddCategory}
                variant="accent"
                style={styles.formButton}
              />
            </View>
          </Card>
        )}

        {!showAddForm && (
          <Button
            title="Add Category"
            onPress={() => setShowAddForm(true)}
            variant="accent"
            icon={{ ios: 'plus', android: 'add', web: 'add' }}
            style={styles.addButton}
          />
        )}

        {categories.map(category => (
          <Card key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryContent}>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                <Text style={[styles.categoryDate, { color: colors.textSecondary }]}>
                  Created {new Date(category.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteCategory(category.id)}
              >
                <SymbolView
                  name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                  tintColor={colors.error}
                  size={20}
                />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {categories.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No categories yet. Add your first category to get started.
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
  },
  addButton: {
    marginBottom: 20,
  },
  addFormCard: {
    padding: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
  },
  categoryCard: {
    padding: 16,
    marginBottom: 12,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryDate: {
    fontSize: 13,
  },
  deleteButton: {
    padding: 8,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
  },
});
