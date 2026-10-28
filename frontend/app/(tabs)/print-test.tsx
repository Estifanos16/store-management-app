import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import { SymbolView } from 'expo-symbols';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card } from '@/src/components/common';
import { PrintPreviewScreen, LabelData, ReceiptData } from '@/src/features/printer';

export default function PrintTestScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [showPreview, setShowPreview] = useState<'labels' | 'receipt' | null>(null);

  // Sample label data
  const sampleLabels: LabelData[] = [
    {
      id: 'ITEM-001',
      name: 'Wireless Headphones',
      price: 4500.00,
      qrCode: 'ITEM-001',
      category: 'Electronics',
      serialNumber: 'WH-2024-001',
    },
    {
      id: 'ITEM-002',
      name: 'USB-C Charging Cable',
      price: 350.00,
      qrCode: 'ITEM-002',
      category: 'Accessories',
      serialNumber: 'UCC-2024-002',
    },
    {
      id: 'ITEM-003',
      name: 'Phone Case - Black',
      price: 550.00,
      qrCode: 'ITEM-003',
      category: 'Accessories',
      serialNumber: 'PC-2024-003',
    },
    {
      id: 'ITEM-004',
      name: 'Portable Power Bank',
      price: 1800.00,
      qrCode: 'ITEM-004',
      category: 'Electronics',
      serialNumber: 'PPB-2024-004',
    },
    {
      id: 'ITEM-005',
      name: 'Screen Protector',
      price: 250.00,
      qrCode: 'ITEM-005',
      category: 'Accessories',
      serialNumber: 'SP-2024-005',
    },
    {
      id: 'ITEM-006',
      name: 'Bluetooth Speaker',
      price: 2500.00,
      qrCode: 'ITEM-006',
      category: 'Electronics',
      serialNumber: 'BS-2024-006',
    },
  ];

  // Sample receipt data
  const sampleReceipt: ReceiptData = {
    receiptNumber: 'RCP-2024-001234',
    date: new Date().toISOString(),
    items: [
      { name: 'Wireless Headphones', quantity: 1, price: 4500.00, total: 4500.00 },
      { name: 'USB-C Charging Cable', quantity: 2, price: 350.00, total: 700.00 },
      { name: 'Phone Case - Black', quantity: 1, price: 550.00, total: 550.00 },
    ],
    subtotal: 5750.00,
    tax: 460.00,
    total: 6210.00,
    paymentMethod: 'Cash',
    shopName: 'My Store',
    shopAddress: '123 Main Street, Addis Ababa',
    shopPhone: '+251 911 123 456',
  };

  if (showPreview) {
    return (
      <PrintPreviewScreen
        type={showPreview}
        data={showPreview === 'labels' ? sampleLabels : sampleReceipt}
        onClose={() => setShowPreview(null)}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>
          Print Module Test
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Test the label and receipt printing functionality
        </Text>

        {/* Label Printing Test */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <SymbolView
              name={{ ios: 'tag', android: 'label', web: 'label' }}
              tintColor={colors.primary}
              size={32}
            />
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                QR Label Printing
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Generate and print QR code stickers for products
              </Text>
            </View>
          </View>
          <Button
            title="Print Sample Labels"
            onPress={() => setShowPreview('labels')}
            variant="accent"
            icon={{ ios: 'printer', android: 'print', web: 'print' }}
          />
        </Card>

        {/* Receipt Printing Test */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <SymbolView
              name={{ ios: 'receipt', android: 'receipt_long', web: 'receipt_long' }}
              tintColor={colors.primary}
              size={32}
            />
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Receipt Printing
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Generate and print transaction receipts
              </Text>
            </View>
          </View>
          <Button
            title="Print Sample Receipt"
            onPress={() => setShowPreview('receipt')}
            variant="accent"
            icon={{ ios: 'printer', android: 'print', web: 'print' }}
          />
        </Card>

        {/* Features Info */}
        <Card style={styles.infoCard}>
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
              Thermal printer support (80mm)
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
          <View style={styles.featureItem}>
            <SymbolView
              name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }}
              tintColor={colors.success}
              size={20}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              A4 sheet layout for labels (3-column grid)
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
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
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
});
