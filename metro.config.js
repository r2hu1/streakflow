const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Ensure module resolution works correctly for path aliases
config.watchFolders = [...config.watchFolders, path.resolve(__dirname)];

module.exports = config;
