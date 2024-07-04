<template>
  <div style="display:inline-block">
    <span @click.stop="showModal">
      <slot></slot>
    </span>
    <Modal class="_z-index-most" custom-class="custom_clear_padding custom_bg_color_image" :show-close="false" :visible.sync="visible" :title="$t('authority.fieldPermis.addUser')" fullscreen append-to-body modal-append-to-body :close-on-click-modal="false" :destroy-on-close="false">
      <div slot="title"></div>
      <div :id="viewId">
        <div class="_f _a_c _j_b" style="width:100%;height:40px;">
          <span></span>
          <span @click.stop="closeModal" class="base__icon_config custom custom-modal-close" style="font-size: 16px;color:#ffffff;padding-right:16px;z-index:9999"></span>
        </div>
        <div style="height:100vh;margin-top:-40px;min-height:500px">
          <Carousel class="custom-carousel" :ref="refCarousel" :autoplay="false" indicator-position="none" trigger="click">
            <CarouselItem v-for="(item, index) in imgSteps" :key="index" class="_f _a_c _j_c">
              <img :src="item.url" alt="" height="100%" style="object-fit:fill;min-height:480px">
            </CarouselItem>
          </Carousel>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
    import { Rnum } from '@/utils/dynamicDatas.js';
    /**
     * @tip 使用方式
     * 组件内引用
     * 1）<stepsImage :imgSteps="imgSteps"> 图片数组
            <span class="base__icon_config custom custom-tip" style="font-size: 16px"></span> // 插入指定触发icon；或者通过refs手动触发
          </stepsImage>
       2）src/steps/img-steps 创建mixins 数组
       3）src/images/step-(cn/en)/创建模块内的步骤图片 文件名称规范参照demo-mixins.js
       4) mixins引入
     */
    export default {
        name: 'stepsImageDraw',
        data() {
            return {
                visible: false,
                refCarousel: `menuTourtName_${Rnum()}`,
                viewId: `${Rnum(9)}`
            };
        },
        props: {
            imgSteps: {
                type: Array
            },
            type: {
                type: String
            },
            modeName: String
        },
        mounted() {
            window.addEventListener('keydown', this.arrowCode);
        },
        methods: {
            showModal() {
                this.visible = true;
                if (this.type === 'crmSteps') {
                    if (this.$refs[this.refCarousel]) {
                        this.$refs[this.refCarousel].setActiveItem(0);
                    }
                }
                // this.$nextTick(function() {
                //     this.$dym.fullScreen(document.getElementById(this.viewId));
                // });
            },
            /* CRM相关模块的引导页需要在每次打开引导页时恢复至第一页 */
            closeModal() {
                this.visible = false;
                this.$emit('close', false); // 关闭回调
                // this.$dym.exitFullscreen();
            },
            arrowCode(event) {
                if (this.visible) {
                    if (!this.$refs[this.refCarousel]) return false;
                    const code = event.code;
                    switch (code) {
                        case 'ArrowRight':
                            this.$refs[this.refCarousel].next();
                            break;
                        case 'ArrowLeft':
                            this.$refs[this.refCarousel].prev();
                            break;
                        default:
                            break;
                    }
                }
            }
        },
        beforeDestroy() {
            window.removeEventListener('keydown', this.arrowCode);
        }
    };
</script>
