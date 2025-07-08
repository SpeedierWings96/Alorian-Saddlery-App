const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export default {
  expo: {
    name: "Alorian Saddlery",
    slug: "alorian-saddlery",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static"
          }
        }
      ]
    ],
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
      deploymentTarget: "13.4",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: []
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundImage: "./assets/adaptive-icon-background.png"
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
      }
    },
    platforms: [
      "ios",
      "android"
    ],
    jsEngine: "hermes",
    scheme: "alorian-saddlery"
  }
};
