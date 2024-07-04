<template>
    <div class="detail-page" >  
        <main class="detail-page-main" :style="{width: isShowCRMDetail ? '100%': '0'}" v-loading="loading">
            <!-- 新的详情页 -->
            <iframe ref="iframe"
                v-show="isShowCRMDetail"
                
            :src="iframeUrl" frameborder="0" width="100%" height="100%"></iframe>
            <section v-if="renderSwitch" class="toogleOpenBtn_super_slidebar"  @click="toggleDetailPage">
                    <Icon
                        v-show="isShowCRMDetail"
                        custom="custom-shouqi2"
                        style="color: rgb(176, 176, 176)"
                        size="50"
                    />
                    <Icon
                        v-show="!isShowCRMDetail"
                        custom="custom-zhankai3"
                        style="color: rgb(176, 176, 176)"
                        size="50"
                    />
                </section>
        </main>
        
    </div>
</template>

<script>
    export default {
        name: 'DetailPage',
        props:{
            renderSwitch: {
                // 是否需要渲染 出 开关
                default: false
            },
            selectedChatInfo: {
                default:() => {}
            },
            crmInfoFromGroupData: {
                default:() => {}
            },
            from: {
                // 谁在调用组件
                default: ''
            }
        },
        data() {
            return {
                isShowCRMDetail: true,
                loading: true,
                iframeUrl: 'http://localhost:8085/Front-Crm/#/crm/detailPage?auto_column_id=3239&auto_column_object_id=1600&auto_column_object_api_key=clue'
                // iframeUrl: origin+'/Front-Crm/#/crm/detailPage?auto_column_id=3239&auto_column_object_id=1600&auto_column_object_api_key=clue'
            };
        },
        methods: {
            // 监听iframe发来的消息
            handleMessage(event) {
                console.log(event.data);
                switch (event.data?.type) {
                    case 'getDetailOver':
                        //  获取详情结束
                        this.loading = false;
                        break;
                    case 'transferSuccess':
                        // 转移成功
                        break;
                    case 'delSuccess':
                        // 删除成功
                        break; 
                    case 'freshLeadsCLoudsStatus':
                        this.$emit('emitFreshLeadsCLoudsStatus',event.data?.data)
                        break;
                }
            },
            // 监听iframe的onload事件
            handleIframeLoad() {
                // this.$refs.iframe.contentWindow.postMessage('hello', '*');
                window.addEventListener('message', this.handleMessage);
            },
            toggleDetailPage() {
                this.isShowCRMDetail = !this.isShowCRMDetail
            },
            handleSendMsg(data) {
                const iframe = this.$refs.iframe;
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage(data, '*');
                }
            },
            forMateValue(v) {
                // 建档值，1.未建档 2.我的线索 3.公海线索 4.他人线索 5.我的联系人 6. 他人联系人 7. 我的客户 8. 公海客户 9. 他人客户
                // 根据建档值 判断是线索还是询盘还是联系人 然后使用不同的字段作为 auto_column_id得值
                let auto_column_id = '';
                let crmStatus = ''
                switch (v?.status) {
                    case 1:
                    auto_column_id = v.touchPointContactId;
                    crmStatus = 'touchPointContact'
                        break;
                    case 7:
                    case 8:
                    case 9:
                    auto_column_id = v.customerId;
                    crmStatus = 'customer'
                        break;
                    case 2:
                    case 3:
                    case 4:
                    auto_column_id = v.leadId;
                    crmStatus = 'lead'
                        break;
                    case 5:
                    case 6:
                    auto_column_id = v.contactId;
                    crmStatus = 'contact'
                        break;
                }
                const menuData = this.forMateObjectIdAndApiKey(crmStatus);
                return {
                    auto_column_id,
                    auto_column_object_id: menuData?.targetId,
                    auto_column_object_api_key: crmStatus
                };
            },
            forMateTargetValue(v){
                // 类型：1 WhatsApp, 2 WhatsAppGroup Id,3 Phone,4 Email(新版),5 企业微信 Id,6 企业微信群 Id,7 Facebook Id,8 Facebook 表单 Id,9 Instagram 账号 ,10 网站访客 Id
                // 格式化 targetvalue取值时候的key
                let type = 0;
                switch (this.from) {
                    case 'whatsApp':
                        if(v.chatType == 1) {
                            // WhatsAppGroup
                            type = 2;
                        } else {
                            // WhatsApp
                            type = 1;
                        }
                        break;
                    case 'mail':
                    case 'mail_detail':
                        type = 4;
                        break;
                    case 'FbChat':
                        type = 7;
                        break;
                    case 'FBLeads':
                        type = 8;
                        break;
                    case 'xhl-chat':
                    case 'visitorHistory':
                    case 'webMsg':
                        type = 10;
                        break;
                }
                return { type};
            },
            forMateObjectIdAndApiKey(type){
                const roleMenu = localStorage.getItem('roleMenu');
                if(roleMenu) {
                    const menu = JSON.parse(roleMenu);
                    const crm = menu.find(ele => ele.path == 'crm')
                    if(crm &&  crm.children.length) {
                        return crm.children.find(item => item.apiKey == type);
                    } else {
                        this.$Message.error('您无权访问当前页面，请联系管理员开通')
                    }
                }
            },
            setIframeUrl(v, from) {
                    /***
                     * crmInfo {
                     *  status: // 建档状态
                     *  contactId
                     * leadId
                     * customerId
                     * }
                     * 
                     */
                     console.log(v, 'crmInfo改变了', from, this.from);
                    if(v && v.crmInfo) {
                        // const data = this.forMateValue(v.crmInfo);
                        const {type}  = this.forMateTargetValue(v);
                        if(location.protocol == 'http:') {
                            // 本地开发环境
                            this.iframeUrl = `http://localhost:8085/Front-Crm/#/crm/detailPage?from=${this.from}&targetValues=${v.crmInfo.contactNo}&targetType=${type}`

                            // this.iframeUrl = `http://localhost:8085/Front-Crm/#/crm/detailPage?auto_column_id=${data.auto_column_id}&auto_column_object_id=${data.auto_column_object_id}&auto_column_object_api_key=${data.auto_column_object_api_key}&from=${this.from}&targetValues=${v[key]}&targetType=${type}`
                        } else {
                            // 线上环境或者测试环境 使用
                            this.iframeUrl = `/Front-Crm/#/crm/detailPage?from=${this.from}&targetValues=${v.crmInfo.contactNo}&targetType=${type}`
                            // this.iframeUrl = `/Front-Crm/#/crm/detailPage?auto_column_id=${data.auto_column_id}&auto_column_object_id=${data.auto_column_object_id}&auto_column_object_api_key=${data.auto_column_object_api_key}&from=${this.from}&targetValues=${v[key]}&targetType=${type}`
                        }
                    }
            }
        },
        mounted() {
            this.handleIframeLoad()
        },
        beforeDestroy() {
            console.log('beforeDestroy', '卸载iframe');
            window.removeEventListener('message', this.handleMessage);
        },
        watch: {
            selectedChatInfo:{
                handler(v) {
                    this.loading = true;
                    this.setIframeUrl(v, 'selectedChatInfo')
                },
                // deep: true,
                immediate: true
            },
            crmInfoFromGroupData : {
                // 只有wa群组有这一个属性 其他模块可以忽略
                handler(v) {
                    this.setIframeUrl(v, 'crmInfoFromGroupData')
                },
                // deep: true,
                immediate: true
            }
        }
    };
</script>


<style scoped lang="less">
   .detail-page {
        height: 100%;
        display: flex;
        justify-content: flex-end;
        .detail-page-main{
            height: 100%;
            position: relative;
        }
    }

    .toogleOpenBtn_super_slidebar{
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        .custom-zhankai3 {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translate(20%, -50%);
        }
        .custom-shouqi2{
        position: absolute;
        right: 0;
        top: 50%;
        transform: translate(40%, -50%);
        }
}
</style>