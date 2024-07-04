import Vue from 'vue';
import Icon from './icon';
import HelpTip from './helpTip';
import AbbrLabel from './abbrLabel';
import SoftTag from './softTag';
import AutoWrapBtnGroup from './autoWrapBtnGroup';

// Vue.component('Icon', Icon);
// Vue.component('HelpTip', HelpTip);
Vue.component('AbbrLabel', AbbrLabel);
Vue.component('SoftTag', SoftTag);
Vue.component('AutoWrapBtnGroup', AutoWrapBtnGroup);

export default {
    Icon,
    HelpTip,
    AbbrLabel,
    SoftTag,
    AutoWrapBtnGroup
};
