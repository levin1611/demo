<template>
<!-- 发布成功 -->
  <div class="fb-onekey-release">
    <!-- 表头 -->
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
    <!-- 表格 -->
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
        :label="$t('facebook.onekeyRelease.releaseSuccess.publisher')"
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
            {{scope.row.scheduledPublishTime ? scope.row.scheduledPublishTime: $options.filters.timeFormat(scope.row.createTime, 'DateTime')}}&nbsp;
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
        :label="$t('facebook.onekeyRelease.releaseSuccess.content')"
      ></TableColumn>
      <!-- 赞/喜欢 -->
      <TableColumn
        show-overflow-tooltip
        align="center"
        :label="$t('facebook.onekeyRelease.releaseSuccess.like')"
      >
        <template slot-scope="scope">
          <Icon
            type="load-c"
            size="18"
            style="color:#fc8c30;"
            :class="{demoSpinCol:loadingLikeAndShareAjax,'demo-spin-icon-load': true,'released-success-hide': !loadingLikeAndShareAjax }"
          ></Icon>
          <div
            :class="{'released-success-hide': loadingLikeAndShareAjax}"
          >{{LikeAndShareData && LikeAndShareData[scope.row.id]? getValueLikeAndShare(scope, 'likes'): '-'}}</div>
        </template>
      </TableColumn>
      <!-- 转发/分享 -->
      <TableColumn
        show-overflow-tooltip
        align="center"
        :label="$t('facebook.onekeyRelease.releaseSuccess.share')"
      >
        <template slot-scope="scope">
          <Icon
            type="load-c"
            size="18"
            style="color:#fc8c30;"
            :class="{demoSpinCol:loadingLikeAndShareAjax,'demo-spin-icon-load': true,'released-success-hide': !loadingLikeAndShareAjax }"
          ></Icon>
          <div
            :class="{'released-success-hide': loadingLikeAndShareAjax}"
          >{{LikeAndShareData && LikeAndShareData[scope.row.id]? getValueLikeAndShare(scope, 'shares'): $t('facebook.onekeyRelease.releaseSuccess.noData')}}</div>
        </template>
      </TableColumn>
      <!-- 评论 -->
      <TableColumn
        show-overflow-tooltip
        align="center"
        :label="$t('facebook.onekeyRelease.releaseSuccess.comment')"
      >
        <template slot-scope="scope">
          <Icon
            type="load-c"
            size="18"
            style="color:#fc8c30;"
            :class="{demoSpinCol:loadingLikeAndShareAjax,'demo-spin-icon-load': true,'released-success-hide': !loadingLikeAndShareAjax }"
          ></Icon>
          <div
            :class="{'released-success-hide': loadingLikeAndShareAjax}"
          >{{LikeAndShareData && LikeAndShareData[scope.row.id]? getValueLikeAndShare(scope, 'comments'): $t('facebook.onekeyRelease.releaseSuccess.noData')}}</div>
        </template>
      </TableColumn>
      <!-- 操作 -->
      <TableColumn
        show-overflow-tooltip
        align="center"
        :label="$t('facebook.onekeyRelease.releaseSuccess.operate')"
      >
        <template slot-scope="scope">
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
    import { mapState } from 'vuex';

    export default {
        name: 'Releasedsuccessfully',
        props: ['pageList', 'contentHeight'],
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
                selectedDraftBox: [],
                LikeAndShareData: {},
                loadingLikeAndShareAjax: false
            };
        },
        computed: {
            ...mapState({
                websocketMsgFB: state => state.facebook.websocketMsgFB
            }),
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
            getValueLikeAndShare(params, type) {
                const ids = params.row.ids.split(',');
                let value = 0;
                for (let i = 0; i < ids.length; i++) {
                    value += this.LikeAndShareData[ids[i]]
                        ? parseInt(this.LikeAndShareData[ids[i]][type])
                        : 0;
                }
                return value;
            },
            draftBoxDataAjax(pageNo, startTime, endTime) {
                this.loadingDraftBoxList = true;
                const paramsData = {
                    userId: this.userId,
                    status: 1,
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
                    if (data.code === '1' && JSON.stringify(data.data) !== '{}') {
                        this.getLikeAndShareDataAjax(data.data.list);
                        this.tableDataDraftBoxList = data.data.list;
                        this.totalDraftBoxTable = data.data.total;
                        this.handlePostAvatars(this.tableDataDraftBoxList);
                    }
                    this.loadingDraftBoxList = false;
                }).catch(() => {
                    this.loadingDraftBoxList = false;
                });
            },

            /**
             * @Date: 2020-06-28 13:48:36
             * @LastEditors: niumkiki
             * @description: 对表格发布者做base64处理
             * @param :
             * @return:
             */
            handlePostAvatars(data) {
                data.forEach(async (item, index) => {
                    const tempArr = item.postAvatars.split(',');
                    // 把已转成base64的头像保存在另一个字段中,防止在跳转至添加推文页面，保存草稿箱或发布时直接把base64传入接口中
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

            batchDeletDraftBox() {
                if (this.batchDeletDraftBoxData.length < 1) {
                    this.$Message.info(this.$t('facebook.onekeyRelease.deleteTip'));
                    return;
                }
                this.$Modal.confirm({
                    title: this.$t('facebook.onekeyRelease.deleteTitle'),
                    content: this.$t('facebook.onekeyRelease.deleteContent'),
                    onOk: this.deletDraftBoxAjax
                });
            },
            deletDraftBoxAjax() {
                this.selectedDraftBox = [];
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
                        this.loadingDraftBoxList = false;
                        this.loadingButtonBatchDeletion = false;
                        this.draftBoxDataAjax(this.currentDraftBoxTable);
                    }
                });
            },
            getLikeAndShareDataAjax(jsonData) {
                let ajaxData = [];
                for (let i = 0; i < jsonData.length; i++) {
                    ajaxData = ajaxData.concat(jsonData[i].ids.split(','));
                }

                ajaxData = Array.from(new Set(ajaxData)).join(',');
                this.loadingLikeAndShareAjax = true;
                Util.ajaxInternational({
                    url: '/oversea/api/getPostAttrs',
                    method: 'post',
                    data: {
                        postIds: ajaxData
                    }
                }).then(response => {
                    const data = response.data;
                    if (data.code === '1') {
                        this.LikeAndShareData = data.data;
                        this.tableDataDraftBoxList.push(1);
                        this.tableDataDraftBoxList.pop();
                    }
                    this.loadingLikeAndShareAjax = false;
                }).catch(() => {
                    this.loadingLikeAndShareAjax = false;
                });
            }
        },
        watch: {
            // 监听 ws 消息, 发帖成功后,更新推文列表
            websocketMsgFB: {
                handler(val) {
                    if (val.bePushedMessageType === '18' && val.WaWebsocketMessageType === 20 && this.$router.currentRoute.name === 'one_key_release') {
                        // 获取最新的发帖成功列表
                        this.draftBoxDataAjax(1);
                    }
                }
            }
        }
    };
</script>
<style lang="less">
@import url("../../fb-onekey-release.less");

.released-success-hide {
  display: none;
}

.fb-onekey-release .ivu-table-row {
  height: 56px !important;
}

.fb-onekey-release-header .ivu-btn-success {
  border-color: #abbfd5;
}
</style>
