/**
 * @Description: v-scrollWheel: 无限滚动容器不显示滚动条时, 使用 wheel 来判断是否向下滚动是否需要加载更多
 * arg: 组件滚动容器 class 名, 不传则使用当前 el
 * @author 汤一飞
 * @date 2022/6/16
 */
import _ from 'lodash';

// 滚轮滚动监听器
let wheelListener;
function getWheelListener(el, binding) {
    // 防抖
    return _.debounce(function(e) {
        // 目前只监听向下滚动
        if (e.deltaY > 0) {
            // 获取滚动容器
            let scrollEl;
            if (binding.arg) {
                scrollEl = el.querySelector(`.${binding.arg}`);
            } else {
                scrollEl = el;
            }

            // 滚动容器无垂直滚动条, 则由此指令执行向下滚动加载更多动作
            if (scrollEl.scrollHeight <= scrollEl.clientHeight) {
                binding.value();
            }
        }
    }, 300);
}

// 注册指令
export default {
    mounted: function(el, binding) {
        wheelListener = getWheelListener(el, binding);
        el.addEventListener('wheel', wheelListener);
    },
    unmounted: function(el, binding) {
        el.removeEventListener('wheel', wheelListener);
    }
};
