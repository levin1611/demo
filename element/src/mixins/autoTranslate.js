import { mapState, mapGetters } from 'vuex';

export default {
    data() {
        return {
            groupAutoTrans: '', // 判断群组是否有发言权限,进而进行自动翻译

            textList: [], // 需要翻译的消息数组
            canAutoTransItem: null, // 接收子组件传递过来的消息,并将消息添加到textList中
            transList: null,
            transTimerMeth: null,
            transTimer: null
        };
    },
    computed: {
        ...mapState({
            enterpriseId: state => state.enterpriseId,
            autoTranslateCharactCount: 'autoTranslateCharactCount', // 翻译字符数
            autoTranslateStatusRecive: 'autoTranslateStatusRecive', // 自动翻译-收信开关状态
            autoTranslatetargetLang: 'autoTranslatetargetLang', // 自动翻译-目标语种
            autoTranslateNoTArr: 'autoTranslateNoTArr' // 自动翻译-不需要翻译的语种
        }),
        ...mapGetters([
            'isInBlackList' // 当前选中的语种是不是在[不允许翻译语种内] 如果返回 undefine 则代表可以翻译
        ])
        
    },
    methods: {
        // 手动触发翻译功能
        handleTranslate(direction, className) {
            // console.error('手动触发翻译功能');
            if (direction && direction === 'top') {
                this.$nextTick(() => {
                    this.$refs.msgScroll.$el.querySelector('.ivu-scroll-container').scrollTop = 9;
                });
                return;
            }
            setTimeout(() => {
                try {
                    if (className) {
                        const contentHeight = document.querySelector(`${className} .ivu-scroll-content`).scrollHeight;
                        const mainHeight = document.querySelector(`${className}`).scrollHeight;
                        // console.error('className', className, contentHeight, mainHeight);
                        if (contentHeight < mainHeight) {
                            this.loadMoreAutoTransMixin();
                        }
                    } else {
                        const contentHeight = document.querySelector('#whatsApp-main .ivu-scroll-content').scrollHeight;
                        const mainHeight = document.querySelector('#whatsApp-main').scrollHeight;
                        if (contentHeight < mainHeight) {
                            this.loadMoreAutoTransMixin();
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }, 100);
        },
        loadMoreAutoTransMixin() {
            // 翻译字符数小于 0 时, 不翻译
            if (this.autoTranslateCharactCount <= 0) return;

            // 自动翻译方法
            // if (this.groupAutoTrans && !this.isInBlackList && this.autoTranslateStatusRecive) {
            // console.error('自动翻译方法', this.isInBlackList, this.autoTranslateStatusRecive);
            if (!this.isInBlackList && this.autoTranslateStatusRecive) {
                // 滚动事件
                const obj = {
                    el: '#whatsApp-main'
                };
                this.messageScrollEventMixIn(obj);
            }
        },
        // 将消息传递给父组件
        handleTransMsg(msg) {
            clearTimeout(this.transTimerMeth);

            this.textList.push(msg);

            // 防抖函数, 停止滚动 400ms 后清空textList
            this.transTimerMeth = setTimeout(() => {
                const textList = this.$deepClone(this.textList);
                this.textList = [];
                this.getTranslationListMixIn(textList);
            }, 400);
        },
        // 消息滚动事件
        messageScrollEventMixIn(args) {
            // 简单防抖
            const areaVisibal = document.querySelector(args.el).getBoundingClientRect();

            // emit 消息组件的方法
            this.handleEventBusMixin(areaVisibal);
        },
        // 触发eventBus事件
        handleEventBusMixin(areaVisibal) {
            this.$EVENTBUS.$emit('addMessageToTranslationListMixIn', areaVisibal);
        },
        getTranslationListMixIn(textList) {
            // 去重textList
            const uniqueSet = new Set();
            const uniqueTextList = textList.filter(item => {
                if (!uniqueSet.has(item.messageId)) {
                    uniqueSet.add(item.messageId);
                    return true;
                }
            });

            this.transList = null;
            this.$commonApi.appTranslationWithSource({
                translationType: 1,
                // characterCount: this.autoTranslateCharactCount, // 字符数
                targetLang: this.autoTranslatetargetLang,
                textList: uniqueTextList
            }).then(res => {
                const { characterCount, translations } = res.data;
                this.transList = translations;

                if (!characterCount) return;

                // 掉接口更新字符数
                this.$commonApi.updateCharacterCount({
                    orgId: this.enterpriseId,
                    characterCount: String(characterCount) // 字符数
                }).then(response => {
                    // 更新前端字符数
                    this.$store.commit('setautoTranslateCharactCount', response.data);
                });

                // 将获取到的翻译结果传递给每个消息组件
            }).catch(err => {
                console.error('获取批量翻译消息失败', err);
            });
        }
    },
    watch: {
        // 判断群组是否有发言权限,进而进行自动翻译
        groupAutoTrans(val) {
            clearTimeout(this.transTimer);

            this.transTimer = setTimeout(() => {
                if (val.includes('UnSend')) return;
                // 触发自动翻译
                this.loadMoreAutoTransMixin();
            }, 1000);
        },
        // 接收子组件传递过来的消息,并将消息添加到textList中
        canAutoTransItem(val) {
            if (val) {
                this.textList.push(val);
            }
        }
    }
};
