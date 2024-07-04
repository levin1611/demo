<template>
    <Modal :visible.sync="delete_modal"
           :title="$t('authority.userManagement.delDepar')"
           :append-to-body="true"
           :modal-append-to-body="false"
           :close-on-click-modal="false"
           width="520px">
        <div style="font-size:16px;color:#333;text-align:center;height:100px;line-height:100px;">
            {{ $t('authority.fieldPermis.delUserSure') }}
            <span style="color:red">{{ select_delete_title }}</span>?
        </div>
        <div slot="footer">
            <Button @click="handle_cancel">{{ $t('cancel') }}</Button>
            <Button type="primary"
                    @click="handle_submit('updata_form')"
                    :loading="modal_loading">{{ $t('confirm') }}</Button>
        </div>
    </Modal>
</template>

<script>
    export default {
        name: 'delete_modal',
        props: {
            modal: {
                type: Boolean,
                default: false
            },
            loading: {
                type: Boolean,
                default: false
            },
            delete_title: {
                type: Object
            }
        },
        data() {
            return {
                delete_modal: false,
                modal_loading: false,
                select_delete_title: ''
            };
        },
        methods: {
            handle_submit(name) {
                this.modal_loading = true;
                this.$emit('set_remove', this.delete_title);
            },
            handle_cancel() {
                this.delete_modal = false;
            }

        },

        watch: {
            delete_modal(val) {
                this.$emit('change_delete_modal', val);
            },
            modal(val) {
                this.delete_modal = val;
            },
            loading(val) {
                this.modal_loading = val;
            },
            modal_loading(val) {
                this.$emit('change_delete_loading', val);
            },
            delete_title(val) {
                this.select_delete_title = val.title;
            }
        }
    };
</script>
