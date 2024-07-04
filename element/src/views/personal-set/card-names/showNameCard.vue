<template>
  <div class="my-name-card-wrapper" style="height:100%">
    <div class="my-name-card-background">
      <div class="my-name-card-head">
        <div>
          <RadioGroup v-model="radio" fill="#7B98B6">
            <RadioButton :label="1">{{$t('myNameCard.standard')}}</RadioButton>
            <RadioButton :label="2">{{$t('myNameCard.business')}}</RadioButton>
          </RadioGroup>
          <Tooltip class="item" effect="dark"  placement="top">
            <span slot="content">{{$t('myNameCard.toltip')}}</span>
            <span style="margin-left: 10px;vertical-align: text-bottom;color:#A9B9C9" class="custom custom-question-tip"></span>
          </Tooltip>
        </div>
        <div>
          <Icon custom="custom custom-field-edit" class="card_edit" size="18" style="cursor: pointer;margin: 10px 20px 0 0;" @click="toEdit"></Icon>
          <Button type="primary" style="float:right;" @click="doScreeenShots" class="card_download">{{$t('myNameCard.generate')}}</Button>
        </div>
      </div>
    </div>
    <div class="my-name-card-standard name-card-margin" v-if="radio === 1">
      <div ref="screen" class="my-name-card-screen" style="box-shadow: 0 2px 12px 0 rgba(0,0,0,.1)">
        <standard :c="mapping" ref="nameCards" style="height:360px;"></standard>
      </div>
    </div>
    <div class="my-name-card-business name-card-margin" v-else>
      <div ref="screen" id="screen">
        <business :c="mapping" ref="nameCards"></business>
      </div>
    </div>

  </div>
</template>

<script>
    import { mapState } from 'vuex';
    import html2canvas from 'html2canvas';
    import business from '@/views/main-components/card-list/card-name-business';
    import standard from '@/views/main-components/card-list/card-name-standard';
    import { getCardInfo } from '@/api/personal-set/my-card-name';

    // 为了保证以前的暂不修改
    // eslint-disable-next-line no-extend-native
    String.prototype.realLength = function() {
        // eslint-disable-next-line no-control-regex
        return this.replace(/[^\x00-\xff]/g, '**').length; // [^\x00-\xff] - 匹配非双字节的字符
    };
    export default {
        name: 'showNameCard',
        props: [
            'showField'
        ],
        components: {
            business,
            standard
        },
        data() {
            return {
                radio: 1,
                contain: {
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
                    asdasd: '',
                    companyAddress: '',
                    phoneCountryCode: '',
                    waQr: false,
                    facebookQr: false,
                    whatsAppCountryCode: ''
                },
                storeOrign: {},
                imgStyle: {}

            };
        },
        computed: {
            ...mapState({
                user_id: state => state.userId,
                enterpriseId: state => state.enterpriseId
            }),
            mapping() {
                return {
                    ...this.contain,
                    imgStyle: this.imgStyle
                };
            }

        },
        created() {
            this.init();
        },
        watch: {
            radio() {
                this.updateBaseData(this.storeOrign);
            }
        },
        mounted() {
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
                // let data = {
                //     orgId: this.enterpriseId,
                //     userId: this.user_id,
                // }
                // util.axios.get(`http://api-cloudshare.leadscloud.com/cloudshare/cardManage/checkUserInfoExists?orgId=${this.enterpriseId}&userId=${this.user_id}`)
                //     .then(response => {
                const res = await getCardInfo({
                    orgId: this.enterpriseId,
                    userId: this.user_id
                });
                if (res.code === '1') {
                    const data = res.data;
                    this.storeOrign = data;
                    this.imgStyle = {};
                    this.$nextTick(() => {
                        this.updateBaseData(data);
                    });
                } else {
                    this.$Message.error(res.message);
                }
            },
            updateBaseData(data) {
                // const companyName = this.radio === 1 ? { cn: 40, en: 60 } : { cn: 43, en: 68 };
                // const companyAddress = this.radio === 1 ? { cn: 65, en: 115 } : { cn: 45, en: 75 };
                // this.contain.companyAddress = this.filterString(data.companyAddress || '', companyAddress);
                // this.contain.companyName = this.filterString(data.companyName || '', companyName);
                this.contain.companyAddress = data.companyAddress;
                this.contain.companyName = data.companyName;
                this.contain.portrait = data.portrait || require('@/assets/images/avatar.png');
                this.contain.mmlink = data.mmlink ? `m.me/${data.mmlink}` : data.mmlink;
                this.contain.whatsApp = this.formatNum(data.whatsApp);
                this.contain.phone = this.formatNum(data.phone);
                this.contain.companyUrl = data.companyUrl;
                this.contain.userNameEn = data.userNameEn;
                this.contain.userNameCh = data.userNameCh;
                this.contain.position = data.position;
                this.contain.email = data.email;
                this.contain.mmImage = data.mmImage;
                this.contain.waImage = data.waImage;
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
                if (!this.imgStyle.top) {
                    this.$nextTick(function() {
                        this.$refs.nameCards.getImgRef().onload = (event) => {
                            this.updateImgStyle();
                        };
                    });
                }
            },
            updateImgStyle() {
                this.$nextTick(function() {
                    if (!this.$refs.nameCards) return false;
                    const img = this.$refs.nameCards.getImgRef();
                    if (!img) return false;
                    this.imgStyle = this.$dym.getObjectFitSize(false, 76, 76, img.width, img.height);
                    this.$forceUpdate();
                });
            },
            toEdit() {
                this.$emit('update:showField', 1);
            },
            /**
             * @Description: html2canvas截图
             * @author 翟敏
             * @date 2020/6/3
            */
            doScreeenShots() {
                html2canvas(this.$refs.screen, {
                    // html2canvas(document.getElementById("screen"),{
                    backgroundColor: '#FFFFFF',
                    background: '#FFFFFF',
                    border: 0,
                    removeContainer:false,
                    useCORS: true, // 如果截图的内容里有图片,可能会有跨域的情况,加上这个参数,解决文件跨域问题
                    allowTaint: false, // 允许跨域（图片跨域相关）
                    taintTest: true, // 是否在渲染前测试图片
                    ignoreElements: (element) => {
                        if (element.id === 'bgMusic' || element.id === 'fbMusic' || element.id === 'wsMusic' || element.id === 'emMusic' || element.id === 'v-step-0' || element.id === 'main-header-con' || element.class === 'template-modal' || element.class === 'v-tour' || element.role === 'tooltip' ||  element.class === 'is-always-shadow') return true;
                    }
                }).then((canvas) => {
                    const imageurl = canvas.toDataURL('image/png');
                    // console.log(imageurl)
                    //$('#demoImg').attr('src',imageurl) ;
                    // console.log('imageurl', imageurl);
                    // 这里需要自己选择命名规则
                    const imagename = 'business-card';
                    this.fileDownload(imageurl, imagename);
                });
            },
            /**
             * @Description: 下载截屏图片
             * @author 翟敏
             * @date 2020/6/3
            */
            fileDownload(downloadUrl, downloadName) {
                const aLink = document.createElement('a');
                aLink.style.display = 'none';
                aLink.href = downloadUrl;
                aLink.download = `${downloadName}.png`;
                // 触发点击-然后移除
                document.body.appendChild(aLink);
                aLink.click();
                document.body.removeChild(aLink);
            }
        }
    };
</script>
<style lang="scss" scoped>
.name-card-margin {
  margin: 30px 30px 0 30px;
}
</style>
