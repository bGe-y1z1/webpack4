// 引入基础配置
const path = require('path');
const webpackCommon = require('./webpack.config.common');
const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssnanoPlugin = require('optimize-css-assets-webpack-plugin');
const { HashedModuleIdsPlugin } = require('webpack');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap(
  webpackMerge(webpackCommon, {
    mode: 'production',
    devtool: false,
    /**
     * 性能监控
     * @param hints 有性能问题会警告提示
     */
    performance: {
      hints: 'warning',
    },
    /**
     * 模块
     * @param noParse 优化项 去除解析项
     * @rules 解析规则
     */
    module: {
      rules: [
        /**
         * 解析 css预处理器
         * @param test 匹配规则
         * @param use loader 数组
         */
        {
          test: /\.styl(us)?$/,
          use: [
            'thread-loader',
            'vue-style-loader',
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader',
            'stylus-loader',
          ],
        },
        /**
         * 解析 css
         */
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    /**
     * 优化项
     */
    optimization: {
      /**
       * 分割代码块，如果只有一个入口，就不需要分割了，只有多页，才需要把公共的抽离出来
       * @param cacheGroups 缓存组
       * @param vendors 第三方库
       * @param common 公共的模块
       * @param priority 添加权重
       * @param minChunks 重复2次使用的时候需要抽离出来
       *
       */
      splitChunks: {
        cacheGroups: {
          vendors: {
            name: 'chunk-vendors',
            test: /node_modules/,
            priority: 1,
            chunks: 'initial', // 刚开始就要抽离
          },
          common: {
            name: 'chunk-common',
            minChunks: 2,
            priority: -20,
            chunks: 'initial',
            reuseExistingChunk: true,
          },
        },
      },
      minimizer: [
        new TerserPlugin({
          sourceMap: true,
          cache: true,
          parallel: true,
          extractComments: false,
        }),
        new OptimizeCssnanoPlugin({}),
      ],
    },
    plugins: [
      /**
       * 设置全局环境变量
       */
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"',
        },
      }),

      /**
       * 去除打包的文件
       */
      new CleanWebpackPlugin(),
      /**
       * 把chunk id变为一个字符串标识符。
       */
      new webpack.NamedChunksPlugin((chunk) => {
        if (chunk.name) {
          return chunk.name;
        }
        const modules = Array.from(chunk.modulesIterable);
        if (modules.length > 1) {
          const hash = require('hash-sum');
          const joinedHash = hash(modules.map((m) => m.id).join('_'));
          let len = nameLength;
          while (seen.has(joinedHash.substr(0, len))) len++;
          seen.add(joinedHash.substr(0, len));
          return `chunk-${joinedHash.substr(0, len)}`;
        } else {
          return modules[0].id;
        }
      }),
      /**
       * 该插件会根据模块的相对路径生成一个四位数的hash作为模块id
       */
      new HashedModuleIdsPlugin({
        hashDigest: 'hex',
      }),
      /**
       * 将CSS提取为独立的文件的插件，对每个包含css的js文件都会创建一个CSS文件，支持按需加载css和sourceMap
       */
      new MiniCssExtractPlugin({
        filename: '[name].[hash].css',
        chunkFilename: '[id].[hash].css',
      }),
    ],
  })
);
