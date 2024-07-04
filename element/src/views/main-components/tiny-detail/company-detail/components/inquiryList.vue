<template>
    <div style="padding:20px;">
        <div v-for="item in table_data"
             v-loading="loading"
             @click="clickRow(item)"
             class="inquiry-detail">
            <div class="inquiry-detail-item">
                <div class="detail-item-title">{{ $t('crm.Table.col_seqNumber') }}</div>
                <div class="detail-item-content">{{ item.seqNumber }}</div>
            </div>
            <div class="inquiry-detail-item">
                <div class="detail-item-title">{{ $t('crm.Table.col_productCategory') }}</div>
                <div v-text="$options.filters.parseArray(item.productCategory).length ? $options.filters.parseArray(item.productCategory).join(', ') : item.productCategory"
                     class="detail-item-content"></div>
            </div>
            <div class="inquiry-detail-item">
                <div class="detail-item-title">{{ $t('crm.Table.col_demandProducts') }}</div>
                <div class="detail-item-content">{{ item.demandProducts }}</div>
            </div>
            <div class="inquiry-detail-item">
                <div class="detail-item-title">{{ $t('crm.Table.col_grouping') }}</div>
                <div class="detail-item-content">{{ item.grouping }}</div>
            </div>
            <div class="inquiry-detail-item">
                <div class="detail-item-title">{{ $t('crm.Table.col_inquiryManagers') }}</div>
                <div class="detail-item-content">{{ item.userNamesShow }}</div>
            </div>
            <div class="inquiry-detail-item">
                <div class="detail-item-title">{{ $t('crm.Table.col_createTime') }}</div>
                <div class="detail-item-content">{{ new Date(item.createTime).format($lang === 'zh-CN' ? 'yyyy年MM月dd日 hh:mm:ss' : 'yyyy-MM-dd hh:mm:ss') }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'inquiryList',
        props: [
            'id',
            'type',
            'flag_update_inquiry',
            'email'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                button_list: state => state.app.button_list
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu'
            ]),
            url_get_inquiry_list() {
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        return '/crm/inquiry/getInquiryListByCompany';
                    case 'contact':
                        return '/crm/inquiry/getInquiryByContactsId';
                    default:
                        return '';
                }
            }
        },
        data() {
            return {
                table_data: [],
                page_no: 1,
                page_size: 20,
                total_num: 0,
                loading: true // 加载图标
            };
        },
        methods: {
            get_inquiry_list() {
                this.loading = true;
                this.table_data = [];
                util.ajax({
                    url: this.url_get_inquiry_list,
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        companyId: this.id,
                        contactsId: this.id,
                        pageNo: this.page_no,
                        pageSize: this.page_size,
                        listType: this.type === 'highseasCustomer' ? 0 : 1
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.total_num = (response.data.data && response.data.data.total) ? response.data.data.total : 0;
                        this.table_data = (response.data.data && Array.isArray(response.data.data.list)) ? response.data.data.list : [];
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getInquiryTableData'));
                    }
                    this.loading = false;
                });
            },
            clickRow(data) {
                this.jumpToInquiry(data.id);
            },
            jumpToInquiry(id) {
                if (!this.isContainsMenu('myInquiry')) {
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyInquiry'));
                } else {
                    if (id) {
                        localStorage.setItem('leadsCloud-inquiryId', id);
                        window.open(this.$router.resolve({
                            name: 'myInquiry'
                        }).href, '_blank');
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_inquiryId'));
                    }
                }
            }
        },
        created() {
            this.get_inquiry_list();
        },
        watch: {
            id() {
                this.get_inquiry_list();
            }
        }
    };
</script>

<style lang="less" scoped>
    .inquiry-detail {
        font-size: 12px;
        margin-bottom: 20px;
        cursor: pointer;

        .inquiry-detail-item {
            padding: 4px 0;

            .detail-item-title {
                display: inline-block;
                width: 80px;
            }

            .detail-item-content {
                display: inline-block;
                width: calc(~"100% - 80px");
            }
        }
    }
</style>
