const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** Прокси API: по умолчанию Railway (без CORS в браузере). Локально: TSYG_API_PROXY=http://localhost:8000 npm run web */
const API_PROXY_TARGET =
  process.env.TSYG_API_PROXY ||
  'https://tsyganestan-production.up.railway.app';

/** Для GitHub Pages: PUBLIC_PATH=/RepoName/ (со слэшем в конце). Локально: /. */
const publicPath = process.env.PUBLIC_PATH || '/';

/**
 * Dev server: по умолчанию «auto» от базы WEBPACK_DEV_SERVER_BASE_PORT (3010 в npm script),
 * чтобы не падать с EADDRINUSE, если порт занят — возьмётся 3011, 3012, …
 * Жёстко задать порт: WEB_PORT=3005 npm run web
 */
function resolveWebDevPort() {
  const raw = process.env.WEB_PORT;
  if (raw == null || String(raw).trim() === '') return 'auto';
  if (String(raw).trim().toLowerCase() === 'auto') return 'auto';
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1 || n > 65535) return 'auto';
  return n;
}
const webDevPort = resolveWebDevPort();

const reanimatedStub = path.resolve(__dirname, 'src/shims/reanimated-web-stub.js');
const linearGradientShim = path.resolve(
  __dirname,
  'src/shims/linear-gradient-web-shim.js',
);

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
        'react-native-linear-gradient': linearGradientShim,
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
      new webpack.NormalModuleReplacementPlugin(
        /^react-native-linear-gradient$/,
        linearGradientShim,
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
      port: webDevPort,
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
