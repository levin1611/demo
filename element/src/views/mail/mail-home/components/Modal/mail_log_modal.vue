<template>
    <Modal
            class=""
            width="600px"
            :visible="mailLogVisible"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            @close="handleCancel">
        <div slot="title">
            <p class="mail_log_modal_title">
                {{$t('mail.mailDetail.mailLogs')}}
                <span>{{$t('mail.mailDetail.showLogType')}}</span>
            </p>
        </div>
        <div class="mail_log_modal"
            :infinite-scroll-distance="10"
            :infinite-scroll-disabled="noMore"
            v-infinite-scroll="load"
            :infinite-scroll-immediate="false">
            <!-- loading -->
            <Spin fix v-if="loading"></Spin>

            <div class="logging" :key="index"
                v-for="(log, index) in log_list">
                <span>{{ log.operator }}&nbsp;&nbsp;[{{ log.operateTime }}]&nbsp;{{operateTypeFilter(log.operateType)}}&nbsp;{{ log.operateContent }}</span>
                <Icon :type="log.detail_show ? 'ios-arrow-up' : 'ios-arrow-down'" size="18"
                      @click.native="showDetail(index)" class="detail-show-trigger"></Icon>
                <template v-if="log.detail_show">
                    <br>
                    <br>
                    <Table :data="log.operateInfos" border>
                        <TableColumn align="center" prop="operateField" :label="$t('mail.mailDetail.changeItem')"></TableColumn>
                        <TableColumn align="center" prop="oldValue" :label="$t('mail.mailDetail.beforeChange')"></TableColumn>
                        <TableColumn align="center" prop="newValue" :label="$t('mail.mailDetail.afterChange')"></TableColumn>
                    </Table>
                </template>
            </div>
            <p v-if="log_list.length && noMore" class="log-no-more-tip">{{$t('mail.mailDetail.noMore')}}</p>
            <img src="@/images/searchDefault.png" alt="" v-if="!log_list.length" style="width: 408px;height: 160px;position: relative;left: 50%;margin-left: -204px;">
        </div>
        <div slot="footer">
            <Button style="color: #fc8c30;border: 1px solid #fc8c30;" @click="handleCancel">{{$t('crm.Modal.modal_close')}}</Button>
        </div>
    </Modal>
</template>
<script>
    import { mapState } from 'vuex';
    import { getLogList } from '@/api/mail.js';
    export default {
        name: 'mail_log_modal',
        props: ['mailLogVisible', 'mailId'],
        data() {
            return {
                loading: true,
                saveLoading: false,
                size: 20,
                page: 1,
                log_list: [],
                noMore: false
            };
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                currentPersonId: state => state.mail.currentPersonId
            }),
            operateTypeFilter() {
                return function(val) {
                    if (val === 1) {
                        return this.$t('mail.mailDetail.manuallyEnforceRules');
                    }
                    if (val === 2) {
                        return this.$t('mail.mailDetail.automaticallyEnforceRules');
                    }
                }
            }
        },
        created() {
        },
        methods: {
            handleCancel() {
                this.$emit('update:mailLogVisible', false);
            },
            // 展示详情
            showDetail(index) {
                if (this.log_list[index].detail_show) {
                    this.log_list[index].detail_show = false;
                } else {
                    this.log_list[index].detail_show = true;
                }
                this.$forceUpdate();
            },
            load() {
                // 正在加载中就先不请求接口了
                if (!this.loading) {
                    this.page += 1;
                    this.getLogList();
                }
            },
            // 获取邮件日志
            getLogList() {
                this.loading = true;
                getLogList({
                    orgId: this.orgId,
                    createUserId: this.currentPersonId,
                    mailId: this.mailId,
                    page: this.page,
                    size: this.size
                }).then((res) => {
                    this.loading = false;
                    if (res.code === 1) {
                        // 当返回数据少于 size 条的时候显示 没有更多数据，同时禁用滚动加载，先不考虑刚好等于 size 条的情况
                        if (res.data.content.length < this.size) {
                            this.noMore = true;
                        }
                        this.log_list = this.log_list.concat(res.data.content || []);
                        this.log_list.map(item => {
                            item.detail_show = false;
                        });
                    } else {
                        this.$Message.error('获取邮件日志失败');
                    }
                }, () => {
                    this.loading = false;
                    this.$Message.error('获取邮件日志失败');
                }).catch(() => {
                    this.loading = false;
                    this.$Message.error(this.$t('catch_message.error'));
                });
            }
        },
        watch: {
            mailLogVisible: {
                handler(val) {
                    if (val) {
                        this.page = 1;
                        this.log_list = [];
                        this.noMore = false;
                        this.getLogList();
                    }
                },
                immediate: true
            }
        }
    };
</script>
<style lang="less" scoped>
    .mail_log_modal{
        max-height: 55vh;
        overflow-y: auto;
    }
    .mail_log_modal_title{
        font-size: 18px;
        color: rgba(0, 0, 0, 0.8);
        line-height: 26px;

        span{
            display: inline-block;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.4);
            margin-left: 12px;
        }
    }

    .log-no-more-tip{
        text-align: center;
        font-size: 12px;
    }

    .logging {
        position: relative;
        margin: 20px;
        vertical-align: middle;

        > span {
            display: inline-block;
            padding-right: 40px;
        }

        .detail-show-trigger {
            position: absolute;
            right: 0;
        }
    }
</style>

