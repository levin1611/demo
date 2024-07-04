<style lang="less">
@import url(../../mail/mail-home/components/write-mail/write-mail);
.automated-mail {
  h3{
    font-family: PingFangSC-Medium;
    font-size: 16px;
    // color: rgba(0,0,0,0.80);
    color: #2d2f2e;
    letter-spacing: 0;
    line-height: 26px;
    font-weight: 500;
  }
  .add-template{
    float:right;
    height:36px;
    width:134px;
    &.ivu-btn{
      &>span{
        vertical-align: baseline;
      }
    }
  }
  .ivu-card-bordered{
    min-height: 100%;
  }
  .ivu-table-row{
    td{
      position: relative;
    }
  }
  .ivu-table-cell {
    padding:0 5px;
    // height: 100%;
    // position: relative;
    &>span,&>div{
      // display: inline-block;
      // height: 100%;
    }
  }
  .state{
    height: 28px;
    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
  }
  .state-tag{
    display: inline-block;
    height: 28px;
    line-height: 28px;
    border-radius: 14px;
    padding:0 16px;
    margin-left: 12px;
    &:first-child{
      margin-left: 0;
    }
    &.blue{
      background-color: rgba(66,133,244,0.12);
      color: rgb(66,133,244);
    }
    &.orange{
      background-color: rgba(250,130,65,0.12);
      color: rgb(250,130,65);
    }
    &.green{
      background-color: rgba(0,204,153,0.12);
      color: rgb(0,204,153);
    }
  }
  .el-card{
    border: none;
  }
  .detailContent {
    line-height: 50px !important;
  }
}
</style>
<style lang="less" scoped>
.mail-preview-model{
  /deep/ .ivu-modal-body{
    max-height:calc(~'100vh - 250px');
  }
}
</style>

<template>
<div class="automated-mail" style="height:100%">
  <Card shadow="never" v-show="!editting" style="padding:14px;">
    <h3 style="margin-bottom:20px;" class="clearfix">{{$t('mail.template')}}
      <Button type="primary" icon="plus" class="add-template"  @click="editting=!editting">{{$t('mail.add_template')}}</Button>
    </h3>
    <Table
            class="noborder-table"
            :data="tableData"
            :max-height="table_height"
            :loading="loading">
      <TableColumn v-for="(item, index) in columns"
                   :key="index"
                   :prop="item.key"
                   :label="item.title"
                   :minWidth="item.minWidth"
                   :show-overflow-tooltip="true">
          <template slot-scope="{row,index}">
            <div v-if="item.key === 'mailTempletTitle'">
              <span>{{row.mailTempletTitle}}</span>
            </div>
            <div v-else-if="item.key === 'mailTempletSubject'">
              <span>{{row.mailTempletSubject}}</span>
            </div>
            <div v-else-if="item.key === 'createUserName'">
              <span>{{row.createUserName}}</span>
            </div>
            <div v-else-if="item.key === 'state'">
            <div class="state">
              <span class="state-tag blue">{{row.timesOfUse+$t('automatedMail.sent')}}</span>
              <span class="state-tag orange">{{row.timesOfRead+$t('automatedMail.read')}}</span>
              <span class="state-tag green">{{row.timesOfUse==0?$t('automatedMail.readRate'):Number((row.timesOfRead/row.timesOfUse)*100).toFixed(1)+`% ${$t('automatedMail.readRate')}`}}</span>
            </div>
          </div>
            <div v-else-if="item.key === 'operate'">
            <Icon size="12" style="cursor:pointer;color:#677F99;" custom="custom custom-field-edit" @click="handleEdit(row.id)"></Icon>
            <Icon size="12" style="margin-left:16px;cursor:pointer;color:#677F99;" custom="custom custom-view-image" @click="handlePreview(row.id)"></Icon>
            <Icon size="12" style="margin-left:16px;cursor:pointer;color:#677F99;" custom="custom custom-field-delete" @click="handleDelete(row.id)"></Icon>
          </div>
        </template>
      </TableColumn>
    </Table>
    <div class="page">
      <Page
              :total="total"
              :current-page="currentPage"
              :page-size="pageSize"
              :page-sizes="sizeOptions"
              layout="total, prev, pager, next, sizes, jumper"
              @current-change="changePage"
              @size-change="changeSize">
      </Page>
    </div>
  </Card>
  <!-- 模板编辑 -->
  <Edit @updateList="getTemplets" v-if="editting" :editting.sync="editting" :id.sync="templetId">
  </Edit>
  <Modal :title="emailForm.mailTempletTitle"
         :show-close="false"
        :visible.sync="previewModel"
        :modal-append-to-body="false"
        :close-on-click-modal="false"
        class="mail-preview-model"
        :styles="{width:`${modal_width}px`}"
        :transition-names="['ease-in','fade-in-enter']">
<!--    <Spin size="large" fix v-if="spin"></Spin>-->
    <div class="subject">{{emailForm.mailTempletSubject?emailForm.mailTempletSubject:$t('mail.writeLetter.noSubject')}}</div>
    <ul class="detailHead">
      <li><span class="clumsName">{{$t('systemNotice.createTime')}}</span>{{createTime}}</li>
      <li v-if="filesPreview.length">
        <span class="clumsName">{{$t('mail.writeLetter.attachment')}}</span>{{filesPreview.length}}{{ $t('b2b.b2b.unit') }}
        <UploadList :files='filesPreview'></UploadList>
      </li>
    </ul>
    <div class="detailContent" v-html="emailForm.mailTempletContent"></div>
    <div slot="footer">
      <Button @click="previewModel = false" type="primary">{{$t('confirm')}}</Button>
    </div>
  </Modal>
  <Modal
          :title="$t('mail.customizedFolder.folderCancelTitle')"
          width="520px"
          :visible.sync="deleteConfirm"
          :modal-append-to-body="false"
          :close-on-click-modal="false">
    <p>{{$lang === 'zh-CN'? `是否删除【${tableData[deleteIndex]?tableData[deleteIndex].mailTempletTitle:''}】?` : `Are you sure to delete the [${tableData[deleteIndex]?tableData[deleteIndex].mailTempletTitle:''}]?`}}</p>
    <div slot="footer">
      <Button  @click="deleteConfirm = false">{{$t('cancel')}}</Button>
      <Button @click="() => deleteTemplet(tableData[deleteIndex].id,deleteIndex)" type="primary">{{$t('confirm')}}</Button>
    </div>
  </Modal>
</div>
</template>
<script>
    import Edit from './components/edit_template';
    import util from '../../../libs/util';
    import { mapState } from 'vuex';
    import Vue from 'vue';
    import UploadList from '../../mail/mail-home/components/write-mail/upload-list';
    export default {
        name: 'automated_mail',
        components: {
            Edit,
            UploadList
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_width: 'window_width',
                $lang: state => state.lang
            }),
            modal_width() {
                return parseInt((this.window_width - 360) * 0.8 - 40);
            },
            nowTime() {
                const t = new Date();
                return (
                    `${t.getFullYear()
                    }年${
                        t.getMonth() + 1
                    }月${
                        t.getDate()
                    }日 ${
                        t.getHours()
                    }:${
                        t.getMinutes()}`
                );
            },
            table_height() {
                let temp = this.window_height ? this.window_height - 190 : document.body.clientHeight - 190;
                if (temp < 200) {
                    temp = 200;
                }
                // 转 element-ui 时, 表格样式错误, 加上这句后解决, 具体错误原因暂时未看
                temp += this.loading ? 1 : 0;
                return temp;
            }
        },
        data() {
            return {
                loading: false,
                columns: [
                    {
                        title: this.$t('automatedMail.templateName'),
                        key: 'mailTempletTitle'
                    },
                    {
                        title: this.$t('letters.theme'),
                        key: 'mailTempletSubject'
                    },
                    {
                        title: this.$t('automatedMail.createUserName'),
                        key: 'createUserName'
                    },
                    {
                        title: this.$t('automatedMail.emailState'),
                        key: 'state',
                        minWidth: 260
                    },
                    {
                        title: this.$t('automatedMail.emailOperate'),
                        minWidth: 150,
                        key: 'operate'
                    }
                ],
                tableData: [],
                editting: false,
                previewModel: false,
                emailForm: {
                    mailTempletTitle: '', // 名称
                    mailTempletSubject: '', // 主题
                    mailTempletContent: ''
                },
                filesPreview: [], // 附件预览
                mailContent: '', // 邮件内容
                createTime: 0, // 预览展示的创建时间
                templetId: -1,
                total: 0, // 表格总条数
                currentPage: 1, // 当前页数
                pageSize: 10, // 每页条数
                sizeOptions: [10, 20, 30, 40],
                spin: false,
                deleteIndex: -1,
                deleteConfirm: false
                // $lang: '' // 系统语言
            };
        },
        methods: {
            /** 编辑 */
            handleEdit(id) {
                this.templetId = id;
                this.editting = true;
            },
            /** 删除 */
            handleDelete(id) {
                const index = this.tableData.findIndex(item => item.id === id);
                this.deleteConfirm = true;
                this.deleteIndex = index;
            },
            dateFormat(fmt, timeStramp) {
                const date = new Date(timeStramp);
                const o = {
                    'M+': date.getMonth() + 1, // 月份
                    'd+': date.getDate(), // 日
                    'h+': date.getHours(), // 小时
                    'm+': date.getMinutes(), // 分
                    's+': date.getSeconds(), // 秒
                    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
                    S: date.getMilliseconds() // 毫秒
                };
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(
                        RegExp.$1,
                        (`${date.getFullYear()}`).substr(4 - RegExp.$1.length)
                    );
                }
                for (const k in o) {
                    if (new RegExp(`(${k})`).test(fmt)) {
                        fmt = fmt.replace(
                            RegExp.$1,
                            RegExp.$1.length == 1
                                ? o[k]
                                : (`00${o[k]}`).substr((`${o[k]}`).length)
                        );
                    }
                }
                return fmt;
            },
            handlePreview(id) {
                const index = this.tableData.findIndex(item => item.id === id);
                this.previewModel = true;
                this.getContent(id);
                this.createTime = this.dateFormat('yyyy-MM-dd hh:mm:ss', this.tableData[index].createTime);
            },
            /* 获取模板列表 */
            getTemplets() {
                this.loading = true;
                const jsonData = {
                    orgId: this.enterpriseId.toString(),
                    page: this.currentPage - 1,
                    size: this.pageSize
                };
                util.ajaxMailJson({
                    url: '/mail/mailTemplets',
                    method: 'post',
                    data: jsonData
                }).then(res => {
                    this.loading = false;
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.content;
                        this.total = res.data.data.totalElements;
                    }
                });
            },
            /* 获取模板内容 */
            getContent(id) {
                this.spin = true;
                util.ajaxMail({
                    url: `/mail/mailTemplet/${id}`,
                    method: 'get'
                }).then(res => {
                    this.spin = false;
                    if (res.data.code == 1) {
                        const data = res.data.data;
                        if (data.mailTempletAttachmentList) {
                            this.filesPreview = data.mailTempletAttachmentList.map(item => {
                                return {
                                    name: item.fileName
                                };
                            });
                        } else {
                            this.filesPreview = [];
                        }
                        this.emailForm.mailTempletContent = data.mailTempletContent;
                        this.emailForm.mailTempletTitle = data.mailTempletTitle;
                        this.emailForm.mailTempletSubject = data.mailTempletSubject;
                    }
                });
            },
            /* 删除某个模板 */
            deleteTemplet(id, index) {
                const jsonData = {
                    ids: [id],
                    updateUserId: this.userId
                };
                util.ajaxMailJson({
                    url: '/mail/mailTemplet',
                    method: 'delete',
                    data: jsonData
                }).then(res => {
                    this.deleteConfirm = false;
                    if (res.data.code === 1) {
                        this.$Message.success(this.$t('deleteSuccess'));
                        this.deleteIndex = -1;
                        this.tableData.splice(index, 1);
                    } else {
                        this.$Message.error(this.$t('deleteFail'));
                    }
                });
            },
            changePage(page) {
                this.currentPage = page;
                this.getTemplets();
            },
            changeSize(size) {
                this.pageSize = size;
                this.currentPage = 1;
                this.getTemplets();
            }
        },
        created() {
            this.getTemplets();
        },
        mounted() {
        }

    };
</script>
<style lang="less" scoped>
@import url(../../mail/mail-home/components/write-mail/scoped);
.page{
  position: relative;
  text-align: right;
  margin-top: 10px;
}
</style>


