const { VUE_APP_CRM_ENTRY, VUE_APP_PERMISSION_ENTRY, VUE_APP_MAIL_ENTRY, VUE_APP_WA_MICRO_ENTRY, VUE_APP_AI_MICRO_ENTRY } = process.env;
const origin = location.origin;
export const childRules = [
    {
        name: 'permisssystem',
        entry: origin.indexOf('https') >= 0 ? `${origin}/Front-PermissionSystem/#/` : VUE_APP_PERMISSION_ENTRY,
        container: '#appContainer',
        rule: [
            '#/systemSettings/company',
            '#/systemSettings/businessObjectAndField',
            '#/systemSettings/organizational',
            '#/systemSettings/noticeSetting'
        ]
    },
    {
        name: 'crm',
        entry: origin.indexOf('https') >= 0 ? `${origin}/Front-Crm/#/` : VUE_APP_CRM_ENTRY,
        container: '#appContainer',
        rule: [
            '#/crm'
        ]
    },
    {
        name: 'mail',
        entry: origin.indexOf('https') >= 0 ? `${origin}/Front-Mail/#/` : VUE_APP_MAIL_ENTRY,
        container: '#appContainer',
        rule: [
            '#/mail_home',
            '#/systemSettings/mail_set'
        ]
    },
    {
        name: 'whatsapp',
        entry: origin.indexOf('https') >= 0 ? `${origin}/Front-WhatsApp/#/` : VUE_APP_WA_MICRO_ENTRY,
        container: '#appContainer',
        rule: [
            // '#/systemSettings/whatsapp_setting',
            // '#/systemSettings/abnormal_setting',
            '#/communication/whatsapp_chat',
            '#/socialMedia/whatsapp_management'
            // '#/whatsapp_microenterprise/',
            // '#/calling_sms/'
        ]
    },
    {
        name: 'v3permission',
        entry: origin.indexOf('https') >= 0 ? `${origin}/Front-PermissionSystem/#/` : VUE_APP_PERMISSION_ENTRY,
        container: '#firstlevelpageWrap',
        rule: [
            '#/login',
            '#/register',
            '#/gatePassDetail'
        ]
    },
    {
        name: 'enterpriseGPT',
        entry: origin.indexOf('https') >= 0 ? `${origin}/Front-Ai/#/` : VUE_APP_AI_MICRO_ENTRY,
        container: '#appContainer',
        rule: [
            '#/enterpriseGPT/', '#/websiteInteraction/aiseo'
        ]
    }
];
