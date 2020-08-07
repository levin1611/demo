import Vue from 'vue';
import App from './App';
import router from './router';

import './assets/css/main.scss';

import Http from "./server/http";
Vue.config.productionTip = false;

Vue.prototype.$http = Http;
/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    render: h => h(App)
})