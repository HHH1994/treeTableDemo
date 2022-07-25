const path = require('path');
const terserOptions = require('@vue/cli-service/lib/config/terserOptions');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  assetsDir: 'static',
  publicPath: '/',
  outputDir: './dist',
  pages: {
    index: {
      entry: 'src/main.js',
    }
  },
  lintOnSave: false,
  devServer: {
    open: true,
    openPage: '',
    port: 9090
  },

  configureWebpack: {
    devtool: isProd ? 'none' : 'cheap-eval-source-map',

    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@api': path.resolve(__dirname, './src/common/interface/api'),
        '@components': path.resolve(__dirname, './src/components'),

        '@constants': path.resolve(__dirname, './src/common/constants'),
        '@less': path.resolve(__dirname, './src/common/less'),
        '@mixins': path.resolve(__dirname, './src/common/mixins'),
      },
    },
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch-index');
    config.plugins.delete('prefetch-index');

    if (isProd) {
      config
        .plugin('TerserPlugin')
        .use('terser-webpack-plugin', [
          Object.assign(terserOptions({ productionSourceMap: false, parallel: false }), { terserOptions: { compress: { drop_console: true } } }),
        ])
        .end();
    }
  },
};
