<template>
  <div class="template-modal">
    <!-- 全屏预览 -->

            <!-- :close-on-click-modal="false"
            fullscreen
            center
            custom-class="preview-page"
            @closed="type_preview = 'phone'"> -->
      <!-- footer-hide -->
      <!-- :mask-closable="false"
      :transfer="false" -->
    <Modal
      :visible.sync="visible_preview"
      :modal-append-to-body="false"
      fullscreen
      :show-close="false"
      class="preview-page"
    >
      <!-- 顶部导航 -->
      <div class="preview-page-header" slot="title">
        <!-- 尺寸选择 -->
         <!-- @on-click="chooseTypePreview" -->
        <Tabs v-model="type_preview">
          <TabPane name="phone">
              <span slot="label">
                    <br>
                    <i class="custom custom-automatic-iphone" style="font-size: 44px;padding-left: 10px"></i>
                    <br>
                    <span>{{$t('administerAMP.templateModal.phoneScreenText')}}</span>
                </span>
          </TabPane>
<!--          <TabPane name="horizonPhone">-->
<!--            <span slot="label">-->
<!--                <span class="rotate-horizon">-->
<!--                    <i class="custom custom-automatic-iphone" style="font-size: 44px;transform:rotate(270deg);"></i>-->
<!--                </span>-->
<!--                <br>-->
<!--                <span>Phone横屏</span>-->
<!--            </span>-->
<!--          </TabPane>-->
          <TabPane name="pad">
              <span slot="label">
                <i class="custom custom-automatic-iPad" style="font-size: 40px;padding-left: 5px"></i>
                <br>
                <span>{{$t('administerAMP.templateModal.padScreenText')}}</span>
            </span>
          </TabPane>
<!--          <TabPane name="horizonPad">-->
<!--            <span slot="label">-->
<!--                    <span class="rotate-horizon">-->
<!--                        <i class="custom custom-automatic-iPad" style="font-size: 40px;transform:rotate(270deg)"></i>-->
<!--                    </span>-->
<!--                    <br>-->
<!--                    <span>Pad横屏</span>-->
<!--                </span>-->
<!--          </TabPane>-->
          <TabPane name="pc">
                <span slot="label">
                    <i class="custom custom-automatic-desktop" style="font-size: 40px;padding-left: 5px"></i>
                    <br>
                    <span>{{$t('administerAMP.templateModal.pcScreenText')}}</span>
                </span>
          </TabPane>
        </Tabs>
        <!-- 关闭按钮 -->
        <div class="preview-page-header-close">
          <Icon
            type="md-close-circle"
            size="32"
            color="#A9B9C9"
            @click="$store.state.isShowFullTemplateModal = false;type_preview = $t('administerAMP.templateModal.phoneText')"
          />
        </div>
      </div>

      <!-- 预览 -->
      <SitePage
        :width="size_preview[type_preview].width"
        :height="size_preview[type_preview].height"
        :marginTop="size_preview[type_preview].marginTop"
        :noBorder="type_preview === $t('administerAMP.templateModal.pcText')"
      ></SitePage>
    </Modal>
  </div>
</template>

<script>
    import SitePage from './SitePage';
    import { mapState } from 'vuex';
    export default {
        name: 'templateModal',
        components: {
            SitePage
        },
        computed: {
            ...mapState({
                visible_preview: state => state.isShowFullTemplateModal
            })
        },
        data() {
            return {
                /* 点击按钮多设备预览 */
                type_preview: this.$t('administerAMP.templateModal.phoneText'),
                size_preview: {
                    phone: {
                        width: '350px',
                        height: '640px',
                        marginTop: '20px'
                    },
                    horizonPhone: {
                        width: '640px',
                        height: '350px',
                        marginTop: '80px'
                    },
                    pad: {
                        width: '470px',
                        height: '620px',
                        marginTop: '20px'
                    },
                    horizonPad: {
                        width: '620px',
                        height: '470px',
                        marginTop: '80px'
                    },
                    pc: {
                        width: '100vw',
                        height: 'calc(100vh - 103px)',
                        marginTop: '0'
                    }
                }
            };
        },
        methods: {
            // chooseTypePreview(name) {
            //     this.type_preview = name;
            // }
        }
    };
</script>

<style lang="less" scoped>
.preview-page {
    /deep/ .el-dialog__body {
        padding: 0;
    }
    /deep/ .el-dialog__header {
        padding: 0;
    }
    /deep/ .el-dialog {
        background: transparent;
    }
    /deep/ .el-tabs {
        margin: 0 auto;
    }
    /deep/ .el-tabs__nav-wrap:after {
        height: 0;
    }
    /deep/ .el-tabs__active-bar {
        height: 0;
    }
    /deep/ .el-tabs__item {
        padding: 0 40px;
        /*line-height: 0;*/
        line-height: 30px;
    }
    // /deep/ .el-tabs-nav .el-tabs-tab {
    //     padding: 8px 40px;
    //     .ivu-icon {
    //     width: 100%;
    //     height: 100%;
    //     }
    // }
    // /deep/ .ivu-tabs-nav .ivu-tabs-tab-active {
    //     font-weight: normal;
    //     // color: #fa8241
    // }
    // /deep/ .ivu-modal-fullscreen .ivu-modal-body {
    //     position: static;
    // }
  .preview-page-header {
    padding: 0 35px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    height: 100px;
      .el-tabs--top {
          padding-left: 90px;
      }
  }

  .preview-page-header-close {
    cursor: pointer;
    width: 50px;
    height: 50px;
  }
}
</style>
