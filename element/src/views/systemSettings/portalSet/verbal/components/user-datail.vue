<template>
    <div style="height: 100%;">
        <div style="height: 100%;">
            <template slot="close">
                <Icon custom="custom custom-drawer-detail-close"></Icon>
            </template>
            <div class="user-detail"
                 style="margin: -16px -16px 0px;padding: 21px 0 0 21px;position: relative;height: 100%;">
                <Spin v-if="loading" size="large" fix></Spin>
                <template v-else>
                    <div class="user">
                        <div class="user_top">
                            <div class="user_name">
                                <a class="user-head">
                                    <svg class="chat-svg-avatar" aria-hidden="true">
                                        <use xlink:href="#custom-visitor-avatar"></use>
                                    </svg>
                                </a>
                                <Tooltip placement="bottom-start" :content="userData.name" style="margin-left: 10px;">
                                    <span class="user_name_short">{{ userData.name || '' }}</span>
                                </Tooltip>
                            </div>
                            <div class="user_operate">
                                <!-- 编辑用户 -->
                                <Button customIcon="custom custom-field-edit" type='text'
                                        @click="$emit('open_update_modal', userData)"
                                        class="tree_icon">
                                    <span style="margin-left: 8px;">{{$t('authority.userManagement.edit')}}</span>
                                </Button>
                                <!-- 分配权限 -->
                                <Button customIcon="custom custom-authority-distribution"
                                        type='text'
                                        @click="$emit('set_permission', [userData])"
                                        class="tree_icon">
                                    <span style="margin-left: 8px;">{{$t('authority.userManagement.allocaPermis')}}</span>
                                </Button>

                                <Poptip trigger="hover" placement="bottom-end" class="moreOperateGroup">
                                    <Button type="text" style="color: #7e7e7e;padding-top: 5px;"
                                            custom-icon="custom custom-more"></Button>
                                    <div slot="content">
                                        <ul>
                                            <li @click="$emit('updateLockTargetAccount', [userData])"
                                                v-if="!userData.isselect">{{$t('authority.userManagement.lock')}}
                                            </li>
                                            <li @click="$emit('state_change', true, userData)" v-if="userData.isselect">
                                                {{$t('authority.userManagement.unlock')}}
                                            </li>
                                            <li @click="$emit('delete_account_batch', [userData])">
                                                {{$t('authority.userManagement.setTurnover')}}
                                            </li>
                                        </ul>
                                    </div>
                                </Poptip>
                            </div>
                        </div>
                        <div class="user_bottom">
                            <span>{{$t('product.createTime')}}：{{new Date(userData.createDate).format($lang === 'zh-CN' ? 'yyyy年MM月dd日 hh:mm:ss' : 'yyyy/MM/dd hh:mm:ss')}}</span>
                            <span style="margin-left: 7.6%;">{{$t('authority.userManagement.accountStatus')}}：{{userData.isselect ? $t('product.disabled') : $t('product.active')}}</span>
                        </div>
                    </div>
                    <div style="position: absolute; overflow-y: auto;height: 83%;width: 96%;">
                        <!--基本信息-->
                        <div class="user_info">
                            <div style="font-size: 14px;font-weight: 700;line-height: 22px;padding-top: 15px;">
                                {{$t('authority.userManagement.userInfo')}}
                            </div>
                            <div>
                                <Row>
                                    <Col span="12">
                                        <div class="web-tip" v-for="(item, index) in leftInfo" :key="item.__id"
                                             v-show="index < 4 || showMore">
                                            <span style="color: rgba(0, 0, 0, 0.6);margin-right: 8px;">{{item.title + '：'}}</span>
                                            <span>{{item.title === $t('product.enableStatus') ? (userData.isselect ? $t('product.disabled') : $t('product.active')) : userData[item.key]}}</span>
                                        </div>
                                    </Col>
                                    <Col span="12">
                                        <div class="web-tip" v-for="(item, index) in rightInfo" :key="item.__id"
                                             v-show="index < 4 || showMore">
                                            <span style="color: rgba(0, 0, 0, 0.6);margin-right: 8px;">{{item.title + '：'}}</span>
                                            <span>{{item.title === $t('product.enableStatus') ? (userData.isselect ? $t('product.disabled') : $t('product.active')) : userData[item.key]}}</span>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div @click="showMoreInfo" style="color: #3B78DE;margin-top: 12px;">
                                {{showMore ? `${$t('mail.collapse')}<<` :
                                `${$t('authority.userManagement.showMoreInfo')}>>`}}
                            </div>
                        </div>
                        <!--授权角色-->
                        <div class="autho_role">
                            <div style="font-size: 14px;font-weight: 700;line-height: 22px;padding: 16px 0;">
                                {{$t('authority.userManagement.authorityRole')}}
                            </div>
                            <Tabs v-model="current_tab">
                                <TabPane v-for="item in tabList" :label="item.label" :name="item.name"></TabPane>
                            </Tabs>
                            <!-- 组件传递参数说明: -->
                            <!--current_tab：组件名称、userInfo：用户信息详情-->
                            <component
                                    :is="current_tab"
                                    :userInfo="userData"
                                    v-bind="$attrs"
                                    v-on="$listeners"></component>
                            <!--<visitorFrom :row="row" :fieldObj="fieldObj" :type="current_compo"></visitorFrom>-->
                        </div>
                    </div>
                </template>
            </div>
            <Spin fix size="large" v-if="loading">
                <slot name="loading"></slot>
            </Spin>
        </div>
    </div>
</template>
<script>
    import UserRole from '@/views/authority/user-management/components/user_role.vue';
    import UserManage from '@/views/authority/user-management/components/user_manage.vue';
    import UserField from '@/views/authority/user-management/components/user_field.vue';

    export default {
        data() {
            return {
                visible: false,
                /* loading: false, // 暂时设为false  正常初始值设为true 当请求到数据以后变为false */
                showMore: false, // 显示更多基本信息
                current_tab: 'UserRole', // 当前选中的tab
                tabList: [
                    {
                        label: this.$t('authority.userManagement.functionalPermis'),
                        name: 'UserRole'
                    },
                    {
                        label: this.$t('authority.userManagement.adminPermis'),
                        name: 'UserManage'
                    },
                    {
                        label: this.$t('authority.userManagement.fieldPermis'),
                        name: 'UserField'
                    }
                ]
            };
        },
        components: {
            UserRole,
            UserManage,
            UserField
        },
        props: {
            userData: {
                type: Object,
                default() {
                    return {};
                }
            },
            index: {
                type: Number,
                default: -1
            },
            loading: {
                type: Boolean,
                default: false
            },
            columns: {
                type: Array,
                default: []
            },
            user_id: {
                type: Number,
                default: 0
            }
        },
        computed: {
            leftInfo() {
                return this.columns.filter((item, index) => index % 2 === 0);
            },
            rightInfo() {
                return this.columns.filter((item, index) => index % 2 === 1);
            }
        },
        methods: {
            /* 点击查看更多 */
            showMoreInfo() {
                this.showMore = !this.showMore;
            }
        },
        beforeDestroy() {
            this.current_tab = 'UserRole';
        },
        watch: {
            userData() {
                this.current_tab = 'UserRole';
                this.showMore = false;
            }
        }
    };
</script>
<style scoped lang="less">
    @import "./user-detail.less";
</style>
