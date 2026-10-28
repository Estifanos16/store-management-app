import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SymbolView } from 'expo-symbols';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card, StatusChip } from '@/src/components/common';

export default function ScannerItemScreen() {
  const { code } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItem();
  }, [code]);

  const loadItem = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock item data - replace with API call
      // In production: const item = await itemsApi.getItemByQRCode(code);
      setTimeout(() => {
        setItem({
          id: code,
          publicIdentifier: 'ITEM-001234',
          name: 'Wireless Mouse',
          category: 'Electronics',
          status: 'in_stock',
          costPrice: 15.00,
          sellingPrice: 25.00,
          registeredAt: new Date().toISOString(),
          product: {
            id: 'prod-1',
            name: 'Wireless Mouse',
            description: 'High-quality wireless mouse with ergonomic design',
            brand: 'Logitech',
          },
        });
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load item');
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    Alert.alert(
      'Add to Cart',
      'Item added to cart successfully!',
      [
        { text: 'OK', onPress: () => router.push('/(tabs)/two') },
      ]
    );
  };

  const handleRescan = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading item...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <SymbolView
            name={{ ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }}
            tintColor={colors.error}
            size={64}
          />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Item Not Found
          </Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {error || 'The scanned QR code does not match any item in your inventory.'}
          </Text>
          <Button
            title="Rescan"
            onPress={handleRescan}
            variant="accent"
            icon={{ ios: 'barcode', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
          />
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              tintColor={colors.primary}
              size={24}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Scanned Item</Text>
          <TouchableOpacity onPress={handleRescan} style={styles.headerButton}>
            <SymbolView
              name={{ ios: 'barcode', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
              tintColor={colors.primary}
              size={24}
            />
          </TouchableOpacity>
        </View>

        {/* Item Card */}
        <Card style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.itemSku, { color: colors.textSecondary }]}>
                SKU: {item.publicIdentifier}
              </Text>
            </View>
            <StatusChip status={item.status} />
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Category</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{item.category}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Brand</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.product?.brand || 'N/A'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Selling Price</Text>
              <Text style={[styles.sellingPrice, { color: colors.primary }]}>
                ETB {item.sellingPrice.toFixed(2)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Cost Price</Text>
              <Text style={[styles.costPrice, { color: colors.text }]}>
                ETB {item.costPrice.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Registered</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date(item.registeredAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Item ID</Text>
            <Text style={[styles.detailValue, styles.itemId, { color: colors.textSecondary }]}>
              {item.id}
            </Text>
          </View>
        </Card>

        {/* Description Card */}
        {item.product?.description && (
          <Card style={styles.descriptionCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {item.product.description}
            </Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {item.status === 'in_stock' ? (
            <Button
              title="Add to Cart"
              onPress={handleAddToCart}
              variant="accent"
              icon={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }}
            />
          ) : (
            <Button
              title="Item Not Available"
              onPress={() => {}}
              disabled
            />
          )}
          <Button
            title="View Product Details"
            onPress={() => router.push(`/products/${item.product?.id}`)}
            variant="outline"
          />
          <Button
            title="Rescan"
            onPress={handleRescan}
            variant="outline"
            icon={{ ios: 'barcode', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
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
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  itemCard: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemId: {
    fontFamily: 'monospace',
    fontSize: 13,
  },
  priceSection: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 15,
  },
  sellingPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  costPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionCard: {
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
  actions: {
    gap: 12,
    marginTop: 8,
  },
});
