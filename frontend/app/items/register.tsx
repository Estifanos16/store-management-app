import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { itemsApi } from '@/src/services/api/itemsApi';
import { productsApi } from '@/src/services/api/productsApi';
import { useAuth } from '@/src/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card } from '@/src/components/common';

export default function ItemRegistrationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { currentShop } = useAuth();

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const loadProducts = async () => {
    if (!currentShop) return;
    try {
      const data = await productsApi.getProducts();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  React.useEffect(() => {
    loadProducts();
  }, [currentShop]);

  const handleRegister = async () => {
    if (!currentShop) {
      Alert.alert('Error', 'No shop selected');
      return;
    }

    if (!productId || !quantity || !costPrice) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const qty = parseInt(quantity);
    if (qty < 1 || qty > 1000) {
      Alert.alert('Error', 'Quantity must be between 1 and 1000');
      return;
    }

    setIsLoading(true);
    try {
      const result = await itemsApi.createItems({
        shopId: currentShop.id,
        productId,
        quantity: qty,
        costPrice: parseFloat(costPrice),
        sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
      });

      Alert.alert('Success', `Successfully registered ${result.count} items`, [
        {
          text: 'OK',
          onPress: () => {
            setProductId('');
            setQuantity('1');
            setCostPrice('');
            setSellingPrice('');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to register items');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === productId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Register Items</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Add physical inventory items to your shop
        </Text>

        <Card style={styles.formCard}>
          <Text style={[styles.label, { color: colors.text }]}>Product</Text>
          {selectedProduct ? (
            <TouchableOpacity
              style={[styles.selectedProduct, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}
              onPress={() => setProductId('')}
            >
              <Text style={[styles.selectedProductName, { color: colors.text }]}>
                {selectedProduct.name}
              </Text>
              <Text style={[styles.selectedProductBrand, { color: colors.textSecondary }]}>
                {selectedProduct.brand || 'No brand'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.productsList}>
              {products.length === 0 ? (
                <Text style={[styles.noProductsText, { color: colors.textSecondary }]}>
                  No products available. Create products first.
                </Text>
              ) : (
                products.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={[styles.productItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => setProductId(product.id)}
                  >
                    <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                    <Text style={[styles.productBrand, { color: colors.textSecondary }]}>
                      {product.brand || 'No brand'}
                    </Text>
                    <Text style={[styles.productPrice, { color: colors.primary }]}>
                      ETB {product.defaultSellingPrice}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          <Text style={[styles.label, { color: colors.text }]}>Quantity</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Number of items (1-1000)"
            placeholderTextColor={colors.textSecondary}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />

          <Text style={[styles.label, { color: colors.text }]}>Cost Price</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Cost per item"
            placeholderTextColor={colors.textSecondary}
            value={costPrice}
            onChangeText={setCostPrice}
            keyboardType="decimal-pad"
          />

          <Text style={[styles.label, { color: colors.text }]}>Selling Price (Optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Override default selling price"
            placeholderTextColor={colors.textSecondary}
            value={sellingPrice}
            onChangeText={setSellingPrice}
            keyboardType="decimal-pad"
          />

          <Button
            title="Register Items"
            onPress={handleRegister}
            disabled={isLoading || !productId}
            icon={{ ios: 'plus.circle', android: 'add_circle', web: 'add_circle' }}
          />
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
  formCard: {
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  selectedProduct: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  selectedProductName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectedProductBrand: {
    fontSize: 14,
  },
  productsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  noProductsText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  productItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
});
