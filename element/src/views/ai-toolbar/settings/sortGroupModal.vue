<template>
  <Modal class="sort-group-modal" :visible.sync="visible" :title="$t('aiToolBar.group.sortModalTitle')"
    :append-to-body="true" :modal-append-to-body="false" :close-on-click-modal="false" @close="onClose"
    :destroy-on-close="true" width="800px">

    <div class="sort-group-content">
      <sortTable from="group" :tableData="tableData" v-on="$listeners" :type="type" :stage="stage" />
    </div>

    <div class="footer-btns">
      <Button @click="onClose">{{ $t('aiToolBar.group.close') }}</Button>
    </div>
  </Modal>
</template>

<script>
import sortTable from './component/sortTable.vue'

export default {
  name: 'sortGroupModal',
  components: {
    sortTable,
  },
  props: {
    tableData: [],
    visible: Boolean,

    type: '',
    stage: '',
  },
  data() {
    return {
    }
  },
  methods: {
    onClose() {
      this.$emit('onClose')
    }
  },
}
</script>

<style lang="less" scoped>
.sort-group-modal {
  .sort-group-content {
    height: 519px;
    border-top: 1px solid #EBEEF5;
    overflow-y: auto;
  }

  .footer-btns {
    text-align: right;
    margin-top: 20px;
    margin-bottom: 10px;
  }
}
</style>