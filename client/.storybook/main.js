/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  staticDirs: ['../public']
};

export default config;
