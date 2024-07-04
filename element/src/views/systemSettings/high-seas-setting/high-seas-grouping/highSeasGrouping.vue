<template>
    <div class="seas-group">
        <!-- 客户公海分组 - 开关 -->
        <div class="seas-group-item">
            <div class="seas-group-item-title">
                <div style="height: 52px;padding-top: 10px;">
                    <span style="margin-right: 20px;font-weight: 500;font-size: 14px;color: rgba(0, 0, 0, .8);">{{$t('highSeasSetting.customerPoolGrouping')}}</span>
                    <el-switch v-model="highSeasGroupSwitchStatus" @change="onRuleChange"></el-switch>
                </div>
                <!-- 新建/编辑状态下,'新建分组'按钮不可点 -->
                <div style="display: inline-block;padding-top: 3px;">
                    <Button type="primary"
                        :style="isAddBtn?'color: rgba(110, 129, 154, 0.4);background: #E7ECF2;border-color:#E7ECF2;':''"
                        style="padding-bottom: ;"
                        @click="addCustomerGroup"
                        :disabled="isAddBtn">
                        {{$t('highSeasSetting.addGroup')}}
                    </Button>
                </div>
            </div>
        </div>
        <!-- 客户公海分组 -->
        <Row style="height: calc(100vh - 208px);">
            <Col :span="4" style="border: 1px solid #EBEEF5;height: 100%;">
                <!-- 分组列表 -->
                <div style="font-weight: 500;height: 44px;line-height: 44px;border-bottom: 1px solid #EBEEF5;padding: 0 20px;">{{$t('highSeasSetting.groupedList')}}</div>
                <Menu :default-active="id"
                      ref="universal_set_menu"
                      @select="change_view"
                      active-text-color="rbga(0, 0, 0, 0.8)"
                      class="universal-set-menu">
                      <!-- border-right: 1px solid rgb(235, 238, 245); -->
                    <MenuItem v-for="item in groupList"
                              :key="item.id"
                              :index="String(item.id)"
                              style="display: flex;justify-content: space-between;font-weight: 400;font-size: 12px;">
                            <!-- <Tooltip
                                trigger="hover"
                                transfer
                                placement="top"
                                :content="item.seasGroupName"> -->
                            <span style="overflow: hidden;text-overflow:ellipsis;white-space: nowrap;max-width: 180px;color: rbga(0, 0, 0, 0.4);">{{item.seasGroupName}}</span>
                            <!-- </Tooltip> -->
                        <span style="color: rgba(0, 0, 0, .8);" v-if="item.openSeasGroup===1">{{$t('highSeasSetting.on')}}</span>
                        <span style="color: rgba(0, 0, 0, .4);" v-else>{{$t('highSeasSetting.close')}}</span>
                    </MenuItem>
                </Menu>
            </Col>
            <Col :span="20" style="position: relative;height: 100%;">
                <!-- 默认没有数据 -->
                <!-- !groupList.length && !isAddBtn -->
                <div v-if="!groupList.length && !isAddBtn" class="content">
                    <div style="height: 680px; display: flex;justify-content: center;flex-direction: column;align-items: center;">
                        <img style="margin-bottom: 20px;" src="@/svg/no-data.svg">
                        <div style="height: 18px;line-height: 18px;color: rgba(0, 0, 0, .4)">暂无公海客户分组</div>
                        <div style="height: 18px;line-height: 18px;color: #3B78DE;cursor: pointer;" @click="addCustomerGroup">{{$t('highSeasSetting.addGroup')}}</div>
                    </div>
                </div>
                <!-- 新建、显示已有的数据 -->
                <div v-else class="content">
                    <!-- 提示信息 -->
                    <div style="line-height: 18px;height:18px;">{{$t('highSeasSetting.hint')}}</div>
                    <div style="line-height: 18px;height:18px;">{{$t('highSeasSetting.hint1')}}</div>
                    <div style="line-height: 18px;height:18px;">{{$t('highSeasSetting.hint2')}}</div>
                    <div style="line-height: 18px;height:18px;">{{$t('highSeasSetting.hint3')}}</div>
                    <div style="line-height: 18px;height:18px;">{{$t('highSeasSetting.hint4')}}</div>
                    <div style="line-height: 18px;height:18px;">{{$t('highSeasSetting.hint5')}}</div>

                    <!-- 分组开关 -->
                    <div style="margin: 10px 0;line-height: 20px;height: 20px;">
                        <el-switch :disabled="!editStatus" v-model="openSeasGroup"></el-switch>
                        <span style="margin-left: 8px;">{{openSeasGroup?'开启':'关闭'}}</span>
                    </div>

                    <div style="margin: 10px 0;font-weight: 500;">{{$t('highSeasSetting.groupInformation')}}</div>

                    <div style="margin: 10px 0;" class="asterisk-pseudo-class">{{$t('highSeasSetting.groupName')}}
                        <Input
                            v-model="seasGroupName"
                            @blur="clearTrim"
                            :placeholder="$t('authority.adminPermis.enter_some')"
                            :disabled="!editStatus"
                            maxlength="40"
                            clearable
                            style="width: 500px;margin-left: 20px;font-size: 12px;"/>
                    </div>
                    <template v-if="!this.defaultId.includes(this.id)">
                        <!-- 筛选条件 且 -->
                        <div v-for="(add, index) in addCondition" :key="index" style="margin: 10px 0;">
                            <span class="asterisk-pseudo-class">{{$t('highSeasSetting.filterConditions')}}</span>
                            <Select
                                v-model="add.condition1"
                                @change="computed_addChangeCon1(index)"
                                :disabled="!editStatus"
                                popper-class="selectBox"
                                style="width: 100px;text-align: left;margin-left: 20px;">
                                <Option v-for="item in add.conditionList1"
                                        :key="item.field"
                                        :value="item.field"
                                        :label="item.fieldName"></Option>
                            </Select>
                            <span style="margin: 0 10px;">{{$t('highSeasSetting.value')}}</span>
                            <Select
                                v-model="add.condition2"
                                @change="computed_addChangeCon2(index, add.condition2)"
                                :disabled="!editStatus"
                                popper-class="selectBox"
                                style="width: 150px;text-align: left;">
                                <Option v-for="item in add.conditionList2"
                                        :value="item.value"
                                        :label="item.label"></Option>
                            </Select>
                            <div style="display:inline-block; width: 300px; margin-left: 12px;">
                                <template v-if="add.inputType === 'string'">
                                    <Input v-model="add.condition3"
                                        :placeholder="$t('crm.Table.tip_addKeywords')"
                                        :disabled="!editStatus"
                                        style="width:100%;"></Input>
                                </template>
                                <template v-else-if="add.inputType === 'number'">
                                    <InputNumber :min="0" :max="['starLevel', 'cpStarLevel'].includes(add.condition1) ? 5 : Infinity" v-model="add.condition3"
                                                :placeholder="$t('crm.Table.tip_inputNumber')"
                                                :disabled="!editStatus"
                                                style="width:100%;">
                                    </InputNumber>
                                </template>
                                <template v-else-if="add.inputType === 'numberRange'">
                                    <numberRange :condition1="add.condition1" :condition3="add.condition3" :disabled="!editStatus" v-model="add.condition3"></numberRange>
                                </template>
                                <template v-else-if="add.inputType === 'boolean'">
                                    <Select v-model="add.condition3"
                                            :disabled="!editStatus"
                                            style="width:100%;">
                                        <template v-if="['gender', 'ctGender'].includes(add.condition1)">
                                            <Option v-for="n in 2" :value="n"
                                                    :label="n === 1 ? $t('crm.Modal.male') : n === 2 ? $t('crm.Modal.female') : ''"></Option>
                                        </template>
                                        <template v-else>
                                            <Option v-for="n in 2" :value="n" :label="n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : ''">
                <!--                                {{ n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : '' }}-->
                                            </Option>
                                        </template>
                                    </Select>
                                </template>
                                <template v-else-if="add.inputType === 'booleanSelect'">
                                    <Select v-model="add.condition3"
                                        key="booleanSelect"
                                        :disabled="!editStatus"
                                        style="width:100%;">
                                        <template v-if="['gender', 'ctGender'].includes(add.condition1)">
                                            <Option v-for="n in 2" :value="n"
                                                    :label="n === 1 ? $t('crm.Modal.male') : n === 2 ? $t('crm.Modal.female') : ''"></Option>
                                        </template>
                                        <template v-else>
                                            <Option v-for="n in 2" :value="n" :label="n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : ''">
                <!--                                {{ n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : '' }}-->
                                            </Option>
                                        </template>
                                    </Select>
                                </template>
                                <template v-else-if="add.inputType === 'booleanMultSelect'">
                                    <Select v-model="add.condition3"
                                        key="booleanMultSelect"
                                        :disabled="!editStatus"
                                        multiple
                                        collapse-tags
                                        style="width:100%;">
                                        <template v-if="['gender', 'ctGender'].includes(add.condition1)">
                                            <Option v-for="n in 2" :value="n"
                                                    :label="n === 1 ? $t('crm.Modal.male') : n === 2 ? $t('crm.Modal.female') : ''"></Option>
                                        </template>
                                        <template v-else>
                                            <Option v-for="n in 2" :value="n" :label="n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : ''">
                <!--                                {{ n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : '' }}-->
                                            </Option>
                                        </template>
                                    </Select>
                                </template>
                                <template v-else-if="add.inputType === 'array'">
                                    <Select v-model="add.condition3" multiple
                                        key="multiple"
                                        filterable
                                        collapse-tags
                                        style="width:100%;"
                                        :disabled="!editStatus"
                                        class="manager-select">
                                        <Option v-for="item in add.conditionList3"
                                            :value="item.key"
                                            :label="item.value"
                                        ></Option>
                                    </Select>
                                </template>
                                <template v-else-if="add.inputType === 'countryArea'">
                                    <!-- <CountryAreaSelect :countryArea.sync="add.condition3"
                                        :countryAreaName.sync="add.countryAreaName"
                                        :disabled="!editStatus"
                                        ref="countryArea"
                                        style="width: 100%;"></CountryAreaSelect> -->
                                        <countryAreaSelect
                                            ref="countryAreaSelect"
                                            class="searchCountry"
                                            :disabled="!editStatus"
                                            :placeholder="$t('highSeasSetting.pleaseChoose')"
                                            :multiple="['$in', '$nin'].includes(add.condition2) ? true : false"
                                            :collapseTags="['$in', '$nin'].includes(add.condition2) ? true : false"
                                            @updateCountry="selectCountry(arguments, index)"
                                            :country="add.condition3"
                                        ></countryAreaSelect>
                                </template>
                                <template v-else-if="add.inputType === 'commonUserSelect'">
                                    <commonUserSelect :disabled="!editStatus"
                                        :companyName="companyName"
                                        :departmentListUsedByUser="departmentListUsedByUser"
                                        :departmentList="departmentList"
                                        :roleList="roleList"
                                        :userList="userList"
                                        :value.sync="add.condition3"
                                        :selectStyle="{ width: '100%' }"
                                        :collapseTags="true"
                                        dataFormat="Object"></commonUserSelect>
                                </template>
                                <template v-else-if="add.inputType === 'select'">
                                    <Select v-model="add.condition3"
                                        key="single"
                                        filterable
                                        :disabled="!editStatus"
                                        class="manager-select"
                                        style="width:100%;">
                                        <Option v-for="item in add.conditionList3"
                                                :value="item.key"
                                                :label="item.value"
                                                ></Option>
                                    </Select>
                                </template>
                                <!-- 使用v-show避免日期选择框定位问题 -->
                                <span v-show="add.inputType === 'dateRange'">
                                    <DatePicker v-model="add.condition3"
                                                type="daterange"
                                                :disabled="!editStatus"
                                                placement="bottom-end"
                                                :placeholder="$t('crm.Table.tip_selectTime')"
                                                ref="dateRange"
                                                style="width: 100%;"></DatePicker>
                                </span>
                                <!-- 使用v-show避免日期选择框定位问题 -->
                                <span v-show="add.inputType === 'date'">
                                    <DatePicker v-model="add.condition3"
                                                type="date"
                                                :disabled="!editStatus"
                                                placement="bottom-end"
                                                :placeholder="$t('crm.Table.tip_selectTime')"
                                                ref="date"
                                                style="width: 100%;"></DatePicker>
                                </span>
                            </div>
                            <!-- 删除icon -->
                            <Icon v-if="editStatus" custom="custom custom-delete-new" style="cursor: pointer;color: #64758D; margin-left:12px" @click="deleteFilter(index)" size="12" />
                        </div>

                        <!-- 添加条件 -->
                        <div style="margin: 10px 0;">
                            <Button v-if="addCondition.length < 3"
                                type="text"
                                @click="handleAddConditions"
                                :disabled="!editStatus"
                                style="color: #3B78DE;margin-left: 93px;">
                                    {{$t('highSeasSetting.addCondition')}}
                            </Button>
                        </div>
                    </template>
                    <template v-else>
                        <div style="margin: 10px 0;">
                            <span class="asterisk-pseudo-class">{{$t('highSeasSetting.filterConditions')}}</span>
                            <span style="margin-left: 20px;">{{$t('highSeasSetting.defaultValue')}}</span>
                        </div>
                    </template>

                    <div style="margin: 10px 0;font-weight: 500;">{{$t('highSeasSetting.permissionToView')}}</div>

                    <div style="margin: 10px 0;" class="asterisk-pseudo-class">{{$t('highSeasSetting.permissionToView')}}:
                        <commonUserSelect :disabled="!editStatus"
                            :companyName="companyName"
                            :departmentListUsedByUser="departmentListUsedByUser"
                            :departmentList="departmentList"
                            :roleList="roleList"
                            :userList="userList"
                            @refreshTreeData="refreshTreeData"
                            style="margin-left: 23px;"
                            :collapseTags="true"
                            :selectStyle="{ width: '500px' }"
                            :value.sync="value" dataFormat="Object"></commonUserSelect>
                    </div>
                </div>
                <!-- 确定、取消按钮 -->
                <div v-if="groupList.length&&!editStatus" style="z-index: 10;background: #ffffff;line-height: 55px;height: 55px;width: 98%;position: absolute;bottom: 10px;left: 20px;">
                    <Button type="primary" @click="editStatus=true">
                        {{$t('highSeasSetting.edit')}}
                    </Button>
                    <span v-if="!this.defaultId.includes(this.id)" style="font-size: 14px;color: #EA4335;position: absolute;bottom: 0;right: 50px;cursor: pointer;" @click="deleteGroupModal=true">
                        {{$t('highSeasSetting.delete')}}
                    </span>
                </div>
                <div v-else-if="editStatus" style="z-index: 10;background: #ffffff;line-height: 55px;height: 55px;width: 98%;position: absolute;bottom: 10px;left: 20px;">
                    <Button type="primary" @click="handleSave" :loading="saveLoading">
                        {{$t('highSeasSetting.save')}}
                    </Button>
                    <Button @click="cancelSave">
                        {{$t('highSeasSetting.cancel')}}
                    </Button>
                </div>
            </Col>
        </Row>

        <!-- 删除分组 -->
        <Modal
            :visible.sync="deleteGroupModal"
            :title="$t('editSure')"
            width="500px"
            :append-to-body="true"
            :modal-append-to-body="false"
        >
        <div style="margin-bottom: 20px">
            {{$t('highSeasSetting.sureToDeleteThisGroup')}}
        </div>
        <div slot="footer">
            <Button size="small" @click="deleteGroupModal=false">{{
            $t("cancel")
            }}</Button>
            <Button size="small" type="primary" @click="deleteGroup">{{
            $t("confirm")
            }}</Button>
        </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { TOP_FILTER_ITEM } from '@/api/config';
    import commonUserSelect from '@/views/main-components/commonUserSelect/commonUserSelect.vue';
    import numberRange from '@/views/crm/Table/Components/Html/numberRange';
    import commonUserSelectData from '@/views/main-components/commonUserSelect/mixin/commonUserSelectData.js';
    import countryAreaSelect from '@/views/systemSettings/high-seas-setting/high-seas-grouping/countryAreaSelect.vue';
    import { highSeasGroup } from '@/api/systemSettings/high-seas-grouping/index';
    const { getSet, updateHighseasGroupOpen, getList, insertOrUpdate, deleteGroup, seasGroupCondition } = highSeasGroup;
    export default {
        name: 'highSeasGrouping',
        mixins: [commonUserSelectData],
        components: {
            commonUserSelect,
            countryAreaSelect,
            numberRange
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            }) // 从 vuex 中获取属性
        },
        data() {
            return {
                deleteGroupModal: false, // 删除分组时的确认modal阈值
                editStatus: false, // 是否可以编辑当前
                saveLoading: false, // 保存时的loading
                // 查询到的所有的分组列表数据
                groupList: [],
                // 默认检索条件
                groupCondition: [],
                // 检索条件集合
                addCondition: [],
                // 查看权限(部门列表)
                limits: [],
                isAddBtn: false, // 是否点击新建分组
                value: [], // 查看权限的数组
                openSeasGroup: false, // 新建分组时,分组开启、关闭状态
                highSeasGroupSwitchStatus: false, // 公海分组按钮状态
                seasGroupName: '', // 分组名称
                id: '',
                defaultId: []
            };
        },
        created() {
            // 后端按负的企业id做默认分组
            this.defaultId.push(`-${this.enterpriseId}`);
            this.getSet();
            this.getSeasGroupCondition();
            this.getDepartmentList();
            this.getRoleList();
            this.getUserList();
        },
        methods: {
            // 分组名称失去焦点后,去除首尾的空格
            clearTrim() {
                this.seasGroupName = this.seasGroupName.trim();
            },
            // 接收子组件传给父组件 的国家地区
            selectCountry(arg, index) {
                this.addCondition[index].condition3 = arg[0];
            },
            // 删除筛选条件
            deleteFilter(index) {
                this.addCondition.forEach((item, itemIndex) => {
                    if (index === itemIndex) {
                        // 删除当前的筛选条件
                        this.addCondition.splice(itemIndex, 1);
                    };
                });
            },
            // 删除分组
            deleteGroup() {
                this.deleteGroupModal = false;
                deleteGroup({
                    id: Number(this.id)
                }).then(response => {
                    if (response.code === '1') {
                        // 删除的时候,需要选中上一个公海分组
                        // 1. 先获取当前删除的公海分组的下标
                        // const deleteIdIndex = this.idArr.indexOf(Number(this.id));
                        // 2. 根据前删除的公海分组的下标,获取删除的公海分组前一个 id
                        // const previousId = this.idArr[deleteIdIndex - 1];
                        // 3. 将id传给getList方法
                        // this.getList('first', previousId);

                        // 删除的时候,选中第一个公海分组
                        this.getList();
                    };
                }).catch(error => {
                    console.error(error);
                });
            },
            // 取消保存
            cancelSave() {
                this.isAddBtn = false;
                this.editStatus = false;
                this.getList(this.id);
            },
            // 获取公海客户分组使用开关是否打开接口
            getSet() {
                getSet().then(response => {
                    if (response.code === '1') {
                        this.highSeasGroupSwitchStatus = response.data.isOpen === 1;
                    };
                }).catch(error => {
                    console.error(error);
                });
            },
            // 查询设置页面公海数据分组数据
            getList(currentId) {
                getList().then(response => {
                    if (response.code === '1') {
                        this.isAddBtn = false;
                        const data = response.data;
                        // 查询所有的数据
                        this.groupList = data;
                        if (currentId) {
                            this.change_view(String(currentId));
                        } else {
                            this.change_view(String(this.groupList[0].id));
                        }
                    };
                }).catch(error => {
                    console.error(error);
                });
            },
            // 公海分组查询筛选条件
            getSeasGroupCondition() {
                seasGroupCondition().then(response => {
                    if (response.code === '1') {
                        this.groupCondition = response.data;
                        // 获取分组列表
                        this.getList();
                    }
                }).catch(error => {
                    console.error(error);
                });
            },
            // 点击 +添加条件
            handleAddConditions() {
                this.addCondition.push({
                    condition1: '',
                    conditionList1: this.$deepClone(this.groupCondition),
                    condition2: '',
                    conditionList2: [],
                    condition3: '',
                    conditionList3: [],
                    inputType: 'string'
                });
            },
            // 切换不同的分组
            change_view(name) {
                // 是否可以编辑当前
                this.editStatus = false;
                // 置空检索条件集合
                this.addCondition = [];
                this.value = [];
                let conditionsJson = null;
                this.saveLoading = false; // 取消保存按钮的loading

                // 新建状态为false
                this.isAddBtn = false;
                this.id = name;
                const group = this.groupList.find(item => item.id === Number(name));
                if (group) {
                    // 开关
                    this.openSeasGroup = group.openSeasGroup === 1;
                    // 名称
                    this.seasGroupName = group.seasGroupName;
                    // 查看权限(部门)
                    this.limits = JSON.parse(group.limitsJson);
                    for (const i in this.limits) {
                        if (i === 'deptArr') {
                            this.limits[i].forEach(item => {
                                this.value.push({
                                    type: 'department',
                                    value: item.deptId,
                                    label: item.deptName
                                });
                            });
                        } else if (i === 'roleArr') {
                            this.limits[i].forEach(item => {
                                this.value.push({
                                    type: 'role',
                                    value: item.roleId,
                                    label: item.roleName
                                });
                            });
                        } else if (i === 'userArr') {
                            this.limits[i].forEach(item => {
                                this.value.push({
                                    type: 'user',
                                    value: item.userId,
                                    label: item.userName
                                });
                            });
                        }
                    };
                    // 处理筛选条件
                    if (!this.defaultId.includes(this.id)) {
                        conditionsJson = JSON.parse(group.conditionsJson);
                        conditionsJson.forEach((cond, index) => {
                            this.handleAddConditions();
                            const condition1 = cond.condition.fieldKey;
                            const selectType = cond.condition.selectType;
                            const condition2 = cond.decide;
                            let condition3 = null;
                            if (['$null', '$nnull'].includes(condition2)) {
                                condition3 = '-1';
                            } else {
                                condition3 = [];
                                cond.optValue.forEach(opt => {
                                    // 国家地区单独处理,国家地区不使用select使用的是单独的搜索组件
                                    if (condition1 === 'countryArea') {
                                        // condition3 = opt.key;
                                        condition3.push(opt);
                                    } else if (['createUserId', 'companyManagersBefore'].includes(condition1)) {
                                        if (opt.deptArr && opt.deptArr.length) {
                                            opt.deptArr.forEach(deptArr => {
                                                condition3.push({
                                                    type: 'department',
                                                    value: deptArr.key,
                                                    label: deptArr.value
                                                });
                                            });
                                        }
                                        if (opt.roleArr && opt.roleArr.length) {
                                            opt.roleArr.forEach(roleArr => {
                                                condition3.push({
                                                    type: 'role',
                                                    value: roleArr.key,
                                                    label: roleArr.value
                                                });
                                            });
                                        }
                                        if (opt.userArr && opt.userArr.length) {
                                            if (['$eq', '$ne'].includes(condition2)) {
                                                condition3 = opt.userArr[0].key;
                                            } else {
                                                opt.userArr.forEach(userArr => {
                                                    condition3.push({
                                                        type: 'user',
                                                        value: Number(userArr.key),
                                                        label: userArr.value
                                                    });
                                                });
                                            }
                                        }
                                    } else {
                                        if (['$eq', '$ne', '$lt', '$gt', '$gte', '$lte'].includes(condition2) || ['text', 'textarea'].includes(selectType)) {
                                            condition3 = opt.key;
                                        } else {
                                            condition3.push(opt.key);
                                        }
                                    }
                                });
                            }
                            this.addCondition[index].condition1 = condition1;
                            this.computed_addChangeCon1(index);
                            this.$nextTick(() => {
                                this.addCondition[index].condition2 = condition2;
                                this.computed_addChangeCon2(index);
                                this.$nextTick(() => {
                                    this.addCondition[index].condition3 = this.$deepClone(condition3);
                                });
                            });
                        });
                    }
                };
            },
            // 新建分组
            addCustomerGroup() {
                // 如果长度判断当前已创建分组是否到达上限50个,若到达上限,弹出错误提示语:最多创建50个分组。
                // 若未到达上限，变为新建状态。
                if (this.groupList.length >= 50) {
                    this.$Message.error('最多创建50个分组');
                    return;
                };
                this.saveLoading = false; // 取消保存按钮的loading

                this.id = '';
                this.openSeasGroup = false;
                this.seasGroupName = '';
                this.value = [];
                this.editStatus = true;

                // 新建状态为true
                this.isAddBtn = true;
                // 置空检索条件集合
                this.addCondition = [];
            },
            // 当switch关闭且id存在时需要调用更新设置接口
            onRuleChange(val) {
                updateHighseasGroupOpen({
                    isOpen: this.highSeasGroupSwitchStatus ? 1 : 0 // 是否开启 1 是 0 否
                }).then(response => {
                    if (response.code === '1' && val) {
                        this.$Message.success('开启成功');
                    };
                }).catch(error => {
                    console.error(error);
                });
            },
            // 获取设置
            computed_addChangeCon1(index) {
                const temp = this.groupCondition.find(item => item.field === this.addCondition[index].condition1);
                // 给选项赋值
                if (temp) {
                    this.addCondition[index].conditionList3 = temp.optionValue;
                }
                switch (this.addCondition[index].condition1) {
                    case 'countryArea':
                        this.addCondition[index].conditionList2 = [
                            ...TOP_FILTER_ITEM.settingContrySelect
                        ];
                        this.addCondition[index].condition2 = '$eq';
                        this.addCondition[index].inputType = 'countryArea';
                        this.addCondition[index].condition3 = '';
                        break;
                    case 'createUserId':
                        this.addCondition[index].conditionList2 = [
                            ...TOP_FILTER_ITEM.select
                        ];
                        this.addCondition[index].condition2 = '$eq';
                        this.addCondition[index].inputType = 'select';
                        this.addCondition[index].condition3 = [];
                        break;
                    case 'companyManagersBefore':
                        this.addCondition[index].conditionList2 = [
                            ...TOP_FILTER_ITEM.MultSelectUser
                        ];
                        this.addCondition[index].condition2 = '$regex';
                        this.addCondition[index].inputType = 'commonUserSelect';
                        this.addCondition[index].condition3 = [];
                        break;
                    case 'starLevel':
                    case 'followUpCount':
                    case 'touchCount':
                    case 'notFollowedDays':
                    case 'transactionInquiryCount':
                    case 'transactionMoneyRmb':
                        this.addCondition[index].conditionList2 = [
                            ...TOP_FILTER_ITEM.number
                        ];
                        this.addCondition[index].condition2 = '$range';
                        this.addCondition[index].inputType = TOP_FILTER_ITEM.number[0].childrenType;
                        this.addCondition[index].condition3 = [0, 0];
                        break;
                    case 'marker':
                        this.addCondition[index].conditionList2 = [
                            ...TOP_FILTER_ITEM.boolean
                        ];
                        this.addCondition[index].condition2 = '$eq';
                        this.addCondition[index].inputType = 'booleanSelect';
                        this.addCondition[index].condition3 = 1;
                        break;
                    default:
                        if (temp) {
                            switch (temp.fieldType) {
                                case 'date':
                                case 'date+time':
                                    this.addCondition[index].conditionList2 = [
                                        ...TOP_FILTER_ITEM.dateRange
                                    ];
                                    this.addCondition[index].condition2 = '$range';
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange[0].childrenType;
                                    this.$nextTick(() => {
                                        const end = new Date();
                                        const start = new Date();
                                        end.setTime(end.getTime() - 3600 * 1000 * 24);
                                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                        this.addCondition[index].condition3 = [start, end];
                                    });
                                    break;
                                case 'selectMultiple':
                                    this.addCondition[index].conditionList2 = [
                                        ...TOP_FILTER_ITEM.MultSelect
                                    ];
                                    this.addCondition[index].condition2 = '$regex';
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect[0].childrenType;
                                    this.addCondition[index].condition3 = [];
                                    // this.addCondition[index].conditionList3 = temp.optionValue;
                                    break;
                                case 'select':
                                    this.addCondition[index].conditionList2 = [
                                        ...TOP_FILTER_ITEM.select
                                    ];
                                    this.addCondition[index].condition2 = '$eq';
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.select[0].childrenType;
                                    this.addCondition[index].condition3 = '';
                                    // this.addCondition[index].conditionList3 = temp.optionValue;
                                    break;
                                case 'text':
                                case 'textarea':
                                default:
                                    this.addCondition[index].conditionList2 = [
                                        ...TOP_FILTER_ITEM.text
                                    ];
                                    this.addCondition[index].condition2 = '$regex';
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.text[0].childrenType;
                                    this.addCondition[index].condition3 = '';
                            }
                        } else {
                            // this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            // this.addCondition[index].condition3 = '';
                        }
                        break;
                }
            },
            computed_addChangeCon2(index) {
                switch (this.addCondition[index].condition1) {
                    case 'countryArea':
                        this.addCondition[index].inputType = TOP_FILTER_ITEM.settingContrySelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                        this.addCondition[index].condition3 = '';
                        break;
                    case 'createUserId':
                    case 'companyManagersBefore':
                        if (['$eq', '$ne'].includes(this.addCondition[index].condition2)) {
                            this.addCondition[index].inputType = 'select';
                            this.addCondition[index].condition3 = '';
                        } else if (['$in', '$nin', '$regex', '$nregex', '$andregex', '$andnregex'].includes(this.addCondition[index].condition2)) {
                            this.addCondition[index].inputType = 'commonUserSelect';
                            this.addCondition[index].condition3 = [];
                        } else {
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                        }
                        break;
                    case 'starLevel':
                    case 'followUpCount':
                    case 'touchCount':
                    case 'notFollowedDays':
                    case 'transactionInquiryCount':
                    case 'transactionMoneyRmb':
                        this.addCondition[index].inputType = TOP_FILTER_ITEM.number.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                        this.addCondition[index].condition3 = 0;
                        if (this.addCondition[index].inputType === 'numberRange') {
                            this.addCondition[index].condition3 = [0, 0];
                        }
                        break;
                    case 'marker':
                        this.addCondition[index].inputType = TOP_FILTER_ITEM.boolean.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                        this.addCondition[index].condition3 = 1;
                        if (this.addCondition[index].inputType === 'booleanMultSelect') {
                            this.addCondition[index].condition3 = [];
                        }
                        break;
                    default:
                        const temp = this.groupCondition.find(item => item.field === this.addCondition[index].condition1);
                        if (temp) {
                            switch (temp.fieldType) {
                                case 'date':
                                case 'date+time':
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                                    if (this.addCondition[index].inputType === 'dateRange') {
                                        this.addCondition[index].condition3 = [];
                                    } else {
                                        this.addCondition[index].condition3 = '';
                                    }
                                    break;
                                case 'selectMultiple':
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                                    this.addCondition[index].condition3 = [];
                                    break;
                                case 'select':
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                                    if (this.addCondition[index].inputType === 'array') {
                                        this.addCondition[index].condition3 = [];
                                    } else {
                                        this.addCondition[index].condition3 = '';
                                    }
                                    break;
                                case 'text':
                                case 'textarea':
                                default:
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                                    this.addCondition[index].condition3 = '';
                            }
                        } else {
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            this.addCondition[index].condition3 = '';
                        }
                        break;
                }
                if (this.addCondition[index].inputType === 'null' || this.addCondition[index].inputType === 'nnull') {
                    this.addCondition[index].condition3 = -1;
                }
            },
            // 新增或编辑公海分组数据信息
            handleSave() {
                if (!this.seasGroupName) {
                    this.$Message.error(this.$t('highSeasSetting.pleaseEnterGroupName'));
                    return;
                } else if (!this.defaultId.includes(this.id) && !this.addCondition.length) {
                    this.$Message.error(this.$t('highSeasSetting.pleaseSelectFilterCriteria'));
                    return;
                } else if (!this.value.length) {
                    this.$Message.error(this.$t('highSeasSetting.pleaseSelectViewingPermission'));
                    return;
                }
                // { condition: { fieldKey: 'a10010', fieldName: '自定义选项' }, decide: '$eq', optValue: [{ key: 213123, value: '选项名' }] }
                // { deptArr: [{ deptId: 970, deptName: '客服部' }], roleArr: [{ roleId: 100, roleName: '公海分组角色1' }], userArr: [{ userId: 6448, userName: '公海分组用户1' }] }
                const conditionsJson = [];
                const limitsJson = {};
                if (!this.defaultId.includes(this.id)) {
                    const flag = this.addCondition.every(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3))));
                    if (!flag) {
                        this.$Message.error(this.$t('highSeasSetting.filterCriteriaCannotBeEmpty'));
                        return;
                    }
                    this.addCondition.forEach(item => {
                        const condition1 = this.groupCondition.find(items => items.field === item.condition1);
                        let optValue = [];
                        const decide = item.condition2;
                        const condition = {
                            fieldName: condition1.fieldName,
                            fieldKey: item.condition1,
                            selectType: condition1.fieldType
                        };
                        if (['$null', '$nnull'].includes(item.condition2)) {
                            optValue = undefined;
                        } else {
                            switch (item.condition1) {
                                case 'countryArea':
                                    // optValue.push({ key: item.condition3, value: item.countryAreaName });
                                    optValue = item.condition3;
                                    break;
                                case 'createUserId':
                                case 'companyManagersBefore':
                                    if (['$eq', '$ne'].includes(decide)) {
                                        const userArr = [];
                                        condition1.optionValue.forEach(items => {
                                            if (items.key === item.condition3) {
                                                userArr.push({
                                                    key: items.key,
                                                    value: items.value
                                                });
                                            }
                                        });
                                        optValue.push({
                                            deptArr: [],
                                            userArr: userArr,
                                            roleArr: []
                                        });
                                    } else if (['$in', '$nin', '$regex', '$nregex', '$andregex', '$andnregex'].includes(decide)) {
                                        const deptArr = [];
                                        const userArr = [];
                                        const roleArr = [];
                                        item.condition3.forEach(condition3 => {
                                            if (condition3.type === 'department') {
                                                deptArr.push({
                                                    key: condition3.value,
                                                    value: condition3.label
                                                });
                                            }
                                            if (condition3.type === 'role') {
                                                roleArr.push({
                                                    key: condition3.value,
                                                    value: condition3.label
                                                });
                                            }
                                            if (condition3.type === 'user') {
                                                userArr.push({
                                                    key: Number(condition3.value),
                                                    value: condition3.label
                                                });
                                            }
                                        });
                                        optValue.push({
                                            deptArr: deptArr,
                                            userArr: userArr,
                                            roleArr: roleArr
                                        });
                                    }
                                    break;
                                case 'starLevel':
                                case 'followUpCount':
                                case 'touchCount':
                                case 'notFollowedDays':
                                case 'transactionInquiryCount':
                                case 'transactionMoneyRmb':
                                    if (decide === '$range') {
                                        optValue.push({ key: item.condition3[0], value: item.condition3[0] });
                                        optValue.push({ key: item.condition3[1], value: item.condition3[1] });
                                    } else {
                                        optValue.push({ key: item.condition3, value: item.condition3 });
                                    }
                                    break;
                                case 'marker':
                                    if (['$in', '$nin'].includes(decide)) {
                                        item.condition3.forEach(items => {
                                            optValue.push({ key: items, value: items });
                                        });
                                    } else {
                                        optValue.push({ key: item.condition3, value: item.condition3 });
                                    }
                                    break;
                                default:
                                    if (condition1) {
                                        switch (condition1.fieldType) {
                                            case 'date':
                                            case 'date+time':
                                                if (decide === '$range') {
                                                    optValue.push({ key: `${this.$options.filters.timeFormat(item.condition3[0])} 00:00:00.000`, value: `${this.$options.filters.timeFormat(item.condition3[0])} 00:00:00.000` });
                                                    optValue.push({ key: `${this.$options.filters.timeFormat(item.condition3[1])} 23:59:59.999`, value: `${this.$options.filters.timeFormat(item.condition3[1])} 23:59:59.999` });
                                                } else {
                                                    if (decide === '$gt') {
                                                        optValue.push({ key: `${this.$options.filters.timeFormat(item.condition3)} 23:59:59.999`, value: `${this.$options.filters.timeFormat(item.condition3)} 23:59:59.999` });
                                                    } else {
                                                        optValue.push({ key: `${this.$options.filters.timeFormat(item.condition3)} 00:00:00.000`, value: `${this.$options.filters.timeFormat(item.condition3)} 00:00:00.000` });
                                                    }
                                                }
                                                break;
                                            case 'selectMultiple':
                                                condition1.optionValue.forEach(items => {
                                                    if (item.condition3.includes(items.key)) {
                                                        optValue.push({
                                                            key: items.key,
                                                            value: items.value
                                                        });
                                                    }
                                                });
                                                break;
                                            case 'select':
                                                if (item.inputType === 'array') {
                                                    condition1.optionValue.forEach(items => {
                                                        if (item.condition3.includes(items.key)) {
                                                            optValue.push({
                                                                key: items.key,
                                                                value: items.value
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    optValue.push({ key: item.condition3, value: item.condition3 });
                                                }
                                                break;
                                            case 'text':
                                            case 'textarea':
                                            default:
                                                optValue.push({ key: item.condition3, value: item.condition3 });
                                        }
                                    } else {
                                        optValue.push({ key: item.condition3, value: item.condition3 });
                                    }
                                    break;
                            }
                        }
                        conditionsJson.push({
                            condition: condition,
                            decide: decide,
                            optValue: optValue
                        });
                    });
                }
                for (const i in this.limits) {
                    if (this.limits[i].length) {
                        limitsJson[i] = this.limits[i];
                    }
                }
                // 保存、编辑按钮的loading
                this.saveLoading = true;

                insertOrUpdate({
                    id: this.id,
                    openSeasGroup: this.openSeasGroup ? 1 : 0,
                    seasGroupName: this.seasGroupName,
                    conditionsJson: JSON.stringify(conditionsJson),
                    limitsJson: JSON.stringify(limitsJson)
                }).then(response => {
                    if (response.code === '1') {
                        // 保存、编辑按钮的loading
                        this.saveLoading = false;
                        const currentId = response.data.id;
                        // 重新获取分组列表
                        this.getList(currentId);
                    };
                }).catch(error => {
                    this.saveLoading = false;
                    console.error(error);
                });
            }
        },
        watch: {
            value: {
                handler(val) {
                    // 每次都置空
                    this.limits = { deptArr: [], roleArr: [], userArr: [] };
                    if (!val.length) {
                        return;
                    }

                    val.forEach(item => {
                        if (item.type === 'department') {
                            this.limits.deptArr.push({ deptId: item.value, deptName: item.label });
                        } else if (item.type === 'role') {
                            this.limits.roleArr.push({ roleId: item.value, roleName: item.label });
                        } else if (item.type === 'user') {
                            this.limits.userArr.push({ userId: item.value, userName: item.label });
                        };
                    });
                },
                deep: true
            }
        }
    };
</script>

<style lang="less" scoped>
    // 国家搜索组件的样式
    .searchCountry {
        width: 100%;
        display: inline-block;

        /deep/ .el-select {
            width: 100%;
        }
    }
    .condition3 {
        width: 220px;
    }
    // 最外层
    .seas-group {
        // padding: 10px 30px 20px 30px;
        font-size: 12px;

        // 标题
        .seas-group-item-title {
            display: flex;
            justify-content: space-between;
        }

        // 左侧meun菜单
        .universal-set-menu {
            overflow-y: overlay;
            border-right: none;
            height: calc(100% - 44px);

            /deep/ .el-menu-item {
                height: 44px;
                line-height: 44px;
                padding: 0px 20px;

                &.is-active {
                    background: #F5F7FA;
                    color: #000000;
                }
            }
            /deep/ .el-menu-item:hover, .el-menu-item:focus {
                background-color: #F5F7FA;
            }
        }

        // 右侧的盒子
        .content {
            border: 1px solid #EBEEF5;
            padding: 20px;
            border-left: none;
            overflow-y: scroll;
            height: 100%;
            padding-bottom: 60px;

            /deep/ .el-select .el-input {
                font-size: 12px;
            }

            // 必填项前面的*号伪类
            .asterisk-pseudo-class::before {
                content: '*';
                color: #FF0000;
                display: inline-block;
                margin-right: 4px;
            }

            // 第三个多选框,高度设置
            .select-box3 {
                max-height: 140px;

                /deep/ .el-select__tags {
                    max-height: 130px;
                    overflow-y: scroll;
                }
            }
        }
    }
</style>
