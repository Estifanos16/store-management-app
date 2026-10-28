import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { SymbolView } from 'expo-symbols';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card } from '@/src/components/common';
import { LabelData, ReceiptData } from './types';
import {
  printLabels,
  printReceipt,
  generateLabelPDF,
  generateReceiptPDF,
  sharePDF,
} from './printService';

interface PrintPreviewScreenProps {
  type: 'labels' | 'receipt';
  data: LabelData[] | ReceiptData;
  onClose?: () => void;
}

export function PrintPreviewScreen({ type, data, onClose }: PrintPreviewScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      
      if (type === 'labels') {
        await printLabels(data as LabelData[]);
      } else {
        await printReceipt(data as ReceiptData);
      }
      
      Alert.alert('Success', 'Print job sent successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to print. Please try again.');
      console.error('Print error:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      
      let uri: string;
      if (type === 'labels') {
        uri = await generateLabelPDF(data as LabelData[]);
      } else {
        uri = await generateReceiptPDF(data as ReceiptData);
      }
      
      await sharePDF(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
      console.error('PDF error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getPreviewContent = () => {
    if (type === 'labels') {
      const labels = data as LabelData[];
      return (
        <View style={styles.previewGrid}>
          {labels.slice(0, 6).map((label, index) => (
            <Card key={label.id || index} style={styles.labelPreview}>
              <View style={styles.labelHeader}>
                <Text style={[styles.labelCategory, { color: colors.textSecondary }]}>
                  {label.category || 'PRODUCT'}
                </Text>
              </View>
              <Text style={[styles.labelName, { color: colors.text }]} numberOfLines={2}>
                {label.name}
              </Text>
              <View style={styles.qrPlaceholder}>
                <SymbolView
                  name={{ ios: 'qrcode', android: 'qr_code', web: 'qr_code' }}
                  tintColor={colors.primary}
                  size={60}
                />
              </View>
              <Text style={[styles.labelPrice, { color: colors.primary }]}>
                {label.price.toFixed(2)} ETB
              </Text>
              <Text style={[styles.labelId, { color: colors.textSecondary }]}>
                ID: {label.id}
              </Text>
            </Card>
          ))}
          {labels.length > 6 && (
            <Text style={[styles.moreText, { color: colors.textSecondary }]}>
              +{labels.length - 6} more labels
            </Text>
          )}
        </View>
      );
    } else {
      const receipt = data as ReceiptData;
      return (
        <Card style={styles.receiptPreview}>
          <View style={styles.receiptHeader}>
            <Text style={[styles.receiptShopName, { color: colors.primary }]}>
              {receipt.shopName}
            </Text>
            {receipt.shopAddress && (
              <Text style={[styles.receiptInfo, { color: colors.textSecondary }]}>
                {receipt.shopAddress}
              </Text>
            )}
            {receipt.shopPhone && (
              <Text style={[styles.receiptInfo, { color: colors.textSecondary }]}>
                Tel: {receipt.shopPhone}
              </Text>
            )}
          </View>
          
          <View style={styles.receiptMeta}>
            <Text style={[styles.receiptMetaText, { color: colors.text }]}>
              Receipt #: {receipt.receiptNumber}
            </Text>
            <Text style={[styles.receiptMetaText, { color: colors.text }]}>
              {new Date(receipt.date).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          {receipt.items.map((item, index) => (
            <View key={index} style={styles.receiptItem}>
              <Text style={[styles.receiptItemName, { color: colors.text }]}>
                {item.name} x{item.quantity}
              </Text>
              <Text style={[styles.receiptItemPrice, { color: colors.text }]}>
                {item.total.toFixed(2)} ETB
              </Text>
            </View>
          ))}
          
          <View style={styles.divider} />
          
          <View style={styles.receiptSummary}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {receipt.subtotal.toFixed(2)} ETB
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tax (8%)</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {receipt.tax.toFixed(2)} ETB
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: colors.primary }]}>TOTAL</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {receipt.total.toFixed(2)} ETB
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Payment</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {receipt.paymentMethod}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={[styles.receiptFooter, { color: colors.textSecondary }]}>
            Thank you for your purchase!
          </Text>
        </Card>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {type === 'labels' ? 'Print Labels' : 'Print Receipt'}
        </Text>
        {onClose && (
          <Button
            title="Close"
            onPress={onClose}
            variant="outline"
            style={styles.closeButton}
          />
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Preview */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preview</Text>
        {getPreviewContent()}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={isPrinting ? 'Printing...' : 'Print Now'}
            onPress={handlePrint}
            disabled={isPrinting || isGenerating}
            icon={{ ios: 'printer', android: 'print', web: 'print' }}
          />
          <Button
            title={isGenerating ? 'Generating...' : 'Generate PDF'}
            onPress={handleGeneratePDF}
            variant="outline"
            disabled={isPrinting || isGenerating}
            icon={{ ios: 'doc', android: 'description', web: 'description' }}
          />
        </View>

        {/* Info */}
        <Card style={styles.infoCard}>
          <SymbolView
            name={{ ios: 'info.circle', android: 'info', web: 'info' }}
            tintColor={colors.primary}
            size={24}
            style={styles.infoIcon}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {type === 'labels'
              ? 'Labels will be printed in a 3-column grid layout suitable for A4 sheets or thermal printers.'
              : 'Receipt is formatted for 80mm thermal printers. For standard printers, it will be centered on the page.'}
          </Text>
        </Card>
      </ScrollView>
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
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  labelPreview: {
    width: '48%',
    margin: '1%',
    padding: 12,
    alignItems: 'center',
  },
  labelHeader: {
    width: '100%',
    marginBottom: 8,
  },
  labelCategory: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'left',
  },
  labelName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    minHeight: 36,
  },
  qrPlaceholder: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  labelId: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  moreText: {
    width: '100%',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  receiptPreview: {
    padding: 20,
    marginBottom: 24,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptShopName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  receiptInfo: {
    fontSize: 12,
    marginBottom: 2,
  },
  receiptMeta: {
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptMetaText: {
    fontSize: 11,
    marginBottom: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptItemName: {
    fontSize: 12,
    flex: 1,
  },
  receiptItemPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  receiptSummary: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#0F766E',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  receiptFooter: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 12,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
