#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Running post-install configuration...');

// Ensure index.ts exists and has correct content
const indexPath = path.join(__dirname, '..', 'index.ts');
const indexContent = `import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
`;

if (!fs.existsSync(indexPath)) {
  console.log('Creating index.ts...');
  fs.writeFileSync(indexPath, indexContent);
} else {
  const currentContent = fs.readFileSync(indexPath, 'utf-8');
  if (!currentContent.includes('registerRootComponent')) {
    console.log('Fixing index.ts...');
    fs.writeFileSync(indexPath, indexContent);
  }
}

// Ensure babel.config.js has correct presets
const babelPath = path.join(__dirname, '..', 'babel.config.js');
const babelContent = `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
`;

if (!fs.existsSync(babelPath)) {
  console.log('Creating babel.config.js...');
  fs.writeFileSync(babelPath, babelContent);
}

console.log('Post-install configuration complete!');
console.log('');
console.log('If you continue to see "No script URL provided" error:');
console.log('1. Clear all caches: npx expo start --clear');
console.log('2. Delete node_modules and reinstall: rm -rf node_modules && npm install');
console.log('3. For iOS: cd ios && pod install && cd ..');
console.log('4. Run expo prebuild --clear before building'); 