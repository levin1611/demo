<template>
  <Button
    class="sendBtnAiTool"
    type="primary"
    @click="onClick"
    :disabled="disabled"
    icon="custom custom-Vector"
  ></Button>
</template>

<script>
export default {
  name: 'sendButton',
  props: {
    disabled: false,
  },
  methods: {
    onClick() {
      this.$emit('onClick')
    },
  },
}
</script>

<style scoped lang="less">
.sendBtnAiTool {
  padding: 0;
  padding-left: 1px;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  box-shadow: 0px 4px 6px 0px rgba(254, 100, 69, 0.25);
}
</style>
