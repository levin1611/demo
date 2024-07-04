<template>
    <div class="mutual-container">
        <!-- 多个visitor -->
        <div class="mutual-box" v-if="visitorList.length > 1">
            <Tabs v-model="visitorId" class="mutual-tab">
                <TabPane
                    v-for="item in visitorList"
                    :key="item.key"
                    :name="item.key"
                    :label="item.value"
                >
                </TabPane>
            </Tabs>
            <component
                :is="componentName"
                :visitorName="visitorName"
                :customerInfo="customerInfo"
                currentTab="WebLine"
                :visitorId="visitorId"
                :fieldObj="fieldObj?fieldObj:{}"
                :type="type"
            ></component>
        </div>
        <!-- 单个visitor -->
        <div class="mutual-box" v-else-if="visitorList.length === 1">
            <WebLine
                date=""
                currentTab="WebLine"
                :visitorName="visitorName"
                :customerInfo="customerInfo"
                :visitorId="visitorId"
                :fieldObj="fieldObj?fieldObj:{}"
                :type="type"
            />
        </div>
        <div class="mutual-box" style="margin-top: 60px;text-align: center;color: #999; " v-else>
            {{ $t('timeLine.noData') }}
        </div>
        <!-- <Tabs v-model="componentName" class="mutual-tab">
            <TabPane
                v-for="item in mutual_list"
                :key="item.key"
                :name="item.key"
                :label="item.title"
            >
            </TabPane>
        </Tabs> -->
        <!-- <component
            :is="componentName"
            :companyId="''"
            :type="'chat'"
            :date="''"
            :currentTab="initWebLine"
            :fieldObj="fieldObj"
            :visitorId="currVisitorId"
        ></component> -->
    </div>
</template>

<script>
import WebLine from '@/views/main-components/timeline/web-interaction/web-item-line.vue';
// 轨迹侧边栏
export default {
    name: 'LocusSide',
    props: ['visitorList','customerInfo','fieldObj','type'],
    components: {
        WebLine
    },
    data() {
        return {
            componentName: 'WebLine',
            visitorId: '',
            visitorName: '',
        };
    },
    computed: {
    },
    watch: {
        visitorList: {
            handler(val) {
                console.log(val)
                if(val.length > 0) {
                    this.visitorId = val[0].key;
                    this.visitorName = val[0].value
                }
            },
            deep: true,
            immediate: true
        },
        visitorId: {
            handler(val) {
                if(val) {
                    this.visitorList.map(item => {
                        if(item.key === this.visitorId){
                            this.visitorName =  item.value
                        }
                    });
                }
            }
        },
    },
    methods: {
        // 获取idvisit
    }
};
</script>

<style scoped lang="less">
.mutual-container{
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
}
.mutual-title {
    line-height: 1;
    font-size: 14px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.8);
    padding: 30px 20px 5px;
}

.mutual-box{
    padding: 10px 20px;
    flex: 1;
    overflow: auto;
    .mutual-tab{
        /deep/ .el-tabs__header {
            border-bottom: none;
        }

        /deep/ .el-tabs__nav-wrap {
            height: 32px;
            line-height: 32px;
            overflow: inherit;
        }

        /deep/ .el-tabs__nav .el-tabs__item {
            padding: 3px 30px 3px 0;
            font-size: 13px;
            line-height: 40px;
            &:active {
                color: #4285F4 !important;
                outline: none;
            }

            &:hover {
                color: #4285F4 !important;

                .custom-menu-arrow {
                    color: #4285F4 !important;
                }
            }

            &.is-active {
                color: #4285F4;
                outline: none;
                i {
                    color: #4285F4 !important;
                }
            }
        }

        /deep/ .el-tabs__active-bar {
            display: none;
        }

        /deep/ .el-tabs__nav-wrap:after {
            display: none;
        }
    }
}
.journey-detail{
    .mutual-box{
        padding: 0px
    }
}
</style>