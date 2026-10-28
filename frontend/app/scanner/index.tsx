import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SymbolView } from 'expo-symbols';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Button, Card } from '@/src/components/common';
import { theme } from '@store-management/shared';

export default function ScannerScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraAvailable, setCameraAvailable] = useState(true);

  // Check if running on web
  const isWeb = Platform.OS === 'web';

  const handleMockScan = () => {
    // Mock scan for testing/web
    const mockCode = 'ITEM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    router.push(`/scanner/item?code=${mockCode}`);
  };

  useEffect(() => {
    // On web, camera may not be available, default to mock mode
    if (isWeb) {
      setCameraAvailable(false);
    }
  }, [isWeb]);

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Fallback screen for web or when camera is unavailable
  if (!cameraAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <SymbolView
            name={{ ios: 'camera', android: 'camera_alt', web: 'camera_alt' }}
            tintColor={colors.primary}
            size={64}
          />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            {isWeb ? 'Web Browser Detected' : 'Camera Unavailable'}
          </Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            {isWeb 
              ? 'Camera access is limited in web browsers. Use the mock scan button below for testing or use the mobile app for full functionality.'
              : 'Camera is not available on this device. Use the mock scan button for testing.'
            }
          </Text>
          <View style={styles.buttonGroup}>
            <Button
              title="Mock Scan (Testing)"
              onPress={handleMockScan}
              variant="accent"
              icon={{ ios: 'barcode', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
            />
            <Button
              title="Go Back"
              onPress={() => router.back()}
              variant="outline"
            />
          </View>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <SymbolView
            name={{ ios: 'camera', android: 'camera_alt', web: 'camera_alt' }}
            tintColor={colors.primary}
            size={64}
          />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Camera Permission Required
          </Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            We need camera access to scan QR codes on your products. This allows you to quickly add items to your cart.
          </Text>
          <View style={styles.buttonGroup}>
            <Button
              title="Grant Permission"
              onPress={requestPermission}
            />
            <Button
              title="Go Back"
              onPress={() => router.back()}
              variant="outline"
            />
          </View>
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setIsScanning(false);
    
    // Parse QR code data and navigate to item detail
    // Expected format: item ID or encoded data
    setTimeout(() => {
      router.push(`/scanner/item?code=${encodeURIComponent(data)}`);
    }, 500);
  };

  const resetScan = () => {
    setScanned(false);
    setIsScanning(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Camera View */}
      <CameraView
        style={styles.camera}
        onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Target Frame Overlay */}
        <View style={styles.overlay}>
          <View style={styles.targetFrame}>
            <View style={[styles.targetCorner, styles.topLeft]} />
            <View style={[styles.targetCorner, styles.topRight]} />
            <View style={[styles.targetCorner, styles.bottomLeft]} />
            <View style={[styles.targetCorner, styles.bottomRight]} />
            
            <Text style={[styles.scanText, { color: '#FFFFFF' }]}>
              Align QR code within frame
            </Text>
          </View>

          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.colors.primary + 'E6' }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <SymbolView
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                tintColor="#FFFFFF"
                size={24}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan QR Code</Text>
            <View style={styles.headerButton} />
          </View>

          {/* Scan Result */}
          {scanned && (
            <View style={styles.resultContainer}>
              <Card style={styles.resultCard}>
                <SymbolView
                  name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }}
                  tintColor={colors.success}
                  size={48}
                />
                <Text style={[styles.resultText, { color: colors.text }]}>QR Code Scanned!</Text>
                <Button
                  title="Scan Again"
                  onPress={resetScan}
                  variant="outline"
                />
              </Card>
            </View>
          )}

          {/* Mock Scan Button for Web/Testing */}
          <View style={styles.mockButtonContainer}>
            <Button
              title="Mock Scan (Testing)"
              onPress={handleMockScan}
              variant="accent"
              icon={{ ios: 'barcode', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
            />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonGroup: {
    gap: 12,
    width: '100%',
    minWidth: 280,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  targetFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 60,
  },
  targetCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#F59E0B',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopLeftRadius: 8,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopRightRadius: 8,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: 8,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  resultContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  resultCard: {
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 24,
  },
  mockButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
});
