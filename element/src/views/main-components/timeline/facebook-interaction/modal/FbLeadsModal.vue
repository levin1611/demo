<template>
    <div class="timeline-leads-info">
        <div class="leads-info-header">
            <p class="timeline-leads-header-title">{{ leadsInfo.partSys }}</p>
            <p class="timeline-leads-header-time">{{ leadsInfo.leadsSubmitTime | timeFormat("DateTime") }}</p>
        </div>
        <div class="leads-info-body">
            <ul>
                <li v-for="(item,index) in formColumnList"
                    :key="index">
                    <span style="width:100px;">{{ item.title }}：</span>
                    <span>{{ item.value }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'FbLeadsModal',
        props: {
            leadsId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                leadsInfo: {},
                formInfo: {},
                formColumnList: []
            };
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId'
            ])
        },
        methods: {
            getColumnValue(leadsId) {
                util.ajax({
                    url: '/form-cust/form/getColumnValue',
                    method: 'get',
                    params: {
                        id: leadsId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.leadsInfo = response.data.data;
                        this.getColumns(response.data.data.templateId);
                    }
                });
            },
            // 获取表单表头
            getColumns(id) {
                util.ajax({
                    url: '/form-cust/form/getColumns',
                    method: 'post',
                    data: {
                        templateId: id,
                        isShow: 1,
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const dataInfo = response.data.data;
                        for (const key in dataInfo) {
                            for (const name in this.leadsInfo) {
                                if (name === key) {
                                    this.formColumnList.push({
                                        title: dataInfo[key].name,
                                        value: this.leadsInfo[name]
                                    });
                                }
                            }
                        }
                        console.log(dataInfo);
                        this.formInfo = dataInfo;
                    }
                });
            }
        },
        created() {
            this.getColumnValue(this.leadsId);
        },
        watch: {
            leadsId: {
                handler(val) {
                    this.getColumnValue(val);
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    .timeline-leads-info {
        height: 260px;
        overflow-y: auto;

        .leads-info-header {
            padding: 6px 0;

            .timeline-leads-header-title {
                font-size: 14px;
                font-weight: 700;
            }

            .timeline-leads-header-time {
                font-size: 12px;
                color: #b8b8b8;
            }
        }

        .leads-info-body {
            li {
                padding: 4px 0;
            }
        }
    }
</style>
