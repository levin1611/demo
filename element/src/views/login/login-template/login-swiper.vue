<template>
    <div class="swiper-container" @mouseenter="enterSwiper" @mouseleave="leaveSwiper">
        <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="(item,index) in swiper_img" :key="index">
                <!-- <a :href="item.href"> -->
                    <img :src="item.img" alt="" draggable="false">
                    <!-- <img src="../../../assets/images/swiper1.png" alt=""> -->
                <!-- </a> -->
            </div>
        </div>
        <!--分页器。如果放置在swiper-container外面，需要自定义样式。-->
        <!-- 放一张轮播图时,取消分页器 -->
        <!-- <div class="swiper-pagination"></div> -->
    </div>
</template>
<script>
    import Swiper from 'swiper';
    import '../../../../node_modules/swiper/css/swiper.min.css';
    export default {
        name: 'login-swiper',
        data() {
            return {
                Swiper: null,
                swiper_img: [
                    {
                        img: require('../../../assets/images/swiper3.png'),
                        href: 'javascript:;'
                    }
                ]
            };
        },
        mounted() {
            // new的话会报eslint错误,不new用不了轮播图
            // eslint-disable-next-line no-new
            this.Swiper = new Swiper('.swiper-container', {
                // 分页器
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true
                },
                // 自动轮播
                autoplay: true,
                // 播放速度
                speed: 1000,
                // 允许触摸滑动
                allowTouchMove: false,
                // 连续播放 在第三张播放到第一张时,点击第二个分页器,会向左跳转,感觉像是有4张图片
                // loop: true,
                // 轮播图点击事件
                on: {
                    click: function() {
                        console.log('你点了Swiper');
                    }
                }
            });
        },
        beforeDestroy() {
            this.Swiper.destroy();
            this.Swiper = null;
        },
        methods: {
            // 移入轮播图停止播放
            enterSwiper() {
                // console.log('enter');
                this.Swiper.autoplay.stop();
            },
            // 移出轮播图继续播放
            leaveSwiper() {
                // console.log('leave');
                this.Swiper.autoplay.start();
            }
        }
    };
</script>
<style lang="less" scoped>
    .swiper-container {
        border-radius: 0 5px 5px 0;
        /* overflow: hidden; */
        height: 100%;
        --swiper-theme-color: #ffffff;  /* 分页器自带的颜色 */
        --swiper-pagination-color: #FA8241; /* 分页器的active的颜色 */
        /* 分页器自带的颜色 */
        // .swiper-pagination-bullet {
        //     background-color: #c4c4d4 !important;
        // }
        .swiper-slide {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
    }
    .swiper-wrapper img {
        width: 519px;
        // height: 100%;
    }
</style>
