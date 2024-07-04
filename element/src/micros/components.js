
import ClueDrawerList from '@/views/clue-manage/Detail/ClueDrawerList';
import CRMDrawerList from '@/views/crm/Detail/CRMDrawerList';
import NewCompany from '@/views/clue-manage/Detail/Components/Modal/newCompany';
import dataBaseModal from '@/views/crm/Briefcase/Components/dataBaseComponents/dataBaseModal.vue';
import TaskModal from '@/views/crm/Detail/Components/Modal/taskModals';
import EditColumns from '@/views/crm/Table/Components/Modal/editColumns';
import monitorLink from '@/views/main-components/contact-association/monitorLink';
import EnterClueModal from '@/views/main-components/enter-clue/enter-clue';
import FilterTags from '@/views/main-components/filter-tags';
import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';
import newDetailWrap from '@/views/main-components/detailWrap/index.vue';

import RulesTagInput from '@/views/main-components/tag-input/rules-tag-input';
import TagInput from '@/views/main-components/tag-input/tag-input';
import TagShow from '@/views/main-components/tag-input/tag-show';
import TimeLineMailDetail from '@/views/main-components/timeline/Components/mailDetail'; // 时间轴邮件详情页
import Search from '@/views/main-components/search-input/search-input';
import TooltipAuto from '@/views/main-components/tooltipAuto';
import FilterBox from '@/views/main-components/filter-box';
import xhlSelect from '@/components/xhl-select';
import fileNameIcon from '@/components/file-name-icon';
import CountryAreaSelect from '@/components/countryAreaSelect';
import customPlugins from '@/plugins/custom';
import LocusSide from '@/views/facebook/inbox/components/LocusSide';
import CustomerDrawer from '@/views/crm/Table/Components/Html/customerDrawer';
// 这个组件里面用到了main-components文件夹下的组件及crm文件夹下的组件
import InquiryDetail from '@/views/main-components/tiny-detail/Inquiry-detail/InquiryDetail';
import FacebookInteractionInfo from '@/views/main-components/timeline/facebook-interaction/FacebookInteractionInfo';
import ClueDetail from '@/views/main-components/tiny-detail/clue-detail/ClueDetail';
import Mail from '@/views/main-components/timeline/mail/visitor-mail';
import ShortCuts from '@/views/main-components/Shortcuts.vue';
// 虽然是WhatsApp组件,但是在其他非WhatsApp页面也用到了
import WhatsAppModal from '@/views/main-components/timeline/WhatsApp/modal/WhatsAppModal';
import WhatsAppReplyModal from '@/views/main-components/timeline/WhatsApp/modal/WhatsAppReplyModal';
import whatsAppRelatedRecords from '@/views/whatsapp-manage/components/whatsAppRelatedRecords.vue';
import whatsAppSend from '@/views/whatsapp-manage/whatsApp-chat-frame/whatsAppSend';
import whatsAppMsgItem from '@/views/whatsapp-manage/whatsApp-chat-frame/whatsAppMsgItem.vue';
import smsMsgItem from '@/views/calling_sms/smsMsgItem.vue';

import { EventBus } from '@/utils/EventBus.js';
import replyMailModal from '@/views/main-components/timeline/Components/replyMailModal';
// 邮件公共组件
import WriteMail from '@/views/mail/mail-home/components/write-mail/write-mail.vue';
import MailDetail from '@/views/mail/mail-home/components/MailDetail.vue'; // 邮件详情页
import RecipientPoptip from '@/views/mail/mail-home/components/recipientPoptip';
import SenderPoptip from '@/views/mail/mail-home/components/senderPoptip';
import SynchronousPoptip from '@/views/mail/mail-home/components/SynchronousPoptip';
import taskPoptip from '@/views/mail/mail-home/components/taskPoptip';
import MailArchive from '@/views/mail/mail-home/components/mail-table/components/Modal/MailArchive';
import AddContact from '@/views/mail/mail-settings/modal/add_contact';
import MailAddContact from '@/views/mail/mail-home/components/write-mail/Modal/address_book_modal.vue';
import newRules from '@/views/mail/mail-settings/modal/new_rules';
import selfUpload from '@/views/mail/mail-home/components/write-mail/self-upload';
import QuickText from '@/views/email-marketing/marketing-activities/components/new-marketing/quickText.vue';
// 资料库文件组件(选择文件)
import DragFile from '@/views/main-components/drag-file-postByFile.vue';
import stepsImage from '@/steps/steps-image';
// crm高级筛选组件
import topFilter from '@/views/crm/Table/Components/Html/topFilter.vue';
// crm 跟进状态变更 用在wa同屏查看下属的 泳道拖动变更状态
import FollowUpStatus from '@/views/crm/Detail/Components/Html/followUpStatus';
// 企微弹窗
import dataBaseVue from '@/views/main-components/timeline/Micronent/dataBase.vue';
import repalyMicroent from '@/views/main-components/timeline/Micronent/repalyMicroent.vue';
// 词云组件
import wordcloud from '@/views/whatsapp-manage/components/wordcloud.vue';
// 通话短信-消息弹窗modal
import SmsModal from '@/views/calling_sms/SmsModal.vue';
// 通话短信-通话详情组件
// import CalldetailDialog from '@/views/calling_sms/CalldetailDialog.vue';

// 部门、角色、员工 组件
import commonUserSelect from '@/views/main-components/commonUserSelect/commonUserSelect.vue';
import CommonFilePreview from '@/views/main-components/filePreview';

// // whatsapp群组消息发送modal
// import whatsAppGroupSendModal from '@/views/whatsapp-manage/whatsAppGroupSendModal/index';
import showTemplate from '@/views/systemSettings/company_mail_magage/components/showTemplate.vue';
import classificationModal from '@/views/systemSettings/company_mail_magage/components/classificationModal.vue';
import mailTemplateModal from '@/views/main-components/mail-template-modal.vue';
import advancedFilteringModal from '@/views/main-components/advancedFilteringModal.vue';
export default {
    // whatsAppGroupSendModal,
    wordcloud,
    EventBus,
    ClueDrawerList,
    CRMDrawerList,
    NewCompany,
    dataBaseModal,
    repalyMicroent,
    dataBaseVue,
    TaskModal,
    EditColumns,
    monitorLink,
    EnterClueModal,
    FilterTags,
    littleDrawer,
    newDetailWrap,
    RulesTagInput,
    TagInput,
    TagShow,
    TimeLineMailDetail,
    Search,
    TooltipAuto,
    FilterBox,
    xhlSelect,
    fileNameIcon,
    CountryAreaSelect,
    ...customPlugins,
    LocusSide,
    CustomerDrawer,
    InquiryDetail,
    WhatsAppModal,
    SmsModal,
    WhatsAppReplyModal,
    FacebookInteractionInfo,
    ClueDetail,
    Mail,
    ShortCuts,
    whatsAppRelatedRecords,
    whatsAppSend,
    whatsAppMsgItem,
    replyMailModal,
    WriteMail,
    MailDetail,
    AddContact,
    MailAddContact,
    newRules,
    selfUpload,
    showTemplate,
    classificationModal,
    mailTemplateModal,
    QuickText,
    RecipientPoptip,
    SenderPoptip,
    SynchronousPoptip,
    taskPoptip,
    MailArchive,
    DragFile,
    stepsImage,
    topFilter,
    FollowUpStatus,
    smsMsgItem,
    // CalldetailDialog
    commonUserSelect,
    CommonFilePreview,
    advancedFilteringModal
};


