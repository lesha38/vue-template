const webpack = require('webpack');
const path = require('path');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const AutoprefixerPlugin = require('autoprefixer');
const EslintFormatterPretty = require('eslint-formatter-pretty');
const WebpackPwaManifest = require('webpack-pwa-manifest');

module.exports = (env, argv) => {
  const {
    mode: MODE,
    debug: DEBUG,
    host: HOST,
    port: PORT,
    proxy: PROXY,
    'dev-server': DEV_SERVER,
  } = argv;

  const POSTFIX = argv.postfix ? `-${argv.postfix}` : '';

  const PRODUCTION = MODE === 'production';
  const DEVELOPMENT = MODE === 'development';

  const cacheLoader = {
    loader: 'cache-loader',
    options: {
      cacheDirectory: path.resolve(__dirname, './node_modules/.cache/cache-loader')
    }
  };

  const config = {
    entry: path.resolve(__dirname, './src/index.js'),
    output: {
      filename: `bundle${POSTFIX}.js`,
      path: DEBUG ? path.resolve(__dirname, './debug') : path.resolve(__dirname, './dist'),
      publicPath: DEV_SERVER ? '/' : './',
      chunkFilename: `[name].bundle${POSTFIX}.js`,
      hotUpdateChunkFilename: '~hot-update.[id].[hash].js',
      hotUpdateMainFilename: '~hot-update.[hash].json'
    },

    devtool: DEVELOPMENT ? 'eval-cheap-module-source-map' : false,

    devServer: DEV_SERVER ? {
      host: HOST === 'localhost' ? '0.0.0.0' : HOST,
      port: PORT || 9000,
      historyApiFallback: true,
      hot: true,
      inline: true,
      proxy: {
        '/api': {
          target: PROXY,
          secure: false
        },
      },
      stats: {
        children: false,
        entrypoints: false,
        modules: false,
        cachedAssets: false,
      }
    } : undefined,

    optimization: {
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          terserOptions: {
            extractComments: 'all',
            compress: {
              pure_funcs: [
                'console.log',
                'console.info',
                'console.dir',
                'console.debug',
              ],
            },
          },
        }),
        new OptimizeCSSAssetsPlugin()
      ],
      runtimeChunk: DEVELOPMENT && !DEBUG,
      splitChunks: {
        chunks: 'all',
        maxAsyncRequests: 5,
        maxInitialRequests: 5,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
          },
        }
      },
    },

    performance: {
      hints: false
    },
    stats: {
      children: false,
      entrypoints: false,
      modules: false
    },

    module: {
      rules: [
        {
          test: /\.(js|vue)$/i,
          use: [
            {
              loader: 'eslint-loader',
              options: {
                formatter: EslintFormatterPretty,
                configFile: path.resolve(__dirname, './.eslintrc.js'),
                ignorePath: path.resolve(__dirname, './.eslintignore'),
                fix: false,
                cache: false,
              }
            }
          ],
          include: path.resolve(__dirname, `./src/`),
          exclude: path.resolve(__dirname, `./node_modules/`),
          enforce: 'pre',
        },
        {
          test: /.vue$/i,
          use: [
            cacheLoader,
            'vue-loader',
          ],
          include: path.resolve(__dirname, `./src/`),
          exclude: path.resolve(__dirname, `./node_modules/`),
        },
        {
          test: /\.js$/i,
          use: [
            cacheLoader,
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: ['@babel/syntax-dynamic-import'],
              }
            },
          ],
          include: path.resolve(__dirname, `./src/`),
          exclude: path.resolve(__dirname, `./node_modules/`),
        },
        {
          test: /\.s?css$/i,
          use: [
            PRODUCTION ? MiniCssExtractPlugin.loader : 'vue-style-loader',
            cacheLoader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: [AutoprefixerPlugin]
              }
            },
            'resolve-url-loader',
            {
              loader: 'sass-loader',
              options: {
                prependData: `
                  @import "~styles/variables";
                  @import "~styles/mixins";
                  @import "~styles/classes";
                `,
              }
            }
          ],
        },
        {
          test: /\.(jpe?g|png|gif|webp)$/i,
          use: PRODUCTION ? [
            {
              loader: 'url-loader',
              options: {
                limit: 0,
                name: '[hash].[ext]',
                outputPath: 'images/',
              }
            },
            {
              loader: 'image-webpack-loader',
              options: {
                mozjpeg: {
                  progressive: true,
                  quality: 75,
                },
                // optipng.enabled: false will disable optipng
                optipng: {
                  enabled: false,
                },
                pngquant: {
                  quality: [0.75, 0.90],
                  speed: 4
                },
                gifsicle: {
                  interlaced: false,
                },
              }
            },
          ] : [
            {
              loader: 'url-loader',
              options: {
                limit: 0,
                name: '[hash].[ext]',
                outputPath: 'images/',
              }
            }
          ]
        },
        {
          test: /\.svg$/i,
          loader: 'svg-inline-loader'
        },
        {
          test: /\.(eot|ttf|woff|woff2)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 0,
                name: '[hash].[ext]',
                outputPath: 'fonts/',
              }
            }
          ]
        },
      ],
    },
    resolve: {
      extensions: ['*', '.vue', '.js', '.json', '.scss', '.svg'],
      alias: {
        assets: path.resolve(__dirname, './src/assets'),
        components: path.resolve(__dirname, './src/components'),
        helpers: path.resolve(__dirname, './src/helpers'),
        locale: path.resolve(__dirname, './src/locale'),
        router: path.resolve(__dirname, './src/router'),
        screens: path.resolve(__dirname, './src/screens'),
        store: path.resolve(__dirname, './src/store'),
        styles: path.resolve(__dirname, './src/styles'),
        src: path.resolve(__dirname, './src'),
        //
        vue$: path.resolve(__dirname, 'node_modules/vue/dist/vue.js'),
      }
    },
    plugins: [
      new HtmlPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, './src/index.html'),
        favicon: path.resolve(__dirname, './src/assets/favicon.ico'),
        title: '{{name}}',
        meta: {
          charset: { charset: 'utf-8' },
          viewport: 'width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, shrink-to-fit=no',
        },
        minify: {
          collapseWhitespace: true,
          removeComments: false,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: false
        },
      }),
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        DEVELOPMENT,
        PRODUCTION,
        PROXY: JSON.stringify(PROXY),
      }),
      new webpack.ProvidePlugin({})
    ]
  };

  const developmentPlugins = [
    new webpack.HotModuleReplacementPlugin()
  ];

  const productionPlugins = [
    new MiniCssExtractPlugin({
      filename: `styles${POSTFIX}.css`,
      chunkFilename: `[name].styles${POSTFIX}.css`
    }),
    new WebpackPwaManifest({
      name: '{{name}}',
      short_name: '{{name}}',
      description: '{{description}}',
      background_color: '#ffffff',
      theme_color: '#0099A6',
      crossorigin: null,
      filename: 'manifest.json',
      orientation: 'portrait',
      display: 'standalone',
      start_url: './',
      inject: true,
      fingerprints: false,
      ios: true,
      includeDirectory: true,
      icons: [
        {
          src: path.resolve(__dirname, 'src/assets/main-icon.png'),
          sizes: [36, 48, 96, 192, 512],
          destination: 'icons/',
        },
        {
          src: path.resolve(__dirname, 'src/assets/main-icon.png'),
          sizes: [57, 60, 72, 76, 114, 120, 144, 152, 180],
          ios: true,
          destination: 'icons/',
        },
        {
          src: path.resolve(__dirname, 'src/assets/main-icon.png'),
          size: 1024,
          ios: 'startup',
          destination: 'icons/',
        }
      ],
    }),
  ];

  if (DEVELOPMENT) {
    config.plugins.push(...developmentPlugins);
  }

  if (PRODUCTION) {
    config.plugins.push(...productionPlugins);
  }

  return config;
};
