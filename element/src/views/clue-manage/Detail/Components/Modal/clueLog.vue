<!--
 * @Description:增加线索日志
 * @Author: niumkiki
 * @Date: 2020-06-23 14:30:09
 * @LastEditTime: 2020-07-08 18:25:34
 * @LastEditors: niumkiki
-->
<template>
    <div>
        <Modal
            :visible="visible"
            :title="$t('clue.clueLog')"
            :show-close="false"
            append-to-body
            width="600px"
            class="clue-log-modal">
                <Spin fix v-if="loading"></Spin>
                <div style="position: relative;">
                    <div
                        v-if="!clueLogArr.length"
                        style="margin-top: 20px;text-align: center;color: #999; ">
                        {{$t("crm.Table.noData")}}
                    </div>
                    <template v-else>
                        <Scroll :on-reach-bottom="handleReachBottom" :distance-to-edge="10">
                            <!-- 线索日志主体部分 -->
                            <div v-for="(clueLog, index) in clueLogArr" :key="clueLog.id" style="margin: 0px 20px;">
                                <div>
                                    <span style="margin-right:6px">{{clueLog.userName}}</span>&nbsp;&nbsp;
                                    <span style="margin-right:6px">[ {{clueLog.createTime | timeFormat('DateTime')}} ]</span>&nbsp;&nbsp;
                                    <span>{{translateCompanyOperateType(clueLog.action)}}</span>
                                    <Icon
                                        class="table-show-trigger"
                                        size="18"
                                        :type="clueLog.isShowDetail ?'ios-arrow-down': 'ios-arrow-up'"
                                        @click="showDetail(index)">
                                    </Icon>
                                </div>
                                </br>
                                <div v-if="clueLog.isShowDetail && getXSShowFailFlag">暂无数据</div>
                                <Table
                                    style="margin-bottom:20px"
                                    v-else-if="!getXSShowFailFlag && clueLog.isShowDetail"
                                    size="small"
                                    border
                                    :data="clueLogContext"
                                    :header-cell-style="{background:'rgb(244, 245, 248)'}"
                                    @click.native="tableClick">
                                        <Spin fix v-if="isShowDetailLoading"></Spin>

                                        <!-- 表格列为属性名、属性值的操作有：新增线索0-12、新增跟进记录 40-->
                                        <template
                                            v-if="!isShowDetailLoading && clueLog.action >= 0 && clueLog.action <= 12
                                                || clueLog.action >= 20 && clueLog.action <= 22
                                                || clueLog.action === 40">
                                            <!-- 属性名 -->
                                            <TableColumn
                                                align="center"
                                                prop="attrValue"
                                                :label="$t('crm.Modal.attrName')"
                                                :show-overflow-tooltip="true">
                                            </TableColumn>
                                            <!-- 属性值 -->
                                            <TableColumn
                                                align="center"
                                                :label="$t('crm.Modal.attrValue')"
                                                :show-overflow-tooltip="true">
                                                    <template slot-scope="scope">
                                                        <span v-if="scope.row.noAccessFlag" style="color:#EA4335':''">{{scope.row.after}}</span>
                                                        <span v-else :class="['attachment', 'pictures'].includes(scope.row.attrKey)? 'picture-content': ''">
                                                            <span v-if="scope.row.attrKey === 'pictures'">
                                                                {{scope.row.after.join(',')}}
                                                            </span>
                                                            <span v-if="scope.row.attrKey === 'attachment'">
                                                                <span v-if="scope.row.after.split(',') && scope.row.after.split(',').length < 4">
                                                                    <img @click="imgPreview"
                                                                        style="width:40px;height:40px;margin-left:4px"
                                                                        :src="item"
                                                                        :key="index"
                                                                        alt=""
                                                                        v-for="(item,index) in scope.row.after.split(',')">
                                                                </span>
                                                                <Tooltip v-else>
                                                                    <div slot="content">
                                                                        <img @click="imgPreview"
                                                                            style="width:40px;height:40px;margin-left:4px"
                                                                            :src="item"
                                                                            :key="index"
                                                                            alt=""
                                                                            v-for="(item,index) in scope.row.after.split(',')">
                                                                    </div>
                                                                    <span>
                                                                        <img @click="imgPreview"
                                                                            style="width:40px;height:40px;margin-left:4px"
                                                                            :src="item"
                                                                            :key="index"
                                                                            alt=""
                                                                            v-for="(item,index) in scope.row.after.split(',').slice(0,3)">
                                                                        <span class="img-Abbr">&nbsp;...</span>
                                                                    </span>
                                                                </Tooltip>
                                                            </span>
                                                            <!-- <span v-else-if="scope.row.attrKey === 'attachment'">
                                                                {{scope.row.after.join(',')}}
                                                            </span> -->
                                                            <span v-else>{{scope.row.after}}</span>
                                                        </span>
                                                        <!-- <span :style="scope.row.noAccessFlag?'color:#EA4335':''">{{scope.row.after}}</span> -->
                                                    </template>
                                            </TableColumn>
                                        </template>
                                        <!-- 表格列为变更项、变更前、变更后的操作有：编辑线索60、退入公海30、转移31、认领32、转移询盘转移线索33、变更跟进状态50-52、录询盘 54-->
                                        <template
                                            v-else-if="!isShowDetailLoading && (clueLog.action >= 30 && clueLog.action <= 33)
                                                    || (clueLog.action >= 50&& clueLog.action <= 52)
                                                    || clueLog.action === 60
                                                    || clueLog.action === 54">
                                            <!-- 变更项 -->
                                            <TableColumn
                                                align="center"
                                                prop="attrValue"
                                                :label="$t('clue.changeItem')"
                                                :show-overflow-tooltip="true">
                                            </TableColumn>
                                            <!-- 变更前 -->
                                            <TableColumn
                                                align="center"
                                                :label="$t('clue.changeBefore')"
                                                :show-overflow-tooltip="true">
                                                    <template slot-scope="scope">
                                                        <span :style="scope.row.noAccessFlag?'color:#EA4335':''">{{scope.row.before}}</span>
                                                    </template>
                                            </TableColumn>
                                            <!-- 变更后 -->
                                            <TableColumn
                                                align="center"
                                                :label="$t('clue.changeAfter')"
                                                :show-overflow-tooltip="true">
                                                    <template slot-scope="scope">
                                                        <span :style="scope.row.noAccessFlag?'color:#EA4335':''">{{scope.row.after}}</span>
                                                    </template>
                                            </TableColumn>
                                        </template>
                                </Table>
                            </div>
                            <textarea
                                ref="clue_log_copy"
                                style="width: 0;height: 0;opacity: 0;">
                            </textarea>
                        </Scroll>
                    </template>
                </div>
                <div slot="footer">
                    <Button @click="$emit('update:visible', false)">{{$t('close')}}</Button>
                </div>
        </Modal>
    </div>
</template>

<script>
    import Vue from 'vue';
    import { crmClue } from '@/api/crm';
    import Utils from '@/utils/index';
    import { mapState } from 'vuex';

    export default {
        props: [
            'visible',
            'clueId'
        ],
        data() {
            return {
                getXSShowFailFlag: false,
                loading: false,
                isShowDetailLoading: false,
                pageNo: 1,
                pageSize: 20,
                clueLogArr: [],
                clueLogContext: [],
                showList: null,
                isHaveXsShow: false,
                noAccessList: null
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            })
        },
        methods: {
            handleReachBottom() {
                this.pageNo++;
                this.getClueLog();
            },
            // 获取线索字段
            getClueShow() {
                return crmClue.getXSShow({
                    userId: this.userId,
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === '1') {
                        this.getXSShowFailFlag = false;
                        return res;
                    } else {
                        this.getXSShowFailFlag = true;
                        this.$Message.error(this.$t('clue.getXSShowFail'));
                        return false;
                    }
                }).catch(error => {
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('clue.getXSShowFail'));
                    }
                    this.getXSShowFailFlag = true;
                    return false;
                });
            },

            // 根据国家编码获取国家地区
            getCountryAreaName(list) {
                if (list.length) {
                    return crmClue.getNamesByList({
                        list,
                        lang: Vue.config.lang
                    }).then(res => {
                        if (res.code === '1') {
                            return res.data;
                        } else {
                            this.$Message.error(this.$t('crm.Table.error_transferCountryAreaCode'));
                            return null;
                        }
                    }).catch(() => {
                        this.$Message.error(this.$t('crm.Table.error_transferCountryAreaCode'));
                        return null;
                    });
                } else {
                    return null;
                }
            },

            // 获取线索日志
            getClueLog() {
                crmClue.getClueLog({
                    orgId: this.enterpriseId,
                    clueId: this.clueId,
                    pageNo: this.pageNo,
                    pageSize: this.pageSize
                }).then(res => {
                    if (res.code === '1') {
                        if (res.data.list && res.data.list.length) {
                            this.clueLogArr = this.clueLogArr.concat(res.data.list);
                        } else {
                            // this.clueLogArr = [];
                            this.$Message.info(this.$t('clue.noMoreLog'));
                        }
                    } else {
                        this.clueLogArr = [];
                        this.$Message.error(this.$t('clue.getClueLogErro'));
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                    this.clueLogArr = [];
                    this.$Message.error(this.$t('clue.getClueLogErro'));
                });
            },

            // 转换行为模式
            translateCompanyOperateType(action) {
                // editClueInfo: '编辑  线索信息',
                // addClueInfo: '新增  线索信息',
                // transferClueInfo: '转移 线索信息',
                // addRemarkInfo: '新增  跟进记录',
                // claimClueInfo: '认领  线索信息',
                // editClueStatus: '编辑  跟进状态',
                // backToHighSeaInfo: '退入公海',
                // addInquiryInfo: '新建询盘时同步新建线索'
                switch (true) {
                    case action >= 0 && action <= 11: // 创建线索
                        return this.$t('clue.addClueInfo');

                    case Number(action) === 20: // '在邮件管理新建询盘时同步新建线索'
                        return this.$t('clue.addEmailInfo');

                    case Number(action) === 12:
                    case Number(action) === 21:
                    case Number(action) === 22: // '新建询盘时同步新建线索';
                        return this.$t('clue.addInquiryInfo');

                    case Number(action) === 30: // '退入公海';
                        return this.$t('clue.backToHighSeaInfo');

                    case Number(action) === 31: // '转移  线索信息';
                        return this.$t('clue.transferClueInfo');

                    case Number(action) === 32: // '认领  线索信息';
                        return this.$t('clue.claimClueInfo');

                    case Number(action) === 33: // '转移  线索信息' --- 转移询盘转移线索;
                        return this.$t('clue.transferClueInfo');

                    case Number(action) === 40: // '新增  跟进记录';
                        return this.$t('clue.addRemarkInfo');

                    case Number(action) === 54: // '线索状态更新为询盘';
                        return this.$t('clue.updateClueStatusToInquiry');

                    case Number(action) >= 50 && Number(action) <= 52: // '编辑 跟进状态';
                        return this.$t('clue.editClueStatus');

                    case Number(action) === 60: // '编辑  线索信息';
                        return this.$t('clue.editClueInfo');

                    default:
                        return '';
                }
            },

            // 点击按钮，展开/收起操作详情
            async showDetail(index) {
                this.isShowDetailLoading = true;

                // 如果已经是展开状态, 收起并直接退出
                if (this.clueLogArr[index].isShowDetail) {
                    this.$set(this.clueLogArr[index], 'isShowDetail', false);
                    return;
                } else {
                    this.$set(this.clueLogArr[index], 'isShowDetail', true);
                }

                // 其他表格切换为收起
                this.clueLogArr.map((log, i) => {
                    if (log.id !== this.clueLogArr[index].id) {
                        // log.isShowDetail = false;
                        this.$set(this.clueLogArr[i], 'isShowDetail', false);
                    }
                });

                // 弹出提示语
                this.$Message.info({
                    message: this.$t('clue.tip_canCopy'),
                    duration: 1000
                });

                // 先判断线索字段是否有值，如果没有的话则请求接口获取线索字段
                if (!this.isHaveXsShow) {
                    const resData = await this.getClueShow();
                    if (!resData) {
                        this.isShowDetailLoading = false;
                        return;
                    };
                    this.isHaveXsShow = true;
                    this.noAccessList = resData.data.noAccess;
                }

                this.isShowDetailLoading = false;

                this.clueLogContext = JSON.parse(JSON.stringify(this.clueLogArr[index].context)).filter(log => log.isShow === 1);
                this.clueLogContext.forEach(async item => {
                    if (JSON.stringify(this.noAccessList) !== '{}') {
                        for (const key in this.noAccessList) {
                            if (item.attrKey === key) {
                                item.before = this.$t('clue.noAccessTip');
                                item.after = this.$t('clue.noAccessTip');
                                item.noAccessFlag = true;
                            }
                        }
                    }
                    // 处理国家地区字段
                    if (item.attrKey === 'a1003') {
                        const countrs = await this.getCountryAreaName([item.before, item.after]);
                        item.before = countrs[0];
                        item.after = countrs[1];
                    } else {
                        if (item.attrValue === '图片') {
                            item.attrValue = '附件';
                            const before = item.before.split(',').map(item => {
                                const name = Utils.getQueryVariable(item, 'name');
                                return name || this.$t('material.cloudPush.image');
                            });
                            const after = item.after.split(',').map(item => {
                                const name = Utils.getQueryVariable(item, 'name');
                                return name || this.$t('material.cloudPush.image');
                            });
                            item.before = before;
                            item.after = after;
                        } else if (item.attrValue === '附件') {
                            item.attrValue = '图片';
                            item.after = this.handleData(item.after, item.attrKey);
                        } else {
                            item.before = this.handleData(item.before, item.attrKey);
                            item.after = this.handleData(item.after, item.attrKey);
                        }
                    }
                });
            },

            // 多选或单选字段格式化处理
            handleData(val, key) {
                if (key === 'sale_name' && (val === '公海' || val === 'Public leads')) {
                    val = this.$t('clue.public_sea');
                }
                if (val) {
                    if (val.indexOf('[') === -1) {
                        return val;
                    } else {
                        const oldVal = val;
                        val = this.$options.filters.parseArray(val);
                        if (val.length) {
                            // 社交平台特殊处理
                            if (key === 'a10013') {
                                let tempStr = '';
                                val.forEach(platform => {
                                    if (platform.type) {
                                        tempStr += `${platform.type}:${platform.account}  `;
                                    } else if (platform.attrName) {
                                        tempStr += `${platform.attrName}:${platform.attrValue}  `;
                                    }
                                });
                                return tempStr;
                            } else {
                                return val.join(', ');
                            }
                        } else if (oldVal !== '[]') {
                            return oldVal;
                        } else {
                            return '';
                        }
                    }
                } else {
                    return '';
                }
            },

            // 点击表格复制
            tableClick(e) {
                // 如果是图片的话，不需要点击复制
                if (e.target.tagName === 'IMG' || e.target.className === 'img-Abbr' || e.target.childNodes[0].className === 'picture-content') {
                    return;
                }
                // 从 e 开始遍历 parentElement 直到遍历到 table ,中间的遍历结果存入数组,如果数组中有 TD ,则 copy 该 TD 的 innerText
                if (e.target.tagName === 'TD' && e.target.innerText) {
                    this.$refs.clue_log_copy.value = e.target.innerText;
                    this.$refs.clue_log_copy.select();
                    if (document.execCommand('Copy')) {
                        this.$Message.success(this.$t('crm.Modal.success_copy'));
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_copy'));
                    }
                } else {
                    let currentNode = e.target;
                    while (currentNode.parentElement) {
                        if (!currentNode.parentElement.classList.contains('el-table')) {
                            if (currentNode.parentElement.tagName === 'TD' && currentNode.parentElement.innerText) {
                                this.$refs.clue_log_copy.value = currentNode.parentElement.innerText;
                                this.$refs.clue_log_copy.select();
                                if (document.execCommand('Copy')) {
                                    this.$Message.success(this.$t('crm.Modal.success_copy'));
                                } else {
                                    this.$Message.error(this.$t('crm.Modal.error_copy'));
                                }
                                break;
                            } else {
                                currentNode = currentNode.parentElement;
                            }
                        } else {
                            break;
                        }
                    }
                }
            },
            // 图片预览
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            }
        },
        watch: {
            visible(newValue, oldValue) {
                if (newValue) {
                    this.loading = true;
                    this.getClueLog();
                } else {
                    // 关闭日志弹窗时，清空数据
                    this.pageNo = 1;
                    this.clueLogArr = [];
                    this.clueLogContext = [];
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .clue-log-modal {
        /deep/ .el-dialog__body {
            max-height: 400px;
            overflow: hidden;
            // overflow-y: auto;
        }
        .table-show-trigger {
            float: right;
        }

        /deep/ .ivu-scroll-container {
            height: 100% !important;
            max-height: 380px;
        }
    }
</style>
