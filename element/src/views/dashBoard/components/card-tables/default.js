export default {
    data: () => {
        return {
            defaultList:[
                { i: 'nameCard', component: 'nameCard', isShow: true, name: this.$t('dashBoardV2.Title.nameCard')},
                { i: 'taskCard', component: 'taskCard', isShow: true, name: this.$t('dashBoardV2.Title.task') },
                { i: 'worldTime', component: 'WAWT', isShow: true, name: this.$t('dashBoardV2.Title.worldTime')},
                { i: 'whatsApp', component: 'WAWT', isShow: true, name: this.$t('dashBoardV2.Title.whatsApp')},
                { i: 'epidemic', component: 'epidemic', isShow: true, name: this.$t('dashBoardV2.Title.epidemic')},
                { i: 'exchangeRate', component: 'exchangeRate', isShow: true, name: this.$t('dashBoardV2.Title.exchangeRate') },
                { i: 'business', component: 'tableCard', isShow: true, name: this.$t('dashBoardV2.Title.business')},
                { i: 'workload', component: 'tableCard', isShow: true, name: this.$t('dashBoardV2.Title.workload')},
                { i: 'keyAccount', component: 'tableCard', isShow: true, name: this.$t('dashBoardV2.Title.keyAccount')},
                { i: 'mail', component: 'tableCard', isShow: true, name: this.$t('dashBoardV2.Title.mail')},
                { i: 'todoList', component: 'tableCard', isShow: true, name: this.$t('dashBoardV2.Title.todoList')},
                { i: 'crmTasks', component: 'crmTasks', isShow: true, name: this.$t('dashBoardV2.Title.crmTasks')},
                { i: 'indexCanvas', component: 'indexCanvas', isShow: true, name: this.$t('dashBoardV2.Title.indexCanvas')}
            ]
        }
    }
}
