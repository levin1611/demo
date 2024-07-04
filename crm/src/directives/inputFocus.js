export default {
    beforeMount(el, binding, vnode) {
        el.querySelector('input').focus();
    }
};