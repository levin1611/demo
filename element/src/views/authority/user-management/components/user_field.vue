<template>
    <div>
        <div v-if="!field_id">
            <!-- 暂无数据 -->
            {{$t('crm.Table.noData')}}
        </div>
        <div v-else>
            <div class="field-list">
                <Button round :class="(item.fieldId === current_field_id)  ? 'active': ''"
                        v-for="item in fieldList" :key="item.fieldId" @click="changeRole(item.fieldId, item.fieldName)">
                    {{item.fieldName}}
                </Button>
            </div>
            <fieldBox
                    :table_height="table_height"
                    :select_user="select_user"
                    :readOnly="readOnly">
            </fieldBox>
        </div>
    </div>
</template>
<script>
    import fieldBox from '@/views/authority/field-permissions/field_box.vue';
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                select_user: {},
                user_list: [],
                field_id: 0, // 字段角色id
                field_name: null, // 字段角色name,
                current_field_id: 0, // 当前字段角色id,
                current_field_name: null, // 当前字段角色name
                readOnly: true // 当前页面下，field_box只做展示信息用，因此禁用所有多选框
            };
        },
        props: {
            userInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
            content_height: {
                type: String,
                default: '800px'
            }
        },
        components: {
            fieldBox
        },
        computed: {
            ...mapState([
                'enterpriseId'
            ]),
            table_height() {
                return `${parseInt(this.content_height) - 200}px`;
            },
            fieldList() {
                if (this.field_id && this.field_name) {
                    const fieldNameList = this.field_name.split(',');
                    const fieldIdList = this.field_id.split(',');
                    const fieldList = fieldNameList.map((item, index) => {
                        return {
                            fieldName: item,
                            fieldId: fieldIdList[index]
                        };
                    });
                    this.current_field_id = fieldList[0].fieldId;
                    this.current_field_name = fieldList[0].fieldName;
                    return fieldList;
                }
            }
        },
        created() {
            this.get_user();
        },
        methods: {
            get_user() {
                this.user_list = [];
                this.$commonApi.getFieldAllByPage({
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        const val = response.data.data;
                        let arr = [];
                        const arr1 = [];
                        const arr2 = [];
                        for (let i = 0; i < val.length; i++) {
                            const obj = {};
                            if (val[i].name === '默认管理员') {
                                obj.name = val[i].name;
                                obj.id = val[i].id;
                                obj.personCount = val[i].personCount;
                                if (JSON.stringify(this.select_user) === '{}' || this.select_user.id === val[i].id) {
                                    obj.cur = true;
                                } else {
                                    obj.cur = false;
                                }
                                arr1.push(obj);
                            } else {
                                if (this.select_user.id === val[i].id) {
                                    obj.name = val[i].name;
                                    obj.id = val[i].id;
                                    obj.personCount = val[i].personCount;
                                    obj.cur = true;
                                    arr2.push(obj);
                                } else {
                                    obj.name = val[i].name;
                                    obj.id = val[i].id;
                                    obj.personCount = val[i].personCount;
                                    obj.cur = false;
                                    arr2.push(obj);
                                }
                            }
                        }
                        arr = arr1.concat(arr2);
                        this.user_list = arr;
                        // 此处 == 不可换成 ===
                        this.select_user = arr.find(item => item.id == this.current_field_id);
                    }
                });
            },
            changeRole(fieldId, fieldName) {
                this.current_field_id = fieldId;
                this.current_field_name = fieldName;
                this.get_interface(fieldId, fieldName);
            },
            get_interface(id, name) {
                for (let i = 0; i < this.user_list.length; i++) {
                    this.user_list[i].cur = false;
                    if (this.user_list[i].id === id) {
                        this.user_list[i].cur = true;
                    }
                }
                const obj = {};
                obj.id = id;
                obj.name = name;
                this.select_user = obj;
            }
        },
        watch: {
            userInfo: {
                handler() {
                    this.field_id = this.userInfo.fieldId;
                    this.field_name = this.userInfo.field_permissions;
                },
                immediate: true
            }
        }
    };
</script>
<style lang="less" scoped>
    .field-list {
        margin-left: 10px;
        padding-bottom: 10px;
        .active {
            border: 1px solid #4285f4;
            color: #4285f4;
            padding: 3px 12px 3px;
            box-shadow: none;
        }
    }
</style>
