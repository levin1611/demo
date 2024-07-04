<template>
  <div>
    <div style="width: 300px">
      <Form ref="editPasswordForm" label-position="left" :label-width="labelWidth" style="padding:10px">
        <FormItem class="personal-set-homepage" :label="$t('per_setting.defaultPage')" prop="rePass">
          <Cascader v-model="homePage" :options="menuList" size="mini" popper-class="_font_12" @change="selectIndex" ref="homePage" :render-format="format"></Cascader>
        </FormItem>
        <FormItem label=" ">
          <Button @click="updateSettings" class="piwik_homepagewBtn" type="success" :disabled="isDisabled" :loading="loading">
            {{$t('save')}}
          </Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>
<script>
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';
    import Cookies from 'js-cookie';

    export default {
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                roleMenu: state => state.app.roleMenu,
                lang: state => state.app.lang,
                is_marketing_station: state => state.app.is_marketing_station
            }),
            labelWidth() {
                return this.lang === 'en-US' ? '130px' : '90px';
            },
            menuList() {
                return this.formatList(this.roleMenu).filter(item => item.path !== 'system_settings');
            }
        },
        data() {
            return {
                loading: false,
                isDisabled: true,
                modal: false,
                homePage: [],
                homePageData: []
            };
        },
        methods: {
            // 格式化选中的内容
            format(labels, selectedData) {
                // console.log(labels,selectedData);
                const index = labels.length - 1;
                // const data = selectedData[index] || false;
                return labels[index];
            },
            selectIndex(value) {
                const selectedData = this.$refs.homePage.getCheckedNodes(true);
                this.homePageData = selectedData;
                this.isDisabled = false;
            },
            // getMenu() {
            //     util.ajax({
            //         url: '/new-privilege/resource/getMenu',
            //         method: 'get',
            //         params: {
            //             userId: this.userId,
            //             orgId: this.orgId
            //         }
            //     }).then(res => {
            //         if (res.data.code === '1') {
            //             // 处理原始数据, 更新 vuex menuList (平铺数组), 更新 vuex roleMenu (原始数据)并存入 localStorage , 更新 vuex router_map (添加动态路由 + 给左侧目录使用)
            //             //this.$store.commit('set_menu_list', res.data.data.menuList);
            //             // 获取首页, 回填数据
            //             this.getIndex();
            //         }
            //     });
            // },
            formatList(arr) {
                if (arr.length === 0) {
                    return [];
                }
                return arr.map(item => {
                    const obj = {
                        path: item.path,
                        id: item.id,
                        value: item.id,
                        label: this.$t(`menu.${item.path}`)
                    };
                    if (item.path === 'home') {
                        obj.label = this.$t('menu.dashBoard');
                    }
                    /**
                     * @Description: 'database'不需要再展示出子集
                     * @Description: 'mail' 邮件管理不需要再展示出子集
                     * @Description: 'whatsapp_chat' WhatsApp聊天没有聊天页面不需要再展示出子集
                     * @author mayuanzhi
                     * @date 2020/7/3
                    */
                    if (item.path === 'whatsapp_manage') {
                        let itemIndex;
                        item.children.forEach((item, index) => {
                            if (item.path === 'whatsapp_chat') { itemIndex = index; }
                        });
                        if (item.children[itemIndex] && (!item.children[itemIndex].children || item.children[itemIndex].children.every((childItem) => childItem.title !== '对话页面'))) {
                            // 没有【聊天页面】不显示 【WhatsApp聊天】 菜单权限
                            itemIndex >= 0 && item.children.splice(itemIndex, 1);
                        }
                    }
                    // "企业GPT"和"知识库"的 children 中的"xxx页面"去掉
                    if (item.path === 'enterpriseGPT') {
                        if (Array.isArray(item.children)) {
                            item.children.forEach(childItem => {
                                if (['enterpriseGPT', 'knowledgeBase'].includes(childItem.path)) {
                                    delete childItem.children;
                                }
                            });
                        }
                    }
                    if (item.children && item.children.length > 0 && !['database', 'mail', 'whatsapp_chat'].includes(item.path)) {
                        obj.children = this.formatList(item.children);
                    }
                    return obj;
                });
                // return arr;
            },
            // 获取设置的首页
            getIndex() {
                util.ajax({
                    url: 'new-privilege/person/setting/homePage/get',
                    method: 'get',
                    params: {
                        userId: this.userId,
                        orgId: this.orgId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        if (res.data.data) {
                            this.homePage = this.getHomePage(this.menuList, Number(res.data.data.resourceId));
                        } else {
                            // 设置为默认首页 - 邮件管理
                            this.homePage = this.is_marketing_station ? [10606] : [10600];
                        }
                    } else {
                        // 请求失败, 弹出错误提示
                        this.$Message.error(this.$t('per_setting.error_getDefaultPage'));
                    }
                }).catch(e => {
                    // 请求失败, 弹出错误提示
                    this.$Message.error(this.$t('per_setting.error_getDefaultPage'));
                });
            },
            // 将后端返回的单个子节点 添加父节点包装成级联选择器 需要的格式
            // arr是getmenu获得的 node 是首页节点id
            getHomePage(arr, node) {
                let homeArr;
                for (let index = 0; index < arr.length; index++) {
                    const item = arr[index];
                    if (item.id === node) {
                        homeArr = [item.id];
                        break;
                    } else if (item.children && item.children.length > 0) {
                        const childArr = this.getHomePage(item.children, node);
                        if (childArr) {
                            childArr.unshift(item.id);
                            homeArr = childArr;
                        }
                    }
                }
                return homeArr;
            },
            garbage(key) {
                switch (key) {
                    case 'mail':
                        key = 'mail_home';
                        break;
                    case 'home':
                        key = 'home_index';
                        break;
                    default:
                        break;
                }
                return key;
            },
            // 保存设置
            updateSettings() {
                if (this.homePageData.length > 0) {
                    const index = this.homePageData.length - 1;
                    const firstPage = this.homePageData[index];
                    const jsonData = {
                        orgId: this.orgId,
                        userId: this.userId,
                        resourceId: firstPage.value,
                        resourcePath: this.garbage(firstPage.data.path)
                    };
                    this.loading = true;
                    util.ajaxJson({
                        url: '/new-privilege/person/setting/homePage/update',
                        method: 'post',
                        data: jsonData
                    }).then(res => {
                        this.loading = false;
                        if (res.data.code === '1') {
                            this.$Message.success(this.$t('per_setting.personalSettingTip1'));
                            this.modal = false;
                            const page = firstPage.data.path === '' ? 'home_index' : this.garbage(firstPage.data.path);
                            this.$store.commit('setHomeName', page);
                            Cookies.set('HOMEPAGE', page);
                            this.$router.push({
                                name: page
                            });
                            sessionStorage.homePageSetStatus = 1;
                        }
                    }).catch(() => {
                        this.loading = false;
                    });
                } else {
                    this.$Message.success(this.$t('per_setting.personalSettingTip2'));
                }
            }
        },
        created() {
            this.getIndex();
        }
    };
</script>
