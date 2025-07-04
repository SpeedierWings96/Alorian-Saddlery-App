const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper asset handling
config.resolver.assetExts.push('db');

// Optimize for production builds
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

// Ensure proper source map generation
config.serializer = {
  ...config.serializer,
  createModuleIdFactory: function () {
    return function (path) {
      // Use relative paths for module IDs to ensure consistency
      return path.substr(path.lastIndexOf('/') + 1);
    };
  },
};

module.exports = config;
