import Vue from 'vue';

Vue.directive('fo', {
    inserted(el, binding, vnode) {
        el.querySelector('input').focus();
    }
})
