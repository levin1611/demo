<template>
    <div class="businessRules">
        <Card class="" shadow="never" style="margin-bottom: 20px">
            <div class="businessRulesTitle">{{$t('highSeasSetting.businessRulesTitle1')}}</div>
            <p class="businessRulesText">{{$t('highSeasSetting.businessRulesText1')}}</p>
            <div>
                <Checkbox v-for="item in getRuleList" :key="item.key" class="check-box" v-model="item.status">{{ item.label }}</Checkbox>
            </div>
         </Card>
         <Card shadow="never">
            <div class="businessRulesTitle">{{$t('highSeasSetting.businessRulesTitle3')}}</div>
            <p class="businessRulesText">{{$t('highSeasSetting.businessRulesText3')}}</p>
         </Card>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    export default {
        name: 'businessRules',
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            })
        },
        data() {
            return {
                getRuleList: [
                    { label: this.$t('highSeasSetting.getRulesOption1'), status: true, disabled: true },
                    { label: this.$t('highSeasSetting.getRulesOption2'), status: true, disabled: true },
                    { label: this.$t('highSeasSetting.getRulesOption3'), status: true, disabled: true },
                    { label: this.$t('highSeasSetting.getRulesOption4'), status: true, disabled: true },
                    { label: this.$t('highSeasSetting.getRulesOption5'), status: true, disabled: true }
                ]
            };
        },
        created() {
        },
        methods: {
            getRule() {

            }
        }
    };
</script>

<style lang="less" scoped>
    .businessRules {
        .businessRulesTitle {
            margin-bottom: 8px;
            font-size: 14px;
            line-height: 22px;
            color: rgba(0, 0, 0, 0.8);
            font-weight: 600;
        }
        .businessRulesText {
            margin-bottom: 12px;
            font-size: 12px;
            line-height: 18px;
            color: #666666;
        }
    }
</style>
