<template>
  <div style="display:inline-block">
    <div style="display:inline-block" @click.stop="showModal">
      <slot></slot>
    </div>
    <Modal :visible.sync="visible" :append-to-body="true" :modal-append-to-body="false" :close-on-click-modal="false" width="740px" @close="closeModal" :destroy-on-close="false">
      <div slot="title" class="_f _a_c"><span style="font-size:18px;font-weight:600;color:rgba(0,0,0,0.8)">域名解析及SSL证书</span><span @click="open" class="base__icon_config custom custom-tip" style="font-size: 16px;margin-left:5px"></span></div>
      <div style="width:100%;color:rgba(0,0,0,0.8);height:360px">
        <div style="font-size:12px">域名配置好了，完成域名解析就可以创建智能物料啦！</div>
        <div>
          <div class="ssl_title">第一步：请完成以下域名解析</div>
          <div class="_f _a_c _j_b">
            <ElInput v-model="websitDomain" type="text" readonly size="mediu" style="width:300px"></ElInput>
            <span style="font-size:12px">CNAME</span>
            <ElInput v-model="webLast" type="text" readonly size="mediu" style="width:300px"></ElInput>
          </div>
        </div>
        <div>
          <div class="ssl_title">第二步：系统自动完成SSL证书申请和安装
            <Tooltip :content="btnToolTip" placement="right">
              <span  class="base__icon_config custom custom-tip" style="font-size: 16px;margin-left:5px"></span>
            </Tooltip>
          </div>
          <div class="_f _a_c _j_b">
            <ElInput v-model="websitDomain" type="text" readonly size="mediu" style="width:300px"></ElInput>
          </div>
        </div>
        <div class="_f _a_c" style="margin-top:20px">
          <span class="custom custom-warning" style="font-size:20px;color:#FBBC04"></span>
          <span style="margin-left:10px;font-size:12px">确认使用此域名发布智能物料，点击申请SSL证书。</span>
        </div>
      </div>

      <div slot="footer">
          <Button class="piwik_bind_SSL" type="primary" v-loading="loading" v-if="!bindSslStatus" @click.stop="submit">申请SSL证书</Button>
          <div v-else>
            <Tooltip content="已申请SSL证书，可尝试访问智能物料是否生效。" placement="right">
              <span class="ssl_btn"  >已申请</span>
            </Tooltip>
          </div>
      </div>
    </Modal>
  </div>
</template>

<script>
    import { submitSSLdomain } from '@/api/reusableApi/common';

    export default {
        name: 'setDomainNameSSL',
        props: {
            bindSslStatus: {
                type: Boolean || null
            },
            websitDomain: String,
            stores: Object
        },
        computed: {
            btnToolTip() {
                return '我们使用的是 Let\'sEncrypt 的 HTTPS和SSL - 这是完全免费的。我们会自动为你处理所有事情，从安装到续订。';
            }
        },
        data() {
            return {
                visible: false,
                webLast: 'cloudshare.leadscloud.com',
                loading: false
            };
        },
        components: {},
        methods: {
            open() {
                window.open(
                    'https://www.yuque.com/help.leadscloud/faq_guide/tl7f9d9k4tgqyesw',
                    '_blank'
                );
            },
            showModal() {
                if (this.bindSslStatus === null) return false;
                this.visible = true;
            },
            closeModal() {
                this.visible = false;
            },
            async submit() {
                this.loading = true;
                const data = await submitSSLdomain({
                    id: this.stores.id
                });
                if (data.code === '1') {
                    this.$emit('success');
                    this.closeModal();
                } else {
                    const status = data.code;
                    this.$Message.error(this.$t(`errorCode.${status}`));
                    this.$emit('success');
                    this.closeModal();
                }
                this.loading = false;
            }
        },
        created() {},
        mounted() {},
        beforeDestory() {}
    };
</script>

<style lang="scss" scoped>
.ssl_title {
  font-weight: 600;
  margin: 20px 0;
  font-size: 14px;
}
.ssl_btn {
  background-color: #E7ECF2;
  font-size: 14px;
  color: #B6C1CF;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: no-drop;
}
</style>
