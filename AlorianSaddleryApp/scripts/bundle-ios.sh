#!/bin/bash

# iOS Bundle Script - Creates a standalone JS bundle for iOS
set -e

echo "📦 Creating iOS Bundle for Alorian Saddlery..."

# Clean any existing bundles
echo "🧹 Cleaning existing bundles..."
rm -rf ios/main.jsbundle ios/assets 2>/dev/null || true

# Create the iOS bundle
echo "🏗️ Creating iOS bundle..."
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/

# Check if bundle was created successfully
if [ -f "ios/main.jsbundle" ]; then
    echo "✅ iOS bundle created successfully!"
    echo "📁 Bundle location: ios/main.jsbundle"
    echo "📊 Bundle size: $(du -h ios/main.jsbundle | cut -f1)"
else
    echo "❌ Failed to create iOS bundle"
    exit 1
fi

# Optional: Build the iOS app with the bundle
if [[ "$1" == "--build" ]]; then
    echo "📱 Building iOS app with bundle..."
    cd ios
    xcodebuild -workspace AlorianSaddlery.xcworkspace -scheme AlorianSaddlery -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 15' build
    echo "✅ iOS app built successfully!"
fi

echo "🎉 iOS bundle creation complete!"
echo ""
echo "💡 To run the app with this bundle:"
echo "   1. Open Xcode and run the app, or"
echo "   2. Run: npm run ios"
echo ""
echo "🔧 If you want to return to Metro development:"
echo "   1. Run: npm run clean:ios"
echo "   2. Run: npm run ios:full" 