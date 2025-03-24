const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Adicionando o suporte para 'cjs' nas extensões de fonte
defaultConfig.resolver.sourceExts.push('cjs');

// Usando o wrapWithReanimatedMetroConfig corretamente
module.exports = wrapWithReanimatedMetroConfig(defaultConfig);
