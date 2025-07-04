const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export default {
  expo: {
    name: "Alorian Saddlery",
    slug: "alorian-saddlery",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    updates: {
      fallbackToCacheTimeout: 0
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.aloriansaddlery.app",
      buildNumber: "1",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: [],
        // Prevent packager connection attempts in production
        RCTDevLoadingViewGetHost: IS_PRODUCTION ? "" : undefined,
        // Disable Metro bundler checks in production
        RCTBundleURLProviderEnablePackagerCheck: IS_PRODUCTION ? false : undefined
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.aloriansaddlery.app",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "132f29df-ef92-427c-b244-6a7ab3c4d48a"
      },
      // Disable packager checks in production
      packagerTimeout: IS_PRODUCTION ? 0 : 5000,
      enablePackagerCheck: !IS_PRODUCTION
    },
    plugins: IS_PRODUCTION ? [] : undefined,
    platforms: [
      "ios",
      "android"
    ],
    jsEngine: "hermes",
    sdkVersion: "53.0.0"
  }
};
