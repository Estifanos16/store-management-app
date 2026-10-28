import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card } from '@/src/components/common';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function SalesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: '1', name: 'Wireless Mouse', price: 25.00, quantity: 2 },
    { id: '2', name: 'USB-C Cable', price: 15.00, quantity: 1 },
    { id: '3', name: 'Keyboard', price: 45.00, quantity: 1 },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to your cart before checkout.');
      return;
    }
    Alert.alert(
      'Confirm Checkout',
      `Total: $${total.toFixed(2)}\n\nProceed with payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Checkout',
          style: 'default',
          onPress: () => {
            Alert.alert('Success', 'Payment processed successfully!');
            setCartItems([]);
          },
        },
      ]
    );
  };

  const handleScan = () => {
    router.push('/scanner');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sales</Text>
        <Button
          title="Scan"
          onPress={handleScan}
          variant="accent"
          icon={{ ios: 'barcode', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
          style={styles.headerButton}
        />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SymbolView
            name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }}
            tintColor={colors.textSecondary}
            size={64}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Cart is Empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Scan products to add them to your cart
          </Text>
          <Button
            title="Start Scanning"
            onPress={handleScan}
            variant="accent"
            icon={{ ios: 'barcode', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
          />
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {cartItems.map(item => (
              <Card key={item.id} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
                    ${item.price.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.border }]}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <SymbolView
                      name={{ ios: 'minus', android: 'remove', web: 'remove' }}
                      tintColor={colors.text}
                      size={18}
                    />
                  </TouchableOpacity>
                  <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <SymbolView
                      name={{ ios: 'plus', android: 'add', web: 'add' }}
                      tintColor="#FFFFFF"
                      size={18}
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeItem(item.id)}
                >
                  <SymbolView
                    name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                    tintColor={colors.error}
                    size={20}
                  />
                </TouchableOpacity>
              </Card>
            ))}
          </ScrollView>

          {/* Footer Summary */}
          <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tax (8%)</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>${tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>${total.toFixed(2)}</Text>
            </View>
            <Button
              title="Checkout"
              onPress={handleCheckout}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
  },
});
