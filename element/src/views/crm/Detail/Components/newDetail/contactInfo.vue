<template>
    <div v-loading="loading"
         class="contactInfo">

        <!-- 操作按钮 -->
        <div class="contact-info-operate-btns">
            <!-- 编辑联系人 -->
            <Button v-if="authorized_button['editContact']"
                    type="text"
                    icon="custom custom-field-edit"
                    :title="$t('crm.Modal.title_editContact')"
                    @click="editContact"></Button>
            <!-- 查看联系人日志 -->
            <Button type="text"
                    icon="custom custom-crm-log"
                    :title="$t('crm.Modal.title_contactLog')"
                    @click="viewContactLog"></Button>
            <!-- 二维码 -->
            <Button type="text"
                    icon="custom custom-qrcode"
                    :title="$t('crm.newDetail.title_scanQRCode')"
                    @click="viewQRCode"></Button>
        </div>

        <!-- 联系人标题 -->
        <div @click="viewContact"
             class="contact-info-item piwik_companyDetail_jumpContact">
            <!-- 联系人姓名 -->
            <TooltipAuto :content="isHaveNameField ? detailInfo.nickName : '****'"
                         class="contact-info-item-nickName"></TooltipAuto>

            <!-- 主联系人标识 -->
            <Icon v-if="detailInfo.isMainContact"
                  custom="custom custom-main-contact"
                  size="15"
                  color="#F5A623"
                  class="contact-info-item-mainContact"></Icon>
        </div>

        <!-- 遍历渲染数据 -->
        <div v-for="item in computed_columns_all"
             :key="item.storageName"
             class="contact-info-item">
            <p class="contact-info-item-title">{{ item.cname }}</p>
            <template v-if="!isHighSeas && item.storageName === 'whatsApp' && detailInfo[item.storageName]">
                <!-- 点击打开 wa 回复框 -->
                <p @click="openGlobalWaReplyModal(detailInfo[item.storageName], $event)"
                   v-text="detailInfo[item.storageName] || '-'"
                   class="contact-info-item-content header-source"></p>
            </template>
            <template v-else-if="item.colType === 'picture' && detailInfo[item.storageName]">
                <div class="demo-upload-list"
                     v-for="img in detailInfo[item.storageName].split(';')">
                    <img :src="img" @click="imgPreview">
                </div>
            </template>
            <template v-else-if="item.colType === 'textarea'">
                <p class="contact-info-item-content textAreaShow" v-text="detailInfo[item.storageName]?detailInfo[item.storageName]:'-'"></p>
            </template>
            <template v-else-if="item.colType === 'starLevel'">
                <p class="contact-info-item-content">
                    <Rate :value="detailInfo[item.storageName]"
                          disabled
                          :icon-classes="['custom custom-star', 'custom custom-star', 'custom custom-star']"
                          disabled-void-icon-class="custom custom-star"></Rate>
                </p>
            </template>
            <template v-else-if="item.colType === 'socialNetworkingPlatform'">
                <div class="contact-info-item-content" v-if="$options.filters.parseArray(detailInfo[item.storageName]).length">
                    <p v-for="platform in $options.filters.parseArray(detailInfo[item.storageName])">{{ platform.attrName + ': ' + platform.attrValue }}</p>
                </div>
                <p class="contact-info-item-content" v-else> - </p>
            </template>
            <template v-else-if="item.colType === 'gender'">
                <p class="contact-info-item-content"
                   v-text="detailInfo[item.storageName] === '1' ? $t('crm.Modal.male') : detailInfo[item.storageName] === '2' ? $t('crm.Modal.female') : '-'"></p>
            </template>
            <template v-else-if="item.colType === 'date'">
                <p class="contact-info-item-content" v-if="detailInfo[item.storageName]">{{ detailInfo[item.storageName] | timeFormat }}</p>
                <p class="contact-info-item-content" v-else> - </p>
            </template>
            <template v-else-if="item.colType === 'date+time'">
                <p class="contact-info-item-content" v-if="detailInfo[item.storageName]">{{ detailInfo[item.storageName] | timeFormat('DateTime') }}</p>
                <p class="contact-info-item-content" v-else> - </p>
            </template>
            <template v-else-if="item.colType === 'selectMultiple'">
                <template v-if="item.fieldType === 'default'">
                    <p class="contact-info-item-content"
                       v-text="$options.filters.parseArray(detailInfo[item.storageName]).length ? $options.filters.parseArray(detailInfo[item.storageName]).join(', ') : detailInfo[item.storageName]?detailInfo[item.storageName]:'-'"></p>
                </template>
                <template v-else>
                    <p class="contact-info-item-content"
                       v-text="$options.filters.parseArray(detailInfo[item.storageName]).join(', ').length ? $options.filters.parseArray(detailInfo[item.storageName]).join(', '):'-'"></p>
                </template>
            </template>
             <template v-else-if="item.colType === 'email'">
                <a v-if="!isHighSeas" href="javascript:void(0)" class="ct_email" @click.stop="quickSend(detailInfo)" v-text="detailInfo[item.storageName]?detailInfo[item.storageName]:'-'"></a>
                <p v-else class="contact-info-item-content" v-text="detailInfo[item.storageName]?detailInfo[item.storageName]:'-'"></p>
            </template>
            <template v-else-if="item.storageName === 'createUser'">
                <p class="contact-info-item-content" v-text="name_createUser?name_createUser:'-'"></p>
            </template>
            <template v-else>
                <p class="contact-info-item-content" v-text="detailInfo[item.storageName]?detailInfo[item.storageName]:'-'"></p>
            </template>
        </div>

        <!-- 展开收起 -->
        <div v-if="columns_all.length > 6"
             @click="toggleMore"
             class="contact-info-toggle-more piwik_companyDetail_viewContactDetail">{{ isOpened ? $t('crm.Modal.fold') : $t('crm.newDetail.openMore') }}{{ isOpened ? '<' : '>' }}</div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import globalWaReplyModal from '@/mixins/globalWaReplyModal';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';

    export default {
        name: 'contactInfo',
        mixins: [globalWaReplyModal],
        props: [
            'id',
            'isHighSeas',
            'columns_authorized',
            'id_update_contact',
            'companyId'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                button_list: state => state.app.button_list,
                allUsers: state => state.crm.allUsers
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            authorized_button() {
                if (this.isHighSeas) {
                    return {};
                }

                const ids = BUTTON_IDS.CRM.contact;
                return {
                    editContact: !HANDLE_BUTTON(ids.edit.editContact, this.button_list)
                };
            },
            columns_all() {
                /* 存放顺序数组 */
                // 存放 colOrder 正常的字段名
                let arr_haveNoColOrder = [];
                // 存放 colOrder 正常的字段名
                let arr_sort = [];
                // 存放 colOrder 1000 或重复的 colOrder
                const arr_renew = [];

                /* 存放字段 */
                let arr_default = [];
                let arr_custom = [];

                /* 处理默认字段 */
                if (this.columns_authorized && Array.isArray(this.columns_authorized.default)) {
                    arr_default = this.columns_authorized.default.filter(item => !item.manually).map(item => {
                        if (item.colOrder) {
                            if (arr_sort[item.colOrder]) {
                                arr_renew.push(item.storageName);
                            } else {
                                arr_sort[item.colOrder] = item.storageName;
                            }
                        } else {
                            arr_haveNoColOrder.push(item.storageName);
                        }

                        item.fieldType = 'default';

                        return item;
                    });
                }

                /* 延续字段设置的逻辑, 一旦发现有默认字段 colOrder 为空, 则默认字段不参与排序, 全部顺序展示 */
                if (arr_haveNoColOrder.length) {
                    arr_sort = [];
                    arr_haveNoColOrder = arr_default.map(item => item.storageName);

                    // 把授权默认字段按默认字段顺序排列
                    arr_haveNoColOrder = this.default_arr_order.filter(item => arr_haveNoColOrder.includes(item));
                }

                /* 处理自定义字段 */
                if (this.columns_authorized && Array.isArray(this.columns_authorized.custom)) {
                    arr_custom = this.columns_authorized.custom.filter(item => item.isShow === 1).map(item => {
                        if (`${item.colOrder}` === '1000' || !item.colOrder) {
                            arr_renew.push(item.storageName);
                        } else {
                            if (arr_sort[item.colOrder]) {
                                arr_renew.push(item.storageName);
                            } else {
                                arr_sort[item.colOrder] = item.storageName;
                            }
                        }

                        item.fieldType = 'custom';

                        return item;
                    });
                }

                /* 字段排序 */
                const arr_all = arr_default.concat(arr_custom);
                let result =  arr_haveNoColOrder.concat(arr_sort.filter(item => !(!item || item === '')), arr_renew).map(item => arr_all.find(col => item === col.storageName)).filter(item => !(!item || item === ''));

                // 添加创建人字段
                result.push({
                    cname: this.$t('crm.WorkBench.col_followUpCreateUser'),
                    storageName: 'createUser'
                });

                // 过滤掉已经做标题显示的姓名字段
                result = result.filter(item => item.storageName !== 'nickName');

                return result;
            },
            computed_columns_all() {
                // 是否显示全部字段, 未展开则只显示前 6 个字段
                return this.isOpened ? this.columns_all : this.columns_all.slice(0, 6);
            },
            name_createUser() {
                const temp = this.allUsers.filter(item => `${item.id}` === `${this.detailInfo.createUserId}`)[0];
                return temp ? temp.fullname : this.detailInfo.createUser;
            },
            isHaveNameField() {
                try {
                    return this.columns_authorized.default.find(item => item.storageName === 'nickName');
                } catch (e) {
                    return false;
                }
            }
        },
        data() {
            return {
                loading: true,
                detailInfo: {},
                isOpened: false,

                // 所有自定义字段 colOrder 都为空时的字段顺序, 从字段设置组件中取得
                default_arr_order: ['nickName', 'email', 'jobGrade', 'jobTitle', 'phone', 'whatsApp', 'instagram', 'socialNetworkingPlatform', 'birthday', 'gender', 'remark', 'picture'],

            };
        },
        methods: {
            // 获取详细信息
            getDetail() {
                this.loading = true;
                util.ajax({
                    url: '/crm/contacts/get',
                    method: 'post',
                    data: {
                        id: this.id
                    }
                }).then(async response => {
                    if (response.data.code === '1') {
                        this.detailInfo = response.data.data;

                        // 主要联系人
                        if (Array.isArray(this.detailInfo.inquiryList)) {
                            this.detailInfo.isMainContact = this.detailInfo.inquiryList.some(item => item.isMainContact === 1);
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_getContactInfo'));
                    }
                    this.loading = false;
                }, error => {
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            },
            // 图片预览
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            // 展开/收起
            toggleMore() {
                this.isOpened = !this.isOpened;
            },
            // 新窗口跳转到联系人
            async viewContact() {
                // 无"我的联系人"页面权限, 退出流程
                if (!this.isContainsMenu('myContact')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noContactsMenuAuthority'));
                    return;
                }

                // 无 contactsId , 退出流程
                if (!this.id) {
                    this.$Message.warning(this.$t('crm.Modal.error_noneUserInfo'));
                    return false;
                }

                // 查询该联系人 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Contact',
                    id: this.id
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海联系人
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpContactInHighseas'));
                    return;

                    // if (this.isContainsMenu('highseasCustomer')) {
                    //     // 如果有公海目录权限
                    //
                    //     /**
                    //      * @Description: 注释掉所有打开侧滑页的操作, 改为新窗口打开客户详情页
                    //      * 另外, 产品说公海联系人先不用管, 所以目前只跳转公海客户, 之后不做任何操作
                    //      * @author 汤一飞
                    //      * @date 2021/1/4
                    //     */
                    //     // // 获取联系人关联的询盘 Id
                    //     // const inquiryId = Array.isArray(this.detailInfo.inquiryList) ? this.detailInfo.inquiryList[0].id : this.detailInfo.inquiryId;
                    //     // if (inquiryId) {
                    //     //     // 如果有询盘 id , 则按照全局搜索功能的逻辑来 --- "先跳转到公海, 打开公海询盘详情, 再打开公海询盘详情下的联系人详情"
                    //     //     localStorage.setItem('leadsCloud-inquiryId', inquiryId);
                    //     //     localStorage.setItem('leadsCloud-contactId', this.id);
                    //     //     localStorage.setItem('leadsCloud-globalSearchViewType', 'highSeaContact');
                    //     //     const href = window.location.origin + window.location.pathname + this.$router.resolve({
                    //     //         name: 'highseasCustomer'
                    //     //     }).href;
                    //     //     window.open(href, '_blank');
                    //     //     return;
                    //     // }
                    //     // // 没有询盘 Id , 还是正常打开联系人页面吧, 至少保证用户能看到联系人详情页
                    //
                    //     this.$viewHighSeasCustomer(this.detailInfo.companyId);
                    //     return;
                    // } else {
                    //     // 没有"公海客户"页面权限, 弹出提示
                    //     this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                    //     return;
                    // }
                }

                // 新窗口打开联系人详情页
                localStorage.setItem('leadsCloud-contactId', this.id);
                window.open(this.$router.resolve({
                    name: 'myContact'
                }).href, '_blank');
            },

            // 编辑联系人
            editContact() {
                this.$emit('editContact', this.id);
            },
            // 查看联系人二维码
            viewQRCode() {
                this.$emit('viewQRCode', this.id);
            },
            // 查看联系人日志
            viewContactLog() {
                this.$emit('viewContactLog', this.id);
            },
            // 打开发信弹窗
            quickSend(data) {
                if (data.email) {
                    const emails = [{
                        receiverName: data.nickName || '',
                        receiveMailAddress: data.email,
                        followUpId: `${this.companyId}`,
                        followUpType: 3
                    }];
                    localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                    // 打开写信弹窗之前先判断有没有已经打开的写信弹窗
                    const doc = document.getElementById('mail_detail_modal');
                    if (!doc) {
                        this.$store.commit('setQuickSendMailVisible', true);
                    }
                }
            }
        },
        created() {
            this.getDetail();
        },
        watch: {
            id_update_contact: {
                handler(val) {
                    if (val === this.id) {
                        this.getDetail();
                    }
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .contactInfo {
        font-size: 12px;
        margin-bottom: 20px;
        color: rgba(0,0,0,0.80);

        .contact-info-operate-btns {
            visibility: hidden;
            float: right;

            /deep/ .custom {
                color: #677f99;

                &:hover {
                    color: #4285f4;
                }
            }
        }

        &:hover {
            .contact-info-operate-btns {
                visibility: visible;
            }
        }

        .contact-info-item {
            padding: 4px 0;
            display: flex;

            &-nickName {
                display: inline-block;
                cursor: pointer;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.80);
                line-height: 22px;
                font-weight: bold;

                &:hover {
                    color: #2d63bc !important;
                    text-decoration: underline;
                }
            }

            &-mainContact {
                display: inline-block;
                margin: 3px 0 0 6px;
            }

            &-title {
                display: inline-block;
                vertical-align: top;

                &::after {
                    content: ' ： ';
                    display: inline-block;
                }
            }

            &-content {
                display: inline-block;
                flex: 1;
            }
        }

        .contact-info-toggle-more {
            cursor: pointer;
            color: #3B78DE;
        }
    }
</style>
