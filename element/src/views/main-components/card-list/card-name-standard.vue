<template>
    <!-- <Card > -->
    <div class="el-card" :class="{'is-always-shadow': iconShow}">
        <div style="padding: 40px;box-sizing:border-box;" @mouseenter="showIcon(true)" @mouseleave="showIcon(false)">
            <div style="width: 100%;position:relative">
                <span class="my-name-card-standard-intro">{{ c.companyName }}</span>
                <Icon custom="piwik_edit__card_name custom custom-field-edit" v-show="iconShow&&iconFlag"
                      class="card_edit" size="14"
                      style="cursor: pointer;margin: 10px 20px 0 0;position:absolute;top:-35px;right:-43px"
                      @click.stop="toEditePage"></Icon>
            </div>
            <div>
                    <slot></slot>
                </div>
            <div class="my-name-card-head-box">
                <div class="_f _r" style="flex: 1;">
                    <div class="card-standard-avatar-header">
                        <img v-if="c.portrait&&!objectFit" :src="c.portrait" :style="c.imgStyle" ref="customImg"/>
                        <img v-else :src="(c.portrait || require('@/assets/images/avatar.svg'))"
                             style="object-fit: cover;width:100%;height:100%" ref="customImg"/>
                    </div>
                    <div class="my-name-card-infor">
                        <div class="my-name-card-name-box">
                            <span :class="c.userNameEn.realLength() + c.userNameEn.realLength()> 30 ? 'my-name-card-name' : 'my-name-card-name-nodian'">{{ c.userNameEn }}</span>
                            <span
                                :class="c.userNameEn.realLength() + c.userNameEn.realLength()> 30 ? 'my-name-card-name' : 'my-name-card-name-nodian'"
                                style="font-size: 20px"
                                v-if="c.userNameCh"
                            >&nbsp;/ {{ c.userNameCh }}</span>
                        </div>
                        <span class="my-name-card-position" style="margin-top: 5px">{{ c.position }}</span>
                    </div>
                </div>

                <!-- 二维码 -->
                <div v-if="c.waQr || c.facebookQr"
                     class="qrCode-container">
                    <!-- wa -->
                    <div v-if="c.waQr && c.waImage"
                         :class="{'my-name-card-qrcode-ma-single': !(c.facebookQr && c.mmImage)}"
                         class="my-name-card-qrcode-ma qrcode-ma-bg">
                        <img :src="`data:image/png;base64,${c.waImage}`" alt/>
                    </div>
                    <!-- messenger -->
                    <div v-if="c.facebookQr && c.mmImage"
                         :class="{'my-name-card-qrcode-ma-single': !(c.waQr && c.waImage)}"
                         class="my-name-card-qrcode-ma qrcode-ma-bg">
                        <img :src="`data:image/png;base64,${c.mmImage}`" alt/>
                    </div>
                </div>
            </div>
            <div class="my-name-card-information-box">
                <div class="my-name-card-information">
                    <div class="destory-flex">
                        <div class="_conten_base _width-100" v-if="c.phone">
                            <span class="custom custom-dianhua1 _card_icon"></span>
                            <span class="_card_label">{{ `${c.phoneCountryCode} ` }}{{ c.phone }}</span>
                        </div>
                        <div class="_conten_base _width-100" v-if="c.email">
                            <span class="custom custom-youjian1 _card_icon"></span>
                            <span class="_card_label">{{ c.email }}</span>
                        </div>
                    </div>
                    <div class="destory-flex">
                        <div class="_conten_base _width-100" v-if="c.whatsApp">
                            <span class="custom custom-WhatsApp2 _card_icon"></span>
                            <span class="_card_label">{{ c.whatsAppCountryCode }}{{ c.whatsApp }}</span>
                        </div>
                        <div class="_conten_base _width-100" v-if="c.mmlink">
                            <span class="custom custom-Messenger _card_icon"></span>
                            <span class="_card_label">{{ c.mmlink }}</span>
                        </div>
                    </div>
                    <div class="_conten_base _width-100" v-if="c.companyUrl">
                        <span class="custom custom-wangzhan1 _card_icon"></span>
                        <span class="_card_label _card_label-100">{{ c.companyUrl }}</span>
                    </div>
                    <div class="_conten_base _width-100" v-if="c.companyAddress">
                        <span class="custom custom-gongsi _card_icon"></span>
                        <span class="_card_label _card_label-100">{{ c.companyAddress }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- </Card> -->
</template>

<script>
    export default {
        name: 'showNameCardStandard',
        props: {
            objectFit: {
                type: Boolean,
                default: false
            },
            c: {
                type: Object,
                require: true,
                default: () => ({
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
                    storeOrign: {},
                    imgStyle: {},
                    waQr: false,
                    facebookQr: false
                })
            },
            showEdit: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                iconFlag: false
            };
        },
        computed: {
            iconShow() {
                return this.showEdit;
            }
        },
        methods: {
            getImgRef() {
                return this.$refs.customImg;
            },
            showIcon(flag) {
                this.iconFlag = flag;
            },
            toEditePage() {
                this.$router.push({
                    // path: '/personal-set',
                    name: 'set',
                    params: {
                        name: 'cardName',
                        action: 'edit'
                    }
                });
            }
        }
    };
</script>
