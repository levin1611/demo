import { Rnum } from '@/utils/dynamicDatas.js';
import i18n from '@/locale';

// 组件内引入自身的mixins 设置自己的 导航数据
export default {
    data() {
        return {
            forbiddenMenuMouseover: false, // 禁止其余 默认行为 开启步骤状态的唯一标识符
            changeNavZIndex: false, // 针对导航栏的z-index 垃圾布局
            forcedDisplayStep: false, // 当为步骤时强制显示覆盖 element-ui Popover默认事件
            tourRef: `menuTour_${Rnum()}`, // 生成组件唯一ref
            tourName: `menuTourtName_${Rnum()}` // 生成组件唯一name
        };
    },
    methods: {
        tourMentStart() {
            // 启动公共方法勿动
            this.$nextTick(function() {
                if (this.$refs[this.tourRef]) {
                    this.$refs[this.tourRef].start();
                }
            });
        },
        onTourMenuStart() {
            console.clear();
            this.forbiddenMenuMouseover = true;
        },
        onTourMenuStop() {
            // 恢复默认值
            this.forbiddenMenuMouseover = false;
            this.changeNavZIndex = false;
            this.forcedDisplayStep = false;
            this.$refs.personDropdown.changeShow(false);
            this.$store.commit('changeAppCenterVisible', false);
            this.save_tour_read();
        },
        onTourMenuPreviousStep(currentStep) {
            this.changeNavZIndex = currentStep === 5 || currentStep === 4 || currentStep === 8; // 非聚焦面包屑导航移除浮层
        },
        onTourMenuNextStep(currentStep) {
            // 行为控制
            this.changeNavZIndex = currentStep === 2 || currentStep === 3 || currentStep === 6; // 解决面包屑导航的浮层问题
        }
    },
    computed: {
        callbacksTourMenu() {
            return {
                onStart: this.onTourMenuStart,
                onStop: this.onTourMenuStop,
                onPreviousStep: this.onTourMenuPreviousStep,
                onNextStep: this.onTourMenuNextStep
            };
        },
        menuTourSteps() {
            // | 'auto'
            // | 'auto-start'
            // | 'auto-end'
            // | 'top'
            // | 'top-start'
            // | 'top-end'
            // | 'bottom'
            // | 'bottom-start'
            // | 'bottom-end'
            // | 'right'
            // | 'right-start'
            // | 'right-end'
            // | 'left'
            // | 'left-start'
            // | 'left-end'
            const params = {
                highlight: true,
                enableScrolling: true
            };
            return [{
                stepIndexs: 1,
                target: '#v-step-menu',
                ht: i18n.t('guide.menu.stepTitle1'),
                content: i18n.t('guide.menu.step1'),
                params: {
                    ...params,
                    placement: 'right'
                }

            },
            {
                stepIndexs: 2,
                target: '#v-step-menu-logo',
                header: {
                    title: i18n.t('guide.menu.stepTitle2')
                },
                ht: i18n.t('guide.menu.stepTitle2'),
                content: i18n.t('guide.menu.step2'),
                params: {
                    ...params,
                    placement: 'right-end'
                }

            },
             // 现阶段新用户默认首页为邮箱页，邮箱页显示小侧边栏 没有该dom的Id，所以先注释掉，若修改默认页后 要将该处打开
            // {
            //     stepIndexs: 3,
            //     target: '#v-step-menu-logo-nav',
            //     ht: i18n.t('guide.menu.stepTitle3'),
            //     header: {
            //         title: i18n.t('guide.menu.stepTitle3')
            //     },
            //     content: i18n.t('guide.menu.step3'),
            //     params: {
            //         ...params,
            //         placement: 'bottom'
            //     }

            // },
            {
                stepIndexs: 4,
                target: '#v-step-menu-breadcrumb',
                ht: i18n.t('guide.menu.stepTitle4'),
                header: {
                    title: i18n.t('guide.menu.stepTitle4')
                },
                content: i18n.t('guide.menu.step4'),
                params: {
                    ...params,
                    placement: 'left-bottom'
                }

            },
            {
                stepIndexs: 5,
                target: '#v-step-menu-breadcrumb-appcenter',
                ht: i18n.t('guide.menu.stepTitle5'),
                header: {
                    title: i18n.t('guide.menu.stepTitle5')
                },
                content: i18n.t('guide.menu.step5'),
                params: {
                    ...params,
                    placement: 'left'
                },
                before: async (type) => new Promise((resolve, reject) => {
                    // previous next
                    if (type === 'previous') {
                        this.$store.commit('changeAppCenterVisible', false);
                        setTimeout(function() {
                            resolve('foo');
                        }, 700);
                    } else {
                        resolve('foo');
                    }
                })

            },
            {
                stepIndexs: 6,
                target: '#v-step-menu-appcenter',
                ht: i18n.t('guide.menu.stepTitle6'),
                header: {
                    title: i18n.t('guide.menu.stepTitle6')
                },
                content: i18n.t('guide.menu.step6'),
                params: {
                    ...params,
                    placement: 'left'
                },
                before: async (type) => new Promise((resolve, reject) => {
                    // previous next
                    if (type === 'next') {
                        this.$store.commit('changeAppCenterVisible', true);
                        setTimeout(function() {
                            resolve('foo');
                        }, 700);
                    } else {
                        resolve('foo');
                    }
                })
            },
            {
                stepIndexs: 7,
                target: '#v-step-menu-appcenter-sysem',
                ht: i18n.t('guide.menu.stepTitle7'),
                header: {
                    title: i18n.t('guide.menu.stepTitle7')
                },
                content: i18n.t('guide.menu.step7'),
                params: {
                    ...params,
                    placement: 'left'
                },
                before: async (type) => new Promise((resolve, reject) => {
                    // previous next
                    if (type === 'previous') {
                        this.forcedDisplayStep = false;
                        this.$refs.personDropdown.changeShow(false);
                        this.$store.commit('changeAppCenterVisible', true);
                        setTimeout(function() {
                            resolve('foo');
                        }, 700);
                    } else {
                        resolve('foo');
                    }
                })
            },
            {
                stepIndexs: 8,
                target: '#v-step-menu-avator-click',
                ht: i18n.t('guide.menu.stepTitle8'),
                header: {
                    title: i18n.t('guide.menu.stepTitle8')
                },
                content: i18n.t('guide.menu.step8'),
                params: {
                    ...params,
                    placement: 'left'
                },
                before: async (type) => new Promise((resolve, reject) => {
                    // previous next
                    if (type === 'next') {
                        this.$store.commit('changeAppCenterVisible', false);
                        setTimeout(function() {
                            resolve('foo');
                        }, 800);
                    } else {
                        this.forcedDisplayStep = false;
                        this.$refs.personDropdown.changeShow(false);
                        resolve('foo');
                    }
                })
            },

            {
                stepIndexs: 9,
                target: '#v-step-menu-avator',
                ht: i18n.t('guide.menu.stepTitle9'),
                header: {
                    title: i18n.t('guide.menu.stepTitle9')
                },
                content: i18n.t('guide.menu.step9'),
                params: {
                    ...params,
                    placement: 'left'
                },
                before: async (type) => new Promise((resolve, reject) => {
                    // previous next
                    if (type === 'next') {
                        this.forcedDisplayStep = true; // 点击头像强行显示菜单 解决body事件捕获问题
                        this.$refs.personDropdown.changeShow(true); // 显示头像点击后菜单
                    }
                    resolve('foo');
                })
            },
            {
                stepIndexs: 10,
                target: '#v-step-menu-person-set',
                ht: i18n.t('guide.menu.stepTitle10'),
                header: {
                    title: i18n.t('guide.menu.stepTitle10')
                },
                content: i18n.t('guide.menu.step10'),
                params: {
                    ...params,
                    placement: 'left'
                }
            }
            ];
        },
        menuOptionsTour() {
            return {};
        }
    }
};
