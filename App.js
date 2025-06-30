import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import CartIcon from './components/CartIcon';
import { CartProvider } from './context/CartContext';

// Import screens
import CartScreen from './screens/CartScreen';
import CollectionScreen from './screens/CollectionScreen';
import CollectionsScreen from './screens/CollectionsScreen';
import HomeScreen from './screens/HomeScreen';
import InfoScreen from './screens/InfoScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import ProductsScreen from './screens/ProductsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProductsStack = createStackNavigator();
const CartStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Stack navigators for each tab
function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8B4513',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <HomeStack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ title: 'Alorian Saddlery' }}
      />
      <HomeStack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
      <HomeStack.Screen name="Search" component={SearchScreen} />
      <HomeStack.Screen name="Collections" component={CollectionsScreen} />
      <HomeStack.Screen 
        name="Collection" 
        component={CollectionScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
    </HomeStack.Navigator>
  );
}

function ProductsStackScreen() {
  return (
    <ProductsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8B4513',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ProductsStack.Screen name="ProductsMain" component={ProductsScreen} options={{ title: 'All Products' }} />
      <ProductsStack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
    </ProductsStack.Navigator>
  );
}

function CartStackScreen() {
  return (
    <CartStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8B4513',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <CartStack.Screen name="CartMain" component={CartScreen} options={{ title: 'Shopping Cart' }} />
      <CartStack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
    </CartStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8B4513',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen 
        name="Info" 
        component={InfoScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
    </ProfileStack.Navigator>
  );
}

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Products') {
                iconName = focused ? 'grid' : 'grid-outline';
              } else if (route.name === 'Cart') {
                return <CartIcon color={color} size={size} />;
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#8B4513',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
            tabBarStyle: {
              paddingBottom: 5,
              height: 60,
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeStackScreen} />
          <Tab.Screen name="Products" component={ProductsStackScreen} />
          <Tab.Screen name="Cart" component={CartStackScreen} />
          <Tab.Screen name="Profile" component={ProfileStackScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
} 