<template>
    <div style="background-color:#fff;padding:30px" class="user_manager">
        <h2 style="line-height:30px;">{{$t('authority.companyInfo')}}</h2>
        <Table :data="company_data">
            <TableColumn v-for="item in company_title"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"></TableColumn>
        </Table>

        <h2 style="margin:50px 30px 0 0;line-height:30px">{{$t('authority.accountUsage')}}</h2>
        <Table :data="user_data">
            <TableColumn v-for="item in user_title"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"></TableColumn>
        </Table>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'company-overview',
        computed: {
            ...mapState([
                'enterpriseId',
                'app'
            ])
        },
        watch: {
            'app.companyInformation'(val) {
                if (val) {
                    this.getCompanyInfo();
                }
            }
        },
        data() {
            return {
                company_title: [
                    {
                        title: 'ID',
                        key: 'id'
                    },
                    {
                        title: this.$t('authority.company'),
                        key: 'name'
                    },
                    {
                        title: this.$t('authority.url'),
                        key: 'url'
                    },
                    {
                        title: this.$t('authority.edition'),
                        key: 'edition'
                    }
                ],
                user_title: [
                    {
                        title: this.$t('authority.startDate'),
                        key: 'start_date'
                    },
                    {
                        title: this.$t('authority.closeDate'),
                        key: 'close_date'
                    },
                    {
                        title: this.$t('authority.remainderDay'),
                        key: 'remainder_day'
                    },
                    {
                        title: this.$t('authority.all'),
                        key: 'all'
                    },
                    {
                        title: this.$t('authority.use'),
                        key: 'use'
                    },
                    {
                        title: this.$t('authority.surplus'),
                        key: 'surplus'
                    }
                ],
                user_data: [],
                company_data: []
            };
        },
        mounted() {
            // 派发action获取公司信息
            this.$store.dispatch('getCompanyInformation');
        },
        methods: {
            // 获取公司信息
            getCompanyInfo() {
                // 储存公司信息,并处理
                const companyInformation = this.app.companyInformation;
                if (companyInformation) {
                    const val = companyInformation.list[0]; // 获取返回的数据
                    const obj = {}; // 定义公司数据为空对象
                    obj.id = val.orgId; // ID
                    obj.name = val.name; // 公司名字
                    obj.url = val.webSite; // 公司网址
                    obj.edition = val.version; // 询盘云版本
                    this.company_data = []; // 将公司数据置空 再给company_data添加数据
                    this.company_data.push(obj);
                    const obj2 = {}; // 定义账号使用情况为空对象
                    const openDate = this.setTime(val.openDate); // 开始日期
                    const offDate = this.setTime(val.offDate); // 截止日期
                    obj2.start_date = openDate; // 开始日期
                    obj2.close_date = offDate; // 截止日期
                    obj2.remainder_day = val.remainingDays === -1 ? '' : val.remainingDays; // 剩余天数
                    obj2.all = val.userLimit;
                    obj2.use = val.usedNum;
                    obj2.surplus = val.userLimit - val.usedNum; // 剩余账号数
                    this.user_data = []; // 置空账号使用情况 再给user_data添加数据
                    this.user_data.push(obj2);
                } else {
                    this.$Message.error(this.$t('crm.Table.error_getCompanyTableData'));
                }
            },
            setTime(timeStamp) {
                const date = new Date();
                date.setTime(timeStamp);
                const y = date.getFullYear();
                let m = date.getMonth() + 1;
                m = m < 10 ? (`0${m}`) : m;
                let d = date.getDate();
                d = d < 10 ? (`0${d}`) : d;
                return `${y}-${m}-${d}`;
            }
        }
    };
</script>

<style lang="less" scoped>
    h2 {
        font-size: 16px;
        font-weight: 500;
        color: #2F2D2E;
    }
</style>
