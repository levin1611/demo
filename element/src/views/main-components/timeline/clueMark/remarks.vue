<!-- 时间轴组件 - 线索备注分轴 -->
<template>
    <div style="position: relative;">
        <!--<Spin size="large" fix v-if="loading">-->
        <!--<Icon type="load-c" size="18" class="demo-spin-icon-load"></Icon>-->
        <!--<div>{{ $t('crm.Html.loading') }}</div>-->
        <!--</Spin>-->
        <Timeline v-if="computed_remarks.length"
                  class="big-icon-timeline">
            <TimelineItem>
                <div slot="dot"
                     class="timeline-dot">
                    <Icon type="record"
                          size="12"
                          color="#e9eaec"
                          style="vertical-align: top;"></Icon>
                </div>
                <div>
                    <br>
                </div>
            </TimelineItem>
            <TimelineItem v-for="(remark, index) in computed_remarks" :key="index">
                <div slot="dot"
                     class="timeline-dot">
                    <img src="@/styles/customFont/svg/followUp.svg"></img>
                </div>
                <div class="timeline-item">
                    <div class="item-header clearfloat">
                        <div class="item-title">
                            {{ remark.createPerson ? (remark.createPerson + ' ') : '' }}
                        </div>
                        <div class="block-line"></div>
                        <span v-if="remark.createTime">{{ $t('crm.Html.createTime') }}: {{ remark.createTime | timeFormat('DateTime') }}</span>
                    </div>
                    <div class="item-body">
                        <pre>{{remark.content}}</pre>
                        <div v-if="remark.pictures.length > 0" style="margin: 15px 0 -15px 0;">
                            <div class="demo-upload-list demo-upload-list-bigger"
                                 v-for="pic in remark.pictures" v-if="pic">
                                <img :src="pic" @click="imgPreview">
                            </div>
                        </div>
                    </div>
                </div>
            </TimelineItem>
        </Timeline>
        <template v-else>
            <div style="height: 100px;line-height: 100px;text-align: center">
                暂无线索备注
            </div>
        </template>
    </div>
</template>

<script>
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';

    export default {
        name: 'remarks',
        props: [
            'flag',
            'companyId',
            'date'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                qiniuHttp: 'qiniuHttp'
            }), // 从 vuex 中获取属性
            computed_remarks() {
                let temp = this.remarks.slice();
                if (Array.isArray(this.date) && this.date.length === 2 && this.date[0] && this.date[1]) {
                    const start = Date.parse(this.date[0]);
                    const end = Date.parse(this.date[1]) + 24 * 60 * 60 * 1000;
                    temp = temp.filter(item => item.createTime >= start && item.createTime <= end);
                }
                return temp;
            }
        },
        data() {
            return {
                loading: false,
                remarks: []
            };
        },
        methods: {
            /* 获取线索备注 */
            getRemarks() {
                this.loading = true;
                this.remarks = [];
                util.ajax({
                    url: '/form-cust/remark/getRemarkList',
                    method: 'post',
                    data: {
                        recordId: this.companyId,
                        recordType: 1
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.remarks = res.data.data.map(item => {
                            if (item.pictures === '' || item.pictures === undefined) {
                                item.pictures = [];
                            } else {
                                item.pictures = item.pictures.split(',');
                            }
                            return item;
                        });
                    } else {
                        this.$Message.error(this.$t('clue.error_getClueRemarks'));
                    }
                    this.loading = false;
                });
            },

            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            }
        },
        watch: {
            flag: {
                handler() {
                    this.getRemarks();
                },
                immediate: true
            }
        }

    };
</script>

<style lang="less">
    @import '../timeline.less';
</style>
