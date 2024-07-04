<template>
  <div>
    <Modal :title="$t('clue.qrcode')" :visible="visible" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" :modal-append-to-body="false">
      <Spin v-show="loading" fix size="large"></Spin>
      <div class="qrcode-main">
        <div class="qrcode-title">{{$t('clue.scan')}}</div>
        <div class="qrcode" ref="qrcode"></div>
      </div>
      <div slot="footer">
        <Button class="piwik_qrcode cancle-qr-code" @click="close">
          {{ $t('crm.Modal.modal_close') }}
        </Button>
      </div>
    </Modal>
  </div>
</template>

<script>
    import { mapState } from 'vuex';
    import QRCode from 'qrcodejs2';
    import { crmClue } from '@/api/crm';

    export default {
        name: 'qrCode',
        props: [
            'visible',
            'id',
            'type'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'})
        },
        data() {
            return {
                loading: true,
                qrcode: null
            };
        },
        methods: {
            /* 获取二维码所需信息 */
            getQRCodeInfo() {
                this.loading = true;
                const data = {
                    id: this.id,
                    userId: this.userId,
                    orgId: this.enterpriseId
                };
                crmClue.getQRCodeInfoByPrivilege(this.type, data).then(res => {
                    if (res.code === '1') {
                        this.showCode(res.data);
                    } else {
                        this.$Message.error(this.$t('clue.error_getContactInfo'));
                    }
                    this.loading = false;
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('clue.error_getContactInfo'));
                    }
                    this.loading = false;
                });
            },
            /* 生成展示二维码 */
            showCode(data) {
                const qrNode = this.$refs.qrcode;
                qrNode.innerHTML = '';
                const card = `BEGIN:VCARD\nVERSION:4.0${data.name ? `\nFN:${data.name}` : ''}${data.phone ? `\nTEL;TYPE=voice;VALUE=uri:${data.phone}` : ''}${data.whatsapp ? `\nTEL;TYPE=cell,voice;VALUE=uri:${data.whatsapp}` : ''}${data.email ? `\nEMAIL:${data.email}` : ''}\nEND:VCARD`;
                try {
                    this.qrcode = new QRCode(qrNode, {
                        text: card,
                        width: 256,
                        height: 256,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.H
                    });
                } catch (e) {
                    try {
                        qrNode.innerHTML = '';
                        this.qrcode = new QRCode(qrNode, {
                            text: card,
                            width: 256,
                            height: 256,
                            colorDark: '#000000',
                            colorLight: '#ffffff',
                            correctLevel: QRCode.CorrectLevel.Q
                        });
                    } catch (e) {
                        alert(`${e.name}: ${e.message}`);
                    }
                }
            },
            // 关闭二维码模态框
            close() {
                this.$emit('update:visible', false);
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.getQRCodeInfo();
                }
            }
        }
    };
</script>

<style scoped lang="less">
/* 二维码 */
.qrcode-title {
  text-align: center;
  font-size: 16px;
  margin-bottom: 18px;
}

.qrcode-main {
  text-align: center;
}

.qrcode {
  display: flex;
  justify-content: space-around;
  margin-bottom: 18px;
}
</style>
