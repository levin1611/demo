<template>
  <div class="stopButton">
    <div class="btn-stop" @click="onClick">
      <Icon custom="custom custom-stop-circle" /> {{ $t('aiToolBar.stop') }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'stopButton',
  methods: {
    onClick() {
      this.$emit('onClickStop')
    },
  },
}
</script>

<style scoped lang="less">
.stopButton {
  position: absolute;
  bottom: 8px;
  right: 5px;
  .btn-stop {
    display: flex;
    align-items: center;
    margin-top: -25px;
    color: rgba(102, 102, 102, 1);
    font-size: 14px;
    cursor: pointer;
    &:hover {
      color: rgba(66, 133, 242, 1);
    }
    i {
      margin-right: 5px;
      font-size: 20px;
    }
  }
}
</style>
