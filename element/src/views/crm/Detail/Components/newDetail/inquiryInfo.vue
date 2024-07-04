<template>
    <div>
        <!-- 顶部 -->
        <div class="inquiry-info-container">
            <!-- 图标 -->
            <Icon custom="custom custom-inquiry-sec"
                  size="22"
                  color="#FF752A"
                  :title="$t('crm.newDetail.title_viewInquiry')"
                  @click="viewInquiry"
                  class="inquiry-info-icon piwik_companyDetail_jumpInquiry"></Icon>

            <!-- 仅有一个询盘, 直接显示询盘编号 -->
            <div v-if="inquiryList.length === 1">
                <!-- 询盘编号 -->
                <span :class="{'margin-right-10': current_inquiry.isMainInquiry !== 1}"
                      class="inquiry-info-item-seqNumber">{{ current_inquiry.seqNumber }}</span>
                <!-- 主询盘标识 -->
                <Tooltip :content="$t('crm.newDetail.mainInquiry')" placement="top" v-if="current_inquiry.isMainInquiry === 1">
                    <Icon
                        custom="custom custom-main-contact"
                        size="16"
                        color="#F5A623"
                        class="inquiry-info-item-seqNumber-mainInquiry"></Icon>
                </Tooltip>
                <!--重点标记询盘 -->
                <Tooltip :content="$t('crm.newDetail.title_signInquiry')" placement="top">
                    <Icon v-if="!isHighSeas"
                        custom="custom-crm-mark"
                        :title="$t('crm.newDetail.title_signInquiry')"
                        @click.stop="remarkFun"
                        size="12"
                        style="position:relative;top:2px"
                        class="piwik_mark_inquiry cursor-pointer"
                        :color="detailInfo.inquiryMarker === 1 ? '#FBBC04' : '#7B98B6'"></Icon>
                </Tooltip>
            </div>
            <!-- 询盘切换 + 编号显示 -->
            <Dropdown v-else
                      placement="bottom-start"
                      trigger="click"
                      @command="setInquiryId"
                      class="inquiry-info-inq-drop">
                <!-- 当前选中项 + 下拉图标 -->
                <div>
                    <!-- 询盘编号 -->
                    <span :class="{'margin-right-10': current_inquiry.isMainInquiry !== 1}"
                          class="inquiry-info-item-seqNumber">{{ current_inquiry.seqNumber }}</span>
                    <!-- 主询盘标识 -->
                    <Tooltip :content="$t('crm.newDetail.mainInquiry')" placement="bottom" v-if="current_inquiry.isMainInquiry === 1">
                        <Icon
                            custom="custom custom-main-contact"
                            size="16"
                            color="#F5A623"
                            class="inquiry-info-item-seqNumber-mainInquiry"></Icon>
                    </Tooltip>
                    <!--重点标记询盘 -->
                    <Tooltip :content="$t('crm.newDetail.title_signInquiry')">
                        <Icon v-if="!isHighSeas"
                            custom="custom-crm-mark"
                            @click.stop="remarkFun"
                            size="14"
                            class="piwik_mark_inquiry cursor-pointer inquiry-info-item-seqNumber-mainInquiry"
                            :color="detailInfo.inquiryMarker === 1 ? '#FBBC04' : '#7B98B6'"></Icon>
                    </Tooltip>
                    <!-- 下拉箭头 -->
                    <Icon custom="custom custom-menu-arrow"
                          class="inquiry-info-item-seqNumber-arrow"></Icon>
                </div>

                <!-- 选项 -->
                <DropdownMenu slot="dropdown"
                              class="inquiry-info-inq-drop-menu">
                    <DropdownItem v-for="item in inquiryList"
                                  :key="item.id"
                                  :command="item.id"
                                  class="piwik_companyDetail_toggleInquiry"
                                  :class="{'active-inquiry-item': `${item.id}` === `${inquiryId}`}">
                        <!-- 询盘编号 -->
                        <span>{{ item.seqNumber }}</span>
                        <!-- 主询盘标识 -->
                        <Tooltip content="主询盘" placement="bottom">
                            <Icon v-if="item.isMainInquiry === 1"
                                custom="custom custom-main-contact"
                                size="16"
                                color="#F5A623"
                                style="display: inline-block;margin: 0 4px;vertical-align: baseline;"></Icon>
                        </Tooltip>      
                        <!-- 产品分类 -->
                         <span> {{ $options.filters.parseArray(item.productCategory).length ? $options.filters.parseArray(item.productCategory).join(', ') : '-' }}</span>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>

            <!-- 询盘操作 -->
            <div class="inquiry-info-operate">
                <!-- 设为主要商机 -->
                <!--<Button type="text"-->
                <!--        icon="custom custom-crm-log"-->
                <!--        @click="setMainInquiry">设为主要商机</Button>-->

                <!-- 编辑询盘 custom-field-edit-->
                <Button v-if="authorized_button['editInquiry']"
                        size="small"
                        type="success"
                        @click="editInquiry">{{$t('crm.newDetail.title_editCustomer')}}</Button>

                <!-- 新增联系人 custom-new-contact-->
                <Button v-if="authorized_button['newContact']"
                        size="small"
                        type="minor"
                        @click="newContact">{{$t('crm.newDetail.addContact')}}</Button>

                <!-- 添加标签 custom-label-->
                <Button v-if="authorized_button['addInquiryLabel']"
                        size="small"
                        type="minor"
                        @click="addInquiryLabel">{{$t('crm.newDetail.addLabels')}}</Button>

                <!-- 查看日志custom-crm-log -->
                <Button size="small"
                        type="minor"
                        @click="viewInquiryLog">{{$t('crm.newDetail.inquiryLog')}}</Button>
            </div>
        </div>

        <!-- 询盘简略信息 -->
        <Row type="flex"
             justify="space-between" class="inquiry-info-item-container">
             <Col :span="22">
            <!-- 产品分类 -->
            <Col :span="6">
                <TooltipAuto :content="$t('crm.newDetail.col_productCategory')"
                             class="inquiry-info-item-title"></TooltipAuto>
                <TooltipAuto style="font-size: 14px" :content="$options.filters.parseArray(detailInfo.productCategory).length ? $options.filters.parseArray(detailInfo.productCategory).join(', ') : '-'"></TooltipAuto>
            </Col>
            <!-- 询盘等级 -->
            <Col :span="6">
                <TooltipAuto :content="$t('crm.newDetail.col_grouping')"
                             class="inquiry-info-item-title"></TooltipAuto>
                <TooltipAuto style="font-size: 14px" :content="detailInfo.grouping?detailInfo.grouping:'-'"></TooltipAuto>
            </Col>
            <!-- 询盘评分 -->
            <Col :span="6">
                <TooltipAuto :content="$t('crm.newDetail.col_inquiryScore')"
                             class="inquiry-info-item-title"></TooltipAuto>
                <TooltipAuto style="font-size: 14px" :content="`${Number.isInteger(detailInfo.inquiryScore) ? detailInfo.inquiryScore : '-'}`"></TooltipAuto>
            </Col>
            <!-- 来源渠道 -->
            <Col :span="6">
                <TooltipAuto :content="$t('crm.Table.col_sourceWay')"
                             class="inquiry-info-item-title"></TooltipAuto>
                <TooltipAuto style="font-size: 14px" :content="detailInfo.sourceWay?detailInfo.sourceWay:'-'"></TooltipAuto>
            </Col>
            </Col>
            <Col :span="2" style="text-align: right;">
                <!-- 查看更多信息 -->
                <span @click="visible_detailInfo = true"
                    class="inquiry-info-viewMore piwik_companyDetail_viewInquiryDetail">{{ $t('crm.newDetail.viewMore') }}</span>
            </Col>
        </Row>


        <!-- 跟进状态 -->
        <FollowUpStatus v-if="show_edit_followup_status"
                        :flag_update_detail.sync="flag_update_detail"
                        :inquiry_detail.sync="detailInfo"
                        :disabled="disabled_edit_followup_status"
                        :singleRow="true"></FollowUpStatus>

        <!-- 模态框部分 -->
        <!-- 编辑询盘 -->
        <EditInquiry :visible.sync="visible_edit_inquiry"
                     :inquiryId="inquiryId"
                     :inquiry_columns_authorized="inquiry_columns_authorized"
                     :flag_update_detail.sync="flag_update_detail"
                     @refreshCheck="getInquiryList"></EditInquiry>

        <!-- 新增联系人 -->
        <NewContact :visible.sync="visible_new_contact"
                    :inquiryId="inquiryId"
                    :saleId="detailInfo.userIdsShow"
                    :companyName="detailInfo.companyName"
                    :companyId="detailInfo.companyId"
                    :clueId="detailInfo.clueId"
                    :flag_update_contact.sync="flag_update_contact"></NewContact>

        <!-- 添加标签 -->
        <AddInquiryLabel :inquiryId="inquiryId"
                         :visible.sync="visible_add_inquiry_label"
                         :flag_update_detail.sync="flag_update_detail"
                        ></AddInquiryLabel>

        <!-- 查看询盘操作日志 -->
        <ViewInquiryLog :visible.sync="visible_view_inquiry_log"
                        :inquiryId="inquiryId"></ViewInquiryLog>

        <!-- 询盘详细信息 -->
        <Modal :visible="visible_detailInfo"
               :title="$t('crm.newDetail.inquiryDetailInfo')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :append-to-body="true"
               width="56%"
               class="modal inquiryInfo-detailInfo-modal">
            <!-- 详细信息 -->
            <DetailInfo v-if="visible_detailInfo"
                        type="inquiry"
                        :id="inquiryId"
                        :columns_authorized="inquiry_columns_authorized"
                        :flag_update_detail="flag_update_detail"
                        ></DetailInfo>

            <!-- 底部按钮 -->
            <div slot="footer">
                <Button @click="visible_detailInfo = false">{{ $t('crm.Modal.modal_close') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import EditInquiry from '@/views/crm/Detail/Components/Modal/editInquiry';
    import NewContact from '@/views/crm/Detail/Components/Modal/newContact';
    import AddInquiryLabel from '@/views/crm/Detail/Components/Modal/addInquiryLabel';
    import ViewInquiryLog from '@/views/crm/Detail/Components/Modal/viewInquiryLog';
    import DetailInfo from '@/views/crm/Detail/Components/Html/detailInfo';
    import FollowUpStatus from '@/views/crm/Detail/Components/Html/followUpStatus';
    import { crmCommon, crmInquiry } from '@/api/crm/index';

    export default {
        name: 'inquiryInfo',
        components: {
            EditInquiry,
            NewContact,
            AddInquiryLabel,
            ViewInquiryLog,
            DetailInfo,
            FollowUpStatus
        },
        props: [
            'companyId',
            'isHighSeas',
            'inquiryId',
            'inquiryDetail',
            'inquiry_columns_authorized',
            'flag_update_inquiry_list',
            'flag_update_inquiry_detail'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                button_list: state => state.app.button_list,
                selectOptions: state => state.crm.selectOptions
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            authorized_button() {
                if (this.isHighSeas) {
                    return {
                    };
                }

                const ids = BUTTON_IDS.CRM.inquiry;
                return {
                    editInquiry: !HANDLE_BUTTON(ids.edit.editInquiry, this.button_list),
                    newContact: !HANDLE_BUTTON(ids.edit.newContact, this.button_list),
                    addInquiryLabel: !HANDLE_BUTTON(ids.edit.label, this.button_list)
                };
            },
            show_edit_followup_status() {
                return Array.isArray(this.inquiry_columns_authorized.default) && this.inquiry_columns_authorized.default.find(item => item.storageName === 'followUp');
            },
            disabled_edit_followup_status() {
                // 从询盘简略信息得知"该询盘的成交信息从平台导入", 直接返回 true
                if (['1', '2'].includes(`${this.detailInfo.sysCreateFlag}`)) {
                    return true;
                }

                // 检查编辑权限和字段权限
                const able_editInquiry = this.authorized_button.editInquiry;
                let able_field_followupStatus = false;
                if (Array.isArray(this.inquiry_columns_authorized.default)) {
                    const temp = this.inquiry_columns_authorized.default.filter(item => item.storageName === 'followUp');
                    if (temp[0] && `${temp[0].isOnlyRead}` !== '1') {
                        able_field_followupStatus = true;
                    }
                }
                return !(able_editInquiry && able_field_followupStatus);
            },
            current_inquiry() {
                return this.inquiryList.find(item => `${item.id}` === `${this.inquiryId}`) || {};
            }
        },
        data() {
            return {
                /* 全局 */
                // loading
                loading: true,

                /* 询盘信息 */
                inquiryList: [],
                detailInfo: {},

                // 编辑需求备注
                remark: '',

                // 编辑后 flag 变更触发页面刷新
                flag_update_detail: false,
                flag_update_contact: false,

                /* 模态框部分 */
                visible_edit_inquiry: false,
                visible_new_contact: false,
                visible_add_inquiry_label: false,
                visible_view_inquiry_log: false,
                visible_detailInfo: false
            };
        },
        methods: {
            // 获取客户下所有询盘
            getInquiryList() {
                this.loading = true;
                this.inquiryList = [];
                crmCommon.getInquiryListByCompany({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    companyId: this.companyId,
                    pageNo: 1,
                    listType: this.isHighSeas ? 0 : 1
                }).then(response => {
                    if (response.code === '1') {
                        this.inquiryList = (response.data && Array.isArray(response.data.list)) ? response.data.list.sort((a, b) => b.createTime - a.createTime) : [];
                        // 如果当前已选中询盘 id + 询盘列表中还能找到此询盘, 则退出流程
                        if (this.inquiryId && this.inquiryList.find(item => `${item.id}` === `${this.inquiryId}`)) {
                            this.loading = false;
                            return;
                        }
                        // 否则选中主要商机 || 首个商机
                        const mainInquiry = this.inquiryList.find(item => item.isMainInquiry === 1);
                        if (mainInquiry) {
                            this.setInquiryId(mainInquiry.id);
                        } else if (this.inquiryList[0]) {
                            this.setInquiryId(this.inquiryList[0].id);
                        } else {
                            this.$Message.error(this.$t('crm.Table.error_getInquiryTableData'));
                            this.loading = false;
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getInquiryTableData'));
                        this.loading = false;
                    }
                }).catch(error => {
                    console.error(error);
                    this.$Message.error(this.$t('crm.Table.error_getInquiryTableData'));
                    this.loading = false;
                });
            },
            // 获取询盘详细信息
            getInquiryDetail() {
                this.loading = true;
                this.$emit('update:inquiryDetail', {});
                crmInquiry.getInquiry({
                    id: this.inquiryId
                }).then(async response => {
                    if (response.code === '1') {
                        this.detailInfo = response.data;
                        // 跟进状态
                        let str = '';
                        if (/\d+/.test(`${this.detailInfo.followUpId}`)) {
                            if (`${this.detailInfo.followUpId}` === '-1') {
                                str = this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry');
                            }
                            const temp = this.selectOptions.followUp ? this.selectOptions.followUp.find(item => `${item.attrId}` === `${this.detailInfo.followUpId}`) : undefined;
                            str = temp ? temp.attrName : str;
                        } else {
                            str = this.detailInfo.followUp || '';
                        }
                        this.detailInfo.followUp = str;
                        this.$emit('update:inquiryDetail', this.detailInfo);
                    } else {
                        this.detailInfo = {};
                        this.$Message.error(this.$t('crm.Detail.error_getInquiryInfo'));
                    }
                    this.loading = false;
                }, error => {
                    this.detailInfo = {};
                    this.loading = false;
                }).catch(error => {
                    this.detailInfo = {};
                    this.loading = false;
                });
            },
            // 选中询盘后更新 prop inquiryId
            setInquiryId(id) {
                this.$emit('update:inquiryId', id);
            },
            async viewInquiry() {
                const id = this.inquiryId;
                // 判断是否有"我的询盘"页面权限
                if (!this.isContainsMenu('myInquiry')) {
                    // 没有"我的询盘"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyInquiry'));
                    return;
                }

                // 无 inquiryId , 退出流程
                if (!id) {
                    this.$Message.error(this.$t('crm.Modal.error_inquiryId'));
                    return;
                }

                // 查询该公司 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Inquiry',
                    id
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海客户
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryInHighseas'));
                    return;
                }

                // 新窗口跳转到询盘页面
                localStorage.setItem('leadsCloud-inquiryId', id);
                window.open(this.$router.resolve({
                    name: 'myInquiry'
                }).href, '_blank');
            },
            /* 模态框部分 */
            // setMainInquiry() {},
            // 标记
            remarkFun() {
                let flag = 1;
                if (this.detailInfo.inquiryMarker === 1) {
                    flag = 2;
                }
                crmInquiry.updateMarker({
                    id: this.inquiryId,
                    inquiryMarker: flag
                }).then(response => {
                    if (response.code === '1') {
                        this.detailInfo.inquiryMarker = flag;
                        if (flag === 1) {
                            this.$Message.success(this.$t('crm.Detail.success_addMarker'));
                        } else {
                            this.$Message.success(this.$t('crm.Detail.success_removeMarker'));
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_addMarker'));
                    }
                });
            },
            // 编辑询盘
            editInquiry() {
                this.visible_edit_inquiry = true;
            },
            // 新增联系人
            newContact() {
                this.visible_new_contact = true;
            },
            // 标签
            addInquiryLabel() {
                this.visible_add_inquiry_label = true;
            },
            // 查看询盘日志
            viewInquiryLog() {
                this.visible_view_inquiry_log = true;
            }
        },
        watch: {
            companyId: {
                handler(val) {
                    if (val) {
                        this.getInquiryList();
                    }
                },
                immediate: true
            },
            inquiryId: {
                handler(val) {
                    if (val) {
                        this.getInquiryDetail();
                    }
                },
                immediate: true
            },
            flag_update_detail: {
                handler() {
                    if (this.inquiryId) {
                        this.getInquiryDetail();
                    }
                }
            },
            // 左侧编辑资料之后需要更新一下中间询盘的信息
            flag_update_inquiry_detail: {
                handler() {
                    if (this.inquiryId) {
                        this.getInquiryDetail();
                    }
                }
            },
            flag_update_contact: {
                handler() {
                    this.$emit('update:flag_update_contact_list', !this.flag_update_contact_list);
                }
            },
            flag_update_inquiry_list: {
                handler(val) {
                    this.getInquiryList();
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .inquiry-info {
        &-container {
            position: relative;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            overflow: hidden;
            height: 28px;
        }

        &-icon {
            cursor: pointer;
            margin-right: 10px
        }

        &-inq-drop {
            overflow: hidden;
            text-overflow: ellipsis;
            position: relative;

            >div:first-child {
                margin-right: 20px;
                cursor: pointer;
                margin-top: -2px;
            }

            .el-icon-arrow-down {
                position: absolute;
                right: 0;
                top: 5px;
            }
        }

        &-operate {
            flex: 1;
            min-width: 80px;
            text-align: right;
            button{
                color: #333;
                // border: 1px solid #677F99;
                padding: 0px 10px;
                font-size: 12px;
                line-height: 22px;
                height: 28px;
                &.el-button--success{
                    color: #fff;
                }
                // &:hover {
                //     color: #fff;
                //     background: #7B98B6;
                //     border: 1px solid #7B98B6;
                // }
            }
            /deep/ .custom {
                color: #677f99;
                &:hover {
                    color: #4285f4;
                }
            }
        }

        &-item {
            &-seqNumber {
                font-size: 16px;
                font-weight: 500;
                color: rgba(0,0,0,0.80);
                line-height: 24px;
                white-space: nowrap;
                vertical-align: sub;

                &-mainInquiry {
                    vertical-align: sub;
                    display: inline-block;
                    margin: 0 8px 0 4px;
                }

                &-arrow {
                    vertical-align: sub;
                    font-size: 10px;
                    color: #7B98B6;
                    margin-left: 8px;
                }
            }

            &-container {
                margin-bottom: 16px;
                font-size: 12px;
                line-height: 18px;
                color: rgba(0,0,0,0.80);
            }

            &-title {
                margin-bottom: 8px;
                color: rgba(0,0,0,0.60);
            }
        }

        &-viewMore {
            display: inline-block;
            font-size: 12px;
            line-height: 18px;
            cursor: pointer;
            color: #3B78DE;
            // margin-top: 8px;
        }
    }
</style>

<style lang="less">
    .inquiry-info-inq-drop-menu {
        max-width: 50%;
        max-height: 50%;
        overflow: auto;

        .active-inquiry-item {
            background-color: #fff3ec;
            color: #fb9b67;
        }
    }

    .inquiryInfo-detailInfo-modal {
        .el-dialog__header {
            padding-left: 30px;
            padding-right: 30px;
        }

        .el-dialog__body {
            padding-left: 14px;
            padding-right: 14px;
        }
    }
</style>
