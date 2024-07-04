<template lang="html">
    <div class="">

        <div class="datewrap" style="height: 35px;line-height: 35px;position: relative;">
            <div class="title" style="line-height: normal;display: inline-block;">
                {{$t('authority.fieldPermis.assPermis')}}
                <HelpTip :title="$t('helpTip.assPermis')"></HelpTip>
            </div>
        </div>
        <p style="margin-bottom:20px;color:#b8b8b8" v-if="!readOnly">{{$t('authority.fieldPermis.assPermisInfo')}}</p>
        <Row style="max-width:700px;border:1px solid #b8b8b8" :style="{height:table_height}">
            <Col :span="6">
                <h2 style="text-align:center;background-color:#dadada;line-height:40px;font-size:14px">
                    {{$t('authority.fieldPermis.interface')}}</h2>
                <ul style="padding:10px 0" class="field" v-show="select_user.id">
                    <li v-for="(item, index) in field_interface" @click="get_field(item.id)"
                        :key="index"
                        :class="{cur:item.cur}">
                        <span>{{item.name}}</span>
                        <span style="float:right"></span>
                    </li>
                </ul>
            </Col>
            <Col :span="18"  v-loading="isSpinShow">
                <h2 style="text-align:center;background-color:#f0f0f0;line-height:40px;font-size:14px">
                    {{$t('authority.fieldPermis.fieldDes')}}</h2>
                <Row style="padding:20px 10px;" v-show="field_description.length !==0">
                    <Col :span="8" :offset="8">
                    <!-- 当为默认管理员时默认勾选 -->
                        <Checkbox v-if="select_user.name === $t('authority.fieldPermis.admin')?true:false"
                                  :value="true"
                                  disabled>
                        </Checkbox>
                        <Checkbox :indeterminate="indet_show"
                                  :value="check_show"
                                  v-else
                                  :disabled="readOnly ? true : (select_user.name === $t('authority.fieldPermis.admin')?true:false)"
                                  @click.prevent.native="handle_check_show">
                        </Checkbox>
                        <span>{{$t('authority.fieldPermis.show')}}</span>
                    </Col>
                    <Col :span="8">
                    <!-- 当为默认管理员时默认不勾选 -->
                        <Checkbox v-if="select_user.name === $t('authority.fieldPermis.admin')?true:false"
                                  :value="false"
                                  disabled>
                        </Checkbox>
                        <Checkbox :indeterminate="indet_read"
                                  :value="check_read"
                                  v-else
                                  :disabled="readOnly ? true : (select_user.name === $t('authority.fieldPermis.admin')?true:false || check_show_group.length > 0 ? false : true)"
                                  @click.prevent.native="handle_check_read">
                        </Checkbox>
                        <span>{{$t('authority.fieldPermis.read')}}</span>
                    </Col>
                    <Col :span="24">
                        <div ref='box' :style="{height:cell_height}" style="overflow-y:auto;overflow-x:hidden">
                            <Row>
                                <Col :span="8">
                                    <ul class="field_description_list">
                                        <li v-for="item in field_description" :key="item.id"
                                            :class="readOnly ? 'field_description-small': '' ">
                                            <template v-if="miniWordsLength(item.name)">
                                                <Tooltip trigger="hover" transfer :content="item.name" max-width="200">
                                                <span>{{item.name | miniWordsStr}}</span>
                                                </Tooltip>
                                            </template>
                                            <template v-else>
                                                <span>{{item.name}}</span>
                                            </template>
                                        </li>
                                    </ul>
                                </Col>
                                <Col :span="8">
                                    <!-- 当为默认管理员时默认全勾选 -->
                                   <div v-if="select_user.name === $t('authority.fieldPermis.admin')&&field_description.length!==0?true:false">
                                       <Checkbox v-for="(item,index) in field_description"
                                                  disabled
                                                  style="padding:10px 20px;width:100%"
                                                  :value="true"
                                                  :key="index">
                                            <span></span>
                                        </Checkbox>
                                   </div>
                                    <CheckboxGroup v-else  v-model="check_show_group" @change="check_show_group_change">
                                        <Checkbox v-for="(item,index) in field_description"
                                                  :disabled="readOnly ? true : (select_user.name === $t('authority.fieldPermis.admin')?true:false)"
                                                  style="padding:10px 20px;width:100%"
                                                  :label="item.storageName"
                                                  :key="index">
                                            <span></span>
                                        </Checkbox>
                                    </CheckboxGroup>
                                </Col>
                                <Col :span="8">
                                <!-- 当为默认管理员时默认全不勾选 -->
                                <div v-if="select_user.name === $t('authority.fieldPermis.admin')&&field_description.length!==0?true:false">
                                       <Checkbox v-for="(item,index) in field_description"
                                                  disabled
                                                  style="padding:10px 20px;width:100%"
                                                  :value="false"
                                                  :key="index">
                                            <span></span>
                                        </Checkbox>
                                   </div>
                                    <CheckboxGroup v-else v-model="check_read_group" @change="check_read_group_change">
                                        <Checkbox v-for="(item,index) in field_description"
                                                  :disabled="readOnly ? true : (check_show_group.indexOf(item.storageName) == -1?true:false || select_user.name !== $t('authority.fieldPermis.admin')?false:true)"
                                                  style="padding:10px 20px;width:100%"
                                                  :label="item.storageName"
                                                  :key="index">
                                            <span></span>
                                        </Checkbox>
                                    </CheckboxGroup>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { fieldPermissions } from '@/api/systemSettings/authority-management/index';
    const { getSelectedData, batchSave } = fieldPermissions;

    export default {
        props: {
            table_height: {
                type: String,
                default: '500px'
            },
            select_user: {
                type: Object
            },
            readOnly: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...mapState([
                'enterpriseId'
            ]),
            cell_height() {
                return `${parseInt(this.table_height) - 110}px`;
            }
        },
        filters: {
            // 超长字符用省略号...
            miniWordsStr(str) {
                let len = 0;
                let temp = 0;
                for (let i = 0; i < str.length; i++) {
                    const c = str.charCodeAt(i); // 单字节加1
                    if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
                        len++;
                    } else {
                        len += 2;
                    }
                    if (len <= 14) {
                        temp++;
                    }
                }
                if (len > 14) {
                    str = `${str.substring(0, temp)}...`;
                }
                return str;
            }
        },
        data() {
            return {
                defaultColumn: [], // 存默认字段
                customColumnShow: [], // 存自定义字段
                field_interface: [
                    {
                        name: this.$t('authority.fieldPermis.contactInfo'),
                        id: 2,
                        cur: true
                    },
                    {
                        name: this.$t('authority.fieldPermis.enquiryInfo'),
                        id: 3,
                        cur: false
                    },
                    {
                        name: this.$t('authority.fieldPermis.companyInfo'),
                        id: 1,
                        cur: false
                    }
                ],
                field_description: [], // 存所有字段的数据
                indet_show: false,
                check_show: false,
                indet_read: false,
                check_read: false,
                check_show_group: [],
                check_read_group: [],
                timer: null,
                change_select_type: false,
                open: false,
                parent_id: 2,
                isSpinShow: false
            };
        },
        methods: {
            // 判断字符是否超长溢出
            miniWordsLength(str) {
                let len = 0;
                let temp = 0;
                for (let i = 0; i < str.length; i++) {
                    const c = str.charCodeAt(i); // 单字节加1
                    if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
                        len++;
                    } else {
                        len += 2;
                    }
                    if (len <= 14) {
                        temp++;
                    }
                }
                if (len > 14) {
                    return true;
                } else {
                    return false;
                }
            },
            // 获取默认字段
            get_field(e) {
                // 每次切换时,将滚动条置顶
                this.$refs.box.scrollTop = 0;
                clearTimeout(this.timer);
                this.indet_show = false;
                this.check_show = false;
                this.isSpinShow = true;
                this.open = false;
                this.parent_id = parseInt(e);

                // 处理界面字段的选择(选中)
                const val = this.field_interface;
                for (let i = 0; i < val.length; i++) {
                    if (val[i].id === e) {
                        val[i].cur = true;
                    } else {
                        val[i].cur = false;
                    }
                }

                // 获取储存到data中的 默认字段
                const defaultColumn = this.defaultColumn;
                // 定义一个空数组,用来存符合 this.parent_id 的字段
                const arr = [];
                this.check_show_group = [];
                this.check_read_group = [];
                for (let i = 0; i < defaultColumn.length; i++) {
                    // 处理并显示到页面:当前符合 this.parent_id 的默认字段
                    if (parseInt(e) === parseInt(defaultColumn[i].parentId)) {
                        const obj = {};
                        obj.name = defaultColumn[i].cname;
                        obj.storageName = defaultColumn[i].storageName;
                        obj.parentId = defaultColumn[i].parentId;
                        obj.colType = defaultColumn[i].colType;
                        obj.type = 1;
                        obj.is_show = false;
                        obj.is_read = false;
                        arr.push(obj);
                    }
                };

                // 获取储存到data中的 自定义字段
                const customColumnShow = this.customColumnShow;
                // 定义一个空数组,用来存符合 this.parent_id 的字段
                const arr1 = [];
                for (const i in customColumnShow) {
                    // 处理并显示到页面:当前符合 this.parent_id 的自定义字段
                    if (parseInt(e) === parseInt(customColumnShow[i].parentId)) {
                        const obj = {};
                        obj.name = customColumnShow[i].cname;
                        obj.storageName = customColumnShow[i].storageName;
                        obj.parentId = customColumnShow[i].parentId;
                        obj.colType = customColumnShow[i].type;
                        obj.type = 2;
                        obj.is_show = false;
                        obj.is_read = false;
                        arr1.push(obj);
                    }
                }
                // 拼接默认字段和自定义字段
                const arr2 = arr.concat(arr1);
                this.field_description = arr2;

                // 【系统设置-权限管理-字段权限设置】应后端重构需求，当角色为默认管理员时，不再调用/new-privilege/manageField/getSelectedData接口，而是改为由前端处理"全部默认勾选"
                if (this.select_user.name !== this.$t('authority.fieldPermis.admin')) {
                    this.get_select_field(arr2);
                } else {
                    this.isSpinShow = false;
                }
            },
            // 点击左侧的角色(获取选中的字段)
            get_select_field(val) {
                getSelectedData({
                    roleId: parseInt(this.select_user.id),
                    parentId: this.parent_id
                })
                    .then(response => {
                        if (response.code === '1') {
                            const val1 = response.data.list;
                            for (const item of val) {
                                for (const check of val1) {
                                    if (item.storageName === check.storageName) {
                                        item.name = check.cname;
                                        item.storageName = check.storageName;
                                        item.parentId = check.parentId;
                                        item.type = check.type;
                                        item.colType = check.colType;
                                        item.is_show = check.isShow === 1;
                                        item.is_read = check.isOnlyRead === 1;
                                    }
                                }
                            }
                            const show_arr = [];
                            const read_arr = [];
                            for (let i = 0; i < val.length; i++) {
                                if (val[i].is_show) {
                                    show_arr.push(val[i].storageName);
                                }
                                if (val[i].is_read) {
                                    read_arr.push(val[i].storageName);
                                }
                            }

                            this.check_show_group = show_arr;
                            this.check_read_group = read_arr;
                            if (show_arr.length === this.field_description.length) {
                                this.indet_show = false;
                                this.check_show = true;
                            } else if (show_arr.length > 0) {
                                this.indet_show = true;
                                this.check_show = false;
                            } else {
                                this.indet_show = false;
                                this.check_show = false;
                            }

                            if (
                                read_arr.length === this.check_show_group.length &&
                                read_arr.length !== 0
                            ) {
                                this.indet_read = false;
                                this.check_read = true;
                            } else if (read_arr.length > 0) {
                                this.indet_read = true;
                                this.check_read = false;
                            } else {
                                this.indet_read = false;
                                this.check_read = false;
                            }
                            this.open = true;
                            this.isSpinShow = false;
                        }
                    });
            },
            set_arr(val) {
                let arr = [];
                arr = val.map(item => {
                    const obj = {};
                    obj.name = item.name;
                    obj.storageName = item.storageName;
                    obj.parentId = item.parentId;
                    obj.type = item.type;
                    obj.is_show = item.is_show;
                    obj.is_read = item.is_read;
                    return obj;
                });
                return arr;
            },
            check_show_group_change(data) {
                const val = this.field_description;
                if (data.length === val.length) {
                    this.indet_show = false;
                    this.check_show = true;
                } else if (data.length > 0) {
                    this.indet_show = true;
                    this.check_show = false;
                } else {
                    this.indet_show = false;
                    this.check_show = false;
                }
                if (this.open) {
                    this.set_timer(data, this.check_read_group);
                }
            },
            // 选择右侧显示
            handle_check_show() {
                // 在 部门与用户管理 页面时,field_box只做展示信息用，因此禁用所有多选框
                if (this.readOnly && this.select_user.name !== this.$t('authority.fieldPermis.admin')) {
                    return;
                };
                if (this.indet_show) {
                    this.check_show = false;
                } else {
                    this.check_show = !this.check_show;
                }
                this.indet_show = false;
                const val = this.field_description;
                const arr = [];
                for (let i = 0; i < val.length; i++) {
                    arr.push(val[i].storageName);
                }
                if (this.check_show) {
                    this.check_show_group = arr;
                } else {
                    this.check_show_group = [];
                }
                this.set_timer(this.check_show_group, this.check_read_group);
            },
            check_read_group_change(data) {
                const val = this.check_show_group;
                if (data.length === val.length && data.length !== 0) {
                    this.indet_read = false;
                    this.check_read = true;
                } else if (data.length > 0) {
                    this.indet_read = true;
                    this.check_read = false;
                } else {
                    this.indet_read = false;
                    this.check_read = false;
                }
                if (this.open) {
                    this.set_timer(this.check_show_group, data);
                }
            },
            // 选择右侧可读
            handle_check_read() {
                // 在 部门与用户管理 页面时,field_box只做展示信息用，因此禁用所有多选框
                if (this.readOnly && this.select_user.name !== this.$t('authority.fieldPermis.admin')) {
                    return;
                };
                // 在 字段权限设置 页面时,当左侧的 "显示" 未选中时,不向下继续操作
                if (!this.check_show && !this.readOnly) {
                    return;
                };
                if (this.indet_read) {
                    this.check_read = false;
                } else {
                    this.check_read = !this.check_read;
                }
                this.indet_read = false;
                const val = this.field_description;
                const arr = [];
                for (let i = 0; i < val.length; i++) {
                    if (this.check_show_group.indexOf(val[i].storageName) !== -1) {
                        arr.push(val[i].storageName);
                    }
                }
                if (this.check_read) {
                    this.check_read_group = arr;
                } else {
                    this.check_read_group = [];
                }
                this.set_timer(this.check_show_group, this.check_read_group);
            },
            // 右侧字段的选择与保存
            set_save(val1, val2) {
                const arr = [];
                const arr1 = this.field_description;
                for (let i = 0; i < arr1.length; i++) {
                    if (val1.indexOf(arr1[i].storageName) !== -1) {
                        arr1[i].is_show = true;
                    } else {
                        arr1[i].is_show = false;
                    }
                    if (val2.indexOf(arr1[i].storageName) !== -1) {
                        arr1[i].is_read = true;
                    } else {
                        arr1[i].is_read = false;
                    }
                    const obj = {};
                    (obj.roleId = parseInt(this.select_user.id)),
                    (obj.orgId = this.enterpriseId),
                    (obj.parentId = this.parent_id),
                    (obj.storageName = arr1[i].storageName),
                    (obj.cname = arr1[i].name),
                    (obj.type = arr1[i].type),
                    (obj.isShow = arr1[i].is_show ? 1 : 0),
                    (obj.isOnlyRead = arr1[i].is_read ? 1 : 0),
                    (obj.colType = arr1[i].colType),
                    arr.push(obj);
                }
                batchSave(arr)
                    .then(response => {
                        if (response.code === '1') {
                            this.change_select_type = false;
                        }
                    });
            },
            set_timer(val1, val2) {
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.set_save(val1, val2);
                }, 600);
            },
            change_select() {
                this.change_select_type = true;
            }
        },
        watch: {
            async select_user(val) {
                await this.$commonApi.getAllColumns({
                    orgId: this.enterpriseId,
                    parentId: 0,
                    moduleType: 1
                }).then(data => {
                    if (data.code === '1') {
                        // 储存默认字段
                        this.defaultColumn = data.data.defaultColumn;
                        // 储存自定义字段
                        this.customColumnShow = data.data.customColumn.show;
                    }
                });

                if (this.select_user) {
                    this.field_description = [];
                    this.check_show_group = [];
                    this.check_read_group = [];
                    this.field_interface = [
                        {
                            name: this.$t('authority.fieldPermis.contactInfo'),
                            id: 2,
                            cur: false
                        },
                        {
                            name: this.$t('authority.fieldPermis.enquiryInfo'),
                            id: 3,
                            cur: false
                        },
                        {
                            name: this.$t('authority.fieldPermis.companyInfo'),
                            id: 1,
                            cur: false
                        }
                    ];
                    this.open = false;
                    this.parent_id = 2;
                    this.get_field(this.parent_id);
                } else {
                    this.isSpinShow = false;
                }
            },
            check_show_group(val) {
                let read = this.check_read_group;
                if (val.length === 0) {
                    this.check_read_group = [];
                    read = [];
                } else {
                    for (let i = 0; i < read.length; i++) {
                        if (val.indexOf(read[i]) === -1) {
                            read.splice(i, 1);
                        }
                    }
                }
                if (read.length === this.check_show_group.length && read.length !== 0) {
                    this.indet_read = false;
                    this.check_read = true;
                } else if (read.length > 0) {
                    this.indet_read = true;
                    this.check_read = false;
                } else {
                    this.indet_read = false;
                    this.check_read = false;
                }
            }
        }
    };
</script>

<style lang="css" scoped>
.title {
  margin: 10px 0;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.8);
}

ul li {
  list-style: none;
  padding: 10px 20px;
}

/* 保证字段说明左侧和右侧的CheckBox高度一致 */
.field_description_list li{
  height: 44px;
}

ul .field_description-small {
  list-style: none;
  padding: 11px 20px;
}

.field li {
  cursor: pointer;
}

.field li:hover {
  background-color: #f4f4f4;
}

.field li:hover span {
  color: #4285f4;
}

.field {
  padding: 10px 0;
}

.cur {
  background-color: #f4f4f4;
}

.cur span {
  color: #4285f4;
}
</style>
