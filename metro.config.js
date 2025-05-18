const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    '@peculiar/webcrypto': require.resolve('react-native-webview-crypto'),
  };
  return config;
})();
