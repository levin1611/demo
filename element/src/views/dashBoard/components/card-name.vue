<template>
    <div class="my-name-card-wrapper">
        <div class="my-name-card-standard-dash">
            <div ref="screen" class="my-name-card-screen">
                <standard :c="mapping" ref="nameCards" :objectFit="true" :showEdit="true" style="border-radius: 8px">
                </standard>
            </div>
        </div>
        <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"/>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import standard from '@/views/main-components/card-list/card-name-standard';
    import { getCardInfo } from '@/api/personal-set/my-card-name';
    import deleteIcon from './deleteIcon';
    export default {
        name: 'showNameCardDashBoard',
        props: [
        ],
        components: {
            standard,
            deleteIcon
        },
        data() {
            return {
                radio: 1,
                contain: {
                    phoneCountryCode: '',
                    companyName: '',
                    companyUrl: '',
                    userNameEn: '',
                    userNameCh: '',
                    phone: '',
                    position: '',
                    email: '',
                    whatsApp: '',
                    mmlink: '',
                    portrait: '',
                    mmImage: '',
                    waImage: '',
                    companyAddress: '',
                    waQr: false,
                    facebookQr: false,
                    whatsAppCountryCode: ''
                },
                imgStyle: {}

            };
        },
        computed: {
            ...mapState({
                user_id: state => state.userId,
                enterpriseId: state => state.enterpriseId,
            }),
            mapping() {
                return {
                    ...this.contain,
                    imgStyle: this.imgStyle
                };
            },
            isConfig() {
                return this.$store.state.dashboard.isConfiguring;
            },
            isPersonalSet() {
                return this.$route.path
            }

        },
        created() {
            this.init();
        },
        watch: {
        },
        methods: {
            checkCnChart(val) {
                return /.*[\u4e00-\u9fa5]+.*$/.test(val);
            },
            subStringByLen(str = '', len = 0) {
                if (!str || typeof str !== 'string') return str;
                str = String(str).trim();
                str = str.length < len ? str : `${str.substring(0, len)}...`;
                return str;
            },
            filterString(val = '', c = {}) {
                const { cn = 200, en = 200 } = c;
                return this.subStringByLen(val, this.checkCnChart(val) ? cn : en);
            },
            formatNum(val) {
                if (!val) return val;
                const str = val.split('-');
                return str.length > 1 ? `+${str[0]} ${val[1]}` : val;
            },
            async init() {
                const res = await getCardInfo({
                    orgId: this.enterpriseId,
                    userId: this.user_id
                });
                if (res.code === '1') {
                    const data = res.data;
                    this.imgStyle = {};
                    this.$nextTick(function() {
                        this.updateBaseData(data);
                    });
                } else {
                    this.$Message.error(res.message);
                }
            },
            updateBaseData(data) {
                const companyName = this.radio === 1 ? { cn: 40, en: 60 } : { cn: 43, en: 68 };
                const companyAddress = this.radio === 1 ? { cn: 65, en: 115 } : { cn: 45, en: 75 };
                this.contain.companyAddress = this.filterString(data.companyAddress || '', companyAddress);
                this.contain.companyName = this.filterString(data.companyName || '', companyName);
                this.contain.portrait = data.portrait || require('@/assets/images/avatar.svg');
                this.contain.mmlink = data.mmlink ? `m.me/${data.mmlink}` : data.mmlink;
                this.contain.whatsApp = this.formatNum(data.whatsApp);
                this.contain.phone = this.formatNum(data.phone);
                this.contain.companyUrl = data.companyUrl;
                this.contain.userNameEn = data.userNameEn;
                this.contain.userNameCh = data.userNameCh;
                this.contain.position = data.position;
                this.contain.mmImage = data.mmImage;
                this.contain.waImage = data.waImage;
                this.contain.email = data.email;
                this.contain.waQr = data.waQr === 1;
                this.contain.facebookQr = data.facebookQr === 1;
                if (data.phoneCountryCode && this.$dym.isJSON(data.phoneCountryCode)) {
                    this.contain.phoneCountryCode = JSON.parse(data.phoneCountryCode).code;
                } else {
                    this.contain.phoneCountryCode = '';
                }
                if (data.whatsAppCountryCode && this.$dym.isJSON(data.whatsAppCountryCode)) {
                    this.contain.whatsAppCountryCode = JSON.parse(data.whatsAppCountryCode).code;
                } else {
                    this.contain.whatsAppCountryCode = '';
                }
                // if (!this.imgStyle.top) {
                //     this.$nextTick(function() {
                //         this.$refs.nameCards.getImgRef().onload = (event) => {
                //             this.updateImgStyle();
                //         };
                //     });
                // }
            },
            updateImgStyle() {
                if (!this.$refs.nameCards) return false;
                const img = this.$refs.nameCards.getImgRef();
                if (!img) return false;
                this.imgStyle = this.$dym.getObjectFitSize(false, 76, 76, img.width, img.height);
            },
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard', 'nameCard');
            }
        }
    };
</script>
