<template>
  <Modal
    :visible.sync="visible_modal"
    :title="$t('aiToolBar.frontAi.deleteConfirm')"
    :append-to-body="true"
    :modal-append-to-body="false"
    :close-on-click-modal="false"
    :mask-closable="false"
    width="500px"
    class="GPTCommonModal"
  >
    <div
      style="
        margin: 20px 0 40px;
        color: #333;
        font-size: 14px;
        line-height: 22px;
      "
    >
      {{ $t('aiToolBar.frontAi.tip_deleteFolder') }}
    </div>

    <div slot="footer">
      <Button @click="handle_cancel">{{ $t('aiToolBar.cancel') }}</Button>
      <Button type="primary" :loading="loading" @click="handle_confirm">{{
        $t('aiToolBar.confirm')
      }}</Button>
    </div>
  </Modal>
</template>

<script>
import { deleteFolder } from '../../api/aiApi'

export default {
  name: 'deleteFolder',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    folderData: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      visible_modal: false,
      loading: false,
      enterpriseId: 'enterpriseId',
      userId: 'userId',
    }
  },
  methods: {
    handle_confirm() {
      this.loading = true
      deleteFolder({
        orgId: this.enterpriseId,
        userId: this.userId,
        folderId: this.folderData.id,
      })
        .then((res) => {
          if (res.code === 1) {
            this.$Message.success(this.$t('aiToolBar.settings.deleteSuccess'))
            this.$emit('deleteSuccess')
          } else {
            switch (res.code) {
              case 1015:
                this.$Message.error(
                  this.$t('aiToolBar.frontAi.error_fileDeleted')
                )
                break
              default:
                this.$Message.error(this.$t('aiToolBar.settings.deleteFailed'))
                break
            }
          }
          this.loading = false
          this.visible_modal = false
        })
        .catch((err) => {
          console.error(err)
          this.loading = false
          this.visible_modal = false
        })
    },
    handle_cancel() {
      this.visible_modal = false
    },
  },
  watch: {
    visible_modal(val) {
      this.$emit('update:visible', val)
    },
    visible(val) {
      this.visible_modal = val
    },
  },
}
</script>
