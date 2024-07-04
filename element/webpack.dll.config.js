const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 清空文件用的
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // 压缩代码用的

// dll文件存放的目录(建议存放到public)
const dllPath = './public/dll';
const arr = [
    'element-ui'
];
module.exports = {
    mode: 'production', // 告诉 webpack 当前环境为生产环境
    // 入口 dll 自定义模块名字：{依赖1, 依赖2, ...}
    entry: { // 多入口，单入口情况，只需写一个，key值自定义，value值为数组
        vue: arr
    },
    // 出口
    output: {
        filename: 'dll.[name].js', // 其中[name] 就是entry中的dll模块名字，因此filename就是dll.vue.js
        path: path.join(__dirname, dllPath, '/js'), // 输出打包的依赖文件到 dll/js 文件夹中
        library: '[name]_library' // 暴露出的全局变量名，用于给 manifest 映射
    },
    plugins: [
    // 重新打包时，清除之前打包的dll文件
        new CleanWebpackPlugin(),
        // 生成 manifest.json 描述动态链接库包含了哪些内容
        new webpack.DllPlugin({
            // 暴露出的 dll 的函数名，此处需要和 output.library 的值一致
            // 输出的 manifest.json 文件的输出路径
            name: '[name]_library',
            context: __dirname, // 在项目主要的配置中需要和这保持一致
            // path 指定 manifest.json 文件的输出路径
            path: path.join(__dirname, dllPath, '[name]-manifest.json') // DllReferencePlugin 使用该json文件夹来做映射依赖。
        }),
        new BundleAnalyzerPlugin() // 压缩
    ]
};

