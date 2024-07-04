<style lang="less">
@import url("../floating-window.less");
.mail-window {
  &-home {
    .ivu-input-group {
      background: #f5f6f9;
      border-radius: 6px;
      > .ivu-input {
        border: 0;
        background: #f5f6f9;
        &:hover {
          border-color: #f5f6f9;
        }
        &:active {
          border-color: #f5f6f9;
          box-shadow: none;
        }
        &:focus {
          border-color: #f5f6f9;
          box-shadow: none;
        }
      }
      > .ivu-input-group-append {
        color: #a9b9c9;
        padding: 0 7px;
        background: #f5f6f9;
        border: 0;
      }
    }
    .mail-list-container {
      &-item {
        padding: 15px 20px;
        box-shadow: inset 0 -1px 0 0 #f5f5f5;
        cursor: pointer;
        &-sender {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.8);
          margin-bottom: 4px;
          display: inline-block;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        &-date {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.4);
          float: right;
        }
        &-theme {
          /* 标签样式 */
          .el-tag {
            border-radius: 11px;
            border-width: 0 !important;
            height: 28px;
            line-height: 28px;
            .el-tag-text,
            i {
              color: inherit !important;
            }
            & .custom-delete1 {
              display: none;
            }
            &:hover {
              & .custom-delete1 {
                display: inline-block;
                background-color: rgba(0, 0, 0, 0);
              }
            }
          }
          .tag-in-table {
            .span-in-lable {
              display: inline-block;
              height: 100%;
              max-width: 100px;
              vertical-align: top;
            }
          }
          display: inline-block;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.8);
          max-width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-left: 18px;
        }
        &-operate {
          float: right;
        }
      }
    }
    .no-account {
      line-height: 20px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .receive-load-loop {
      animation: ani-load-loop 1s linear infinite;
    }
    @keyframes ani-load-loop {
      from {
        transform: rotate(0deg);
      }
      50% {
        transform: rotate(180deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }
}
</style>

<template>
    <div class="mail-window">
        <div class="mail-window-home" v-if="view === 'mailHome'">
            <div class="floating-window-header">
                <div class="floating-window-header-title">{{ $t("mail.inbox") }}</div>
                <div class="floating-window-fix-icon">
                    <Tooltip :content="$t('letters.WriteLetter')">
                        <Icon
                        size="16"
                        custom="custom custom-write-letter"
                        @click="writeMail">
                        </Icon>
                    </Tooltip>
                    <Tooltip :content="$t('mail.receiveLetter')">
                        <Icon
                        size="16"
                        custom="custom custom-refresh"
                        :class="receiveMail ? 'receive-load-loop' : ''"
                        @click="handleReceiveMail"
                        style="margin: 0 20px"
                        >
                        </Icon>
                    </Tooltip>
                    <Tooltip :content="$t('pin')" v-if="!isFixed">
                        <Icon
                        custom="custom custom-float-window"
                        @click.native="handleFixed(true)"
                        size="16"
                        />
                    </Tooltip>
                    <Tooltip :content="$t('unpin')" v-else>
                        <Icon
                        custom="custom custom-fixed-window"
                        @click.native="handleUnFixed"
                        size="16"
                        />
                    </Tooltip>
                    <Icon
                        custom="custom custom-modal-close"
                        @click="handleWindowClose"
                        style="margin-left: 20px"
                    >
                    </Icon>
                </div>
            </div>
            <div style="padding: 0 20px">
                <Input
                    v-model="themeKey"
                    :placeholder="$t('mail.themeKeyPlh')"
                    @keyup.enter.native="searchByTheme"
                    size="large"
                    >
                    <Icon
                        slot="append"
                        custom="custom custom-search"
                        size="15"
                        style="cursor: pointer"
                        @click.native="searchByTheme"
                    />
                </Input>
            </div>
            <div class="mail-list-container" v-loading="loading">
                <div v-if="noAccount" :style="{ height: scrollHeight + 'px', textAlign: 'center' }">
                    <div class="no-account">
                        {{ $t("mail.bindMailAddressEmpty") }}
                        <br />
                        <router-link style="color: #4285f4" :to="{ name: 'mail_set' }">{{
                        $t("mail.goToBindMailAddress")
                        }}</router-link>
                    </div>
                <!-- <a href="#/systemSettings/mail_set">去添加</a> -->
                </div>
                <div v-else
                    :style="{ height: `${scrollHeight}px`, overflow: 'auto' }"
                    v-infinite-scroll="handleLoadMail"
                    :infinite-scroll-distance="10"
                    :infinite-scroll-disabled="noMore"
                    :infinite-scroll-immediate="false">
                    <div
                        v-for="(row, index) in mailList"
                        :key="index"
                        class="mail-list-container-item infinite-list"
                        @click="goMailDetail(row)">
                        <div class="infinite-list-item">
                            <div style="display: inline-flex; width: 90%">
                                <SenderPoptip
                                    @showCompany="showCompany"
                                    @showClue="showClue"
                                    @createClue="createClue"
                                    @changeCrmFlag="changeCrmFlag"
                                    @handleClick="handleClick"
                                    :params="{ row, index }"
                                    style="display: inline-block; margin-right: 4px;vertical-align: top;">
                                </SenderPoptip>
                                <!-- 名称显示逻辑迁移到后台 -->
                                <div  style="width: 65%;margin-left: 5px;display: inline-flex;font-size: 12px;">
                                    <Tooltip :content="row.combineName" placement="top">
                                        <div class="ellipsis">{{row.combineName}}</div>
                                    </Tooltip>
                                </div>
                                <!--                                <div :title="row.sender" class="mail-list-container-item-sender">{{row.sender}}</div>-->
                            </div>
                            <div class="mail-list-container-item-date">{{ row.date }}</div>
                        </div>
                    <div>
                    <div
                        class="mail-list-container-item-theme"
                        :style="{ fontWeight: row.fav === '1' ? '500' : '700' }"
                    >
                        <span
                        v-for="(label, index) in row.labelId"
                        v-show="index < 2"
                        :key="index"
                        >
                        <Tag
                            class="tag-in-table"
                            :style="`color:${getRGB(row.labelColor[index])}`"
                            :color="row.labelColor[index]"
                        >
                            <span class="span-in-lable ellipsis">{{
                            row.labelName[index]
                            }}</span>
                            <Icon class="custom custom-delete1" @click.stop="operateTag(row.id, label, 0)" :style="`margin-left: 9px;cursor: pointer;color:${getRGB(row.labelColor[index]) === '#333' ? '#999!important' : '#fff'}`"></Icon>
                        </Tag>
                        </span>
                        <span :title="row.theme">{{ row.theme }}</span>
                    </div>
                    <div
                        class="mail-list-container-item-operate"
                        style="
                        display: flex;
                        align-items: center;
                        justify-content: space-around;
                        "
                    >
                        <Icon
                        v-if="row.attachmentFlag == '1'"
                        size="14"
                        custom="custom custom-annex-file"
                        />
                        <div class="mail-operations">
                        <Icon
                            v-if="row.mailToDoFlag === 0"
                            size="14"
                            custom="custom custom-mail-notSet piwik_mail_mark_nosetOrFinished"
                            style="color: #666;"
                            :title="$t('mail.notSet')"
                            @click.stop="changeProcessingState(row.id, 1, index)"
                        />
                        <Icon
                            v-if="row.mailToDoFlag === 1"
                            custom="custom custom-mail-untreated piwik_mail_mark_untreated"
                            style="color: #fbbc04"
                            size="14"
                            :title="$t('mail.untreated')"
                            @click.stop="changeProcessingState(row.id, 2, index)"
                        />
                        <Icon
                            v-if="row.mailToDoFlag === 2"
                            size="14"
                            custom="custom custom-mail-finished piwik_mail_mark_nosetOrFinished"
                            :title="$t('mail.finished')"
                            style="color: #00cc99"
                            @click.stop="changeProcessingState(row.id, 1, index)"
                        />
                        </div>
                        <div>
                        <Icon
                            v-if="row.mailStarFlag == '0'"
                            size="14"
                            custom="custom custom-mail-star0"
                            title="标记星标"
                            style="color: #666;"
                            @click.stop="flag_star(1, row.id, index)"
                        />
                        <Icon
                            v-else
                            custom="custom custom-mail-star1"
                            style="color: #fbbc04"
                            size="14"
                            title="取消星标"
                            @click.stop="flag_star(0, row.id, index)"
                        />
                        </div>
                    </div>
                    </div>
                </div>
                </div>

                <!--<Scroll :on-reach-bottom="handleLoadMail" :on-reach-top="updateLoadMail" :distance-to-edge="10" :height="scrollHeight">
                            <Spin fix v-if="loading"></Spin>
                        </Scroll>-->
            </div>
        <CRMDrawerList
            :visible.sync="show_company_detail"
            :id.sync="companyId"
            :type="type_company"
            :corp_columns_authorized="corp_columns_authorized"
            :contact_columns_authorized="contact_columns_authorized"
            :inquiry_columns_authorized="inquiry_columns_authorized"
        >
        </CRMDrawerList>

        <ClueDrawerList
            :visible.sync="show_clue_detail"
            :type="type_clue"
            :clueId.sync="clueId"
            :listType="2"
            :corp_columns_authorized="corp_columns_authorized"
            :contact_columns_authorized="contact_columns_authorized"
            :inquiry_columns_authorized="inquiry_columns_authorized"
        >
        </ClueDrawerList>

        <!-- <NewCompany
            :visible.sync="newCompanyShow"
            :mailAddress.sync="mailAddress"
            :corp_columns_authorized="corp_columns_authorized"
            :contact_columns_authorized="contact_columns_authorized"
            :inquiry_columns_authorized="inquiry_columns_authorized"
            :selectOptions="selectOptions"
            @refreshData="refreshEmailList"
        >
        </NewCompany> -->
        <!-- 右侧弹窗 -->
            <littleDrawer
                v-if="littleDrawerVisible"
                :visible.sync="littleDrawerVisible"
                :id="currentMailId"
                :currAccountInfo="currentMailInfo"
                :corp_columns_authorized="corp_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                type="journeyDetail"
                from="mail"
                @littleDrawerHidden="littleDrawerHidden"
                @updateStatus="updateStatus"
                @updateInquiryStatus="updateInquiryStatus"
                @handleClick="handleClick"
            ></littleDrawer>
        </div>
        <component
            v-else
            :is="view"
            :view="view"
            :selected-mail-id.sync="selectedMailId"
            :selected-mail-box-type.sync="selectedMailBoxType"
            :reply-mail-type.sync="replyMailType"
            :mailEdit.sync="mailEdit"
            :is-fixed="isFixed"
            :needLeaveModal.sync="needLeaveModal"
            :selectOptions="selectOptions"
            :corp_columns_authorized="corp_columns_authorized"
            :inquiry_columns_authorized="inquiry_columns_authorized"
            :contact_columns_authorized="contact_columns_authorized"
            @changeFixState="handleFixed"
            @windowClose="handleWindowClose"
            @changeView="(val) => (view = val)"
            @changeSelectedMailId="(val) => (selectedMailId = val)"
            @changeMailReadStatus="changeMailReadStatus"
            @handleClick="handleClick"
            @updateMailFlag="updateMailFlag">
        </component>
        <!-- 新增个人通讯录联系人 -->
        <div v-if="letAddModalShow">
            <AddContact
                :letAddModalShow="letAddModalShow"
                :newContactInfo="newContactInfo"
                :editContactInfo = "{}"
                @isAddModalShow="state=>letAddModalShow=state">
            </AddContact>
        </div>
         <!-- 新建邮件收发信规则 -->
        <newRules
            v-if="newRulesModalShow"
            fromModal="mail"
            :mailAddress="newContactInfo.email"
            :letAddModalShow.sync="newRulesModalShow">
        </newRules>
        <!-- 录入线索模态框 -->
        <div v-if="templateId">
            <ClueModal
                v-model="inputClue"
                :title="$t('visitor_history.add_clue')"
                class="modal companydata"
                :delLoading="false"
                :json_data="json_data"
                saveClueClass="piwik-mail-enter-clue"
                saveClueAndInquiryClass="piwik-mail-enter-inquiry"
                okEnterInquiryClass="mail_inquirySubmit"
                :hide="enterpriseId + '' !== '1000' && enterpriseId + '' !== '1002'"
                type="mail"
                from="journeyDetail"
                @open_close="open_close"
                @on_cancle_clue="on_cancle_clue"
                @returnLeadsId="updateStatus"
                @updateInquiryStatus="updateStatus">
            </ClueModal>
        </div>
        <!-- 新建客户 -->
        <NewCompany :visible.sync="newCompanyShow"
            type="mail"
            okEnterInquiryClass="piwik_mail_new_company"
            :saleList="salesList"
            :json_data="json_data"
            :mailAddress="createCompanyAddress"
            WAAccount=""
            @returnUpdateStatus="updateStatus"
            @updateInquiryStatus="updateStatus"></NewCompany>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState, mapGetters, mapActions } from 'vuex';
    import FilterTags from '@/views/main-components/filter-tags';
    // import NewCompany from '@/views/crm/Detail/Components/Modal/fixed-modal-form/create-company';
    import CRMDrawerList from '@/views/crm/Detail/CRMDrawerList';
    import ClueDrawerList from '@/views/clue-manage/Detail/ClueDrawerList';
    import MailDetail from './mail-detail';
    import WriteMail from './write-mail';
    import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';
    import AddContact from '@/views/mail/mail-settings/modal/add_contact';
    import newRules from '@/views/mail/mail-settings/modal/new_rules';
    import ClueModal from '@/views/main-components/enter-clue/enter-clue';
    import NewCompany from '@/views/clue-manage/Detail/Components/Modal/newCompany';
    import mailCommon from '@/api/mail/common.js';
    /** 判断长度 */
    String.prototype.realLength = function(){
        return this.replace(/[^\x00-\xff]/g, '**').length; // [^\x00-\xff] - 匹配非双字节的字符
    };
    export default {
        name: 'MailWindow',
        props: {
            isFixed: {},
            windowType: {},
            update: {}
        },
        components: {
            // NewCompany,
            CRMDrawerList,
            ClueDrawerList,
            FilterTags,
            MailDetail,
            WriteMail,
            littleDrawer,
            AddContact,
            newRules,
            ClueModal,
            NewCompany
        },
        data() {
            return {
                /** 分屏 */
                scrollToTop: 0,
                needLeaveModal: true,
                mailList: [],
                emails: [], // 当前页面所有邮件地址列表
                crmEmails: [], // 当前页建档的邮箱列表
                page: 0,
                pageSize: 50,
                currentBox: 'inbox',
                view: 'mailHome',
                selectedMailId: '',
                selectedMailBoxType: 'inbox',
                replyMailType: '',
                mailEdit: false,
                loading: true,
                accountList: [{ id: '', account: this.$t('mail.accountPlh') }],
                noAccount: false, // 没有绑定账户
                mailBoxType: '0',
                currentAccount: this.$store.state.mail.currentAccount,
                themeKey: '', // 主题关键字

                replyFlag: false, // 是否禁用回复
                forwardFlag: false, // 是否禁用转发
                mergeFlag: false, // 是否禁用归并
                signFlag: false, // 是否禁用标记
                /** 是否禁用移动到文件夹功能 */
                moveFlag: false,
                config_tableFilter: {
                    avatar: {
                        sort: false,
                        filter: true,
                        filterType: 'select',
                        query: '',
                        allList: [
                            { value: 0, label: '未建档' },
                            { value: 1, label: '公海管理' },
                            { value: 2, label: '我的客户' },
                            { value: 3, label: '他人客户' },
                            { value: 4, label: '公海线索' },
                            { value: 5, label: '我的线索' },
                            { value: 6, label: '他人线索' }
                        ]
                    },
                    subject: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型,              string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    sender: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型,              string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    recipient: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    date: {
                        sort: true,
                        filter: true,
                        filterType: 'date',
                        query: '',
                        allList: null
                    }
                },
                indeterminate: false,
                checkAll: false,
                sortType: 'desc', // 排序方式
                sort: '',
                total: 0, // 邮件个数
                totalUnread: 0, // 未读邮件个数
                selectMailList: [], // 选中邮件列表
                selectMailBoxTypeIds: [], // 选中邮件箱类型列表
                selectMailIds: [], // 选中邮件id列表
                cusCardIndex: 0, // 当前名片索引
                currentRowRecievers: {}, // 当前行的所有收件人名片信息
                table_list: [
                    {
                        _expanded: true,
                        title: '今天',
                        data: []
                    }
                ],
                selection_list: [],
                noMore: false,
                // 标签
                tagList: [], // 获取的所有标签列表,
                tagModal: false, // 新建标签
                tagName: '',
                colors: [
                    {
                        show: true,
                        color: '#4285F4'
                    },
                    {
                        show: false,
                        color: '#00CC99'
                    },
                    {
                        show: false,
                        color: '#15C5D4'
                    },
                    {
                        show: false,
                        color: '#7B66EE'
                    },
                    {
                        show: false,
                        color: '#FA8241'
                    }
                ],
                // 小人头 询盘详情 线索详情
                newCompanyShow: false,
                newClueShow: false,
                corp_columns_authorized: {},
                contact_columns_authorized: {},
                inquiry_columns_authorized: {},
                // mailAddress: "", // 创建新客户的邮箱
                lang_mail: {
                    subject: this.$t('mail.writeLetter.subject'),
                    sender: this.$t('mail.writeLetter.sender'),
                    recipient: this.$t('mail.writeLetter.recipients'),
                    date: this.$t('mail.time'),
                    avatar: this.$t('mail.customerAvatar')
                },
                /* 多语言 */
                lang_contact: {
                    nickName: this.$t('crm.Modal.contact_nickName'),
                    jobTitle: this.$t('crm.Modal.contact_jobTitle'),
                    email: this.$t('crm.Modal.contact_email'),
                    phone: this.$t('crm.Modal.contact_phone'),
                    jobGrade: this.$t('crm.Modal.contact_jobGrade'),
                    socialNetworkingPlatform: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    birthday: this.$t('crm.Modal.contact_birthday'),
                    gender: this.$t('crm.Modal.contact_gender'),
                    picture: this.$t('crm.Modal.contact_picture'),
                    remark: this.$t('crm.Modal.contact_remark')
                },
                lang_inquiry: {
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    followUp: this.$t('crm.Modal.inq_followUp'),
                    remark: this.$t('crm.Modal.inq_remark')
                },
                lang_company: {
                    companyName: this.$t('crm.Modal.corp_companyName'),
                    starLevel: this.$t('crm.Modal.corp_starLevel'),
                    shortName: this.$t('crm.Modal.corp_shortName'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),
                    mainProduct: this.$t('crm.Modal.corp_mainProduct'),
                    scale: this.$t('crm.Modal.corp_scale'),
                    clientType: this.$t('crm.Modal.corp_clientType'),
                    homePage: this.$t('crm.Modal.corp_homePage'),
                    phone: this.$t('crm.Modal.corp_phone'),
                    fax: this.$t('crm.Modal.corp_fax'),
                    contactAddress: this.$t('crm.Modal.corp_contactAddress'),
                    relatedCompany: this.$t('crm.Modal.corp_relatedCompany'),
                    companyPicture: this.$t('crm.Modal.corp_companyPicture'),
                    companyRemark: this.$t('crm.Modal.corp_companyRemark'),
                    companySourceWay: this.$t('crm.Table.col_customerSource')
                },
                /* drawer */
                show_company_detail: false,
                type_company: 'inquiry',
                companyId: 0,
                show_clue_detail: false,
                type_clue: '',
                clueId: '',
                deleteModel: false,
                receiveMail: false,
                // 新增弹窗相关
                mailAddress: '', // 创建新客户的邮箱
                currentMailId: '',
                currentMailInfo: {},
                littleDrawerVisible: false,
                letAddModalShow: false,
                newRulesModalShow: false,
                inputClue: false,
                json_data: {},
                templateId: '',
                createCompanyAddress: ''
            };
        },
        computed: {
            ...mapState({
                fullName: 'fullName',
                userId: 'userId',
                userName: 'userName',
                enterpriseId: 'enterpriseId',
                window_height: 'window_height',
                ws_receive_mail: (state) => state.mail.ws_receive_mail,
                receiveMailURL: state => state.mail.receiveMailURL,
                currentPersonId: (state) => state.mail.currentPersonId,
                salesList: state => state.crm.salesList,
                selectOptions: state => state.crm.selectOptions // 全部下拉数据 component在用 否则可以删除
            }),
            ...mapGetters(['isContainsMenu']),
            scrollHeight() {
                return parseInt(this.window_height) - 156;
            }
        },
        watch: {
            view(newVal, oldVal) {
                if (oldVal === 'mailHome') {
                    const mailList = document.querySelector('.mail-list-container .ivu-scroll-container');
                    this.scrollToTop = mailList ? mailList.scrollTop : this.scrollToTop;
                } else if (
                    (newVal === 'mailHome' && oldVal === 'MailDetail') ||
                    (newVal === 'mailHome' && oldVal === 'WriteMail')
                ) {
                    this.$nextTick(() => {
                        this.scrollTo(this.scrollToTop);
                        this.needLeaveModal = true;
                    });
                }
            },
            /** 打开分屏（其他分屏切换的情况） */
            /**
             * @Description1: bug详情： 收件箱小屏，前10封邮件重复【ID1005328】
             * @Description2: bug原因： 经查，floating-window.vue中，windowType改变一定会导致update改变，此处监听两个变量，且均调用init方法，获取邮件列表(第一页数据)，
             *                          导致列表重复*2；因此列表第一页数据至少重复显示2遍；
             * @Description3: 解决方案：去除update的监听回调中的init调用，仅保留windowType监听回调中的init调用，以及created时初始化一次
             * @author 杨娣
             * @date 2020/5/22
             */
            windowType(val) {
                if (val === 'mail_home') {
                    this.view = 'mailHome';
                    this.init();
                // this.page=0
                // this.mockmailTableData()
                }
            },
            /** 打开分屏（一般情况） */
            update(val) {
                if (val && this.windowType === 'mail_home') {
                    this.view = 'mailHome';
                // this.init();
                // this.page=0
                // this.mockmailTableData()
                }
            }
            // mailList: {
            //     handler() {
            //         if (this.mailList) {
            //             this.getCurrentPageEmails(this.mailList);
            //             this.getCompanyStatusByEmails();
            //         }
            //     },
            //     deep: true,
            //     immediate: false
            // }
        },
        methods: {
            ...mapActions(['getUnreadMail']),
            /** 设置滚动加载区域的滚动条未知 */
            scrollTo(height) {
                const mailList = document.querySelector('.mail-list-container .ivu-scroll-container');
                if (mailList) {
                    mailList.scrollTop = height;
                }
            },
            writeMail() {
                this.view = 'WriteMail';
                this.selectedMailId = '';
                this.selectedMailBoxType = 'inbox';
                this.replyMailType = '';
                this.mailEdit = false;
            },
            handleWindowClose() {
                this.$emit('windowClose');
            },
            handleFixed(val) {
                this.$emit('changeFixState', val);
            },
            handleUnFixed() {
                this.$emit('changeFixState', false);
            },
            handleLoadMail() {
                if (!this.loading) {
                    this.page += 1;
                    this.mockmailTableData();
                }
            },
            updateLoadMail() {
                this.page = 0;
                this.mockmailTableData();
            },
            async handleReceiveMail() {
                if (!this.receiveMail) {
                    this.receiveMail = true;
                    if (!localStorage.getItem('XHLMailUrl')) {
                        await this.$store.dispatch('getMailUrl');
                    }
                    const XHLMailUrl = JSON.parse(localStorage.getItem('XHLMailUrl'));
                    const url = XHLMailUrl.receiveMail === 1 ? this.receiveMailURL : '/mail/receiveMail';
                    util.ajaxReceiveMail({
                        url: url,
                        method: 'PUT',
                        timeout: 600000,
                        data: {
                            userId: this.userId,
                            userName: this.userName,
                            enterpriseId: this.enterpriseId
                        }
                    }).then(({ data }) => {
                        this.receiveMail = false;
                        if (data.code === 1) {
                            if (data.data > 0) {
                                this.mockmailTableData();
                            }
                            this.$Notice.success({
                                title: this.$t('mail.receiveSuccTitle'),
                                message: `${this.$t('mail.receiveSuccDesc1')} ${
                                    data.data
                                } ${this.$t('mail.receiveSuccDesc2')}`
                            });
                        } else {
                            this.$Notice.error({
                                title: this.$t('mail.receiveFailTitle'),
                                message: this.$t('mail.receiveFailDesc')
                            });
                        }
                    }).catch((err) => {
                        console.log(err);
                        this.receiveMail = false;
                        this.$Notice.error({
                            title: this.$t('mail.receiveFailTitle'),
                            message: this.$t('mail.receiveFailDesc'),
                        });
                    });
                }
            },
            /** 初始化页面 */
            init() {
                this.$store.commit('set_currentPersonId', this.userId);
                this.page = 0;
                this.mockaccountList();
                this.mockmailTableData();
            },

            /** 获取邮箱账号列表 */
            mockaccountList() {
                this.accountList = [
                    {
                        id: '',
                        account: this.$t('mail.accountPlh'),
                    }
                ];
                util.ajaxMail({
                    url: `/mail/mailAccountsSelect/${this.userId}`,
                    method: 'GET'
                }).then((response) => {
                    if (response.data.code === 1) {
                        if (response.data.data.length > 0) {
                            this.noAccount = false;
                        } else {
                            this.noAccount = true;
                        }
                        for (const item of response.data.data) {
                            this.accountList.push({
                                id: item.id,
                                account: item.emailAddress
                            });
                        }
                    }
                });
            },
            /** 获取并处理邮箱列表数据 */
            mockmailTableData() {
                if (this.page === 0) {
                    this.mailList = [];
                }
                this.loading = true;
                const postData = {
                    enterpriseId: this.enterpriseId,
                    createUserId: this.userId,
                    accountId: '',
                    accountIds: [],
                    mailBoxTypeId: this.mailBoxType,
                    page: this.page,
                    size: this.pageSize,
                    sort: 'mailSendDate',
                    subject: this.themeKey,
                    direction: this.sortType
                };
                this.$store.commit('set_mailWindow_detail_params', postData);
                util.ajaxMailJson({
                    url: '/mail/mailBoxsAndLabel',
                    method: 'POST',
                    data: postData
                }).then((response) => {
                    if (response.data.code === 1) {
                        this.total = response.data.data.totalElements;
                        const mailList = response.data.data.content;
                        if (!mailList.length) {
                            this.noMore = true;
                        }
                        this.handle_table_data(mailList);
                        // this.emptySelection();
                        this.loading = false;
                    } else {
                        this.noMore = true;
                        this.loading = false;
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$Message.error(this.$t('catch_message.error'));
                });
                // return data;
            },
            /** 处理筛选条件 */
            handleQuerys() {
                let result = {};
                for (const key in this.config_tableFilter) {
                    if (this.config_tableFilter[key].query) {
                        switch (key) {
                            case 'avatar':
                                result = Object.assign(result, {
                                    mailCrmFlags: this.config_tableFilter[key].query.map((item) => {
                                        return item.value;
                                    }),
                                    recieverCrmFlags: this.config_tableFilter[key].query.map((item) => {
                                        return item.value;
                                    })
                                });
                                break;
                            case 'sender':
                                result = Object.assign(result, {
                                    mailFroms: [this.config_tableFilter[key].query]
                                });
                                break;
                            case 'subject':
                                result = Object.assign(result, {
                                    subject: this.config_tableFilter[key].query
                                });
                                break;
                            case 'recipient':
                                result = Object.assign(result, {
                                    mailTos: [this.config_tableFilter[key].query]
                                });
                                break;
                            case 'date':
                                result = Object.assign(result, {
                                    sendStartDate: this.config_tableFilter[key].query[0]
                                        ? this.dateFormat(
                                            'yyyy-MM-dd',
                                            this.config_tableFilter[key].query[0]
                                        )
                                        : '',
                                    sendEndDate: this.config_tableFilter[key].query[1]
                                        ? this.dateFormat(
                                            'yyyy-MM-dd',
                                            this.config_tableFilter[key].query[1]
                                        )
                                        : ''
                                });
                                break;
                            default:
                                break;
                        }
                    }
                }
                switch (this.sort) {
                    case 'date':
                        Object.assign(result, {
                            sort: 'mail_send_date',
                            direction: this.sortType
                        });
                        break;
                    case 'subject':
                        Object.assign(result, {
                            sort: 'mail_subject',
                            direction: this.sortType
                        });
                        break;
                    case 'sender':
                        Object.assign(result, {
                            sort: 'mail_from',
                            direction: this.sortType
                        });
                        break;
                    case 'recipient':
                        Object.assign(result, {
                            sort: 'mail_to',
                            direction: this.sortType
                        });
                        break;
                    default:
                        break;
                }
                return result;
            },
            /** 获取邮件列表（0-unreadBox(未读箱)、0-inbox(收件箱)、5-draftBox(草稿箱)、4-sentBox(已发箱)、3-dustbin(垃圾箱)）、6-star_box（星邮件） */
            handle_table_data(mailList) {
                for (let i = 0; i < mailList.length; i++) {
                    const data = {
                        id: mailList[i].idString,
                        theme: mailList[i].mailSubject === '' ? this.$t('mail.writeLetter.noSubject') : mailList[i].mailSubject,
                        sender: mailList[i].mailFrom,
                        recipient: mailList[i].mailTo[0] === '[' && mailList[i].mailTo[mailList[i].mailTo.length - 1] === ']' ? JSON.parse(mailList[i].mailTo) : mailList[i].mailTo.split(','),
                        date: this.dateFormat('MM-dd', mailList[i].mailSendDate),
                        fromOrToFlag: mailList[i].fromOrToFlag, // 收信还是发信  1-发信
                        fav: mailList[i].mailReadFlag, // 0-未读   1-已读
                        mailCrmFlag: mailList[i].mailCrmFlag, // 发件人是否在crm系统中存在
                        clueFlag: `${mailList[i].mailMyclueFlag}`, // 发件人是否在线索中存在
                        recieverCrmFlag: mailList[i].recieverCrmFlag, // 收件人是否在crm系统中存在
                        recieverClueFlag: `${mailList[i].recieverMyclueFlag}`, // 收件人是否在crm系统中存在
                        receiptFlag: mailList[i].mailReceiptFlag, // 回执
                        attachmentFlag: mailList[i].mailAttachmentFlag, // 附件
                        urgentFlag: mailList[i].mailUrgentFlag, // 紧急
                        mailGroupSendingSingleShowFlag:
                            mailList[i].mailGroupSendingSingleShowFlag, // 群发单显
                        successFlag: mailList[i].mailSuccessFlag, // 发送是否成功
                        mailTraceFlag: mailList[i].mailTraceFlag, // 追踪
                        recentOpenIp: mailList[i].recentOpenIp, // 追踪气泡中最近打开位置IP
                        recentOpenPosition: mailList[i].recentOpenPosition, // 追踪气泡中最近打开位置
                        recentOpenTime: this.dateFormat(
                            'yyyy-MM-dd hh:mm',
                            mailList[i].recentOpenTime
                        ), // 追踪气泡中最近打开时间
                        mailOpenTimes: mailList[i].mailOpenTimes, // 追踪气泡中打开次数
                        mailStarFlag: mailList[i].mailStarFlag, // 是否有星标
                        mailTimeFlag: mailList[i].mailTimeFlag, // 是否有定时邮件
                        mailBoxTypeId: mailList[i].mailBoxTypeId, // 邮件属于哪个箱
                        createUserId: mailList[i].createUserId,
                        labelColor: mailList[i].labelColor
                            ? mailList[i].labelColor.split(',')
                            : [],
                        labelId: mailList[i].labelId ? mailList[i].labelId.split(',') : [],
                        labelName: mailList[i].labelName
                            ? mailList[i].labelName.split(',')
                            : [],
                        mailToDoFlag: mailList[i].mailToDoFlag,
                        replyTo: mailList[i].replyTo,
                        companyName: '', // 邮箱对应的公司名称
                        contactsName: '', // 邮箱对应的客户名称
                        shortName: '',
                        combineName: mailList[i].combineName
                    };
                    this.mailList.push(data);
                }
                this.getCurrentPageEmails(this.mailList);
                this.getCompanyStatusByEmails();
                // this.getAllTableData()
            },
            /** 获取按今天昨天更早显示的 */
            getAllTableData() {
                this.allTableData = [];
                this.table_list.forEach((item) => {
                    if (item._expanded) {
                        this.allTableData = this.allTableData.concat(item.data);
                    }
                });
            },
            /** 跳转到邮件详情页 */
            goMailDetail(item) {
                /**
                 * @Description1: 邮件自动置为已读--原逻辑：点击分屏列表页某行---该邮件置为已读，同时跳转进详情页---获取邮件详情失败
                 *               ----页面跳转回分屏列表页，同时将邮件置为未读；此逻辑极其不合理
                 * @Description2: 修改后的邮件自动置为已读逻辑：只在邮件详情获取成功后，邮件才被置为已读
                 * @Description3: ----此处注释逻辑不合理的代码段
                 * @author 杨娣
                 * @date 2020/5/7
                 */
                // item.fav = '1';
                // util.ajaxMailJson({
                //     url: '/mail/mailReadFlag',
                //     method: 'PUT',
                //     data: {
                //         ids: ids,
                //         mailReadFlag: 1,
                //         updateUserId: this.userId,
                //         updateUserName: this.userName
                //     }
                // }).then(response => {
                //     if (response.data.code === 1) {
                //         this.allunreadTableData();
                //     }
                // });
                this.selectedMailId = item.id;
                this.view = 'MailDetail';
            },
            /* 若邮件详情获取成功，该邮件被标为已读，列表数据需要更新 */
            changeMailReadStatus(mailId, readStatus) {
                this.mailList.forEach((item) => {
                    if (item.id === mailId) {
                        this.$set(item, 'fav', String(readStatus));
                    }
                    return item;
                });
            },
            allunreadTableData() {
                util.ajaxMailJson({
                    url: '/mail/mailBoxsAndLabel',
                    method: 'POST',
                    data: {
                        enterpriseId: this.enterpriseId,
                        createUserId: this.userId,
                        // accountId: this.currentAccount === this.$t('mail.accountPlh') ? '' : this.currentAccount,
                        accountId: '',
                        accountIds: [],
                        mailBoxTypeId: '0',
                        mailReadFlag: '0',
                        sendStartDate: '',
                        sendEndDate: '',
                        subject: '',
                        page: 0,
                        size: this.pageSize,
                        sort: '',
                        direction: 'desc'
                    }
                }).then((response) => {
                    this.totalUnread = response.data.data.totalElements;
                    this.$store.commit('set_allUnreadMails', this.totalUnread);
                });
            },
            /** 标记星标 */
            flag_star(is_flag, id, index) {
                // is_flag 1是标记 0是取消标记
                util.ajaxMailJson({
                    url: '/mail/mailBoxs/starMailBox',
                    method: 'put',
                    data: {
                        orgId: this.enterpriseId,
                        ids: [id],
                        mailStarFlag: is_flag,
                        updateUserId: this.$store.state.userId,
                        updateUserName: this.$store.state.userName
                    }
                }).then(({ data }) => {
                    if (data.code !== 1) {
                        this.$Message.error(this.$t('mail.flag_star_error'));
                    }
                    this.themeKey = '';
                    this.page = 0;
                    this.$set(
                        this.mailList[index],
                        'mailStarFlag',
                        this.mailList[index].mailStarFlag === '0' ? '1' : '0'
                    );
                    // this.mockmailTableData();
                    this.emptySelection();
                });
            },
            /** 删除 */
            handleDelete() {
                if (this.selectMailList.length !== 0) {
                    // this.deleteModel = true
                    this.$Modal.confirm({
                        title: this.$t('mail.deleteTitle'),
                        content: this.$t('mail.deleteContent'),
                        onOk: this.remove
                    });
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                }
            },
            /** 从表格中删除一个或多个邮件 */
            remove() {
                util.ajaxMailJson({
                    url: '/mail/moveMailBoxTypeId',
                    method: 'PUT',
                    data: {
                        originalMailBoxTypeId: this.mailBoxType,
                        destinationMailBoxTypeId: '3',
                        mailBoxIds: this.selectMailIds,
                        updateUserId: this.userId,
                        updateUserName: this.userName
                    }
                }).then((response) => {
                    if (response.data.code === 1) {
                        this.deleteModel = false;
                        this.$Message.success(this.$t('mail.deleteSuccTip'));
                        this.selectMailList = [];
                        this.page = 0;
                        this.themeKey = '';
                        this.mockmailTableData();
                    } else {
                        this.$Message.error(this.$t('mail.deleteErrorTip'));
                    }
                });
            },
            /** 星标箱移动到垃圾箱 */
            moveToDustbin(mailBoxType, selectMailIds) {
                const mailMap = {};
                selectMailIds.forEach((item, i) => {
                    mailMap[item] = mailBoxType[i];
                });
                util.ajaxMailJson({
                    url: '/mail/moveStarMailBox',
                    method: 'put',
                    data: {
                        orgId: this.enterpriseId,
                        destinationMailBoxTypeId: '3',
                        mailMap,
                        updateUserId: this.userId,
                        updateUserName: this.userName
                    }
                }).then((res) => {
                    if (res.data.code == 1) {
                        this.deleteModel = false;
                        this.$Message.success(this.$t('mail.deleteSuccTip'));
                        this.selectMailList = [];
                        this.page = 0;
                        this.themeKey = '';
                        this.mockmailTableData();
                    } else {
                        this.$Message.error(this.$t('mail.deleteErrorTip'));
                    }
                });
            },
            /** 获取所有标签列表 */
            getTags() {
                util.ajaxMail({
                    url: '/mail/maillabel/all',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        createUserId: this.userId
                    }
                }).then((res) => {
                    if (res.data.code === 1) {
                        this.tagList = res.data.data;
                    }
                });
            },
            /** 展开/收起列表 这里的row 和table_list的元素地址不同不能用 */
            expand(row, index) {
                this.table_list[index]._expanded = !this.table_list[index]._expanded;
                this.$refs.expandtable.toggleExpand(index);
            },
            /** 清空选中项 */
            emptySelection() {
                this.selectMailList = [];
                this.selectMailIds = [];
                this.selectMailBoxTypeIds = [];
                this.selection_list = [];
            },
            /** 选择邮件 */
            handle_select_mail(index, selection) {
                this.selection_list[index] = [];
                this.selectMailIds = [];
                this.selectMailBoxTypeIds = [];
                for (const item of selection) {
                    this.selection_list[index].push(item);
                }
                this.$store.commit('setSelectMailBoxType', this.currentBox);
                // this.setMailCookie("",this.currentBox,"");
                this.selectMailList = [];
                this.selection_list.forEach((item) => {
                    if (item) {
                        const select_mails = [...item];
                        this.selectMailList = select_mails.concat(this.selectMailList);
                    }
                });
                for (const item of this.selectMailList) {
                    this.selectMailIds.push(item.id);
                    this.selectMailBoxTypeIds.push(item.mailBoxTypeId);
                }

                // let total = 0;
                // this.table_list.forEach((item) => {
                //     total += item.data.length;
                // });
                // console.log(total, this.selectMailList.length);
                // if(total===this.selectMailList.length){
                //   this.checkAll = true
                // }else{
                //   this.checkAll = false
                // }
            },
            /** 全选 */
            handleCheckAll() {
                if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;
            },
            /** 通过主题关键字查询邮件 */
            searchByTheme() {
                this.page = 0;
                this.mockmailTableData();
            },
            /** 获取发件人选项   1发件人 2收件人 */
            getSenders(type) {
                util.ajaxMailJson({
                    url: 'mail/mailFromToRecord',
                    method: 'post',
                    data: {
                        createUserId: this.userId,
                        orgId: this.enterpriseId,
                        type: type === 'sender' ? '1' : '2'
                    }
                }).then((res) => {
                    if (res.data.code == 1) {
                        // let allList = res.data.data.map(email=>{
                        //   return {
                        //     value:email,
                        //     label:email,
                        //   }
                        // })
                        // allList = allList.filter(item=>{
                        //   return item.value
                        // })
                        // this.$set(this.config_tableFilter.sender,'allList',allList)
                        this.config_tableFilter[type].allList.splice(
                            0,
                            this.config_tableFilter[type].allList.length
                        );
                        res.data.data.forEach((item) => {
                            if (item) {
                                this.config_tableFilter[type].allList.push({
                                    value: item,
                                    label: item
                                });
                            }
                        });
                    }
                });
            },

            /** 日期格式化 */
            dateFormat(fmt, timeStramp) {
                if (typeof timeStramp === 'string' && timeStramp.includes('-')) {
                    timeStramp = timeStramp.replace(/\-/g, '/');
                }
                const date = new Date(timeStramp);
                const o = {
                    'M+': date.getMonth() + 1, // 月份
                    'd+': date.getDate(), // 日
                    'h+': date.getHours(), // 小时
                    'm+': date.getMinutes(), // 分
                    's+': date.getSeconds(), // 秒
                    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
                    S: date.getMilliseconds(), // 毫秒
                };
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(
                        RegExp.$1,
                        `${date.getFullYear()}`.substr(4 - RegExp.$1.length)
                    );
                }
                for (const k in o) {
                    if (new RegExp(`(${k})`).test(fmt)) {
                        fmt = fmt.replace(
                            RegExp.$1,
                            RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length)
                        );
                    }
                }
                return fmt;
            },
            /** 获取颜色的深浅度  返回 深色返白色；浅色反黑色 */
            getRGB(val) {
                const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
                const color = val.toLowerCase();
                const result = '';
                if (reg.test(color)) {
                    if (color.length === 4) {
                        const colorNew = '#';
                        for (let i = 0; i < 4; i += 1) {
                            colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
                        }
                        color = colorNew;
                    }
                    const colorChange = [];
                    for (let i = 1; i < 7; i += 2) {
                        colorChange.push(parseInt('0x' + color.slice(i, i + 2)));
                    }
                    const grayLevel = colorChange[0] * 0.299 + colorChange[1] * 0.587 + colorChange[2] * 0.114;
                    if (grayLevel > 192) {
                        return '#333';
                    } else {
                        return '#fff';
                    }
                } else {
                    result = '无效';
                    return result;
                }
            },
            // 录入线索
            createClue(mailId, email, currentMailAddType, currentMailInfo) {
                if (this.mailAddress === email) {
                    this.littleDrawerVisible = !this.littleDrawerVisible;
                } else {
                    this.littleDrawerVisible = false;
                    this.$nextTick(() => {
                        this.littleDrawerVisible = true;
                    });
                }
                this.mailAddress = email;
                this.currentMailId = mailId;
                this.currentMailInfo = currentMailInfo;
                this.currentMailInfo.mailAddress = email;
                // if (this.$refs.tabletoday) {
                //     this.$refs.tabletoday[0].show_company_detail = false;
                //     this.$refs.tabletoday[0].show_clue_detail = false;
                // }
                // if (this.$refs.tableyesterday) {
                //     this.$refs.tableyesterday[0].show_company_detail = false;
                //     this.$refs.tableyesterday[0].show_clue_detail = false;
                // }
                // if (this.$refs.tableago) {
                //     this.$refs.tableago[0].show_company_detail = false;
                //     this.$refs.tableago[0].show_clue_detail = false;
                // }
            },
            // 关闭小弹窗
            littleDrawerHidden(val) {
                this.littleDrawerVisible = val;
            },
            // 录入为线索后
            updateStatus(clueId, status) {
                this.clueId = clueId;
                this.getCompanyStatusByEmails();
                this.showClue({ clueId, type: 1 });
            },
            // 录入成询盘后
            updateInquiryStatus(clueId, status) {
                this.clueId = clueId;
                this.getInquiryAndCompanyInfoByEmails();
            },
            getInquiryAndCompanyInfoByEmails() {
                const postData = {
                    emailList: [this.mailAddress],
                    userId: this.userId,
                    orgId: this.enterpriseId
                };
                util.ajaxJson({
                    url: '/crm/mailbox/getInquiryAndCompanyInfoByEmails',
                    method: 'post',
                    data: postData
                }).then((response) => {
                    if (response.data.code === '1') {
                        const companyId = response.data.data[this.mailAddress].companyId;
                        this.showCompany({
                            companyId,
                            type: 1
                        });
                    }
                });
            },
            /** 显示详情 */
            async showCompany({ companyId, rightUserIds, type }) {
                if (type === 0) {
                    if (!this.isContainsMenu('highseasCustomer')) {
                        this.$Message.warning('您没有查看公海数据的权限，无法查看');
                        return;
                    }
                } else {
                    if (this.isContainsMenu('myCustomer')) {
                        if (type === 2) {
                            const flag = await this.isHaveManageAuthority(rightUserIds);
                            if (!flag) {
                                this.$Message.warning('您当前无权限查看此客户');
                                return false;
                            }
                        }
                    } else {
                        this.$Message.warning('您没有客户管理页面的查看权限，请联系您的管理员开通');
                        return false;
                    }
                }
                this.show_clue_detail = false;
                this.show_company_detail = false;
                this.littleDrawerVisible = false;
                this.$nextTick(() => {
                    this.companyId = companyId;
                    if (type === 1 || type === 2) {
                        /**
                         * @Description: 如要修改点击橙色小人头标识跳转至目标详情页，修改此处的type_company即可。
                         *               customer(客户详情页)/inquiry(询盘详情页)
                         * @author 杨娣
                         * @date 2021/01/20
                         */
                        this.type_company = 'customer';
                    } else if (type === 0) {
                        this.type_company = 'highseasCustomer';
                    }
                    // 获取 下拉选项数据 子组件有用到 更新下
                    this.$store.dispatch('getSelectOptions');
                    this.get_columns_authorized();
                    this.show_company_detail = true;
                });
            },
            async showClue({ clueId, rightUserIds, type }) {
                if (type === 0) {
                    if (!this.isContainsMenu('common_sea_customer')) {
                        this.$Message.warning('您没有查看公海数据的权限，无法查看');
                        return;
                    }
                } else {
                    if (this.isContainsMenu('my_clue')) {
                        if (type === 2) {
                            const flag = await this.isHaveManageAuthority(rightUserIds);
                            if (!flag) {
                                this.$Message.warning('您当前无权限查看此客户');
                                return false;
                            }
                        }
                    } else {
                        this.$Message.warning('您没有线索管理页面的查看权限，请联系您的管理员开通');
                        return false;
                    }
                }
                this.show_company_detail = false;
                this.show_clue_detail = false;
                this.littleDrawerVisible = false;
                this.$nextTick(() => {
                    this.clueId = clueId;
                    if (type === 1 || type === 2) {
                        this.type_clue = 'clue';
                    } else if (type === 0) {
                        this.type_clue = 'highseasClue';
                    }
                    // 获取 下拉选项数据 子组件有用到 更新下
                    this.$store.dispatch('getSelectOptions');
                    this.get_columns_authorized();
                    this.show_clue_detail = true;
                });
            },
            /* 当前用户是否拥有某些人员的管理权限的判断 */
            isHaveManageAuthority(userIds) {
                return new Promise((resolve) => {
                    util
                        .ajaxJson({
                            url: '/new-privilege/manage/getusers',
                            method: 'get',
                            params: {
                                orgId: this.enterpriseId,
                                userId: this.userId
                            }
                        })
                        .then((res) => {
                            if (res.data.code === '1') {
                                // 该用户可管理的人员id集合
                                const arr1 = res.data.data;
                                // 询盘/线索负责人的id集合
                                const arr2 = userIds.map(Number);
                                // 如果有重复，则可打开
                                const flag = arr2.filter((x) => {
                                    return arr1.includes(x);
                                });
                                resolve(flag.length);
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            resolve(0);
                        });
                });
            },
            /* 获取crm相关字段权限 */
            get_columns_authorized() {
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        parentId: 0
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // 暂存所有默认字段和自定义字段
                        const defaultFields = response.data.data && Array.isArray(response.data.data.default) ? response.data.data.default : [];
                        const customFields = response.data.data && Array.isArray(response.data.data.custom) ? response.data.data.custom : [];
                        // 筛选得到公司/询盘/联系人授权字段
                        this.$set(this.corp_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 1));
                        this.$set(this.corp_columns_authorized, 'custom', customFields.filter(col => col.parentId === 1));
                        this.$set(this.contact_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 2));
                        this.$set(this.contact_columns_authorized, 'custom', customFields.filter(col => col.parentId === 2));
                        this.$set(this.inquiry_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 3));
                        this.$set(this.inquiry_columns_authorized, 'custom', customFields.filter(col => col.parentId === 3));
                        if (this.corp_columns_authorized.default) {
                            this.corp_columns_authorized.default.forEach(item => {
                                if (this.lang_company.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_company[item.storageName];
                                }
                            });
                        }
                        if (this.contact_columns_authorized.default) {
                            this.contact_columns_authorized.default.forEach(item => {
                                if (this.lang_contact.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_contact[item.storageName];
                                }
                            });
                        }
                        if (this.inquiry_columns_authorized.default) {
                            this.inquiry_columns_authorized.default.forEach(item => {
                                if (this.lang_inquiry.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_inquiry[item.storageName];
                                }
                            });
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    }
                }).catch(erro => {
                    this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                });
            },
            /**
             * @Description: 添加此方法，解决小人头颜色标识与问题提示内容不一致的bug
             * @author 杨娣
             * @date 2019/12/16
             */
            changeCrmFlag({ param, key, type }) {
                this.mailList = this.mailList.map((item) => {
                    if (item.id === param.id) {
                        item[key] = type;
                    }
                    return item;
                });
            },
            /** 给邮件增加删除标签 ,参数1增加/删除的标签id;参数2增加1删除0 */
            operateTag(mailId, label, type) {
                util.ajaxMailJson({
                    url: '/mail/maillabel/operateMailLabel',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        mailBoxIds: [mailId],
                        mailLabelId: label,
                        operateState: type
                    }
                }).then((res) => {
                    if (res.data.code === 1) {
                        if (type) {
                            this.$Message.success('成功设置邮件标签');
                        }
                        this.mailList.forEach((item) => {
                            if (item.id === mailId && item.labelId.length) {
                                const index = item.labelId.findIndex((id) => id === label);
                                if (index !== -1) {
                                    item.labelId.splice(index, 1);
                                    item.labelName.splice(index, 1);
                                    item.labelColor.splice(index, 1);
                                }
                            }
                        });
                    }
                });
            },
            /**
             * @Description: 此方法是为了解决频繁出现邮件列表页初始显示的小人头状态，与鼠标悬停之后显示的状态不一致的问题。
             *               获取到邮件列表数据之后，即根据对应箱体拿到标准邮箱集合，统一获取小人头状态并更新显示
             * @author 杨娣
             * @date 2020/05/22
             */
            getCompanyStatusByEmails() {
                const emailList = [];
                emailList.push(...new Set(this.emails));
                if (emailList.length) {
                    const postData = {
                        emailList: emailList,
                        userId: this.userId,
                        orgId: this.enterpriseId
                    };
                    util
                        .ajaxJson({
                            url: '/crm/mailbox/getInquiryAndCompanyInfoByEmails',
                            method: 'post',
                            data: postData
                        })
                        .then((response) => {
                            if (response.data.code === '1') {
                                const res = response.data.data;
                                this.crmEmails = [];
                                for (let i = 0; i < emailList.length; i++) {
                                    if (res[emailList[i]] && res[emailList[i]].success) {
                                        res[emailList[i]].email = emailList[i];
                                        this.crmEmails.push(res[emailList[i]]);
                                    }
                                }
                                this.mailList.map((item) => {
                                    let currentMail = {};
                                    if (item.fromOrToFlag) {
                                        const tempEmail = item.recipient[0];
                                        currentMail = this.crmEmails.find((subItem) => subItem.email === this.getStandardEmail(tempEmail));
                                        if (currentMail && currentMail.type) {
                                            if (currentMail.type !== 0) {
                                                item.companyName = currentMail.companyName || '';
                                                item.contactsName =
                                                    currentMail.contactsName ||
                                                    handleMailAddress(tempEmail);
                                                item.shortName = currentMail.shortName || '';
                                            } else {
                                                item.contactsName = handleMailAddress(tempEmail);
                                            }
                                            if (item.recieverCrmFlag !== currentMail.type) {
                                                item.recieverCrmFlag = currentMail.type;
                                                this.updateCrmFlag(currentMail, currentMail.type);
                                            }
                                        } else {
                                            item.contactsName = handleMailAddress(tempEmail);
                                        }
                                    } else {
                                        const tempEmail = item.sender;
                                        currentMail = this.crmEmails.find((subItem) => subItem.email === this.getStandardEmail(tempEmail));
                                        if (currentMail && currentMail.type) {
                                            if (currentMail.type !== 0) {
                                                item.companyName = currentMail.companyName || '';
                                                item.contactsName =
                                                    currentMail.contactsName ||
                                                    handleMailAddress(tempEmail);
                                                item.shortName = currentMail.shortName || '';
                                            } else {
                                                item.contactsName = handleMailAddress(tempEmail);
                                            }
                                            if (item.mailCrmFlag !== currentMail.type) {
                                                item.mailCrmFlag = currentMail.type;
                                                this.updateCrmFlag(currentMail, currentMail.type);
                                            }
                                        } else {
                                            item.contactsName = handleMailAddress(tempEmail);
                                        }
                                    }
                                });
                            } else {
                                console.log('获取邮件小人头状态失败');
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
                function handleMailAddress(mailAdd) {
                    let startIndex = 0;
                    let endIndex = -1;
                    if (mailAdd && mailAdd.lastIndexOf('<') > 0) {
                        endIndex = mailAdd.lastIndexOf('<');
                    } else if (mailAdd.lastIndexOf('@') > 0) {
                        endIndex = mailAdd.lastIndexOf('@');
                    } else {
                        endIndex = mailAdd.length;
                    }
                    if (mailAdd && mailAdd.lastIndexOf('<') === 0) {
                        startIndex = 1;
                    }
                    mailAdd = mailAdd.slice(startIndex, endIndex);
                    return mailAdd;
                }
            },
            /* 获取当前页面所有的邮件地址 */
            getCurrentPageEmails(data) {
                this.emails = [];
                data.forEach((item) => {
                    if (item.fromOrToFlag && item.recipient[0]) {
                        this.emails.push(item.recipient[0]);
                    } else if (item.sender) {
                        this.emails.push(item.sender);
                    }
                });
                this.emails = this.emails.map((item) => {
                    // if (item.includes('@') && item.length > 32) {
                    //     const startIndex = item.indexOf('<');
                    //     const endIndex = item.indexOf('>');
                    //     return item.substring(startIndex + 1, endIndex);
                    // } else if (item.length <= 32) {
                    //     return this.getStandardEmail(item);
                    // }
                    return this.getStandardEmail(item);
                });
            },
            /* 更新小人头状态 */
            updateCrmFlag(data) {
                util
                    .ajaxMail({
                        url: '/mail/mailBoxs/updateCrmFlagNew',
                        method: 'post',
                        timeout: 360000,
                        data: {
                            address: data.email,
                            createUserId: this.currentPersonId,
                            orgId: this.enterpriseId
                        }
                    })
                    .then((res) => {
                        if (res.data.code === '1') {
                            console.log('修改crmFlag成功');
                        }
                    });
            },
            /* 获取标准邮箱地址 */
            getStandardEmail(emailAdd) {
                // console.log(emailAdd);
                if (emailAdd && emailAdd.lastIndexOf('<') !== -1) {
                    const startIndex = emailAdd.lastIndexOf('<');
                    return emailAdd.slice(startIndex + 1, emailAdd.length - 1);
                } else {
                    return emailAdd;
                }
            },
            refreshEmailList() {
                this.getCompanyStatusByEmails();
            },
            /* 更新列表数据的星标/处理状态 */
            updateMailFlag(mailId, mailFlag, target) {
                this.mailList.forEach((item) => {
                    if (item.id === mailId) {
                        if (target === 'toDoFlag') {
                            item.mailToDoFlag = mailFlag;
                        } else if (target === 'starFlag') {
                            item.mailStarFlag = mailFlag;
                        }
                    }
                    return item;
                });
            },
            /* 改变邮件的处理状态 */
            changeProcessingState(mailId, status, index) {
                util.ajaxJson({
                    url: '/mail/toDoMail',
                    method: 'post',
                    data: {
                        ids: [mailId],
                        mailFlag: status,
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }
                }).then((res) => {
                    if (res.data.code === 1) {
                        this.$set(this.mailList[index], 'mailToDoFlag', status);
                        this.emptySelection();
                        this.$store.dispatch('getUnreadMail');
                        switch (status) {
                            case 1:
                                this.$Message.success(this.$t('mail.markAsUntreatedSuccess'));
                                break;
                            case 2:
                                this.$Message.success(this.$t('mail.markAsFinishedSuccess'));
                                break;
                        }
                    }
                }).catch((err) => {
                    console.log('changeProcessingState()---err', err, status);
                });
            },
            /* 获取线索表单字段 */
            getXSShow() {
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        this.templateId = res.data.data.template.id;
                        console.log('res.data.data.template.id', res.data.data.template.id);
                    }
                });
            },
            // 小人头 或 little-drawer弹窗按钮功能
            handleClick(params) {
                if (params.clickType === 'writeMail') {
                    const emails = [{
                        receiverName: params.newMailInfo.nickName || '',
                        receiveMailAddress: params.newMailInfo.mailAddress || '',
                        followUpId: params.newMailInfo.followUpId ? params.newMailInfo.followUpId : '',
                        followUpType: params.newMailInfo.followUpType ? params.newMailInfo.followUpType : ''
                    }];
                    localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                    this.writeMail();
                } else if (params.clickType === 'createContent') {
                    this.createContent(params.newMailInfo);
                } else if (params.clickType === 'createRule') {
                    this.createRule(params.newMailInfo);
                } else if (params.clickType === 'createNewClue') {
                    this.newCreateClue(params.newMailInfo);
                } else if (params.clickType === 'createNewCompany') {
                    this.createCompany(params.newMailInfo);
                }
            },
            // 创建联系人
            createContent(currAccountInfo) {
                this.newContactInfo = {
                    email: currAccountInfo.mailAddress,
                    name: currAccountInfo.nickName
                };
                this.letAddModalShow = true;
            },
            // 新建收发件规则
            createRule(currAccountInfo) {
                this.newContactInfo = {
                    email: currAccountInfo.mailAddress,
                    name: currAccountInfo.nickName
                };
                this.newRulesModalShow = true;
            },
            // 关掉录入线索模态框
            open_close(data) {
                this.inputClue = data.close;
            },
            // 取消录入线索
            on_cancle_clue(data) {
                this.inputClue = data.close;
            },
            newCreateClue(data) {
                this.inputClue = false;
                this.json_data = {
                    templateId: this.templateId,
                    enterpriseId: this.enterpriseId,
                    source: 3,
                    userId: this.userId,
                    userName: this.userName,
                    a10010: data.mailAddress,
                    a1009: data.nickName,
                    id: data.mailId
                };
                this.inputClue = true;
            },
            createCompany(data) {
                this.newCompanyShow = false;
                this.json_data = {
                    nickName: data.nickName
                };
                this.$nextTick(() => {
                    this.newCompanyShow = true;
                });
                this.createCompanyAddress = data.mailAddress;
            },
        },
        created() {
            this.init();
            // 获取 下拉选项数据 子组件有用到 更新下
            this.$store.dispatch('getSelectOptions');
            // 获取全部销售人员 线索弹窗录询盘用
            this.$store.dispatch('getSalesList');
            this.get_columns_authorized();
            this.getXSShow();
        }
    };
</script>
