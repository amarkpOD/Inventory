const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude parent monorepo folders (client, server) from Metro file watcher to prevent EMFILE limit
config.resolver.blockList = [
  new RegExp(path.resolve(__dirname, '../client').replace(/[/]/g, '[/\\\\]') + '/.*'),
  new RegExp(path.resolve(__dirname, '../server').replace(/[/]/g, '[/\\\\]') + '/.*'),
];

module.exports = config;
