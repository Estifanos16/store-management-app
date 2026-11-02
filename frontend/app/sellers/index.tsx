import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card } from '@/src/components/common';
import { useAuth } from '@/src/contexts/AuthContext';

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'OWNER' | 'SELLER';
  createdAt: string;
}

export default function SellersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { currentShop, isOwner } = useAuth();
  
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOwner) {
      Alert.alert('Access Denied', 'Only owners can manage sellers');
      router.back();
      return;
    }

    // Mock data for now - TODO: Connect to real API
    const mockSellers: Seller[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+251911234567',
        role: 'SELLER',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+251911765432',
        role: 'SELLER',
        createdAt: new Date().toISOString(),
      },
    ];
    setSellers(mockSellers);
    setIsLoading(false);
  }, [isOwner, router]);

  const handleDeleteSeller = (id: string) => {
    Alert.alert(
      'Remove Seller',
      'Are you sure you want to remove this seller from your shop?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSellers(sellers.filter(s => s.id !== id));
            Alert.alert('Success', 'Seller removed successfully');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Sellers</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage shop sellers
          </Text>
        </View>

        <Button
          title="Add Seller"
          onPress={() => {/* TODO: Navigate to add seller screen */}}
          variant="accent"
          icon={{ ios: 'plus', android: 'add', web: 'add' }}
          style={styles.addButton}
        />

        {sellers.map(seller => (
          <Card key={seller.id} style={styles.sellerCard}>
            <View style={styles.sellerContent}>
              <View style={styles.sellerInfo}>
                <View style={styles.sellerHeader}>
                  <Text style={[styles.sellerName, { color: colors.text }]}>{seller.name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.roleText, { color: colors.primary }]}>
                      {seller.role}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.sellerEmail, { color: colors.textSecondary }]}>{seller.email}</Text>
                <Text style={[styles.sellerPhone, { color: colors.textSecondary }]}>{seller.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {/* TODO: Navigate to edit seller */}}
              >
                <SymbolView
                  name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                  tintColor={colors.primary}
                  size={20}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSeller(seller.id)}
              >
                <SymbolView
                  name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                  tintColor={colors.error}
                  size={20}
                />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {sellers.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No sellers yet. Add your first seller to get started.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
  },
  addButton: {
    marginBottom: 20,
  },
  sellerCard: {
    padding: 16,
    marginBottom: 12,
  },
  sellerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sellerEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  sellerPhone: {
    fontSize: 14,
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
  },
});
