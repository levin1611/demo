module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset'
    ],
    "env": {
        "development": {
            "plugins": ['dynamic-import-node']
        }
    },
    "plugins": [
        [
            'component',
            {
                libraryName: 'element-ui',
                styleLibraryName: 'theme-chalk'
            }
        ],
        [
            'import', {
                libraryName: 'view-design',
                libraryDirectory: 'src/components'
            },
            'view-design'
        ],
        [
            'import', {
                libraryName: 'vxe-table',
                style: true // 样式是否也按需加载
            },
            'vxe-table'
        ],
        '@babel/plugin-transform-runtime'
    ]
};
