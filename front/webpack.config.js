const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** Прокси API: по умолчанию Railway (без CORS в браузере). Локально: TSYG_API_PROXY=http://localhost:8000 npm run web */
const API_PROXY_TARGET =
  process.env.TSYG_API_PROXY ||
  'https://tsyganestan-production.up.railway.app';

/**
 * Dev server: порт «auto» от базы WEBPACK_DEV_SERVER_BASE_PORT (3000 в npm script).
 * Если 3000 занят — поднимется 3001, 3002, … (смотри URL в логе webpack).
 * Жёстко задать порт: WEB_PORT=3010 npm run web
 * Не открывать браузер: WEB_OPEN=0 npm run web
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
const asyncStorageShim = path.resolve(
  __dirname,
  'src/shims/async-storage.web-shim.js',
);
const imagePickerShim = path.resolve(
  __dirname,
  'src/shims/react-native-image-picker.web.js',
);

module.exports = (env, argv) => {
  const mode = argv.mode || 'development';
  const isProd = mode === 'production';
  /**
   * production: по умолчанию 'auto' → в index.html относительный script src (bundle.xxx.js).
   * Работает и с dev-сервером по http, и при открытии dist/index.html через file://.
   * CI/GitHub Pages: задать PUBLIC_PATH=/RepoName/ (со слэшем).
   * development: '/' — нужен для HMR dev-server.
   */
  const publicPath = isProd
    ? process.env.PUBLIC_PATH || 'auto'
    : '/';

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
        // Точное имя пакета (иногда exports обходят — дублируем плагином ниже).
        '@react-native-async-storage/async-storage': asyncStorageShim,
        '@react-native-async-storage/async-storage$': asyncStorageShim,
        'react-native-image-picker': imagePickerShim,
      },
      extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          // Babel только на нашем коде. Прогон node_modules ломает ESM (@react-navigation и др.)
          // в Safari: «Can't find variable: exports».
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { modules: false }],
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [
                ['@babel/plugin-transform-class-properties', { loose: true }],
                ['@babel/plugin-transform-private-methods', { loose: true }],
                [
                  '@babel/plugin-transform-private-property-in-object',
                  { loose: true },
                ],
                'react-native-web',
              ],
            },
          },
        },
        {
          test: /\.(js|mjs)$/,
          include: /node_modules/,
          resolve: { fullySpecified: false },
          type: 'javascript/auto',
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
      // afterResolve смотрит на абсолютный путь; иначе часто тянется lib/module/index.js мимо alias.
      new webpack.NormalModuleReplacementPlugin(
        /[\\/]node_modules[\\/]@react-native-async-storage[\\/]async-storage[\\/]/,
        asyncStorageShim,
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^react-native-image-picker$/,
        imagePickerShim,
      ),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'public', 'index.html'),
      }),
      new webpack.DefinePlugin({
        /** Metro задаёт глобально; без этого gesture-handler и др. падают в web-сборке. */
        __DEV__: JSON.stringify(!isProd),
        'process.env.NODE_ENV': JSON.stringify(
          isProd ? 'production' : 'development',
        ),
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
      /** Открыть вкладку с тем портом, который реально занял dev-server (избегает путаницы с :3000). */
      open: process.env.WEB_OPEN !== '0',
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
