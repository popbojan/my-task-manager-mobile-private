const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const srcRoot = path.resolve(projectRoot, 'src');

/**
 * Metro resolves imports before Babel runs. Teach it the same `@/*` alias as tsconfig/babel.
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith('@/')) {
        const mappedPath = path.join(srcRoot, moduleName.slice(2));
        return context.resolveRequest(context, mappedPath, platform);
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
