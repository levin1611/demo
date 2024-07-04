<template>
    <Modal
            v-model="delete_account"
            :title="$t('authority.userManagement.delAcc')"
            :mask-closable="false"
            width="800px"
    >
        <div :style="{maxHeight:height}" style="overflow:auto">
            <div style="font-size:16px;color: rgba(0, 0, 0, 0.8);text-align:left">
                <p style="font-size:16px;color: rgba(0, 0, 0, 0.8);text-align:center">
                    {{$t('authority.userManagement.delAccOK')}}
                </p>
                <span style="font-size:12px;color: rgba(0, 0, 0, 0.8);;font-weight:700"> {{$t('authority.userManagement.delId')}}:</span>
                <span style="color:red"> {{select_delete_id}}</span>
            </div>
            <div style="font-size:16px;color: rgba(0, 0, 0, 0.8);;text-align:center;margin-top:20px;">
                <p>
                    {{$t('authority.userManagement.delAccNO')}}
                </p>
                <Table tooltip :columns="del_title" :loading="del_loading" :data="del_data"
                       style="margin-top:15px;color:#7e7e7e"></Table>
            </div>
            <div style="font-size:16px;color: rgba(0, 0, 0, 0.8);;text-align:center;margin-top:20px;"
                 v-if="delete_account_id.length >0">
                {{$t('authority.userManagement.delAccount')}} <span style="color:red">{{select_delete_id}}</span>?
            </div>
            <div style="font-size:16px;color: rgba(0, 0, 0, 0.8);;text-align:center;margin-top:20px;" v-else>
                {{$t('authority.userManagement.delNO')}}
            </div>
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
        name: 'delete_account',
        props: {
            modal: {
                type: Boolean,
                default: false
            },
            loading: {
                type: Boolean,
                default: false
            },
            delete_account_title: {
                type: Array
            },
            delete_account_id: {
                type: Array
            },
            delete_account_table: {
                type: Array
            },
            height: {
                type: String
            }
        },
        data() {
            return {
                delete_account: false,
                modal_loading: false,
                select_delete_title: '',
                select_delete_id: '',
                orgId: this.$store.state.enterpriseId,
                del_title: [
                    {
                        title: this.$t('authority.userManagement.delId'),
                        key: 'id',
                        width: 150,
                        align: 'center'
                    },
                    {
                        title: this.$t('authority.userManagement.delClue'),
                        key: 'clue',
                        align: 'center'
                    },
                    {
                        title: this.$t('authority.userManagement.delInquiry'),
                        key: 'inq',
                        align: 'center'
                    }
                ],
                del_data: [],
                del_loading: true
            };
        },
        methods: {
            handle_submit(name) {
                this.modal_loading = true;
                const val = this.delete_account_title;
                const arr = [];
                for (let i = 0; i < val.length; i++) {
                    arr.push(val[i].id);
                }
                this.delet_account(arr);
            },
            handle_cancel() {
                this.delete_account = false;
                this.del_data = [];
                this.del_loading = true;
            },
            delet_account(val) {
                util.ajaxJson({
                    url: '/new-privilege/user/delete',
                    method: 'delete',
                    data: {
                        operatorName: Cookies.get('userName'),
                        userIdList: this.delete_account_id,
                        orgId: parseInt(this.orgId)

                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.modal_loading = false;
                        this.$Message.success(this.$t('authority.userManagement.successAccount'));
                        this.delete_account = false;
                        this.del_data = [];
                        this.del_loading = true;
                        this.$emit('set_delete_account', true);
                        this.$emit('changeCurrentServiceOffline', false);
                    } else {
                        this.modal_loading = false;
                        this.$Message.error(response.data.message);
                        this.delete_account = false;
                        this.del_data = [];
                        this.del_loading = true;
                    }
                });
            }
        },

        watch: {
            delete_account(val) {
                this.$emit('change_delete_account', val);
            },
            modal(val) {
                this.delete_account = val;
            },
            loading(val) {
                this.modal_loading = val;
            },
            modal_loading(val) {
                this.$emit('change_delete_loading', val);
            },
            delete_account_title(val) {
                let str = '';
                for (let i = 0; i < val.length; i++) {
                    if (i == 0) {
                        str = str + val[i].name;
                    } else {
                        str = `${str} 、${val[i].name}`;
                    }
                }
                this.select_delete_title = str;
            },
            delete_account_id(val) {
                let str = '';
                if (val.length == 0) {
                    this.select_delete_id = 0;
                } else {
                    for (let i = 0; i < val.length; i++) {
                        if (i == 0) {
                            str = str + val[i];
                        } else {
                            str = `${str} 、${val[i]}`;
                        }
                    }
                    this.select_delete_id = str;
                }
            },
            delete_account_table(val) {
                this.del_data = val.map(item => {
                    const obj = {};
                    obj.id = item.ID;
                    obj.clue = item.clue;
                    obj.inq = item.inquiry;
                    return obj;
                });
                this.del_loading = false;
            }


        }
    };
</script>

<style scoped>

</style>
