import Vue from 'vue';

// 获取层级最近的滚动元素
let scrollParent;
function getScrollParent(element) {
    const parent = element.parentNode;

    if (!parent) {
        return null;
    }

    if (parent.scrollHeight > parent.clientHeight) {
        return parent;
    } else {
        return getScrollParent(parent);
    }
}

// 定义滚动处理方法
let scrollListener;
function getScrollListener(binding, vnode) {
    return function() {
        binding.value(vnode);
    };
}

// v-outerScroll: 处理外部滚动容器的滚动
Vue.directive('outerScroll', {
    inserted: function(el, binding, vnode) {
        // 延时取 scrollParent , 避免初始化时页面滚动条显示影响到取值
        setTimeout(() => {
            scrollParent = getScrollParent(el);
            if (scrollParent) {
                scrollListener = getScrollListener(binding, vnode);
                scrollParent.addEventListener('scroll', scrollListener);
            }
        }, 100);
    },
    update: function(el, binding, vnode) {
        // 更新 scrollParent
        const tmp = getScrollParent(el);
        if (scrollParent !== tmp) {
            if (scrollParent) {
                scrollParent.removeEventListener('scroll', scrollListener);
            }
            if (tmp) {
                scrollParent = tmp;
            }
        }

        // 更新 scrollListener , 重新监听 scroll , 避免传入的 vnode 不对
        scrollListener = getScrollListener(binding, vnode);
        scrollParent.addEventListener('scroll', scrollListener);
    },
    unbind: function(el, binding) {
        if (scrollParent) {
            scrollParent.removeEventListener('scroll', scrollListener);
        }
    }
});
