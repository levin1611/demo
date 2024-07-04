# my-project

[toc]

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## 样式修改原则
### variables.module.scss
放置与框架无关的全局变量

已定义到全局(vue.config.js 中 webpack 配置 addtionalData 中)

但注意, 用到全局变量的其他 scss 文件被 @use 引用时, 如果内部没有手动 @use 此文件, 仍会报错(@import 就没事儿), 所以还是建议 scss 内部使用 @use 引入此文件

### js.module.scss
导出 variables.module.scss 的变量给 template 和 script 使用
style 中可直接使用 variables.module.scss 变量(已定义到全局)

### plugins/element-plus
放置 element-plus 相关全局定制内容
1. element_custom.scss

    定制 elemnet 主题
2. element_global.scss

    主题定制不了的全局样式, 通过覆盖组件的样式变量/直接写样式/定义附加的样式 class 来全局修改样式
3. element_custom.js

    修改组件的 props 默认值

### common.scss
复制用的到的 tailwindcss 的原子化 class

### global.scss
main.js 引入的全局样式, 与具体 UI 框架无关

它内部引入了 common.scss
