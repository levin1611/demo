<template>
  <div class="subDropDown">
    <div class="sub-drop-down">
      <div class="sub-dropdown-item" v-for="item in selectScenario.promptTask" :key="item" @click="onClickItem(item)">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'subDropDown',
  props: {
    selectScenario: {
      promptTask: [],
    },
  },
  methods: {
    onClickItem(item) {
      const params = {
        [this.selectScenario.prompt]: [
          {
            name: this.selectScenario.taskName,
            value: item,
          },
        ],
      }
      this.$emit('onClickSubDopDown', params)
    },
  },
}
</script>

<style lang="less">
.subDropDown {
  .sub-drop-down {
    width: 200px;
    // width: max-content;
    padding: 0;
    background-color: #fff;
    border: 1px solid rgba(227, 231, 237, 1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    max-height: 200px;
    overflow-y: auto;

    .sub-dropdown-item {
      padding: 5px 8px;
      font-size: 14px;
      color: #303133;
      cursor: pointer;

      &:hover {
        background-color: rgba(245, 247, 250, 1);
      }
    }
  }
}
</style>
