// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bundled Bible translations ship as SQLite files.
config.resolver.assetExts.push('db');

// Lets expo-sqlite run in the browser for quick web previews.
config.resolver.assetExts.push('wasm');

module.exports = config;
