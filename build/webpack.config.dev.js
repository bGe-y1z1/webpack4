// 引入基础配置
const path = require('path');
const webpack = require('webpack');
const webpackCommon = require('./webpack.config.common');
const webpackMerge = require('webpack-merge');

module.exports = webpackMerge(webpackCommon, {
  /**
   * 打包模式
   */
  mode: 'development',

  /*
   * 开启sourcemap调试
   */
  devtool: 'eval-source-map',

  /**
   * 本地服务
   * @param contentBase 因为热更新使用的是内存 默认资源是保存在内存中的 需要使用publishpath制定相对路径
   * @param port 端口
   * @param hot 是否开启热更新
   * @param hotOnly
   * @param inline inline模式开启服务器
   * @param open 自动打开页面
   * @param clientLogLevel 阻止打印那种搞乱七八糟的控制台信息
   * @param historyApiFallback 跳转页面
   * @param openPage 默认打开的页面
   */
  devServer: {
    contentBase: path.join(__dirname, './src'),
    port: 8085,
    hot: true,
    hotOnly: true,
    inline: true,
    open: true,
    clientLogLevel: 'none',
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
          'css-loader',
          'stylus-loader',
        ],
      },
    ],
  },
  plugins: [
    /**
     * 设置全局环境变量
     */
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"',
      },
    }),

    /**
     * 打印更新的模块路径，告诉我们哪个模块热更新了
     */
    new webpack.NamedModulesPlugin(),

    /**
     * 热更新插件
     */
    new webpack.HotModuleReplacementPlugin(),
  ],
});
