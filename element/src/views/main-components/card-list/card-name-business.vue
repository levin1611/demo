<template>
    <Card :body-style="{ padding: '0' }">
        <div class="my-name-card-business-wrapper">
            <!-- <div class="my-name-card-business-ladder"></div> -->
            <div class="my-name-card-business-intro">
                <div class="my-name-card-business-left">
                    <div style="width: 100%; justify-content: center; margin-top: 40px" class="_f">
                        <div class="card-standard-avatar-header">
                            <img v-if="c.portrait" :style="c.imgStyle" :src="c.portrait"/>
                            <!-- <img
                              v-else
                              class="card-business-avatar"
                              :style="c.imgStyle"
                              :src="require('@/assets/images/avatar.png')"
                            /> -->
                        </div>
                    </div>
                    <template v-if="c.userNameEn.realLength() + c.userNameCh.realLength() > 30">
                        <p class="my-name-card-business-enname">{{ c.userNameEn }}</p>
                        <p class="my-name-card-business-chname">{{ c.userNameCh }}</p>
                    </template>
                    <template v-else>
                        <span class="my-name-card-business-enname">
                            {{ c.userNameEn }}
                            <span class="my-name-card-business-chname" v-if="c.userNameCh">&nbsp; / {{ c.userNameCh }}</span>
                        </span>
                    </template>
                    <span class="my-name-card-business-position">{{ c.position }}</span>
                </div>

                <!-- 二维码 -->
                <div class="my-card-bussiness">
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
            <div class="my-name-card-business-information">
                <div class="my-name-card-business-top" style="margin-bottom: 18px">
                    <div class="my-name-card-business-content" v-if="c.phone">
                    <span class="_card_label">{{ c.phoneCountryCode }}{{ c.phone }}</span>
                        <span class="custom custom-dianhua2 _icon_bussiness_base"></span>
                    </div>
                    <div class="my-name-card-business-content" v-if="c.whatsApp">
                        <span class="_card_label">{{ c.whatsAppCountryCode }}{{ c.whatsApp }}</span>
                        <span class="custom custom-WhatsApp3 _icon_bussiness_base"></span>
                    </div>
                    <div class="my-name-card-business-content" v-if="c.email">
                        <span class="_card_label">{{ c.email }}</span>
                        <span class="custom custom-youxiang _icon_bussiness_base"></span>
                    </div>
                    <div class="my-name-card-business-content" v-if="c.mmlink">
                        <span class="_card_label">{{ c.mmlink }}</span>
                        <span class="custom custom-messenger _icon_bussiness_base"></span>
                    </div>
                    <div class="my-name-card-business-content" v-if="c.companyUrl">
                        <span class="_card_label">{{ c.companyUrl }}</span>
                        <span class="custom custom-dizhi1 _icon_bussiness_base"></span>
                    </div>
                </div>
                <div class="my-name-card-business-bottom">
                    <div style="width: 100%; height: 1px"></div>
                    <div style="width: 100%">
                        <div class="my-name-card-business-line">
                            <div class="my-name-card-business-line-back"></div>
                        </div>
                        <p class="my-name-card-business-company-oneline">
                            {{ c.companyName }}
                        </p>
                        <p class="company-address">{{ c.companyAddress }}</p>
                    </div>
                </div>
            </div>
        </div>
    </Card>
</template>

<script>
    export default {
        name: 'showNameCardBusiness',
        props: {
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
            }
        },
        data() {
            return {
            };
        },
        methods: {
            getImgRef() {
                return this.$refs.customImg;
            }
        }
    };
</script>
