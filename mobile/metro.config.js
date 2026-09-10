const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;
// Do NOT watch the monorepo parent — that triggers EMFILE on macOS.
config.watchFolders = [projectRoot];
config.maxWorkers = 1;

// Stay inside mobile/node_modules; never crawl ../node_modules, ../client, ../server
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];
config.resolver.disableHierarchicalLookup = true;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

config.resolver.blockList = exclusionList([
  new RegExp(`^${escapeRegex(path.join(workspaceRoot, 'client'))}(/.*)?$`),
  new RegExp(`^${escapeRegex(path.join(workspaceRoot, 'server'))}(/.*)?$`),
  new RegExp(`^${escapeRegex(path.join(workspaceRoot, 'node_modules'))}(/.*)?$`),
  new RegExp(`^${escapeRegex(path.join(workspaceRoot, '.git'))}(/.*)?$`),
  /.*\/\.git\/.*/,
]);

config.watcher = {
  ...config.watcher,
  healthCheck: { enabled: true },
};

module.exports = config;
