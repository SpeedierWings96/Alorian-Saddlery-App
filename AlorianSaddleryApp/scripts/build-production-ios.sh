#!/bin/bash

# Build Production iOS App with Bundle
echo "🚀 Building Production iOS App..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf ios/build
rm -rf dist

# Create production bundle
echo "📦 Creating production bundle..."
npx expo export --platform ios

# Copy bundle to iOS project
echo "📋 Copying bundle to iOS project..."
cp "dist/_expo/static/js/ios/"*.hbc "ios/main.jsbundle"

# Build the iOS app
echo "🏗️ Building iOS app..."
cd ios
xcodebuild -workspace AlorianSaddlery.xcworkspace -scheme AlorianSaddlery -configuration Release -sdk iphonesimulator -arch x86_64 -derivedDataPath build

echo "✅ Production iOS build complete!"
echo "📁 Build location: ios/build/Build/Products/Release-iphonesimulator/AlorianSaddlery.app"

# Optional: Launch in simulator
echo "🚀 Launching in simulator..."
xcrun simctl install booted "build/Build/Products/Release-iphonesimulator/AlorianSaddlery.app"
xcrun simctl launch booted com.aloriansaddlery.app 