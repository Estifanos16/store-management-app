import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { productsApi } from '../../../services/api/productsApi';
import { Product } from '../types/product';
import Colors from '../../../../constants/Colors';
import { useColorScheme } from '../../../../components/useColorScheme';
import { User } from '../../../types/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { LabelData } from '@/src/features/printer/types';
import { PrintPreviewScreen } from '@/src/features/printer';

interface ProductsListScreenProps {
  user: User | null;
}

export default function ProductsListScreen({ user }: ProductsListScreenProps) {
  const { currentShop } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const canAddProduct = user?.role === 'owner';

  // Extract unique categories from products
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter((c): c is string => Boolean(c))))];

  useEffect(() => {
    loadProducts();
  }, [currentShop]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const filterProducts = () => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p => 
          p.name.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const loadProducts = async () => {
    try {
      setError(null);

      console.log('loadProducts called - currentShop:', currentShop);

      // Load from API when shop is available
      if (currentShop) {
        console.log('Loading products from API for shop:', currentShop.id);
        const data = await productsApi.getProducts({ shopId: currentShop.id });
        console.log('Products loaded from API:', data);
        setProducts(data);
      } else {
        setError('No shop selected');
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadProducts();
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedProducts(new Set());
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

  const handlePrintLabels = () => {
    const selectedProductsData = products.filter(p => selectedProducts.has(p.id));
    if (selectedProductsData.length === 0) return;

    const labelData: LabelData[] = selectedProductsData.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.defaultSellingPrice),
      qrCode: product.id,
      category: product.category,
      serialNumber: product.id,
    }));

    setShowPrintPreview(true);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        selectedProducts.has(item.id) && { borderColor: Colors[colorScheme].primary, borderWidth: 2 },
      ]}
      onPress={() => {
        if (selectionMode) {
          toggleProductSelection(item.id);
        } else {
          router.push(`/products/${item.id}`);
        }
      }}
      onLongPress={() => {
        if (!selectionMode) {
          setSelectionMode(true);
          toggleProductSelection(item.id);
        }
      }}
    >
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: Colors[colorScheme].text }]}>{item.name}</Text>
        <Text style={[styles.productCategory, { color: Colors[colorScheme].text, opacity: 0.7 }]}>
          {item.category || 'Uncategorized'}
        </Text>
        <View style={styles.productDetails}>
          <Text style={[styles.productPrice, { color: Colors[colorScheme].primary }]}>
            ETB {item.defaultSellingPrice}
          </Text>
        </View>
      </View>
      {selectionMode ? (
        <View style={[styles.checkbox, selectedProducts.has(item.id) && { backgroundColor: Colors[colorScheme].primary }]}>
          {selectedProducts.has(item.id) && (
            <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor="#FFFFFF" size={16} />
          )}
        </View>
      ) : (
        <View style={[styles.statusBadge, { backgroundColor: !item.archived ? Colors[colorScheme].success : Colors[colorScheme].neutral }]}>
          <Text style={styles.statusText}>{!item.archived ? 'Active' : 'Archived'}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
    addButton: {
      backgroundColor: Colors[colorScheme].primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    itemsButton: {
      backgroundColor: Colors[colorScheme].accent,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    itemsButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
    },
    searchContainer: {
      padding: 16,
      backgroundColor: Colors[colorScheme].background,
    },
    searchInput: {
      backgroundColor: Colors[colorScheme].card,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: Colors[colorScheme].text,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    categoryFilterContainer: {
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    categoryScrollView: {
      flexDirection: 'row',
      gap: 8,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].card,
    },
    categoryChipActive: {
      backgroundColor: Colors[colorScheme].primary,
      borderColor: Colors[colorScheme].primary,
    },
    categoryChipText: {
      fontSize: 14,
      color: Colors[colorScheme].text,
      fontWeight: '500',
    },
    categoryChipTextActive: {
      color: '#fff',
    },
    productCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      backgroundColor: Colors[colorScheme].card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    productCategory: {
      fontSize: 14,
      marginBottom: 8,
    },
    productDetails: {
      flexDirection: 'row',
      gap: 16,
    },
    productPrice: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    productStock: {
      fontSize: 14,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusText: {
      color: '#fff',
      fontSize: 12,
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
    retryButton: {
      backgroundColor: Colors[colorScheme].primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      opacity: 0.7,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#E2E8F0',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }

  if (showPrintPreview) {
    const selectedProductsData = products.filter(p => selectedProducts.has(p.id));
    const labelData: LabelData[] = selectedProductsData.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.defaultSellingPrice),
      qrCode: product.id,
      category: product.category,
      serialNumber: product.id,
    }));

    return (
      <PrintPreviewScreen
        type="labels"
        data={labelData}
        onClose={() => {
          setShowPrintPreview(false);
          setSelectionMode(false);
          setSelectedProducts(new Set());
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {selectionMode ? `Selected (${selectedProducts.size})` : 'Products'}
        </Text>
        <View style={styles.headerButtons}>
          {selectionMode ? (
            <>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: Colors[colorScheme].card }]}
                onPress={toggleSelectionMode}
              >
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={Colors[colorScheme].text} size={20} />
              </TouchableOpacity>
              {selectedProducts.size > 0 && (
                <TouchableOpacity
                  style={[styles.headerButton, { backgroundColor: Colors[colorScheme].primary }]}
                  onPress={handlePrintLabels}
                >
                  <SymbolView name={{ ios: 'printer', android: 'print', web: 'print' }} tintColor="#FFFFFF" size={20} />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: Colors[colorScheme].card }]}
                onPress={toggleSelectionMode}
              >
                <SymbolView name={{ ios: 'checkmark.square', android: 'check_box', web: 'check_box' }} tintColor={Colors[colorScheme].text} size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.itemsButton}
                onPress={() => router.push('/items')}
              >
                <Text style={styles.itemsButtonText}>Items</Text>
              </TouchableOpacity>
              {canAddProduct && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => router.push('/products/new')}
                >
                  <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors[colorScheme].textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoryFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category === 'all' ? 'All' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadProducts()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredProducts.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery || selectedCategory !== 'all' ? 'No products match your filters' : 'No products found'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Colors[colorScheme].primary}
            />
          }
        />
      )}
    </View>
  );
}
