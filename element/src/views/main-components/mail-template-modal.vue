<template>
    <!-- 插入模板 -->
    <Modal
        :visible="visible"
        :append-to-body="true"
        :close-on-click-modal="false"
        width="993px"
        @close="addTemplateClose"
        class="add_template_modal"
        :title="$t('mailSetting.emailTemplate.addTemplate')">

        <div class="container" v-loading="loading">
            <Tabs v-model="typeId" class="add_template_tabs" @tab-click="handleChange">
                <TabPane name="0">
                    <span slot="label">{{ $t('mailSetting.emailTemplate.personal') }}</span>
                </TabPane>
                <TabPane name="1">
                    <span slot="label">{{ $t('mailSetting.emailTemplate.company') }}</span>
                </TabPane>
                <TabPane name="2">
                    <span slot="label">{{ $t('mailSetting.emailTemplate.system') }}</span>
                </TabPane>
            </Tabs>

            <div class="template_content">
                <div class="content_header">
                    <div>
                        <!-- 分类筛选 -->
                        <Select v-model="templateClassificationId" @change="getFirstPage('select')"
                            style="width: 198px;margin-right: 20px;"
                            filterable
                            clearable
                            :placeholder="$t('mailSetting.emailTemplate.tip_select')">
                            <Option value="0" :label="$t('mailSetting.emailTemplate.uncategorized')"></Option>
                            <Option v-for="item in classificationList"
                                    :key="item.id"
                                    :value="`${item.id}`"
                                    :label="item.classificationName"></Option>
                        </Select>
                        <!-- 搜索 -->
                        <Input v-model="templateName"
                                style="width: 198px;"
                                @keyup.enter.native="getFirstPage('search')"
                                @change="controlTooltip"
                                :placeholder="$t('mailSetting.emailTemplate.actNameTip')">
                            <Icon style="cursor:pointer;margin-top:8px;" slot="suffix" custom="custom custom-journey-search" size="14" @click="getFirstPage('search')">
                            </Icon>
                        </Input>
                    </div>
                    <div v-if="(typeId === '1' && isContainsMenu('company_mail_magage')) || (typeId === '0' && isContainsMenu('mail_set'))">
                        <Tooltip placement="top" :open-delay="500" :content="$t('mailSetting.emailTemplate.setTemplate')" >
                            <span>
                                <Icon style="cursor:pointer;color:#666;"
                                    slot="suffix"
                                    @click="jumpSet"
                                    custom="custom-table-edit-columns"
                                    size="18">
                                </Icon>
                            </span>
                        </Tooltip>
                    </div>
                </div>
                <!-- 邮件列表内容 -->
                <ul class="template_list" v-if="list.length" :style="`height:${window_height - 400}px;`">
                    <li class="template_item" v-for="(item, index) in list" :key="index" @click="selectedTemplateid = item.id">
                        <div class="content">
                            <img :src="item.contentImgUrl" alt="">
                        </div>
                        <div class="title">
                            <Radio v-model="selectedTemplateid" :label="item.id">{{item.templateName}}</Radio>
                        </div>
                    </li>
                </ul>
                <div v-else class="template_list" :style="`height:${window_height - 400}px;`">
                    <!-- 初始显示的搜索图片 -->
                    <div class="noDataBox">
                        <img src="@/svg/no-data.svg" alt="">
                        <p class="text-center">{{ $t('mail.customerBox.noData') }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div slot="footer" class="footer">
            <Page
                :total="total"
                :current-page.sync="currentPageNum"
                :page-sizes="[20, 50, 100]"
                :page-size="pageSize"
                class="pageWrap-right"
                layout="total, prev, pager, next, sizes, jumper"
                @current-change="handleCurrentChange"
                @size-change="handleSizeChange"
                transfer>
            </Page>
            <div>
                <Button @click="addTemplateClose">{{ $t('cancel') }}</Button>
                <Button type="primary" :disabled="!selectedTemplateid" @click="getTemplateData('append')">{{ $t('mailSetting.emailTemplate.appendInsert')}}</Button>
                <Button type="primary" :disabled="!selectedTemplateid" @click="getTemplateData('override')">{{ $t('mailSetting.emailTemplate.overrideInsert') }}</Button>
            </div>
        </div>
    </Modal>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import { findPageList, findAll, getById } from '@/api/mail/mailSet.js';

    export default {
        name: 'mailDetail',
        mixins: [],
        props: [
            'visible'
        ],
        computed: {
            ...mapState({
                qiniuUrl: 'qiniuUrl',
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height'
            }),
            ...mapGetters([
                'isContainsMenu'
            ])
        },
        data() {
            return {
                typeId: '0',
                templateClassificationId: '',
                loading: false,
                cancelFunc: null,
                currentPageNum: 1,
                pageSize: 20,
                total: 0,
                list: [],
                classificationList: [],
                templateName: '',
                selectedTemplateid: ''
            };
        },
        methods: {
            handleChange() {
                this.currentPageNum = 1;
                this.pageSize = 20;
                this.templateName = '';
                this.templateClassificationId = '';
                this.selectedTemplateid = '';
                this.getTemplateList();
                this.getClassificationList();
            },
            getFirstPage(type) {
                if (type === 'select') {
                    this.templateName = '';
                }
                this.currentPageNum = 1;
                this.pageSize = 20;
                this.getTemplateList();
            },
            addTemplateClose() {
                this.$emit('update:visible', false);
            },
            // 切换页码
            handleCurrentChange(val) {
                this.currentPageNum = val;
                this.getTemplateList();
            },
            // 切换每页条数
            handleSizeChange(val) {
                this.pageSize = val;
                this.getTemplateList();
            },
            getTemplateList() {
                this.loading = true;
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                const vm = this;
                const cancelToken = new this.$util.axios.CancelToken(function executor(c) {
                    // An executor function receives a cancel function as a parameter
                    vm.cancelFunc = c;
                });
                findPageList({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    templateClassificationId: this.templateClassificationId,
                    type: this.typeId,
                    page: this.currentPageNum,
                    size: this.pageSize,
                    templateName: this.templateName
                }, cancelToken).then(data => {
                    if (data.code === 1 && data.data) {
                        if (data.data.content.length === 0 && this.currentPageNum > 1) {
                            this.currentPageNum--;
                            this.getTemplateList();
                            return;
                        }
                        this.list = data.data.content;
                        this.total = data.data.totalElements;
                        this.sortBy = `${data.data.orderColumn}-${data.data.orderType}`;
                    } else {
                        this.list = [];
                        this.total = 0;
                        // this.$Message.error('列表请求失败');
                    }
                    this.loading = false;
                });
            },
            getClassificationList() {
                // 请求表格数据
                findAll({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    type: this.typeId
                }).then(data => {
                    if (data.code === 1 && data.data) {
                        this.classificationList = data.data;
                    } else {
                        this.$Message.error('列表请求失败');
                    }
                }).catch(error => {
                    console.error(error);
                    this.$Message.error('列表请求失败');
                });
            },
            getTemplateData(type) {
                getById({
                    id: this.selectedTemplateid
                }).then(res => {
                    if (res.code === 1) {
                        const data = res.data;
                        data.templateTitle = data.templateTitle || '';
                        if (data.attachmentList && data.attachmentList.length) {
                            data.attachmentList.forEach(item => {
                                const hash = item.filePath.split(`//${this.qiniuUrl}/`)[1];
                                item.size = this.toSize(item.fileSize);
                                item.response = {
                                    hash: hash,
                                    key: hash
                                };
                            });
                        }
                        data.handleType = type;
                        this.$emit('handleTemplate', data);
                        this.addTemplateClose();
                    } else {
                        this.$Message.error('获取模板数据失败');
                    }
                });
            },
            // 将文件大小转换为字节
            toSize(size) {
                let result = 0;
                if (!size) {
                    return result;
                } else {
                    if (size.indexOf('KB') !== -1) {
                        result = Number(size.slice(0, size.indexOf('KB'))) * 1024;
                    } else if (size.indexOf('MB') !== -1) {
                        result = Number(size.slice(0, size.indexOf('MB'))) * 1024 * 1024;
                    } else if (size.indexOf('GB') !== -1) {
                        result = Number(size.slice(0, size.indexOf('GB'))) * 1024 * 1024 * 1024;
                    } else {
                        result = Number(size.slice(0, size.indexOf('Byte(s)')));
                    }
                }
                return result;
            },
            // 跳转至邮件模板的设置页面
            jumpSet() {
                if (this.typeId === '0') {
                    localStorage.setItem('updateAccountToQuickText', 'EmailTemplate');
                    window.open(this.$router.resolve('/systemSettings/mail_set').href, '_blank');
                } else if (this.typeId === '1') {
                    window.open(this.$router.resolve('/systemSettings/company_mail_magage').href, '_blank');
                }
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.handleChange();
                }
            }
        }
    };
</script>

<style lang="less">
    // 插入模板
    .add_template_modal{
        .el-dialog{
            margin-top: 100px!important;
        }
        .el-dialog__header{
            padding: 20px 24px 10px;
        }
        .el-dialog__body{
            padding: 0 24px 20px;
        }
        .el-dialog__footer{
            padding: 0 24px 20px;
            .footer{
                display: flex;
                justify-content: space-between;
                .pageWrap-right{
                    margin: 0;
                }
            }
            .el-button--primary.is-disabled, .el-button--primary.is-disabled:hover, .el-button--primary.is-disabled:focus, .el-button--primary.is-disabled:active {
                background: #e7ecf2;
                border-color: #e7ecf2;
                color:rgba(110,129,154,.4);
            }
        }
        .container{
            .template_content{
                .content_header{
                    margin-bottom: 12px;
                    display: flex;
                    justify-content: space-between;
                }
                .template_list{
                    display: flex;
                    flex-wrap: wrap;
                    align-content: flex-start;
                    overflow-y: auto;
                    .noDataBox {
                        width: 100%;
                        overflow: hidden;
                        img {
                            display: block;
                            margin: 160px auto 0;
                            width: 408px;
                            height: 129px;
                        }
                    }
                    .template_item {
                        margin: 10px  12px 20px;
                        width: 130px;
                        height: 184px;
                        background: #F5F6F9;
                        cursor: pointer;
                        .content {
                            position: relative;
                            height: 150px;
                            overflow: hidden;
                            background: #fff;
                            border: #fff solid 1px;
                            img{
                                margin:0;
                                padding:0;
                                max-width: 100%;
                            }
                        }
                        .title{
                            line-height: 22px;
                            color: #333;
                            font-size: 15px;
                            background: #fff;
                            padding: 12px 10px 0;
                            text-align: center;
                            .el-radio{
                                width: 100%;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }
                        }
                        &:hover {
                            .content {
                                box-shadow: rgba(192, 197, 210, 0.8) 0px 0px 10px;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
