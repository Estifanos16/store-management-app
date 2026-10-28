import * as Print from 'expo-print';
import { Platform } from 'react-native';

import { LabelData, ReceiptData, PrintOptions } from './types';

/**
 * Format price in Ethiopian Birr (ETB)
 */
export const formatPrice = (price: number): string => {
  return `ETB ${price.toFixed(2)}`;
};

/**
 * Generate QR code as SVG string for HTML embedding
 */
const generateQRCodeSVG = (data: string, size: number = 60): string => {
  // Using a QR code API for HTML embedding since react-native-qrcode-svg is for React Native
  // This works for web/mobile print HTML
  // Default size reduced to 60px for smaller QR codes
  const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
  return apiUrl;
};

/**
 * Generate HTML for a single QR label sticker
 */
const generateLabelHTML = (label: LabelData): string => {
  const qrUrl = generateQRCodeSVG(label.qrCode, 60);
  
  return `
    <div style="
      width: 150px;
      height: 180px;
      border: 2px solid #E2E8F0;
      border-radius: 6px;
      padding: 8px;
      text-align: center;
      font-family: Arial, sans-serif;
      background: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
    ">
      <div style="width: 100%; text-align: left;">
        <div style="
          font-size: 8px;
          color: #64748B;
          font-weight: 600;
          margin-bottom: 1px;
        ">${label.category || 'PRODUCT'}</div>
        <div style="
          font-size: 11px;
          color: #0F172A;
          font-weight: 700;
          line-height: 1.1;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        ">${label.name}</div>
      </div>
      
      <img 
        src="${qrUrl}" 
        style="width: 60px; height: 60px; margin: 4px 0;"
        alt="QR Code"
      />
      
      <div style="width: 100%;">
        <div style="
          font-size: 12px;
          color: #0F766E;
          font-weight: 700;
          margin-bottom: 1px;
        ">${formatPrice(label.price)}</div>
        <div style="
          font-size: 7px;
          color: #64748B;
          font-family: monospace;
        ">ID: ${label.id}</div>
        ${label.serialNumber ? `
          <div style="
            font-size: 7px;
            color: #64748B;
            font-family: monospace;
          ">SN: ${label.serialNumber}</div>
        ` : ''}
      </div>
    </div>
  `;
};

/**
 * Generate HTML for a sheet of QR labels (multiple labels per page)
 */
const generateLabelSheetHTML = (labels: LabelData[]): string => {
  const labelsHTML = labels.map(label => generateLabelHTML(label)).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>QR Labels</title>
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        .sheet {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 6px;
          padding: 6px;
        }
        @media print {
          .sheet {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        ${labelsHTML}
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate HTML for a transaction receipt
 */
const generateReceiptHTML = (receipt: ReceiptData): string => {
  const itemsHTML = receipt.items.map(item => `
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 6px 0; font-size: 11px; color: #0F172A;">
        ${item.name} x${item.quantity}
      </td>
      <td style="padding: 6px 0; font-size: 11px; color: #0F172A; text-align: right;">
        ${formatPrice(item.total)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Receipt</title>
      <style>
        @page {
          size: 58mm auto;
          margin: 5mm;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: 'Courier New', monospace;
          background: white;
        }
        .receipt {
          width: 58mm;
          margin: 0 auto;
          padding: 8px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #0F766E;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .shop-name {
          font-size: 14px;
          font-weight: bold;
          color: #0F766E;
          margin-bottom: 4px;
          line-height: 1.2;
        }
        .shop-info {
          font-size: 10px;
          color: #64748B;
          margin-bottom: 2px;
          line-height: 1.2;
        }
        .receipt-number {
          font-size: 10px;
          text-align: center;
          margin: 8px 0;
          color: #0F172A;
          line-height: 1.3;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
        }
        .summary {
          border-top: 2px dashed #E2E8F0;
          padding-top: 8px;
          margin-top: 8px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin-bottom: 4px;
          color: #0F172A;
          line-height: 1.3;
        }
        .total-row {
          font-size: 13px;
          font-weight: bold;
          color: #0F766E;
          border-top: 2px solid #0F766E;
          padding-top: 6px;
          margin-top: 6px;
        }
        .footer {
          text-align: center;
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #E2E8F0;
        }
        .footer-text {
          font-size: 9px;
          color: #64748B;
          line-height: 1.3;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="shop-name">${receipt.shopName}</div>
          ${receipt.shopAddress ? `<div class="shop-info">${receipt.shopAddress}</div>` : ''}
          ${receipt.shopPhone ? `<div class="shop-info">Tel: ${receipt.shopPhone}</div>` : ''}
        </div>
        
        <div class="receipt-number">
          Receipt #: ${receipt.receiptNumber}<br/>
          Date: ${new Date(receipt.date).toLocaleString()}
        </div>
        
        <table class="table">
          ${itemsHTML}
        </table>
        
        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>${formatPrice(receipt.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>Tax (8%):</span>
            <span>${formatPrice(receipt.tax)}</span>
          </div>
          <div class="summary-row total-row">
            <span>TOTAL:</span>
            <span>${formatPrice(receipt.total)}</span>
          </div>
          <div class="summary-row" style="margin-top: 6px;">
            <span>Payment:</span>
            <span>${receipt.paymentMethod}</span>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">Thank you for your purchase!</div>
          <div class="footer-text">${new Date().getFullYear()} ${receipt.shopName}</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Print QR labels
 */
export const printLabels = async (
  labels: LabelData[],
  options?: PrintOptions
): Promise<void> => {
  try {
    const html = generateLabelSheetHTML(labels);
    
    await Print.printAsync({
      html,
      printerUrl: options?.printerUrl,
      orientation: options?.orientation || 'portrait',
    });
    
    // On mobile, this will show the print dialog
    // On web, it will trigger the browser print
    console.log('Print initiated');
  } catch (error) {
    console.error('Print error:', error);
    throw new Error('Failed to print labels');
  }
};

/**
 * Print receipt
 */
export const printReceipt = async (
  receipt: ReceiptData,
  options?: PrintOptions
): Promise<void> => {
  try {
    const html = generateReceiptHTML(receipt);
    
    await Print.printAsync({
      html,
      printerUrl: options?.printerUrl,
      orientation: options?.orientation || 'portrait',
    });
    
    console.log('Print initiated');
  } catch (error) {
    console.error('Print error:', error);
    throw new Error('Failed to print receipt');
  }
};

/**
 * Generate and preview PDF for labels (saves to file)
 */
export const generateLabelPDF = async (
  labels: LabelData[]
): Promise<string> => {
  try {
    const html = generateLabelSheetHTML(labels);
    const result = await Print.printToFileAsync({ html });
    return result.uri;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate label PDF');
  }
};

/**
 * Generate and preview PDF for receipt (saves to file)
 */
export const generateReceiptPDF = async (
  receipt: ReceiptData
): Promise<string> => {
  try {
    const html = generateReceiptHTML(receipt);
    const result = await Print.printToFileAsync({ html });
    return result.uri;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate receipt PDF');
  }
};

/**
 * Share/print PDF file
 */
export const sharePDF = async (uri: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // On web, download the file
      const link = document.createElement('a');
      link.href = uri;
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // On mobile, just return the URI - the caller can handle sharing
      console.log('PDF generated at:', uri);
      // Note: Without expo-sharing, users can use the file directly
      // or implement custom sharing logic
    }
  } catch (error) {
    console.error('Share error:', error);
    throw new Error('Failed to share PDF');
  }
};
