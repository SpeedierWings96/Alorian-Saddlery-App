# Alorian Saddlery Mobile App

A React Native Expo app for Alorian Saddlery's Shopify store, built with the latest Expo SDK and featuring the brand's signature navy blue and gold color scheme.

## Features

- **Modern UI/UX**: Clean, professional design using Alorian's brand colors
- **Shopify Integration**: Connected to Alorian Saddlery's Shopify Storefront API
- **Navigation**: Tab-based navigation with stack navigation for detailed views
- **Responsive Design**: Optimized for mobile devices with proper spacing and typography

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo SDK 53**: Latest Expo framework
- **TypeScript**: Type-safe development
- **React Navigation 6**: Modern navigation solution
- **Shopify Storefront API**: E-commerce integration
- **Expo Linear Gradient**: Beautiful gradient effects
- **Expo Image**: Optimized image handling

## Project Structure

```
src/
├── config/
│   ├── shopify.ts      # Shopify API configuration and GraphQL queries
│   └── theme.ts        # Brand colors, typography, and design tokens
├── navigation/
│   └── AppNavigator.tsx # Navigation setup with tabs and stacks
├── screens/
│   ├── HomeScreen.tsx       # Main landing screen
│   ├── ProductsScreen.tsx   # Product listing
│   ├── ProductDetailScreen.tsx # Individual product view
│   ├── CartScreen.tsx       # Shopping cart
│   ├── ProfileScreen.tsx    # User profile
│   ├── SearchScreen.tsx     # Product search
│   └── CollectionsScreen.tsx # Product collections
├── services/
│   └── shopifyApi.ts   # API service layer for Shopify integration
└── types/
    └── shopify.ts      # TypeScript type definitions
```

## Brand Colors

- **Primary**: #1B2951 (Navy Blue)
- **Secondary**: #D4AF37 (Gold)
- **Accent**: #B8860B (Darker Gold)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   # or with tunnel for external testing
   npx expo start --tunnel
   ```

3. **Test on Device**:
   - Install Expo Go app on your mobile device
   - Scan the QR code displayed in the terminal
   - The app will load on your device

## Shopify Configuration

The app is configured to connect to Alorian Saddlery's Shopify store using:
- **Store Domain**: alorian.myshopify.com
- **Storefront Access Token**: 99cb18c70c870c535954418a1589d964

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## Current Status

✅ **Completed**:
- Project setup with Expo SDK 53
- Brand theme configuration with Alorian's navy blue and gold colors
- Complete navigation structure (Tab + Stack navigation)
- Shopify API integration with Storefront API
- All main screen implementations:
  - **HomeScreen**: Hero section, quick actions, brand messaging
  - **ProductsScreen**: Product grid with real Shopify data, filtering, search
  - **ProductDetailScreen**: Image gallery, variants, quantity selection, add to cart
  - **SearchScreen**: Real-time search with suggestions and recent searches
  - **CollectionsScreen**: Beautiful collection cards with product counts
  - **CartScreen**: Full shopping cart with quantity management and checkout
  - **ProfileScreen**: User authentication, settings, support, and account management
- TypeScript configuration throughout
- Error handling and loading states
- Responsive design optimized for mobile
- Professional UI/UX with shadows, gradients, and animations

## Next Steps

1. Connect to real Shopify cart functionality (currently using mock data)
2. Implement user authentication with Shopify Customer API
3. Add product filtering and sorting options
4. Implement wishlist/favorites functionality
5. Add push notifications for order updates
6. Optimize performance with image caching and lazy loading
7. Add offline support and data persistence
8. Implement deep linking for products and collections
9. Add analytics and crash reporting
10. Prepare for app store deployment

## Development Notes

- The app uses the latest Expo SDK 53 for optimal performance
- All screens are currently placeholder components ready for implementation
- Shopify integration is set up and ready to fetch real product data
- The design follows Alorian Saddlery's brand guidelines with navy blue and gold colors
- TypeScript is used throughout for type safety and better development experience
