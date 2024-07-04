<template>
    <div class="business_association_settings">
        <div class="business_association_settings_container">
            <div class="business_association_settings_switch">
                <span class="lable_title">{{ $t('businessAssociationSettings.title') }}</span>
                 <el-switch v-model="isSetting" @change="handleSetting"></el-switch>
            </div>
            <div class="business_association_settings_info">
                <p class="lable_title">{{ $t('businessAssociationSettings.info') }}</p>
                <div class="info_list">
                    <p class="info_list_flex info_list_flex_title">
                        <span class="table1">{{ $t('businessAssociationSettings.table1') }}</span>
                        <span class="custom"></span>
                        <span class="table2">{{ $t('businessAssociationSettings.table2') }}</span>
                    </p>
                    <template v-if="fieldList">
                        <p class="info_list_flex" v-for="(item,i) in fieldList" :key="item.storageName">
                            <span class="table1">{{ item.crmFieldName }}</span>
                            <Icon custom="custom-form-set-arrow"
                                color="#7B98B6"
                                size="15"></Icon>
                            <span class="table2">
                                 <Select v-model="item.businessField"
                                        filterable
                                        clearable
                                        :placeholder="$t('crm.Modal.tip_select')"
                                        @clear="clearSelect(i)">
                                    <Option v-for="fields in item.businessFieldLists"
                                            :key="fields.businessField"
                                            :value="fields.businessField"
                                            :label="fields.businessFieldName">
                                    </Option>
                                </Select>
                            </span>
                            <Icon custom="custom-delete-new" color="#64758D" @click="deleteFieldList(i)"
                                size="12"></Icon>
                        </p>
                    </template>
                    <Dropdown trigger="click" @command="changeCommand" placement="bottom-start">
                        <span class="add_title"> +{{$t('businessAssociationSettings.addLable')}} </span>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem v-for="(fields,index) in customerFields" :key="index" :command="fields.crmField" :disabled="fieldList.some(i => i.crmField === fields.crmField)">
                                {{fields.crmFieldName}}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
        </div>
        <div class="business_association_settings_footer">
            <Button type="primary"
                size="large"
                @click="() => handleSave()">{{ $t('save') }}</Button>
        </div>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    import { BASetting } from '@/api/systemSettings/business_association_settings/index';
    export default {
        name: 'business_association_settings',
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName'
            })
        },
        data() {
            return {
                isSetting: false,
                // 所有客户字段
                customerFields: [],
                // 历史设置过的字段，保存时校验用
                oldFieldList: [],
                // 每次操作添加后的字段
                fieldList: [],
                // 工商信息字段设置过的id
                businessInfoId: null
            };
        },
        created() {
            this.getPageData();
        },
        methods: {
            // 开关
            handleSetting(value) {
                BASetting.switchBusinessSetting({
                    orgId: this.orgId,
                    userId: this.userId,
                    userName: this.fullName,
                    type: value ? 1 : 0
                }).then(data => {
                    if (data.code === '1') {
                        // 更新vuex存储的工商联想开启状态
                        this.$store.commit('set_business_state', value);

                        this.$Message({
                            type: 'success',
                            message: this.$t('whatsapp_manage.setSuccessfully'),
                            showClose: true
                        });
                    }
                });
            },
            // 选中客户字段
            changeCommand(command) {
                const selected = this.customerFields.filter(item => item.crmField === command);
                this.fieldList.push(Object.assign({}, ...selected));
            },
            // 删除对应信息
            deleteFieldList(i) {
                this.fieldList.splice(i, 1);
            },
            clearSelect(i) {
                this.fieldList[i].businessField = '';
            },
            // 获取页面所需数据
            getPageData() {
                BASetting.getBusinessSettingsInfo({
                    orgId: this.orgId
                }).then(response => {
                    if (response.code === '1') {
                        const businessInfo = response.data;
                        this.businessInfoId = (businessInfo && businessInfo.id) ? businessInfo.id : null;
                        this.isSetting = businessInfo && businessInfo.isOpen !== 0;
                        // 过滤出有映射的字段集合
                        const list = businessInfo.fieldMappings.filter((item) => item.businessField);
                        this.oldFieldList = JSON.parse(JSON.stringify(list));
                        this.fieldList = JSON.parse(JSON.stringify(list));
                        this.customerFields = response.data.fieldMappings;
                    }
                });
            },
            // 保存
            handleSave() {
                const fieldList = this.fieldList.find(item => !item.businessField);
                if (fieldList) {
                    this.$Message({
                        type: 'error',
                        message: this.$t('businessAssociationSettings.saveTip'),
                        showClose: true
                    });
                    return;
                }
                const fieldMapping = [];
                this.fieldList.forEach(item => {
                    if (item.businessFieldName) {
                        fieldMapping.push({
                            crmField: item.crmField,
                            crmFieldName: item.crmFieldName,
                            businessField: item.businessField,
                            businessFieldName: item.businessFieldName
                        });
                    } else {
                        const businessFieldName = item.businessFieldLists.find(i => i.businessField === item.businessField).businessFieldName;
                        fieldMapping.push({
                            crmField: item.crmField,
                            crmFieldName: item.crmFieldName,
                            businessField: item.businessField,
                            businessFieldName
                        });
                    }
                });
                BASetting.saveOrUpdateBusinessSetting({
                    orgId: this.orgId,
                    createUserId: this.businessInfoId ? undefined : this.userId,
                    updateUserId: this.businessInfoId ? this.userId : undefined,
                    id: this.businessInfoId,
                    fieldMapping: JSON.stringify(fieldMapping)

                }).then(data => {
                    if (data.code === '1') {
                        this.oldFieldList = fieldMapping;
                        this.getPageData();
                        this.$Message({
                            type: 'success',
                            message: this.$t('filter_box.save_success'),
                            showClose: true
                        });
                    } else {
                        this.$Message({
                            type: 'error',
                            message: this.$t('filter_box.error_save'),
                            showClose: true
                        });
                    }
                });
            },
            // 判断数据是否有变化
            checkChange() {
                if (this.fieldList.length !== this.oldFieldList.length) return true;
                let resultLength = 0;
                this.fieldList.forEach(item => {
                    this.oldFieldList.forEach(oldItem => {
                        if (oldItem.crmField === item.crmField && oldItem.businessField === item.businessField) {
                            resultLength++;
                        }
                    });
                });
                return !(this.fieldList.length === resultLength);
            }
        },
        beforeRouteLeave(to, from, next) {
            // 有变化时提示下
            if (this.checkChange()) {
                this.$confirm(this.$t('businessAssociationSettings.leaveMotionTip'), this.$t('crm.aliImport.leaveConfirm'), {
                    confirmButtonText: this.$t('crm.InqSet.modal_ok'),
                    cancelButtonText: this.$t('crm.InqSet.modal_cancel'),
                    type: ''
                }).then(() => {
                    next();
                }).catch(() => { });
                return;
            }
            next();
        }
    };
</script>
<style lang="less" scoped>
.business_association_settings_container{
    width: 100%;
    height: 100%;
}
    .business_association_settings {
        width: 100%;
        height: 100%;
        position: relative;
        .business_association_settings_switch{
            padding: 30px;
            border-bottom:#E5E7EC solid 1px;
        }
        .business_association_settings_info{
            padding: 30px;
        }
        .info_list {
            margin-top: 20px;
            height: calc(100vh - 320px);
            overflow-y: auto;
            .info_list_flex {
                display: flex;
                align-items: center;
                justify-content: start;
                margin-bottom: 20px;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.8);
                span.table1 {
                    width: 150px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .custom {
                    width: 50px;
                    margin: 0 10px;
                }
                .custom-delete-new{
                    width: 15px;
                    cursor: pointer;
                }
            }
            .info_list_flex_title {
                font-size: 14px;
            }
        }
        .lable_title {
            margin-right: 10px;
            font-size: 16px;
            color: rgba(0, 0, 0, .8);
            font-weight: 500;
        }
        .add_title{
            font-size: 12px;
            color: rgba(59, 120, 222, 0.8);
            cursor: pointer;
        }
        .business_association_settings_footer {
            padding-left: 30px;
            position: absolute;
            left: 0;
            bottom: 0;
            height: 66px;
        }
    }
</style>

