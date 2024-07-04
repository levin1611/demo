<template>
    <div>
        <Timeline class="big-icon-timeline"
                  style="padding: 20px 20px 16px;">
            <TimelineItem v-if="dataList.length>0">
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
            <TimelineItem v-for="(item,index) in dataList" :key="index" >
                <div slot="dot"
                     class="timeline-dot">
                    <img src="@/styles/customFont/svg/Facebook.svg"></img>
                </div>
                <div class="timeline-item" v-if="item.eventAction === 'detailInfo'">
                    <div class="item-header clearfloat">
                        <div class="item-title">Facebook leads</div>
                        <div class="header-source" style="cursor: default;">{{ $t('timeLine.fromContacts') }}{{
                            rowData.a1009 }}
                        </div>

                        <div v-show="!showDetail" @click.stop="showDetail = true" class="item-time">
                            {{ $t('mail.more') }}
                            <Icon custom="custom custom-show-more"></Icon>
                        </div>
                        <div v-show="showDetail" @click.stop="showDetail = false" class="item-time">
                            {{ $t('crm.Modal.fold') }}
                            <Icon custom="custom custom-collapse"></Icon>
                        </div>

                        <div class="item-time margin-right-10">{{ info_adGroup.createdTime | timeFormat("DateTime")}}
                        </div>
                    </div>
                    <div class="item-body">
                        【{{ rowData.a1009 }}】{{ $t('facebookInteraction.fillin') }} <span class="item-event"
                                                                                          style="cursor: default;">【{{ rowData.partSys}}】</span>
                        <div v-show="showDetail" class="api" style="max-height: 600px;overflow-y: auto">
                            <Row>
                                <Col :span="9">
                                    <span style="font-weight: 900;">{{ $t('facebook.leads.info_demand') }}</span>
                                    <Row v-for="(item,index) in info_demand" :key="index">
                                        <Col :span="6">{{ item.title }}:</Col>
                                        <Col :span="16" :offset="2">{{ rowData[item.key] }}</Col>
                                    </Row>
                                </Col>
                                <Col :span="14" :offset="1">
                                    <span style="font-weight: 900;">{{ $t('facebook.leads.info_ad') }}</span>
                                    <Row v-for="(item,index) in info_adGroup_items" :key="index">
                                        <Col :span="6">{{ item.title }}:</Col>
                                        <Col :span="16" :offset="2">
                                            <template v-if="item.key === 'createdTime'">
                                                {{ info_adGroup[item.key] | timeFormat('DateTime') }}
                                            </template>
                                            <template v-else>
                                                {{ info_adGroup[item.key] }}
                                            </template>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </TimelineItem>
        </Timeline>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    // import FbLeadsModal from '@/views/main-components/timeline/facebook-interaction/modal/FbLeadsModal';

    export default {
        name: 'FBLine',
        components: {
            // FbLeadsModal
        },
        props: [
            'fbAdInformation',
            'rowData',
            'columns'
        ],
        data() {
            return {
                info_adGroup: {},
                info_adGroup_items: [
                    {
                        key: 'createdTime',
                        title: this.$t('clue.leads_create_time')
                    },
                    {
                        key: 'leadsId',
                        title: 'LeadsId'
                    },
                    {
                        key: 'adId',
                        title: this.$t('messageReport.id')
                    },
                    {
                        key: 'adName',
                        title: this.$t('messageReport.adName')
                    },
                    {
                        key: 'adsetId',
                        title: this.$t('messageReport.adGroupId')
                    },
                    {
                        key: 'adsetName',
                        title: this.$t('messageReport.adGroupName')
                    },
                    {
                        key: 'campaignId',
                        title: this.$t('messageReport.adAeriesId')
                    },
                    {
                        key: 'campaignName',
                        title: this.$t('messageReport.adAeriesName')
                    },
                    {
                        key: 'formId',
                        title: this.$t('formSet.id')
                    },
                    {
                        key: 'formName',
                        title: this.$t('formSet.name')
                    }
                ],
                showDetail: true,
                dataList: []
            };
        },
        computed: {
            ...mapState([
                'enterpriseId'
            ]),
            info_demand() {
                let temp = [];
                if (Array.isArray(this.columns)) {
                    temp = this.columns.filter(item => item.key && item.key.startsWith('ba100')).map(item => {
                        const { key, title } = item;
                        return {
                            key,
                            title
                        };
                    });
                }
                return temp;
            }
        },
        methods: {
            // 建档时,需要将广告信息回填到备注中,这里要处理下广告信息格式
            handleRemark(infoAdGroup) {
                const obj = {};
                this.info_adGroup_items.forEach(item => {
                    for (const i in infoAdGroup) {
                        if (i === item.key) {
                            obj[item.title] = infoAdGroup[i];
                            if (i === 'createdTime') {
                                obj[item.title] = this.$options.filters.timeFormat(infoAdGroup[i]);
                            }
                        }
                    }
                });

                let objString = '';
                for (const i in obj) {
                    // 这个换行用过 <br> 标签,\n\r 符号结果都失败了
                    // 但是使用了普通的回车就可以换行了,很奇怪-.-|
                    objString += `${i}:${obj[i]}
`;
                }

                this.$emit('update:fbAdInformation', objString);
            },
            get_adGroup_info() {
                this.dataList = [];
                util.ajaxInternational({
                    url: '/social/form/getFbAdInformation',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        leadsId: this.rowData.leadsId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.info_adGroup = response.data.data;
                        this.dataList.push({
                            eventAction: 'detailInfo'
                        });

                        // 处理下广告信息格式
                        this.handleRemark(this.info_adGroup);
                    }
                });
            }
        },
        watch: {
            'rowData.id': {
                handler(val) {
                    if (val) {
                        this.get_adGroup_info();
                    }
                },
                deep: true,
                immediate: true
            }
        }
    };
</script>
<style lang="less">
    @import url('./timeline.less');
</style>

<style scoped lang="less">
    .api {
        /deep/ .ivu-col {
            line-height: 2;
        }
    }
</style>
