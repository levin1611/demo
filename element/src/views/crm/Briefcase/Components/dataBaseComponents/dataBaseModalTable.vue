<template>
    <div class="dataBase-table-page" v-if="authorized_button[`${base}`]['look']">
        <div>
            <div class="dataBase_crumb_container">
                <span v-if="crumbs.length === 1" class="dataBase_crumb">
                    <span @click="redirectTo(0)" class="level">{{getCrumb(base)}}</span> > <span >{{crumbs[0].filename}}</span>
                </span>
                <span v-if="crumbs.length === 2" class="dataBase_crumb">
                    <span @click="redirectTo(0)" class="level">{{getCrumb(base)}}</span> > <span @click="redirectTo(1)" class="level">{{crumbs[0].filename}}</span> > <span >{{crumbs[1].filename}}</span>
                </span>
                <span v-if="crumbs.length === 3" class="dataBase_crumb">
                    <span @click="redirectTo(0)" class="level">{{getCrumb(base)}}</span> > <span @click="redirectTo(1)" class="level">{{crumbs[0].filename}}</span> > <span @click="redirectTo(2)" class="level">{{crumbs[1].filename}}</span> > <span >{{crumbs[2].filename}}</span>
                </span>
                <span v-if="crumbs.length === 0" @click="redirectTo(0)" class="dataBase_crumb_single">{{getCrumb(base)}}</span>
            </div>
            <div class="table">
                <Table :data="tableData"
                       :show-header="false"
                       v-loading="loading"
                       highlight-current-row
                       ref="table"
                       size="medium"
                       @cell-click="filePreview"
                       @row-click="openFolder"
                       @selection-change="handleSelectChange"
                       class="noBoxShadow-right noborder-table dataBase-modal-table"
                       :height="table_height" >
                    <!-- 首列 checkbox -->
                    <TableColumn
                                 width="40"
                                 align="left"
                                 class-name="no-padding-cell">
                        <template slot-scope="scope">
                            <Checkbox @change="checkSingle($event, scope)"
                                      :value="selected_files.find(item => item.id === scope.row.id) !== undefined"
                                      @click.native.stop
                                      :disabled="scope.row.isFolder === 1 || (scope.row.share_able === '0' && isCanSelectFile)">
                            </Checkbox>
                        </template>
                    </TableColumn>
                    <!-- 正常列 -->
                    <!-- 文件名称列 -->
                    <TableColumn prop="name"
                                 :label="$t('material.New.name')"
                                 :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template>
                                <fileNameIcon :iconName="scope.row.suffix" :isFolder="Boolean(scope.row.isFolder)"></fileNameIcon>
                                <span class="dataBase-file-name">
                                    <span :class="{'file-name':dataBaseFileStyle(scope.row)}">{{scope.row.filename}} </span>
                                    <span class="file_is_dealing" v-if="scope.row.share_able === '0'">(文件处理中)</span>
                                </span>
                            </template>
                        </template>
                    </TableColumn>
                    <!-- 最近使用列 -->
                    <TableColumn prop="latestTime"
                                 :label="$t('material.New.recentlyUse')"
                                 width="160"
                                 :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <span>{{scope.row.operateTime}}</span>
                        </template>
                    </TableColumn>
                    <!-- 文件大小列 -->
                    <TableColumn prop="size"
                                 :label="$t('material.New.size')"
                                 width="90"
                                 :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <span v-if="scope.row.isFolder!==1">{{scope.row.size | fileSizeFilter}}</span>
                            <span v-else>--</span>
                        </template>
                    </TableColumn>
                    <!-- 末列操作配置按钮 -->
                </Table>
                <div style="margin-right: 30px; overflow: hidden">
                    <Page :page-size="pageSize"
                          :page-sizes="pageSizeOpts"
                          :pager-count="5"
                          :total="totalNum"
                          :current-page="curPage"
                          layout="total, prev, pager, next, sizes, jumper"
                          class="pageWrap-right"
                          @current-change="changePage"
                          @size-change="pageSizeChange"  >
                    </Page>
                </div>
            </div>
            <div class="modals">
                <Modal :visible.sync="visible_share"
                       :modal="false"
                       title="共享"
                       width="540px">
                    <Tabs v-model="activeDirName">
                        <TabPane :label="$t('material.New.sharedFiles')" name="sharingFile">
                            <IviewTree show-checkbox
                                       :data="tree_data"
                                       ref="dir_tree"
                                       :render="renderContent" >
                            </IviewTree>
                        </TabPane>
                    </Tabs>
                    <div slot="footer">
                        <Button @click="visible_share=false">{{$t('material.Btn.cancel')}}</Button>
                        <Button type="primary" @click="share_to">{{$t('material.Btn.confirm')}}</Button>
                    </div>
                </Modal>
                <Modal :visible.sync="visible_rename"
                       :modal="false"
                       :title="$t('material.New.rename')"
                       width="451px">
                    <Input :value="oldFileName"></Input>
                    <div slot="footer">
                        <Button @click="visible_rename=false">{{$t('material.Btn.cancel')}}</Button>
                        <Button type="primary" @click="RenameConfirm">{{$t('material.Btn.confirm')}}</Button>
                    </div>
                </Modal>
                <Modal :visible.sync="visible_delete"
                       :modal="false"
                       title="提示">
                    <div>
                        <p>确认要永久删除吗？</p>
                        <p>如文件已分享会导致无法访问，请谨慎操作！</p>
                    </div>
                    <div slot="footer">
                        <Button @click="visible_delete=false">{{$t('material.Btn.cancel')}}</Button>
                        <Button type="primary" @click="delete_confirm">{{$t('material.Btn.confirm')}}</Button>
                    </div>
                </Modal>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '../../../../../libs/util';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState } from 'vuex';

    export default {
        name: 'dataBaseModalTable',
        computed: {
            ...mapState({
                afterShare: 'afterShare', // 组件分享后,调用一次页面的方法
                activeRouteNames: state => state.app.activeRouteNames,
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                parentId: state => state.crm.parentId,
                button_list: state => state.app.button_list,
                menuList: state => state.app.menu_list,
                isDeleteFlag: state => state.crm.isDeleteFlag
            }),
            table_height() {
                let temp = this.window_height ? this.window_height - 176 : document.body.clientHeight - 176;
                if (temp < 200) {
                    temp = 200;
                }
                // 转 element-ui 时, 表格样式错误, 加上这句后解决, 具体错误原因暂时未看
                temp += this.loading ? 1 : 0;
                return temp;
            },
            authorized_button() {
                const buttonIds = BUTTON_IDS.CRM.database;
                return {
                    person: {
                        look: true // !HANDLE_BUTTON(buttonIds.person_disk.look, this.button_list)
                    },
                    company: {
                        look: true // !HANDLE_BUTTON(buttonIds.company_disk.look, this.button_list)
                    },
                    share: {
                        look: true // !HANDLE_BUTTON(buttonIds.share_disk.look, this.button_list)
                    }
                };
            },
            isCanSelectFile() {
                return this.$router.currentRoute.name === 'cloud_push';
            }
        },
        props: {
            // 控制弹窗'确定按钮'的阈值
            canClick: {
                type: Boolean,
                default: false
            },
            isNewFolder: {
                type: Boolean,
                default: false
            },
            /**
             * 判断属于哪个仓库
             * person: 个人仓库
             * company： 公司文件
             * share: 共享文件 */
            base: {
                type: String
            }
        },
        data() {
            return {
                tableData: [], // 表格数据
                loading: false, // 加载图标
                currentColumns: [], // 表格列名称
                allColumns: [], // 表格全部列
                flag_refreshColumn: true, // 使用v-if刷新列表列顺序
                maxPageNum: 1,
                isShowTopBar: false, // 是否显示顶部操作栏
                newFolderInput: '', // 新建文件夹的名称
                selected_files: [], // 选中的文件或者文件夹
                /* 操作弹窗控制 */
                // 共享弹窗
                visible_share: false, // 控制共享弹窗
                activeDirName: 'sharingFile', // 默认为共享文件
                tree_data: [
                    {
                        title: '文件夹 1',
                        expand: true,
                        selected: true,
                        children: [
                            {
                                title: '文件夹 1-1',
                                expand: true,
                                children: [
                                    {
                                        title: '文件夹 1-1-1'
                                    },
                                    {
                                        title: '文件夹 1-1-2'
                                    }
                                ]
                            }
                        ]
                    }
                ], // 共享文件中文件夹的树形数据
                // 重命名弹窗
                visible_rename: false, // 控制重命名弹窗
                oldFileName: '', // 文件或文件夹之前的名称
                newFileName: '', // 文件或文件夹重命名之后的名称
                // 删除弹窗
                visible_delete: false, // 控制删除弹窗
                deleteFileId: '', // 要删除的ID
                deleteFileName: '', // 要删除的文件名称
                // 分页
                totalNum: 0,
                curPage: 1,
                pageSize: 10,
                pageSizeOpts: [10, 20, 50],
                crumbs: []
            };
        },
        methods: {
            dataBaseFileStyle(file) {
                // 定义一个style
                let styles = true;
                if (file.isFolder === 1) {
                    styles = false;
                } else if (file.size === '0') {
                    styles = false;
                } else if (file.suffix === 'csv') {
                    styles = false;
                } else if (Number(file.size) > 26214400 && file.suffix === 'xls') {
                    styles = false;
                } else if (Number(file.size) > 26214400 && file.suffix === 'xlsx') {
                    styles = false;
                } else if (Number(file.size) > 26214400 && file.suffix === 'ppt') {
                    styles = false;
                } else if (Number(file.size) > 26214400 && file.suffix === 'pptx') {
                    styles = false;
                } else {
                    styles = true;
                };
                return styles;
            },
            filePreview(row, column, cell, event) {
                // csv文件、文件大小为 0k 的文件 无法预览
                if (!['mp4', 'webm', 'ogg', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pdf', 'pptx', 'jpg', 'jpeg', 'png', 'gif'].includes(row.suffix) && row.isFolder === 0 && column.property === 'name') {
                    this.$Message.warning(this.$t('BriefCase.typeError'));
                    return;
                } else if (row.size === '0' && row.isFolder === 0) {
                    this.$Message.warning('文件大小为 0 K，无法预览');
                    return;
                } else if ((row.suffix === 'xls' || row.suffix === 'xlsx' || row.suffix === 'pptx' || row.suffix === 'ppt') && row.size > 26214400) {
                    this.$Message.warning('.xls/.xlsx, .pptx/.ppt 格式超过25M，无法预览');
                    return;
                };
                // 文件列表
                const fileList = this.tableData.filter((item) => {
                    return item.isFolder === 0;
                });
                // 判断row.isFolder 为0的话表示当前点击的是文件
                if (row.isFolder === 0 && column.property === 'name') {
                    // 预览组件
                    this.$store.commit('showFilePreview', true);
                    // 将文件列表存到vuex
                    this.$store.commit('firstFileId', row.id);
                    // 将parentId到vuex
                    this.$store.commit('fileStorageFolder', this.parentId);
                    // 将文件列表存到vuex
                    this.$store.commit('dataBaseFileList', fileList);
                }
            },
            handleNewFolder() {
                // 调用接口
                // 修改
            },
            handleSelectChange(val) {
                console.log(val);
            },
            handleNewFolderClose() {
                // 去掉tableData中flag为1的对象
                this.tableData.forEach((item, index) => {
                    if (item.flag === 1) {
                        this.$emit('updateIsNewFolder', false);
                        this.tableData.splice(index, 1);
                    }
                });
            },
            handleShare(data) {
                console.log('========>', data);
                this.visible_share = true;
            },
            // 处理重命名逻辑
            handleRename(data) {
                console.log('------->', data);
                this.oldFileName = data.name;
                this.visible_rename = true;
            },
            RenameConfirm() {
                this.visible_rename = false;
            },
            // 处理删除逻辑
            handleDelete(data) {
                console.log('you are deleting these', data);
                this.visible_delete = true;
            },
            delete_confirm() {
                this.visible_delete = false;
            },
            renderContent(h, { root, node, data }) {
                return h('span', {
                    style: {
                        display: 'inline-block',
                        width: '100%'
                    }
                }, [
                    h('span', [
                        h('Icon', {
                            props: {

                            },
                            class: 'custom custom-fp-paper-file',
                            style: {
                                marginRight: '8px',
                                color: '#FBBC04',
                                width: '18px',
                                height: '18px'
                            }
                        }),
                        h('span', {
                            style: {
                                fontSize: '12px',
                                color: 'rgba(0,0,0,0.80)'
                            }
                        }, data.title)
                    ])

                ]);
            },
            share_to() {
                const toDir = this.$refs.dir_tree.getCheckedNodes();
                this.visible_share = false;
            },
            openFolder(row, column, event) {
                if (row.isFolder === 1 && !this.isNewFolder && column.property === 'name') {
                    this.tableData = [];
                    this.loading = true;
                    this.$store.commit('setParentId', row.id);
                    this.getFilesAndFolders(1);
                }
            },
            renderHeader_checkbox(h) {
                // 获取选中的ids
                const ids_selected = this.selected_files.map(item => item.id);
                return h('Checkbox', {
                    props: {
                        value: this.tableData.every(item => ids_selected.includes(item.id))
                    },
                    on: {
                        change: (val) => {
                            if (val) {
                                const temp = [];
                                this.tableData.forEach(item => {
                                    if (!ids_selected.includes(item.id)) {
                                        const { id } = item;
                                        temp.push({
                                            id
                                        });
                                        // 全选逻辑
                                        // 当点击全选的时候
                                    }
                                });
                                this.selected_files = this.selected_files.concat(temp);
                            } else {
                                this.selected_files = this.selected_files.filter(item => !ids_selected.includes(item.id));
                            }
                        }
                    }
                });
            },
            checkSingle(val, scope) {
                if (this.activeRouteNames[1] === 'cloud_push') {
                    // 单选:
                    if (val) {
                        console.log('you have just clicked', scope);
                        this.selected_files = [];
                        this.selected_files.push(scope.row);
                        this.$emit('getSelectedFile', this.selected_files[0]);
                    } else {
                        console.log('else');
                        this.selected_files = [];
                        this.$emit('getSelectedFile', {});
                    }
                } else {
                    // 多选
                    if (val) {
                        // console.log(scope.row);
                        // console.log(this.selected_files);
                        console.log('you have just clicked', scope);
                        // this.selected_files = [];
                        this.selected_files.push(scope.row);
                    } else {
                        // console.log(this.selected_files);
                        // console.log(scope.row);
                        console.log('else');
                        this.selected_files = this.selected_files.filter(item => { return item.id !== scope.row.id; });
                    }
                    this.$emit('getSelectedFile', this.selected_files);
                };
            },
            /** @author: 蔡一鸣
             *  @description: 将后台返回的扁平化数据转化成为树形数据
             *  @params {[type]} list 一维数组，数组中每一个元素需要包含id以及parentId
             *  @return {[type]} tree 多层级树状结构
             *  *  */
            buildTree(list) {
                const temp = {};
                const tree = {};
                for (const i in list) {
                    temp[list[i].id] = list[i];
                }
                for (const i in temp) {
                    if (temp[i].parentId) {
                        if (!temp[temp[i].parentId].children) {
                            temp[temp[i].parent_id].children = new Object();
                        }
                        temp[temp[i].parentId].children[temp[i].id] = temp[i];
                    } else {
                        tree[temp[i].id] = temp[i];
                    }
                }
                return tree;
            },
            getFilesAndFolders(flag) {
                if (flag === 1) {
                    this.curPage = 1;
                }
                util.ajax233({
                    url: `/${this.base}/pageByParentId`,
                    method: 'post',
                    data: {
                        pageNo: this.curPage,
                        pageSize: this.pageSize,
                        parentId: this.parentId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        const data = res.data.data.list;
                        const crumb = res.data.data.crumbs;
                        this.totalNum = res.data.data.total;
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);
                        if (data) {
                            data.forEach((item, index) => {
                                crumb.forEach((c, i) => {
                                    if (index === i) {
                                        this.$set(item, 'dir', `${c.filename}/${item.filename}`);
                                    }
                                });
                            });
                        }
                        this.tableData = data;
                        this.crumbs = crumb;
                        this.loading = false;
                        console.log('元数据', data);
                    }
                });
            },
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    this.getFilesAndFolders(0);
                }
            },
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                // util.ajaxJson({
                //     url: '/crm/userconfig/update',
                //     method: 'POST',
                //     data: {
                //         orgId: this.enterpriseId,
                //         userId: this.userId,
                //         key: this.base,
                //         value: pageSize.toString()
                //     }
                // }).then(res => {
                //     console.log('update的结果为', res.data);
                // }).catch((e) => {
                // });
                this.getFilesAndFolders(0);
            },
            getCrumb(base) {
                if (base === 'person') {
                    return '个人文件';
                } else if (base === 'company') {
                    return '公司文件';
                } else {
                    return '共享文件';
                }
            },
            redirectTo(num) {
                if (num === 0) {
                    this.$store.commit('setParentId', 0);
                    this.loading = true;
                    this.curPage = 1;
                    this.getFilesAndFolders(0);
                } else {
                    this.$store.commit('setParentId', this.crumbs[num].parentId);
                    this.loading = true;
                    this.curPage = 1;
                    this.getFilesAndFolders(0);
                }
            },
            /* 添加pageSize */
            addPageSize() {
                util.ajaxJson({
                    url: '/crm/userconfig/add',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: this.base,
                        value: this.pageSize.toString()
                    }
                }).then(res => {
                    console.log(res.data);
                });
            },
            /* 获取pageSize */
            getPageSize() {
                util.ajaxJson({
                    url: '/crm/userconfig/get',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: this.base
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        if (res.data.data.value === null) {
                            this.pageSize = 10;
                            this.addPageSize();
                        } else {
                            const size = parseInt(res.data.data.value);
                            this.pageSize = size;
                        }
                    } else {
                        this.pageSize = 10;
                    }
                    this.loading = true;
                    this.getFilesAndFolders(0);
                });
            }
        },
        created() {
            this.getFilesAndFolders(0);
        },
        watch: {
            afterShare(val) {
                if (val) {
                    console.error('预览组件分享后,重新获取页面数据');
                    // 刷新页面 重新获取数据
                    this.getFilesAndFolders(0);
                    // 阈值状态改为false
                    this.$store.commit('afterShare', false);
                };
            },
            selected_files(val) {
                // 如果选中的为空,则确定按钮不允许点击
                if (!this.selected_files.length) {
                    this.$emit('update:canClick', false);
                } else {
                    this.$emit('update:canClick', true);
                };
            },
            isNewFolder(val) {
                if (val) {
                    /** @author: 蔡一鸣
                     *  @description: 当点击新建文件夹按钮的时候 isNewFolder会置为true
                     *  此时在tableData头部添加一个对象。 这是因为在渲染时的逻辑为index为0切isNewFolder为true
                     *  显示input框， 加入flag标识符是为了方便后续定位到这个对象并删除 */
                    this.tableData.unshift({ type: 'directory', flag: 1 });
                } else {
                    console.log('isNewFolder is ', val);
                }
            },
            base(val) {
                /**
                 * 监听base 每当变化时 初始化 并且 重新请求接口 */
                if (val) {
                    console.log('base变化了', val);
                    // 置空选中的文件列表
                    this.selected_files = [];
                    this.$store.commit('setParentId', 0);
                    this.loading = true;
                    this.curPage = 1;
                    // this.getPageSize();
                    this.getFilesAndFolders(0);
                    // 初始化所有数据
                    // 重新请求
                }
            },
            isDeleteFlag: {
                handler(val) {
                    if (val) {
                        this.selected_files = [];
                        this.$store.state.crm.isDeleteFlag = false;
                    }
                },
                immediate: true
            }
        },
        filters: {
            fileSizeFilter(bytes) {
                const byte = parseInt(bytes);
                if (byte === 0) {
                    return '0 B';
                }
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
                const i = Math.floor(Math.log(byte) / Math.log(k));
                return `${(byte / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
            }
        }
    };
</script>

<style scoped lang="less">
    .dataBase-table-page {
        .dataBase_crumb_container {
            .dataBase_crumb {
                font-size: 12px;
                .level {
                    color: #3B78DE;
                    &:hover {
                        color: #2D63BC;
                        text-decoration: underline;
                    }
                }
            }
            .dataBase_crumb_single {
                font-size: 12px;
            }
        }
        .table-multiple-operate-btns{
            margin-left: 30px;
        }
        .table {
            .el-table {
                .cell {
                    display: flex !important;
                }
            }
            .dataBase-file-name {
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0,0,0,0.80);
                letter-spacing: 0;
                line-height: 18px;
                margin-left: 9px;
                position: relative;
                bottom: 4px;
                cursor: default;
                .file_is_dealing {
                    color: #EA4335 ;
                    font-size: 12px;
                }
            }
        }
    }
    .file-name:hover{
        color: #436EF6!important;
        cursor: pointer;
    }
</style>
<style lang="less">
    .dataBase-table-dropdownItem {
        line-height: 30px !important;
        font-size: 12px;
        color: rgba(0,0,0,0.80);
        letter-spacing: 0;
    }
    .dataBase-modal-table {
        font-size: 12px !important;
        height: 336px !important;
        table {
            width: 600px !important;
        }
        tr {
            height: 44px !important;
        }
        .el-table-row {
            height: 44px !important;
        }
        .el-table__body {
            td {
                padding-top: 0px !important;
                padding-bottom: 0px !important;
                .cell {
                    line-height: 21px !important;
                    padding-left: 0px !important;
                }
            }
        }
        .el-checkbox__inner {
            border-radius: 2px !important;
        }
    }
</style>
