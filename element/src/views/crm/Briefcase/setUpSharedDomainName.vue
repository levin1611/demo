<template>
  <div class="share_domain_container">
    <div class="shared_domain_select_container" v-if="!isConfigFinished">
      <span class="shared_domain_content">Cloudshare.</span>
      <Select placeholder="选择域名" :disabled="isDealingConfig" class="shared_domain_select" v-model="selectedDomain">
        <Option v-for="item in sharedDomains" :key="item.websiteUrl" :value="item.websiteUrl">{{item.websiteUrl}}</Option>
      </Select>
    </div>
    <div class="shared_domain_select_container" v-else>
      <span class="shared_domain_content">{{selectedDomain}}</span>
    </div>
    <div class="shared_domain_button_container">
      <div class="shared_domain_before" v-if="!isConfigFinished">
        <Button type="primary" @click="handleSaveConfig" v-if="!isDealingConfig" class="domain_config_save">保存域名配置</Button>
        <Button type="primary" v-if="isDealingConfig">处理中...</Button>
        <Tooltip :max-width="300" placement="right" :content="contentTip">
          <Icon custom="custom-tip" size="16" style="margin-left: 10px"></Icon>
        </Tooltip>
      </div>
      <div class="shared_domain_after" v-else>
        <span class="p-1">域名配置完成，24小时后生效，请到系统设置 >聊天界面设置查看</span>
        <span class="p-2">提示：请完成{{selectedDomain}} CNAME 指向：cloudshare.leadscloud.com</span>
        <span class="p-3" style="margin-bottom:30px">申请域名{{selectedDomain}}证书 并请及时发SSL证书邮件给到商务感谢您的配合。</span>
        <span>
          <comSSL :websitDomain="selectedDomain || ''" :bindSslStatus="bindSslStatus" :stores="stores" @success="getAllDomains">
            <span class="base__icon_config custom custom-tip" style="font-size: 14px;color:#4285F4;"><span style="font-size:13px;padding-left:5px">域名解析及SSL证书</span></span>
          </comSSL>
        </span>
      </div>
    </div>
    <div class="shared_domain_modal_container">
      <!-- 当选择的域名为空时 弹窗 -->
      <Modal title="系统提示" :visible.sync="isDomainEmpty" width="520px" :modal="false">
        <span>请选择域名</span>
        <div slot="footer">
          <Button @click="isDomainEmpty = false" type="primary">{{ $t('crm.UniSet.modal_ok') }}</Button>
        </div>
      </Modal>
      <!--  通过校验后的弹窗  -->
      <Modal title="系统提示" :visible.sync="visible_dealing" width="520px" :modal="false">
        <span>域名配置系统处理中，请稍后查看状态</span>
        <div slot="footer">
          <Button type="primary" @click="visible_dealing=false">{{ $t('crm.UniSet.modal_ok') }}</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import comSSL from './Components/set-domain-name-ssl';
    export default {
        name: 'setUpSharedDomainName',
        data() {
            return {
                stores: {},
                contentTip: this.$t('BriefCase.saveDomainTip'),
                sharedDomains: [], // 拉取的域名
                bindSslStatus: true,
                selectedDomain: '',
                clearInterval: null,
                // 控制弹窗的变量
                isDomainEmpty: false, // 域名是否为空
                isDealingConfig: false, // 是否在处理中
                visible_dealing: false, // 控制是否显示处理中弹窗
                isConfigFinished: false // 控制是否显示处理成功的文字
            };
        },
        computed: {
            ...mapState([
                'userId',
                'enterpriseId',
                'userName',
                'fullName'
            ])
        },
        methods: {
            handleSaveConfig() {
                if (this.selectedDomain === '') {
                    this.isDomainEmpty = true;
                    return;
                }
                // 调用域名配置处理接口
                util.ajax233({
                    url: '/domain/saveShareDomain',
                    method: 'post',
                    data: {
                        createUser: this.fullName,
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        websiteUrl: this.selectedDomain
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // 开始轮询状态
                        this.isDealingConfig = true;
                        this.visible_dealing = true;
                        this.clearInterval = setInterval(() => {
                            if (this.isConfigFinished) {
                                window.clearInterval(this.clearInterval);
                                this.clearInterval = null;
                                return;
                            }
                            this.getAllDomains();
                        }, 3000);
                    } else if (response.data.code === '2') {
                        this.$Message.warning('当前域名已被占用，请重试');
                    }
                });
            },
            // 获取所有的shareDomain
            getAllDomains() {
                util.ajax233({
                    url: '/domain/checkShareDomain',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.sharedDomains = res.data.data;
                        this.bindSslStatus = null;
                    } else if (res.data.code === '2') {
                        const status = res.data.data.status;
                        this.bindSslStatus = res.data.data.bindSslStatus === 1;
                        this.stores = res.data.data || {};
                        if (status === 1) {
                            this.isConfigFinished = true;
                            this.selectedDomain = res.data.data.websiteUrl;
                            // 停止轮询
                        } else if (status === 0) {
                            // 轮询查询状态
                            this.bindSslStatus = null;
                        }
                        // 当code === '2'的时候 表示正在处理中 此时置灰 并显示
                        // 判断status 是否为 '1' 为 ’1‘ 表示处理成功 否则继续轮询
                    }
                });
            }
        },
        beforeDestroy() {
            if (this.clearInterval) {
                clearInterval(this.clearInterval);
                this.clearInterval = null;
            }
        },
        created() {
            this.getAllDomains();
        },
        components: { comSSL }
    };
</script>

<style scoped lang="less">
.share_domain_container {
  .shared_domain_select_container {
    margin-top: 32px;
    margin-left: 50px;
    .shared_domain_content {
      font-family: PingFangSC-Regular;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.8);
      letter-spacing: 0;
      display: inline-block;
      margin-right: 19px;
    }
    .shared_domain_select {
      width: 300px;
      height: 34px;
    }
  }
  .shared_domain_button_container {
    margin-left: 50px;
    margin-top: 40px;
    .shared_domain_after {
      .p-1 {
        display: block;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.8);
        letter-spacing: 0;
        margin-bottom: 8px;
      }
      .p-2 {
        display: block;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
        letter-spacing: 0;
      }
      .p-3 {
        display: block;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
        letter-spacing: 0;
        margin-left: 36px;
      }
    }
  }
}
</style>
