const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  reactRefresh: {
    disableFastRefresh: true,
  },
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  babel: {
    plugins: (plugins) =>
      plugins.filter((plugin) => plugin !== 'react-refresh/babel'),
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ReactRefreshWebpackPlugin'
      );
      return webpackConfig;
    },
  },
};

