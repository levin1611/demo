<template>
    <div v-if="showDetail"
         v-loading="loading"
         class="clue-detail">
        <div v-if="from !== 'xhl-chat'"
             @click="handleCloseDetail"
             class="detail-close">
            <Icon custom="custom-drawer-detail-close"></Icon>
        </div>
        <div class="detail-header">
            <div v-if="clue_short_info.a1009"
                 class="detail-header-title">{{clue_short_info.a1009}}</div>
            <div class="detail-header-body">
                <div v-for="item in clue_short_info_items"
                     :key="item"
                     class="header-body-item">
                    <div class="header-body-item-left">{{ $t(`clue.newDetail.col_${item}`) }}</div>
                    <div @click="jumpToTheClueDetail(item)"
                         :class="{'header-body-item-right': true, 'header-source': item === 'seqNumber'}">
                        {{ clue_short_info[item] }}</div>
                </div>
            </div>
        </div>
        <div class="detail-body">
            <Tabs v-model="current_compo">
                <TabPane v-for="item in compo_list"
                         :key="item"
                         :name="item"
                         :label=" $t(`crm.newDetail.module_${item}`) "></TabPane>
            </Tabs>
            <keep-alive v-if="!loading">
                <!-- 组件传递参数说明: -->
                <!-- type: 公司/询盘/联系人  -->
                <!-- id: 以上三类 id -->
                <!-- columns_authorized: 以上三类的权限字段 -->
                <!-- visitorId: 用于请求访问型跟进记录 -->
                <!-- button_ids: 用于控制组件页面和按钮权限 -->
                <!-- flag_update_contact: 新增/更新联系人时, 需刷新联系人列表 -->
                <!-- flag_update_detail: 更新当前正在查看的 公司/询盘/联系人 时, 需刷新详情列表 -->
                <!-- flag_update_inquiry: 新增/更新/转移 询盘后, 需刷新询盘列表 -->
                <component :is="current_compo"
                           :fromType="fromType"
                           :type="current_compo === 'FollowUp'? 'clue': 'customer'"
                           :originalType="originalType"
                           :id="clueId"
                           :visitorId="''"
                           :source_type="source_type"
                           :columns_authorized="corp_columns_authorized"
                           :flag_update_detail.sync="flag_update_detail"
                           class="detail-body-container"
                           v-on="$listeners"></component>

                <!-- 组件传递参数说明: -->
                <!-- <component
                    :is="current_compo"
                    :id="clueId"
                    :type="'clue'"
                    :disabled="true"
                    :inquirySeqNumber="inquirySeqNumber"
                    :source="clue_short_info.source"
                    :visitorId="clue_short_info.proj"
                    :sourceId="clue_short_info.sourceId"
                    :flag_inquiry_id_requested="flag_inquiry_id_requested"
                    :flag_update_detail="flag_update_detail"
                    :flag_new_followUp="flag_new_followUp"
                    v-on="$listeners">
                </component> -->
            </keep-alive>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import FollowUp from '@/views/main-components/timeline/index.vue';
    import DetailInfo from '@/views/clue-manage/Detail/Components/Html/detailInfo';

    export default {
        name: 'ClueDetail',
        props: [
            'clueId',
            'from',
            'originalType'
        ],
        components: {
            DetailInfo,
            FollowUp
        },
        data() {
            return {
                loading: false,
                clue_short_info: {}, // 线索简略信息
                clue_short_info_items: [
                    'seqNumber',
                    'sourceType',
                    'createUser',
                    'serviceName',
                    'saleName',
                    'followupStatus'
                ], // 线索简略信息条目
                /* 动态组件部分 */
                flag_update_detail: false,
                compo_list: [
                    'FollowUp',
                    'DetailInfo'
                ],
                current_compo: 'FollowUp',
                /* 对接权限系统 */
                corp_columns_authorized: {}, // 公司所有字段
                lang_company: {
                    companyName: this.$t('crm.Modal.corp_companyName'),
                    starLevel: this.$t('crm.Modal.corp_starLevel'),
                    shortName: this.$t('crm.Modal.corp_shortName'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),
                    mainProduct: this.$t('crm.Modal.corp_mainProduct'),
                    scale: this.$t('crm.Modal.corp_scale'),
                    clientType: this.$t('crm.Modal.corp_clientType'),
                    homePage: this.$t('crm.Modal.corp_homePage'),
                    phone: this.$t('crm.Modal.corp_phone'),
                    fax: this.$t('crm.Modal.corp_fax'),
                    contactAddress: this.$t('crm.Modal.corp_contactAddress'),
                    relatedCompany: this.$t('crm.Modal.corp_relatedCompany'),
                    companyPicture: this.$t('crm.Modal.corp_companyPicture'),
                    companyRemark: this.$t('crm.Modal.corp_companyRemark'),
                    companySourceWay: this.$t('crm.Table.col_customerSource')
                },
                /* 右上角显示询盘或操作 */
                show_operate: false,
                inquiryId: undefined,
                inquirySeqNumber: undefined,
                flag_inquiry_id_requested: false, // 询盘 ID 请求完成
                showDetail: true // 显示线索详情页
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                window_height: state => state.window_height
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            bodyHeight() {
                const temp = this.window_height ? this.window_height - 120 : document.body.clientHeight - 120;
                return temp > 200 ? temp : 200;
            },
            fromType() {
                return (this.originalType === 'Fb-comment' || this.originalType === 'Fb-chat') ? 'FB_inbox' : 'clue';
            },
            // 返回创建方式 label
            source_type() {
                switch (this.clue_short_info.source) {
                    case 1:
                        return this.$t('clue.history');
                    case 2:
                        return this.$t('clue.web_msg');
                    case 3:
                        return this.$t('clue.direct_create');
                    case 4:
                        return this.$t('clue.web_conversation');
                    case 5:
                        return 'Facebook Leads';
                    case 6:
                        return this.$t('clue.fb_msg');
                    case 7:
                        return this.$t('clue.fb_comment');
                    case 9:
                        return this.$t('clue.data_import');
                    default:
                        return '';
                }
            }
        },
        methods: {
            // 获取线索简略信息
            get_clue_short_info() {
                this.loading = true;
                util.ajax({
                    url: '/form-cust/form/getSimpleColumnValue',
                    method: 'post',
                    data: {
                        id: this.clueId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.clue_short_info = response.data.data;
                        this.clue_short_info.sourceType = this.source_type;
                        this.clue_short_info.followupStatus = this.status_type();
                        this.$store.commit('set_clue_short_info', this.clue_short_info);
                        this.get_cor_inquiry();
                    } else {
                        this.$Message.error('获取线索简略信息出错');
                    }
                    this.loading = false;
                });
            },
            // 获取与线索对应的询盘 Id 和 seqNumber , 如果有的话
            get_cor_inquiry() {
                this.inquiryId = undefined;
                this.inquirySeqNumber = undefined;
                this.flag_inquiry_id_requested = false;
                util.ajaxJson({
                    url: '/crm/inquiry/getInquirySeqList',
                    method: 'post',
                    data: {
                        clueIdList: [this.clueId]
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        this.show_operate = true;
                        if (res.data.data[this.clueId]) {
                            this.inquirySeqNumber = res.data.data[this.clueId].seqNumber;
                            this.inquiryId = res.data.data[this.clueId].inquiryId;
                        }
                        /* if (this.inquiryId && this.clue_short_info.status + '' !== '3') {
                          this.change_status(3);
                        } */
                    } else {
                        this.$Message.error(this.$t('clue.error_getClueStatus'));
                    }
                    this.flag_inquiry_id_requested = true;
                });
            },

            // 返回线索状态 label
            status_type() {
                switch (this.clue_short_info.status) {
                    case 1:
                        return this.$t('clue.unfollowed');
                    case 2:
                        return this.$t('clue.trash');
                    case 3:
                        return this.$t('clue.inquiry');
                    case 4:
                        return this.$t('clue.following');
                    case 5:
                        return this.$t('clue.done');
                    default:
                        break;
                }
            },
            get_corp_columns_authorized() {
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        parentId: 3
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.corp_columns_authorized = response.data.data;
                        if (this.corp_columns_authorized.default) {
                            this.corp_columns_authorized.default.forEach(item => {
                                if (this.lang_company.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_company[item.storageName];
                                }
                            });
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    }
                    this.loading = false;
                });
            },
            handleCloseDetail() {
                this.showDetail = false;
                this.$emit('changeShowDetail', false);
            },
            async jumpToTheClueDetail(item) {
                // 校验是否有线索目录权限
                if (!this.isContainsMenu('my_clue')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noMenuAuthority'));
                    return;
                }

                // 校验是否有该条线索管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Clue',
                    id: this.clueId
                });
                if (!authorized) return;
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpClueInHighseas'));
                    return;
                }

                // 校验通过, 新标签页打开线索详情
                if (item === 'seqNumber') {
                    localStorage.setItem('leadsCloud-clueId', this.clueId);
                    window.open(this.$rootRouter.resolve({
                        name: 'my_clue'
                    }).href, '_blank');
                }
            }
        },

        created() {
            this.loading = true;
            this.get_corp_columns_authorized();
            // this.get_clue_short_info()
        },
        watch: {
            clueId: {
                handler(val) {
                    if (val) {
                        // this.show_operate = false;
                        this.get_clue_short_info();
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less" scoped>
    .clue-detail {
        width: 100%;
        height: 100%;
        overflow: hidden;
        .detail-header {
            padding: 20px;

            .detail-header-title {
                font-weight: 700;
                margin-bottom: 6px;
            }

            .detail-header-body {
                font-size: 12px;

                .header-body-item {
                    padding: 3px 0;

                    .header-body-item-left {
                        display: inline-block;
                        width: 28%;
                    }

                    .header-body-item-right {
                        display: inline-block;
                        // width: 69%;
                    }

                    .header-source {
                        // float: none;
                        padding-left: 0;
                        //border-left: 1px solid #d5d8dd;
                        color: #4285F4;
                        cursor: pointer;

                        &:hover {
                            color: #2d63bc;
                            text-decoration: underline;
                        }
                    }
                }
            }
        }

        .detail-body {
            border-top: 1px solid #E8E8E8;

            /deep/ .el-tabs__header {
                // margin-bottom: 16px;
                margin-bottom: 0;
            }

            /deep/ .el-tabs__nav-wrap:after {
                height: 1px;
            }

            /deep/ .el-tabs__nav {
                .el-tabs__item {
                    padding: 0 15px;
                }
            }

            .detail-body-container {
                padding: 10px 16px;
                height: calc(~"100vh - 332px");
                overflow-y: auto;
                overflow-x: hidden;

                &.detail-info {
                    margin-bottom: 0;
                }

                &::-webkit-scrollbar {
                    width: 4px;
                }
            }
        }

        .detail-close {
            float: right;
            color: rgb(73, 80, 96);
            font-size: 26px;
            opacity: 0.5;
            border-radius: 20%;
            cursor: pointer;
        }
    }

</style>
