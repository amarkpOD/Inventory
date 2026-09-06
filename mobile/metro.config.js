const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];
config.maxWorkers = 2;

// Exclude parent monorepo folders (client, server, root node_modules) from Metro file watcher
config.resolver.blockList = [
  new RegExp(path.resolve(__dirname, '../client').replace(/[/]/g, '[/\\\\]') + '/.*'),
  new RegExp(path.resolve(__dirname, '../server').replace(/[/]/g, '[/\\\\]') + '/.*'),
  new RegExp(path.resolve(__dirname, '../node_modules').replace(/[/]/g, '[/\\\\]') + '/.*'),
  new RegExp(path.resolve(__dirname, '../.git').replace(/[/]/g, '[/\\\\]') + '/.*'),
];

module.exports = config;
