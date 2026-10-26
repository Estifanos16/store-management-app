import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productsApi } from '../../../services/api/productsApi';
import { Product } from '../types/product';
import { useMockProducts } from '../mockData';
import Colors from '../../../../constants/Colors';
import { useColorScheme } from '../../../../components/useColorScheme';
import { User } from '../../../types/auth';

interface ProductDetailScreenProps {
  user: User | null;
}

export default function ProductDetailScreen({ user }: ProductDetailScreenProps) {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const canEdit = user?.role === 'owner';

  useEffect(() => {
    loadProduct();
  }, [productId, useMock]);

  const loadProduct = async () => {
    if (!productId) {
      setError('Product ID not provided');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const mockData = useMockProducts(useMock);
      
      if (mockData) {
        const found = mockData.data.find(p => p.id === productId);
        if (found) {
          setProduct(found);
        } else {
          setError('Product not found');
        }
        setIsLoading(false);
        return;
      }

      const data = await productsApi.getProductById(productId);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
      // Fallback to mock data on error
      const mockData = useMockProducts(true);
      if (mockData) {
        const found = mockData.data.find(p => p.id === productId);
        if (found) {
          setProduct(found);
          setUseMock(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push({ pathname: '/modal', params: { productId, mode: 'edit' } });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Product deleted (mock)');
            router.back();
          },
        },
      ]
    );
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
    backButton: {
      padding: 8,
    },
    backButtonText: {
      fontSize: 16,
      color: Colors[colorScheme].primary,
    },
    content: {
      padding: 16,
    },
    imagePlaceholder: {
      width: '100%',
      height: 200,
      backgroundColor: Colors[colorScheme].border,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    imagePlaceholderText: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      opacity: 0.5,
    },
    productName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: Colors[colorScheme].text,
      marginBottom: 8,
    },
    productCategory: {
      fontSize: 16,
      color: Colors[colorScheme].primary,
      marginBottom: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors[colorScheme].text,
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
    },
    detailLabel: {
      fontSize: 14,
      color: Colors[colorScheme].text,
      opacity: 0.7,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors[colorScheme].text,
    },
    priceValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors[colorScheme].primary,
    },
    description: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      lineHeight: 24,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 16,
    },
    statusText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: Colors[colorScheme].primary,
    },
    deleteButton: {
      backgroundColor: Colors[colorScheme].error,
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    errorText: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      textAlign: 'center',
      marginBottom: 16,
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
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.actionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {useMock && (
        <View style={styles.mockBadge}>
          <Text style={styles.mockBadgeText}>MOCK DATA</Text>
        </View>
      )}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Product Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Product Image</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: product.active ? Colors[colorScheme].success : Colors[colorScheme].neutral },
          ]}
        >
          <Text style={styles.statusText}>{product.active ? 'Active' : 'Inactive'}</Text>
        </View>

        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category || 'Uncategorized'}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Stock</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.priceValue}>ETB {product.price.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stock</Text>
            <Text style={styles.detailValue}>{product.stock} units</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description || 'No description available.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Product ID</Text>
            <Text style={styles.detailValue}>{product.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shop ID</Text>
            <Text style={styles.detailValue}>{product.shopId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {new Date(product.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Updated</Text>
            <Text style={styles.detailValue}>
              {new Date(product.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {canEdit && (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
