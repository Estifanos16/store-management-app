import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsApi } from '../../../services/api/productsApi';
import { CreateProductData, UpdateProductData, Product } from '../types/product';
import { useMockProducts } from '../mockData';
import { productSchema, ProductFormData } from '../schemas/productSchema';
import Colors from '../../../../constants/Colors';
import { useColorScheme } from '../../../../components/useColorScheme';
import { User } from '../../../types/auth';

interface ProductFormScreenProps {
  user: User | null;
}

export default function ProductFormScreen({ user }: ProductFormScreenProps) {
  const { productId, mode } = useLocalSearchParams<{ productId?: string; mode?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [useMock, setUseMock] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const isEditMode = mode === 'edit' && productId;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (isEditMode && productId) {
      loadProduct();
    }
  }, [productId, isEditMode]);

  const loadProduct = async () => {
    if (!productId) return;

    try {
      setIsLoading(true);
      const mockData = useMockProducts(useMock);
      
      if (mockData) {
        const found = mockData.data.find(p => p.id === productId);
        if (found) {
          setValue('name', found.name);
          setValue('description', found.description || '');
          setValue('price', found.price);
          setValue('stock', found.stock);
          setValue('category', found.category || '');
          setValue('imageUrl', found.imageUrl || '');
        }
        setIsLoading(false);
        return;
      }

      const data = await productsApi.getProductById(productId);
      setValue('name', data.name);
      setValue('description', data.description || '');
      setValue('price', data.price);
      setValue('stock', data.stock);
      setValue('category', data.category || '');
      setValue('imageUrl', data.imageUrl || '');
    } catch (err) {
      Alert.alert('Error', 'Failed to load product data');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      const productData: CreateProductData | UpdateProductData = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        price: data.price,
        stock: data.stock,
        category: data.category?.trim() || undefined,
        imageUrl: data.imageUrl?.trim() || undefined,
      };

      if (useMock) {
        Alert.alert('Success', isEditMode ? 'Product updated (mock)' : 'Product created (mock)');
        router.back();
        return;
      }

      if (isEditMode && productId) {
        await productsApi.updateProduct(productId, productData as UpdateProductData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await productsApi.createProduct(productData as CreateProductData);
        Alert.alert('Success', 'Product created successfully');
      }
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors[colorScheme].text,
    },
    cancelButton: {
      padding: 8,
    },
    cancelButtonText: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      opacity: 0.7,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors[colorScheme].text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: Colors[colorScheme].card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: Colors[colorScheme].text,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    saveButton: {
      backgroundColor: Colors[colorScheme].primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 12,
      minHeight: 56,
      justifyContent: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    mockBadge: {
      position: 'absolute',
      top: 60,
      right: 16,
      backgroundColor: '#FF9800',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      zIndex: 1,
    },
    mockBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    errorText: {
      fontSize: 12,
      color: Colors[colorScheme].error,
      marginTop: 4,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {useMock && (
        <View style={styles.mockBadge}>
          <Text style={styles.mockBadgeText}>MOCK DATA</Text>
        </View>
      )}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEditMode ? 'Edit Product' : 'Add Product'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Name *</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
              />
            )}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter product description"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={value || ''}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
              />
            )}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Price (ETB) *</Text>
          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={value.toString()}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                keyboardType="decimal-pad"
              />
            )}
          />
          {errors.price && <Text style={styles.errorText}>{errors.price.message}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Stock Quantity *</Text>
          <Controller
            control={control}
            name="stock"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={value.toString()}
                onChangeText={(text) => onChange(parseInt(text) || 0)}
                keyboardType="number-pad"
              />
            )}
          />
          {errors.stock && <Text style={styles.errorText}>{errors.stock.message}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Enter category"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={value || ''}
                onChangeText={onChange}
                autoCapitalize="words"
              />
            )}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Image URL</Text>
          <Controller
            control={control}
            name="imageUrl"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={value || ''}
                onChangeText={onChange}
                keyboardType="url"
                autoCapitalize="none"
              />
            )}
          />
          {errors.imageUrl && <Text style={styles.errorText}>{errors.imageUrl.message}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={() => handleSubmit(handleSave)()}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{isEditMode ? 'Update Product' : 'Create Product'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
