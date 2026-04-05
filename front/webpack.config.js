const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** Прокси API: по умолчанию Railway (без CORS в браузере). Локально: TSYG_API_PROXY=http://localhost:8000 npm run web */
const API_PROXY_TARGET =
  process.env.TSYG_API_PROXY ||
  'https://tsyganestan-production.up.railway.app';

/** Для GitHub Pages: PUBLIC_PATH=/RepoName/ (со слэшем в конце). Локально: /. */
const publicPath = process.env.PUBLIC_PATH || '/';

const reanimatedStub = path.resolve(__dirname, 'src/shims/reanimated-web-stub.js');

module.exports = (env, argv) => {
  const mode = argv.mode || 'development';
  const isProd = mode === 'production';

  return {
    mode,
    entry: path.join(__dirname, 'index.web.tsx'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.[contenthash].js',
      clean: true,
      publicPath,
    },
    resolve: {
      alias: {
        'react-native$': 'react-native-web',
        'react-native-sensors': path.join(
          __dirname,
          'src/shims/react-native-sensors.web.js',
        ),
        'react-native-reanimated': reanimatedStub,
      },
      extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: ['react-native-web'],
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      // Жёсткая подмена: иначе webpack падает на resolve до try/catch в gesture-handler.
      new webpack.NormalModuleReplacementPlugin(
        /^react-native-reanimated$/,
        reanimatedStub,
      ),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'public', 'index.html'),
      }),
      new webpack.DefinePlugin({
        'process.env.PUBLIC_API_URL': JSON.stringify(
          process.env.PUBLIC_API_URL ||
            'https://tsyganestan-production.up.railway.app',
        ),
      }),
    ],
    performance: isProd
      ? {
          maxAssetSize: 1_600_000,
          maxEntrypointSize: 1_600_000,
          hints: 'warning',
        }
      : { hints: false },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      hot: true,
      // 3000 часто занят старым процессом — по умолчанию 3010; свой порт: WEB_PORT=3005 npm run web
      port: Number(process.env.WEB_PORT) || 3010,
      proxy: [
        {
          context: ['/auth', '/tours', '/users'],
          target: API_PROXY_TARGET,
          changeOrigin: true,
          secure: true,
        },
      ],
    },
  };
};
