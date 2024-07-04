<template>
    <div style="padding:20px;">
        <div v-for="row in table_data"
             v-loading="loading"
             class="contact-detail">
            <!-- 遍历渲染数据 -->
            <div v-for="item in computed_table_columns"
                 :key="item.key"
                 class="contact-detail-item">
                <!-- 属性名 -->
                <div class="detail-item-title">{{ item.title }}</div>
                <!-- 属性值 -->
                <template v-if="item.key === 'nickName'">
                    <div @click="clickRow(row)"
                         class="detail-item-content-nickname">{{ row[item.key] }}</div>
                </template>
                <template v-else-if="item.key === 'socialNetworkingPlatform'">
                    <div class="detail-item-content">
                        <div v-for="i in row.socialNetworkingPlatform"
                             class="chat-detail-contact-list">
                            <span class="chat-detail-contact-platform">{{ i.attrName }}</span>
                            <span class="chat-detail-contact-platform-value">{{ i.attrValue }}</span>
                        </div>
                    </div>
                </template>
                <template v-else-if="item.formatter">
                    <div class="detail-item-content">{{ (item.formatter)(row) }}</div>
                </template>
                <template v-else>
                    <div class="detail-item-content">{{ row[item.key] }}</div>
                </template>
            </div>
            <!-- 主联系人 -->
            <div v-if="type !== 'customer'"
                 class="contact-detail-item">
                <div class="detail-item-title">{{ $t('crm.Modal.mainContact') }}</div>
                <div class="detail-item-content">{{ row.isMainContact ? $t('yes') : $t('no') }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'contactList',
        props: [
            'id',
            'type',
            'flag_update_contact',
            'contact_columns_authorized'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height'
            }), // 从 vuex 中获取属性
            url_get_contact_list() {
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        return '/crm/contacts/getContactsListByCompany';
                    case 'inquiry':
                        return 'crm/contacts/getContactsListByInquiry';
                    default:
                        return '';
                }
            },
            computed_table_columns() {
                let temp = this.table_columns.slice();

                const default_cols = ['createTime'];
                const authorized_cols = Array.isArray(this.contact_columns_authorized.default) ? this.contact_columns_authorized.default.filter(item => !item.manually).map(item => item.storageName).concat(default_cols) : default_cols;
                temp = temp.filter(item => authorized_cols.includes(item.key));
                return temp;
            }
        },
        data() {
            return {
                table_data: [],
                table_columns: [
                    {
                        title: this.$t('crm.Table.col_nickName'),
                        key: 'nickName',
                        width: 110
                    },
                    {
                        title: this.$t('crm.Table.col_jobTitle'),
                        key: 'jobTitle',
                        width: 80
                    },
                    {
                        title: this.$t('crm.Table.col_email'),
                        key: 'email',
                        width: 120
                    },
                    {
                        title: this.$t('crm.Table.col_socialNetworkingPlatform'),
                        key: 'socialNetworkingPlatform',
                        width: 200
                    },
                    {
                        title: this.$t('crm.Table.col_phone'),
                        key: 'phone',
                        width: 80
                    },
                    {
                        title: this.$t('crm.Table.col_createTime'),
                        key: 'createTime',
                        width: 130,
                        formatter: row => {
                            return this.$options.filters.timeFormat(row.createTime, 'DateTime');
                        }
                    }
                ],
                page_no: 1,
                page_size: 20,
                total_num: 0,
                loading: true // 加载图标
            };
        },
        methods: {
            get_contact_list() {
                this.loading = true;
                this.table_data = [];
                util.ajax({
                    url: this.url_get_contact_list,
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        id: this.id,
                        // pageNo: this.page_no,
                        // pageSize: this.page_size,
                        listType: this.type === 'highseasCustomer' ? 1 : 0
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.total_num = (response.data.data && response.data.data.total) ? response.data.data.total : 0;
                        if (response.data.data && Array.isArray(response.data.data.list)) {
                            this.table_data = response.data.data.list.map(item => {
                                const platform = JSON.parse(item.socialNetworkingPlatform);
                                item.socialNetworkingPlatform = platform;
                                Object.assign(item, { isMainContact: item.isMainContact === 1 });
                                return item;
                            });
                        }
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_getSubordinateContact'));
                    }
                    this.loading = false;
                });
            },
            change_page_size(pageSize) {
                this.page_no = 1;
                this.page_size = pageSize;
                this.get_contact_list();
            },
            change_page(page) {
                if (page <= Math.ceil(this.total_num / this.page_size)) {
                    this.page_no = page;
                    this.get_contact_list();
                }
            },
            clickRow(data) {
                localStorage.setItem('leadsCloud-contactId', data.id);
                window.open(this.$rootRouter.resolve({
                    name: 'myContact'
                }).href, '_blank');
            }
        },
        created() {
            this.get_contact_list();
        },
        watch: {
            id() {
                this.get_contact_list();
            }
        }
    };
</script>

<style lang="less" scoped>
    .contact-detail {
        font-size: 12px;
        margin-bottom: 20px;

        .contact-detail-item {
            padding: 4px 0;

            .detail-item-title {
                display: inline-block;
                width: 80px;
                vertical-align: top;
            }

            .detail-item-content {
                display: inline-block;
                width: calc(~"100% - 80px");
            }

            .detail-item-content-nickname {
                display: inline-block;
                // width: calc(~"100% - 80px");
                color: #3b78de !important;
                cursor: pointer;

                &:hover {
                    color: #2d63bc !important;
                    text-decoration: underline;
                }
            }
        }
    }

    .chat-detail-contact-platform {
        width: 85px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: inline-block;
        height: 24px;
        vertical-align: middle;
    }

    .chat-detail-contact-platform-value {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: inline-block;
        height: 24px;
        vertical-align: middle;
    }
</style>
