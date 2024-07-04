<template>
    <Modal :visible="visible"
           :modal="false"
           :append-to-body="false"
           :show-close="true"
           class="data_base_modal"
           :title="$t('material.New.selectFile')"
           width="720px"
           @close="cancelFileSelected" >
        <div class="data_base_container">
            <div v-if="isShowTip" :style="{'top': tipTop,left: tipLeft}" style="font-size: 12px;color: #666666;position: absolute;max-width: 540px;">
                {{$t('BriefCase.onlySupportsDownloadingFiles')}}
            </div>
            <!--   tabs        -->
            <Tabs v-model="activeTab"
                  @tab-click="handleTabClick"
                  class="data_base_tabs">
                <TabPane :label="$t('BriefCase.DataBase.personalFiles')" name="person" v-if="authorized_button['person']['disk']"></TabPane>
                <TabPane :label="$t('BriefCase.DataBase.companyFiles')" name="company" v-if="authorized_button['company']['disk']"></TabPane>
                <TabPane :label="$t('BriefCase.DataBase.sharedFiles')" name="share" v-if="authorized_button['share']['disk']"></TabPane>
            </Tabs>
            <!--  表格区域  -->
            <dataBaseModalTable :base="activeTab"
                                :canClick.sync="canClick"
                                @getSelectedFile="getSelectedFile">
            </dataBaseModalTable>
            <div slot="footer" style="text-align:right;margin-top: 10px;">
                <Button @click="cancelFileSelected">{{$t('material.Btn.cancel')}}</Button>
                <Button :class="addLibraryFile === 'showDataBaseModel'?'piwik_smart_material_button':''" type="primary" :disabled="!canClick" @click="confirmFileSelected">{{$t('material.Btn.confirm')}}</Button>
            </div>
        </div>
    </Modal>
</template>

<script>
    import dataBaseModalTable from './dataBaseModalTable';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState } from 'vuex';
    export default {
        name: 'dataBaseModal',
        components: {
            dataBaseModalTable
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                qiniuHttp: 'qiniuHttp',
                parentId: state => state.crm.parentId,
                button_list: state => state.app.button_list,
                lang: state => state.app.lang,
                menuList: state => state.app.menu_list
            }),
            authorized_button() {
                const buttonIds = BUTTON_IDS.CRM.database;
                return {
                    person: {
                        disk: true // !HANDLE_BUTTON(buttonIds.person_disk.id, this.menuList)
                    },
                    company: {
                        disk: true // !HANDLE_BUTTON(buttonIds.company_disk.id, this.menuList)
                    },
                    share: {
                        disk: true // !HANDLE_BUTTON(buttonIds.share_disk.id, this.menuList)
                    }
                };
            },
            // 文件夹和智能物料-添加文件
            isShowTip() {
                return this.onlyDownload;
            },
            // 文件夹和智能物料-left
            tipLeft() {
                return this.lang === 'zh-CN' ? '110px' : '135px';
            },
            // 文件夹和智能物料-添加文件
            tipTop() {
                return this.onlyDownload === 'writeMail' ? '25px' : '';
            }
        },
        props: [
            'onlyDownload',
            'visible',
            'addLibraryFile',
            'changeOnlyDownload',
            'handleAddDataBaseFile'
        ],
        data() {
            return {
                activeTab: 'person',
                canClick: false, // 控制弹窗'确定按钮'的阈值
                FileInfo: null // 选中的文件列表
            };
        },
        created() {
            this.init();
            // 弹窗时默认选中第一个
            this.handleTabClick(this.activeTab);
        },
        methods: {
            handleTabClick(tab, event) {
                const tabName = tab.name || tab;
                this.$store.commit('currentFolderLabel', tabName);
            },
            getSelectedFile(data) {
                // 传过来的为数组,直接赋值
                this.FileInfo = data;
            },
            confirmFileSelected() {
                this.$emit('getFile', this.FileInfo);
                this.$emit('changeOnlyDownload', '');
                this.$emit('update:visible', false);
                this.$emit('activeTab', this.activeTab);
                if (this.addLibraryFile === 'showDataBaseModel') {
                    // 调用写邮件页面的插入数据到邮件内容的函数
                    this.$emit('handleAddDataBaseFile', this.FileInfo, this.activeTab);
                    this.$emit('update:addLibraryFile', '');
                    return;
                };
                /**
                 * @Description: 涉及功能点：邮件管理--写信页面支持从资料库选取文件上传；
                 *              ！！！重要！！！：由于当前资料库弹窗仅支持单选，因此getDataBaseFile传参时手动将this.FileInfo包装为数组；
                 *              倘若之后资料库有需求更改为支持多选，相应开发人员，此处记得修改getDataBaseFile的参数为数组
                 * @author 杨娣
                 * @date 2020/12/1
                */
                this.$emit('getDataBaseFile', this.FileInfo);
            },
            cancelFileSelected() {
                this.$emit('update:addLibraryFile', '');
                this.$emit('changeOnlyDownload', '');
                this.$emit('update:visible', false);
            },
            init() {
                const flag = ['person', 'company', 'share'].some(item => {
                    return this.authorized_button[item].disk;
                });
                const arr = ['person', 'company', 'share'].filter(item => {
                    return this.authorized_button[item].disk;
                });
                if (!flag) {
                    this.activeTab = '';
                } else {
                    this.activeTab = arr[0];
                }
            }
        }
    };
</script>

<style lang="less">
    .data_base_modal {
        .el-tabs__nav-wrap:after {
            height: 1px !important;
        }
    }
</style>
<style lang="less" scoped>
    .data_base_tabs{
        margin-bottom:10px;
    }
</style>
