<template>
<!-- 发布失败 -->
  <div class="fb-onekey-release">
    <div class="fb-onekey-release-header">
      <Button type="success" plain @click="draftBoxDataAjax(1)">
        <Icon
          custom="custom custom-refresh"
          size="14"
          style="vertical-align: initial;margin-right: 6px;"
        ></Icon>
        <span>{{$t('facebook.onekeyRelease.releaseSuccess.refresh')}}</span>
      </Button>
    </div>
    <Table
      class="noborder-table"
      :height="parseInt(contentHeight)-115"
      :data="tableDataDraftBoxList"
      v-loading="loadingDraftBoxList"
    >
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
        align="center"
        width="200"
        :label="$t('facebook.onekeyRelease.releaseFail.publisher')"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.postAvatarsArr && scope.row.postAvatarsArr.length < 4">
            <img
              :src="item"
              alt
              v-for="(item,index) in scope.row.postAvatarsArr"
              :key="index"
              style="width: 38px;height: 38px;borderRadius: 50%;verticalAlign: middle"
            />
          </span>
          <Tooltip v-else>
            <div slot="content">
                <img
                  :src="item"
                  alt
                  v-for="(item,index) in scope.row.postAvatarsArr"
                  :key="index"
                  style="width: 38px;height: 38px;borderRadius: 50%;verticalAlign: middle"
                />
            </div>
            <span>
              <img
                :src="item"
                alt
                v-for="(item,index) in scope.row.postAvatarsArr.slice(0,3)"
                :key="index"
                style="width: 38px;height: 38px;borderRadius: 50%;verticalAlign: middle"
              />
              <span>&nbsp;...</span>
            </span>
          </Tooltip>
        </template>
      </TableColumn>
      <!-- 发布时间 -->
      <TableColumn
        show-overflow-tooltip
        width="280"
        :label="$t('facebook.onekeyRelease.delayRelease.sendDate')">
          <template slot-scope="scope">
            {{scope.row.scheduledPublishTime ? scope.row.scheduledPublishTime: $options.filters.timeFormat(scope.row.createTime, 'DateTime')}}
            {{scope.row.scheduledPublishTime ? scope.row.timezoneType: 'GMT+08:00'}}
          </template>
      </TableColumn>
      <!-- 帖子类型 -->
      <TableColumn
        show-overflow-tooltip
        width="150"
        :label="$t('facebook.onekeyRelease.releaseSuccess.contentType')">
          <template slot-scope="scope">
            {{scope.row.scheduledPublishTime ? $t('facebook.onekeyRelease.delayNote'): $t('facebook.onekeyRelease.intimeNote')}}
          </template>
      </TableColumn>
      <!-- 帖子内容 -->
      <TableColumn
        prop="content"
        show-overflow-tooltip
        width="200"
        :label="$t('facebook.onekeyRelease.releaseFail.content')"
      ></TableColumn>
      <!-- 失败原因 -->
      <TableColumn
        prop="errMsgs"
        show-overflow-tooltip
        width="200"
        :label="$t('facebook.onekeyRelease.releaseFail.errorMsg')"
      ></TableColumn>
      <!-- 操作 -->
      <TableColumn
        show-overflow-tooltip
        align="center"
        :label="$t('facebook.onekeyRelease.releaseFail.operate')"
      >
        <template slot-scope="scope">
          <!-- 编辑按钮 -->
          <Icon
            custom="custom custom-copy-new"
            size="14"
            style="margin: 0 3px; cursor: pointer"
            @click="$emit('updateView', 'Creatcontent');$emit('updateLastView', 'Releasedsuccessfully');$store.commit('setPostDetail', scope.row)"
          ></Icon>
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
        name: 'Releasefailed',
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
                    status: 2,
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
            }
        }
    };
</script>
<style lang="less">
@import url("../../fb-onekey-release.less");
</style>
