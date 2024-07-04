<template>
    <div class="relatedInfo">
        <!--&lt;!&ndash; loading &ndash;&gt;-->
        <!--<Spin fix v-if="loading"></Spin>-->

        <!-- 相关信息 -->
        <!--<div class="related-info-container">-->
        <!--    &lt;!&ndash; 负责人 &ndash;&gt;-->
        <!--    <div class="related-info-managers">-->
        <!--        <div class="related-info-managers-title">{{ $t('crm.Modal.managers') }}</div>-->
        <!--        <div class="related-info-managers-content">{{ managerNames }}</div>-->
        <!--    </div>-->
        <!--</div>-->

        <!-- 资料 Tab -->
        <div class="related-tab-container">
            <Tabs v-model="current_compo"
                  class="related-tab-tabs">
                <TabPane v-for="item in compo_list"
                         :key="item"
                         :name="item">
                    <div slot="label">
                        <span>{{ $t(`crm.newDetail.module_${item}`) }}</span>
                    </div>
                </TabPane>
            </Tabs>
            <!--<keep-alive v-if="!loading">-->
                <component :is="current_compo"
                           :id="id"
                           :isHighSeas="isHighSeas"
                           :type="type"
                           :inquirySeqNumber="inquirySeqNumber"
                           :companyId="companyId"
                           :companyName="companyName"
                           v-bind="$attrs"
                           class="related-tab-compo"></component>
            <!--</keep-alive>-->
        </div>
    </div>
</template>

<script>
    import Task from './taskList';
    import Documents from './documentList';

    export default {
        name: 'relatedInfo',
        inheritAttrs: false,
        components: {
            Task,
            Documents
        },
        props: [
            'type',
            'id',
            'isHighSeas',
            'inquirySeqNumber',
            'companyId',
            'companyName'
        ],
        computed: {
        },
        data() {
            return {
                /* 底部 Tabs */
                compo_list: [
                    'Task',
                    'Documents'
                ],
                current_compo: 'Task'
            };
        },
        methods: {
        },
        watch: {
            id: {
                handler(val) {
                    if (val) {
                        this.current_compo = this.compo_list[0];
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    .relatedInfo {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .related-info {
        &-container {
            position: relative;
        }

        &-managers {
            &-title {
                font-size: 16px;
            }
        }
    }
    .related-tab {
        &-container {
            flex: 1;
            overflow: hidden;

            display: flex;
            flex-direction: column;

            .el-tabs__header{
                margin: 0;
            }
        }

        &-tabs {
            margin: 10px 24px 0;

            .el-tabs__item{
                font-weight: bold;
            }

            .el-tabs__nav-wrap:after {
                display: none;
            }

            .el-tabs__item {
                padding: 0 15px;
            }
        }

        &-compo {
            padding: 0 30px 0 24px;
            flex: 1;
            overflow: auto;
        }
    }
</style>
