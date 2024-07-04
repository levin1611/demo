<template>
    <div>
        <div id="vEditor"></div>

        <Upload
                ref="imageUpload"
                :on-success="insertImage"
                :action="action"
                accept=".png,.jpeg,.jpg,.gif,.bmp,.ico"
                style="display:none">
        </Upload>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import tinymce from 'tinymce/tinymce';
    import 'tinymce/themes/silver';
    /** 解决tinymce Firefox浏览器兼容问题 */
    import 'tinymce/plugins/paste';
    import 'tinymce/plugins/image';
    import 'tinymce/plugins/link';
    import 'tinymce/plugins/autolink';
    import 'tinymce/plugins/lists';
    import 'tinymce/plugins/hr';
    import 'tinymce/plugins/nonbreaking';
    import 'tinymce/plugins/charmap';
    import 'tinymce/plugins/print';
    import 'tinymce/plugins/anchor';
    import 'tinymce/plugins/imagetools';
    import 'tinymce/plugins/media';
    import 'tinymce/plugins/save';
    import 'tinymce/plugins/directionality';
    import 'tinymce/plugins/textcolor';
    import 'tinymce/plugins/colorpicker';
    import 'tinymce/plugins/textpattern';
    import 'tinymce/plugins/fullscreen';
    import 'tinymce/plugins/table';
    import 'tinymce/plugins/code';
    import 'tinymce/plugins/emoticons';
    import 'tinymce/icons/default';
    import '@/utils/tinymcplaceholder';
    import * as qiniu from 'qiniu-js';
    export default {
        name: 'editor',
        props: ['action', 'cursorType', 'currEditor', 'isInitFinishedMail', 'actId', 'is_show', 'initHeight'],
        data() {
            return {
                defaultMailSetting: {
                    fontFamilyValue: 'arial', // 默认写信字体
                    fontSizeValue: '16px', // 默认写信字号
                    fontColorValue: '#000' // 默认写信颜色
                }
            };
        },
        components: {},
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                qiniuHttp: 'qiniuHttp',
                qiniuUrl: 'qiniuUrl',
                window_width: 'window_width',
                window_height: 'window_height',
                currentPersonId: state => state.mail.currentPersonId,
                saveWithWhich: state => state.mail.saveWithWhich,
                userName: state => state.userName,
                // 写信页面富文本编辑器 content_style 配置中会影响邮件内容渲染的样式
                tinymce_contentStyle: state => state.mail.tinymce_contentStyle
            })
        },
        mounted() {
            console.log('初始化编辑器');
            this.initEditor();
        },
        methods: {
            /* 初始化编辑器 */
            initEditor() {
                const vm = this;
                tinymce.init({
                    selector: '#vEditor',
                    editorName: 'vEditor',
                    placeholder: vm.$t('aiToolBar.placeholder'),
                    theme: 'silver',
                    language_url: `${process.env.BASE_URL}tinymce/langs/zh_CN.js`,
                    skin_url: `${process.env.BASE_URL}tinymce/skins/ui/oxide`,
                    skin: 'oxide',
                    browser_spellcheck: true, // 拼写检查
                    branding: false, // 去水印
                    valid_children: '+div[style]', // 保留style标签不被编辑器过滤
                    elementpath: false, // 禁用编辑器底部的状态栏
                    // statusbar: false,  //隐藏编辑器底部的状态栏
                    paste_data_images: true, // 允许粘贴图像
                    paste_enable_default_filters: false, // paste插件 禁用TinyMCE的默认粘贴过滤器。
                    paste_webkit_styles: 'all', // 指定在WebKit中粘贴时要保留的样式
                    height: vm.initHeight || (vm.window_height - 482),
                    language: vm.$t('mail.editor_lauguage'),
                    plugins: 'undo redo fullscreen autolink lists link image charmap print hr anchor imagetools media nonbreaking directionality paste textpattern formatpainter table hr code emoticons placeholder',
                    // 添加扩展插件
                    external_plugins: {
                        formatpainter: `${process.env.BASE_URL}tinymce/formatpainter/plugin.min.js`
                    },
                    nonbreaking_force_tab: true, // 编辑器插入制表符
                    contextmenu: false, // 禁用编辑器上下文菜单
                    lineheight_formats: '1 1.2 1.5 1.6 1.8 2 2.4 3',  // 设置行高列表
                    menubar: false,
                    table_default_styles: {
                        'border-collapse': 'collapse',
                        width: '100%'
                    },
                    table_advtab: false,
                    table_cell_advtab: false,
                    toolbar: [
                        'undo redo formatpainter | fontselect fontsizeselect | forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent lineheight | insertImageBtn link table emoticons hr | fullscreen code removeformat'
                    ],
                    toolbar_mode: 'floating',
                    emoticons_database_url: 'emojis.js',
                    font_formats: '黑体="黑体";宋体="宋体";微软雅黑="微软雅黑";楷体="楷体";Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Calibri=calibri;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats',
                    fontsize_formats: '12px 14px 16px 18px 24px 36px 48px', // 字号选项
                    autosave_interval: '20s',
                    /**
                     * @Description: 此样式会以 style 标签插入到 head 中, 而发送邮件时用的是 body 内容, 不包括此内容, 因此可能导致邮件详情页邮件内容显示错位
                     * 例: 图片右对齐时, 相邻文字被富文本编辑器产生的空行挤到下方, 但是如果没有 line-height: 1.5 , 空行行高不够, 图片和文字错位
                     * 解决: 将影响布局的样式存入 vuex tinymce_contentStyle , 发邮件之前先把这条样式加上去, 历史数据也尽量做下处理
                     * 因此要注意!!!!!!!!!!!!!!!!!!!!!!!如果以后修改了这条样式, 一定要同步修改 tinymce_contentStyle , 以及注意历史数据
                     * @author 汤一飞
                     * @date 2021/6/2
                     */
                    content_style: `
                        div { line-height:1.5; margin: 0;word-break: break-word!important;} body { margin: 2rem; } pre{ white-space: pre-wrap; }
                    `,
                    forced_root_block: 'div', /* 参数 将非块元素或文本节点都包含在设置的元素中 回车 其他邮件中用的大部分是div包裹元素 */
                    visual: false,
                    images_upload_handler: function(blobInfo, success, failure) {
                        console.log(blobInfo, '粘贴图片');
                        const config = {
                            useCdnDomain: true,
                            region: qiniu.region.z0
                        };
                        const observer = {
                            error(err) {
                                console.log(err);
                            },
                            complete(res) {
                                success(vm.qiniuHttp + res.key);
                            }
                        };
                        const putExtra = {
                            fname: '',
                            params: {}
                        };
                        const uid = Date.now() + blobInfo.name();
                        util
                            .oldAjax({
                                url: '/file-sys/api/uptoken',
                                method: 'post'
                            })
                            .then(response => {
                                vm.uptoken = response.data.uptoken;
                                vm.action =
                                    `//upload.qiniup.com?token=${response.data.uptoken}`;

                                const observable = qiniu.upload(blobInfo.blob(), uid, vm.uptoken, putExtra, config);
                                const subscription = observable.subscribe(observer);
                            });
                    },
                    setup: function(editor) {
                        editor.on('init', function(e) {
                            console.log('初始化编辑器', vm.mailContent);
                            /**
                             * @Description: 更改富文本编辑器默认字体/字号/颜色
                             * @author wanghongzhu
                             * @date 2020/4/27
                             */
                            this.getBody().style.fontSize = vm.defaultMailSetting.fontSizeValue;
                            this.getBody().style.color = vm.defaultMailSetting.fontColorValue;
                            this.getBody().style.fontFamily = vm.defaultMailSetting.fontFamilyValue;
                            vm.$emit('update:currEditor', tinymce.editors.find(item => item.id === 'vEditor'));
                            vm.$emit('update:isInitFinishedMail', true);
                            if (vm.actId === -1 || !vm.actId) {
                                vm.$emit('update:is_show', false);
                            }
                            // 初始化页面回显数据
                            vm.$emit('initPage');
                        });
                        editor.on('focus', function(e) {
                            vm.$emit('update:cursorType', 'editor');
                            // 校验必填字段不为空
                            vm.$emit('requiredItemsVerification');
                        });

                        // ai tool bar
                        editor.on('mouseup', function (e) {
                            setTimeout(() => {
                                const selection = editor.selection;
                                const text = selection.getContent({ 'format': 'text' }).trim();
                                const preText = selection.getContent({ 'format': 'html' });
                                const editorIframe = document.getElementById('vEditor_ifr');
                                const frameRect = editorIframe.getBoundingClientRect()
                                const { left, top  } = frameRect
                                if (text) {
                                    vm.$aiToolBar.init({
                                        type: 'inputBoxSelect',
                                        value: text,
                                        mouseX: left + e.clientX,
                                        mouseY: top + e.clientY,
                                        onCover: (v) => {
                                            vm.$aiToolBar.destroy();
                                            const id = `cover-${Math.ceil(Math.random() * 1000)}`
                                            editor.selection.setContent(`<span id="${id}">${v.replace(/\n/g,'<br>')}</span>`, {format: 'html'});
                                            // auto select
                                            const selection = tinymce.activeEditor.selection;
                                            selection.select(tinymce.activeEditor.dom.select(`span[id="${id}"]`)[0], true);
                                        },
                                        onInsert: (v) => {
                                            vm.$aiToolBar.destroy();
                                            const id = `insert-${Math.ceil(Math.random() * 1000)}`
                                            editor.selection.setContent(`${preText}<div id="${id}">${v.replace(/\n/g,'<br>')}</div>`);
                                            const selection = tinymce.activeEditor.selection;
                                            selection.select(tinymce.activeEditor.dom.select(`div[id="${id}"]`)[0], true);
                                        }
                                    })
                                } else {
                                    vm.$aiToolBar.destroy();
                                }
                            }, 0);
                        });
                        editor.on('input', function(e) {
                            // ai tool bar mail marking
                            const content = tinymce.activeEditor.getContent({ format: 'text' }).trim();
                            const text = content.split('\n')[0]
                            if (text.trim().toLowerCase() === '/ai') {
                                vm.$aiToolBar.init({
                                    type: 'inputBoxSlash',
                                    onConfirm: (v) => {
                                        const preContent = tinymce.activeEditor.getContent({ format: 'html' });
                                        vm.$aiToolBar.destroy();
                                        tinymce.activeEditor.setContent(`<div id="new-added">${v.replace(/\n/g,'<br>')}</div>${preContent.replace(text, '')}`, {format: 'html'});
                                        // auto select
                                        const selection = tinymce.activeEditor.selection;
                                        selection.select(tinymce.activeEditor.dom.select('div[id="new-added"]')[0], true);
                                    },
                                    onAbort: () => {
                                        const preContent = tinymce.activeEditor.getContent({ format: 'html' });
                                        tinymce.activeEditor.setContent(preContent.replace(text, ''), {format: 'html'});
                                    }
                                })
                            } else {
                                vm.$aiToolBar.destroy();
                            }

                            // 校验必填字段不为空
                            vm.$emit('requiredItemsVerification');
                        });
                        editor.on('keyup', function(e) {
                            // 校验必填字段不为空
                            vm.$emit('requiredItemsVerification');
                        });
                        editor.on('change', function(e) {
                            // 校验必填字段不为空
                            vm.$emit('requiredItemsVerification');
                        });
                        editor.on('paste', function(event) {
                            console.log(event.clipboardData, window.clipboardData);
                            const items = (event.clipboardData || window.clipboardData).items;
                            if (items && items.length) {
                                if (items[items.length - 1].type === 'application/whatsapp') {
                                /**
                                 * @Description: 客户报错: whatsapp 消息粘贴不了
                                 * @author 汤一飞
                                 * @date 2021/5/31
                                 */
                                } else if (items[items.length - 1].type === 'text/plain') {
                                    /**
                                     * @Description: 之前客户报错: 粘贴 Google 翻译内容时, 没有保留换行和空格
                                     * 因为发现富文本编辑器官网粘贴文本就能保留换行和空格, 所以直接注释原有的纯文本处理逻辑, 按富文本编辑器默认行为走
                                     * 但是现在又提 BUG -- 粘贴翻译后内容到富文本编辑器时, 换行不能显示, 官网也不能
                                     * 所以现在还是加上纯文本处理逻辑, 将换行和空格都转换一下再粘贴
                                     * @author 汤一飞
                                     * @date 2021/7/12
                                     */
                                    items[items.length - 1].getAsString(function(str) {
                                        // 粘贴过来的文字, 替换换行符为 html br 标签
                                        let textData = str.replace(/(\r\n|\r|\n)/g, '<br>');
                                        // 替换空格为转移字符 &nbps;
                                        textData = textData.replace(/\s/g, '&nbsp;');
                                        // 插入处理后的文字到富文本编辑器
                                        editor.insertContent(textData);
                                    });
                                    // 避免富文本编辑器的默认行为
                                    event.preventDefault();
                                    event.stopPropagation();
                                } else if (items[items.length - 1].type.indexOf('image') === -1) {
                                    for (let i = 0; i < items.length; i++) {
                                        console.log('items[i]', items[i]);
                                        if (items[i].type.indexOf('text/html') !== -1) {
                                            items[i].getAsString(function(str) {
                                                // str 是获取到的字符串
                                                console.log('html粘贴', str);
                                                str = str.replace(/id="signature"/ig, '');
                                                editor.insertContent(str);
                                            });
                                        }
                                    }
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            }
                        });
                        editor.ui.registry.addButton('insertImageBtn', {
                            // text: 'Insert Image',
                            tooltip: 'Insert Image',
                            icon: 'image',
                            onAction: function(_) {
                                const upload = vm.$refs.imageUpload;
                                vm.$nextTick(() => {
                                    upload.$refs['upload-inner'].handleClick();
                                });
                            }
                        });
                    }
                });
            },
            /* 插入图片至编辑器 */
            insertImage(res) {
                const src = this.qiniuHttp + res.key;
                tinymce.execCommand('mceInsertContent', false, `<img src=${src}>`);
            },
            /** 获取写信设置默认值 */
            getDefaultSetting() {
                util.ajaxJson({
                    url: '/crm/userconfig/get',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: 'getDefaultSetting'
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        console.log('获取成功', res.data);
                        if (res.data.data.value === null) {
                            /* 如果未获取到用户的写信默认设置数据，则将产品给定的一套初始默认设置数据，保存至后台 */
                            this.addDefaultSetting();
                        } else {
                            const result = JSON.parse(res.data.data.value);
                            this.defaultMailSetting.fontFamilyValue = result.fontFamilyValue ? result.fontFamilyValue : 'arial';
                            this.defaultMailSetting.fontSizeValue = result.fontSizeValue ? result.fontSizeValue : '16px';
                            this.defaultMailSetting.fontColorValue = result.fontColorValue ? result.fontColorValue : '#000';
                            this.initEditor();
                        }
                    } else {
                        this.$Message.error(this.$t('mailSetting.writeMailDefault.backfillFailureTip'));
                    }
                }).catch(res => {
                    this.$Message.error(this.$t('mailSetting.writeMailDefault.backfillFailureTip'));
                });
            }
        },
        watch: {},
        beforeDestroy() {
            tinymce.execCommand('mceRemoveEditor', true, 'vEditor');
            tinymce.remove('vEditor');
        }
    };
</script>