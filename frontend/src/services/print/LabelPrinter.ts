import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Item } from '../../database/repositories/ItemRepository';

export interface LabelConfig {
  labelWidth: number; // in mm
  labelHeight: number; // in mm
  columns: number;
  rows: number;
  margin: number; // in mm
}

export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  labelWidth: 30,
  labelHeight: 20,
  columns: 8,
  rows: 6,
  margin: 5,
};

export class LabelPrinter {
  private isPrinting: boolean = false;

  async generateLabelHtml(items: Item[], config: LabelConfig = DEFAULT_LABEL_CONFIG): Promise<string> {
    const labelsHtml = items.map(item => this.createLabelHtml(item)).join('');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page {
              size: A4;
              margin: ${config.margin}mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .labels-container {
              display: grid;
              grid-template-columns: repeat(${config.columns}, ${config.labelWidth}mm);
              grid-template-rows: repeat(${config.rows}, ${config.labelHeight}mm);
              gap: 2mm;
            }
            .label {
              border: 1px solid #000;
              padding: 1.5mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              page-break-inside: avoid;
              box-sizing: border-box;
            }
            .label-header {
              font-size: 6pt;
              font-weight: bold;
              margin-bottom: 0.5mm;
              text-align: center;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              width: 100%;
            }
            .label-qr {
              flex: 1;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 0.5mm 0;
            }
            .label-qr img {
              width: 12mm;
              height: 12mm;
            }
            .label-price {
              font-size: 7pt;
              font-weight: bold;
              text-align: center;
              margin-top: 0.5mm;
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
            ${labelsHtml}
          </div>
        </body>
      </html>
    `;
  }

  private createLabelHtml(item: Item): string {
    // For QR code, we'll use a QR code API for the preview
    // In production, you'd generate the QR code locally using react-native-qrcode-svg
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(item.uniqueQrCode)}`;

    // Extract product name - use a shortened version if too long
    const productName = item.product?.name || 'Item';
    const displayName = productName.length > 15 ? productName.substring(0, 15) + '...' : productName;

    return `
      <div class="label">
        <div class="label-header">${displayName}</div>
        <div class="label-qr">
          <img src="${qrCodeUrl}" alt="QR Code" />
        </div>
        <div class="label-price">${parseFloat(item.sellingPrice).toFixed(0)}</div>
      </div>
    `;
  }

  async printLabels(items: Item[], config?: LabelConfig): Promise<void> {
    if (this.isPrinting) {
      throw new Error('Another print request is already in progress. Please wait for the current print to complete.');
    }

    this.isPrinting = true;

    try {
      const html = await this.generateLabelHtml(items, config);

      // Use printToFileAsync to avoid expo-print's internal state issue
      const { uri } = await Print.printToFileAsync({ html });

      // On web, download the file
      if (Platform.OS === 'web') {
        // @ts-ignore - document exists on web
        const link = document.createElement('a');
        link.href = uri;
        link.download = 'qr-labels.pdf';
        // @ts-ignore
        document.body.appendChild(link);
        link.click();
        // @ts-ignore
        document.body.removeChild(link);
      } else {
        // On mobile, the PDF is saved to expo-print's default location
        console.log('PDF saved to:', uri);
        console.log('');
        console.log('To access the PDF:');
        console.log('Option 1 (Recommended): Use a development build for full sharing support');
        console.log('  Run: npx expo run:android');
        console.log('');
        console.log('Option 2: Use a file manager app to access:');
        console.log('  Android/data/host.exp.exponent/cache/Print/');
        console.log('  Recommended file managers: FX File Explorer, MT Manager');

        // Try to share the PDF
        try {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Share PDF Labels',
          });
        } catch (shareError) {
          // On Expo Go, sharing is restricted due to file permissions
          console.log('');
          console.log('Note: Direct sharing is restricted in Expo Go.');
          console.log('The PDF is saved and can be accessed via file manager as shown above.');
          // Don't throw an error - the PDF was saved successfully
        }
      }
    } catch (error) {
      console.error('Print failed:', error);
      throw error;
    } finally {
      this.isPrinting = false;
    }
  }

  async shareLabels(items: Item[], config?: LabelConfig): Promise<void> {
    // Sharing requires expo-sharing which may not be installed
    // For now, just use print
    await this.printLabels(items, config);
  }

  async generatePreview(items: Item[], config?: LabelConfig): Promise<string> {
    return await this.generateLabelHtml(items, config);
  }
}

export const labelPrinter = new LabelPrinter();
