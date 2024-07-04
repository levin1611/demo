<template>
    <Modal
            :visible.sync="delete_modal"
            :title="$t('portal_set.delete_content')"
            :close-on-click-modal="false"
            :modal-append-to-body="false"
            class="delete_modal_verbal"
    >
        <div style="font-size:16px;color:#333;text-align:center;height:50px;line-height:50px;">
            {{$t('portal_set.del_group_tip1')}}
            <span style="color:red">{{select_delete_title}}</span>
            {{$t('portal_set.del_group_tip2')}}
            <span style="color:red">{{select_delete_count}}</span>
            {{$t('portal_set.del_group_tip3')}}
        </div>
        <div slot="footer">
            <Button  @click="handle_cancel">{{$t('cancel')}}</Button>
            <Button type="primary" @click="handle_submit('updata_form')" :loading="modal_loading">{{$t('confirm')}}
            </Button>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import Cookies from 'js-cookie';

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
                select_delete_title: '',
                select_delete_count: ''
            };
        },
        methods: {
            handle_submit(name) {
                this.modal_loading = true;
                console.log('1', this.delete_title);
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
                console.log(val.title.toString().length);
                if (val.title.toString().length > 10) {
                    this.select_delete_title = `${val.title.toString().slice(0, 10)}..`;
                } else {
                    this.select_delete_title = val.title;
                }
                this.select_delete_count = val.count;
            }
        }
    };
</script>

<style scoped lang="less">
    .delete_modal_verbal /deep/ .ivu-modal-wrap .ivu-modal {
        width: 590px !important;
    }
</style>
