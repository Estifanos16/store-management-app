import * as Print from 'expo-print';
import { Item } from '../../database/repositories/ItemRepository';

export interface LabelConfig {
  labelWidth: number; // in mm
  labelHeight: number; // in mm
  columns: number;
  rows: number;
  margin: number; // in mm
}

export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  labelWidth: 50,
  labelHeight: 25,
  columns: 2,
  rows: 5,
  margin: 5,
};

export class LabelPrinter {
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
              padding: 2mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .label-header {
              font-size: 8pt;
              font-weight: bold;
              margin-bottom: 1mm;
            }
            .label-qr {
              flex: 1;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .label-qr img {
              max-width: 100%;
              max-height: 100%;
            }
            .label-footer {
              font-size: 7pt;
              text-align: center;
              margin-top: 1mm;
            }
            .label-price {
              font-size: 9pt;
              font-weight: bold;
              text-align: center;
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
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.uniqueQrCode)}`;
    
    return `
      <div class="label">
        <div class="label-header">${item.publicIdentifier}</div>
        <div class="label-qr">
          <img src="${qrCodeUrl}" alt="QR Code" />
        </div>
        <div class="label-price">ETB ${parseFloat(item.sellingPrice).toFixed(2)}</div>
        <div class="label-footer">Item ID: ${item.id.slice(-6)}</div>
      </div>
    `;
  }

  async printLabels(items: Item[], config?: LabelConfig): Promise<void> {
    const html = await this.generateLabelHtml(items, config);
    
    try {
      await Print.printAsync({ html });
    } catch (error) {
      console.error('Print failed:', error);
      throw error;
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
