import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card, StatusChip } from '@/src/components/common';
import { SymbolView } from 'expo-symbols';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock product data - replace with API call
    setTimeout(() => {
      setProduct({
        id: id,
        name: 'Wireless Mouse',
        category: 'Electronics',
        description: 'High-quality wireless mouse with ergonomic design',
        price: 25.00,
        stock: 15,
        active: true,
      });
      setIsLoading(false);
    }, 500);
  }, [id]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Product not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
            <StatusChip status={product.active ? 'in_stock' : 'sold'} label={product.active ? 'Active' : 'Inactive'} />
          </View>
          <Text style={[styles.category, { color: colors.textSecondary }]}>{product.category}</Text>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{product.description}</Text>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Price & Stock</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Selling Price</Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>ETB {product.price.toFixed(2)}</Text>
          </View>
          <View style={styles.stockRow}>
            <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Stock</Text>
            <Text style={[styles.stockValue, { color: colors.text }]}>{product.stock} items</Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Product ID</Text>
          <Text style={[styles.productId, { color: colors.textSecondary }]}>{product.id}</Text>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Edit Product"
            onPress={() => router.push(`/products/${id}/edit`)}
            variant="outline"
          />
          <Button
            title="Delete Product"
            onPress={() => router.back()}
            variant="destructive"
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
