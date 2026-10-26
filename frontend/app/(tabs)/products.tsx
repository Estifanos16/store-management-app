import React from 'react';
import { View } from 'react-native';
import ProductsListScreen from '../../src/features/products/screens/ProductsListScreen';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ProductsTab() {
  const { user } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      <ProductsListScreen user={user} />
    </View>
  );
}
