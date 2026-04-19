const path = require('path');
const withSerwist = require('@serwist/next').default({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withSerwist({
  sassOptions: {
    loadPaths: [path.join(__dirname, 'src/styles')],
    silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin'],
  },
});
