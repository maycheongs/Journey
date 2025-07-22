const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  reactRefresh: {
    // Disable CRA's fast refresh (react-refresh) completely
    disableFastRefresh: true,
  },
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Remove ReactRefreshWebpackPlugin to prevent import errors
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => !(plugin instanceof ReactRefreshWebpackPlugin)
      );
      return webpackConfig;
    },
  },
};
