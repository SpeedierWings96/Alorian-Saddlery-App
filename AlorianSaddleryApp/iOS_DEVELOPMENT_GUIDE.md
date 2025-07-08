# iOS Development Guide - Fixing White Screen Issue

## Problem Overview

The white screen issue occurs when the React Native app tries to connect to the Metro bundler (localhost:8081) but fails. This typically happens when:

1. Metro bundler is not running
2. Network connectivity issues
3. The app is built in release mode without a bundled JavaScript file

## Quick Fix Solutions

### Option 1: Development with Metro Bundler (Recommended for Development)

Use the new development script that automatically handles Metro bundler:

```bash
# Start Metro bundler and launch iOS app
npm run ios:full

# If you need to reset Metro and clear cache
npm run ios:reset
```

### Option 2: Create a Standalone Bundle (For Testing/Production)

Create a bundled JavaScript file that gets embedded in the iOS app:

```bash
# Create a standalone iOS bundle
npm run bundle:ios:standalone

# Then run the iOS app normally
npm run ios
```

### Option 3: Manual Metro Setup

If you prefer manual control:

```bash
# Terminal 1: Start Metro bundler
npm run start:metro

# Terminal 2: Once Metro is running, launch iOS app
npm run ios
```

## Understanding the Fix

### How It Works

The iOS app is configured to:
- **Development Mode**: Load JavaScript from Metro bundler at `localhost:8081`
- **Production Mode**: Load JavaScript from bundled file `ios/main.jsbundle`

### Scripts Explanation

| Script | Purpose |
|--------|---------|
| `npm run ios:full` | Automatically starts Metro and launches iOS app |
| `npm run ios:reset` | Resets Metro cache and launches iOS app |
| `npm run bundle:ios:standalone` | Creates a standalone bundle for iOS |
| `npm run bundle:ios:build` | Creates bundle and builds iOS app |
| `npm run clean:ios` | Removes existing iOS bundles |

## Development Workflow

### For Daily Development

1. **Start developing**: `npm run ios:full`
2. **If issues occur**: `npm run ios:reset`
3. **Clean restart**: `npm run clean:ios && npm run ios:full`

### For Testing Production-like Builds

1. **Create bundle**: `npm run bundle:ios:standalone`
2. **Test app**: `npm run ios`
3. **Return to development**: `npm run clean:ios && npm run ios:full`

## Troubleshooting

### Common Issues

1. **"Connection refused" errors**
   - Metro bundler is not running
   - **Solution**: Use `npm run ios:full` or `npm run ios:reset`

2. **"No script URL provided"**
   - App can't find JavaScript bundle
   - **Solution**: Create a bundle with `npm run bundle:ios:standalone`

3. **Metro stuck or not responding**
   - **Solution**: `npm run ios:reset` to kill and restart Metro

4. **App still showing white screen**
   - Check if any other process is using port 8081
   - **Solution**: Kill all Node processes and restart
   ```bash
   killall node
   npm run ios:reset
   ```

### Advanced Debugging

Check if Metro is running:
```bash
lsof -i :8081
```

Kill stuck Metro processes:
```bash
lsof -ti :8081 | xargs kill -9
```

Check bundle file exists:
```bash
ls -la ios/main.jsbundle
```

## Script Files

The following scripts were created to solve the white screen issue:

- `scripts/dev-ios.sh` - Development script with Metro management
- `scripts/bundle-ios.sh` - Standalone bundle creation script

## Important Notes

1. **Never commit `ios/main.jsbundle`** - This file should be generated locally
2. **Use development scripts during development** - They handle Metro automatically
3. **Use bundle scripts for testing** - They create production-like builds
4. **Always clean before switching modes** - Use `npm run clean:ios`

## iOS App Configuration

The app is already configured to handle both scenarios:

```swift
// In AppDelegate.swift - ReactNativeDelegate class
override func bundleURL() -> URL? {
#if DEBUG
    // Development: Load from Metro bundler
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    // Production: Load from bundled file
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
}
```

This configuration automatically:
- Uses Metro bundler in DEBUG mode
- Uses bundled JavaScript in RELEASE mode

## Success Indicators

You know the fix is working when:
- ✅ No "Connection refused" errors in logs
- ✅ App loads without white screen
- ✅ Metro bundler shows "✅ Metro bundler is ready!" message
- ✅ App hot reloads when you make changes (development mode) 