<template>
    <!-- 自定义音频播放组件样式 -->
    <div>

             <!-- 屏蔽 -->
        <Modal :visible.sync="showDialog"
               :title="'通话详情'"
               :show-close="true"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               :append-to-body="true"
               width="520px"
               class="modal calling_detaild_dialog_3">
            <div>
                <aside class="video_mock">
                    <button @click="play">开始/暂停</button>
                    <section>
                        <div class="process" ref="process_ref">
                            <div class="process_bar">
                                <div class="process_dot" ref="dot_process"></div>
                            </div>
                        </div>
                        <div class="text_process_time">
                            <span class="time_start">0</span>
                            <span class="time_end">{{ duration }}</span>
                        </div>
                    </section>
                    <div class="operatae">
                        <span>转文字</span>
                        <span>下载</span>
                    </div>
                </aside>
            </div>
        </Modal>
        <audio  ref="audio"  src="https://alioss01.leadscloud.com/whatsapp/audio/3AA406BEB9C322B78B19/audio.ogg"></audio>
    </div>
</template>

<script>
    let audio, oDiv, processDom;
    export default {
        name: 'CalldetailDialog',
        data() {
            return {
                showDialog: false,
                duration: 0
            };
        },
        mounted() {
            this.showDialog = true;
        },
        methods: {

            // 播放以及暂停
            play() {
                if (audio.paused) {
                    audio.play();
                } else {
                    audio.pause();
                }
            },
            setCurrentTime(x, width, offset) {
                // x/width 当前点击的位置 占总宽度的百分比
                const currentProcess = x / width;
                const currentTime = currentProcess * audio.duration; // 计算出当前点击位置的时间
                audio.currentTime = currentTime;
            },
            pauseEvent(e) {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();
                e.cancelBubble = true;
                e.returnValue = false;
                return false;
            },
            move() {
                oDiv.onmousedown = (e) => {
                    e = e || window.event;
                    this.pauseEvent(e);
                    const btnEle = oDiv;
                    // 帮助按钮鼠标按下时
                    const defaultX = e.clientX; // 记录鼠标点击的x位置

                    const defaultLeft = btnEle.offsetLeft; // 默认左侧偏移位置

                    // 帮助按钮鼠标移动时
                    document.onmousemove = (me) => {
                        const nowX = me.clientX; // 记录当前移动到的位置

                        const moveX = defaultX - nowX; // 用之前记录的位置-现在位置 得出移动了多少距离

                        const nowLeft = defaultLeft - moveX; // 当前位置左侧偏移量
                        if (nowLeft <= 0) {
                            // 滑块到最左边
                            this.setCurrentTime(oDiv.offsetWidth, processDom.offsetWidth, '0');
                        } else if (nowLeft >= (processDom.offsetWidth - oDiv.offsetWidth)) {
                            // 滑块到最右边
                            this.setCurrentTime(processDom.offsetWidth, processDom.offsetWidth);
                        } else {
                            this.setCurrentTime(nowLeft + oDiv.offsetWidth, processDom.offsetWidth);
                        }
                        // btnEle.style.left = `${nowLeft}px`; // 将当前位置赋值给帮助按钮
                    };

                    // 鼠标抬起时
                    document.onmouseup = () => {
                        // 清除事件
                        document.onmousemove = null;
                        document.onmouseup = null;
                    };
                };
            }
        },
        watch: {
            showDialog(v) {
                this.$nextTick(() => {
                    if (v) {
                        audio = this.$refs.audio;
                        oDiv = this.$refs.dot_process;
                        processDom = this.$refs.process_ref;
                        // audio.onloadstart = function() {
                        //     // duration NaN
                        //     // console.log(audio.duration, audio.currentTime);
                        // };
                        audio.ondurationchange = () => {
                            // audio.currentTime = 5;
                            this.duration = audio.duration;
                            this.setCurrentTime(oDiv.offsetWidth, processDom.offsetWidth, '0');
                        };
                        // 时间更新时候触发
                        audio.ontimeupdate = (e) => {
                            const rate = oDiv.offsetWidth / processDom.offsetWidth * 100; // 圆点占据进度条的比例,百分比
                            const process = Number((audio.currentTime / audio.duration * 100));
                            // console.log(process,rate*100)
                            if (process > rate) {
                                document.querySelector('.process_bar').style.width = `${process}%`;
                            } else {
                                document.querySelector('.process_bar').style.width = `${rate}%`;
                            }
                        };
                        this.move();
                    } else {
                        audio.ondurationchange = null;
                        audio.ontimeupdate = null;
                        audio = '已经被清理';
                        oDiv = '已经被清理';
                        processDom = '已经被清理';
                        
                        this.$EVENTBUS.$emit('openCalldetailIng', false);
                    }
                });
            }
        }
    };
</script>

<style lang="less" scoped>
        .video_mock{
            display: flex;
            align-items: center;
        }
        .process{
            width: 300px;
            height: 6px;
            border-radius: 12px;
            background: #ccc;
            position: relative;
            /* overflow: hidden; */
        }
        section{
            margin-left: 12px;
            margin-right: 12px;
            padding-top:14px ;
        }
        .operatae{
            color: #3b78de;
            font-size: 12px;
            span{
                &:nth-child(1){
                    margin-right: 20px;
                }
            }
        }
        .text_process_time{
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            line-height: 12px;
            margin-top: 4px;
        }
        .process_bar{
            background: #3b78de;
            height: 100%;
            width: 0%;
            position: absolute;
            border-radius: 12px;
            transition: all ;
        }
        .process_dot{
            width:12px;
            height: 200%;
            /* background: #000; */
            border: 1px solid #3b78de;
            background: #fff;
            box-sizing: border-box;
            position: absolute;
            border-radius: 50%;
            top: 50%;
            transform: translateY(-50%);
            z-index: 2;
            right: 0;
            transition: all ;
            cursor: pointer;

        }
</style>
<style lang="less">
.calling_detaild_dialog_3{
    .el-dialog__header{
        padding-bottom: 0;
    }
    .el-dialog__body{
        padding-top: 20px;
    }
}
</style>
