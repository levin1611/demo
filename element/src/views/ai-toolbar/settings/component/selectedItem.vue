<template>
  <div class="selected-item">
    <div class="app-name">{{ name }}</div>
    <Button class="btn-delete" type="text" @click="onDelete"
      ><i class="custom custom-trash1"></i
    ></Button>
  </div>
</template>

<script>
export default {
  name: 'selectedItem',
  props: {
    name: String,
    id: Number,
  },
  methods: {
    onDelete() {
      this.$emit('onDelete', this.id)
    },
  },
}
</script>

<style lang="less" scoped>
.selected-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 5px;
  border-radius: 4px;
  margin-right: 18px;
  &:hover {
    cursor: pointer;
    background-color: #f5f7fa;
  }
  .app-name {
    color: #303133;
    margin-left: 5px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .custom-trash1 {
    font-size: 18px;
    vertical-align: baseline;
    color: rgba(144, 146, 153, 1);
    &:hover {
      color: rgb(104, 157, 245);
    }
  }
}
</style>
