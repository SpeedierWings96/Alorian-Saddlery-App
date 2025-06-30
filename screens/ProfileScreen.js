import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation }) => {
  const handleLinkPress = async (url, title) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${title}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${title}`);
    }
  };

  const menuItems = [
    {
      title: 'Visit Website',
      icon: 'globe-outline',
      onPress: () => handleLinkPress('https://alorian.com', 'website'),
    },
    {
      title: 'Contact Us',
      icon: 'mail-outline',
      onPress: () => handleLinkPress('mailto:support@alorian.com', 'email'),
    },
    {
      title: 'Call Us',
      icon: 'call-outline',
      onPress: () => handleLinkPress('tel:+1234567890', 'phone'),
    },
    {
      title: 'Shipping Information',
      icon: 'car-outline',
      onPress: () => navigation.navigate('Info', { 
        title: 'Shipping Information',
        content: 'We offer worldwide shipping on all our equestrian products. Standard shipping takes 5-7 business days. Express shipping is available at checkout.'
      }),
    },
    {
      title: 'Returns & Exchanges',
      icon: 'return-up-back-outline',
      onPress: () => navigation.navigate('Info', { 
        title: 'Returns & Exchanges',
        content: 'We accept returns within 30 days of purchase. Items must be in original condition with tags attached. Custom orders are final sale.'
      }),
    },
    {
      title: 'About Alorian',
      icon: 'information-circle-outline',
      onPress: () => navigation.navigate('Info', { 
        title: 'About Alorian',
        content: 'Alorian Saddlery has been crafting premium equestrian equipment since 1985. We pride ourselves on quality craftsmanship and exceptional customer service.'
      }),
    },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      icon: 'logo-facebook',
      url: 'https://facebook.com/aloriansaddlery',
      color: '#1877F2',
    },
    {
      name: 'Instagram',
      icon: 'logo-instagram',
      url: 'https://instagram.com/aloriansaddlery',
      color: '#E4405F',
    },
    {
      name: 'Twitter',
      icon: 'logo-twitter',
      url: 'https://twitter.com/aloriansaddlery',
      color: '#1DA1F2',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#8B4513', '#D2691E']}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.brandName}>Alorian Saddlery</Text>
          <Text style={styles.tagline}>Premium Equestrian Equipment</Text>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={24} color="#8B4513" />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Social Links */}
        <View style={styles.socialContainer}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialLinks}>
            {socialLinks.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.socialButton, { backgroundColor: social.color }]}
                onPress={() => handleLinkPress(social.url, social.name)}
              >
                <Ionicons name={social.icon} size={24} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Alorian Saddlery</Text>
          <Text style={styles.footerText}>All Rights Reserved</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 40,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  socialContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 24,
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginVertical: 2,
  },
});

export default ProfileScreen;