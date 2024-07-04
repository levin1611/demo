<template>
<!-- 草稿箱 -->
  <div class="fb-onekey-release">
      <!-- 头部 -->
    <div class="fb-onekey-release-header">
      <Button
        type="success"
        plain
        :loading="loadingButtonBatchDeletion"
        @click="batchDeletDraftBox"
      >{{$t('facebook.onekeyRelease.DraftBox.batchDelete')}}</Button>
    </div>
    <!-- 表格 -->
    <Table
      class="noborder-table"
      :height="parseInt(contentHeight)-115"
      :data="tableDataDraftBoxList"
      v-loading="loadingDraftBoxList"
      @selection-change="onSelectionChangeTableDraftBoxList"
    >
      <!-- 复选框 -->
      <TableColumn type="selection" width="55"></TableColumn>
      <!-- 创建时间 -->
      <TableColumn
        prop="createTime"
        show-overflow-tooltip
        width="200"
        :label="$t('facebook.onekeyRelease.releaseSuccess.createDate')"
        :formatter="formatterDate"
      ></TableColumn>
      <!-- 发布者 -->
      <TableColumn
        prop="accountName"
        show-overflow-tooltip
        align="center"
        width="200"
        :label="$t('facebook.onekeyRelease.DraftBox.publisher')"
      >
        <template slot-scope="scope">
          <span>
            <img
              :src="item"
              alt
              v-for="(item,index) in scope.row.postAvatarsArr"
              :key="index"
              style="width: 38px;height: 38px; margin: 12px 4px 12px 0;borderRadius: 50%;verticalAlign: middle"
            />
          </span>
        </template>
      </TableColumn>
      <!-- 帖子内容 -->
      <TableColumn
        prop="content"
        show-overflow-tooltip
        width="200"
        :label="$t('facebook.onekeyRelease.DraftBox.content')"
      ></TableColumn>
      <!-- 操作 -->
      <TableColumn
        show-overflow-tooltip
        align="center"
        :label="$t('facebook.onekeyRelease.DraftBox.operate')"
      >
        <template slot-scope="scope">
            <!-- 编辑按钮 -->
          <Icon
            custom="custom custom-copy-new"
            size="14"
            style="margin-right: 15px; cursor: pointer"
            @click="$emit('updateView', 'Creatcontent');$emit('updateLastView', 'Releasedsuccessfully');$store.commit('setPostDetail', scope.row)"
          ></Icon>
          <!-- 删除按钮 -->
          <Icon custom="custom custom-field-delete" size="14" style="cursor: pointer" @click="deleteOneDraft(scope.row.ids)"></Icon>
        </template>
      </TableColumn>
    </Table>
    <Page
      :total="totalDraftBoxTable"
      :current-page="currentDraftBoxTable"
      @current-change="draftBoxDataAjax"
      class="fb-onekey-release-page"
    ></Page>
  </div>
</template>

<script>
    import Util from '@/libs/util';

    export default {
        name: 'DraftBox',
        props: ['contentHeight'],
        created() {
            this.draftBoxDataAjax(1);
        },

        data() {
            return {
                userId: this.$store.state.userId,
                tableDataDraftBoxList: [],
                totalDraftBoxTable: 0,
                currentDraftBoxTable: 1,
                loadingDraftBoxList: false,
                loadingButtonBatchDeletion: false,
                selectedDraftBox: []
            };
        },
        computed: {
            batchDeletDraftBoxData: function() {
                return this.selectedDraftBox
                    .map(function(select) {
                        return select.ids;
                    })
                    .join(',');
            }
        },
        methods: {
            // 格式化日期
            formatterDate(row) {
                return this.$options.filters.timeFormat(row.createTime, 'DateTime');
            },
            draftBoxDataAjax(pageNo, startTime, endTime) {
                this.loadingDraftBoxList = true;
                const paramsData = {
                    userId: this.userId,
                    status: 3,
                    pageNo: pageNo || 1,
                    pageSize: 10
                };

                if (startTime) {
                    paramsData.startTime = startTime;
                    paramsData.endTime = endTime;
                }
                Util.ajaxInternational({
                    url: '/oversea/api/feedList',
                    method: 'get',
                    params: paramsData
                }).then(response => {
                    const data = response.data;
                    if (data.code === '1') {
                        this.tableDataDraftBoxList = data.data.list;
                        this.totalDraftBoxTable = data.data.total;
                        this.handlePostAvatars(this.tableDataDraftBoxList);
                    }
                    this.loadingDraftBoxList = false;
                }).catch(() => {
                    this.loadingDraftBoxList = false;
                });
            },

            // 对表格发布者做base64处理
            handlePostAvatars(data) {
                data.forEach(async (item, index) => {
                    const tempArr = item.postAvatars.split(',');
                    this.$set(data[index], 'postAvatarsArr', tempArr);
                    tempArr.forEach(async (avatar, index2) => {
                        const avatarPic = await this.getPostsPicturesUrl(avatar);
                        avatarPic && this.$set(tempArr, index2, avatarPic);
                    });
                });
            },

            getPostsPicturesUrl(post) {
                return new Promise((resolve, reject) => {
                    Util.ajaxInternational({
                        url: '/social/getPictureUrl',
                        method: 'post',
                        data: {
                            link: post
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            resolve(response.data.data[0]);
                        }
                    });
                });
            },

            // 多选
            onSelectionChangeTableDraftBoxList(list) {
                this.selectedDraftBox = list;
            },
            // 批量删除
            batchDeletDraftBox() {
                if (this.batchDeletDraftBoxData.length < 1) {
                    this.$Message.info(this.$t('facebook.onekeyRelease.deleteTip'));
                    return;
                }
                this.$confirm(this.$t('facebook.onekeyRelease.deleteContent'), this.$t('facebook.onekeyRelease.deleteTitle'), {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.deletDraftBoxAjax();
                });
            },
            deletDraftBoxAjax() {
                this.loadingDraftBoxList = true;
                this.loadingButtonBatchDeletion = true;
                Util.ajaxInternational({
                    url: '/oversea/api/deleteFeed',
                    method: 'post',
                    data: {
                        ids: this.batchDeletDraftBoxData
                    }
                }).then(response => {
                    const data = response.data;
                    if (data.code === '1') {
                        this.selectedDraftBox = [];
                        this.loadingDraftBoxList = false;
                        this.loadingButtonBatchDeletion = false;
                        this.draftBoxDataAjax(this.currentDraftBoxTable);
                    }
                });
            },
            // 删除
            deleteOneDraft(ids) {
                this.$confirm(this.$t('facebook.onekeyRelease.deleteContent'), this.$t('facebook.onekeyRelease.deleteTitle'), {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.deletOneDraftBoxAjax(ids);
                });
            },
            deletOneDraftBoxAjax(ids) {
                this.loadingDraftBoxList = true;
                Util.ajaxInternational({
                    url: '/oversea/api/deleteFeed',
                    method: 'post',
                    data: {
                        ids: ids
                    }
                }).then(response => {
                    const data = response.data;
                    if (data.code === '1') {
                        this.loadingDraftBoxList = false;
                        this.draftBoxDataAjax(this.currentDraftBoxTable);
                    }
                });
            }
        }
    };
</script>
<style>
@import url("../../fb-onekey-release.less");
</style>
