<template>
    <Modal :title="$t('crm.Modal.title_companyLog')"
           :visible="visible"
           width="600px"
           :show-close="false"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :modal-append-to-body="false"
           @opened="handleScrollTop"
           class="modal">
        <!-- body -->
        <div style="position: relative;">
            <!-- loading -->
            <Spin v-if="loading"
                  fix></Spin>

            <!-- log table -->
            <div v-for="(log, index) in logList"
                 :key="log.id"
                 class="logging">
                <!-- 日志简略信息 -->
                <span>
                    <!-- xxx [yyyy-MM-dd hh:mm:ss] 操作名称 -->
                    {{ log.operator }}&nbsp;&nbsp;[{{ log.operate_time.format('yyyy-MM-dd hh:mm:ss') }}]&nbsp;&nbsp;{{ translateOperateType(log.operate_type) }}&nbsp;&nbsp;
                    <!-- 合并其他客户, 此处显示其他客户名称 -->
                    <span v-if="log.operate_type === 12">{{ log.logging ? log.logging.otherCompanyName : '' }}</span>
                    <!-- 认领/退入/分配客户, 此处不显示内容 -->
                    <template v-else-if="[6, 7, 61, 15].includes(log.operate_type)"></template>
                    <!-- 其余情况, 此处显示被操作的模块名称 -->
                    <span v-else>{{ translateOperateModule(log.operate_module) }}</span>
                </span>

                <!-- 展开收起箭头 -->
                <!-- 6认领、12合并 没有详情，不需要箭头 -->
                <Icon v-if="![6, 12].includes(log.operate_type)"
                      :type="log.detailShow ? 'ios-arrow-up' : 'ios-arrow-down'"
                      size="18"
                      @click.native="showDetail(index)"
                      class="table-show-trigger"></Icon>

                <!-- 详情信息表格 -->
                <div v-if="log.detailShow">
                    <br>
                    <Table :data="logDetailData"
                           size="small"
                           border
                           @click.native="tableClick">
                        <!-- 新建 -->
                        <template v-if="log.operate_type === 1">
                            <!-- 属性名 -->
                            <TableColumn align="center"
                                         prop="attrName"
                                         :label="$t('crm.Modal.attrName')"
                                         :show-overflow-tooltip="true"></TableColumn>
                            <!-- 属性值 -->
                            <TableColumn align="center"
                                         prop="attrValue"
                                         :label="$t('crm.Modal.attrValue')"
                                         :show-overflow-tooltip="true">
                                <template slot-scope="scope">
                                    <template v-if="scope.row.attrName === $t('crm.Modal.corp_companyPicture')">
                                        <div v-for="item in scope.row.attrValue.split(';')"
                                             class="demo-upload-list">
                                            <img :src="item"
                                                 @click="imgPreview">
                                        </div>
                                    </template>
                                    <template v-else>{{ parseMultipleData(scope.row.attrValue) }}</template>
                                </template>
                            </TableColumn>
                        </template>
                        <!-- 转移分享/分配客户 -->
                        <template v-else-if="[9, 10, 61].includes(log.operate_type)">
                            <!-- 属性名 -->
                            <TableColumn align="center"
                                         prop="attrName"
                                         :label="$t('crm.Modal.attrName')"
                                         :show-overflow-tooltip="true"></TableColumn>
                            <!-- 属性值 -->
                            <TableColumn align="center"
                                         prop="attrValue"
                                         :label="$t('crm.Modal.attrValue')">
                                <template slot-scope="scope">
                                    <template v-if="[$t('crm.Modal.manager_beforeChange'), $t('crm.Modal.manager_afterChange'), 'manager_beforeChange', 'manager_afterChange', 'Followers (before change)', 'Followers (after change)', 'Sales Rep. (before change)', 'Sales Rep. (after change)', '负责人(变更前)', '负责人(变更后)'].includes(scope.row.attrName)">
                                        <template v-if="Object.prototype.toString.call(scope.row.attrValue) === '[object Object]'">
                                            {{ Object.values(scope.row.attrValue).map(item => item || $t('crm.Modal.empty_fullname')).join(', ') }}
                                        </template>
                                        <template v-else>{{ scope.row.attrValue }}</template>
                                    </template>
                                    <template v-else-if="[$t('crm.Modal.transferClueSync'), 'transferClueSync', '同步转移线索', 'Synchronous transfer leads'].includes(scope.row.attrName)">
                                        <template v-if="scope.row.attrValue">
                                            <template v-if="scope.row.attrValue === '1'">{{ $t('crm.Modal.success') }}</template>
                                            <template v-else-if="scope.row.attrValue.length > 1">{{ scope.row.attrValue }}</template>
                                            <template v-else>{{ $t('crm.Modal.error') }}</template>
                                        </template>
                                    </template>
                                    <template v-else>{{ scope.row.attrValue }}</template>
                                </template>
                            </TableColumn>
                        </template>
                        <!-- 编辑 || 编辑跟进记录 -->
                        <template v-else-if="[2, 11].includes(log.operate_type)">
                            <!-- 变更项名称 -->
                            <TableColumn align="center"
                                         prop="changedItem"
                                         :label="$t('crm.Modal.changedItem')"
                                         :show-overflow-tooltip="true"></TableColumn>
                            <!-- 变更项变更前值 -->
                            <TableColumn align="center"
                                         prop="beforeChange"
                                         :label="$t('crm.Modal.beforeChange')"
                                         :show-overflow-tooltip="true">
                                <template slot-scope="scope">
                                    <template v-if="scope.row.changedItem === $t('crm.Modal.corp_companyPicture')">
                                        <div v-for="item in scope.row.beforeChange.split(';')"
                                             class="demo-upload-list">
                                            <img :src="item"
                                                 @click="imgPreview">
                                        </div>
                                    </template>
                                    <template v-else-if="scope.row.changedItem === $t('crm.Modal.followUpPictures')">
                                        {{scope.row.beforeChange.join(',')}}
                                    </template>
                                    <template v-else-if="scope.row.changedItem === $t('crm.Modal.followUpAttachment')">
                                        <template v-if="scope.row.beforeChange.length < 4">
                                            <div v-for="item in scope.row.beforeChange"
                                                class="demo-upload-list">
                                                <img :src="item"
                                                    @click="imgPreview">
                                            </div>
                                        </template>
                                        <template v-else>
                                            <Tooltip>
                                                <div slot="content">
                                                    <div v-for="item in scope.row.beforeChange"
                                                        class="demo-upload-list">
                                                        <img :src="item"
                                                            @click="imgPreview">
                                                    </div>
                                                </div>
                                                <span>
                                                    <div v-for="item in scope.row.beforeChange.slice(0,3)"
                                                        class="demo-upload-list">
                                                        <img :src="item"
                                                            @click="imgPreview">
                                                    </div>
                                                    <span class="img-Abbr">&nbsp;...</span>
                                                </span>
                                            </Tooltip>
                                        </template>
                                    </template>
                                    <template v-else>{{ parseMultipleData(scope.row.beforeChange) }}</template>
                                </template>
                            </TableColumn>
                            <!-- 变更项变更后值 -->
                            <TableColumn align="center"
                                         prop="afterChange"
                                         :label="$t('crm.Modal.afterChange')"
                                         :show-overflow-tooltip="true">
                                <template slot-scope="scope">
                                    <template v-if="scope.row.changedItem === $t('crm.Modal.corp_companyPicture')">
                                        <div v-for="item in scope.row.afterChange.split(';')"
                                             class="demo-upload-list">
                                            <img :src="item"
                                                 @click="imgPreview">
                                        </div>
                                    </template>
                                    <template v-else-if="scope.row.changedItem === $t('crm.Modal.followUpPictures')">
                                        {{scope.row.afterChange.join(',')}}
                                    </template>
                                    <template v-else-if="scope.row.changedItem === $t('crm.Modal.followUpAttachment')">
                                        <template v-if="scope.row.afterChange.length < 4">
                                            <div v-for="item in scope.row.afterChange"
                                                class="demo-upload-list">
                                                <img :src="item"
                                                    @click="imgPreview">
                                            </div>
                                        </template>
                                        <template v-else>
                                            <Tooltip>
                                                <div slot="content">
                                                    <div v-for="item in scope.row.afterChange"
                                                        class="demo-upload-list">
                                                        <img :src="item"
                                                            @click="imgPreview">
                                                    </div>
                                                </div>
                                                <span>
                                                    <div v-for="item in scope.row.afterChange.slice(0,3)"
                                                        class="demo-upload-list">
                                                        <img :src="item"
                                                            @click="imgPreview">
                                                    </div>
                                                    <span class="img-Abbr">&nbsp;...</span>
                                                </span>
                                            </Tooltip>
                                        </template>
                                    </template>
                                    <template v-else>{{ parseMultipleData(scope.row.afterChange) }}</template>
                                </template>
                            </TableColumn>
                        </template>
                        <!-- 跟进记录 -->
                        <template v-else-if="log.operate_type === 8">
                            <!-- 属性名 -->
                            <TableColumn align="center"
                                         prop="attrName"
                                         :label="$t('crm.Modal.attrName')"
                                         :show-overflow-tooltip="true"></TableColumn>
                            <!-- 属性值 -->
                            <TableColumn align="center"
                                         prop="attrValue"
                                         :label="$t('crm.Modal.attrValue')"
                                         :show-overflow-tooltip="true">
                                <template slot-scope="scope">
                                    <template v-if="scope.row.attrName === $t('crm.Modal.followUpPictures')">
                                        {{scope.row.attrValue.join(',')}}
                                    </template>
                                     <template v-else-if="scope.row.attrName === $t('crm.Modal.followUpAttachment')">
                                        <template v-if="scope.row.attrValue.length < 4">
                                            <div v-for="item in scope.row.attrValue"
                                                class="demo-upload-list">
                                                <img :src="item"
                                                    @click="imgPreview">
                                            </div>
                                        </template>
                                        <template v-else>
                                            <Tooltip>
                                                <div slot="content">
                                                    <div v-for="item in scope.row.attrValue"
                                                        class="demo-upload-list">
                                                        <img :src="item"
                                                            @click="imgPreview">
                                                    </div>
                                                </div>
                                                <span>
                                                    <div v-for="item in scope.row.attrValue.slice(0,3)"
                                                        class="demo-upload-list">
                                                        <img :src="item"
                                                            @click="imgPreview">
                                                    </div>
                                                    <span class="img-Abbr">&nbsp;...</span>
                                                </span>
                                            </Tooltip>
                                        </template>
                                    </template>
                                    <template v-else>{{ scope.row.attrValue }}</template>
                                </template>
                            </TableColumn>
                        </template>
                        <!-- 投入公海 -->
                        <template v-else-if="log.operate_type === 7">
                            <!-- 属性名 -->
                            <TableColumn align="center"
                                         prop="giveupIdName"
                                         :label="$t('crm.Modal.returnPublicReason')"
                                         :show-overflow-tooltip="true"></TableColumn>
                            <!-- 属性值 -->
                            <TableColumn align="center"
                                         prop="giveupReasonDetail"
                                         :label="$t('crm.Modal.returnPublicDetails')">
                                <template slot-scope="scope">{{ scope.row.giveupReasonDetail || $t('crm.Html.nothing') }}</template>
                            </TableColumn>
                        </template>
                        <!-- 旅程重建 -->
                        <template v-else-if="log.operate_type === 15">
                            <!-- 操作 -->
                            <TableColumn align="center"
                                         prop="operator"
                                         :label="$t('crm.Table.operate')"
                                         :show-overflow-tooltip="true"></TableColumn>
                            <!-- 操作人 -->
                            <TableColumn align="center"
                                         prop="operatorUser"
                                         :label="$t('crm.Modal.operator_user')"
                                         :show-overflow-tooltip="true"></TableColumn>
                            <!-- 操作时间 -->
                            <TableColumn align="center"
                                         prop="operatorTime"
                                         :label="$t('crm.Modal.operationTime')"
                                         :show-overflow-tooltip="true"></TableColumn>
                        </template>
                    </Table>
                </div>
            </div>

            <!-- 点击单元格复制格内内容用的 textarea -->
            <textarea ref="log_copy"
                      style="width: 0;height: 0;opacity: 0;"></textarea>
        </div>

        <!-- footer -->
        <div slot="footer">
            <Button @click="cancel"
                    :class="`piwik_${type}_close_company_log`">{{ $t('crm.Modal.modal_close') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmCompany } from '@/api/crm/index';
    import Utils from '@/utils/index';

    export default {
        name: 'viewCompanyLog',
        props: [
            'type',
            'visible',
            'companyId'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                lang: state => state.app.lang
            })
        },
        data() {
            return {
                logList: [],
                tableFirstShow: true,
                logDetailData: [],
                loading: true,
                customColumns: []
            };
        },
        created() {
        },
        methods: {
            // 获取自定义字段
            getColumnsShow() {
                this.customColumns = [];
                this.$commonApi.getColumnsShow({
                    orgId: this.enterpriseId,
                    parentId: 1,
                    isShow: 1
                }).then(response => {
                    if (response.code === '1') {
                        this.customColumns = Object.values(response.data.hide);
                        this.customColumns = this.customColumns.concat(Object.values(response.data.show));
                    }
                });
            },
            // 关闭弹窗
            cancel() {
                this.$emit('update:visible', false);
            },
            // 获取日志数据
            getLogList() {
                crmCompany.getCompanyLogs({
                    companyId: this.companyId,
                    lang: this.lang
                }).then(async response => {
                    if (response.code === '1') {
                        this.logList = response.data.lists.map(item => {
                            /**
                             * @Description: 新增类型：去掉因多选类型而保存的'[]'
                             * @author mayuanzhi
                             * @date 2020/5/21
                            */
                            let obj = {};
                            if (item.new_value && item.new_value.trim()) {
                                obj = JSON.parse(item.new_value);
                                if (item.operate_type === 1) {
                                    for (const key in obj) {
                                        if (obj[key] === '[]') {
                                            delete obj[key];
                                        }
                                    }
                                }
                            }
                            return {
                                operator: item.operator,
                                operate_type: item.operate_type,
                                operate_time: new Date(item.operate_time),
                                operate_module: item.operate_module,
                                logging: obj,
                                detailShow: false
                            };
                        });
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_getCompanyLog'));
                    }
                    this.loading = false;
                }, error => {
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            },
            // 解析操作类型
            translateOperateType(type) {
                switch (type) {
                    case 1:
                    case 8:
                    case 13:
                        return this.$t('crm.Modal.operate_add');
                    case 2:
                    case 11:
                    case 14:
                        return this.$t('crm.Modal.operate_edit');
                    case 3:
                        return this.$t('crm.Modal.operate_delete');
                    case 4:
                        return this.$t('crm.Modal.operate_upload');
                    case 5:
                        return this.$t('crm.Modal.operate_download');
                    case 6:
                        return this.$t('crm.Modal.operate_claimCustomer');
                    case 7:
                        return this.$t('crm.Modal.operate_throw');
                    case 9:
                        return this.$t('crm.Modal.operate_transfer');
                    case 10:
                        return this.$t('crm.Modal.operate_share');
                    case 12:
                        return this.$t('crm.Modal.operate_merge_company');
                    case 61:
                        return this.$t('crm.Modal.operate_distributeCustomer');
                    case 15:
                        return `${this.$t('crm.Modal.rebuild')} ${this.$t('crm.Modal.customer_journey')}`;
                    default:
                        return type;
                }
            },
            // 解析操作模块
            translateOperateModule(module) {
                switch (module) {
                    case 1:
                        return this.$t('crm.Modal.module_company');
                    case 2:
                        return this.$t('crm.Modal.module_contact');
                    case 3:
                        return this.$t('crm.Modal.module_inquiry');
                    case 4:
                        return 'error';
                    case 5:
                        return this.$t('crm.Modal.module_document');
                    case 6:
                        return this.$t('crm.Modal.module_schedule');
                    case 8:
                    case 11:
                        return this.$t('crm.Modal.module_followUp');
                    case 13:
                        return this.$t('crm.Modal.module_transactionData');
                    default:
                        return module;
                }
            },
            // 解析数据, 遇到数组时显示为拼接字符串
            parseMultipleData(val) {
                if (Array.isArray(val)) {
                    return val.join(', ');
                }
                const temp = this.$options.filters.parseArray(val);
                if (temp.length) {
                    return temp.join(', ');
                } else if (val !== '[]') {
                    return val;
                } else {
                    return '';
                }
            },
            // 展开/收起日志详细信息
            showDetail(index) {
                // 如果已经是展开状态, 收起并直接退出
                if (this.logList[index].detailShow) {
                    this.logList[index].detailShow = false;
                    return;
                }

                // 其他表格切换为收起
                this.logList.map(item => {
                    item.detailShow = false;
                });

                // 展开当前表格
                let sourceData = this.logList[index].logging;
                if (sourceData instanceof Object && Object.keys(sourceData).length) {
                    const tempData = {};

                    Object.keys(sourceData).forEach(item => {
                        if (/[\u4e00-\u9fa5]/.test(item)) { // 多语言版本之前存的日志保持原状
                            tempData[item] = sourceData[item];
                        } else if (item.startsWith('a100')) { // 自定义字段根据 storageName 找 cname
                            if (!this.customColumns.some(field => {
                                if (field.storageName === item) {
                                    tempData[field.cname] = sourceData[item];
                                    return true;
                                }
                            })) {
                                tempData[item] = sourceData[item];
                            }
                        } else if (this.$t(`crm.Modal.${item}`).startsWith('crm.Modal.')) { // 如果没找到相应的版本, 说明是原先就定义了非中文自定义字段, 保持原状
                            // 如果退入公海原因是'取消跟进',则需要单独处理
                            // giveupId === -2 是前后端统一的
                            if (sourceData[item] === '取消跟进' && sourceData.giveupId === -2) {
                                tempData[item] = this.$t('crm.Detail.unfollow');
                            } else {
                                tempData[item] = sourceData[item];
                            }
                            // tempData[item] = sourceData[item];
                        } else { // 找得到多语言版本, 替换多语言
                            tempData[this.$t(`crm.Modal.${item}`)] = sourceData[item];
                        }
                    });

                    sourceData = tempData;
                    /* 经产品确认，如果当前的操作类型为61---分配客户，则变更前负责人由前端设为定值： 公海 */
                    const obj = { '-1': '公海' };
                    /**
                     * 1新增、2编辑、3删除、4上传、5下载、6认领、7、投入公海
                     * 8添加跟进记录 9.转移询盘 10分享询盘 11编辑跟进记录 12 询盘合并 13询盘成交
                     * 14 编辑成交信息 61:分配客户
                     */
                    switch (this.logList[index].operate_type) {
                        case 1:
                        case 8:
                        case 13:
                            this.logDetailData = Object.keys(sourceData).map(key => {
                                if (key === this.$t('crm.Modal.followUpPictures')) {
                                    const attrValue = sourceData[key].map(item => {
                                        const name = Utils.getQueryVariable(item, 'name');
                                        return name || this.$t('material.cloudPush.image');
                                    });
                                    return {
                                        attrName: key,
                                        attrValue: attrValue
                                    };
                                } else {
                                    return {
                                        attrName: key,
                                        attrValue: sourceData[key]
                                    };
                                }
                            });
                            this.logList[index].detailShow = true;
                            break;
                        case 9:
                        case 10:
                            this.logDetailData = Object.keys(sourceData).map(key => {
                                return {
                                    attrName: key,
                                    attrValue: sourceData[key]
                                };
                            });
                            this.logList[index].detailShow = true;
                            break;
                        case 61:
                            this.logDetailData = Object.keys(sourceData).map(key => {
                                return {
                                    attrName: key,
                                    attrValue: sourceData[key] && Object.keys(sourceData[key]).length ? sourceData[key] : obj
                                };
                            });
                            this.logList[index].detailShow = true;
                            break;
                        case 2:
                        case 11:
                        case 14:
                            this.logDetailData = Object.keys(sourceData).map(key => {
                                if (key === this.$t('crm.Modal.followUpPictures')) {
                                    const beforeChange = sourceData[key][0].map(item => {
                                        const name = Utils.getQueryVariable(item, 'name');
                                        return name || this.$t('material.cloudPush.image');
                                    });
                                    const afterChange = sourceData[key][1].map(item => {
                                        const name = Utils.getQueryVariable(item, 'name');
                                        return name || this.$t('material.cloudPush.image');
                                    });
                                    return {
                                        changedItem: key,
                                        beforeChange: beforeChange,
                                        afterChange: afterChange
                                    };
                                } else {
                                    return {
                                        changedItem: key,
                                        beforeChange: sourceData[key][0],
                                        afterChange: sourceData[key][1]
                                    };
                                }
                            });
                            this.logList[index].detailShow = true;
                            break;
                        case 3:
                        case 4:
                        case 5:
                            this.logDetailData = [sourceData];
                            this.logList[index].detailShow = true;
                            break;
                        case 7:
                            this.logDetailData = [sourceData];
                            this.logList[index].detailShow = true;
                            break;
                        case 15:
                            this.logDetailData = [sourceData];
                            this.logList[index].detailShow = true;
                            break;
                        default:
                            this.$Message.error(this.$t('crm.Modal.error_logType'));
                            return;
                    }

                    // 初次展开详细信息表格时弹出可复制提示
                    if (this.tableFirstShow) {
                        this.tableFirstShow = false;
                        this.$Message.info({
                            message: this.$t('crm.Modal.tip_canCopy'),
                            duration: 3000
                        });
                    }
                } else {
                    this.$Message.info(this.$t('crm.Modal.info_noDetailInfo'));
                }
            }, // 展示详情
            // 点击表格单元格复制表格内容
            tableClick(e) {
                // 从 e 开始遍历 parentElement 直到遍历到 table ,中间的遍历结果存入数组,如果数组中有 TD ,则 copy 该 TD 的 innerText
                if (e.target.tagName === 'TD' && e.target.innerText) {
                    this.$refs.log_copy.value = e.target.innerText;
                    this.$refs.log_copy.select();
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
                                this.$refs.log_copy.value = currentNode.parentElement.innerText;
                                this.$refs.log_copy.select();
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
            }, // 点击单元格复制单元格文本
            // 图片预览
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            // 打开弹窗时滚动到页面顶部
            handleScrollTop() {
                document.querySelector('.el-dialog__body').scrollTop = 0;
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.getColumnsShow();
                    this.loading = true;
                    this.getLogList();
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .logging {
        position: relative;
        margin: 20px;
        vertical-align: middle;

        > span {
            display: inline-block;
            padding-right: 40px;
        }

        .table-show-trigger {
            position: absolute;
            /*top: -10px;*/
            right: 0;
            cursor: pointer;
        }
    }
</style>
