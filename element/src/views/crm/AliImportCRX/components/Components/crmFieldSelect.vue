<template>
    <Select v-model="selected_filed"
        :disabled="disabled"
        @change="handleSelectedItem"
        @clear="handleRemovedItem"
        ref="crmFieldSelect"
        clearable
        transfer-class-name="ccc"
        class="custom-select-class">
        <Tabs v-model="fieldBelong" class="custom-tabs-class">
            <TabPane label="客户管理" name="1" v-if="isShowCustomer">
                <Option v-for="item in fieldListInCustomer"
                    :disabled="item.disabled || allChecked.includes(item.matchId)"
                    :value="item.matchId"
                    :key="item.matchId"
                    :label="item.cname" >
                </Option>
            </TabPane>
            <TabPane label="联系人管理" name="2" v-if="isShowContact">
                <Option v-for="item in fieldListInContact"
                    :disabled="item.disabled || allChecked.includes(item.matchId)"
                    :value="item.matchId"
                    :key="item.matchId"
                    :label="item.cname" >
                </Option>
            </TabPane>
            <TabPane label="询盘管理" name="3" v-if="isShowInquiry">
                <Option v-for="item in fieldListInInquiry"
                    :disabled="item.disabled || allChecked.includes(item.matchId)"
                    :value="item.matchId"
                    :key="item.matchId"
                    :label="item.cname" >
                </Option>
            </TabPane>

        </Tabs>
    </Select>
</template>

<script>

    import { mapState } from 'vuex';

    export default {
        name: 'fieldMappingTable',
        props: {
            fieldListInCustomer: {
                type: Array,
                default() {
                    return [];
                }
            },
            fieldListInContact: {
                type: Array,
                default() {
                    return [];
                }
            },
            fieldListInInquiry: {
                type: Array,
                default() {
                    return [];
                }
            },
            disabled: Boolean,
            allChecked: Array,
            selectedFiled: {
                type: String,
                default() {
                    return '';
                }
            }
        },
        data() {
            return {
                isShowCustomer: true,
                isShowContact: true,
                isShowInquiry: true,
                fieldBelong: '1',
                selected_filed: ''
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId'
            })
        },
        methods: {
            handleSelectedItem(val) {
                /* 再次检测当前模块(fieldBelong)下是否有对应的数据 */
                this.$emit('update:selectedFiled', val);
            },
            handleRemovedItem(val) {
                // this.$store.state.crm.fieldsSelected.splice(this.$store.state.crm.fieldsSelected.indexOf(this.selected_item), 1);
                this.$emit('update:selectedFiled', '');
            }
        },
        created() {
        },
        mounted() {},
        watch: {
            selectedFiled: {
                handler(val) {
                    if (val) {
                        this.selected_filed = val;
                        this.fieldBelong = val.substring(0, 1);
                    } else {
                        this.selected_filed = '';
                    }
                }
            }
        }

    };
</script>

<style scoped lang="less">
    .el-select-dropdown {
        max-width: 313px !important;
    }
    .el-tab-pane {
        max-width: 313px !important;
    }
    .el-select-dropdown {
        max-width: 313px !important;
        .el-tabs {
            max-width: 313px !important;
        }
    }
    #tab-1 {
        padding-left: 20px !important;
    }
</style>
<style lang="less">
    body
    .ccc {
        max-height: 360px !important;
        max-width: 312px !important;
        min-width: 311px !important;
        .el-tabs {
            #tab-1 {
                padding-left: 20px !important;
            }
        }
    }
    .custom-tabs-class {
        max-width: 312px !important;
        min-width: 312px !important;
        #tab-1 {
            padding-left: 20px !important;
        }
        #tab-2 {
            padding-left: 20px !important;
        }
        #tab-3 {
            padding-left: 20px !important;
        }
        .el-tabs__nav-wrap:after {
            height: 1px !important;
        }
    }


</style>
