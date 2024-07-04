<template>
    <div style="padding:20px;">
        <div v-for="item in columns_default"
             style="padding:4px 0;">
            <div style="display:inline-block;width:30%;font-size:12px;">{{ item.cname }}</div>
            <div style="display:inline-block;width:70%;font-size:12px;">
                <template v-if="item.colType === 'picture' && detailInfo[item.storageName]">
                    <template>
                        <div v-for="img in detailInfo[item.storageName].split(';')"
                             class="demo-upload-list">
                            <img :src="img"
                                 @click="imgPreview">
                        </div>
                    </template>
                </template>
                <template v-else-if="item.colType === 'textarea'">
                    <p v-text="detailInfo[item.storageName]"></p>
                </template>
                <template v-else-if="item.colType === 'starLevel'">
                    <p>
                        <Rate :value="detailInfo[item.storageName]"
                              disabled
                              :icon-classes="['custom custom-star', 'custom custom-star', 'custom custom-star']"
                              disabled-void-icon-class="custom custom-star"></Rate>
                    </p>
                </template>
                <template v-else-if="item.colType === 'label'">
                    <p v-if="detailInfo[item.storageName]">
                        <SoftTag v-for="labelItem in detailInfo[item.storageName]"
                                 :key="labelItem.attrId"
                                 :color="labelItem.attrValue || '#4285F4'"
                                 style="margin: 0 8px 8px 0;">{{ labelItem.attrName }}</SoftTag>
                    </p>
                </template>
                <template v-else-if="item.colType === 'socialNetworkingPlatform'">
                    <p v-for="platform in $options.filters.parseArray(detailInfo[item.storageName])">
                        {{ platform.attrName + ': ' + platform.attrValue }}</p>
                </template>
                <template v-else-if="item.colType === 'gender'">
                    <p v-text="detailInfo[item.storageName] === '1' ? $t('crm.Modal.male') : detailInfo[item.storageName] === '2' ? $t('crm.Modal.female') : ''"></p>
                </template>
                <template v-else>
                    <p v-text="detailInfo[item.storageName]"></p>
                </template>
            </div>
        </div>
        <div v-for="item in columns_custom"
             style="padding:4px 0;font-size:12px;">
            <div style="display:inline-block;width:30%;">{{ item.cname }}</div>
            <div style="display:inline-block;width:70%;">
                <template v-if="item.colType === 'date'">
                    <p>{{ detailInfo[item.storageName] | timeFormat }}</p>
                </template>
                <template v-else-if="item.colType === 'date+time'">
                    <p>{{ detailInfo[item.storageName] | timeFormat('DateTime') }}</p>
                </template>
                <template v-else-if="item.colType === 'selectMultiple'">
                    <p v-text="$options.filters.parseArray(detailInfo[item.storageName]).join(', ')"></p>
                </template>
                <template v-else>
                    <p v-text="detailInfo[item.storageName]"></p>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import Vue from 'vue';
    import { mapState } from 'vuex';

    export default {
        name: 'detailInfo',
        props: [
            'type',
            'id',
            'columns_authorized',
            'flag_update_detail'
        ],
        computed: {
            ...mapState([
                'enterpriseId'
            ]),
            url_request_detail() {
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        return '/crm/company/get';
                    case 'inquiry':
                        return '/crm/inquiry/get';
                    case 'contact':
                        return '/crm/contacts/get';
                    default:
                        return '';
                }
            },
            columns_default() {
                if (this.columns_authorized.default) {
                    return this.columns_authorized.default.map(item => {
                        if (item.colType === 'textarea') {
                            item.span = 24;
                        } else {
                            item.span = 12;
                        }
                        return item;
                    });
                }
                return [];
            },
            columns_custom() {
                if (this.columns_authorized.custom) {
                    return this.columns_authorized.custom.filter((item, i) => {
                        return item.isShow === 1;
                    });
                }
                return [];
            }
        },
        data() {
            return {
                detailInfo: {},
                loading: true
            };
        },
        methods: {
            getDetail() {
                if (this.url_request_detail) {
                    util.ajax({
                        url: this.url_request_detail,
                        method: 'post',
                        data: {
                            id: this.id
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.detailInfo = response.data.data;
                            this.getDivision(this.detailInfo.countryArea);
                            if (this.type === 'inquiry') {
                                this.getLabels();
                            }
                        } else {
                            this.$Message.error(this.$t('crm.Detail.error_getCompanyInfo'));
                        }
                        this.loading = false;
                    });
                } else {
                    this.$Message.error(this.$t('crm.newDetail.error_urlRequest'));
                    this.loading = false;
                }
            },
            getLabels() {
                this.detailInfo.label = [];
                util.ajax({
                    url: '/crm/attrRelation/getList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        belongId: this.id,
                        belongTable: 3,
                        typeId: 8
                    }
                }).then(response => {
                    this.detailInfo.label = response.data.data;
                });
            },
            getDivision(divCode) {
                if (divCode) {
                    util.ajax({
                        url: '/report/country/getDetailByCode',
                        method: 'post',
                        data: {
                            divCode
                        }
                    }).then(res => {
                        if (res.data.code === '1' && res.data.data.length) {
                            switch (res.data.data.length) {
                                case 1:
                                    this.$nextTick(() => {
                                        const item = res.data.data[0];
                                        if (item.divisionCode !== 'unknown') {
                                            this.detailInfo.countryArea = Vue.config.lang === 'zh-CN' ? `【${item.countryName}】  ${item.divisionCnname}` : `【${item.countryEnname}】  ${item.divisionEnname}`;
                                        } else {
                                            this.detailInfo.countryArea = Vue.config.lang === 'zh-CN' ? `【${item.countryName}】` : `【${item.countryEnname}】`;
                                        }
                                    });
                                    break;
                                case 2:
                                    this.$nextTick(() => {
                                        const province = res.data.data[0];
                                        const city = res.data.data[1];
                                        // 都是中国城市且邮政编码前两位相同(省级相同)
                                        if (province.countryCode === 'CN' && city.countryCode === 'CN' && province.divisionCode.slice(0, 2) === city.divisionCode.slice(0, 2)) {
                                            this.detailInfo.countryArea = Vue.config.lang === 'zh-CN' ? `【中国】 ${province.divisionCnname}-${city.divisionCnname}` : `【China】 ${province.divisionEnname}-${city.divisionEnname}`;
                                        }
                                    });
                                    break;
                            }
                        } else {
                            this.$Message.warning(this.$t('global.info_countryAreaFormat'));
                        }
                    });
                }
            },
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            }
        },
        created() {
            this.loading = true;
            this.getDetail();
        },
        watch: {
            id() {
                this.loading = true;
                this.getDetail();
            }
        }
    };
</script>
