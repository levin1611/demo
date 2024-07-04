<template>
    <div style="background-color: white;">
        <!-- 公司字段 -->
        <div style="padding: 20px;">
            <FieldSetting :fieldBelong="1"></FieldSetting>
        </div>
        <Divider></Divider>
        <!-- 联系人字段 -->
        <div style="padding: 20px;">
            <FieldSetting :fieldBelong="2" ref="fieldBelong2"></FieldSetting>
        </div>
        <Divider></Divider>
        <!-- 询盘字段 -->
        <div style="padding: 20px;">
            <FieldSetting :fieldBelong="3"></FieldSetting>
        </div>
    </div>
</template>

<script>
    import FieldSetting from '@/views/main-components/field-setting';
    import { mapState } from 'vuex';

    export default {
        name: 'inquirySetting',
        components: {
            FieldSetting
        },
        data() {
            return {
                excludeCompany: ['10380', '10979', '10171']
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId'
            })
        },
        beforeDestroy() {
        },
        beforeRouteLeave(to, from, next) {
            // 联系人表中的邮箱、电话、instagram、WhatsApp、社交平台中的一项为必填，否则不让跳转
            if (this.$refs.fieldBelong2 && !this.excludeCompany.includes(this.enterpriseId) && this.$refs.fieldBelong2.checkContactMustInput() === 0) {
                this.$Message.warning(this.$t('crm.InqSet.changeRequired'));
                return;
            }
            next();
        }
    };
</script>
