<template>
  <Modal
    :visible.sync="visible_modal"
    :append-to-body="true"
    v-loading="loading"
    v-bind="$attrs"
    @close="handleCancel"
    class="GPTCommonModal vertical-center-modal tipModal"
  >
    <slot>
      <p>{{ tipContent }}</p>
    </slot>

    <div v-if="footerBtns.length" slot="footer">
      <Button v-if="footerBtns.includes('cancel')" @click="handleCancel">{{
        $t('cancel')
      }}</Button>
      <Button
        v-if="footerBtns.includes('confirm')"
        type="primary"
        @click="handleConfirm"
        >{{ confirmBtnText || $t('confirm') }}</Button
      >
    </div>
  </Modal>
</template>

<script>
export default {
  name: 'tipModal',
  inheritAttrs: false,
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    tipContent: {
      type: String,
      default: '',
    },
    footerBtns: {
      type: Array,
      default() {
        return ['confirm', 'cancel']
      },
    },
    confirmBtnText: {
      type: String,
    },
  },
  data() {
    return {
      /* 全局 */
      loading: false,
      visible_modal: false,
    }
  },
  methods: {
    // footer
    handleConfirm() {
      this.$emit('confirm')
    },
    handleCancel() {
      this.$emit('cancel')
    },
  },
  watch: {
    visible(val) {
      this.visible_modal = val
    },
  },
}
</script>

<style lang="less">
.tipModal {
  z-index: 3401 !important;
  .el-dialog {
    max-height: 600px;
    display: flex;
    flex-direction: column;

    .el-dialog__body {
      flex: 1;
      margin: 20px 0 9px;
      overflow-y: auto;
    }
  }
}

.tipModal + .v-modal {
  z-index: 3399 !important;
}
</style>
