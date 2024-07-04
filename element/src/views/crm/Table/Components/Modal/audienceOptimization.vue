<template>
    <div style="position: relative;">
        <Modal :visible="visible"
               :title="$t('crm.Modal.title_audienceOptimization')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :append-to-body="true"
               :modal-append-to-body="false"
               width="70%"
               class="modal vertical-center-modal modal-responsive-vertical">
            <!-- loading -->
            <Spin fix v-if="loading"></Spin>

            <!-- facebook 分组选择 -->
            <div style="text-align: center">
                <span style="height: 32px;line-height: 32px;padding-right: 15px;">Facebook {{ $t('crm.Modal.grouping') }}</span>
                    <Poptip placement="bottom-start"
                            popper-class="facebook-pop">
                        <Select slot="reference"
                                v-model="facebook_select_model"
                                multiple
                                :placeholder="$t('crm.Modal.tip_select')"
                                ref="casSelect"
                                class="facebook-select"
                                popper-class="facebook-select-dropdown">
                            <Option v-for="item in facebook_select_options"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"></Option>
                        </Select>

                        <CascaderPanel :options="facebook_userGroup_data"
                                       :props="casProps"
                                       :show-all-levels="false"
                                       size="mini"
                                       ref="facebook"
                                       class="audience_cas">
                            <template slot-scope="{ node, data }">
                                <Checkbox v-if="node.isLeaf"
                                          :value="facebook_select_model.includes(data.value)"
                                          @change="change_facebook_cas_selected(data, $event)"
                                          class="facebook-cas-checkbox"></Checkbox>
                                <span class="facebook-cas-option">{{ data.label }}</span>
                            </template>
                        </CascaderPanel>
                    </Poptip>
            </div>
            <br>
            <br>

            <!-- 表格 -->
            <Table :data="table_data"
                   :height="table_height"
                   :isCustom="true"
                   :customEmptyText="customEmptyTextLang"
                   :customEmptyButtonText="customEmptyButtonTextLang"
                   :customClearMethod="clearFilterConditionByInitView"
                   v-loading="table_loading"
                   class="tabmain noBoxShadow-right noborder-table noborder-table-normal-border">
                <TableColumn width="35"
                             align="center"
                             :render-header="renderHeader_checkbox"
                             class-name="no-padding-cell">
                    <template slot-scope="scope">
                        <Checkbox :value="scope.row._checked"
                                  @change="boo => table_data[scope.$index]._checked = boo"></Checkbox>
                    </template>
                </TableColumn>
                <TableColumn v-for="item in table_columns"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             align="left"
                             :width="item.width"
                             :formatter="item.formatter"
                             :show-overflow-tooltip="true"></TableColumn>
            </Table>
            <div style="margin-top: 10px;overflow: hidden">
                <Page :page-size="page_size"
                      :page-sizes="page_size_opts"
                      :total="all_table_data.length"
                      :current-page.sync="cur_page"
                      layout="total, prev, pager, next, sizes, jumper"
                      @size-change="change_page_size"
                      class="pageWrap-right"></Page>
            </div>

            <!-- 底部按钮 -->
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button type="primary"
                        :disabled="!all_table_data.length"
                        @click="ok"
                        class="piwik_audience_optimization">{{ $t('crm.Modal.modal_save') }}
                </Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import Vue from 'vue';
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import resetInitComponents from '@/mixins/resetComponentViewData';

    export default {
        mixins: [resetInitComponents],
        name: 'audienceOptimization',
        props: [
            'visible',
            'ids',
            'listType',
            'startDate',
            'endDate',
            'queryData',
            'updateTimes',
            'subUserIds',
            'order_column',
            'order_type',
            'isFromGoogle',
            'optimizeStatus'
        ],
        computed: {
            ...mapState([
                'enterpriseId',
                'userId',
                'window_height'
            ]), // 从 vuex 中获取属性
            table_data() {
                if (this.all_table_data.length && !this.table_loading) {
                    if (this.cur_page > Math.ceil(this.all_table_data.length / this.pageSize)) {
                        this.cur_page = 1;
                    }
                    return this.all_table_data.slice((this.cur_page - 1) * this.page_size, this.cur_page * this.page_size);
                } else {
                    return [];
                }
            }, // 当前表格页数据
            selected_all() {
                return this.all_table_data.every(item => item._checked === true);
            }, // 返回全选状态
            table_height() {
                let temp = this.window_height ? this.window_height - 408 : document.body.clientHeight - 408;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            } // 动态计算表格高度, 其实是用这个来撑开 modal
        },
        data() {
            return {
                /* 全局 */
                loading: true,
                /* 级联选择 */
                facebook_userGroup_data: [],
                facebook_select_options: [],
                facebook_select_model: [],
                casProps: {
                    lazy: true,
                    lazyLoad: this.load_facebook_data
                },
                /* 表格 */
                table_loading: true,
                table_columns: [
                    {
                        key: 'companyName',
                        title: this.$t('crm.Modal.corp_companyName'),
                        width: 200,
                        align: 'center'
                    },
                    {
                        key: 'productCategory',
                        title: this.$t('crm.Modal.inq_productCategory'),
                        width: 110,
                        align: 'center',
                        formatter: row => {
                            const temp = this.$options.filters.parseArray(row.productCategory);
                            return temp.length ? temp.join(', ') : row.productCategory;
                        }
                    },
                    {
                        title: this.$t('crm.Modal.corp_countryArea'),
                        key: 'countryArea',
                        width: 110,
                        formatter: row => {
                            return row.countryArea ? (this.countryAreaMap.get(row.countryArea) || row.countryArea) : '';
                        }
                    },
                    {
                        key: 'name',
                        title: this.$t('crm.Modal.contact_nickName'),
                        width: 110,
                        align: 'center'
                    },
                    {
                        key: 'email',
                        title: this.$t('crm.Modal.contact_email'),
                        width: 110,
                        align: 'center'
                    },
                    {
                        key: 'phone',
                        title: this.$t('crm.Modal.contact_phone'),
                        width: 110,
                        align: 'center'
                    }
                ],
                all_table_data: [],
                countryAreaMap: new Map(),
                page_size: 20,
                page_size_opts: [20, 50, 100],
                cur_page: 1,
                facebook_selected_providerUserId: new Map(),

                reg_link: /【((http|https):\/\/)?(\w(\:\w)?@)?([0-9a-z_-]+\.)*?(([a-z0-9-]+\.)*[a-z]{2,6}(\.[a-z]{2})?(\:[0-9]{2,6})?)((\/[^?#<>\/\\*":]*)+(\?[^#]*?)(.*?))?】/gi
            };
        },
        methods: {
            /* 级联选择 */
            get_cas_data() {
                this.loading = true;
                util.ajaxInternational({
                    url: '/social/audienceoptimization/fbPersonPages',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        // userId: 403,
                        providerId: 'facebook'
                    }
                }).then(res_facebook => {
                    if (res_facebook.data.code === '1') {
                        this.facebook_userGroup_data = res_facebook.data.data.map(item => {
                            const { providerUserId: value, providerUserName: label } = item;
                            return {
                                value,
                                label,
                                leaf: false,
                                children: []
                            };
                        });
                    } else {
                        /**
                         * @Date: 2020-06-04 15:57:16
                         * @LastEditors: niumkiki
                         * @description: 如果当前账号未绑定，增加 去绑定弹窗
                         * @param :
                         * @return:
                         */
                        // this.$Message.error(res_facebook.data.message || this.$t('crm.Modal.error_unboundedFB'));
                        if (res_facebook.data.code === '-101') {
                            // FB 账号未绑定
                            this.$emit('updateAccontNotBind', true);
                        } else {
                            // 未请求到数据
                            this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                        }
                        this.cancel();
                    }
                    this.loading = false;
                }, error => {
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    this.cancel();
                    this.loading = false;
                }).catch(error => {
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    this.cancel();
                    this.loading = false;
                });
            }, // 获取两个平台的受众第一层
            load_facebook_data(node, resolve) {
                if (node.level === 0) {
                    return resolve(this.facebook_userGroup_data);
                }

                const data = node.data;
                node.loading = true;
                switch (node.level) {
                    case 1:
                        util.ajaxInternational({
                            url: '/social/audienceoptimization/fbClientAdAccounts',
                            method: 'get',
                            params: {
                                orgId: this.enterpriseId,
                                userId: this.userId,
                                // userId: 403,
                                providerId: 'facebook',
                                providerUserId: data.value
                            }
                        }).then(response => {
                            if (response.data.code === '1') {
                                if (response.data.data.length) {
                                    const temp_providerUserId = data.value;
                                    data.children = response.data.data.map(item => {
                                        const { id: value, name: label } = item;
                                        return {
                                            value,
                                            label,
                                            children: [],
                                            leaf: false,
                                            providerUserId: temp_providerUserId
                                        };
                                    });
                                } else {
                                    data.children = [];
                                    this.$Message.error(response.data.message || this.$t('crm.Modal.error_getData'));
                                }
                            } else {
                                data.children = [];
                                this.$Message.error(response.data.message || this.$t('crm.Modal.error_requestNoData'));
                            }
                            resolve(data.children);
                            node.loading = false;
                        }, error => {
                            data.children = [];
                            this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                            resolve(data.children);
                            node.loading = false;
                        }).catch(error => {
                            data.children = [];
                            this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                            resolve(data.children);
                            node.loading = false;
                        });
                        break;
                    case 2:
                        util.ajaxInternational({
                            url: '/social/audienceoptimization/fbCustomAudiences',
                            method: 'get',
                            params: {
                                orgId: this.enterpriseId,
                                userId: this.userId,
                                providerId: 'facebook',
                                providerUserId: data.providerUserId,
                                adAccountId: data.value
                            }
                        }).then(response => {
                            if (response.data.code === '1') {
                                if (response.data.data.length) {
                                    const temp_providerUserId = data.providerUserId;
                                    data.children = response.data.data.map(item => {
                                        const { id: value, name: label } = item;
                                        return {
                                            value,
                                            label,
                                            leaf: true,
                                            providerUserId: temp_providerUserId
                                        };
                                    });
                                } else {
                                    data.children = [];
                                    this.$Message.error(response.data.message || this.$t('crm.Modal.error_getData'));
                                }
                            } else {
                                data.children = [];
                                this.$Message.error(response.data.message || this.$t('crm.Modal.error_requestNoData'));
                            }
                            resolve(data.children);
                            node.loading = false;
                        }, error => {
                            data.children = [];
                            this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                            resolve(data.children);
                            node.loading = false;
                        }).catch(error => {
                            data.children = [];
                            this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                            resolve(data.children);
                            node.loading = false;
                        });
                        break;
                    case 3:
                        resolve([]);
                }
            }, // 加载 google 用户组多级数据
            change_facebook_cas_selected(nodeData, boo) {
                const { value, label, providerUserId } = nodeData;
                if (boo) {
                    if (!this.facebook_select_model.includes(value)) {
                        if (this.facebook_select_options.findIndex(item => item.value === value) === -1) {
                            this.facebook_select_options.push({ value, label });
                        }
                        this.facebook_select_model.push(value);
                        this.facebook_selected_providerUserId.set(value, providerUserId);
                    } else {
                        this.facebook_select_model = this.facebook_select_model.filter(item => item !== value);
                        this.facebook_selected_providerUserId.delete(value);
                    }
                } else {
                    this.facebook_select_model = this.facebook_select_model.filter(item => item !== value);
                    this.facebook_selected_providerUserId.delete(value);
                }
            }, // cascaderPanel 的 checkbox 被点击, 动态改变 select 的数据

            /* 表格 */
            renderHeader_checkbox(h) {
                return h('Checkbox', {
                    props: {
                        value: this.selected_all
                    },
                    on: {
                        change: boo => {
                            if (boo) {
                                this.all_table_data.forEach(item => {
                                    item._checked = true;
                                });
                            } else {
                                this.all_table_data.forEach(item => {
                                    item._checked = false;
                                });
                            }
                        }
                    }
                });
            },
            get_table_data() {
                if (!(Array.isArray(this.ids) && this.ids.length)) {
                    this.$t('crm.Modal.error_requestNoData');
                    return;
                }
                this.table_loading = true;
                util.ajax({
                    url: '/crm/inquiry/getOptimizeList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        listType: this.listType,
                        startDate: this.startDate,
                        endDate: this.endDate,
                        query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined,
                        updateTimes: this.updateTimes,
                        subUserIds: this.subUserIds,
                        orderColumn: this.order_column,
                        orderType: this.order_type,
                        isFromGoogle: this.isFromGoogle,
                        optimizeStatus: this.optimizeStatus,
                        inquiryIdList: this.ids
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.all_table_data = response.data.data;
                        this.init_data();
                        this.cur_page = 1;
                    } else {
                        this.all_table_data = [];
                        this.$Message.error(response.data.message || this.$t('crm.Modal.error_requestNoData'));
                    }
                    this.table_loading = false;
                }, error => {
                    this.table_loading = false;
                    this.$t('crm.Modal.error_requestNoData');
                }).catch(error => {
                    this.table_loading = false;
                    this.$t('crm.Modal.error_requestNoData');
                });
            }, // 获取全部表格数据
            init_data() {
                this.all_table_data = this.all_table_data.map((item, index) => {
                    const {
                        companyName,
                        nickName: name,
                        email,
                        countryArea,
                        productCategory,
                        phone,
                        companyId,
                        inquiryId,
                        contactId
                    } = item;
                    return {
                        index,
                        companyName,
                        name,
                        email,
                        countryArea,
                        productCategory,
                        phone,
                        companyId,
                        inquiryId,
                        contactId,
                        _checked: true
                    };
                });

                // 请求国家地区文字并回填
                if (this.all_table_data.filter(item => item.countryArea).length) {
                    this.get_countryAreaName(this.all_table_data.map(item => item.countryArea));
                }
            }, // 初始化全部数据为相应的格式
            change_page_size(size) {
                this.page_size = size;
            }, // 改变每页条数
            get_countryAreaName(list) {
                const uniqedList = [...new Set(list.filter(item => item))].filter(item => !this.countryAreaMap.has(item));
                if (uniqedList.length) {
                    util.ajaxJson({
                        url: '/report/country/getNamesByList',
                        method: 'post',
                        data: {
                            list: uniqedList,
                            lang: Vue.config.lang
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            res.data.data.forEach((item, index) => {
                                if (!this.countryAreaMap.has(uniqedList[index])) {
                                    this.countryAreaMap.set(uniqedList[index], item ? item.replace(/-未知地区|-unknown area/g, '') : '');
                                }
                            });

                            // 配合 table_data 刷新表格页, 避免 countryArea 未更新到表格的情况
                            this.table_loading = true;
                            this.$nextTick(() => {
                                this.table_loading = false;
                            });
                        } else {
                            this.$Message.error(this.$t('crm.Table.error_transferCountryAreaCode'));
                        }
                    }).catch(error => {
                        this.$Message.error(this.$t('crm.Table.error_transferCountryAreaCode'));
                    });
                }
            }, // 根据国家编码获取国家地区

            /* footer */
            send_finish_status(finished_status, finished_audienceList) {
                util.ajaxJson({
                    url: '/crm/inquiry/updateAudienceList',
                    method: 'post',
                    data: {
                        status: finished_status,
                        audienceList: finished_audienceList
                    }
                }).then(res => {
                });
                this.$emit('refreshData');
                this.cancel();
            }, // 回传完成状态
            ok() {
                if (this.facebook_select_model.length === 0) {
                    // 未选择分组报错
                    this.$Message.error(this.$t('crm.Modal.error_selectGrouping'));
                } else if (this.all_table_data.length && !this.all_table_data.some(item => item._checked === true)) {
                    // 未选择表格数据报错
                    this.$Message.error(this.$t('crm.Modal.error_selectContact'));
                } else {
                    const selectedData = this.all_table_data.filter(item => item._checked === true).map(item => {
                        const { countryArea: country, name, email, phone } = item;
                        return { country, name, email, phone };
                    });
                    const finished_audienceList = this.all_table_data.filter(item => item._checked === true).map(item => {
                        const { inquiryId, companyId, contactId } = item;
                        return { inquiryId, companyId, contactId };
                    });
                    const providerUserIdList = [];
                    this.facebook_selected_providerUserId.forEach(value => providerUserIdList.push(value));
                    util.ajaxInternationalJson({
                        url: `/social/audienceoptimization/fbAudienceOptimization?userId=${this.userId}&providerId=facebook&orgId=${this.enterpriseId}`,
                        method: 'post',
                        data: {
                            list: selectedData,
                            audienceIdList: this.facebook_select_model,
                            providerUserIdList
                        }
                    }).then(res_facebook => {
                        if (res_facebook.data.code === '1') {
                            this.$Message.success(this.$t('crm.Modal.success_uploadGroupingOnlyFB'));
                            this.send_finish_status(2, finished_audienceList);
                        } else {
                            if (res_facebook.data.message) {
                                let temp = res_facebook.data.message;

                                const links = temp.match(this.reg_link);
                                if (links) {
                                    links.forEach(link => {
                                        const url = link.slice(1, link.length - 1);
                                        temp = temp.replace(link, ` <a target="_blank" href="${url}">${url}</a> `);
                                    });
                                    this.$Message({
                                        message: temp,
                                        type: 'error',
                                        dangerouslyUseHTMLString: true,
                                        duration: 0,
                                        showClose: true
                                    });
                                } else {
                                    this.$Message.error(temp);
                                }
                            } else {
                                this.$Message.error(this.$t('crm.Modal.error_uploadGroupingOnlyFB'));
                            }
                        }
                    });
                }
            }, // 点击保存
            cancel() {
                this.$emit('update:visible', false);
            } // 退出
        },
        created() {
            this.get_table_data();
            this.get_cas_data();
        }
    };
</script>

<style lang="less">
    .audience_cas {
        .el-cascader-menu {
            width: 150px;
            min-width: auto;

            .el-cascader-node {
                font-size: 12px;
                padding: 5px 0;
                height: auto;

                .el-cascader-node__label {
                    white-space: normal;
                    word-wrap: break-word;
                    word-break: break-all;
                    line-height: normal;
                    display: flex;
                    align-items: center;
                }
            }
        }
    }

    .facebook-pop {
        padding: 0;
    }

    .facebook-select {
        width: 250px;

        .el-select__tags {
            max-height: 115px;
            overflow: auto;

            .el-tag {
                padding: 0 20px 0 8px;
                max-width: 95%;
                position: relative;

                .el-select__tags-text {
                    display: block;
                    white-space: nowrap;
                    word-wrap: break-word;
                    word-break: break-all;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .el-tag__close {
                    position: absolute;
                    right: 2px;
                    top: 4px;
                }
            }
        }
    }

    .facebook-select-dropdown {
        display: none;
    }

    .facebook-cas-checkbox {
        position: absolute;
        left: 10px;
        + .facebook-cas-option {
            padding-left: 20px;
        }
    }

    .facebook-cas-option {
        display: inline-block;
        font-size: 12px;
        padding-right: 12px;
    }
</style>

<style scoped lang="less">
    .modal-responsive-vertical {
        /deep/ .el-dialog__body {
            max-height: 100vh;
            padding: 6px 30px;
            overflow-x: hidden;
            overflow-y: auto;
        }

        /deep/ .el-table th {
            text-overflow: initial;
        }
    }

    * /deep/ .el-cascader-node {
        white-space: normal;
        width: 150px;
    }

    * /deep/ .el-checkbox {
        height: 18px;
    }
</style>
