<template>
    <div style="position: relative;">
        <Modal :visible="visible"
               :title="$t('crm.Modal.title_viewCloseLog')"
               width="600px"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :append-to-body="true"
               :destroy-on-close="true"
               class="modal">
            <!-- loading -->
            <Spin fix v-if="loading"></Spin>

            <div class="logging" v-for="(log, index) in log_list">
                <span>{{ log.operateUser }}&nbsp;&nbsp;[{{ (new Date(log.operateTime)).format('yyyy-MM-dd hh:mm:ss') }}]&nbsp;{{ $t('crm.Modal.title_closeInquiry') }}</span>
                <Icon :type="log.detail_show ? 'ios-arrow-up' : 'ios-arrow-down'" size="18"
                      @click.native="showDetail(index)" class="detail-show-trigger"></Icon>
                <template v-if="log.detail_show">
                    <br>
                    <br>
                    <Card shadow="hover">
                        <div>
                            {{ $t('crm.Modal.closeReason') }}: {{ log.closeReason }}
                            <br>
                            {{ $t('crm.Modal.details') }}: {{ log.closeReasonDetail }}
                        </div>
                    </Card>
                </template>
            </div>

            <p v-if="log_list.length === 0" style="text-align: center;">{{ $t('crm.Modal.hasNoCloseLog') }}</p>

            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'viewCloseLog',
        props: [
            'visible',
            'inquiryId'
        ],
        data() {
            return {
                loading: false,
                log_list: []
            };
        },
        computed: {
            ...mapState([
                'enterpriseId'
            ])
        },
        methods: {
            get_close_log() {
                util.ajax({
                    url: '/crm/inquiryCloseReason/getList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        inquiryId: this.inquiryId,
                        startDate: '',
                        endDate: ''
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.log_list = res.data.data.map(item => {
                            item.detail_show = false;
                            return item;
                        });
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_getCloseInquiryLog'));
                    }
                });
            },
            cancel() {
                this.$emit('update:visible', false);
            },
            showDetail(index) {
                if (this.log_list[index].detail_show) {
                    this.log_list[index].detail_show = false;
                    return;
                }
                this.log_list.map(item => {
                    item.detail_show = false;
                });
                this.log_list[index].detail_show = true;
            } // 展示详情
        },
        watch: {
            visible(val) {
                this.log_list = [];
                if (val) {
                    this.get_close_log();
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .logging {
        position: relative;
        margin: 20px;
        vertical-align: middle;

        > span {
            display: inline-block;
            padding-right: 40px;
        }

        .detail-show-trigger {
            position: absolute;
            right: 0;
        }
    }
</style>
