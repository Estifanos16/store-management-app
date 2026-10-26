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
import { productsApi } from '../../../services/api/productsApi';
import { Product } from '../types/product';
import { useMockProducts } from '../mockData';
import Colors from '../../../../constants/Colors';
import { useColorScheme } from '../../../../components/useColorScheme';
import { User } from '../../../types/auth';

interface ProductsListScreenProps {
  user: User | null;
}

export default function ProductsListScreen({ user }: ProductsListScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();
  const colorScheme = useColorScheme();

  const canAddProduct = user?.role === 'owner';

  // Extract unique categories from products
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter((c): c is string => Boolean(c))))];

  useEffect(() => {
    loadProducts();
  }, [useMock]);

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
      const mockData = useMockProducts(useMock);
      
      if (mockData) {
        setProducts(mockData.data);
        setIsLoading(false);
        return;
      }

      const data = await productsApi.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      // Fallback to mock data on error
      const mockData = useMockProducts(true);
      if (mockData) {
        setProducts(mockData.data);
        setUseMock(true);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadProducts();
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push({ pathname: '/modal', params: { productId: item.id } })}
    >
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: Colors[colorScheme].text }]}>{item.name}</Text>
        <Text style={[styles.productCategory, { color: Colors[colorScheme].text, opacity: 0.7 }]}>
          {item.category || 'Uncategorized'}
        </Text>
        <View style={styles.productDetails}>
          <Text style={[styles.productPrice, { color: Colors[colorScheme].primary }]}>
            ETB {item.price.toFixed(2)}
          </Text>
          <Text style={[styles.productStock, { color: Colors[colorScheme].text, opacity: 0.7 }]}>
            Stock: {item.stock}
          </Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.active ? Colors[colorScheme].success : Colors[colorScheme].neutral }]}>
        <Text style={styles.statusText}>{item.active ? 'Active' : 'Inactive'}</Text>
      </View>
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

  return (
    <View style={styles.container}>
      {useMock && (
        <View style={styles.mockBadge}>
          <Text style={styles.mockBadgeText}>MOCK DATA</Text>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        {canAddProduct && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push({ pathname: '/modal', params: { mode: 'add' } })}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        )}
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

      {error && !useMock && (
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
