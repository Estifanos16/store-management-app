import { StyleSheet, View, Text, ScrollView, Alert, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card } from '@/src/components/common';
import { PrintPreviewScreen, LabelData, ReceiptData } from '@/src/features/printer';
import { labelPrinter } from '@/src/services/print/LabelPrinter';
import { Item } from '@/src/database/repositories/ItemRepository';
import { productsApi } from '@/src/services/api/productsApi';
import { useAuth } from '@/src/contexts/AuthContext';
import { Product } from '@/src/features/products/types/product';

export default function PrintTestScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const params = useLocalSearchParams();
  const { currentShop } = useAuth();
  const [showPreview, setShowPreview] = useState<'labels' | 'receipt' | null>(null);
  const [customLabels, setCustomLabels] = useState<LabelData[] | null>(null);
  const [printType, setPrintType] = useState<'labels' | 'receipt' | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (params.showPreview === 'labels' && params.data) {
      try {
        const parsedData = JSON.parse(params.data as string);
        setCustomLabels(parsedData);
        setShowPreview('labels');
      } catch (error) {
        console.error('Failed to parse label data:', error);
      }
    }
  }, [params]);

  const loadProducts = async () => {
    if (!currentShop) return;
    try {
      setIsLoading(true);
      const data = await productsApi.getProducts({ shopId: currentShop.id });
      setProducts(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintLabels = () => {
    setPrintType('labels');
    loadProducts();
  };

  const handlePrintReceipt = () => {
    setPrintType('receipt');
    loadProducts();
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleProceedToPreview = () => {
    const selectedProductsData = products.filter(p => selectedProducts.has(p.id));
    if (selectedProductsData.length === 0) {
      Alert.alert('No Selection', 'Please select at least one product');
      return;
    }

    if (printType === 'labels') {
      const labelData: LabelData[] = selectedProductsData.map(product => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.defaultSellingPrice),
        qrCode: product.id,
        category: product.category,
        serialNumber: product.id,
      }));
      setCustomLabels(labelData);
      setShowPreview('labels');
    } else if (printType === 'receipt') {
      const receiptData: ReceiptData = {
        receiptNumber: `RCP-${Date.now()}`,
        date: new Date().toISOString(),
        items: selectedProductsData.map(p => ({
          name: p.name,
          quantity: 1,
          price: parseFloat(p.defaultSellingPrice),
          total: parseFloat(p.defaultSellingPrice),
        })),
        subtotal: selectedProductsData.reduce((sum, p) => sum + parseFloat(p.defaultSellingPrice), 0),
        tax: 0,
        total: selectedProductsData.reduce((sum, p) => sum + parseFloat(p.defaultSellingPrice), 0),
        paymentMethod: 'Cash',
        shopName: currentShop?.name || 'My Shop',
      };
      setCustomLabels(receiptData as any);
      setShowPreview('receipt');
    }
  };

  const handleBack = () => {
    setPrintType(null);
    setSelectedProducts(new Set());
    setProducts([]);
  };

  // Show preview
  if (showPreview && customLabels) {
    return (
      <PrintPreviewScreen
        type={showPreview}
        data={customLabels}
        onClose={() => {
          setShowPreview(null);
          setCustomLabels(null);
          setPrintType(null);
          setSelectedProducts(new Set());
        }}
      />
    );
  }

  // Show product selection
  if (printType) {
    const filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {printType === 'labels' ? 'Select Products for Labels' : 'Select Products for Receipt'}
          </Text>
          <TouchableOpacity onPress={handleBack}>
            <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={colors.text} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Search products..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {filteredProducts.map(product => (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedProducts.has(product.id) && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => toggleProductSelection(product.id)}
              >
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                  <Text style={[styles.productPrice, { color: colors.primary }]}>
                    ETB {product.defaultSellingPrice}
                  </Text>
                </View>
                <View style={[styles.checkbox, selectedProducts.has(product.id) && { backgroundColor: colors.primary }]}>
                  {selectedProducts.has(product.id) && (
                    <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor="#FFFFFF" size={16} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Text style={[styles.selectedCount, { color: colors.textSecondary }]}>
            {selectedProducts.size} selected
          </Text>
          <Button
            title="Print"
            onPress={handleProceedToPreview}
            disabled={selectedProducts.size === 0}
            icon={{ ios: 'printer', android: 'print', web: 'print' }}
          />
        </View>
      </View>
    );
  }

  // Show main print menu
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>
          Print Module
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Generate and print QR code labels and receipts
        </Text>

        <Card style={[styles.actionCard, { backgroundColor: colors.card }]}>
          <View style={styles.actionContent}>
            <SymbolView
              name={{ ios: 'tag', android: 'label', web: 'label' }}
              tintColor={colors.primary}
              size={48}
            />
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Print QR Code Labels</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                Generate QR code stickers for products
              </Text>
            </View>
          </View>
          <Button
            title="Print Labels"
            onPress={handlePrintLabels}
            variant="accent"
            icon={{ ios: 'printer', android: 'print', web: 'print' }}
          />
        </Card>

        <Card style={[styles.actionCard, { backgroundColor: colors.card }]}>
          <View style={styles.actionContent}>
            <SymbolView
              name={{ ios: 'receipt', android: 'receipt_long', web: 'receipt_long' }}
              tintColor={colors.primary}
              size={48}
            />
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Print Receipt</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                Generate transaction receipts
              </Text>
            </View>
          </View>
          <Button
            title="Print Receipt"
            onPress={handlePrintReceipt}
            variant="accent"
            icon={{ ios: 'printer', android: 'print', web: 'print' }}
          />
        </Card>

        <Card style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Features</Text>
          <View style={styles.featureItem}>
            <SymbolView
              name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }}
              tintColor={colors.success}
              size={20}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              QR code labels with product info
            </Text>
          </View>
          <View style={styles.featureItem}>
            <SymbolView
              name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }}
              tintColor={colors.success}
              size={20}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Ethiopian Birr (ETB) currency formatting
            </Text>
          </View>
          <View style={styles.featureItem}>
            <SymbolView
              name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }}
              tintColor={colors.success}
              size={20}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              A4 sheet layout (8 columns x 6 rows)
            </Text>
          </View>
          <View style={styles.featureItem}>
            <SymbolView
              name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }}
              tintColor={colors.success}
              size={20}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              PDF generation and sharing
            </Text>
          </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  actionCard: {
    marginBottom: 16,
    padding: 20,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionText: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  infoCard: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  selectedCount: {
    fontSize: 14,
  },
});
