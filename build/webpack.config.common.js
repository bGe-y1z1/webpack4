const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PreloadPlugin = require('preload-webpack-plugin');
const webpackConfig = {
  /*
   * 入口文件配置
   */
  entry: {
    app: './src/index.js',
  },

  /**
   * 出口文件配置
   * @param path 输出文件路径
   * @param filename 输出文件名称
   * @param publicPath  输出的根路径 也可以设置为cdn链接
   * @param chunkFilename  单独打包的文件 没有依赖关系的包
   */
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name]-[hash:7].js', // 打包成7位的hash
    publicPath: '', // 项目的跟目录可以配置cdn链接
    chunkFilename: '[name].js', // 单独打包的文件 分包
  },

  /**
   * 模块解析
   * @param extensions 解析文件的后缀顺序
   * @param  alias 设置文件别名
   * @param modules 设置模块的搜索目录
   */
  resolve: {
    extensions: ['.js', '.vue', '.json'], // 解析文件顺序
    alias: {
      '@': path.resolve(__dirname, '../src'),
    }, // 设置文件别名
    // modules: ['node_modules'], // 设置模块搜索的目录
  },
  stats: {
    entrypoints: false,
    children: false,
  },
  /**
   * 模块
   * @param noParse 优化项 去除解析项
   * @rules 解析规则
   */
  module: {
    /**
     * 解析文件排除 vue|vue-router|vuex|vuex-router-sync
     */
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
      /**
       * 解析 es6 babel
       * @param test 匹配规则
       * @param loader 使用的loader  babel-loader @babel/core
       * @param exclude 排除的文件
       * @param include 包含的文件
       */
      {
        test: /\.(jsx?|babel|es6)$/,
        include: process.cwd(), // 运行的目录
        exclude: /node_modules/,
        use: ['cache-loader', 'thread-loader', 'babel-loader'],
      },

      /**
       * 解析.vue 文件
       * @param test 匹配规则
       * @param loader 使用的loader  vue-loader vue-template-compiler 配置插件 new VueLoaderPlugin()
       * @param options 配置参数
       */
      {
        test: /\.vue$/,
        use: [
          'cache-loader',
          'thread-loader',
          {
            loader: 'vue-loader',
            options: {
              compilerOptions: {
                preserveWhitespace: false,
              },
            },
          },
        ],
      },
      /**
       * 解析 图片
       * 加载文件为base64编码的URL
       * 以字节为单位
       * 当文件大于限制(以字节为单位)时，为文件指定加载器
       * @param test 匹配规则
       * @param use loader 数组
       */
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'img/[name].[hash:8].[ext]',
                },
              },
            },
          },
        ],
      },

      /**
       * 解析 svg
       * 默认情况下，生成的文件的文件名就是文件内容的MD5哈希值并保留所引用资源的原始扩展名
       * 生成文件 file.png，输出到输出目录并返回 public URL。
       * "/public/path/0dcbbaa7013869e351f.png"
       * @param test 匹配规则
       * @param use loader 数组
       */
      {
        test: /\.(svg)(\?.*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[hash:8].[ext]',
            },
          },
        ],
      },

      /**
       * 解析 视频
       * 用法" class="icon-link" href="#用法">
       * 加载文件为base64编码的URL
       * 以字节为单位
       * 当文件大于限制(以字节为单位)时，为文件指定加载器
       * @param test 匹配规则
       * @param use loader 数组
       */
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'media/[name].[hash:8].[ext]',
                },
              },
            },
          },
        ],
      },

      /**
       * 解析 字体文件
       * 用法" class="icon-link" href="#用法">
       * 加载文件为base64编码的URL
       * 以字节为单位
       * 当文件大于限制(以字节为单位)时，为文件指定加载器
       * @param test 匹配规则
       * @param use loader 数组
       */
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'fonts/[name].[hash:8].[ext]',
                },
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    /**
     * vue-loader 插件
     * 将你定义过的其它规则复制并应用到 .vue 文件里相应语言的块。例如，如果你有一条匹配 /\.js$/ 的规则，
     * 那么它会应用到 .vue 文件里的 <script> 块
     */
    new VueLoaderPlugin(),
    new ProgressBarPlugin(),
    /**
     * 强制所有必需模块的完整路径与磁盘上实际路径的精确情况匹配。
     * 使用这个插件可以帮助缓解在OSX上工作的开发人员与其他开发人员发生冲突，
     * 或者构建运行其他操作系统的机器，这些操作系统需要正确使用大小写的路径。
     */
    new CaseSensitivePathsPlugin(),

    /**
     * 识别某些类的webpack错误并清理、聚合和优先化它们，以提供更好的开发人员体验。
     */
    new FriendlyErrorsWebpackPlugin(),
    /**
     *简单创建 HTML 文件，用于服务器访问
     */
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './public/index.html',
      inject: true,
      // favicon: resolve('favicon.ico'),
      title: 'demo',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
    }),

    /**
     * 预取出普通的模块请求(module request)，
     * 可以让这些模块在他们被 import 或者是 require 之前就解析并且编译。
     * 使用这个预取插件可以提升性能。可以多试试在编译前记录时间(profile)来决定最佳的预取的节点。
     */
    new PreloadPlugin({
      rel: 'prefetch',
      include: 'asyncChunks',
    }),
    /**
     * 公共资源拷贝
     */
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../public'),
        to: path.resolve(__dirname, '../dist'),
        toType: 'dir',
      },
    ]),

    /**
     * 优化项 排除依赖不需要目录
     */
    // new Webpack.IgnorePlugin()
  ],
};
module.exports = webpackConfig;
