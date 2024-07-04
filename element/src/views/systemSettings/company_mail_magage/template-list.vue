<template>
    <div class="email_template" v-loading="loading">
        <div class="email_template_tabs" ref="templateTabs">
            <Button type="text" class="tabs" :class="{'active': currentTab === ''}" @click="handleTabsClick('')">{{$t('mailSetting.emailTemplate.all')}}</Button>
            <Button type="text" class="tabs" :class="{'active': currentTab === '0'}" @click="handleTabsClick('0')">{{$t('mailSetting.emailTemplate.uncategorized')}}</Button>
            <template v-for="item in showTabsData">
                <Button type="text" class="tabs" :key="item.id" :class="{'active': currentTab === `${item.id}`}" @click="handleTabsClick(`${item.id}`)">
                    {{ item.classificationName }}
                </Button>
            </template>
            <template v-if="tableData.length > 20">
                <Select v-model="currentTabSelect"
                    @change="handleCurrentTabSelect"
                    popper-class="more_category"
                    style="width: 102px;"
                    filterable
                    :placeholder="$t('mailSetting.emailTemplate.moreCategory')">
                    <Option v-for="item in tableData.slice(20)" :value="`${item.id}`" :label="item.classificationName" :key="item.id"></Option>
                </Select>
            </template>
        </div>
        <div class="email_template_container">
            <div class="container_header">
                <div class="container_header_left">
                    <Checkbox v-model="selectedAll" :indeterminate="indeterminate" class="check_all" @change="selectAll"  v-if="list.length">{{ $t('mailSetting.emailTemplate.allSelect') }}</Checkbox>
                    <template v-if="batchOperationShow">
                        <span class="checked_tip" v-html="checkedHtml"></span>
                        <Button type="minor" size="small" @click="() => updateCategoryVisible = true">{{ $t('mailSetting.emailTemplate.UpdateCategory') }}</Button>
                        <Button type="minor" size="small" @click="() => delTemplateVisible = true">{{ $t('mailSetting.emailTemplate.delete') }}</Button>
                    </template>
                </div>
                <div class="container_header_right">
                    <!-- 搜索 -->
                    <div class="search">
                        <Input v-model="templateName" @keyup.enter.native="searchTemplate" :placeholder="$t('mailSetting.emailTemplate.actNameTip')">
                            <Icon style="cursor:pointer;" slot="suffix" custom="custom custom-journey-search mail-search" size="14" @click="searchTemplate"></Icon>
                        </Input>
                    </div>
                    <!-- 排序 -->
                    <div class="sort">
                        <Dropdown placement="bottom-start" trigger="click"  @command="handleCommand">
                            <span class="classification_set cursor-pointer">
                                <Icon custom="custom-customer-columns-filter"></Icon>{{$t('mailSetting.emailTemplate.sort')}}
                            </span>
                            <DropdownMenu slot="dropdown" class="sortByDropdown">
                                <DropdownItem command="template_name-asc" :class="{'active': sortBy === 'template_name-asc'}">
                                    {{ $t('mailSetting.emailTemplate.templateNamePS') }}
                                </DropdownItem>
                                <DropdownItem command="template_name-desc" :class="{'active': sortBy === 'template_name-desc'}">
                                    {{ $t('mailSetting.emailTemplate.templateNameRO') }}
                                </DropdownItem>
                                <DropdownItem command="create_time-asc" :class="{'active': sortBy === 'create_time-asc'}">
                                    {{ $t('mailSetting.emailTemplate.createdTimePS') }}
                                </DropdownItem>
                                <DropdownItem command="create_time-desc" :class="{'active': sortBy === 'create_time-desc'}">
                                    {{ $t('mailSetting.emailTemplate.createdTimeRO') }}
                                </DropdownItem>
                                <DropdownItem command="update_time-asc" :class="{'active': sortBy === 'update_time-asc'}">
                                    {{ $t('mailSetting.emailTemplate.updateTimePS') }}
                                </DropdownItem>
                                <DropdownItem command="update_time-desc" :class="{'active': sortBy === 'update_time-desc'}">
                                    {{ $t('mailSetting.emailTemplate.updateTimeRO') }}
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                    <!-- 分类设置 -->
                    <div class="classification_set cursor-pointer" @click="() => classificationSetVisible = true">
                        <Icon custom="custom custom-table-edit-columns"></Icon>{{$t('mailSetting.emailTemplate.classification')}}
                    </div>
                    <!-- 新建 -->
                    <div class="btn">
                        <Button type="primary" @click="handleAdd">
                            {{ $t('mailSetting.emailTemplate.add') }}
                        </Button>
                    </div>
                </div>
            </div>
            <div class="container" :style="`height:${window_height - 244- templateTabsHeight}px;`">
                <!-- 初始显示的搜索图片 -->
                <div class="noDataBox" v-if="!list.length">
                    <img src="@/svg/no-data.svg" alt="">
                    <p class="text-center">{{ $t('mail.customerBox.noData') }}</p>
                </div>
                <!-- 邮件列表内容 -->
                <ul v-else class="template_list">
                    <li class="template_item" v-for="(item, index) in list" :key="index">
                        <div class="content">
                            <div class="content-img" @click="item.selected = !item.selected">
                                <img :src="item.contentImgUrl" alt="">
                            </div>
                            <div class="operate_btn">
                                <Button type="text" @click="handlePreview(item)">{{ $t('mail.preview') }}</Button>
                                <Button type="text" @click="editTemplate(item)">{{ $t('edit') }}</Button>
                                <Button type="text" @click="copyTemplateBtn(item)">{{ $t('mail.copyAttachments') }}</Button>
                                <Button type="text" @click="handleDel(item)">{{ $t('delete') }}</Button>
                            </div>
                        </div>
                        <div class="title">
                            <!-- <Tooltip placement="top-start" :content="item.templateName"> -->
                            <Checkbox v-model="item.selected" class="check_item">{{ item.templateName }}</Checkbox>
                            <!-- </Tooltip> -->
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <!-- 分页 -->
        <footer class="email_template_footer" v-if="list.length">
            <Page
                :total="total"
                :current-page.sync="currentPageNum"
                :page-size="pageSize"
                :page-sizes="[20, 50, 100]"
                class="pageWrap-right"
                layout="total, prev, pager, next, sizes, jumper"
                @current-change="handleCurrentChange"
                @size-change="handleSizeChange"
                transfer>
            </Page>
        </footer>

        <!-- 更新分类 -->
        <Modal
            :visible.sync="updateCategoryVisible"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            width="487px"
            @close="updateCategoryClose"
            class="update_category_modal"
            :title="$t('mailSetting.emailTemplate.UpdateCategory')">
            <Form label-position="left"
                label-width="48px">
                <!-- 模板分类 -->
                <FormItem class="template_form_item" :label="$t('mailSetting.emailTemplate.category')" prop="title">
                    <Select v-model="transferCategory"
                            style="width: 390px;"
                            filterable
                            :placeholder="$t('mailSetting.emailTemplate.tip_select')">
                        <Option value="0" :label="$t('mailSetting.emailTemplate.uncategorized')"></Option>
                        <Option v-for="item in tableData"
                                :key="item.id"
                                :value="item.id"
                                :label="item.classificationName"></Option>
                    </Select>
                </FormItem>
            </Form>
            <div slot="footer" class="footer">
                <Button @click="updateCategoryClose">{{ $t('close') }}</Button>
                <Button type="primary" @click="categoryBtn" v-loading="transferCategoryLoading">{{ $t('mailSetting.emailTemplate.confirm') }}</Button>
            </div>
        </Modal>
        <!-- 删除模板 -->
        <Modal
            :visible.sync="delTemplateVisible"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            width="487px"
            @close="delTemplateClose"
            class="copy_template_modal"
            :title="$t('mailSetting.emailTemplate.delTemplate')">
            <p>{{ $t('mailSetting.emailTemplate.delTemplateTip') }}</p>
            <div slot="footer" class="footer">
                <Button @click="() => delTemplateVisible = false">{{ $t('close') }}</Button>
                <Button type="primary" @click="delTemplateBtn">{{ $t('mailSetting.emailTemplate.confirm') }}</Button>
            </div>
        </Modal>

        <!-- 预览模板 -->
        <showTemplate :visible.sync="previewTemplateVisible" :id="showTemplateId" modalWidth="1000"></showTemplate>
        <!-- 新建、编辑模板分类 start -->
        <classificationModal :visible.sync="classificationSetVisible" type="1" :tableData="tableData" @refreshData="refreshData"></classificationModal>
        <!-- 新建、编辑模板分类  end -->
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    import { findPageList, saveOrder, findAll, batchUpdateClassification, batchDel, copyTemplate } from '@/api/mail/mailSet.js';
    import classificationModal from './components/classificationModal.vue';
    import showTemplate from './components/showTemplate.vue';

    export default {
        name: 'template-list',
        props: ['memoryData'],
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                fullName: 'fullName',
                window_height: 'window_height'
            }),
            // 全选按钮的半选状态控制
            indeterminate() {
                let count = 0;
                this.list.forEach(item => {
                    if (item.selected) {
                        count++;
                    }
                });
                if (count > 0 && count < this.list.length) {
                    return true;
                } else {
                    return false;
                }
            },
            // 全选按钮的全选状态控制
            selectedAll() {
                if (this.list.length === 0) {
                    return false;
                }
                let count = 0;
                this.list.forEach(item => {
                    if (item.selected) {
                        count++;
                    }
                });
                if (count === this.list.length) {
                    return true;
                } else {
                    return false;
                }
            },
            // 批量操作显示状态
            batchOperationShow() {
                let count = 0;
                this.list.forEach(item => {
                    if (item.selected) {
                        count++;
                    }
                });
                if (count > 0) {
                    return true;
                } else {
                    return false;
                }
            },
            checkedHtml() {
                let count = 0;
                this.list.forEach(item => {
                    if (item.selected) {
                        count++;
                    }
                });
                const str = this.$t('mailSetting.emailTemplate.selectSever').replace('$filter', `<span style="color:#FF752A;"> ${count} </span>`);
                return str;
            },
            showTabsData() {
                if (this.tableData.length >= 0 && this.tableData.length <= 20) {
                    return this.tableData;
                } else {
                    return this.tableData.slice(0, 20);
                }
            }
        },
        components: {
            classificationModal,
            showTemplate
        },
        data() {
            return {
                loading: true,
                cancelFunc: null,
                sortVisible: false,
                currentTab: '',
                currentTabSelect: '',
                templateName: '',
                pageSize: 50, // 当前页显示条数
                currentPageNum: 1, // 当前页码
                total: 0, // 总条数
                orderColumn: '', // 排序字段
                orderType: '', // 排序方式
                list: [],
                transferCategory: '', // 全选-要跟新至的分类
                transferCategoryLoading: false, // 全选-更新分类loading
                updateCategoryVisible: false, // 更新分类状态
                delTemplateVisible: false, // 删除模板状态
                previewTemplateVisible: false, // 预览模板状态
                classificationSetVisible: false,
                tableData: [],
                sortBy: '',
                showTemplateId: '',
                templateTabsHeight: 0,
                delItemId: null
            };
        },
        methods: {
            // 点击新建模板按钮
            handleAdd() {
                const data = {
                    currentTab: this.currentTab,
                    currentTabSelect: this.currentTabSelect,
                    type: 'newTemplate',
                    templateName: this.templateName
                };
                this.$emit('handleView', data);
            },
            // 点击编辑模板按钮
            editTemplate(row) {
                const data = {
                    currentTab: this.currentTab,
                    currentTabSelect: this.currentTabSelect,
                    type: 'editTemplate',
                    templateName: this.templateName,
                    mailTemplateId: row.id
                };
                this.$emit('handleView', data);
            },
            // 模板勾选批量操作
            // listSelect(val) {
            //     if (val) {
            //         this.batchOperationShow = true;
            //     }
            // },
            // 全选操作
            selectAll(val) {
                this.list.forEach(item => {
                    item.selected = val;
                });
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
            // 更新分类 确定
            categoryBtn() {
                if (this.transferCategory === '') {
                    this.$Message.error(this.$t('mailSetting.emailTemplate.tip_select'));
                    return;
                }
                this.transferCategoryLoading = true;
                const ids = this.list.filter(item => item.selected).map(item => item.id);
                batchUpdateClassification({
                    userId: this.userId,
                    userName: this.fullName,
                    ids,
                    templateClassificationId: this.transferCategory
                }).then(res => {
                    if (res.code === 1) {
                        this.$Message.success(this.$t('mailSetting.emailTemplate.updateSuccess'));
                        this.getTemplateList();
                        this.updateCategoryVisible = false;
                        this.transferCategoryLoading = false;
                    } else {
                        this.$Message.error(this.$t('mailSetting.emailTemplate.updateFail'));
                    }
                });
            },
            // 更新分类 关闭
            updateCategoryClose() {
                this.transferCategory = '';
                this.updateCategoryVisible = false;
            },
            // 复制到公司模板 确定
            copyTemplateBtn(row) {
                copyTemplate({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    userName: this.fullName,
                    id: row.id
                }).then(res => {
                    if (res.code === 1) {
                        this.$Message.success(this.$t('mailSetting.emailTemplate.copySuccess'));
                        this.getTemplateList();
                    } else {
                        this.$Message.error(this.$t('mailSetting.emailTemplate.copyFail'));
                    }
                });
            },
            // 单个删除模板
            handleDel(row) {
                this.delItemId = row.id;
                this.delTemplateVisible = true;
            },
            // 批量删除模板
            delTemplateBtn() {
                batchDel({
                    userId: this.userId,
                    userName: this.fullName,
                    ids: this.delItemId ? [this.delItemId] : this.list.filter(item => item.selected).map(item => item.id)
                }).then(res => {
                    if (res.code === 1) {
                        this.$Message.success(this.$t('mail.deleteSuccTip'));
                        this.delTemplateVisible = false;
                        this.delItemId = null;
                        this.getTemplateList();
                    } else {
                        this.$Message.error(this.$t('mail.deleteErrorTip'));
                    }
                });
            },
            // 关闭删除模板弹框
            delTemplateClose() {
                this.delItemId = null;
                this.delTemplateVisible = false;
            },
            // 预览模板
            previewTemplateClose() {
                this.previewTemplateVisible = false;
            },
            searchTemplate() {
                this.currentPageNum = 1;
                this.getTemplateList();
            },
            // 切换前22个tabs
            handleTabsClick(val) {
                this.currentPageNum = 1;
                this.templateName = '';
                this.currentTabSelect = '';
                this.currentTab = val;
                this.getTemplateList();
            },
            // 切换更多分类
            handleCurrentTabSelect(val) {
                this.currentPageNum = 1;
                this.templateName = '';
                this.currentTab = val;
                this.getTemplateList();
            },
            // 获取模板列表
            getTemplateList() {
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                const vm = this;
                const cancelToken = new this.$util.axios.CancelToken(function executor(c) {
                    // An executor function receives a cancel function as a parameter
                    vm.cancelFunc = c;
                });
                this.loading = true;
                findPageList({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    templateClassificationId: this.currentTab,
                    type: 1,
                    page: this.currentPageNum,
                    size: this.pageSize,
                    orderColumn: this.orderColumn,
                    orderType: this.orderType,
                    templateName: this.templateName
                }, cancelToken).then(data => {
                    if (data.code === 1 && data.data) {
                        if (data.data.content.length === 0 && this.currentPageNum > 1) {
                            this.currentPageNum--;
                            this.getTemplateList();
                            return;
                        }
                        this.list = data.data.content.map(item => {
                            return {
                                selected: false,
                                ...item
                            };
                        });
                        this.total = data.data.totalElements;
                        this.sortBy = `${data.data.orderColumn}-${data.data.orderType}`;
                    } else {
                        this.list = [];
                        this.total = 0;
                        this.$Message.error(this.$t('mailSetting.emailTemplate.requestFailed'));
                    }
                    this.loading = false;
                }).catch(() => {
                    this.list = [];
                    this.total = 0;
                    this.loading = false;
                });
            },
            /* -- 新建模板分类 start -------------------------------------- */
            // 获取模板分类
            refreshData(id) {
                // 请求表格数据
                findAll({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    type: 1
                }).then(data => {
                    if (data.code === 1) {
                        this.tableData = this.handleData(data.data);
                        this.$nextTick(() => {
                            this.templateTabsHeight = this.$refs.templateTabs.offsetHeight;
                        });
                        // 在当前分类下删除分类后 页面展示问题
                        if (id && (id === this.currentTab || id === this.currentTabSelect)) {
                            this.currentTab = '';
                            this.currentTabSelect = '';
                            this.getTemplateList();
                        }
                        // 在新建或编辑处删除当前选中
                        if (this.memoryData && this.memoryData.currentTab === this.currentTab && this.memoryData.currentTab !== '0' && !this.tableData.some(item => `${item.id}` === this.memoryData.currentTab)) {
                            this.currentTab = '';
                            this.currentTabSelect = '';
                            this.getTemplateList();
                        }
                        if (id === 'sort') {
                            const index = this.tableData.findIndex(item => `${item.id}` === this.currentTab);
                            if (index > 20) {
                                this.currentTabSelect = this.currentTab;
                            } else {
                                this.currentTabSelect = '';
                            }
                        }
                    } else {
                        this.$Message.error(this.$t('mailSetting.emailTemplate.requestFailed'));
                    }
                }).catch(() => {
                    this.$Message.error(this.$t('mailSetting.emailTemplate.requestFailed'));
                });
            },
            // 处理得到表格数据
            handleData(data) {
                // 如果传入非数组, 直接返回空数组
                if (!Array.isArray(data)) {
                    return [];
                }

                // 格式化数据
                const tmp = data.map(item => {
                    return {
                        editing: false,
                        ...item
                    };
                });

                // 拼合原有数据
                return tmp;
            },
            classificationSet() {
                this.classificationSetVisible = true;
            },
            setSorting(orderColumn, orderType) {
                saveOrder({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    userName: this.fullName,
                    type: 1,
                    orderColumn,
                    orderType
                }).then(data => {
                    if (data.code === 1) {
                        this.getTemplateList();
                    } else {
                        this.$Message.error(this.$t('mailSetting.emailTemplate.sortFail'));
                    }
                });
            },
            handleCommand(command) {
                this.sortBy = command;
                const [orderColumn, orderType] = command.split('-');
                this.setSorting(orderColumn, orderType);
            },
            handlePreview(row) {
                this.showTemplateId = row.id;
                this.previewTemplateVisible = true;
            }
        },
        created() {
            if (this.memoryData) {
                this.currentTab = this.memoryData.currentTab;
                this.currentTabSelect = this.memoryData.currentTabSelect;
                this.templateName = this.memoryData.templateName;
            }
            this.getTemplateList();
            this.refreshData();
        },
        watch: {
            window_height: {
                handler(val) {
                    this.$nextTick(() => {
                        this.templateTabsHeight = this.$refs.templateTabs.offsetHeight;
                    });
                }
            }
        }
    };
</script>
<style lang="less" scoped>
    @import url(./less/new_template.less);
</style>
