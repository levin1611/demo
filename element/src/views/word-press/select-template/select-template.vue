<template>
  <div style="background: #F5F6F9; height: calc(100vh - 64px);"  class="select-template">
    <!-- 顶部导航 -->
    <div class="nav-container">
      <!-- Tab -->
      <div>
        <Tabs value="all">
          <TabPane :label="$t('administerAMP.selectTemplate.allTemplate')" name="all"></TabPane>
        </Tabs>
      </div>

      <!-- 右侧步骤提示 -->
      <div class="tip">
        <span>{{$t('administerAMP.selectTemplate.processText')}}</span>
        <span class="step-seq">1</span>{{$t('administerAMP.selectTemplate.selectTemplateText')}}
        <span class="step-seq">2</span>{{$t('administerAMP.selectTemplate.editText')}}
        <span class="step-seq">3</span>{{$t('administerAMP.selectTemplate.saveText')}}
      </div>

      <!-- 返回网站列表页按钮 -->
<!--      <div class="backBtn">-->
<!--        <Button type="primary" plain @click="backtoMyWebsite">返回</Button>-->
<!--      </div>-->
    </div>

    <!-- 内容页 -->
    <div
      class="content-container"
      style="overflow-y: auto; height: calc(100vh - 114px); padding-bottom: 20px"
      v-loading="loading"
    >
      <div
        v-if="templates.length === 0"
        style="font-size: 14px;text-align: center;margin-top: 300px;"
      >
        <!-- 暂无数据 -->
        {{$t('crm.Table.noData')}}
      </div>
      <div
        v-for="(template, index) in templates"
        class="template-card"
        :key="index"
      >
        <div class="template-card-img">
          <img :src="url1 + template.cover" alt="" />
          <div class="template-card-cover">
            <div class="template-qrcode-container">
              <div class="template-qrcode">
                <div class="qrcode" ref="qrcode"></div>
              </div>
              <span class="template-qrcode-tip">{{$t('administerAMP.selectTemplate.scanText')}}</span>
            </div>
            <div class="template-operate-button">
              <Button @click="previewTemplate(template.path)" class="template-preview">{{$t('administerAMP.selectTemplate.previewText')}}</Button>
              <!--            <Button v-if="template.id === '1' || template.id === '2' || template.id === '3'" @click="visible_forbid=true;templateId = template.id;">创建</Button>-->
              <Button
                      @click="
                templateId = template.id;
                visible_createSite = true;
                data_createSite.siteName = '';
              "
                      class="template-create"
              >{{$t('administerAMP.selectTemplate.creatText')}}</Button
              >
            </div>
          </div>
        </div>
          <div style="text-align: center">
            <span>{{template.template_name}}</span>
          </div>
          <div style="text-align: center" class="download_link">
            <a :href="`https://${template.download_link}`">{{$t('administerAMP.selectTemplate.listText')}}</a>
          </div>
      </div>

    </div>

    <!-- 模态框 -->
    <!-- 创建网站 -->
    <Modal
      :visible.sync="visible_createSite"
      :modal-append-to-body="false"
      :title="$t('administerAMP.selectTemplate.creatPageText')"
      width="522px"
      :styles="{ top: '300px' }"
      @close="cancel_createSite"
    >
      <Form
        :model="data_createSite"
        :rules="rules_createSite"
        ref="createSite"
        label-position="left"
        label-width="80"
        class="createSite-form"
      >
        <FormItem label="" prop="webName" >
          <span style="margin-right: 20px"><i style="color: #f56c6c; font-style: normal; vertical-align: middle; display: inline-block; margin-right: 5px">*</i>{{$t('administerAMP.selectTemplate.pageNameText')}}</span>
          <Input
          @keydown.enter.native.prevent="ok_createSite"
            v-model="data_createSite.siteName"
            style="width: 300px;"
            :placeholder="$t('administerAMP.selectTemplate.pageLengthText')"
          />
        </FormItem>
      </Form>

      <span slot="footer">
        <Button type="primary" @click="ok_createSite()" :loading="createSiteLoading" class="site-create-confirm">{{ confirmCreateBtnText }}</Button>
    </span>
    </Modal>
    <Modal :visible.sync="visible_forbid"
           :modal-append-to-body="false"
           :title="$t('administerAMP.selectTemplate.systemText')"
           width="522px"
           :styles="{ top: '300px' }">
      <span v-if="templateId === '1'">{{$t('administerAMP.selectTemplate.fourText')}}</span>
      <span v-if="templateId === '2'">{{$t('administerAMP.selectTemplate.fiveText')}}</span>
      <span v-if="templateId === '3'">{{$t('administerAMP.selectTemplate.sixText')}}</span>
    </Modal>
  </div>
</template>

<script>
    import util from '@/libs/util';
    import QRCode from 'qrcodejs2';
    export default {
        name: 'select_template',
        props: [
            'openTemplate'
        ],
        data() {
            return {
                loading: true,
                createSiteLoading: false,
                confirmCreateBtnText: this.$t('administerAMP.selectTemplate.define'),
                /* 模板列表 */
                templates: [],

                /* 模板信息 */
                templateId: '',

                /* 模态框 */
                /* 创建网站 */
                visible_createSite: false,
                visible_forbid: false,
                data_createSite: {
                    siteName: ''
                },
                rules_createSite: {
                    webName: [
                        // {
                        //     required: true,
                        //     message: '网站名称不能为空',
                        //     trigger: 'blur'
                        // },
                        { validator: this.validateWebName, trigger: 'blur' }
                    ]
                },
                url: util.AutomaticSiteUrl,
                url1: util.AutomaticSiteDomainUrl
            };
        },
        methods: {
            //
            validateWebName(rule, value, callback) {
                if (String(this.data_createSite.siteName).trim() === '') {
                    callback(new Error(this.$t('administerAMP.selectTemplate.error1')));
                } else if (this.getStrNumber(String(this.data_createSite.siteName).trim()) < 4) {
                    callback(new Error(this.$t('administerAMP.selectTemplate.error2')));
                } else if (this.getStrNumber(String(this.data_createSite.siteName).trim()) > 200) {
                    callback(new Error(this.$t('administerAMP.selectTemplate.error3')));
                } else {
                    callback();
                }
            },
            // 获取字符长度。汉字占2个字符，英文数字占1个字符
            getStrNumber(str) {
                let len = 0;
                for (let i = 0; i < str.length; i++) {
                    if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94 || !this.isASCII(str.charAt(i))) {
                        len += 2;
                    } else {
                        len++;
                    }
                }
                return len;
            },

            isASCII(str) {
                return /^[\x00-\x7F]*$/.test(str);
            },
            // 模板列表初始化
            getTemplates() {
                // 获取此列表需要用户鉴权
                // util
                //     .ajax({
                //         url: `${this.url}/auth/verifyFirst`,
                //         method: 'post'
                //     })
                util
                    .ajaxAMP({
                        url: '/auth/verifyFirst',
                        method: 'post'
                    })
                    .then(response => {
                        if (response.data.code === 0) {
                            // util
                            //     .ajax({
                            //         url: `${this.url}/trunk/template/getAll`
                            //     })
                            util
                                .ajaxAMP({
                                    url: '/trunk/template/getAll'
                                })
                                .then(response => {
                                    this.loading = false;
                                    if (response.data.code === 0) {
                                        this.templates = response.data.data;
                                        setTimeout(() => {
                                            for (let i = 0; i < this.templates.length; i++) {
                                                this.showCode(`${this.url1}${this.templates[i].path}/index.html`, i);
                                            }
                                        }, 0);
                                    } else {
                                        this.$Message({
                                            message: response.data.msg,
                                            type: 'error',
                                            duration: 3000
                                        });
                                    }
                                })
                                .catch(erro => {
                                    this.loading = false;
                                    this.$Message({
                                        message: this.$t('administerAMP.selectTemplate.msg1'),
                                        type: 'error',
                                        duration: 3000
                                    });
                                });
                        } else {
                            this.loading = false;
                            this.$Message({
                                message: response.data.msg,
                                type: 'error',
                                duration: 3000
                            });
                        }
                    })
                    .catch(erro => {
                        this.loading = false;
                        this.$Message({
                            message: this.$t('administerAMP.selectTemplate.msg2'),
                            type: 'error',
                            duration: 3000
                        });
                    });
            },
            /* 生成展示二维码 */
            showCode(path, index) {
                const qrNode = this.$refs.qrcode[index];
                qrNode.innerHTML = '';
                try {
                    const qrcode = new QRCode(qrNode, {
                        text: path,
                        width: 60,
                        height: 60,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.L
                    });
                } catch (e) {
                    try {
                        const qrcode = new QRCode(qrNode, {
                            text: path,
                            width: 60,
                            height: 60,
                            colorDark: '#000000',
                            colorLight: '#ffffff',
                            correctLevel: QRCode.CorrectLevel.Q
                        });
                    } catch (e) {
                        alert(`${e.name}: ${e.message}`);
                    }
                }
            },
            // 预览模板
            previewTemplate(path) {
                this.$store.state.isShowFullTemplateModal = true;
                this.$store.state.FullTemplatePath = `${this.url1}${path}/index.html`;
            },

            /* 模态框 */
            // 创建网站
            ok_createSite() {
                // if (String(this.data_createSite.siteName).trim() === '') {
                //   this.$Message({
                //       message: '网站名称不能为空',
                //       type: 'error',
                //   });
                //   return false;
                // } else if (String(this.data_createSite.siteName).trim().length < 4){
                //   this.$Message({
                //       message: '网站名称长度不能小于4个',
                //       type: 'error',
                //   });
                //   return false;
                // } else if (String(this.data_createSite.siteName).trim().length > 200){
                //   this.$Message({
                //       message: '网站名称长度不能超过200个',
                //       type: 'error',
                //   });
                //   return false;
                // }
                this.$refs.createSite.validate(valid => {
                    if (valid) {
                        this.createSiteLoading = true;
                        this.confirmCreateBtnText = this.$t('administerAMP.selectTemplate.creating');
                        // util
                        //     .ajax({
                        //         url: `${this.url}/trunk/site/create`,
                        //         method: 'post',
                        //         data: {
                        //             template_id: this.templateId,
                        //             title: this.data_createSite.siteName
                        //         }
                        //     })
                        util
                            .ajaxAMP({
                                url: '/trunk/site/create',
                                method: 'post',
                                data: {
                                    template_id: this.templateId,
                                    title: this.data_createSite.siteName
                                }
                            })
                            .then(response => {
                                this.createSiteLoading = false;
                                this.confirmCreateBtnText = this.$t('administerAMP.selectTemplate.define');
                                if (response.data.code === 0) {
                                    this.$Message.success(this.$t('administerAMP.selectTemplate.creatSuccess'));
                                    this.$store.state.isCreateSite = true;
                                    // 为了显示创建成功提示语而加了延时
                                    window.setTimeout(() => {
                                        const val = response.data.data;
                                        // this.$emit('update:openTemplate', response.data.data); // 打开指定模板站(网站编辑)
                                        this.openPage(null, val.id, 'site-edit', val.template_id);
                                        this.$store.state.showWitchComponent = 'myWebsite';
                                    }, 500);
                                    this.$router.push({
                                        name: 'website_manager'
                                    });
                                    this.visible_createSite = false;
                                    this.$refs.createSite.resetFields();
                                } else {
                                    this.$Message({
                                        message: response.data.msg,
                                        type: 'error',
                                        duration: 3000
                                    });
                                }
                            })
                            .catch(erro => {
                                this.createSiteLoading = false;
                                this.confirmCreateBtnText = this.$t('administerAMP.selectTemplate.define');
                                this.$Message({
                                    message: this.$t('administerAMP.selectTemplate.creatFail'),
                                    type: 'error',
                                    duration: 3000
                                });
                            });
                    } else {
                        return false;
                    }
                    this.visible_createSite = false;
                });
            },
            // 取消创建网站
            cancel_createSite() {
                this.$refs.createSite.resetFields();
            },
            // 返回站点列表
            backtoMyWebsite() {
                this.$store.state.showWitchComponent = 'myWebsite';
                this.$store.state.isCreateSite = true;
            },
            // 监听操作
            goBack() {
                const previousSitePage = localStorage.getItem('currentSitePage');
                if (previousSitePage === 'myWebsite') {
                    this.$store.state.showWitchComponent = 'myWebsite';
                } else {
                    this.$store.state.showWitchComponent = 'guidePage';
                }
                // replace替换原路由，作用是避免回退死循环
                this.$router.replace({ path: '/websiteInteraction/website_manager' });
                console.log('监听到了---------------------------');
            },
            openPage(kindId, id, kindName, templateId, title) {
                const url = `${util.AutomaticSiteDomainUrl}/#`;
                const orgId = this.$store.state.enterpriseId;
                let page = '';
                switch (kindName) {
                    case 'site-edit':
                        page = `/site-edit/site-edit?id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'site-settings':
                        page = `/site-settings/site-settings?id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'news':
                        page = `/news-management/news-list?kind_id=${kindId}&id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'product':
                        page = `/product-management/product-list?kind_id=${kindId}&id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'solution':
                        page = `/solution-management/solution-list?kind_id=${kindId}&id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'case':
                        page = `/case-management/case-list?kind_id=${kindId}&id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'pics-management':
                        page = `/pics-management/pics-management?id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'video-management':
                        page = `/video-management/video-management?id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'files-management':
                        page = `/files-management/files-management?id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                }
                // 用户鉴权
                // util
                //     .ajax({
                //         url: `${util.AutomaticSiteUrl}/auth/verifyFirst`,
                //         method: 'post',
                //         data: {
                //             site_id: id
                //         }
                //     })
                util
                    .ajaxAMP({
                        url: '/auth/verifyFirst',
                        method: 'post',
                        data: {
                            site_id: id
                        }
                    })
                    .then(response => {
                        if (response.data.code === 0) {
                            window.open(url + page, '_blank'); // 新窗口打开外链接
                        } else {
                            this.$Message({
                                message: response.data.msg,
                                type: 'error',
                                duration: 3000
                            });
                        }
                    })
                    .catch(erro => {
                        this.$Message({
                            message: this.$t('administerAMP.selectTemplate.msg2'),
                            type: 'error',
                            duration: 3000
                        });
                    });
            },
            handleCoverHide() {
                let nodes = document.getElementsByClassName('template-card-cover');
                for(let node of nodes) {
                  node.style.display = 'none';
                }
            }
        },
        created() {
            this.getTemplates();
        },
        mounted() {
            // 判断浏览器是否支持popstate
            if (window.history && window.history.pushState) {
                history.pushState(null, null, document.URL);
                // 监听浏览器的回退按钮，并阻止其默认事件。
                window.addEventListener('popstate', this.goBack, false);
            }
        },
        beforeDestroy() {
            // 页面销毁时，取消监听。否则其他vue路由页面也会被监听
            console.log('页面销毁了----------------------------');
            window.removeEventListener('popstate', this.goBack, false);
        },
        beforeRouteLeave(to, from, next) {
            // console.log('>>>>', to, from, next);
        }
    };
</script>

<style scoped lang="less">
.nav-container {
  height: 50px;
  line-height: 50px;
  padding: 0 30px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  /deep/ .ivu-tabs-bar {
    border: none;
  }
  /deep/ .ivu-tabs-nav-container {
    line-height: 2.6;
  }
  /deep/ .ivu-tabs-nav .ivu-tabs-tab {
    margin-left: -16px;
  }
  /deep/ .ivu-tabs-ink-bar {
    left: -16px;
  }
}

.tip {
  font-size: 12px;
  .step-seq {
    display: inline-block;
    width: 16px;
    height: 16px;
    line-height: 14px;
    color: #00cc99;
    border: 1px solid #00cc99;
    border-radius: 50%;
    margin: 0 8px 0 20px;
    text-align: center;

    &:first-child {
      margin-left: 0;
    }
  }
}

.backBtn {
  /deep/ .ivu-btn {
    padding-left: 15px;
    padding-right:15px;
    margin-top: 15px;
  }
}

.template-card {
  position: relative;
  display: inline-block;
  width: 250px;
  height: 380px;
  margin: 30px 0 0 30px;
  background: #fff;
  img {
    width: 100%;
  }

}
.template-card-img {
  &:hover .template-card-cover {
    display: block;
  }
}
.template-card-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
}

.template-qrcode-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #fff;
  margin: 90px 70px 80px;
  padding-top: 20px;
  text-align: center;

  .template-qrcode {
    width: 60px;
    height: 60px;
    margin: 0 auto 5px;
  }

  .template-qrcode-tip {
    font-size: 12px;
    line-height: 18px;
    margin-top: 6px;
  }
}

.template-operate-button {
  display: flex;
  justify-content: space-between;
  padding: 0 40px;
}

.createSite-form {
  padding: 0 20px;
  /deep/ .el-form-item__label {
    font-weight: normal;
    font-size: 12px;
  }
}
.download_link {
  a {
    color: #3B78DE;
    &:hover {
      color: #2D63BC;
    }
  }
}
</style>
<style lang="less">
.select-template {
  .el-form-item__error{
    left: 90px!important;
  }
}
</style>
