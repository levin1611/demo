<template>
    <div class="edit-card-container">
        <Row style="height: 100%;">
            <ElCol :span="24" class="_f _a_c">
                <ElCol :span="20">
          <span class="_f _r">
            <span v-for="(item,index) in compoList" :key="index" :label="item.label" :name="item.value"
                  class="base-button" :class="{'is-active': item.value === view}" @click.stop="view = item.value">
              <span class="text">{{ item.label }}</span>
            </span>
          </span>
                </ElCol>
                <ElCol :span="4" style="text-align: right">
                    <Button @click="goBack" class="edit_goback">{{ $t('myNameCard.back') }}</Button>
                </ElCol>
            </ElCol>

            <ElCol :span="24" style="padding: 0 18px">
                <div v-show="view === '1'">
                    <div class="edit-card-head">
                        <div>
                            <Button size="large"
                                    style="background-color: #FFFFFF;border: 1px solid #ABBFD5;border-radius: 4px;color: rgba(0,0,0,0.80);"
                                    class="edit_upload" @click="uploadTrigger">
                                <img :src="require('@/assets/images/export.svg')"/>
                                {{ $t('myNameCard.uploadAvatar') }}
                            </Button>
                            <input type="file" multiple :accept="foribidden" style="display: none" ref="uploadEl"
                                   @change="previewImage"/>
                            <div class="edit-card-image">{{ $t('myNameCard.uploadToltip') }}</div>
                            <div class="image-preview">
                                <div class="_f _r _a_s" v-if="storeCrop.portrait">
                                    <div class="image-item">
                                        <cropper v-if="cropperShow" ref="cropperImg" @updateView="updateView"
                                                 @updateImgData="updateImgData" :img="storeCrop.portrait" width="222px"
                                                 height="222px"></cropper>
                                    </div>
                                    <p class="my-name-card-business-line"></p>
                                    <div class="_f _a_c _c" style="margin-left: 20px">
                                        <div class="_f _j_c _a_c"
                                             style="width:222px;height:222px;border:1px solid #eff0f4">
                                            <div class="show-preview" style="transform: scale(0.5);"
                                                 :style="{'width': storeCrop.previews.w + 'px', 'height': storeCrop.previews.h + 'px',  'overflow': 'hidden', 'margin-left': '20px', 'border-radius': '50%', 'border': '1px solid #eaeaea'}">
                                                <div style="margin-left:0;border:1px solid #eff0f4"
                                                     :style="storeCrop.previews.div">
                                                    <img :src="storeCrop.previews.url" :style="storeCrop.previews.img">
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            style="width:100%;font-size:12px;color:rgba(0,0,0,0.6);text-align:center;margin-top:10px">
                                            显示尺寸：76px*76px
                                        </div>
                                    </div>
                                </div>
                                <div v-if="!storeCrop.portrait && form.portrait">
                                    <div class="picture-item" style="margin-left:0;border:1px solid #eff0f4">
                                        <img style="cursor: default;" :src="form.portrait"/>
                                    </div>
                                    <div
                                        style="width:100%;font-size:12px;color:rgba(0,0,0,0.6);text-align:center;margin-top:10px">
                                        显示尺寸：76px*76px
                                    </div>
                                </div>
                                <div v-if="!form.portrait" class="default-item" style="text-align:center">
                                    <span>{{ $t('myNameCard.chooseAvatar') }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="edit-card-button">
                            <Button type="success" @click="handleUpload" :disabled="!storeCrop.portrait"
                                    class="piwik_save__card_name edit_conserve">{{ $t('myNameCard.save') }}
                            </Button>
                        </div>
                    </div>
                </div>
                <div v-show="view === '2'">
                    <div class="edit-card-person">
                        <Form ref="form" :model="form" label-width="100px" @submit.native.prevent>
                            <FormItem :label="$t('myNameCard.name')" prop="userNameCh">
                                <div v-on:mouseover="mouseover('modifyUserNameCh')"
                                     v-on:mouseout="mouseout('modifyUserNameCh')">
                                    <div class="edit-card-span" ref="hideuserNameCh">
                                        <span>{{ form.userNameCh ? form.userNameCh : '-' }}</span>
                                        <button class="edit-card-modify-button edit_modify" ref="modifyUserNameCh"
                                                @click="toModify('userNameCh')">{{ $t('myNameCard.edit') }}
                                        </button>
                                    </div>
                                    <div class="edit-card-modify" ref="showuserNameCh">
                                        <ElInput type="text" style="width: 300px;" v-model="form.userNameCh"></ElInput>
                                        <Button type="success" style="margin-left: 20px"
                                                class="piwik_save__card_name edit_change"
                                                @click="changeInformation('userNameCh',30)">{{ $t('save') }}
                                        </Button>
                                        <Button style="margin-left: 20px" type="minor"
                                                @click="cancelChange('userNameCh')">{{ $t('cancel') }}
                                        </Button>
                                    </div>
                                </div>
                            </FormItem>
                            <FormItem :label="$t('myNameCard.enName')">
                                <div v-on:mouseover="mouseover('modifyUserNameEn')"
                                     v-on:mouseout="mouseout('modifyUserNameEn')">
                                    <div class="edit-card-span" ref="hideuserNameEn">
                                        <span>{{ form.userNameEn ? form.userNameEn : '-' }}</span>
                                        <button class="edit-card-modify-button edit_modify" ref="modifyUserNameEn"
                                                @click="toModify('userNameEn')">{{ $t('myNameCard.edit') }}
                                        </button>
                                    </div>
                                    <div class="edit-card-modify" ref="showuserNameEn">
                                        <ElInput type="text" style="width: 300px;" v-model="form.userNameEn"></ElInput>
                                        <Button type="success" style="margin-left: 20px"
                                                class="piwik_save__card_name edit_change"
                                                @click="changeInformation('userNameEn',50)">{{ $t('save') }}
                                        </Button>
                                        <Button style="margin-left: 20px" type="minor"
                                                @click="cancelChange('userNameEn')">{{ $t('cancel') }}
                                        </Button>
                                    </div>
                                </div>
                            </FormItem>
                            <FormItem :label="$t('myNameCard.mobile')">
                                <div v-on:mouseover="mouseover('modifyPhone')" v-on:mouseout="mouseout('modifyPhone')">
                                    <div class="edit-card-span" ref="hidephone">
                                        <span>{{ form.phone ? (`${phoneCountryCode} ${form.phone}`) : '-' }}</span>
                                        <button class="edit-card-modify-button edit_modify" ref="modifyPhone"
                                                @click="toModify('phone')">{{ $t('myNameCard.edit') }}
                                        </button>
                                    </div>
                                    <div class="edit-card-modify" ref="showphone">
                                        <Select v-model="phoneCountryCode" style="width:220px">
                                            <Option v-for="(item, index) in countryCodes" :key="index"
                                                    :value="item.code" :label="item.name"></Option>
                                        </Select>
                                        <ElInput type="text" style="width: 150px;margin-left:5px"
                                                 v-model="form.phone"></ElInput>
                                        <Button type="success" style="margin-left: 20px"
                                                class="piwik_save__card_name edit_change"
                                                @click="changeInformation('phone',20)">{{ $t('save') }}
                                        </Button>
                                        <Button style="margin-left: 20px" type="minor" @click="cancelChange('phone')">
                                            {{ $t('cancel') }}
                                        </Button>
                                    </div>
                                </div>
                            </FormItem>
                            <FormItem :label="$t('myNameCard.title')" prop="position">
                                <div v-on:mouseover="mouseover('modifyPosition')"
                                     v-on:mouseout="mouseout('modifyPosition')">
                                    <div class="edit-card-span" ref="hideposition">
                                        <span>{{ form.position ? form.position : '-' }}</span>
                                        <button class="edit-card-modify-button edit_modify" ref="modifyPosition"
                                                @click="toModify('position')">{{ $t('myNameCard.edit') }}
                                        </button>
                                    </div>
                                    <div class="edit-card-modify" ref="showposition">
                                        <ElInput type="text" style="width: 300px;" v-model="form.position"></ElInput>
                                        <Button type="success" style="margin-left: 20px"
                                                class="piwik_save__card_name edit_change"
                                                @click="changeInformation('position',50)">{{ $t('save') }}
                                        </Button>
                                        <Button style="margin-left: 20px" type="minor"
                                                @click="cancelChange('position')">{{ $t('cancel') }}
                                        </Button>
                                    </div>
                                </div>
                            </FormItem>
                            <FormItem label="m.me" prop="me">
                                <div v-on:mouseover="mouseover('modifyMmlink')"
                                     v-on:mouseout="mouseout('modifyMmlink')">
                                    <div class="edit-card-span" ref="hidemmlink">
                                        <span>{{ form.mmlink ? `m.me/${form.mmlink}` : '-' }}</span>
                                        <button class="edit-card-modify-button edit_modify" ref="modifyMmlink"
                                                @click="toModify('mmlink')">{{ $t('myNameCard.edit') }}
                                        </button>
                                    </div>
                                    <div class="edit-card-modify" ref="showmmlink">
                                        <span>m.me/</span>
                                        <ElInput type="text" style="width: 300px;" v-model="form.mmlink"></ElInput>
                                        <Button type="success" style="margin-left: 20px"
                                                class="piwik_save__card_name edit_change"
                                                @click="changeInformation('mmlink',50)">{{ $t('save') }}
                                        </Button>
                                        <Button style="margin-left: 20px" type="minor" @click="cancelChange('mmlink')">
                                            {{ $t('cancel') }}
                                        </Button>
                                        <div class="edit-card-tip">提示：可修改为Facebook账号ID或Username</div>
                                    </div>
                                </div>
                            </FormItem>
                            <FormItem label="WhatsApp">
                                <div class="edit-card-span whatsApp-form"  ref="hidewhatsApp">
                                    <span>{{ form.whatsApp ? (whatsAppCountryCode ? whatsAppCountryCode + form.whatsApp : '+' + form.whatsApp) : '-' }}</span>
                                    <button class="edit-card-modify-button edit_modify"
                                            @click="toModify('whatsApp')">{{ $t('myNameCard.edit') }}
                                    </button>
                                </div>
                                <div class="edit-card-modify" ref="showwhatsApp">
                                    <Select v-model="whatsAppCountryCode" style="width:220px">
                                        <Option v-for="(item, index) in countryCodes" :key="index"
                                                :value="item.code" :label="item.name"></Option>
                                    </Select>
                                    <ElInput type="text" style="width: 150px;margin-left:5px"
                                                v-model="form.whatsApp"></ElInput>
                                    <Button type="success" style="margin-left: 20px"
                                            class="piwik_save__card_whatsApp edit_change"
                                            @click="changeInformation('whatsApp',20)">{{ $t('save') }}
                                    </Button>
                                    <Button style="margin-left: 20px" type="minor" @click="cancelChange('whatsApp')">
                                        {{ $t('cancel') }}
                                    </Button>
                                </div>
                                <!-- <button v-if="!form.whatsApp" class="edit-card-to-whatsapp edit_towhatsapp"
                                        @click="toWhatsApp()">{{ $t('myNameCard.toBind') }}
                                </button> -->
                            </FormItem>
                            <FormItem :label="$t('myNameCard.email')">
                                <p :model="form.email"></p>
                                <div v-on:mouseover="mouseover('modifyEmail')" v-on:mouseout="mouseout('modifyEmail')">
                                    <div class="edit-card-span" ref="hideemail">
                                        <span>{{ form.email ? form.email : '-' }}</span>
                                        <button class="edit-card-modify-button edit_modify" ref="modifyEmail"
                                                @click="toModify('email')">{{ $t('myNameCard.edit') }}
                                        </button>
                                    </div>
                                    <div class="edit-card-modify" ref="showemail">
                                        <ElInput type="text" style="width: 300px;" v-model="form.email"></ElInput>
                                        <Button type="success" style="margin-left: 20px"
                                                class="piwik_save__card_name edit_change"
                                                @click="changeInformation('email',200)">{{ $t('save') }}
                                        </Button>
                                        <Button style="margin-left: 20px" type="minor" @click="cancelChange('email')">
                                            {{ $t('cancel') }}
                                        </Button>
                                    </div>
                                </div>
                            </FormItem>
                            <!-- 二维码类型设置 -->
                            <FormItem :label="$t('per_setting.qrCode')">
                                <Checkbox v-model="form.waQr"
                                          @change="changeInformation('waQr')">{{ $t('per_setting.qrCode_wa') }}</Checkbox>
                                <Checkbox v-model="form.facebookQr"
                                          @change="changeInformation('facebookQr')">{{ $t('per_setting.qrCode_messenger') }}</Checkbox>
                            </FormItem>
                        </Form>
                    </div>
                </div>
                <div v-show="view === '3'">
                    <div class="edit-card-person">
                        <Form ref="form" :model="form" :label-width="labelWidth" @submit.native.prevent>
                            <FormItem :label="$t('myNameCard.companyName')">
                                <div v-on:mouseover="mouseover('modifyCompanyName')"
                                     v-on:mouseout="mouseout('modifyCompanyName')">
                                    <div class="edit-card-span" ref="hidecompanyName">
                                        <span>{{ form.companyName ? form.companyName : '-' }}</span>
                                        <button class="edit-card-modify-button edit_modify" ref="modifyCompanyName"
                                                @click="toModify('companyName')">{{ $t('myNameCard.edit') }}
                                        </button>
                                    </div>
                                    <div class="edit-card-modify" ref="showcompanyName">
                                        <ElInput type="text" style="width: 300px;" v-model="form.companyName"></ElInput>
                                        <Button type="success" style="margin-left: 20px"
                                                class="piwik_save__card_name edit_change"
                                                @click="changeInformation('companyName',300)">{{ $t('save') }}
                                        </Button>
                                        <Button style="margin-left: 20px" type="minor"
                                                @click="cancelChange('companyName')">{{ $t('cancel') }}
                                        </Button>
                                    </div>
                                </div>
                            </FormItem>
                            <FormItem :label="$t('myNameCard.companyWeb')">
                                <div v-on:mouseover="mouseover('modifyCompanyUrl')"
                                     v-on:mouseout="mouseout('modifyCompanyUrl')">
                                    <div class="edit-card-span" ref="hidecompanyUrl">
                                        <span>{{ form.companyUrl ? form.companyUrl : '-' }}</span>
                                        <button class="edit-card-modify-button edit_modify" ref="modifyCompanyUrl"
                                                @click="toModify('companyUrl')">{{ $t('myNameCard.edit') }}
                                        </button>
                                    </div>
                                    <div class="edit-card-modify" ref="showcompanyUrl">
                                        <ElInput type="text" style="width: 300px;" v-model="form.companyUrl"></ElInput>
                                        <Button type="success" style="margin-left: 20px"
                                                class="piwik_save__card_name edit_change"
                                                @click="changeInformation('companyUrl',200)">{{ $t('save') }}
                                        </Button>
                                        <Button style="margin-left: 20px" type="minor"
                                                @click="cancelChange('companyUrl')">{{ $t('cancel') }}
                                        </Button>
                                    </div>
                                </div>
                            </FormItem>
                            <FormItem :label="$t('myNameCard.companyAdd')">
                                <div v-on:mouseover="mouseover('modifyCompanyAddress')"
                                     v-on:mouseout="mouseout('modifyCompanyAddress')">
                                    <div class="edit-card-span" ref="hidecompanyAddress">
                                        <span>{{ form.companyAddress ? form.companyAddress : '-' }}</span>
                                        <button class="edit-card-modify-button edit_modify" ref="modifyCompanyAddress"
                                                @click="toModify('companyAddress')">{{ $t('myNameCard.edit') }}
                                        </button>
                                    </div>
                                    <div class="edit-card-modify" ref="showcompanyAddress">
                                        <ElInput type="text" style="width: 300px;"
                                                 v-model="form.companyAddress"></ElInput>
                                        <Button type="success" style="margin-left: 20px"
                                                class=" piwik_save__card_name edit_change"
                                                @click="changeInformation('companyAddress',300)">{{ $t('save') }}
                                        </Button>
                                        <Button style="margin-left: 12px" type="minor"
                                                @click="cancelChange('companyAddress')">{{ $t('cancel') }}
                                        </Button>
                                    </div>
                                </div>
                            </FormItem>
                        </Form>
                    </div>
                </div>
            </ElCol>
        </Row>
    </div>
</template>

<script>
// 基于原编辑进行组件迁移和部分修改，欧~
    import { mapState } from 'vuex';
    // import UploadPicture from '@/views/crm/Briefcase/Components/uploadPicture.vue';
    import * as qiniu from 'qiniu-js';
    import util from '@/libs/util';
    import {
        getCardInfo,
        updateCardUserInfo,
        getPhoneCountryCode
    } from '@/api/personal-set/my-card-name';
    import Utils from '@/utils';
    import cropper from '@/components/img-cropper';

    /** 判断长度 垃圾 */
    // eslint-disable-next-line no-extend-native
    String.prototype.realLength = function() {
        // eslint-disable-next-line no-control-regex
        return this.replace(/[^\x00-\xff]/g, '**').length; // [^\x00-\xff] - 匹配非双字节的字符
    };

    export default {
        name: 'editNameCard',
        components: {
            cropper
        // UploadPicture
        },
        data() {
            return {
                view: '1',
                phoneCountryCode: '',
                whatsAppCountryCode: '',
                storeCrop: {
                    previews: {},
                    cropBlob: '',
                    portrait: ''
                },
                cropperShow: true,
                form: {
                    userNameCh: '',
                    userNameEn: '',
                    phone: '',
                    position: '',
                    whatsApp: '',
                    mmlink: '',
                    email: '',
                    companyName: '',
                    companyUrl: '',
                    companyAddress: '',
                    portrait: '',
                    waQr: false,
                    facebookQr: false
                },
                countryCodesOrigin: [],
                imageUrl: {},
                files: {}
            };
        },
        created() {
            this.init();
        },
        computed: {
            ...mapState({
                user_id: (state) => state.userId,
                enterpriseId: (state) => state.enterpriseId,
                qiniuHttp: (state) => state.qiniuHttp
            }),
            lang() {
                return this.$store.state.app.lang;
            },
            foribidden() {
                return ['image/png', 'image/jpg', 'image/gif', 'image/jpeg'];
            },
            compoList() {
                return [
                    { value: '1', label: this.$t('myNameCard.avatar') },
                    { value: '2', label: this.$t('myNameCard.personalSet') },
                    { value: '3', label: this.$t('myNameCard.companyInfo') }
                ];
            },
            labelWidth() {
                return this.lang === 'en-US' ? '130px' : '100px';
            },
            countryCodes() {
                const lang = this.lang === 'en-US';
                return this.countryCodesOrigin.map((v) => ({
                    ...v,
                    name: `${lang ? v.ename : v.cname} ${v.code}`
                }));
            }
        },
        methods: {
            updateView() {
                this.cropperShow = false;
                this.$nextTick(function() {
                    this.cropperShow = true;
                });
            },
            updateImgData(data) {
                if (!data) return false;
                this.storeCrop = { ...this.storeCrop, ...data };
            },
            async getPhoneCountryCode() {
                const res = await getPhoneCountryCode();
                if (res.code === '1') {
                    this.countryCodesOrigin = res.data || [];
                    if (this.phoneCountryCode === '') {
                        const item = res.data.find((v) => v.defaultShow === 1);
                        if (item) {
                            this.phoneCountryCode = item.code;
                        }
                    }
                }
            },
            async init(val = 'all') {
                const res = await getCardInfo({
                    orgId: this.enterpriseId,
                    userId: this.user_id
                });
                if (res.code === '1') {
                    const data = res.data;
                    if (val === 'all') {
                        this.form = {
                            userNameCh: data.userNameCh,
                            userNameEn: data.userNameEn,
                            phone: data.phone,
                            position: data.position,
                            mmlink: data.mmlink,
                            whatsApp: data.whatsApp,
                            email: data.email,
                            companyName: data.companyName,
                            companyUrl: data.companyUrl,
                            companyAddress: data.companyAddress,
                            portrait: data.portrait,
                            waQr: data.waQr === 1,
                            facebookQr: data.facebookQr === 1
                        // portrait: ''
                        };
                    } else {
                        if (this.form[val] !== undefined) {
                            this.form[val] = data[val];
                        }
                    }
                    if (this.$dym.isJSON(data.phoneCountryCode)) {
                        this.phoneCountryCode = JSON.parse(data.phoneCountryCode).code;
                    } else {
                        this.phoneCountryCode = '';
                    }
                    if (data.whatsAppCountryCode && this.$dym.isJSON(data.whatsAppCountryCode)) {
                        this.whatsAppCountryCode = JSON.parse(data.whatsAppCountryCode).code;
                    } else {
                        this.whatsAppCountryCode = '';
                    }
                    if (val === 'all') {
                        this.getPhoneCountryCode();
                    }
                } else {
                    this.$Message.error(res.data.message);
                }
            },
            change_view(name) {
                this.view = name;
            // this.$nextTick(() => {
            //     this.view = name;
            // });
            },
            // 返回我的名片
            goBack() {
                this.$emit('update:showField', 0);
            },
            // 保存修改信息
            async changeInformation(val, len) {
                const data = {
                    userId: this.user_id,
                    userNameCh: this.form.userNameCh,
                    [val]: this.form[val]
                };
                let tipMessage = '修改信息成功';
                if (val === 'phone') {
                    // const areaPhone = this.countryCodes.map(v => v.code)
                    const phone = this.form[val];
                    if (!Utils.regExp.fullPhone.test(phone) || phone.startsWith('+')) {
                        this.$Message.error('手机号格式不正确');
                        return;
                    }
                    data.phoneCountryCode = JSON.stringify(this.countryCodesOrigin.find((v) => v.code === this.phoneCountryCode));
                }
                if (val === 'whatsApp') {
                    if (!this.whatsAppCountryCode) {
                        this.$Message.error('请选择whatsApp区号');
                        return;
                    }
                    const whatsApp = this.form[val];
                    if (!Utils.regExp.whatsApp.test(whatsApp) || whatsApp.startsWith('+')) {
                        this.$Message.error('whatsApp号格式不正确');
                        return;
                    }
                    data.whatsAppCountryCode = this.whatsAppCountryCode ? JSON.stringify(this.countryCodesOrigin.find((v) => v.code === this.whatsAppCountryCode)) : '';
                    if (this.form.waQr) {
                        data.waQr = 1;
                    }
                    tipMessage = 'WhatsApp 号码保存成功';
                }
                if (['waQr', 'facebookQr'].includes(val)) {
                    // 二维码是否显示, 值为 Boolean , 特殊处理, 不需要做为空和超长校验
                    // 把 Boolean 值转为 0 / 1
                    data[val] = this.form[val] ? 1 : 0;
                    if (val === 'waQr') {
                        data.whatsApp = this.form.whatsApp;
                    }
                } else if (val !== 'mmlink') {
                    // mmlink 可以为空
                    if (this.form[val] === null || this.form[val].trim() === '') {
                        this.$Message.error('不能为空');
                        return;
                    } else if (this.form[val].realLength() > Number(len)) {
                        this.$Message.error(`最大字符长度为${len}`);
                        return;
                    }
                } else {
                    if (this.form[val].realLength() > Number(len)) {
                        this.$Message.error(`最大字符长度为${len}`);
                        return;
                    }
                }

                const res = await updateCardUserInfo(data);
                if (res.code === '1') {
                    this.$Message.success(tipMessage);
                    if (val === 'portrait') {
                        this.storeCrop.portrait = '';
                    }
                    if (this.$refs[`show${val}`]) {
                        this.$refs[`show${val}`].style.display = 'none';
                        this.$refs[`hide${val}`].style.display = 'block';
                    }
                } else if (res.code === '-40206') {
                    this.$Message.error('手机格式不正确');
                } else if (res.code === '-40211') {
                    this.$Message.error('邮箱格式不正确');
                } else if (res.code === '-40227') {
                    this.$Message.error('m.me 连接格式不正确');
                } else if (res.code === '-40215') {
                    this.$Message.error('域名格式不正确,必须带有http 或 https的完整域名');
                } else {
                    this.$Message.error('操作失败');
                }
            },
            // 取消保存
            cancelChange(val) {
                this.init(val);
                this.$refs[`show${val}`].style.display = 'none';
                this.$refs[`hide${val}`].style.display = 'block';
            },
            // 鼠标滑入
            mouseover(val) {
                this.$refs[val].style.display = 'inline-block';
            },
            // 鼠标滑出
            mouseout(val) {
                this.$refs[val].style.display = 'none';
            },
            toModify(val) {
                this.$refs[`show${val}`].style.display = 'block';
                this.$refs[`hide${val}`].style.display = 'none';
            },
            toWhatsApp() {
                window.open(
                    this.$router.resolve({
                        name: 'whatsapp_chat'
                    }).href,
                    '_blank'
                );
            },
            uploadTrigger() {
                this.$refs.uploadEl.value = '';
                this.$refs.uploadEl.click();
            },
            previewImage(event) {
                const files = event.target.files;
                this.files = event.target.files;
                if (files && files.length) {
                    if (files.length > 1) {
                        this.$Message.error({
                            message: `${this.$t('crm.Modal.info_canOnlyUpload')}1${this.$t('crm.Modal.info_NumberOfPicture')}`,
                            duration: 5000,
                            closable: true
                        });
                        return;
                    } else if (Number(files[0].size) > 3 * 1024 * 1024) {
                        this.$Message.error({
                            message: '请上传小于3M图片!',
                            duration: 5000,
                            closable: true
                        });
                        return;
                    }
                    const types = files[0].type;
                    if (!this.foribidden.some(v => v === types)) {
                        this.$Message.error({
                            message: this.$t('myNameCard.uploadToltip'),
                            duration: 5000,
                            closable: true
                        });
                        return false;
                    }
                    console.clear();
                    console.log(files);
                    this.storeCrop.portrait = window.URL.createObjectURL(files[0]);
                // const preUrl = window.URL.createObjectURL(files[0]);
                // this.$set(this.form, 'portrait', preUrl);
                }
            },
            handleUpload() {
                // const files = this.files;
                // if (files && files.length) {
                //     // 获取 token 后批量发送上传请求
                //     if (files.length) {
                util
                    .ajax({
                        url: '/file-sys/api/uptoken',
                        method: 'post'
                    })
                    .then((response) => {
                        if (response.data) {
                            const token = response.data.uptoken;
                            // for (let i = 0; i < files.length; i++) {
                            //     this.upload(files[i], token);
                            this.upload(this.storeCrop.cropBlob, token);
                        // }
                        } else {
                            this.$Message.warning(this.$t('error_getUploadToken'));
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        this.$Message.error(this.$t('crm.Modal.error_uploadImage'));
                    });
            //     }
            // }
            },
            async upload(file, token) {
                if (file) {
                    const config = {
                        useCdnDomain: true,
                        region: qiniu.region.z0
                    };
                    const putExtra = {
                        fname: '',
                        params: {},
                        mimeType: ['image/png', 'image/jpeg', 'image/gif', 'image/jpg']
                    };
                    // let key = file.name;
                    // 添加上传dom面板
                    const next = (response) => {
                    // let index = this.pictures.findIndex(item => item.uploading && item.name === name);
                    // if (index !== -1) {
                    //     this.$set(this.pictures, index, Object.assign(this.pictures[index], {uploadPercent: response.total.percent}));
                    // }
                    };
                    const error = (response) => {
                        console.error(response);
                        if (
                            response.message === 'file type doesn\'t match with what you specify'
                        ) {
                            this.$Message.error('仅支持上传JPG、动态GIF和PNG格式图片!');
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_uploadImage'));
                        }
                    };
                    const complete = (response) => {
                        const url = `${this.qiniuHttp}${response.key}`;
                        this.form.portrait = url;
                        this.changeInformation('portrait');
                    };

                    // 调用sdk上传接口获得相应的observable，控制上传和暂停
                    const observable = await this.$qiniuUpload(
                        file,
                        null,
                        putExtra,
                        config,
                        token
                    );

                    // 开始上传
                    observable.subscribe(next, error, complete);
                }
            },

            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            imgRemove(index) {
                this.pictures.splice(index, 1);
            }
        }
    };
</script>

<style scoped lang="scss">
    @import "~@/styles/moduleScss/person-setting/my-name-card-business";

    .base-button {
        padding: 10px 15px;
        // width: 7em;
        font-size: 14px;
        display: inline-block;
        color: rgba(0, 0, 0, 0.6);
        cursor: pointer;
    }

    .text {
        display: inline-block;
        width: 100%;
        text-align: center;
        padding-bottom: 5px;
        border-bottom: 2px solid rgba(0, 0, 0, 0);
    }

    .is-active {
        color: #fa8241;
        font-weight: bold;

        .text {
            border-bottom: 2px solid #fa8241;
        }
    }
    .whatsApp-form {
        &:hover{
            .edit-card-modify-button {
                display: inline-block;
            }
        }
    }
</style>
