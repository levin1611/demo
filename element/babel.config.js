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
                style: true // ��ʽ�Ƿ�Ҳ�������
            },
            'vxe-table'
        ],
        '@babel/plugin-transform-runtime'
    ]
};
