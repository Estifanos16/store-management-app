import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { useAuth } from '@/src/contexts/AuthContext';
import { authApi } from '@/src/services/api/authApi';
import Colors from '@/constants/Colors';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function ModalScreen() {
  const router = useRouter();
  const { theme, toggleTheme, isSystem, setSystemTheme } = useTheme();
  const colors = Colors[theme];
  const { user, isOwner, isSeller } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authApi.logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getRoleDisplay = () => {
    if (isOwner) return 'Owner';
    if (isSeller) return 'Seller';
    return 'Unknown';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.userRole, { color: colors.primary }]}>
            {getRoleDisplay()}
          </Text>
        </View>

        {/* User Info Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>
          
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <SymbolView
              name={{ ios: 'envelope', android: 'email', web: 'email' }}
              tintColor={colors.primary}
              size={20}
            />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user?.email || 'Not provided'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <SymbolView
              name={{ ios: 'phone', android: 'phone', web: 'phone' }}
              tintColor={colors.primary}
              size={20}
            />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user?.phone || 'Not provided'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <SymbolView
              name={{ ios: 'person.badge', android: 'badge', web: 'badge' }}
              tintColor={colors.primary}
              size={20}
            />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Role</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {getRoleDisplay()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <SymbolView
              name={{ ios: 'building.2', android: 'store', web: 'store' }}
              tintColor={colors.primary}
              size={20}
            />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Shop ID</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user?.shopId || 'Not assigned'}
            </Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <SymbolView
              name={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
              tintColor={colors.primary}
              size={20}
            />
            <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              tintColor={colors.textSecondary}
              size={18}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <SymbolView
              name={{ ios: 'lock', android: 'lock', web: 'lock' }}
              tintColor={colors.primary}
              size={20}
            />
            <Text style={[styles.settingText, { color: colors.text }]}>Change Password</Text>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              tintColor={colors.textSecondary}
              size={18}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]} onPress={toggleTheme}>
            <SymbolView
              name={theme === 'dark' ? { ios: 'sun.max', android: 'light_mode', web: 'light_mode' } : { ios: 'moon', android: 'dark_mode', web: 'dark_mode' }}
              tintColor={colors.primary}
              size={20}
            />
            <Text style={[styles.settingText, { color: colors.text }]}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {isSystem ? 'Auto' : theme === 'dark' ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>

          {!isSystem && (
            <TouchableOpacity style={styles.settingRow} onPress={setSystemTheme}>
              <SymbolView
                name={{ ios: 'gearshape.2', android: 'settings_suggest', web: 'settings_suggest' }}
                tintColor={colors.primary}
                size={20}
              />
              <Text style={[styles.settingText, { color: colors.text }]}>Use System Theme</Text>
              <SymbolView
                name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                tintColor={colors.primary}
                size={18}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.settingRow}>
            <SymbolView
              name={{ ios: 'questionmark.circle', android: 'help', web: 'help' }}
              tintColor={colors.primary}
              size={20}
            />
            <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              tintColor={colors.textSecondary}
              size={18}
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <SymbolView
            name={{ ios: 'arrow.right.square', android: 'logout', web: 'logout' }}
            tintColor="#FFFFFF"
            size={22}
          />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Store Management App v1.0
          </Text>
        </View>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  userRole: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {
    fontSize: 14,
    marginLeft: 12,
    flex: 0,
    marginRight: 8,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    letterSpacing: -0.3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: -0.3,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
