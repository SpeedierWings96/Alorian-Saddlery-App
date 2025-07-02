# Alorian Saddlery - Expo Mobile App

A mobile e-commerce app for Alorian Saddlery built with React Native, Expo, and Shopify Storefront API.

## Features

- Browse products and collections
- View detailed product information with image galleries
- Add products to cart with variant selection
- Shopping cart management
- Direct checkout via Shopify
- Beautiful UI with brand colors matching the Alorian Saddlery logo

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo Go app on your mobile device (iOS or Android)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/alorian-saddlery.git
cd alorian-saddlery
```

2. Install dependencies:
```bash
npm install
```

## Running the App

1. Start the Expo development server:
```bash
npm start
```

2. Scan the QR code with:
   - **iOS**: Camera app or Expo Go app
   - **Android**: Expo Go app

## Project Structure

```
alorian-saddlery/
├── assets/              # Images and fonts
├── components/          # Reusable components
├── config/             # App configuration (Shopify)
├── constants/          # Colors and theme constants
├── context/            # React Context (Cart)
├── screens/            # App screens
├── services/           # API services
├── App.js              # Main app component
└── package.json        # Dependencies
```

## Brand Colors

The app uses the official Alorian Saddlery brand colors:
- Navy Blue (#1B2951) - Primary brand color
- Gold (#C8963E) - Secondary accent color
- Supporting colors for UI elements

## Technologies

- React Native & Expo
- Shopify Storefront API
- React Navigation
- AsyncStorage for cart persistence

## Notes

- The app connects to the Alorian Saddlery Shopify store
- Cart data is persisted locally
- Checkout is handled through Shopify's secure checkout page
- Design follows the brand motto: "More Than Tack, It's a Lifestyle" 