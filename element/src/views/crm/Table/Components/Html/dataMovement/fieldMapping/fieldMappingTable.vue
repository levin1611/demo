<template>
    <Select v-model="selected_item" @change="handleSelectedItem" @clear="handleRemovedItem" ref="aaa" clearable
            transfer-class-name="ccc" class="custom-select-class">
        <Tabs v-model="fieldBelong" class="custom-tabs-class">
            <TabPane label="客户管理" name="1" v-if="isShowCustomer">
                <Option v-for="(item, index) in fieldListInCustomer" :value="item"
                        :key="`${fieldIndex}customer${index}`"
                        :disabled="$store.state.crm.fieldsSelected.includes(item) ? true: false">{{item}}
                </Option>
            </TabPane>
            <TabPane label="联系人管理" name="2" v-if="isShowContact">
                <Option v-for="(item1, index1) in fieldListInContact" :value="item1"
                        :key="`${fieldIndex}customer${index1}`"
                        :disabled="$store.state.crm.fieldsSelected.includes(item1) ? true : false">{{item1}}
                </Option>
            </TabPane>
            <TabPane label="询盘管理" name="3" v-if="isShowInquiry">
                <Option v-for="(item2, index2) in fieldListInMyInquiry" :value="item2"
                        :key="`${fieldIndex}customer${index2}`"
                        :disabled="$store.state.crm.fieldsSelected.includes(item2) ? true : false">{{item2}}
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
            fieldListInMyInquiry: {
                type: Array,
                default() {
                    return [];
                }
            },
            fieldIndex: {
                type: Number
            },
            fileName: {
                type: String
            },
            fileCName: {
                type: String
            },
            fieldsInFiles: {
                type: String,
                default() {
                    return '';
                }
            },
            autoFiles: {
                type: String,
                default() {
                    return '';
                }
            }
        },
        data() {
            return {
                // fieldListInCustomer:[], //询盘云CRM中客户管理的所有字段
                // fieldListInContact:[], //询盘云CRM中联系人管理的所有字段
                // fieldListInMyInquiry:[], //询盘云CRM中询盘管理的所有字段
                isShowCustomer: true,
                isShowContact: true,
                isShowInquiry: true,
                objOuter: {},
                objMid: {},
                objInner: [],
                temp: [],
                fieldBelong: '1', // 当前显示的 Tab
                selected_item: '', // 选中项
                isInCustomer: false,
                isInContact: false,
                isInInquiry: false,
                selected_item_arr: []
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                fieldMappingData: state => state.crm.fieldMappingData,
                fieldsSelected: state => state.crm.fieldsSelected
            }),
            getFieldListInCustomer() {
                return this.fieldListInCustomer;
            }
        },
        methods: {
            /** 获取系统中所有的字段 */

            /** 获取文件对应模块关系 */
            getMods() {
                // let mods = this.$store.state.crm.fileToMods;
                const mods = localStorage.getItem('fileToMods') ? JSON.parse(localStorage.getItem('fileToMods')) : this.$store.state.crm.fileToMods;
                const modSelected = JSON.parse(JSON.stringify(mods));
                if (this.fileName in modSelected) {
                    this.isShowCustomer = modSelected[this.fileName].indexOf('1') !== -1;
                    this.isShowContact = modSelected[this.fileName].indexOf('2') !== -1;
                    this.isShowInquiry = modSelected[this.fileName].indexOf('3') !== -1;
                }
                if (this.isShowCustomer) {
                    this.fieldBelong = '1';
                }
                if (!this.isShowCustomer && this.isShowContact) {
                    this.fieldBelong = '2';
                }
                if (!this.isShowCustomer && !this.isShowContact && this.isShowInquiry) {
                    this.fieldBelong = '3';
                }
            },
            handleSelectedItem(val) {
                /* 再次检测当前模块(fieldBelong)下是否有对应的数据 */
                let flag = false;
                // 检查当前 fieldBelong 是否满足条件
                switch (this.fieldBelong) {
                    case '1':
                        if (this.isShowCustomer && this.fieldListInCustomer.some(item => item.trim().toLowerCase() === this.selected_item.trim().toLowerCase())) {
                            flag = true;
                        }
                        break;
                    case '2':
                        if (this.isShowContact && this.fieldListInContact.some(item => item.trim().toLowerCase() === this.selected_item.trim().toLowerCase())) {
                            flag = true;
                        }
                        break;
                    case '3':
                        if (this.isShowInquiry && this.fieldListInMyInquiry.some(item => item.trim().toLowerCase() === this.selected_item.trim().toLowerCase())) {
                            flag = true;
                        }
                        break;
                }
                // 当前 fieldBelong 不满足条件, 所以去其他 fieldBelong 下寻找是否满足条件
                if (!flag) {
                    [this.isShowCustomer, this.isShowContact, this.isShowInquiry].some((item, index) => {
                        if (item) {
                            return [this.fieldListInCustomer, this.fieldListInContact, this.fieldListInMyInquiry][index].some(field => {
                                if (field.trim().toLowerCase() === this.fieldsInFiles.trim().toLowerCase()) {
                                    this.fieldBelong = ['1', '2', '3'][index];
                                    flag = true;
                                    return true;
                                }
                            });
                        }
                    });
                }
                // 所有 fieldBelong 都不满足条件, 终止向下执行
                if (!flag) {
                    return;
                }

                const temp = {};
                temp[this.fileCName] = {};
                temp[this.fileCName][this.fieldIndex] = {};
                temp[this.fileCName][this.fieldIndex][this.fieldBelong] = this.selected_item;
                if (!['国家地区', '公司名称', '电话', '负责人', '创建时间', '创建人', undefined].includes(this.selected_item)) {
                    if (this.$store.state.crm.fieldsSelected.indexOf(this.selected_item) === -1) {
                        this.$store.state.crm.fieldsSelected.push(this.selected_item);
                    }
                }

                this.$store.commit('updateFieldMappingData', temp);
            },
            handleRemovedItem(val) {
                this.$store.state.crm.fieldsSelected.splice(this.$store.state.crm.fieldsSelected.indexOf(this.selected_item), 1);
            },
            // 重置映射\自助映射
            autoMapping() {
                // 如果是重置映射，则直接返回''
                if (this.$store.state.crm.resetAutoMapping) {
                    this.selected_item = '';
                    return false;
                }
                // 如果原本有值则不处理
                if (this.selected_item) {
                    return false;
                }
                // 如果已经映射过就不再处理
                if (!['国家地区', '公司名称', '电话', '负责人', '创建时间', '创建人'].includes(this.fieldsInFiles) && this.$store.state.crm.fieldsSelected.includes(this.fieldsInFiles)) {
                    return false;
                }
                // 自动映射
                // 若该映射的模块下仍有多个相同名称的字段，则优先取当前选择字段下拉列表中第一个相同名称的字段
                let flag = true;
                if (this.isShowCustomer) {
                    for (let i = 0; i < this.fieldListInCustomer.length; i++) {
                        if (this.fieldListInCustomer[i] && this.fieldListInCustomer[i].trim().toLowerCase() === this.fieldsInFiles.trim().toLowerCase()) {
                            flag = false;
                            this.selected_item = this.fieldListInCustomer[i];
                        }
                    }
                }
                if (this.isShowContact && flag) {
                    for (let i = 0; i < this.fieldListInContact.length; i++) {
                        if (this.fieldListInContact[i] && this.fieldListInContact[i].trim().toLowerCase() === this.fieldsInFiles.trim().toLowerCase()) {
                            flag = false;
                            this.selected_item = this.fieldListInContact[i];
                        }
                    }
                }
                if (this.isShowInquiry && flag) {
                    for (let i = 0; i < this.fieldListInMyInquiry.length; i++) {
                        if (this.fieldListInMyInquiry[i] && this.fieldListInMyInquiry[i].trim().toLowerCase() === this.fieldsInFiles.trim().toLowerCase()) {
                            flag = false;
                            this.selected_item = this.fieldListInMyInquiry[i];
                        }
                    }
                }
                this.handleSelectedItem();
            }


        },
        created() {
            // this.getAllFields();
            this.getMods();
            // this.getAllFields();
        },
        mounted() {},
        watch: {
            autoFiles: {
                handler: function(val) {
                    if (val && (['国家地区', '公司名称', '电话', '负责人', '创建时间', '创建人'].includes(val) || !this.$store.state.crm.fieldsSelected.includes(val))) {
                        this.selected_item = val;
                        // 触发select change事件
                        this.handleSelectedItem();
                    }
                },
                immediate: true
            },
            selected_item(oldVal, newVal) {
                // console.log('this is the old', oldVal);
                // console.log('this is the new', newVal);
                if (newVal !== undefined && this.$store.state.crm.fieldsSelected.indexOf(newVal) !== -1) {
                    this.$store.state.crm.fieldsSelected.splice(this.$store.state.crm.fieldsSelected.indexOf(newVal), 1);
                    // console.log(this.$store.state.crm.fieldsSelected,'???././././');
                }
            }

        }

    };
</script>

<style scoped lang="less">
    /*.ivu-select-dropdown{*/
    /*    max-width: 312px !important;*/
    /*}*/
    /*.ivu-select-dropdown{*/
    /*    max-height: 360px !important;*/
    /*}*/
    /*.field_mapping_dropdown{*/
    /*    max-height: 360px !important;*/
    /*}*/
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
