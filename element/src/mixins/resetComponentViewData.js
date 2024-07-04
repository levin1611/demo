export default {
    data() {
        return {
            crmStatusList: [
                { label: this.$t('mail.untreatedDocumented'), value: 0 },
                { label: this.$t('mail.clue'), value: 1 },
                { label: this.$t('mail.contact'), value: 2 },
                { label: this.$t('mail.customer'), value: 3 }
            ],
            crmStatusListAll: [
                { value: 1, label: this.$t('mail.untreatedDocumented') },
                { value: 2, label: this.$t('mail.my_leads') },
                { value: 3, label: this.$t('mail.public_leads') },
                { value: 4, label: this.$t('mail.other_leads') },
                { value: 5, label: this.$t('mail.myContact') },
                { value: 6, label: this.$t('mail.otherContact') },
                { value: 7, label: this.$t('mail.my_customers') },
                { value: 8, label: this.$t('mail.public_customers') },
                { value: 9, label: this.$t('mail.other_customers') }
            ]
        };
    },
    methods: {
        // 重新加载main组件
        clearFilterConditionByInitView(componentName = 'customRootRoomMainView') {
            const components = this.$dym.findComponentsUpward(this, componentName);
            for (let i = 0; i < components.length; i++) {
                const item = components[i];
                if (item.resetChildViewData && typeof item.resetChildViewData === 'function') {
                    item.resetChildViewData();
                    break;
                }
            }
        },
        clearFilterConditionByFater(componentName = 'authority') {
            if (!componentName) return false;
            const components = this.$dym.findComponentUpward(this, componentName);
            if (components.revertChildrenView) {
                components.revertChildrenView();
            } else {
                console.log('%c 请注册 revertChildrenView', 'color: red');
            }
        }
    },
    computed: {
        customEmptyTextLang() {
            return this.$t('crm.Table.noFilterData');
        },
        customEmptyButtonTextLang() {
            return this.$t('crm.Table.noFilterDataButton');
        }
    }
};
