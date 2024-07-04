<template>
    <div>
        <div style="padding: 30px;">
            <!-- 标题 -->
            <p class="bold">{{ $t('crm.UniSet.title_autoCreateInquiry') }}</p>
            <!-- 备注 -->
            <p style="margin: 20px 0"
               class="_font_size12">{{ $t('crm.UniSet.remark_autoCreateInquiry') }}</p>
            <!-- 选择默认负责人 -->
            <div class="appoint-default-sale">
                <span class="appoint-default-sale-label">{{ $t('crm.UniSet.defaultManager') }}</span>
                <div class="appoint-default-sale-select-container">
                    <!-- 选择框 -->
                    <Select :value="saleId"
                            filterable
                            :placeholder="$t('crm.Modal.tip_select')"
                            @change="saveSetting">
                        <!-- 公海 -->
                        <Option :value="`${-1}`"
                                :label="'公海'"></Option>
                        <!-- 销售人员 -->
                        <Option v-for="item in salesList"
                                :key="item.id"
                                :value="`${item.id}`"
                                :label="item.fullname"></Option>
                    </Select>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'autoCreateInquiry',
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                salesList: state => state.crm.salesList,
            }),
            selectedSale() {
                // 公海
                if (`${this.saleId}` === '-1') {
                    return {
                        id: -1,
                        fullname: '公海'
                    };
                }

                // 销售
                return this.salesList ? this.salesList.find(item => `${item.id}` === `${this.saleId}`) : null;
            }
        },
        data() {
            return {
                // 全局
                cancelFunc: null,

                // 被选中销售 id
                saleId: null, // null 表示未请求或请求失败, '' 表示请求成功但无数据, xxxx 表示请求成功且请求到了数据
            };
        },
        methods: {
            // 重新获取配置信息, 刷新页面
            async refreshData() {
                // 先请求下拉列表, 再请求默认负责人, 避免默认负责人回填到 Select 时不显示 label 直接显示 id (Select 组件好像不会因为 Option 更新而重新匹配选项)
                await this.$store.dispatch('getSalesList');
                await this.getSetting();

                // 如果两者都成功请求, 且默认负责人没有匹配的销售人员, 则认为该销售已离职/已非销售, 则重置默认负责人为公海
                if (this.saleId !== null && this.salesList !== null) {
                    if (!this.selectedSale) {
                        this.saveSetting('-1');
                    }
                }
            },
            // 获取默认负责人
            getSetting() {
                return util.ajax({
                    url: '/crm/attr/getDefaultUser',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (response.data.data) {
                            this.saleId = `${response.data.data.attrValue}` || '';
                        } else {
                            this.saleId = '';
                        }
                    } else {
                        this.saleId = null;
                        this.$Message.error(this.$t('crm.UniSet.error_getAutoCreateInquirySetting'));
                    }
                }).catch(e => {
                    this.saleId = null;
                    this.$Message.error(this.$t('crm.UniSet.error_getAutoCreateInquirySetting'));
                });
            },
            // 保存配置信息
            saveSetting(val) {
                this.saleId = val;
                if (!this.selectedSale) {
                    return;
                }

                // 定义本次要发送的数据 { orgId: enterpriseId, attrName: sale.fullname, attrValue: sale.id }
                const data = {
                    orgId: this.enterpriseId,
                    attrName: this.selectedSale.fullname,
                    attrValue: this.saleId
                };

                // 取消之前的表格数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                // 发送请求
                const vm = this;
                util.ajax({
                    url: '/crm/attr/saveDefaultUser',
                    method: 'post',
                    data,
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        vm.cancelFunc = c;
                    })
                }).then(response => {
                    if (response.data.code === '1') {
                        this.refreshData();
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_save'));
                    }
                }).catch(e => {
                    this.$Message.error(this.$t('crm.Table.error_save'));
                });
            }
        },
        mounted() {
            this.refreshData();
        }
    };
</script>

<style scoped lang="less">
    .appoint-default-sale {
        &-label {
            vertical-align: top;
            line-height: 32px;
        }

        &-select{
            &-container {
                display: inline-block;
                width: 230px;
                margin-left: 20px
            }
        }
    }
</style>
