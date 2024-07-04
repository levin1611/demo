import Cookies from 'js-cookie';
// import { clearAllInfo } from '@/utils/safe';
const user = {
    state: {},
    mutations: {
        logout(state, vm) {
            Cookies.remove('userName');
            Cookies.remove('userId');
            Cookies.remove('token');
            Cookies.remove('accId');
            Cookies.remove('agentOrgList');
            Cookies.remove('enterpriseId');
            Cookies.remove('initMenu');
            Cookies.remove('notChatWithOther');
            // 恢复默认样式
            // let themeLink = document.querySelector('link[name="theme"]');
            // themeLink.setAttribute('href', '');
            // 清空打开的页面等数据，但是保存主题数据
            // let saveList = ['theme', 'historySearch', 'conditionlist', 'conditionList_my', 'conditionList_inq', 'conditionList_com', 'conditionList_sub', `selectedServices_${vm.$store.state.enterpriseId}`];
            // let saveObj = {};
            // saveList.forEach((item, i) => {
            //     if (localStorage[item]) {
            //         saveObj[item] = localStorage[item];
            //     }
            // });

            // 获取 localStorage 中之前存入的升级提醒相关数据
            const upgradeTipObj = {};
            [
                'xhl_upgradeTip',
                'xhl_upgradeTipStartTime',
                'xhl_upgradeTipEndTime',
                'xhl_closeUpgradeTipTime'
            ].forEach(item => {
                const val = localStorage.getItem(item);
                if (val) {
                    upgradeTipObj[item] = val;
                }
            });

            // 清空 localStorage
            console.log('localstorage.clear');
            // localStorage.clear();
            // clearAllInfo();
            // 把升级提醒相关数据重新存入 localStorage
            Object.keys(upgradeTipObj).forEach(item => {
                localStorage.setItem(item, upgradeTipObj[item]);
            });

            // for (let key in saveObj) {
            //     localStorage[key] = saveObj[key];
            // }
        }
    }
};

export default user;
