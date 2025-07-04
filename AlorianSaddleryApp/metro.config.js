const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for production builds
config.resolver.assetExts.push('db');

// Fix source map and bundle generation for production
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// Ensure bundle is created properly
config.serializer = {
  ...config.serializer,
  getPolyfills: () => require('react-native/Libraries/polyfills/polyfills.js'),
};

module.exports = config; 