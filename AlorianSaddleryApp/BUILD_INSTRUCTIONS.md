# Alorian Saddlery App - Build Instructions

## Prerequisites

1. **Node.js** (v16 or higher)
2. **EAS CLI** (already installed globally)
3. **For Android**: Android Studio with Android SDK
4. **For iOS**: macOS with Xcode (only on Mac)

## Building Locally

### Android

#### APK Build (Preview/Testing)
```bash
npm run build:android:local:preview
```

#### Development Build
```bash
npm run build:android:local
```

### iOS (Mac only)

#### Simulator Build
```bash
npm run build:ios:local
```

## Running the App

### Development Mode
```bash
npm start
```

Then:
- Press `a` to open on Android
- Press `i` to open on iOS simulator (Mac only)

### With Dev Client
```bash
npx expo start --dev-client
```

## Troubleshooting

### White Screen on Production Build

1. Clear the cache:
```bash
npm run clear
npx expo start -c
```

2. Rebuild:
```bash
npm run prebuild
```

3. Check logs:
- Android: `adb logcat`
- iOS: Use Xcode console

### Build Errors

1. Clean node modules:
```bash
rm -rf node_modules
npm install
```

2. Clear Expo cache:
```bash
npx expo doctor --fix-dependencies
```

## Production Builds

For production releases, use:
```bash
# Android
npm run build:android

# iOS
npm run build:ios
```

These will build on EAS servers, not locally.

## Testing
- Test the app on physical devices before submission
- For Android: `npm run build:android:preview`
- For iOS: Use TestFlight after building

## Debugging Production White Screen Issues

If you encounter a white screen in production builds:

1. **Enable Console Logging**: The app now includes a production-safe logger that will show errors even in production builds.

2. **Connect to Debug Console**:
   - For iOS: Use Console.app on Mac to view device logs
   - For Android: Use `adb logcat | grep "APP"` to filter app logs

3. **Check Common Issues**:
   - Verify all environment variables are set correctly
   - Ensure all assets are bundled properly
   - Check for any missing permissions in app.json
   - Verify network connectivity for API calls

4. **Build with Development Profile**: 
   ```bash
   eas build --platform ios --profile development
   ```
   This provides more debugging information.

5. **Check Error Boundaries**: The app includes error boundaries that will display error messages instead of white screens.

6. **Verify Metro Bundling**: Ensure the JavaScript bundle is created correctly:
   ```bash
   npx react-native bundle --platform ios --dev false --entry-file index.ts --bundle-output ios/main.jsbundle --assets-dest ios
   ```

7. **Test Locally First**: Always test with:
   ```bash
   npx expo run:ios --configuration Release
   npx expo run:android --variant release
   ``` 