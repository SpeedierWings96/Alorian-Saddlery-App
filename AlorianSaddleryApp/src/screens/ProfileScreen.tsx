import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, SPACING, TYPOGRAPHY } from '../config/theme';
import { RootStackParamList } from '../types/shopify';
import { useAuth } from '../contexts/AuthContext';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { customer, isGuest, logout } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(customer?.acceptsMarketing || false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleOrderHistory = () => {
    Alert.alert(
      'Order History',
      'This would show your order history and tracking information.',
      [{ text: 'OK' }]
    );
  };

  const handleAddresses = () => {
    Alert.alert(
      'Addresses',
      'This would allow you to manage your shipping and billing addresses.',
      [{ text: 'OK' }]
    );
  };

  const handlePaymentMethods = () => {
    Alert.alert(
      'Payment Methods',
      'This would allow you to manage your saved payment methods.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Customer Support',
      'Contact us at:\n\nEmail: info@alorian.com\nPhone: 201-450-7505\n\nOr visit our website for live chat support.',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Alorian Saddlery',
      'More than tack, it\'s a lifestyle.\n\nAlorian Saddlery has been providing premium equestrian equipment for over 25 years. We are committed to quality, craftsmanship, and the equestrian community.',
      [{ text: 'OK' }]
    );
  };

  const handleTermsOfService = async () => {
    try {
      await Linking.openURL('https://alorian.com/policies/refund-policy');
    } catch (error) {
      Alert.alert('Error', 'Unable to open Terms of Service. Please try again later.');
    }
  };

  const handlePrivacyPolicy = async () => {
    try {
      await Linking.openURL('https://alorian.com/policies/privacy-policy');
    } catch (error) {
      Alert.alert('Error', 'Unable to open Privacy Policy. Please try again later.');
    }
  };

  const handleDataPrivacy = () => {
    Alert.alert(
      'Data & Privacy',
      'Your privacy is important to us. We collect and use your data in accordance with our Privacy Policy to provide you with the best shopping experience.',
      [
        { text: 'View Privacy Policy', onPress: handlePrivacyPolicy },
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  const renderMenuItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    showArrow = true,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.menuItemRight}>
        {rightComponent}
        {showArrow && !rightComponent && (
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderLoggedInView = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle" size={80} color={COLORS.primary} />
      </View>
      <Text style={styles.userName}>
        {customer?.displayName || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'User'}
      </Text>
      <Text style={styles.userEmail}>{customer?.email}</Text>
    </View>
  );

  const renderGuestView = () => (
    <View style={styles.guestHeader}>
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle-outline" size={80} color={COLORS.gray[400]} />
      </View>
      <Text style={styles.guestTitle}>Guest User</Text>
      <Text style={styles.guestSubtitle}>
        Sign in to access your orders, save favorites, and get personalized recommendations
      </Text>
      <TouchableOpacity style={styles.signInButton} onPress={handleLogout}>
        <Text style={styles.signInButtonText}>Sign In to Your Account</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {customer && renderLoggedInView()}
        {isGuest && renderGuestView()}
        
        {/* Account Section */}
        {customer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            {renderMenuItem('time-outline', 'Order History', 'View past orders', handleOrderHistory)}
            {renderMenuItem('location-outline', 'Addresses', 'Manage shipping addresses', handleAddresses)}
            {renderMenuItem('card-outline', 'Payment Methods', 'Manage payment options', handlePaymentMethods)}
          </View>
        )}
        
        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {renderMenuItem(
            'notifications-outline',
            'Push Notifications',
            'Get notified about orders and offers',
            undefined,
            false,
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.gray[300], true: COLORS.secondary }}
              thumbColor={notificationsEnabled ? COLORS.primary : COLORS.gray[400]}
            />
          )}
          {renderMenuItem(
            'mail-outline',
            'Email Updates',
            'Receive newsletters and promotions',
            undefined,
            false,
            <Switch
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              trackColor={{ false: COLORS.gray[300], true: COLORS.secondary }}
              thumbColor={emailUpdates ? COLORS.primary : COLORS.gray[400]}
            />
          )}
        </View>
        
        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderMenuItem('help-circle-outline', 'Customer Support', 'Get help with your order', handleSupport)}
          {renderMenuItem('information-circle-outline', 'About Alorian Saddlery', 'Learn more about us', handleAbout)}
          {renderMenuItem('star-outline', 'Rate Our App', 'Share your feedback')}
        </View>
        
        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          {renderMenuItem('document-text-outline', 'Terms of Service', 'View refund policy', handleTermsOfService)}
          {renderMenuItem('shield-checkmark-outline', 'Privacy Policy', 'View privacy policy', handlePrivacyPolicy)}
          {renderMenuItem('lock-closed-outline', 'Data & Privacy', 'Learn about data usage', handleDataPrivacy)}
        </View>
        
        {/* Logout Section */}
        {customer && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Alorian Saddlery v1.0.0</Text>
          <Text style={styles.versionSubtext}>More than tack, it's a lifestyle</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: 12,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.error,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  versionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  versionSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  guestHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  guestTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  guestSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  signInButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
});

export default ProfileScreen;
