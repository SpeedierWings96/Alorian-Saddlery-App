# Alorian Saddlery Mobile App

A premium React Native e-commerce application for Alorian Saddlery, featuring a complete Shopify integration for selling equestrian equipment.

## Features

### 🛍️ E-commerce Functionality
- **Product Catalog**: Browse all products with beautiful card layouts
- **Product Details**: Rich product pages with image galleries, variants, and descriptions
- **Search**: Full-text search across all products
- **Collections**: Organized product categories
- **Shopping Cart**: Add, remove, and update quantities
- **Checkout**: Seamless Shopify checkout integration

### 🎨 User Experience
- **Native Navigation**: React Navigation with tab and stack navigators
- **Beautiful UI**: Professional design with gradients and animations
- **Responsive Design**: Optimized for all device sizes
- **Loading States**: Smooth loading spinners and refresh controls
- **Error Handling**: Graceful error handling throughout the app

### ⚡ Technical Features
- **Shopify GraphQL API**: Complete integration with Shopify Storefront API
- **State Management**: React Context for cart state
- **Persistent Storage**: AsyncStorage for cart persistence
- **TypeScript Support**: Partial TypeScript implementation
- **Modern React**: Hooks-based architecture

## App Structure

### Navigation
- **Home Tab**: Featured products, collections, search
- **Products Tab**: All products with pagination
- **Cart Tab**: Shopping cart with checkout
- **Profile Tab**: Company information and links

### Key Screens
- `HomeScreen`: Hero banner, collections, featured products
- `ProductsScreen`: Product grid with infinite scroll
- `ProductDetailScreen`: Product images, variants, add to cart
- `CartScreen`: Cart items, quantity management, checkout
- `SearchScreen`: Product search functionality
- `CollectionsScreen`: Category browsing
- `ProfileScreen`: Company information and support

## Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v7
- **State Management**: React Context
- **API**: Shopify GraphQL Storefront API
- **HTTP Client**: Axios
- **UI Components**: Custom components with Expo Vector Icons
- **Storage**: AsyncStorage
- **Styling**: React Native StyleSheet

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Shopify**
   - Update `config/shopify.js` with your Shopify store details:
     - Domain: Your Shopify store domain
     - Storefront Access Token: Your Shopify Storefront API token
     - API Version: Latest supported version

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Run on Device**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or use `npm run ios` / `npm run android` for simulators

## Configuration

### Shopify Setup
The app connects to Shopify via the Storefront API. Configure your store in `config/shopify.js`:

```javascript
export const SHOPIFY_CONFIG = {
  domain: 'your-store.myshopify.com',
  storefrontAccessToken: 'your-storefront-access-token',
  apiVersion: '2024-01',
};
```

### Required Shopify Permissions
Ensure your Storefront Access Token has these permissions:
- Read products
- Read collections
- Read product listings
- Manage carts

## App Components

### Core Components
- `ProductCard`: Product display component
- `CartIcon`: Cart icon with item count badge
- `LoadingSpinner`: Loading state component

### Services
- `shopifyService`: Complete Shopify API integration
- GraphQL queries for products, collections, cart operations

### Context
- `CartContext`: Global cart state management

## Features in Detail

### Product Management
- **Product Loading**: Paginated product fetching
- **Image Gallery**: Multiple product images with indicators
- **Variant Selection**: Size, color, and other option selection
- **Stock Status**: Real-time availability checking

### Cart Functionality
- **Add to Cart**: Product variant selection and cart addition
- **Quantity Management**: Increase/decrease item quantities
- **Remove Items**: Individual item removal
- **Persistence**: Cart state persists between app sessions
- **Checkout**: Direct integration with Shopify checkout

### Search & Navigation
- **Search**: Real-time product search
- **Collections**: Category-based browsing
- **Navigation**: Seamless navigation between screens
- **Deep Linking**: Support for product deep links

## Build & Deployment

### Development Build
```bash
expo build:android
expo build:ios
```

### Production Build
```bash
eas build --platform android
eas build --platform ios
```

## Support

For technical support or questions about the app:
- Email: support@alorian.com
- Website: https://alorian.com

## License

© 2024 Alorian Saddlery. All rights reserved.
