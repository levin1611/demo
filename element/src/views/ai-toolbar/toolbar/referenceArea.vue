<template>
  <transition name="referenceArea">
    <div
      class="referenceArea"
      :style="refPosition"
      v-if="visible"
      key="reference-area"
    >
      <div class="item-area">
        <referenceItem
          v-for="item in referenceChunks"
          :key="item.fileId"
          :item="item"
          v-on="$listeners"
        ></referenceItem>
      </div>
      <i class="close-btn el-icon-error" @click="onClickClose"></i>
    </div>
  </transition>
</template>

<script>
import referenceItem from './component/referenceItem.vue'

export default {
  name: 'referenceArea',
  components: {
    referenceItem,
  },
  data() {
    return {}
  },
  methods: {
    onClickClose() {
      this.$emit('onCloseReference')
    },
  },
  props: {
    visible: false,
    refPosition: {},
    referenceChunks: [],
  },
  computed: {},
  watch: {},
}
</script>

<style lang="less">
.referenceArea {
  position: absolute;
  width: 420px;
  max-height: 520px;
  overflow-y: visible;

  background: rgba(255, 255, 255, 1);
  border-radius: 10px;
  box-shadow: 0px 2px 10px 0px rgba(217, 220, 232, 1);

  padding: 0 20px;

  .item-area {
    max-height: 520px;
    width: 100%;
    overflow-y: scroll;
  }
  .close-btn {
    font-size: 20px;
    position: absolute;
    top: -8px;
    right: -8px;
    cursor: pointer;
    color: rgba(153, 153, 153, 1);
    &:hover {
      color: rgba(121, 127, 140, 1);
    }
  }
}
/*过渡效果*/
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.referenceArea-enter-active {
  animation: fadeIn 0.2s;
}
.referenceArea-leave-active {
  transition: opacity 0.1s linear;
  opacity: 0;
}
</style>
