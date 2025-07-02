import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

// Import screens
import { HomeScreen } from './screens/HomeScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { CartScreen } from './screens/CartScreen';
import { CollectionsScreen } from './screens/CollectionsScreen';
import { CollectionScreen } from './screens/CollectionScreen';

// Import context
import { CartProvider, useCart } from './context/CartContext';
import { Colors } from './constants/Colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Cart badge component
const CartBadge = () => {
  const { cartCount } = useCart();
  
  if (cartCount === 0) return null;
  
  return (
    <View style={{
      position: 'absolute',
      right: -6,
      top: -3,
      backgroundColor: Colors.brass,
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
        {cartCount > 99 ? '99+' : cartCount}
      </Text>
    </View>
  );
};

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.text.light,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerTitle: 'Alorian Saddlery',
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          headerTitle: 'All Products',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="cart-outline" size={size} color={color} />
              <CartBadge />
            </View>
          ),
          headerTitle: 'Shopping Cart',
        }}
      />
    </Tab.Navigator>
  );
}

// Root stack navigator
function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.text.light,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route }) => ({
          title: 'Product Details',
          headerBackTitle: 'Back',
        })}
      />
      <Stack.Screen
        name="Collections"
        component={CollectionsScreen}
        options={{
          title: 'Collections',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Collection"
        component={CollectionScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Collection',
          headerBackTitle: 'Back',
        })}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}
