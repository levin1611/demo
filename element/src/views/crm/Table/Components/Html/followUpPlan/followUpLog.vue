<template>
    <div class="followUpPlan-component">
        <div v-for="(log, index) in logList"
                 :key="log.id"
                 class="logging">
                <!-- 日志简略信息 -->
                <span>
                    <!-- xxx [yyyy-MM-dd hh:mm:ss] 操作名称 -->
                    {{ log.operator }}&nbsp;&nbsp;[{{ log.operateTime.format('yyyy-MM-dd hh:mm:ss') }}]&nbsp;&nbsp;{{ translateOperateType(log.operateType) }}&nbsp;&nbsp;
                    <!-- 完成跟进 xxxx公司 -->
                    <span v-if="log.operateType === 3">{{Array.isArray(log.logging.companyName) ? log.logging.companyName[0] : ''}}</span>
                </span>

                <!-- 展开收起箭头 -->
                <!-- 6认领、12合并 没有详情，不需要箭头 -->
                <Icon v-if="![4, 5].includes(log.operateType)"
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
                        <!-- 新建跟进计划 跟进记录-->
                        <template v-if="log.operateType === 1">
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
                                            <div v-for="(item, index) in scope.row.attrValue"
                                                :key="index"
                                                class="demo-upload-list">
                                                <img :src="item"
                                                    @click="imgPreview">
                                            </div>
                                        </template>
                                        <template v-else>
                                            <Tooltip>
                                                <div slot="content">
                                                    <div v-for="(item, index) in scope.row.attrValue"
                                                        :key="'show'+index"
                                                        class="demo-upload-list">
                                                        <img :src="item"
                                                            @click="imgPreview">
                                                    </div>
                                                </div>
                                                <span>
                                                    <div v-for="(item, index) in scope.row.attrValue.slice(0,3)"
                                                        :key="'show'+index"
                                                        class="demo-upload-list">
                                                        <img :src="item"
                                                            @click="imgPreview">
                                                    </div>
                                                    <span class="img-Abbr">&nbsp;...</span>
                                                </span>
                                            </Tooltip>
                                        </template>
                                    </template>
                                    <template v-else>{{ scope.row.attrValue}}</template>
                                </template>
                            </TableColumn>
                        </template>
                        <!-- 编辑 -->
                        <template v-else-if="log.operateType === 2">
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
                                    <template v-if="scope.row.changedItem === $t('crm.Modal.followUpPictures')">
                                        {{scope.row.beforeChange.join(',')}}
                                    </template>
                                    <template v-else-if="scope.row.changedItem === $t('crm.Modal.followUpAttachment')">
                                        <template v-if="scope.row.beforeChange.length < 4">
                                            <div v-for="(item, index) in scope.row.beforeChange" :key="'beforeChange'+index" class="demo-upload-list">
                                                <img :src="item" @click="imgPreview">
                                            </div>
                                        </template>
                                        <template v-else>
                                            <Tooltip>
                                                <div slot="content">
                                                    <div v-for="(item, index) in scope.row.beforeChange" :key="'beforeChange'+index" class="demo-upload-list">
                                                        <img :src="item"
                                                            @click="imgPreview">
                                                    </div>
                                                </div>
                                                <span>
                                                    <div v-for="(item, index) in scope.row.beforeChange.slice(0,3)" :key="'beforeChangeShow'+index" class="demo-upload-list">
                                                        <img :src="item" @click="imgPreview">
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
                                    <template v-if="scope.row.changedItem === $t('crm.Modal.followUpPictures')">
                                        {{scope.row.afterChange.join(',')}}
                                    </template>
                                    <template v-else-if="scope.row.changedItem === $t('crm.Modal.followUpAttachment')">
                                        <template v-if="scope.row.afterChange.length < 4">
                                            <div v-for="(item, index) in scope.row.afterChange" :key="'afterChange'+index"
                                                class="demo-upload-list">
                                                <img :src="item" @click="imgPreview">
                                            </div>
                                        </template>
                                        <template v-else>
                                            <Tooltip>
                                                <div slot="content">
                                                    <div v-for="(item, index) in scope.row.afterChange"
                                                        :key="'afterChange'+index"
                                                        class="demo-upload-list">
                                                        <img :src="item" @click="imgPreview">
                                                    </div>
                                                </div>
                                                <span>
                                                    <div v-for="(item, index) in scope.row.afterChange.slice(0,3)"
                                                        :key="'afterChangeShow'+index"
                                                        class="demo-upload-list">
                                                        <img :src="item" @click="imgPreview">
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
                        <template v-else-if="log.operateType === 3">
                            <TableColumn align="center"
                                         prop="attrName"
                                         :label="$t('crm.Modal.attrName')"
                                         :show-overflow-tooltip="true"></TableColumn>
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
                    </Table>
                </div>
            </div>

            <!-- 点击单元格复制格内内容用的 textarea -->
            <textarea ref="log_copy" style="width: 0;height: 0;opacity: 0;"></textarea>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmFollowupPlan } from '@/api/crm/index';
    import Utils from '@/utils/index';

    export default {
        name: 'followUpLog',
        components: {
        },
        props: [
            'planId'
        ],
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                followupTypes: state => state.crm.followUpType
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
        methods: {
            // 获取详情
            getLogData() {
                crmFollowupPlan.getFollowUpLogs({
                    followUpPlanId: this.planId
                }).then(res => {
                    if (res.code === '1') {
                        this.logList = res.data.map(item => {
                            /**
                             * @Description: 新增类型：去掉因多选类型而保存的'[]'
                             * @author mayuanzhi
                             * @date 2020/5/21
                            */
                            let obj = {};
                            if (item.newValue && item.newValue.trim()) {
                                obj = JSON.parse(item.newValue);
                            }
                            return {
                                operator: item.operator,
                                operateType: item.operateType,
                                operateTime: new Date(item.operateTime),
                                operateModule: item.operateModule,
                                logging: obj,
                                detailShow: false
                            };
                        });
                    }
                });
            },
            // 解析操作类型
            translateOperateType(type) {
                return this.$t(`crm.followUpPlan.operateType${type}`);
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
                    if (this.logList[index].operateType !== 3) {
                        Object.keys(sourceData).forEach(item => {
                            if (/[\u4e00-\u9fa5]/.test(item)) { // 多语言版本之前存的日志保持原状
                                tempData[item] = sourceData[item];
                            } else if (this.$t(`crm.followUpPlan.${item}`).startsWith('crm.followUpPlan.')) { // 如果没找到相应的版本, 说明是原先就定义了非中文自定义字段, 保持原状
                                // 如果退入公海原因是'取消跟进',则需要单独处理
                                tempData[item] = sourceData[item];
                                // tempData[item] = sourceData[item];
                            } else { // 找得到多语言版本, 替换多语言
                                tempData[this.$t(`crm.followUpPlan.${item}`)] = sourceData[item];
                            }
                        });
                    } else {
                        Object.keys(sourceData).forEach(item => {
                            if (/[\u4e00-\u9fa5]/.test(item)) { // 多语言版本之前存的日志保持原状
                                tempData[item] = sourceData[item];
                            } else if (this.$t(`crm.Modal.${item}`).startsWith('crm.Modal.')) { // 如果没找到相应的版本, 说明是原先就定义了非中文自定义字段, 保持原状
                                // 如果退入公海原因是'取消跟进',则需要单独处理
                                tempData[item] = sourceData[item];
                                // tempData[item] = sourceData[item];
                            } else { // 找得到多语言版本, 替换多语言
                                tempData[this.$t(`crm.Modal.${item}`)] = sourceData[item];
                            }
                        });
                    }
                    sourceData = tempData;
                    switch (this.logList[index].operateType) {
                        case 1:
                        case 3:
                            this.logDetailData = Object.keys(sourceData).map(key => {
                                if (key === this.$t('crm.Modal.followUpPictures')) {
                                    const followUpPictures = JSON.parse(sourceData[key][0]);
                                    const attrValue = followUpPictures.map(item => {
                                        const name = Utils.getQueryVariable(item, 'name');
                                        return name || this.$t('material.cloudPush.image');
                                    });
                                    return {
                                        attrName: key,
                                        attrValue: attrValue
                                    };
                                } else if (key === this.$t('crm.Modal.followUpAttachment')) {
                                    return {
                                        attrName: key,
                                        attrValue: JSON.parse(sourceData[key][0])
                                    };
                                } else {
                                    return {
                                        attrName: key,
                                        attrValue: sourceData[key][0]
                                    };
                                }
                            });
                            this.logList[index].detailShow = true;
                            break;
                        case 2:
                            this.logDetailData = Object.keys(sourceData).map(key => {
                                return {
                                    changedItem: key,
                                    beforeChange: sourceData[key][0],
                                    afterChange: sourceData[key][1]
                                };
                            });
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
            }
        },
        mounted() {
        },
        beforeDestroy() {
        },
        watch: {
            planId: {
                handler(val) {
                    if (val) {
                        this.getLogData();
                    }
                },
                immediate: true
            }

        }
    };
</script>

<style lang="less" scoped>
    .logging {
        font-size: 14px;
        line-height: 1;
        margin-bottom: 20px;
        color: #333;
        i {
            padding-left: 50px;
        }
    }
</style>
