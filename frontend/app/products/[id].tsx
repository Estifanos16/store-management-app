import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card, StatusChip } from '@/src/components/common';
import { productsApi } from '@/src/services/api/productsApi';
import { Product } from '@/src/features/products/types/product';
import { useAuth } from '@/src/contexts/AuthContext';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { currentShop } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!id || !currentShop) {
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await productsApi.getProductById(id, currentShop.id);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  }, [id, currentShop]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Product not found'}
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const stock = product.stockCounts;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
            <StatusChip
              status={product.active ? 'in_stock' : 'sold'}
              label={product.archived ? 'Archived' : 'Active'}
            />
          </View>
          <Text style={[styles.category, { color: colors.textSecondary }]}>
            {product.category || product.brand || 'Uncategorized'}
          </Text>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {product.description || 'No description available.'}
          </Text>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Price & Stock</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Selling Price</Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>
              ETB {product.price.toFixed(2)}
            </Text>
          </View>
          {stock && (
            <>
              <View style={styles.stockRow}>
                <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Available</Text>
                <Text style={[styles.stockValue, { color: colors.text }]}>{stock.available} items</Text>
              </View>
              <View style={styles.stockRow}>
                <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Sold</Text>
                <Text style={[styles.stockValue, { color: colors.text }]}>{stock.sold} items</Text>
              </View>
              <View style={styles.stockRow}>
                <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Damaged</Text>
                <Text style={[styles.stockValue, { color: colors.text }]}>{stock.damaged} items</Text>
              </View>
              <View style={styles.stockRow}>
                <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Returned</Text>
                <Text style={[styles.stockValue, { color: colors.text }]}>{stock.returned} items</Text>
              </View>
              <View style={styles.stockRow}>
                <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Lost</Text>
                <Text style={[styles.stockValue, { color: colors.text }]}>{stock.lost} items</Text>
              </View>
            </>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Product ID</Text>
          <Text style={[styles.productId, { color: colors.textSecondary }]}>{product.id}</Text>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Register Inventory"
            onPress={() => router.push(`/items/register?productId=${product.id}`)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  category: {
    fontSize: 15,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 15,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 15,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  productId: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
});
