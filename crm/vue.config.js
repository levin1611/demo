const webpack = require('webpack');
const { defineConfig } = require('@vue/cli-service');
const {name} = require('./package');
const path = require('path');
const AutoImport = require('unplugin-auto-import/webpack'); // 自动按需引入

const Components = require('unplugin-vue-components/webpack'); // 自动按需引入
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers'); // 自动按需引入
const ESLintWebpackPlugin = require('eslint-webpack-plugin');

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // 分析打包某块大小


// console.log(process.env.NODE_ENV)

function reslove(dir) {
    return path.join(__dirname, dir);
}
module.exports = defineConfig({
    productionSourceMap: false,
    configureWebpack: {
        resolve: {
            alias: {
                '@': reslove('src'),
                'vue': path.resolve('./node_modules/vue')
            },
            fallback: { 
                'crypto': false, 
                'constants': false,
                'assert': false,
                'buffer': require.resolve('buffer')
            }
        },
        output: {
            library: `${name}-[name]`,
            libraryTarget: 'umd',
            chunkLoadingGlobal: `webpackJsonp_${name}`
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/, // 排除node_modules代码不编译
                    loader: 'babel-loader'
                },
                // {
                //     // 匹配sass
                //     test: /\.(scss|sass)$/,
                //     use: ['sass-loader']
                // }
            ]
        },
        plugins: [
            AutoImport.default({
                resolvers: [ElementPlusResolver({
                    importStyle: false // 样式文件整体引入 因为用到的xhl_lib中有用到elemntuplus组件
                })]
            }),
            Components.default({
                resolvers: [ElementPlusResolver({
                    importStyle: false
                })]
            }),
            new ESLintWebpackPlugin({
                // 指定检查文件的根目录
                context: path.resolve(__dirname, 'src')
            }),
            // 使用公钥
            new webpack.ProvidePlugin({
                process: 'process/browser', 
                Buffer: ['buffer', 'Buffer']
            })
            // new BundleAnalyzerPlugin()
        ]
    },
    publicPath: '/Front-PermissionSystem',
    css: {
        extract: false,
        loaderOptions: {
            scss: {
                additionalData: `
@use "@/style/variables.module.scss" as *;
@use "@/plugins/element-plus/element_custom.scss" as *;
`
            }
        }
    },
    devServer: {
        hot: true,
        port: 8084,
        client: {
            overlay: false
        },
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    },
    transpileDependencies: true,
    chainWebpack(config) {
        config.resolve.symlinks(false);
    }
});
