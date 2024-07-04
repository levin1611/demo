<template>
    <div>
        <Modal title="预览"
               :visible.sync="prviewVisible"
               :modal-append-to-body="false"
               :before-close="handleClose"
               >
                <div class="cloud-preview-head">
                    <div class="cloud-preview-card">
                        <img v-if="portrait" :src="portrait"
                             style="border-radius: 50%;width: 76px;height: 76px;background: #FFFFFF;object-fit:cover;">
                        <svg v-else class="chat-svg-avatar" aria-hidden="true">
                            <use xlink:href="#custom-visitor-avatar"></use>
                        </svg>
                        <div class="cloud-preview-infor">
                            <span class="cloud-preview-name">{{userNameEn}}/{{userNameCh}}</span>
                            <span class="cloud-preview-position">{{position}} </span>
                            <span class="cloud-preview-position">{{companyUrl}}</span>
                        </div>
                    </div>
                    <div v-if="waQr || facebookQr"
                         class="cloud-preview-qrcode">
                        <img v-if="waQr && waImage"
                             :src="`data:image/png;base64,${waImage}`" alt="">
                        <img v-if="facebookQr && mmImage"
                             :src="`data:image/png;base64,${mmImage}`" alt="">
                    </div>
                    <div class="cloud-preview-signal">
                        <div v-if="phone" class="cloud-preview-circle cloud-preview-dianhua">
                            <a :href="`tel:${phone}`" target="_blank">
                                <Icon size="16"
                                      class="custom custom-dianhua" style="color:#FA8241;"></Icon>
                                <!-- <Icon class="custom custom-dianhua" style="color:#FA8241 ;font-size: 18px;" @click="$stm.openWindow(`tel:${phone}`)"></Icon> -->
                            </a>
                        </div>
                        <div v-if="mmlink" class="cloud-preview-circle cloud-preview-mme">
                            <a :href="`http://m.me/${mmlink}`" target="_blank">
                                <svg class="svg-icon" aria-hidden="true">
                                    <use xlink:href="#custom-Fb-messenger"></use>
                                </svg>
                            </a>
                        </div>
                        <div v-if="whatsApp" class="cloud-preview-circle cloud-preview-whatsapp">
                            <!-- <a :href="`https://api.WhatsApp.com/send?phone=+${whatsApp}`" target="_blank"> -->
                            <Icon size="16"
                                  custom="custom custom-WhatsApp1" style="cursor: pointer;color:#39C34C;" @click.stop="$stm.openWindow(`https://api.WhatsApp.com/send?phone=+${whatsApp}`)"></Icon>
                            <!-- </a> -->
                        </div>
                        <div v-if="email" class="cloud-preview-circle cloud-preview-email">
                            <a :href="`mailto:${email}`" target="_blank">
                                <Icon custom="custom custom-email" size="12" style="cursor: pointer;color:#677F99;"></Icon>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="cloud-preview-body">
                    <span class="cloud-preview-title">{{title}}</span>
                    <pre class="cloud-preview-text" v-if="!editorContent">{{des}}</pre>
                    <pre class="cloud-preview-text-nostyle" v-html="editorContent"></pre>
                    <div class="cloud-preview-img-box">
                        <img class="cloud-preview-img" :src="images || tabPreview || require('./images/report_big.png')" alt="">
                        <!-- <img class="cloud-preview-img" src="./images/report_big.png" alt=""> -->
                        <div class="cloud-preview-svg">
                            <!-- <svg class="svg-icon custom" aria-hidden="true" v-if="suffix === 'pdf'" style="display: inline-block;font-size:30px;">
                                <use xlink:href="#custom-PDF"></use>
                            </svg>
                            <svg class="svg-icon custom" aria-hidden="true" v-else-if="suffix === 'ppt' || suffix === 'pptx'" style="display: inline-block;font-size:30px;">
                                <use xlink:href="#custom-PPT"></use>
                            </svg>
                            <svg class="svg-icon custom" aria-hidden="true" v-else-if="suffix === 'xlsx' || suffix === 'xls'" style="display: inline-block;font-size:30px;">
                                <use xlink:href="#custom-Excel"></use>
                            </svg>
                            <svg class="svg-icon custom" aria-hidden="true" v-else-if="suffix === 'doc' || suffix === 'docx'" style="display: inline-block;font-size:30px;">
                                <use xlink:href="#custom-Word"></use>
                            </svg>
                            <svg class="svg-icon custom" aria-hidden="true" v-else-if="suffix === 'csv'" style="display: inline-block;font-size:30px;">
                                <use xlink:href="#custom-CSV"></use>
                            </svg>
                            <svg class="svg-icon" aria-hidden="true" v-else-if="suffix === 'jpg'" style="width: 24px; height: 24px">
                                <use xlink:href="#custom-JPG"></use>
                            </svg>
                            <svg class="svg-icon" aria-hidden="true" v-else-if="suffix === 'png'" style="width: 24px; height: 24px">
                                <use xlink:href="#custom-PNG"></use>
                            </svg>
                            <svg class="svg-icon" aria-hidden="true" v-else-if="suffix === 'gif'" style="width: 24px; height: 24px">
                                <use xlink:href="#custom-GIF"></use>
                            </svg>
                            <svg class="svg-icon custom" aria-hidden="true" v-else style="display: inline-block;font-size:30px;">
                                <use xlink:href="#custom-rect"></use>
                            </svg> -->
                            <fileNameIcon :iconName="suffix" :styles="{fontSize:'30px'}"></fileNameIcon>
                        </div>
                    </div>
                </div>
            <div class="cloud-preview-footer">
                <div class="cloud-preview-icon">
                    <svg class="svg-icon" aria-hidden="true">
                        <use xlink:href="#custom-cloud-facebook1"></use>
                    </svg>
                    <svg class="svg-icon" aria-hidden="true">
                        <use xlink:href="#custom-cloud-twitter"></use>
                    </svg>
                    <svg class="svg-icon" aria-hidden="true">
                        <use xlink:href="#custom-cloud-youjian"></use>
                    </svg>
                    <Poptip
                            placement="bottom-start"
                            title="分享"
                            trigger="hover">
                            <div class="cloud-share-container">
                                <div class="cloud-share-box">
                                    <svg class="svg-icon" aria-hidden="true" style="width: 22px;height: 22px;">
                                        <use xlink:href="#custom-Facebook1"></use>
                                    </svg>
                                    <span class="cloud-share-text">分享到Facebook</span>
                                </div>
                                <div class="cloud-share-box">
                                    <svg class="svg-icon" aria-hidden="true" style="width: 22px;height: 22px;">
                                        <use xlink:href="#custom-Twitter"></use>
                                    </svg>
                                    <span class="cloud-share-text">分享到Twitter</span>
                                </div>
                            </div>
                            <div class="cloud-share-container">
                                <div class="cloud-share-box">
                                    <svg class="svg-icon" aria-hidden="true" style="width: 22px;height: 22px;">
                                        <use xlink:href="#custom-youjian"></use>
                                    </svg>
                                    <span class="cloud-share-text">电子邮件</span>
                                </div>
                                <div class="cloud-share-box">
                                    <svg class="svg-icon" aria-hidden="true" style="width: 22px;height: 22px;">
                                        <use xlink:href="#custom-lianjie"></use>
                                    </svg>
                                    <span class="cloud-share-text">http://nyti.ms/1EnP55X</span>
                                </div>
                            </div>
                            <div class="cloud-share-container">
                                <div class="cloud-share-box">
                                    <svg class="svg-icon" aria-hidden="true" style="width: 22px;height: 22px;">
                                        <use xlink:href="#custom-in"></use>
                                    </svg>
                                    <span class="cloud-share-text">分享到Linkedin</span>
                                </div>
                                <div class="cloud-share-box">
                                    <svg class="svg-icon" aria-hidden="true" style="width: 22px;height: 22px;">
                                        <use xlink:href="#custom-xingzhuang"></use>
                                    </svg>
                                    <span class="cloud-share-text">分享到Reddit</span>
                                </div>
                            </div>
                            <div class="cloud-share-container">
                                <div class="cloud-share-box">
                                    <svg class="svg-icon" aria-hidden="true" style="width: 22px;height: 22px;">
                                        <use xlink:href="#custom-Printerest"></use>
                                    </svg>
                                    <span class="cloud-share-text">分享到Printerest</span>
                                </div>
                                <div class="cloud-share-box">
                                    <svg class="svg-icon" aria-hidden="true" style="width: 22px;height: 22px;">
                                        <use xlink:href="#custom-tumblr"></use>
                                    </svg>
                                    <span class="cloud-share-text">分享到Tumblr</span>
                                </div>
                            </div>
                        <svg class="svg-icon" aria-hidden="true" slot="reference">
                            <use xlink:href="#custom-cloud-zhuanfa"></use>
                        </svg>
                        </Poptip>
                </div>
                <div class="cloud-preview-chat">
                    <div class="cloud-preview-button">
                        <img src="./images/chat.svg" alt="">
                        <span>在线聊天</span>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    export default {
        name: 'cloudPushPreview',
        props: [
            'prviewVisible',
            'images'
        ],
        data() {
            return {
                portrait: '',
                userNameEn: '',
                userNameCh: '',
                position: '',
                companyUrl: '',
                mmImage: '',
                waImage: '',
                phone: '',
                email: '',
                mmlink: '',
                whatsApp: '',
                des: '',
                title: '',
                suffix: '',
                tabPreview: '',
                waQr: false,
                facebookQr: false,
                editorContent: ''
            };
        },
        created() {
            this.init();
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId
            })
        },
        methods: {
            init() {
                util.ajax233({
                    url: '/cardManage/checkUserInfoExists',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        userId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        const data = res.data.data;
                        this.portrait = data.portrait;
                        this.companyName = data.companyName;
                        this.companyUrl = data.companyUrl;
                        this.userNameEn = data.userNameEn;
                        this.userNameCh = data.userNameCh;
                        this.phone = data.phone;
                        this.position = data.position;
                        this.email = data.email;
                        this.mmlink = data.mmlink;
                        this.mmImage = data.mmImage;
                        this.waImage = data.waImage;
                        this.whatsApp = data.whatsApp;
                        this.waQr = data.waQr === 1;
                        this.facebookQr = data.facebookQr === 1;
                    } else {
                        this.$Message.error(res.data.message);
                    }
                });
            },
            // 新建、编辑里的分享预览
            getPrviewMsg(ruleForm, fileInfo) {
                this.title = ruleForm.title;
                this.des = ruleForm.des;
                this.editorContent = ruleForm.editStyle;
                console.log('des', this.des);
                this.suffix = fileInfo.suffix;
                // if()this.tabPreview
            },
            // 表格分享预览
            getPrviewRowMsg(row) {
                this.title = row.title;
                this.des = row.description;
                this.editorContent = row.editStyle;
                this.suffix = row.suffix;
                this.tabPreview = row.image;
            },
            handleClose() {
                this.$emit('changePreviewModel', false);
                console.log('关闭');
            }
        }
    };
</script>

<style scoped lang="less">
    .cloud-preview-head{
        display: flex;
        flex-direction: row;
        margin-bottom: 30px;

        .cloud-preview-card {
            flex: 1;

            display: flex;
            flex-direction: row;
            .chat-svg-avatar{
                width: 76px;
                height: 76px;
            }
            .cloud-preview-infor{
                display: flex;
                flex-direction: column;
                padding-left: 20px;
                justify-content: space-between;
                max-width: 270px;
                .cloud-preview-name{
                    width: 250px;
                    font-family: Aileron-Bold;
                    font-size: 22px;
                    color: rgba(0,0,0,0.80);
                    line-height: 32px;
                    overflow: hidden;
                    text-overflow:ellipsis;
                    white-space: nowrap;
                }
                .cloud-preview-position{
                    width: 250px;
                    font-family: Aileron-Regular;
                    font-size: 14px;
                    color: rgba(0,0,0,0.80);
                    letter-spacing: 0.2px;
                    line-height: 24px;
                    overflow: hidden;
                    text-overflow:ellipsis;
                    white-space: nowrap;
                }
            }
        }
    }
    .cloud-preview-qrcode{
        padding: 0 16px;
        display: flex;
        align-items: center;

        img {
            width: 50px;
            height: 50px;
            background: #FFFFFF;

            + img {
                margin-left: 12px;
            }
        }
    }
    .cloud-preview-signal {
        display: flex;
        align-items:center;
        padding-left: 16px;
        border-left: 1px solid #C8C8C8;

        > div {
            &:not(:first-child) {
                margin-left: 10px;
            }
        }

        .cloud-preview-circle {
            width: 32px;
            height: 32px;
            padding: 7px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }
        .cloud-preview-dianhua{
            border:1px solid #FA8241;
        }
        .cloud-preview-mme{
            border:1px solid #0080FF;
        }
        .cloud-preview-whatsapp{
            border:1px solid #39C34C;
        }
        .cloud-preview-email{
            border:1px solid #677F99;
        }
    }
    .cloud-preview-body{
        display: flex;
        flex-direction: column;
        .cloud-preview-title{
            font-family: PingFangSC-Medium;
            font-size: 14px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            padding-bottom: 9px;
        }
        .cloud-preview-text{
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 18px;
            padding-bottom: 9px;
            margin: 0;
        }
        .cloud-preview-text-nostyle{
            letter-spacing: 0;
            line-height: 18px;
            padding-bottom: 9px;
            margin: 0;
        }
        .cloud-preview-img-box{
            position: relative;
            .cloud-preview-img{
                width: 100%;
                padding-bottom: 9px;
            }
            .cloud-preview-svg{
                position: absolute;
                top:13px;
                right: 13px;
            }
        }
    }
    .cloud-preview-footer{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 10px;
        .cloud-preview-icon{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 124px;
            .svg-icon{
                width: 21px;
                height:21px;
                vertical-align: middle;
            }
        }
        .cloud-preview-chat{
            .cloud-preview-button{
                display: flex;
                flex-direction: row;
                align-items:center;
                justify-content: space-between;
                border: 1px solid #45619D;
                background: #45619D;
                border-radius: 21px;
                width: 140px;
                height: 42px;
                padding: 7px 16px;
                span{
                    font-family: PingFangSC-Medium;
                    font-size: 16px;
                    color: #FFFFFF;
                    letter-spacing: 0;
                }
            }
        }
    }
    .cloud-share-container{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        .cloud-share-box{
            display: flex;
            flex-direction: row;
            width: 186px;
            align-items: center;
            margin-bottom: 9px;
            .cloud-share-text{
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0,0,0,0.80);
                letter-spacing: 0;
                line-height: 18px;
                margin-left: 10px;
            }
        }
    }
    * /deep/ .el-dialog{
        width: 700px;
        .el-dialog__body{
            padding: 10px 30px;
        }
    }
</style>
