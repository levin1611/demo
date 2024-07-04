const path = require('path');
const webpack = require('webpack');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = ['js', 'css'];
// 打包后通过 localhost:8888 查看各个文件的大小和内部的模块
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const resolve = dir => {
    return path.join(__dirname, dir);
};
const CDN = {
    // js: [
    //     'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
    //     'https://cdn.jsdelivr.net/npm/js-cookie@2.2.1/src/js.cookie.min.js',
    //     'https://cdn.jsdelivr.net/npm/qiniu-js@2.5.5/dist/qiniu.min.js'
    // ]
};
const VueConfig = {
    publicPath: '/Front-Vue',
    lintOnSave: false,
    chainWebpack: config => {
        config.resolve.alias
            .set('vue$', 'vue/dist/vue.esm.js')
            .set('@', resolve('src')); // key,value自行定义，比如.set('@@', resolve('src/components'))

        // 移除 prefetch 插件
        config.plugins.delete('prefetch');
        // 移除 preload 插件
        config.plugins.delete('preload');
        // if (process.env.NODE_ENV === 'production') {
        //     config.plugin('html').tap(arg => {
        //         arg[0].CDN = CDN;
        //         return arg;
        //     });
        // }
        // const imagesRule = config.module.rule('images');
        // imagesRule
        //     .use('image-webpack-loader')
        //     .loader('image-webpack-loader')
        //     .options({
        //         bypassOnDebug: true
        //     })
        //     .end();
    },
    // 打包时不生成.map文件
    productionSourceMap: false,
    // css相关配置
    css: {
        // 是否使用css分离插件 ExtractTextPlugin
        extract: true,
        // 开启 CSS source maps?
        sourceMap: false
    },

    // 配置 webpack-dev-server
    devServer: {
        port: 8080, // 端口号的配置
        compress: false, // 开启压缩
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        hot: true, // 热更新
        allowedHosts: [
            '.leadscloud.com' 
        ],
    },

    /* webpack 配置文件, 从原项目迁移过来, 通过 vue inspect > inspectWebpackConfig.json 重定向到文件, 查看和 vue-cli3 配置合并后文件, 删除多余选项 */
    configureWebpack: {
        optimization: {
            splitChunks: {
                chunks: 'all',
                minChunks: 2, // 模块至少使用次数
                maxAsyncRequests: 30,
                maxInitialRequests: 30,
                cacheGroups: {
                    vendors: {
                        name: 'chunk-vendors',
                        test: /[\\/]node_modules[\\/]/,
                        priority: 1,
                        chunks: 'all',
                        reuseExistingChunk: true,
                        maxSize: 60 * 1024
                        // filename: 'vendors.js'
                    },
                    default: {
                        chunks: 'all',
                        minChunks: 2, // 模块至少使用次数
                        priority: -10,
                        reuseExistingChunk: true
                        // maxSize: 60 * 1024
                    }
                }
            },
            minimizer: [
                // 自定义js优化配置，将会覆盖默认配置
                // new UglifyJsPlugin({
                //     exclude: /\.min\.js$/, // 过滤掉以".min.js"结尾的文件，我们认为这个后缀本身就是已经压缩好的代码，没必要进行二次压缩
                //     cache: true,
                //     parallel: true, // 开启并行压缩，充分利用cpu
                //     sourceMap: false,
                //     extractComments: false, // 移除注释
                //     uglifyOptions: {
                //         compress: {
                //             unused: true,
                //             warnings: false,
                //             drop_debugger: true
                //         },
                //         output: {
                //             comments: false
                //         }
                //     }
                // }),
                new TerserPlugin({
                    exclude: /\.min\.js$/, // 过滤掉以".min.js"结尾的文件，我们认为这个后缀本身就是已经压缩好的代码，没必要进行二次压缩
                    extractComments: false // 移除注释
                    // terserOptions: {
                    //     compress: {
                    //         // drop_console: true, // 去掉所有 console
                    //         pure_funcs: ['console.log'] // 去掉指定函数
                    //     }
                    // }
                }),
                // 用于优化css文件
                new OptimizeCSSAssetsPlugin({
                    assetNameRegExp: /\.css$/g,
                    cssProcessorOptions: {
                        safe: true,
                        autoprefixer: { disable: true },
                        mergeLonghand: false,
                        discardComments: {
                            removeAll: true // 移除注释
                        }
                    },
                    canPrint: true
                })
            ],
            runtimeChunk: 'single'
        },

        output: {
            filename: '[name].[hash].js',
            chunkFilename: 'js/[name].[hash].chunk.js'
        },

        module: {
            rules: [
                {
                    test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
                    use: [
                        /* 对图片进行压缩 */
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                mozjpeg: {
                                    progressive: true,
                                    quality: 65
                                },
                                // optipng.enabled: false will disable optipng
                                optipng: {
                                    enabled: false
                                },
                                pngquant: {
                                    quality: [0.65, 0.90],
                                    speed: 4
                                },
                                gifsicle: {
                                    interlaced: false
                                },
                                // the webp option will enable WEBP
                                webp: {
                                    quality: 75
                                }
                            }
                        }
                    ]
                }
            ]
        },

        plugins: [
            // new webpack.DllReferencePlugin({
            //     context: __dirname,
            //     manifest: require('./public/dll/vue-manifest.json')
            // }),
            new HtmlWebpackPlugin({
                title: ' ',
                // favicon: './favicon.ico',
                filename: '../index.html',
                template: '!!ejs-loader!./src/template/index.ejs',
                // inject: false,
                inject: true,
                chunks: ['runtime', 'app'],
                chunksSortMode: 'dependency',
                minify: { // 压缩 HTML 的配置
                    collapseWhitespace: true,
                    removeComments: true,
                    useShortDoctype: true
                }
            }),

            new InlineManifestWebpackPlugin('runtime'),

            new webpack.NamedModulesPlugin(),

            new CompressionPlugin({
                filename: '[path].gz[query]',
                algorithm: 'gzip',
                // 需要压缩的文件类型
                test: new RegExp(`\\.(${productionGzipExtensions.join('|')})$`),
                // 触发压缩的文件大小最小值
                threshold: 10240,
                // 压缩比, 文件压缩后大小/原始文件大大于此比率才进行压缩
                minRatio: 0.8
            })
            // new BundleAnalyzerPlugin()
        ],
        externals: {
        }
    }
};
// if (process.env.NODE_ENV === 'production') {
//     // VueConfig.configureWebpack.externals = {
//     //     lodash: '_',
//     //     jquery: '$',
//     //     'js-cookie': 'Cookies',
//     //     'qiniu-js': 'qiniu'
//     // };
// };
module.exports = VueConfig;


