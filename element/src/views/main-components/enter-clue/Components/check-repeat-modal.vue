<template>
    <Modal :title="title"
           :visible="visible"
           :show-close="true"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :append-to-body="true"
           width="900px"
           @close="cancel"
            v-loading="loading"
           class="modal uniqModal vertical-center-modal">
        <div>
             <!-- 联系人邮箱重复 -->
            <template v-if="contactEmailData.length">
                 <p class="repeat-tip">{{$t('clue.repeatTip1')}}</p>
                <Table :data="contactEmailData"
                    :max-height="tableMaxHeight"
                    @cell-click="copy_content">
                    <TableColumn v-for="item in contactEmailColumns"
                                :key="item.key"
                                :prop="item.key"
                                :label="item.title"
                                :align="item.align"
                                :formatter="item.formatter"
                                :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template v-if="item.key === 'companyName'">
                                <a @click.stop="viewCompany(scope.row.companyId)"
                                class="hover-link">{{ scope.row[item.key] }}</a>
                            </template>
                            <template v-else-if="item.formatter">
                                {{ (item.formatter)(scope.row) }}
                            </template>
                            <template v-else>
                                {{ scope.row[item.key] }}
                            </template>
                        </template>
                    </TableColumn>
                </Table>
            </template>
            <!-- 线索邮箱重复 -->
            <template v-if="clueEmailData.length">
                 <p class="repeat-tip">{{$t('clue.repeatTip2')}}</p>
                <Table :data="clueEmailData"
                    :max-height="tableMaxHeight"
                    @cell-click="copy_content">
                    <TableColumn v-for="item in clueEmailColumns"
                                :key="item.key"
                                :prop="item.key"
                                :label="item.title"
                                :align="item.align"
                                :formatter="item.formatter"
                                :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template v-if="item.key === 'seqNumber'">
                                <a @click.stop="viewClue(scope.row.id)"
                                class="hover-link">{{ scope.row[item.key] }}</a>
                            </template>
                            <template v-else-if="item.formatter">
                                {{ (item.formatter)(scope.row) }}
                            </template>
                            <template v-else>
                                {{ scope.row[item.key] }}
                            </template>
                        </template>
                    </TableColumn>
                </Table>
            </template>
            <!-- 联系人电话重复 -->
            <template v-if="contactPhoneData.length">
                 <p class="repeat-tip">{{$t('clue.repeatTip3')}}</p>
                <Table :data="contactPhoneData"
                    :max-height="tableMaxHeight"
                    @cell-click="copy_content">
                    <TableColumn v-for="item in contactPhoneColumns"
                                :key="item.key"
                                :prop="item.key"
                                :label="item.title"
                                :align="item.align"
                                :formatter="item.formatter"
                                :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template v-if="item.key === 'companyName'">
                                <a @click.stop="viewCompany(scope.row.companyId)"
                                class="hover-link">{{ scope.row[item.key] }}</a>
                            </template>
                            <template v-else-if="item.formatter">
                                {{ (item.formatter)(scope.row) }}
                            </template>
                            <template v-else>
                                {{ scope.row[item.key] }}
                            </template>
                        </template>
                    </TableColumn>
                </Table>
            </template>
            <!-- 线索电话重复 -->
            <template v-if="cluePhoneData.length">
                 <p class="repeat-tip">{{$t('clue.repeatTip4')}}</p>
                <Table :data="cluePhoneData"
                    :max-height="tableMaxHeight"
                    @cell-click="copy_content">
                    <TableColumn v-for="item in cluePhoneColumns"
                                :key="item.key"
                                :prop="item.key"
                                :label="item.title"
                                :align="item.align"
                                :formatter="item.formatter"
                                :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template v-if="item.key === 'seqNumber'">
                                <a @click.stop="viewClue(scope.row.id)"
                                class="hover-link">{{ scope.row[item.key] }}</a>
                            </template>
                            <template v-else-if="item.formatter">
                                {{ (item.formatter)(scope.row) }}
                            </template>
                            <template v-else>
                                {{ scope.row[item.key] }}
                            </template>
                        </template>
                    </TableColumn>
                </Table>
            </template>
            <!-- 联系人WA重复 -->
            <template v-if="contactWAData.length">
                 <p class="repeat-tip">{{$t('clue.repeatTip5')}}</p>
                <Table :data="contactWAData"
                    :max-height="tableMaxHeight"
                    @cell-click="copy_content">
                    <TableColumn v-for="item in contactWAColumns"
                                :key="item.key"
                                :prop="item.key"
                                :label="item.title"
                                :align="item.align"
                                :formatter="item.formatter"
                                :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template v-if="item.key === 'companyName'">
                                <a @click.stop="viewCompany(scope.row.companyId)"
                                class="hover-link">{{ scope.row[item.key] }}</a>
                            </template>
                            <template v-else-if="item.formatter">
                                {{ (item.formatter)(scope.row) }}
                            </template>
                            <template v-else>
                                {{ scope.row[item.key] }}
                            </template>
                        </template>
                    </TableColumn>
                </Table>
            </template>
            <!-- 线索WA重复 -->
            <template v-if="clueWAData.length">
                 <p class="repeat-tip">{{$t('clue.repeatTip6')}}</p>
                <Table :data="clueWAData"
                    :max-height="tableMaxHeight"
                    @cell-click="copy_content">
                    <TableColumn v-for="item in clueWAColumns"
                                :key="item.key"
                                :prop="item.key"
                                :label="item.title"
                                :align="item.align"
                                :formatter="item.formatter"
                                :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template v-if="item.key === 'seqNumber'">
                                <a @click.stop="viewClue(scope.row.id)"
                                class="hover-link">{{ scope.row[item.key] }}</a>
                            </template>
                            <template v-else-if="item.formatter">
                                {{ (item.formatter)(scope.row) }}
                            </template>
                            <template v-else>
                                {{ scope.row[item.key] }}
                            </template>
                        </template>
                    </TableColumn>
                </Table>
            </template>
        </div>

        <!-- 隐藏元素, 用来复制内容 -->
        <textarea ref="copy_element"
                  style="width: 0;height: 0;opacity: 0;"></textarea>
        <!-- 底部区域 -->
        <div slot="footer">
            <p v-if="flag !== 'self-test'" style="text-align:left;">{{$t('clue.continue')}}</p>
            <!-- 关闭弹窗 -->
            <Button @click="cancel">{{ $t('crm.Modal.modal_close') }}</Button>
            <!-- 关联已有联系人 -->
            <Button type="primary" @click="okEnter" v-if="flag !== 'self-test'">{{ $t('clue.confirm') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'check-repeat-modal',
        props: [
            'visible',
            'title',
            'flag',
            'repeatData'
        ],
        computed: {
            ...mapState([
                'enterpriseId',
                'window_height'
            ]), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            tableMaxHeight() {
                const temp = this.window_height ? this.window_height - 341 : document.body.clientHeight - 341;
                return temp > 159 ? temp : 159;
            }
        },
        data() {
            return {
                loading: true,
                // 表格
                clueEmailColumns: [
                    {
                        title: this.$t('clue.newDetail.col_seqNumber'),
                        key: 'seqNumber',
                        width: 160
                    },
                    {
                        title: this.$t('crm.Modal.contact_nickName'),
                        key: 'a1009',
                        width: 120
                    },
                    {
                        title: this.$t('crm.Modal.contact_email'),
                        key: 'a10010',
                        width: 200
                    },
                    {
                        title: this.$t('crm.Modal.managers'),
                        key: 'saleName',
                        width: 100,
                        formatter: row => {
                            return row.saleName || this.$t('crm.Modal.highseasInquiry');
                        }
                    },
                    {
                        title: this.$t('crm.Modal.createTime'),
                        key: 'createTime',
                        width: 180,
                        formatter: row => {
                            return `${this.$options.filters.timeFormat(row.createTime)}\n${this.$options.filters.timeFormat(row.createTime, 'Time')}`;
                        }
                    }
                ],
                contactEmailColumns: [
                    {
                        title: this.$t('crm.Modal.corp_companyName'),
                        key: 'companyName',
                        width: 160
                    },
                    {
                        title: this.$t('crm.Modal.contact_nickName'),
                        key: 'mainContactsName',
                        width: 120
                    },
                    {
                        title: this.$t('crm.Modal.contact_email'),
                        key: 'email',
                        width: 200
                    },
                    {
                        title: this.$t('crm.Modal.managers'),
                        key: 'userName',
                        width: 100,
                        formatter: row => {
                            return row.userName || this.$t('crm.Modal.highseasInquiry');
                        }
                    },
                    {
                        title: this.$t('crm.Modal.createTime'),
                        key: 'createTime',
                        width: 180,
                        formatter: row => {
                            return `${this.$options.filters.timeFormat(row.createTime)}\n${this.$options.filters.timeFormat(row.createTime, 'Time')}`;
                        }
                    }
                ],
                cluePhoneColumns: [
                    {
                        title: this.$t('clue.newDetail.col_seqNumber'),
                        key: 'seqNumber',
                        width: 160
                    },
                    {
                        title: this.$t('crm.Modal.contact_nickName'),
                        key: 'a1009',
                        width: 120
                    },
                    {
                        title: this.$t('crm.Modal.contact_phone'),
                        key: 'a10012',
                        width: 200
                    },
                    {
                        title: this.$t('crm.Modal.managers'),
                        key: 'saleName',
                        width: 100,
                        formatter: row => {
                            return row.saleName || this.$t('crm.Modal.highseasInquiry');
                        }
                    },
                    {
                        title: this.$t('crm.Modal.createTime'),
                        key: 'createTime',
                        width: 180,
                        formatter: row => {
                            return `${this.$options.filters.timeFormat(row.createTime)}\n${this.$options.filters.timeFormat(row.createTime, 'Time')}`;
                        }
                    }
                ],
                contactPhoneColumns: [
                    {
                        title: this.$t('crm.Modal.corp_companyName'),
                        key: 'companyName',
                        width: 160
                    },
                    {
                        title: this.$t('crm.Modal.contact_nickName'),
                        key: 'mainContactsName',
                        width: 120
                    },
                    {
                        title: this.$t('crm.Modal.contact_phone'),
                        key: 'phone',
                        width: 200
                    },
                    {
                        title: this.$t('crm.Modal.managers'),
                        key: 'userName',
                        width: 100,
                        formatter: row => {
                            return row.userName || this.$t('crm.Modal.highseasInquiry');
                        }
                    },
                    {
                        title: this.$t('crm.Modal.createTime'),
                        key: 'createTime',
                        width: 180,
                        formatter: row => {
                            return `${this.$options.filters.timeFormat(row.createTime)}\n${this.$options.filters.timeFormat(row.createTime, 'Time')}`;
                        }
                    }
                ],
                clueWAColumns: [
                    {
                        title: this.$t('clue.newDetail.col_seqNumber'),
                        key: 'seqNumber',
                        width: 160
                    },
                    {
                        title: this.$t('crm.Modal.contact_nickName'),
                        key: 'a1009',
                        width: 120
                    },
                    {
                        title: this.$t('crm.Modal.contact_whatsApp'),
                        key: 'a10052',
                        width: 200
                    },
                    {
                        title: this.$t('crm.Modal.managers'),
                        key: 'saleName',
                        width: 100,
                        formatter: row => {
                            return row.saleName || this.$t('crm.Modal.highseasInquiry');
                        }
                    },
                    {
                        title: this.$t('crm.Modal.createTime'),
                        key: 'createTime',
                        width: 180,
                        formatter: row => {
                            return `${this.$options.filters.timeFormat(row.createTime)}\n${this.$options.filters.timeFormat(row.createTime, 'Time')}`;
                        }
                    }
                ],
                contactWAColumns: [
                    {
                        title: this.$t('crm.Modal.corp_companyName'),
                        key: 'companyName',
                        width: 160
                    },
                    {
                        title: this.$t('crm.Modal.contact_nickName'),
                        key: 'mainContactsName',
                        width: 120
                    },
                    {
                        title: this.$t('crm.Modal.contact_whatsApp'),
                        key: 'whatsapp',
                        width: 200
                    },
                    {
                        title: this.$t('crm.Modal.managers'),
                        key: 'userName',
                        width: 100,
                        formatter: row => {
                            return row.userName || this.$t('crm.Modal.highseasInquiry');
                        }
                    },
                    {
                        title: this.$t('crm.Modal.createTime'),
                        key: 'createTime',
                        width: 180,
                        formatter: row => {
                            return `${this.$options.filters.timeFormat(row.createTime)}\n${this.$options.filters.timeFormat(row.createTime, 'Time')}`;
                        }
                    }
                ],
                // 表格数据
                clueEmailData: [],
                contactEmailData: [],
                cluePhoneData: [],
                contactPhoneData: [],
                clueWAData: [],
                contactWAData: []
            };
        },
        mounted() {

        },
        methods: {
            // 数据处理
            handleData() {
                if (this.repeatData.clueEmail) {
                    this.clueEmailData = this.repeatData.clueEmail;
                }
                if (this.repeatData.contactEmail) {
                    this.contactEmailData = this.repeatData.contactEmail;
                }
                if (this.repeatData.cluePhone) {
                    this.cluePhoneData = this.repeatData.cluePhone;
                }
                if (this.repeatData.contactPhone) {
                    this.contactPhoneData = this.repeatData.contactPhone;
                }
                if (this.repeatData.clueWA) {
                    this.clueWAData = this.repeatData.clueWA;
                }
                if (this.repeatData.contactWA) {
                    this.contactWAData = this.repeatData.contactWA;
                }
                this.loading = false;
            },
            // 复制表格内容
            copy_content(row, column, cell) {
                const content = cell.innerText;
                if (content) {
                    this.$refs.copy_element.value = content;
                    this.$refs.copy_element.select();
                    if (document.execCommand('Copy')) {
                        this.$Message.success(this.$t('crm.Modal.success_copy'));
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_copy'));
                    }
                }
            },
            // 弹出线索详情
            async viewClue(clueId) {
                // 校验是否有线索目录权限
                if (!this.isContainsMenu('my_clue')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noMenuAuthority'));
                    return;
                }
                // 关联来的 可能没有线索id
                if (!clueId) {
                    this.$Message.warning(this.$t('crm.Modal.error_noneUserInfo'));
                    return;
                }
                // 校验是否有该条线索管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Clue',
                    id: clueId
                });
                if (!authorized) return;
                if (authorized === 'highseas') {
                    if (!this.isContainsMenu('common_sea_customer')) {
                        this.$Message.warning(this.$t('crm.Modal.error_JumpClueInHighseas1'));
                        // return;
                    } else {
                        localStorage.setItem('leadsCloud-clueId', clueId);
                        window.open(this.$rootRouter.resolve({
                            name: 'common_sea_customer'
                        }).href, '_blank');
                    }
                } else {
                    // 校验通过, 新标签页打开线索详情
                    localStorage.setItem('leadsCloud-clueId', clueId);
                    window.open(this.$rootRouter.resolve({
                        name: 'my_clue'
                    }).href, '_blank');
                }
            },
            // 跳转到客户详情页
            async viewCompany(companyId) {
                // 判断是否有"我的客户"页面权限
                if (!this.isContainsMenu('myCustomer')) {
                    // 没有"我的客户"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                    return;
                }

                // 查询该公司 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Customer',
                    id: companyId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 公海客户, 检查是否有"公海客户"页面权限
                if (authorized === 'highseas') {
                    // 判断是否有"公海客户"页面权限
                    if (!this.isContainsMenu('highseasCustomer')) {
                        // 没有"公海客户"页面权限, 弹出提示
                        this.$Message.warning(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                        return false;
                    }
                }

                // 否则直接新窗口打开新客户详情页
                this.$viewCustomer(companyId);
            },
            /* 底部 */
            // 关闭弹窗
            cancel() {
                this.$emit('cancelEnter');
            },
            okEnter() {
                this.$emit('okEnter');
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.handleData();
                    }
                },
                immediate: true
            }
        }
    };
</script>
<style scoped>
    .repeat-tip{
        margin-top: 20px;
    }
</style>
