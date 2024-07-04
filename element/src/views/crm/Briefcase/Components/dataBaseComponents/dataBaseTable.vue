<template>
    <div class="dataBase-table-page" v-if="authorized_button[`${base}`]['look']">
        <div>
            <div>
                <div style="margin-left: 30px" class="dataBase_crumb_container" v-if="!selected_files.length">
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
                <!-- 操作栏 -->
                <div class="table-top-container" v-if="selected_files.length">
                    <!-- 删除操作试图 -->
                    <template>
                        <div class="table-multiple-operate-btns"
                             style="display: inline-block; color: rgba(0, 0, 0, .8); margin-bottom: -15px">
                            {{ $t('crm.Table.selected') }}
                            <span style="font-weight: bolder; color: #4285F4">{{selected_files.length}}</span>
                            {{selected_files.length > 1 ? $t('crm.Table.item_inquiries') : $t('crm.Table.item_inquiry') }}
                            <Button type="text"
                                    size="small"
                                    icon="custom custom-delete-new"
                                    v-if="authorized_button[`${base}`]['delete']"
                                    @click="handleDelete(selected_files)">
                                <span style="color: rgba(0,0,0,0.80);font-size: 12px">{{$t('crm.Modal.operate_delete')}}</span>
                            </Button>
                        </div>
                    </template>

                    <!-- 正常试图 -->
                </div>
            </div>
            <div class="table" style="position: absolute">
                <Table :data="tableData"
                       :height="table_height"
                       v-loading="loading"
                       highlight-current-row
                       ref="table"
                       size="medium"
                       @row-click="openFolder"
                       @cell-click="filePreview"
                       @cell-mouse-enter="showOperate"
                       @cell-mouse-leave="hideOperate"
                       class="tabmain noBoxShadow-right noborder-table"
                       v-if="flag_refreshColumn" >
                    <!-- 首列 checkbox -->
                    <TableColumn fixed="left"
                                 width="80"
                                 align="center"
                                 :render-header="renderHeader_checkbox"
                                 class-name="no-padding-cell">
                        <template slot-scope="scope">
                            <Checkbox @change="checkSingle($event, scope)"
                                      :value="selected_files.find(item => item.id === scope.row.id) !== undefined"
                                      @click.native.stop
                                      :disabled="scope.row.isFolder === 1 && scope.row.type==='directory'">
                            </Checkbox>
                        </template>
                    </TableColumn>
                    <!-- 正常列 -->
                    <!-- 文件名称列 -->
                    <TableColumn prop="name"
                                 :label="$t('material.New.name')"
                                 width="450"
                                 :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template v-if="scope.$index === 0 && isNewFolder">
                                <svg class="svg-icon" aria-hidden="true" v-if="scope.row.isFolder === 1" style="width: 24px; height: 24px">
                                    <use xlink:href="#custom-fp-paper-file"></use>
                                </svg>
                                <Input v-model="newFolderInput" style="width: 297.5px; margin-left: 9px;font-size: 12px"></Input>
                                <Icon custom="custom-confirm" style="width: 13px; height: 10px;margin-left: 22.5px;margin-right: 12.8px" @click="handleNewFolder" v-if="!dealingNewFolder"></Icon>
                                <Icon custom="custom-delete1" style="width: 10.5px;height: 10.5px" @click="handleNewFolderClose" v-if="!dealingNewFolder"></Icon>
                                <i class="el-icon-loading" v-if="dealingNewFolder"></i>
                            </template>
                            <template v-else>
                                <!--  {(scope.row.size>'26214400'&&scope.row.suffix!=='ppt')&&(scope.row.size>'26214400'&&scope.row.suffix!=='pptx')&&(scope.row.size>'26214400'&&scope.row.suffix!=='xlsx')&&(scope.row.size>'26214400'&&scope.row.suffix!=='xls')} -->
                              <!-- <div class="_f _r _a_c"
                                :class="(scope.row.isFolder!==1&&scope.row.size!=='0')&&scope.row.suffix!=='csv'?'dataBase-file':scope.row.size>'26214400'&&scope.row.suffix!=='ppt'?'':''"
                                style="height:24px"> -->
                              <div class="_f _r _a_c"
                                :class="{'dataBase-file':dataBaseFileStyle(scope.row)}"
                                style="height:24px">
                                <fileNameIcon :iconName="scope.row.suffix" :isFolder="Boolean(scope.row.isFolder)"></fileNameIcon>
                                <!-- 文件 -->
                                <span v-if="scope.row.isFolder===0" class="dataBase-file-name">{{scope.row.filename}}</span>
                                <!-- 文件夹 -->
                                <span v-if="scope.row.isFolder===1" class="dataBase-file-name">{{scope.row.filename}}</span>
                              </div>
                            </template>
                        </template>
                    </TableColumn>
                    <!-- 文件位置列 -->
                    <TableColumn prop="dir"
                                 :label="$t('material.New.fileLocation')"
                                 width="175">
                        <template slot-scope="scope">
                            <Tooltip :content="scope.row.dir" placement="top">
                                <Icon custom="custom-wenjianweizhi" size="16"></Icon>
                            </Tooltip>
                        </template>
                    </TableColumn>
                    <!-- 最近使用列 -->
                    <TableColumn prop="latestTime"
                                 :label="$t('material.New.recentlyUse')"
                                 width="182">
                        <template slot-scope="scope">
                            <span>{{scope.row.operateTime}}</span>
                        </template>
                    </TableColumn>
                    <!-- 文件大小列 -->
                    <TableColumn prop="size"
                                 :label="$t('material.New.size')"
                                 width="193">
                        <template slot-scope="scope">
                            <span v-if="scope.row.isFolder!==1">{{scope.row.size | fileSizeFilter}}</span>
                            <span v-else>--</span>
                        </template>
                    </TableColumn>
                    <!-- 末列操作配置按钮 -->
                    <TableColumn>
                        <template slot-scope="scope" v-if="!scope.row.flag">
                            <Dropdown trigger="click" placement="bottom-start" class="dataBase-table-dropdown" v-if="scope.row.isFolder === 1" :style="{visibility: ((authorized_button[`${base}`]['change_name'] || authorized_button[`${base}`]['delete'] ) && !(scope.$index === 0 && isNewFolder)) ? 'visible' : 'hidden'}">
                                <Icon custom="custom-more-dot" style="transform: rotate(90deg)"></Icon>
                                <DropdownMenu slot="dropdown" class="database-dropdown-menu" >
                                    <DropdownItem class="dataBase-table-dropdownItem file_rename" @click.native="handleRename(scope.row)" v-if="authorized_button[`${base}`]['change_name']">{{$t('material.New.rename')}}</DropdownItem>
                                    <DropdownItem class="dataBase-table-dropdownItem " @click.native="handleDelete(scope.row)" v-if="authorized_button[`${base}`]['delete']">{{$t('material.New.delete')}}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Dropdown trigger="click" placement="bottom-start" class="dataBase-table-dropdown" v-else :style="{visibility: ((authorized_button[`${base}`]['download'] || authorized_button[`${base}`]['share_file'] || authorized_button[`${base}`]['change_name'] || authorized_button[`${base}`]['delete'])) ? 'visible' : 'hidden'}">
                                <Icon custom="custom-more-dot" style="transform: rotate(90deg)"></Icon>
                                <DropdownMenu slot="dropdown" class="database-dropdown-menu">
                                    <DropdownItem class="dataBase-table-dropdownItem file_download" v-if="scope.row.isFolder !== 1 && authorized_button[`${base}`]['download']" @click.native="handleDownload(scope.row)" >下载</DropdownItem>
                                    <DropdownItem class="dataBase-table-dropdownItem file_share" @click.native="handleShare(scope.row)" v-if="scope.row.isFolder !== 1 && base !== 'share' && authorized_button[`${base}`]['share_file']">共享</DropdownItem>
                                    <DropdownItem class="dataBase-table-dropdownItem file_rename" @click.native="handleRename(scope.row)" v-if="authorized_button[`${base}`]['change_name']">{{$t('material.New.rename')}}</DropdownItem>
                                    <DropdownItem class="dataBase-table-dropdownItem " @click.native="handleDelete(scope.row)" v-if="authorized_button[`${base}`]['delete']">{{$t('material.New.delete')}}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </template>
                    </TableColumn>
                </Table>
                <div style="margin-right: 30px; overflow: hidden">
                    <Page :page-size="pageSize"
                          :page-sizes="pageSizeOpts"
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
                       :close-on-click-modal="false"
                       title="共享"
                       width="540px">
                    <Tabs v-model="activeDirName">
                        <TabPane label="共享文件" name="sharingFile">
                            <IviewTree show-checkbox
                                       :data="tree_data"
                                       ref="dir_tree"
                                       :render="renderContent"
                                       :props="defaultProps"
                                       :multiple="false"
                                       :check-strictly="true"
                                       @on-check-change="treeChange">
                            </IviewTree>
                        </TabPane>
                    </Tabs>
                    <div slot="footer">
                        <Button @click="visible_share=false">{{$t('material.Btn.cancel')}}</Button>
                        <Button type="primary" :disabled="isShare" @click="share_to">{{$t('material.Btn.confirm')}}</Button>
                    </div>
                </Modal>
                <Modal :visible.sync="visible_rename"
                       :modal="false"
                       :title="$t('material.New.rename')"
                       :close-on-click-modal="false"
                       width="451px">
                    <Input v-model="oldFileName"></Input>
                    <div slot="footer">
                        <Button @click="visible_rename=false">{{$t('material.Btn.cancel')}}</Button>
                        <Button type="primary" @click="RenameConfirm" :disabled="!oldFileName">{{$t('material.Btn.confirm')}}</Button>
                    </div>
                </Modal>
                <Modal :visible.sync="visible_delete"
                       :modal="false"
                       width="451px"
                       :close-on-click-modal="false"
                       title="提示">
                    <div>
                        <p>确认要永久删除吗？</p>
                        <p>如文件已分享会导致无法访问，请谨慎操作！</p>
                    </div>
                    <div slot="footer">
                        <Button @click="visible_delete=false">{{$t('material.Btn.cancel')}}</Button>
                        <Button type="primary" @click="delete_confirm" class="file_delete">{{$t('material.Btn.confirm')}}</Button>
                    </div>
                </Modal>
                <Modal :visible.sync="visible_delete_dir_not_empty"
                       :modal="false"
                       :close-on-click-modal="false"
                       title="提示">
                    <div>
                        <p>文件夹  {{folder_not_empty}}  含有文件 不可删除。</p>
                    </div>
                    <div slot="footer">
                        <Button type="primary" @click="visible_delete_dir_not_empty=false">{{$t('material.Btn.confirm')}}</Button>
                        <Button @click="visible_delete_dir_not_empty=false">{{$t('material.Btn.cancel')}}</Button>
                    </div>
                </Modal>
                        <Modal :visible.sync="visible_cover"
                               :modal="false"
                               :close-on-click-modal="false"
                               title="提示">
                            <div>
                                <p>文件已存在，是否覆盖？</p>
                            </div>
                            <div slot="footer">
                                <Button type="primary" :disabled="isNameExist" @click="share_cover_confirm">{{$t('material.Btn.confirm')}}</Button>
                                <Button @click="visible_cover=false">{{$t('material.Btn.cancel')}}</Button>
                            </div>
                        </Modal>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    // import url from '../../../../../../build/url';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    // import env from '../../../../../../build/env';
    import { mapState } from 'vuex';
    const { VUE_APP_API_URL } = process.env;
    export default {
        name: 'dataBaseTable',
        computed: {
            table_height() {
                let temp = this.window_height ? this.window_height - 200 : document.body.clientHeight - 200;
                if (temp < 200) {
                    temp = 200;
                }
                // 转 element-ui 时, 表格样式错误, 加上这句后解决, 具体错误原因暂时未看
                temp += this.loading ? 1 : 0;
                return temp;
            },
            ...mapState({
                afterShare: 'afterShare', // 组件分享后,调用一次页面的方法
                parentId: state => state.crm.parentId,
                button_list: state => state.app.button_list,
                menuList: state => state.app.menu_list,
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName
            }),
            authorized_button() {
                const buttonIds = BUTTON_IDS.CRM.database;
                return {
                    person: {
                        disk: true, // !HANDLE_BUTTON(buttonIds.person_disk.id, this.menuList),
                        create_folder: true, // !HANDLE_BUTTON(buttonIds.person_disk.create_folder, this.button_list),
                        upload_file: true, // !HANDLE_BUTTON(buttonIds.person_disk.upload_file, this.button_list),
                        change_name: true, // !HANDLE_BUTTON(buttonIds.person_disk.change_name, this.button_list),
                        share_file: true, // !HANDLE_BUTTON(buttonIds.person_disk.share_file, this.button_list),
                        delete: true, // !HANDLE_BUTTON(buttonIds.person_disk.delete, this.button_list),
                        look: true, // !HANDLE_BUTTON(buttonIds.person_disk.look, this.button_list),
                        download: true // !HANDLE_BUTTON(buttonIds.person_disk.download, this.button_list)
                    },
                    company: {
                        disk: true, // !HANDLE_BUTTON(buttonIds.company_disk.id, this.menuList),
                        create_folder: true, // !HANDLE_BUTTON(buttonIds.company_disk.create_folder, this.button_list),
                        upload_file: true, // !HANDLE_BUTTON(buttonIds.company_disk.upload_file, this.button_list),
                        change_name: true, // !HANDLE_BUTTON(buttonIds.company_disk.change_name, this.button_list),
                        share_file: true, // !HANDLE_BUTTON(buttonIds.company_disk.share_file, this.button_list),
                        delete: true, // !HANDLE_BUTTON(buttonIds.company_disk.delete, this.button_list),
                        look: true, // !HANDLE_BUTTON(buttonIds.company_disk.look, this.button_list),
                        download: true // !HANDLE_BUTTON(buttonIds.company_disk.download, this.button_list)
                    },
                    share: {
                        disk: true, // !HANDLE_BUTTON(buttonIds.share_disk.id, this.menuList),
                        create_folder: true, // !HANDLE_BUTTON(buttonIds.share_disk.create_folder, this.button_list),
                        upload_file: true, // !HANDLE_BUTTON(buttonIds.share_disk.upload_file, this.button_list),
                        change_name: true, // !HANDLE_BUTTON(buttonIds.share_disk.change_name, this.button_list),
                        delete: true, // !HANDLE_BUTTON(buttonIds.share_disk.delete, this.button_list),
                        look: true, // !HANDLE_BUTTON(buttonIds.share_disk.look, this.button_list),
                        download: true // !HANDLE_BUTTON(buttonIds.share_disk.download, this.button_list)
                    }
                };
            }

        },
        props: {
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
            },
            isRefreshPage: {
                type: Boolean,
                default: false
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
        },
        data() {
            return {
                isNameExist: false, // 文件名字会重复时 控制按钮是否能点击的阈值
                isShare: false, // 控制分享按钮是否能点击的阈值
                tableData: [], // 表格数据
                loading: true, // 加载图标
                currentColumns: [], // 表格列名称
                allColumns: [], // 表格全部列
                flag_refreshColumn: true, // 使用v-if刷新列表列顺序
                isShowTopBar: false, // 是否显示顶部操作栏
                newFolderInput: '', // 新建文件夹的名称
                selected_files: [], // 选中的文件或者文件夹
                /* 操作弹窗控制 */
                // 共享弹窗
                visible_share: false, // 控制共享弹窗
                activeDirName: 'sharingFile', // 默认为共享文件
                tree_data: [
                ], // 共享文件中文件夹的树形数据
                // 重命名弹窗
                visible_rename: false, // 控制重命名弹窗
                oldFileName: '', // 文件或文件夹之前的名称
                olderFileName: '',
                newFileName: '', // 文件或文件夹重命名之后的名称
                // 删除弹窗
                visible_delete: false, // 控制删除弹窗
                visible_delete_dir_not_empty: false, // 控制删除非空文件夹
                folder_not_empty: '', // 非空不能删除的文件夹
                // visible
                deleteFileId: '', // 要删除的ID
                deleteFileName: '', // 要删除的文件名称
                // 分页
                totalNum: 0,
                curPage: 1,
                pageSize: 20,
                maxPageNum: 1,
                pageSizeOpts: [10, 20, 50],
                // 控制文件夹
                // 控制重命名
                fileId: null,
                ids: [],
                defaultProps: {
                    children: 'children',
                    label: 'filename'
                },
                crumbs: [], // 导航
                shareFileName: '', // 分享的域名
                visible_cover: false,
                toId: null,
                deleteAllFlag: false,
                dealingNewFolder: false,
                fileList: [] // 文件上传列表
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
            handleNewFolder() {
                if (this.newFolderInput === '') {
                    this.$Message.warning('请输入文件夹名称');
                    return;
                }
                // 调用接口
                this.dealingNewFolder = true;
                util.ajax233({
                    url: `/${this.base}/createFolder`,
                    method: 'post',
                    data: {
                        filename: this.newFolderInput,
                        parentId: this.parentId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.$emit('updateIsNewFolder', false);
                        this.getFilesAndFolders(0);
                        this.dealingNewFolder = false;
                        // 刷新页面 并把 isNewFolder置为false
                        // 重新调用getfileandFolder的方法
                    } else {
                        this.dealingNewFolder = false;
                        this.$Message.error(res.data.message);
                    }
                });
            },
            handleNewFolderClose() {
                // 去掉tableData中flag为1的对象
                this.tableData.forEach((item, index) => {
                    if (item.isFolder === 1 && item.type === 'directory') {
                        this.$emit('updateIsNewFolder', false);
                        this.tableData.splice(index, 1);
                    }
                });
                this.getFilesAndFolders(0);
            },
            handleShare(data) {
                this.isShare = false;
                this.isNameExist = false;
                this.fileId = data.id;
                this.shareFileName = data.filename;
                this.getAllFolders();
                this.visible_share = true;
            },
            // 处理重命名逻辑
            handleRename(data) {
                const tempStr = data.filename;
                if (data.isFolder === 1) {
                    this.oldFileName = data.filename;
                    this.olderFileName = data.filename;
                } else {
                    if (tempStr.lastIndexOf('.') !== -1) {
                        this.oldFileName = tempStr.substring(0, tempStr.lastIndexOf('.'));
                        this.olderFileName = tempStr.substring(0, tempStr.lastIndexOf('.'));
                    } else {
                        this.oldFileName = tempStr;
                        this.olderFileName = tempStr;
                    }
                }
                this.fileId = data.id;
                this.visible_rename = true;
            },
            RenameConfirm() {
                // 首先验证文件是否重名
                // 如果重名 继续接口
                if (this.oldFileName === '') {
                    this.$Message.warning('文件名称不能为空');
                    return;
                }
                if (this.oldFileName === this.olderFileName) {
                    this.visible_rename = false;
                    return;
                }
                util.ajax233({
                    url: `/${this.base}/changeName`,
                    method: 'post',
                    data: {
                        filename: this.oldFileName,
                        id: this.fileId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        // 关闭弹窗
                        this.visible_rename = false;
                        // 刷新页面
                        this.getFilesAndFolders(0);
                    } else {
                        this.$Message.error(res.data.message);
                        // 关闭弹窗
                        this.visible_rename = false;
                        // 刷新页面
                        this.getFilesAndFolders(0);
                    }
                });
                this.visible_rename = false;
            },
            // 处理删除逻辑
            handleDelete(data) {
                // 处理 新建文件夹的情况
                this.$emit('updateIsNewFolder', false);
                // 判断data是否是数组 还是一个单独的对象
                let tempData = [];
                const flag = Array.isArray(data);
                if (!flag) {
                    tempData.push(data);
                } else {
                    tempData = data;
                }
                // 判断tempData中是否有文件夹
                /**
                 * 1.有文件夹且文件夹中内容不为空
                 * 2.全是文件 没有文件夹
                 * 3. 有文件夹 且 全为空 */
                const tempIds = [];
                tempData.forEach(item => {
                    tempIds.push(item.id);
                });
                /**
                 * 增加判断 如果删除的是一页的全部数据 应该回到上一页
                 * 且 curPage不为1
                 * 且不再新建文件夹的状态 */
                const allFlag = this.tableData.every(item => {
                    return tempIds.indexOf(item.id) !== -1;
                });
                this.deleteAllFlag = allFlag;
                this.ids = tempIds;
                this.visible_delete = true;
            },
            delete_confirm() {
                util.ajax233({
                    url: `/${this.base}/delete`,
                    method: 'post',
                    data: {
                        ids: this.ids
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        // 刷新页面
                        if (this.deleteAllFlag && this.curPage > 1) {
                            this.curPage = this.curPage - 1;
                        }
                        this.getFilesAndFolders(0);
                        this.selected_files = [];
                    } else if (res.data.code === '-20062') {
                        this.visible_delete_dir_not_empty = true;
                        this.folder_not_empty = res.data.data;
                        this.selected_files = [];
                    } else {
                        this.$Message.error(res.data.message);
                        this.selected_files = [];
                    }
                });
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
                        }, data.filename)
                    ])

                ]);
            },
            async share_to() {
                const toDir = this.$refs.dir_tree.getCheckedNodes();
                if (!toDir.length) {
                    this.$Message.warning('请先选择要分享的文件夹');
                    return;
                }
                this.toId = toDir[0].id;
                util.ajax233({
                    url: '/share/existFilename',
                    method: 'post',
                    data: {
                        filename: this.shareFileName,
                        isFolder: 0,
                        parentId: toDir[0].id
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        // 存在
                        // 覆盖弹窗出现
                        this.visible_cover = true;
                        this.visible_share = false;
                        // 刷新页面 重新获取数据
                    } else {
                        this.isShare = true;
                        util.ajax233({
                            url: `/${this.base}/shareFile`,
                            method: 'post',
                            data: {
                                fromId: this.fileId,
                                toId: this.toId
                            }
                        }).then(res => {
                            if (res.data.code === '1') {
                                this.$Message.success('分享成功');
                                // 刷新页面 重新获取数据
                                this.getFilesAndFolders(0);
                            } else {
                                this.$Message.error(res.data.message);
                            }
                        });
                        this.visible_share = false;
                    }
                });
            },
            share_cover_confirm() {
                this.isNameExist = true;
                util.ajax233({
                    url: `/${this.base}/shareFile`,
                    method: 'post',
                    data: {
                        fromId: this.fileId,
                        toId: this.toId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.$Message.success('分享成功');
                        this.getFilesAndFolders(0);
                    } else {
                        this.$Message.error(res.data.message);
                    }
                });
                this.visible_cover = false;
            },
            // 文件预览
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
            openFolder(row, column, event) {
                // 判断column.property 是否为name 从而判断是否点击在某一行上
                if (row.isFolder === 1 && column.property === 'name' && row.type !== 'directory') {
                    // 取消新建文件夹状态
                    this.$emit('updateIsNewFolder', false);
                    /**
                     * 当点击文件夹的时候首先 1. 将文件数据tableData置空
                     * 2. 将parentId置为当前文件夹的id并请求接口
                     * 3. loading */
                    this.tableData = [];
                    this.loading = true;
                    // this.parentId = row.id;
                    this.$store.commit('setParentId', row.id);
                    this.getFilesAndFolders(1);
                }
            },
            renderHeader_checkbox(h) {
                // 获取选中的ids
                const ids_selected = this.selected_files.map(item => item.id);
                const temp = this.$deepClone(this.tableData);
                if (temp) {
                    temp.forEach((item, index) => {
                        if (item.type === 'directory') {
                            temp.splice(index, 1);
                        }
                    });
                }
                if (temp !== null && this.isNewFolder && temp.length === 0) {
                    return h('Checkbox', {
                        props: {
                            value: false
                        },
                        on: {
                            change: (val) => {
                                if (val) {
                                    const temp = [];
                                    this.tableData.forEach(item => {
                                        if ((!ids_selected.includes(item.id)) && item.id) {
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
                } else {
                    return h('Checkbox', {
                        props: {
                            value: temp ? temp.every(item => ids_selected.includes(item.id)) : ''
                        },
                        on: {
                            change: (val) => {
                                if (val) {
                                    const temp = [];
                                    this.tableData.forEach(item => {
                                        if ((!ids_selected.includes(item.id)) && item.id) {
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
                }
            },
            checkSingle(val, scope) {
                if (val) {
                    const { id } = scope.row;
                    this.selected_files.push({
                        id
                    });
                } else {
                    this.selected_files = this.selected_files.filter(item => item.id !== scope.row.id);
                }
            },
            /** @author: 蔡一鸣
             *  @description: 将后台返回的扁平化数据转化成为树形数据
             *  @params {[type]} list 一维数组，数组中每一个元素需要包含id以及parentId
             *  @return {[type]} tree 多层级树状结构
             *  *  */
            buildTree(array, id, parentId) {
                // 创建临时对象
                const temp = {};
                // 创建需要返回的树形对象
                const tree = {};
                for (let i = 0; i < array.length; i++) {
                    temp[array[i][id]] = array[i];
                }
                for (const i in temp) {
                    if (temp[i][parentId] !== 0) {
                        if (!temp[temp[i][parentId]].children) {
                            temp[temp[i][parentId]].children = new Array();
                        }
                        temp[temp[i][parentId]].children.push(temp[i]);
                    } else {
                        tree[temp[i][id]] = temp[i];
                    }
                }
                return tree;
            },
            getFilesAndFolders(flag) {
                /** @description: flag: 0 ---表示是在本页面  1-----表示是要进入文件夹
                 * 当进入文件夹的时候 需要吧this.curPage 置为 1以防止进入子文件夹的时候 获取的是其他页面的数据 */
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
                        if (crumb.length && data) {
                            data.forEach((item, index) => {
                                const len = crumb.length;
                                if (len === 1) {
                                    this.$set(item, 'dir', `${crumb[0].filename}/${item.filename}`);
                                } else if (len === 2) {
                                    this.$set(item, 'dir', `${crumb[0].filename}/${crumb[1].filename}/${item.filename}`);
                                } else if (len === 3) {
                                    this.$set(item, 'dir', `${crumb[0].filename}/${crumb[1].filename}/${crumb[2].filename}/${item.filename}`);
                                }
                            });
                        } else {
                            if (data) {
                                data.forEach(item => {
                                    this.$set(item, 'dir', `${this.getCrumb(this.base)}/${item.filename}`);
                                });
                            }
                        }
                        this.tableData = data;
                        this.crumbs = crumb;
                        this.loading = false;
                        this.flag_refreshColumn = false;
                        this.$nextTick(() => {
                            this.flag_refreshColumn = true;
                        });
                    }
                });
            },
            handleDownload(data) {
                // 根据环境切换 切换线上地址
                const domain = `${util.ajaxUrl}/cloudshare`;
                // if (env === 'production') {
                //     domain = url.productionUrlMKT;
                // } else {
                //     domain = url.developmentMKT;
                // }

                // // 判断是否为txadmin测试环境
                // if (origin.indexOf('txadmin') > -1 ) {
                //     domain = url.testUrlMKT;
                // }

                // 发送请求
                util.axios.get(`${domain}/${this.base}/getDownloadUrl?id=${data.id}`).then(({ data }) => {
                    if (data.code === '1' && data.data && data.data.url) {

                        // 导出
                        window.open(data.data.url, '_blank');

                        setTimeout(() => {
                            this.getFilesAndFolders(0);
                        }, 2000);
                    } else {
                        this.$Message.error(this.$t('crm.Html.errorOccurred'));
                    }
                }).catch(error => {
                    console.error(error);
                    this.$Message.error(this.$t('crm.Html.errorOccurred'));
                });
            },
            getAllFolders() {
                util.ajax233({
                    url: '/share/findAllFolder',
                    method: 'post'
                }).then(res => {
                    if (res.data.code === '1') {
                        const data = res.data.data;
                        const treeData = this.buildTree(data, 'id', 'parentId');
                        this.tree_data = Object.values(treeData);
                    } else {
                        this.$Message.error('获取文件夹失败请重试');
                    }
                });
            },
            // 改变页码
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    this.selected_files = [];
                    this.getFilesAndFolders(0);
                }
            },
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                // 英科一期不记住页码
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
                this.$emit('updateIsNewFolder', false);
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
            showOperate(row, column, cell, event) {
            },
            hideOperate(row, column, cell, event) {
            },
            treeChange(arr, obj) {
                if (arr.length === 0) {
                    obj.checked = false;
                } else {
                    arr.forEach(item => {
                        item.checked = false;
                    });
                    obj.checked = true;
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
                    this.getFilesAndFolders(0);
                });
            }
        },
        created() {
            this.getFilesAndFolders(0);
            // this.getPageSize(); 英科一期需求不记住页码
            this.getAllFolders();
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
            isNewFolder(val) {
                if (val) {
                    /** @author: 蔡一鸣
                     *  @description: 当点击新建文件夹按钮的时候 isNewFolder会置为true
                     *  此时在tableData头部添加一个对象。 这是因为在渲染时的逻辑为index为0切isNewFolder为true
                     *  显示input框， 加入flag标识符是为了方便后续定位到这个对象并删除 */
                    this.newFolderInput = '';
                    if (this.tableData) {
                        this.tableData.unshift({ type: 'directory', isFolder: 1 });
                    } else {
                        this.tableData = new Array();
                        this.tableData.unshift({ type: 'directory', isFolder: 1 });
                    }
                } else {
                    this.tableData.forEach((item, index) => {
                        if (item.isFolder === 1 && item.type === 'directory') {
                            this.tableData.splice(index, 1);
                        }
                    });
                }
            },
            base(val) {
                /**
                 * 监听base 每当变化时 初始化 并且 重新请求接口 */
                if (val) {
                    // 初始化所有数据
                    this.$store.commit('setParentId', 0);
                    this.loading = true;
                    this.curPage = 1;
                    this.selected_files = [];
                    this.pageSize = 20;
                    this.getFilesAndFolders(0);
                    // this.getPageSize();
                    this.$emit('updateIsNewFolder', false);
                    this.$emit('updateLeavePageFlag', false);
                    // 重新请求
                }
            },
            isRefreshPage(val) {
                if (val) {
                    this.loading = true;
                    this.curPage = 1;
                    this.getFilesAndFolders(0);
                    this.$emit('update:isRefreshPage', false);
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .dataBase-table-page {
        .table-top-container {
            font-size: 12px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            margin-bottom: 0 !important;
            height: 25px !important;
            line-height: 0 !important;
        }
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
            .custom-new-delete {
                vertical-align: initial !important;
                color: #677f99 !important;
            }
        }
        .table {
            .el-table {
                .cell {
                    display: flex !important;
                }
            }
            .dataBase-file-name {
                overflow: hidden;/** 文字太长 图标不见了 */
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0,0,0,0.80);
                letter-spacing: 0;
                margin-left: 9px;
                position: relative;
            }
            .dataBase-file:hover{
                .dataBase-file-name{
                    color: #3B78DE!important;
                }
                cursor: pointer;
            }
        }
    }
</style>
<style lang="less">
    .dataBase-table-dropdownItem {
        line-height: 30px !important;
        font-size: 12px;
        color: rgba(0,0,0,0.80);
        letter-spacing: 0;
    }
    .database-dropdown-menu {
        /*top: 215px !important;*/
    }
    .dataBase-table-page {
        .table-top-container {
            .table-multiple-operate-btns{
                margin-left: 30px;
                i {
                    vertical-align: initial !important;
                    color: #677f99 !important;
                }
            }
        }
        .el-table tr {
            height: 44px !important;
        }
        .el-table__row {
            height: 44px !important;
        }
        .el-table__body {
            td {
                padding-top: 0px !important;
                padding-bottom: 0px !important;
                .cell {
                    line-height: 21px !important;
                }
            }
        }
    }
</style>
