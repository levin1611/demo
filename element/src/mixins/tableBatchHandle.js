export default {
    data() {
        return {
            // 23年9月 crm列表新增批量群发邮件、发送WhatsApp需求通用代码，客户管理、公海客户、询盘管理、线索管理、公海线索中使用
            fieldColumns: {
                companyName: false,
                jobTitle: false,
                whatsApp: false,
                email: false
            },
            visible_contact_selectionBox: false,
            sendType: null
        };
    },
    methods: {
        bulkSending() {
            this.sendType = 'email';
            this.visible_contact_selectionBox = true;
        },
        sendWhatsApp() {
            this.sendType = 'whatsApp';
            this.visible_contact_selectionBox = true;
        }
    }
};
