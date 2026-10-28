import { StyleSheet, View, Text, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Constants from 'expo-constants';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card } from '@/src/components/common';
import { productsApi } from '@/src/services/api/productsApi';
import { useAuth } from '@/src/contexts/AuthContext';

const API_BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export default function NewProductScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { currentShop } = useAuth();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!currentShop) {
      Alert.alert('Error', 'No shop selected. Please select a shop first.');
      console.log('No shop selected. currentShop:', currentShop);
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Error', 'Product name must be at least 2 characters');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid selling price');
      return;
    }

    setIsLoading(true);
    try {
      // Test backend connection
      console.log('Testing backend connection to', `${API_BASE_URL}/health`);
      try {
        const testResponse = await fetch(`${API_BASE_URL}/health`);
        console.log('Health check response:', testResponse.status, testResponse.ok);
        const healthData = await testResponse.json();
        console.log('Health data:', healthData);
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        Alert.alert(
          'Backend Connection Error',
          `Cannot connect to backend at ${API_BASE_URL}. Make sure the backend is running.`
        );
        setIsLoading(false);
        return;
      }
      
      console.log('Creating product with data:', {
        shopId: currentShop.id,
        name: name.trim(),
        description: description.trim() || undefined,
        brand: brand.trim() || undefined,
        defaultSellingPrice: parseFloat(price),
      });

      const result = await productsApi.createProduct({
        shopId: currentShop.id,
        name: name.trim(),
        description: description.trim() || undefined,
        brand: brand.trim() || undefined,
        defaultSellingPrice: parseFloat(price),
      });

      console.log('Product created successfully:', result);

      Alert.alert('Success', 'Product created successfully', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back and refresh the products list
            router.replace('/(tabs)/products');
          },
        },
      ]);
    } catch (error) {
      console.error('Product creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.form}>
          <Text style={[styles.title, { color: colors.text }]}>Add New Product</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Product Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter product name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Brand</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter brand (optional)"
              placeholderTextColor={colors.textSecondary}
              value={brand}
              onChangeText={setBrand}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter category (optional)"
              placeholderTextColor={colors.textSecondary}
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter product description (optional)"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Default Selling Price (ETB) *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
          />
          <Button
            title={isLoading ? 'Saving...' : 'Save Product'}
            onPress={handleSave}
            disabled={isLoading}
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
  form: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: {
    gap: 12,
  },
});
