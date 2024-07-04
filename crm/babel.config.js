module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset',
        '@babel/preset-env'
    ],
    plugins: [['import', {
        'libraryName': 'xhl_lib',
        'style': false, // or 'css'
        libraryDirectory: 'xhl-ui/components'
    }]]
};
