// 拖拽指令
export const drag = {
    bind(el, binding) {
        let oDiv = el; // 当前元素
        oDiv.onmousedown = function(e) {
            console.log(e.target.nodeName);
            if (e.target.type === 'text' || e.target.type === 'textarea' || e.target.className === 'ivu-slider-button' ||
                e.target.className === 'ivu-slider-wrap' ||
                e.target.className === 'grade' ||
                e.target.className === 'checkrepeatbtn' ||
                e.target.className === 'ivu-select-selected-value' ||
                e.target.className === 'ivu-select-placeholder' ||
                e.target.className === 'ivu-select-item' ||
                e.target.nodeName === 'I'
            ) return;
            // 鼠标按下，计算当前元素距离可视区的距离
            let disX = e.clientX - oDiv.offsetLeft;
            let disY = e.clientY - oDiv.offsetTop;
            document.onmousemove = function(e) {
                // 通过事件委托，计算移动的距离
                let l = e.clientX - disX;
                let t = e.clientY - disY;
                // 移动当前元素
                if (l <= -790) {
                    l = -790;
                }
                if (l >= 450) {
                    l = 450;
                }
                if (t <= 100) {
                    t = 100;
                }
                if (t >= 600) {
                    t = 600;
                }
                oDiv.style.left = `${l}px`;
                oDiv.style.top = `${t}px`;
                // 将此时的位置传出去
                binding.value({x: e.pageX, y: e.pageY});
            };
            document.onmouseup = function(e) {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
    }
};
