const path = require('path');

const srcRoot = path.resolve(__dirname, 'src');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: [srcRoot],
        alias: {
          '@': srcRoot,
        },
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.js',
          '.jsx',
          '.json',
        ],
      },
    ],
  ],
};
