<template>
    <div class="company-overview" v-loading="data.loading">
        <div class="company-overview-box">
            <h3 class="title">{{$t('companyOverview.companyInfo')}}</h3>
            <el-table :data="companyData" style="width: 100%">
                <el-table-column v-for="items in data.displayFields" :key="items" :prop="items" :label="$t(`companyOverview.${items}`)" />
            </el-table>
        </div>
        <div class="company-overview-box" v-if="!data.loading && companyData.length">
            <h3 class="title">{{$t('companyOverview.businessModule')}}</h3>
            <div class="business-module-box">
                <div class="business-module-list">
                    <div class="title">
                        <b>{{$t('companyOverview.whatsAppModule')}}</b>
                        <el-button type="text" @click="jump('whatsapp_chat')">{{$t('companyOverview.whatsAppSee')}}</el-button>
                    </div>
                    <div class="info">
                        <p>{{$t('companyOverview.whatsAppConfigure1')}}<span>{{companyData[0].orgWhatsappAccountMore}}{{$t('companyOverview.whatsAppResultText1')}}</span></p>
                        <p>{{$t('companyOverview.whatsAppConfigure2')}}<span v-if="companyData[0].orgWhatsappRecordSync">{{companyData[0].orgWhatsappRecordSync === 1 ? $t('companyOverview.whatsAppResult1') : $t('companyOverview.whatsAppResult2')}}</span></p>
                        <p v-if="companyData[0].orgWhatsappBusiness === 1">{{$t('companyOverview.whatsAppConfigure3')}}<span>{{companyData[0].orgWhatsappBusinessAccount}}</span></p>
                    </div>
                </div>
                <div class="business-module-list" v-if="companyData[0].orgCinnox === 1">
                    <div class="title">
                        <b>{{$t('companyOverview.callSMSModule')}}</b>
                        <el-button type="text" @click="jump('calling_sms')">{{$t('companyOverview.callSMSSee')}}</el-button>
                    </div>
                    <div class="info">
                        <p>{{$t('companyOverview.callSMSConfigure1')}}<span>{{$t(`companyOverview.callSMSResult${companyData[0].orgCinnoxConfig}`)}}</span></p>
                        <!-- <p>{{$t('companyOverview.callSMSConfigure2')}}<span>{{companyData[0].orgCinnox === 1 ? $t('companyOverview.callSMSResult2') : $t('companyOverview.callSMSResult3')}}</span></p> -->
                    </div>
                </div>
                <div class="business-module-list" v-if="companyData[0].orgOpenapi === 1">
                    <div class="title">
                        <b>{{$t('companyOverview.openAPIModule')}}</b>
                        <el-button type="text" @click="jump('openApi')">{{$t('companyOverview.openAPISee')}}</el-button>
                    </div>
                    <div class="info">
                        <p>{{$t('companyOverview.callSMSConfigure1')}}<span>{{$t(`companyOverview.callSMSResult${companyData[0].orgOpenapiConfig}`)}}</span></p>
                    </div>
                </div>
            </div>
        </div>
        <div class="company-overview-box" style="margin-bottom: 0; padding-bottom:0">
            <h3 class="title">{{$t('companyOverview.statistics')}}</h3>
            <div class="statistics-box">
                <div class="statistics-list" v-for="(item, key) in data.statisticsList" :key="key">
                    <h3>{{$t(`${item.title}`)}}</h3>
                    <el-progress type="circle" :percentage="item.percentage" stroke-width="8" :color="item.color">
                        <template #default="{ }">
                            <p class="percentage-label">{{$t(`${item.tips}`)}}</p>
                            <h3 class="percentage-value">{{item.results}} {{$t(`${item.unit}`)}}</h3>
                        </template>
                    </el-progress>
                    <p>{{$t(`${item.value1Tips}`)}}{{item.value1}} <span v-if="item.resultsUnit">{{$t(`${item.resultsUnit}`)}}</span></p>
                    <p>{{$t(`${item.value2Tips}`)}}{{item.value2}} <span v-if="item.resultsUnit">{{$t(`${item.resultsUnit}`)}}</span></p>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useUserStore } from '@/pinia/modules/user.js';
import { getOrgReport } from '@/api/common.js'; // 角色相关api请求
import { flattenObjectArray, judgePermissions } from '@/utils/dataProcess.js';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
const store = useUserStore();
const data = ref({
    loading: true,
    // userId: computed(() => store.userId),
    displayFields: ['orgId', 'orgNameCn', 'orgManagerName', 'orgManagerEmail', 'orgManagerPhone'],
    statisticsList: {
        deadline: {
            title: 'companyOverview.deadline',
            tips: 'companyOverview.deadlineTips',
            value1Tips: 'companyOverview.deadlineTips1',    
            value2Tips: 'companyOverview.deadlineTips2',
            value1: '2022-01-01',
            value2: '2022-01-01',
            results: 10,
            percentage: 10,
            color: '#4285F2',
            unit: 'companyOverview.unit1',
            resultsUnit: ''
        },
        usage: {
            title: 'companyOverview.usage',
            tips: 'companyOverview.usageTips',
            value1Tips: 'companyOverview.usageTips1',    
            value2Tips: 'companyOverview.usageTips2',
            value1: '100',
            value2: '100',
            results: 0,
            percentage: 10,
            color: '#15C5D4',
            unit: 'companyOverview.unit2',
            resultsUnit: 'companyOverview.unit2'
        },
        GTP: {  
            title: 'companyOverview.GTP',
            tips: 'companyOverview.GTPTips',
            value1Tips: 'companyOverview.GTPTips1',
            value2Tips: 'companyOverview.GTPTips2',
            value1: '100',
            value2: '100',
            results: 0,
            percentage: 10,
            color: '#7B66EE',
            unit: 'companyOverview.unit3',
            resultsUnit: 'companyOverview.unit3'
        },
        WSAPI: {
            title: 'companyOverview.WSAPI',
            tips: 'companyOverview.GTPTips',
            value1Tips: 'companyOverview.WSAPITips1',
            value2Tips: 'companyOverview.WSAPITips2',
            value1: '100',
            value2: '100',
            results: 0,
            percentage: 10,
            color: '#4285F2',
            unit: 'companyOverview.unit4',
            resultsUnit: 'companyOverview.unit4'
        },
        EDM: {   
            title: 'companyOverview.EDM',
            tips: 'companyOverview.EDMTips',
            value1Tips: 'companyOverview.EDMTips1',
            value2Tips: 'companyOverview.EDMTips2',
            value1: '100',
            value2: '100',
            results: 0,
            percentage: 10,
            color: '#15C5D4',
            unit: 'companyOverview.unit5',
            resultsUnit: 'companyOverview.unit5'
        },
        cardScan: {
            title: 'companyOverview.cardScan',
            tips: 'companyOverview.cardScanTips', 
            value1Tips: 'companyOverview.cardScanTips1',
            value2Tips: 'companyOverview.cardScanTips2',
            value1: '100',
            value2: '100',
            results: 0,
            percentage: 10,
            color: '#7B66EE',
            unit: 'companyOverview.unit6',
            resultsUnit: 'companyOverview.unit6'
        },
        article: {
            title: 'companyOverview.article',
            tips: 'companyOverview.articleTips',
            value1Tips: 'companyOverview.articleTips1',
            value2Tips: 'companyOverview.articleTips2',
            value1: '100',
            value2: '100',
            results: 0,
            percentage: 10,
            color: '#4285F2',
            unit: 'companyOverview.unit7',
            resultsUnit: 'companyOverview.unit7'
        },
        translation: {
            title: 'companyOverview.translation',
            tips: 'companyOverview.articleTips',
            value1Tips: 'companyOverview.translationTips1',
            value2Tips: 'companyOverview.translationTips2',
            value1: '100',
            value2: '100',
            results: 0,
            percentage: 10,
            color: '#15C5D4',
            unit: 'companyOverview.unit2',
            resultsUnit: 'companyOverview.unit2'
        }
    }
});
const companyData = ref([]);
const menuList = flattenObjectArray(localStorage.getItem('roleMenu') ? JSON.parse(localStorage.getItem('roleMenu')) : []);
const router = useRouter();
const { t } = useI18n();

function getCompanyInfo() {
    getOrgReport({ 
        orgId: store.orgId // store.orgId
    }).then(res => {
        if (res.code === 10000) {
            const info = res.data;
            setStatisticsList(info);
            companyData.value.push(info);
        } else {
            ElMessage.error(res.messageShow);
        }
        data.value.loading = false;
    });
}

function setStatisticsList(res) {
    const statisticsList = data.value.statisticsList;
    for (const key in statisticsList) {
        switch (key) {
            case 'deadline':
                statisticsList[key].value1 = res.openDateTime;
                statisticsList[key].value2 = res.offDateTime;
                statisticsList[key].results = res.orgResidueDay;
                statisticsList[key].percentage = Math.round((res.orgAllDay - res.orgResidueDay) / res.orgAllDay * 100);
                break;
            case 'usage':
                statisticsList[key].value1 = res.orgBuyUserNumber;
                statisticsList[key].value2 = res.orgOpenAccount;
                statisticsList[key].results = res.orgAvailableUserNumber;
                statisticsList[key].percentage = Math.round(res.orgOpenAccount / res.orgBuyUserNumber * 100);
                break;
            case 'GTP':
                // if (judgePermissions('enterpriseGPT', menuList, 'path')) {
                    statisticsList[key].value1 = res.orgAiTotalAmount;
                    statisticsList[key].value2 = res.orgAiConsumeMoney;
                    statisticsList[key].results = res.orgAiRemainingAmount;
                    statisticsList[key].percentage = Math.round(res.orgAiConsumeMoney / res.orgAiTotalAmount * 100);
                // } else {
                //     delete statisticsList[key]; 
                // }
                break;
            case 'WSAPI':
                // if (judgePermissions('whatsapp_group_tasklist', menuList, 'path')) {
                    statisticsList[key].value1 = res.orgWhatsappApiMoney;
                    statisticsList[key].value2 = res.orgWhatsappApiUsedMoney;
                    statisticsList[key].results = res.orgWhatsappApiAvailableMoney;
                    statisticsList[key].percentage = Math.round(res.orgWhatsappApiUsedMoney / res.orgWhatsappApiMoney * 100);
                // } else {
                //     delete statisticsList[key]; 
                // }
                break;
            case 'EDM':
                // if (judgePermissions('email_marketing', menuList, 'path')) {
                    statisticsList[key].value1 = res.orgSentCountTotal;
                    statisticsList[key].value2 = res.orgSendEmailCount;
                    statisticsList[key].results = res.orgSentCountAvailable;
                    statisticsList[key].percentage = Math.round(res.orgSendEmailCount / res.orgSentCountTotal * 100);
                // } else {
                //     delete statisticsList[key];
                // }
                break;
            case 'cardScan':
                // if (judgePermissions('crm', menuList, 'path')) {
                    statisticsList[key].value1 = res.orgCardScanTotal;
                    statisticsList[key].value2 = res.orgUserScanTotal;
                    statisticsList[key].results = res.orgCardScanAvailableTotal;
                    statisticsList[key].percentage = Math.round(res.orgUserScanTotal / res.orgCardScanTotal * 100);
                // } else {
                //     delete statisticsList[key];
                // }
                break;
            case 'article':
                // if (judgePermissions('autoGenArticle', menuList, 'path')) {
                    statisticsList[key].value1 = res.orgArticleSum;
                    statisticsList[key].value2 = res.orgArticleUseTotal;
                    statisticsList[key].results = res.orgArticleRediTotal;
                    statisticsList[key].percentage = Math.round(res.orgArticleUseTotal / res.orgArticleSum * 100);
                // } else {
                //     delete statisticsList[key];
                // }
                break;
            case 'translation':
                // if (judgePermissions('whatsapp_chat', menuList, 'path')) {
                    statisticsList[key].value1 = res.orgTranslateSum;
                    statisticsList[key].value2 = res.orgTranslateUseTotal;
                    statisticsList[key].results = res.orgTranslateRediTotal;
                    statisticsList[key].percentage = Math.round(res.orgTranslateUseTotal / res.orgTranslateSum * 100);
                // } else {
                //     delete statisticsList[key]; 
                // }
                break;
        }
    }
}
function jump(type) {
    if (judgePermissions(type, menuList, 'path')) {
        window.open(router.push({
            path: type
        }).href);
    } else {
        ElMessage.warning(t(`companyOverview.jump${type}`));
    }
}
onMounted(() => {
    getCompanyInfo();
});
</script>
<style lang="scss" scoped>
    @use '@/style/variables.module.scss' as *;
    .company-overview {
        box-sizing: border-box;
        height: 100%;
        overflow-y: auto;
        padding: 12px;
        background: #F2F3F5 ;
        .company-overview-box {
            padding: 20px;
            background: #fff;
            border-radius: 4px;
            margin-bottom: 12px;
            .title {
                font-size: 16px;
                line-height: 24px;
                font-weight: bold;
                margin-bottom: 12px;
            }
            .business-module-box {
                display: flex;
                justify-content: flex-start;
                .business-module-list {
                    flex: 1;
                    max-width: 30%;
                    margin-right: 20px;
                    padding: 16px 20px;
                    background: #FAFBFF;
                    border: #EBEEF5 solid 1px;
                    border-radius: 4px;
                    .title {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 14px;
                        .xhl-el-button{
                            color: $textlinkColor;
                            :hover {
                                color: $textlinkHoverColor;
                            }
                        }
                    }
                    .info {
                        p {
                            font-size: 12px;
                            color: #606266;
                            line-height: 18px;
                            margin: 8px 0 0;
                            span {
                                color: #303133;
                                font-size: 14px;
                            }
                        }
                    }
                }

            }
            .statistics-box {
                display: flex;
                flex-direction: row;
                justify-content: start;
                flex-wrap: wrap;
                .statistics-list {
                    flex: unset;
                    min-width: 16.66%;
                    text-align: center;
                    margin-bottom: 30px;
                    h3 {
                        font-size: 14px;
                        line-height: 22px;
                        margin: 0 0 16px;
                    }
                    .percentage-value {
                        margin: 0;
                        color: #303133;
                    }
                    p {
                        margin: 0;
                        font-size: 12px;
                        line-height: 22px;
                        color: #606266;
                    }
                    .percentage-label {
                        color: #303133;
                    }
                    .xhl-el-progress { 
                        margin-bottom: 12px;
                    }
                }
            }
        }
    }
</style>