<template>
    <div>
        <Drawer :visible.sync="visible"
                size="50%"
                :modal="false"
                :append-to-body="true"
                :with-header="false"
                ref="topDrawer"
                
                @scroll.native.capture="close_popper"
                class="drawer-show-main-header drawer-close-button-moveUp customSetting">
            <!-- 自定义关闭按钮 -->
            <a
               class="drawer-close-button" @click="visibleChange(false)">
                <span class="custom custom-drawer-detail-close"></span>
            </a>
            <div class="customSetting-header">
                <div>
                    <span class="custom custom-yonghushezhixiangqingye"></span>
                    <span class="customSetting-header-title">{{$t('administerAMP.wordPress.userSettings')}}</span>
                </div>
                <Button class="new-custom" style="padding: 10px 15px" type="primary" @click="addUser()">{{$t('administerAMP.wordPress.createUsers')}}</Button>
            </div>
            <div class="table" style="margin-top: 8px" v-if="loading">
                <Table
                    :data="webDate"
                    :height="table_height"
                    size="medium"
                    highlight-current-row
                    ref="table"
                    :row-class-name="getRowClassName"
                    :cell-class-name="getCellClassName"
                    header-row-class-name="headerClassName"
                    :key="itemKey"
                    class="tabmain">
                    <TableColumn class-name="no-padding-cell" :label="$t('administerAMP.wordPress.name')" width="270">
                        <template slot-scope="scope">
                            <template v-if="scope.row.editing">
                                <Select v-model="systemUserId">
                                    <Option v-for="item in userList"
                                            :key="item.id"
                                            :value="item.id"
                                            :label="item.fullname"></Option>
                                </Select>
                            </template>
                            <template v-else>
                                <span>{{scope.row.userName}}</span>
                            </template>
                        </template>
                    </TableColumn>
                    <TableColumn class-name="no-padding-cell" :label="$t('administerAMP.wordPress.role')" width="270">
                        <template slot-scope="scope">
                            <template v-if="scope.row.editing">
                                <Select v-model="selectRoleId">
                                    <Option v-for="item in roleList"
                                            :key="item"
                                            :value="item"
                                            :label="item"></Option>
                                </Select>
                            </template>
                            <template v-else>
                                <span>{{scope.row.siteRoleName || '-'}}</span>
                            </template>
                            <span v-if="scope.row.userType === 1" style="color: #FBBC04" class="customSetting-superAdmin custom custom-chaoguanzhanghao"></span>
                        </template>
                    </TableColumn>
                    
                    <TableColumn
                        width="300"
                        class-name="no-padding-cell"
                        fixed="right"
                        :label="$t('administerAMP.wordPress.operate')">
                        <template slot-scope="scope">
                            <template v-if="scope.row.editing">
                                <i class="el-icon-loading" v-if="saveLoading"></i>
                                <template v-else>
                                    <!-- 保存 -->
                                    <Icon custom="custom custom-confirm save-ok"
                                        color="#3B78DE"
                                        style="cursor: pointer;"
                                        @click.stop="handleAdd_confirm(scope.row, index)"></Icon>

                                    <!-- 取消 -->
                                    <Icon custom="custom custom-follow-edit-area-close save-cancel"
                                        color="#ACB7CA"
                                        style="cursor: pointer;"
                                        @click.stop="handleAdd_cancel(scope.row, index)"></Icon>
                                </template>
                            </template>
                            <template v-else>
                                <Button v-if="scope.row.userType !== 1" type="text" style="font-size: 14px;" class="customSetting-edit" @click="editData(scope.row, index)">{{$t('administerAMP.wordPress.edit')}}</Button>
                                <Button v-if="scope.row.userType !== 1" type="text" style="font-size: 14px;" class="customSetting-delete" @click="deleteData(scope.row, index)">{{$t('administerAMP.wordPress.delete')}}</Button>
                            </template>
                        </template>
                    </TableColumn>
                </Table>
                <div style="margin-right: 30px;overflow: hidden;background-color: #fff;">
                    <Page :page-size="pageSize"
                        :page-sizes="pageSizeOpts"
                        :total="totalNum"
                        :current-page="curPage"
                        layout="total, prev, pager, next, sizes, jumper"
                        @current-change="changePage"
                        @size-change="pageSizeChange"
                        class="pageWrap-right"></Page>
                </div>
            </div>
        </Drawer>
        <Modal
            :title="$t('administerAMP.wordPress.deleteConfirmation')"
            :visible.sync="deleteModal"
            :close-on-click-modal="false"
            width="557px"
            :show-close="true"
            :append-to-body="true"
            :modal-append-to-body="false">
                <div >{{$t('administerAMP.wordPress.deleteTips1')}} {{rowDate.domain}} {{$t('administerAMP.wordPress.deleteTips2')}}</div>
                <span slot="footer" class="dialog-footer">
                    <Button @click="deleteModal = false">{{$t('administerAMP.wordPress.cancel')}}</Button>
                    <Button type="primary" @click="okBtn" :loading="saveLoading">{{$t('administerAMP.wordPress.ok')}}</Button>
                </span>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import {
        getUserList,
        getUserAuthority,
        addUserAuthority,
        deleteUserAuthority,
        updateUserAuthority,
        getUsersForMarketingSite
    } from '@/api/website';

    export default {
        name: 'customSetting',
        props: [
            'visible',
            'id',
            'rowDate'
        ],
        computed: {
            ...mapState({
                userId: 'userId',
                enterpriseId: 'enterpriseId',
                button_list: state => state.app.button_list,
                window_height: state => state.window_height
            }),
            table_height() {
                let temp = this.window_height ? this.window_height - 190 : document.body.clientHeight - 190;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            }
        },
        data() {
            return {
                webDate: [],
                pageSize: 20,
                pageSizeOpts: [20, 50, 100],
                totalNum: null,
                curPage: 1,
                roleList: [],
                addForm: {
                    name: '',
                    role: ''
                },
                userList: [],
                operaType: '',
                loading: false,
                itemKey: 0,
                deleteModal: false,
                selectRow: {},
                systemUserId: null,
                selectRoleId: null,
                saveLoading: false,
                close_popper: this.$debounce(e => {
                    if (e && e.target && e.target.parentElement && e.target.parentElement.classList.contains('el-drawer__body')) {
                        const selectEl = this.$refs.crmDetail[(this.$refs.crmDetail.length - 1)] || this.$refs.crmDetail;
                        if (selectEl && selectEl.$refs.followUp) {
                            const selectEl2 = selectEl.$refs.followUp;
                            if (selectEl2) {
                                const selectEl3 = selectEl2.$refs.crmDetailTimeLine;
                                const finalEl = selectEl3.$el.querySelector('.click-close-popper');
                                if (finalEl) {
                                    finalEl.click();
                                }
                            }
                        }
                    }
                }, 200, true)
            };
        },
        methods: {
            getData() {
                getUserList({
                    orgId: this.enterpriseId,
                    siteId: this.id,
                    pageNo: this.curPage,
                    pageSize: this.pageSize
                }).then(res => {
                    if (res.code === '1') {
                        this.webDate = res.data.list;
                        this.webDate.map(res => { res.editing = false; });
                        this.totalNum = res.data.total;
                        setTimeout(res => {
                            this.loading = true;
                        }, 800);
                    }
                });
            },
            changePage(page) {
                if (page <= this.totalPageCount) {
                    this.curPage = page;
                    this.getData();
                }
            },
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                this.getData();
            },
            // 指定表格行 class name
            getRowClassName({ row, rowIndex }) {
                row.index = rowIndex;
                if (rowIndex % 2 === 0) {
                    return 'one_row_background';
                } else if (rowIndex % 2 === 1) {
                    return 'pair_row_background';
                }
                return '';
            },
            getCellClassName({ row, rowIndex }) {
                if (row.editing) {
                    return 'pair_row_editing';
                } else if (!row.editing) {
                    return '';
                }
                return '';
            },
            addUser() {
                if (this.webDate.find(item => item.editing)) {
                    return
                }
                this.operaType = 'add';
                this.webDate.unshift({
                    editing: true
                });
            },
            editData(row) {
                if (this.webDate.find(item => item.editing)) {
                    return;
                }
                this.operaType = 'edit';
                const index = this.webDate.findIndex(item => item.id === row.id);
                this.webDate[index].editing = true;
                this.systemUserId = row.userId;
                this.selectRoleId = row.siteRoleName;
                this.itemKey++;
            },
            deleteData(row, index) {
                this.deleteModal = true;
                this.selectRow = row;
                this.systemUserId = null;
                this.selectRoleId = null;
            },
            okBtn() {
                this.saveLoading = true;
                deleteUserAuthority({
                    org_id: this.enterpriseId,
                    site_id: this.selectRow.siteId,
                    user_id: this.selectRow.userId,
                    site_user_id: this.selectRow.siteUserId,
                    interfaceUrl: this.rowDate.interfaceUrl
                }).then(res => {
                    this.deleteModal = false;
                    this.saveLoading = false;
                    if (res.code === '1') {
                        this.getData();
                    }
                })
            },
            handleAdd_confirm(row) {
                if (!this.systemUserId || !this.selectRoleId) {
                    this.$Message.error('用户及角色不能为空');
                    return;
                }
                if (this.saveLoading) return;
                this.saveLoading = true;
                if (this.operaType === 'add') {
                    addUserAuthority({
                        org_id: this.enterpriseId,
                        site_id: this.rowDate.id,
                        user_id: this.systemUserId,
                        user_name: this.userList.find(item => item.id === this.systemUserId).fullname,
                        user_email: this.rowDate.user_email || '111@qq.com',
                        site_role_name: this.selectRoleId,
                        interfaceUrl: this.rowDate.interfaceUrl
                    }).then(res => {
                        if (res.code === '1') {
                            this.getData();
                        } else {
                            this.getData();
                            this.$Message.error(res.message);
                        }
                        row.editing = false;
                        this.saveLoading = false;
                        this.itemKey++;
                    });
                } else if (this.operaType === 'edit') {
                    updateUserAuthority({
                        org_id: this.enterpriseId,
                        site_id: row.siteId,
                        user_id: this.systemUserId,
                        user_name: this.userList.find(item => item.id === this.systemUserId).fullname,
                        user_email: this.userList.find(item => item.id === this.systemUserId).email,
                        // site_user_id: row.siteUserId,
                        site_role_name: this.selectRoleId,

                        old_user_id: row.userId,
                        old_site_user_id: row.siteUserId,
                        old_site_role_name: row.siteRoleName,
                        interfaceUrl: this.rowDate.interfaceUrl
                    }).then(res => {
                        if (res.code === '1') {
                            this.getData();
                        }
                        row.editing = false;
                        this.saveLoading = false;
                        this.itemKey++;
                    });
                } else {
                }
            },
            handleAdd_cancel(row) {
                if (this.operaType === 'add') {
                    this.webDate.shift({
                        userName: '',
                        siteRoleName: '',
                        editing: true
                    });
                } else if (this.operaType === 'edit') {
                    const index = this.webDate.findIndex(item => item.id === row.id);
                    this.webDate[index].editing = false;
                } else {
                    row.editing = false;
                }
                this.itemKey++;
            },
            visibleChange() {
                this.$emit('update:visible', false);
            },
            // 绑定给当前所处的 DOM (single-page) 的点击事件, 点击表格条目以外的操作将关闭最上一层 drawer
            click_blank(e) {
                if (this.visible) {
                    let boo = true;
                    let temp_el = e.target;
                    while (!temp_el.classList && !temp_el.classList.contains('single-page')) {
                        if (temp_el.classList.contains('el-table__row')) {
                            boo = false;
                            break;
                        } else {
                            temp_el = temp_el.parentElement;
                        }
                    }
                    console.log('clue===>click_blank', e, boo);
                    if (boo) {
                        this.$emit('update:clueId', '');
                        this.$emit('update:visible', false);
                    }
                }
            }
        },
        mounted() {
            const parentView = document.getElementsByClassName('single-page')[0];
            if (parentView) {
                parentView.addEventListener('click', this.click_blank);
            }
        },
        beforeDestroy() {
            const parentView = document.getElementsByClassName('single-page')[0];
            if (parentView) {
                parentView.removeEventListener('click', this.click_blank);
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.getData();
                    getUserAuthority({
                        interfaceUrl: this.rowDate.interfaceUrl
                    }).then(res => {
                        console.log(res);
                        if (res.code === '1') {
                            this.roleList = res.data.list;
                        }
                    });
                    getUsersForMarketingSite({
                        orgId: this.enterpriseId
                    }).then(res => {
                        console.log(res);
                        if (res.code === '1') {
                            this.userList = res.data;
                        }
                    });
                }
            }
        }
    };
</script>

