import Vue from 'vue';

let scrollListener;
function getScrollListener(binding) {
    let currentLeft = 0; // 初始左滑距离为0
    return function() {
        // Math.trunc()会将数字的小数部分去掉，只保留整数部分 解决屏幕放大 引起的高度浮点
        const scrollDistance = Math.trunc(this.scrollHeight - this.scrollTop - this.clientHeight); // 向下滚动距离
        const scrollL = this.scrollLeft - currentLeft; // 左滑距离
        currentLeft = this.scrollLeft;
        // 当纵向滑动到底部，且横向不滑动时，触发滚动事件
        if (scrollDistance <= 0 && scrollL == 0) {
            binding.value();
        }
    };
}

// v-dialogDrag: 弹窗拖拽属性
Vue.directive('tableLoadMore', {
    bind: function(el, binding) {
        const selectWrap = el.querySelector('.el-table__body-wrapper');
        scrollListener = getScrollListener(binding);
        selectWrap.addEventListener('scroll', scrollListener);
    },
    unbind: function(el, binding) {
        const selectWrap = el.querySelector('.el-table__body-wrapper');
        selectWrap.removeEventListener('scroll', scrollListener);
    }
});
