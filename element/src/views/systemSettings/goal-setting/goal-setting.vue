<template>
    <div style="overflow-y: hidden">
        <div class="top_filter">
            <div class="top_filter_left">
                <h1 class="top_filter_left_title">{{$t('dashBoardV2.Settings.departmentGoals')}}</h1>
                <Select v-model="dataType" size="small" class="data_type_select" @change="handleSelectChange" style="width: 120px">
                    <Option v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"></Option>
                </Select>
                <Input v-model="dataDate" disabled style="width: 80px"></Input>
                <span v-if="isEdit" class="edit_tip">
                    {{$t('dashBoardV2.GoalSetting.settingTip')}}
                </span>
            </div>
            <div class="top_filter_right">
                <Button type="primary" @click="toggleEditMode(true)" v-if="!isEdit">{{$t('dashBoardV2.Btn.edit')}}</Button>
                <Button @click="toggleEditMode(false)" v-if="isEdit">{{$t('dashBoardV2.Btn.cancel')}}</Button>
                <Button type="primary" v-if="isEdit" @click="saveTargetSetting">{{$t('dashBoardV2.Btn.save')}}</Button>
            </div>
        </div>
        <div class="main_container">
            <!-- 部门目标table -->
            <div class="main_container_top">
                <Table :data="tableData_department"
                       style="width: 100%"
                       height="310px"
                       size="medium"
                       highlight-current-row
                       ref="table"
                       class="tabmain noBoxShadow-right noborder-table goalTable">
                    <TableColumn v-for="item in tableCol_department"
                                 :key="item.key"
                                 :prop="item.key"
                                 :label="item.title"
                                 :align="item.key === 'departmentName' ? 'left' : 'right'"
                                 :fixed="item.key === 'departmentName'"
                                 :width="item.width || 120"
                                 :min-width="item.width || 100"
                                 :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template v-if="item.key === 'departmentName'">
                                <span>{{getSymbolCount(scope.row['structure']) + scope.row[item.key]}}</span>
                            </template>
                            <template v-else>
                                <span>{{scope.row[item.key]}}</span>
                            </template>
                        </template>
                    </TableColumn>
                </Table>
            </div>
            <!-- 成员目标table -->
            <div class="main_container_bottom">
                <div style="margin-bottom: 15px">
                    <h1 class="main_container_bottom_title">{{$t('dashBoardV2.Settings.personGoals')}}</h1>
                </div>
                <Table style="width: 100%"
                       :data="tableData_person"
                       size="medium"
                       highlight-current-row
                       ref="table"
                       height="312px"
                       class="tabmain noBoxShadow-right noborder-table goalTable">
                    <TableColumn v-for="(item, index) in tableCol_person"
                                 :key="item.key"
                                 :prop="item.key"
                                 :label="item.title"
                                 :width="item.width || 120"
                                 :min-width="item.width || 100"
                                 :align="['userName', 'departmentName'].includes(item.key) ? 'left' : 'right'"
                                 :fixed="['userName', 'departmentName'].includes(item.key)"
                                 :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template v-if="!['userName', 'departmentName', 'allYear', 'Q1', 'Q2', 'Q3', 'Q4'].includes(item.key)">
                                <!-- 涉及到月份 可以编辑 在编辑模式下为输入框 -->
                                <Input v-model.number="scope.row[item.key]"
                                       v-if="isEdit"
                                       @input="val => (scope.row[item.key] = filterNumber(val))" ></Input>
                                <span v-else>{{scope.row[item.key]}}</span>
                            </template>
                            <template v-else-if="['allYear', 'Q1', 'Q2', 'Q3', 'Q4'].includes(item.key)">
                                <span>{{scope.row[item.key]}}</span>
                            </template>
                            <template v-else>
                                <span>{{scope.row[item.key]}}</span>
                            </template>
                        </template>
                    </TableColumn>
                </Table>
            </div>
        </div>
        <div style="margin-right: 30px;overflow: hidden">
            <Page :page-size="pageSize"
                  :page-sizes="pageSizeOpts"
                  :total="totalNum"
                  :current-page="curPage"
                  layout="total, prev, pager, next, sizes, jumper"
                  @current-change="changePage"
                  @size-change="pageSizeChange"
                  class="pageWrap-right"></Page>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { getTargetSetting, saveTargetSetting } from '../../../api/dashBoard/dashBoardV2';
    export default {
        name: 'goal-setting',
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
            }),
        },
        data() {
            return {
                dataType: 1,
                dataDate: `${new Date().getFullYear()}年`,
                inputData: null,
                options: [
                    {
                        value: 1,
                        label: this.$t('dashBoardV2.Settings.dealtAmount')
                    },
                    {
                        value: 2,
                        label: this.$t('dashBoardV2.Settings.dealtInquiry')
                    }
                ],
                tableData_department: [],
                tableData_person: [],
                tableCol_department: [
                    {
                        key: 'departmentName',
                        title: this.$t('dashBoardV2.GoalSetting.DepartmentName'),
                        width: 200
                    },
                    {
                        key: 'allYear',
                        title: this.$t('dashBoardV2.GoalSetting.Year')
                    },
                    {
                        key: 'Jan',
                        title: this.$t('dashBoardV2.GoalSetting.Jan'),
                        id: '1'
                    },
                    {
                        key: 'Feb',
                        title: this.$t('dashBoardV2.GoalSetting.Feb'),
                        id: '2'
                    },
                    {
                        key: 'Mar',
                        title: this.$t('dashBoardV2.GoalSetting.Mar'),
                        id: '3'
                    },
                    {
                        key: 'Q1',
                        title: this.$t('dashBoardV2.GoalSetting.Q1')
                    },
                    {
                        key: 'Apr',
                        title: this.$t('dashBoardV2.GoalSetting.Apr'),
                        id: '4'
                    },
                    {
                        key: 'May',
                        title: this.$t('dashBoardV2.GoalSetting.May'),
                        id: '5'
                    },
                    {
                        key: 'Jun',
                        title: this.$t('dashBoardV2.GoalSetting.Jun'),
                        id: '6'
                    },
                    {
                        key: 'Q2',
                        title: this.$t('dashBoardV2.GoalSetting.Q2')
                    },
                    {
                        key: 'Jul',
                        title: this.$t('dashBoardV2.GoalSetting.Jul'),
                        id: '7'
                    },
                    {
                        key: 'Aug',
                        title: this.$t('dashBoardV2.GoalSetting.Aug'),
                        id: '8'
                    },
                    {
                        key: 'Sep',
                        title: this.$t('dashBoardV2.GoalSetting.Sep'),
                        id: '9'
                    },
                    {
                        key: 'Q3',
                        title: this.$t('dashBoardV2.GoalSetting.Q3')
                    },
                    {
                        key: 'Oct',
                        title: this.$t('dashBoardV2.GoalSetting.Oct'),
                        id: '10'
                    },
                    {
                        key: 'Nov',
                        title: this.$t('dashBoardV2.GoalSetting.Nov'),
                        id: '11'
                    },
                    {
                        key: 'Dec',
                        title: this.$t('dashBoardV2.GoalSetting.Dec'),
                        id: '12'
                    },
                    {
                        key: 'Q4',
                        title: this.$t('dashBoardV2.GoalSetting.Q4')
                    }
                ],
                tableCol_person: [
                    {
                        key: 'userName',
                        title: this.$t('dashBoardV2.GoalSetting.userName')
                    },
                    {
                        key: 'departmentName',
                        title: this.$t('dashBoardV2.GoalSetting.department')
                    },
                    {
                        key: 'allYear',
                        title: this.$t('dashBoardV2.GoalSetting.Year')
                    },
                    {
                        key: 'Jan',
                        title: this.$t('dashBoardV2.GoalSetting.Jan'),
                        id: '1'
                    },
                    {
                        key: 'Feb',
                        title: this.$t('dashBoardV2.GoalSetting.Feb'),
                        id: '2'
                    },
                    {
                        key: 'Mar',
                        title: this.$t('dashBoardV2.GoalSetting.Mar'),
                        id: '3'
                    },
                    {
                        key: 'Q1',
                        title: this.$t('dashBoardV2.GoalSetting.Q1')
                    },
                    {
                        key: 'Apr',
                        title: this.$t('dashBoardV2.GoalSetting.Apr'),
                        id: '4'
                    },
                    {
                        key: 'May',
                        title: this.$t('dashBoardV2.GoalSetting.May'),
                        id: '5'
                    },
                    {
                        key: 'Jun',
                        title: this.$t('dashBoardV2.GoalSetting.Jun'),
                        id: '6'
                    },
                    {
                        key: 'Q2',
                        title: this.$t('dashBoardV2.GoalSetting.Q2')
                    },
                    {
                        key: 'Jul',
                        title: this.$t('dashBoardV2.GoalSetting.Jul'),
                        id: '7'
                    },
                    {
                        key: 'Aug',
                        title: this.$t('dashBoardV2.GoalSetting.Aug'),
                        id: '8'
                    },
                    {
                        key: 'Sep',
                        title: this.$t('dashBoardV2.GoalSetting.Sep'),
                        id: '9'
                    },
                    {
                        key: 'Q3',
                        title: this.$t('dashBoardV2.GoalSetting.Q3')
                    },
                    {
                        key: 'Oct',
                        title: this.$t('dashBoardV2.GoalSetting.Oct'),
                        id: '10'
                    },
                    {
                        key: 'Nov',
                        title: this.$t('dashBoardV2.GoalSetting.Nov'),
                        id: '11'
                    },
                    {
                        key: 'Dec',
                        title: this.$t('dashBoardV2.GoalSetting.Dec'),
                        id: '12'
                    },
                    {
                        key: 'Q4',
                        title: this.$t('dashBoardV2.GoalSetting.Q4')
                    }
                ],
                pageSize: 20,
                pageSizeOpts: [20, 50, 100],
                curPage: 1,
                maxPageNum: 1,
                totalNum: 0,
                isEdit: false,
                postData: [],
                targetMap: {
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0,
                    6: 0,
                    7: 0,
                    8: 0,
                    9: 0,
                    10: 0,
                    11: 0,
                    12: 0
                },
                dto: []
            }
        },
        methods: {
            init() {
                this.getTargetSetting();
            },
            async getTargetSetting(type) {
                // 获取业绩目标设置
                const res = await getTargetSetting({
                    orgId: this.orgId,
                    userId: this.userId,
                    year: new Date().getFullYear(),
                    targetType: this.dataType,
                    pageSize: this.pageSize,
                    pageNo: this.curPage
                });
                if (res.code === '1') {
                    const temp = res.data;
                    // 部门目标
                    this.tableData_department = temp['deptList']['deptList'];
                    this.tableData_department.forEach(depart => {
                        /**
                         * depart.targetValueMap返回的是一个map 需要处理成json
                         * 类似于
                         * {
                         *     '1': 100,
                         *     '2': 200
                         * }
                         * 如果为null的话 默认全部为0
                         * */
                        const targetMap = depart['targetValueMap'];
                        if (Object.keys(targetMap).length === 0) {
                            this.tableCol_department.forEach(col => {
                                if (!['departmentName'].includes(col.key)) {
                                    this.$set(depart, col.key, 0);
                                }
                            });
                        } else {
                            this.tableCol_department.forEach(col => {
                                if (Object.keys(targetMap).includes(col.id)) {
                                    depart[col.key] = targetMap[col.id];
                                }
                                switch (col.key) {
                                    case 'allYear':
                                        let sum = 0;
                                        for (let item of Object.values(targetMap)) {
                                            sum += item;
                                        }
                                        depart['allYear'] = sum;
                                        break;
                                    case 'Q1':
                                        depart['Q1'] = targetMap['1'] + targetMap['2'] + targetMap['3'];
                                        break;
                                    case 'Q2':
                                        depart['Q2'] = targetMap['4'] + targetMap['5'] + targetMap['6'];
                                        break;
                                    case 'Q3':
                                        depart['Q3'] = targetMap['7'] + targetMap['8'] + targetMap['9'];
                                    case 'Q4':
                                        depart['Q4'] = targetMap['10'] + targetMap['11'] + targetMap['12'];
                                        break;
                                }
                            });
                        }
                    });
                    // 员工目标
                    this.tableData_person = temp['userList']['userList'];
                    // 员工总人数
                    this.totalNum = temp['userList']['userTotal'];
                    // 最大页码
                    this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);
                    this.tableData_person.forEach(person => {
                        const targetMap = person['targetValueMap'];
                        this.targetMap = targetMap === null ? this.targetMap : targetMap;
                        if (!targetMap) {
                            this.tableCol_person.forEach(col => {
                                if (!['departmentName', 'userName'].includes(col.key)) {
                                    this.$set(person, col.key, 0);
                                }
                            });
                        } else {
                            this.tableCol_person.forEach(col => {
                                if (Object.keys(targetMap).includes(col.id)) {
                                    this.$set(person, col.key, targetMap[col.id]);
                                }
                                switch (col.key) {
                                    case 'allYear':
                                        let sum = 0;
                                        for (let item of Object.values(targetMap)) {
                                            sum += item;
                                        }
                                        this.$set(person, 'allYear', sum);
                                        break;
                                    case 'Q1':
                                        this.$set(person, 'Q1', targetMap['1'] + targetMap['2'] + targetMap['3']);
                                        break;
                                    case 'Q2':
                                        this.$set(person, 'Q2', targetMap['4'] + targetMap['5'] + targetMap['6']);
                                        break;
                                    case 'Q3':
                                        this.$set(person, 'Q3', targetMap['7'] + targetMap['8'] + targetMap['9']);
                                    case 'Q4':
                                        this.$set(person, 'Q4', targetMap['10'] + targetMap['11'] + targetMap['12']);
                                        break;
                                }
                            });
                        }
                        this.postData.push(person);
                    });
                };
            },
            async saveTargetSetting() {
                // 组装数据
                this.tableData_person.forEach(person => {
                    let obj = {};
                    // obj.set('1', person['Jan']);
                    // obj.set('2', person['Feb']);
                    // obj.set('3', person['Mar']);
                    // obj.set('4', person['Apr']);
                    // obj.set('5', person['May']);
                    // obj.set('6', person['Jun']);
                    // obj.set('7', person['Jul']);
                    // obj.set('8', person['Aug']);
                    // obj.set('9', person['Sep']);
                    // obj.set('10', person['Oct']);
                    // obj.set('11', person['Nov']);
                    // obj.set('12', person['Dec']);
                    obj = {
                        1 : person['Jan'],
                        2 : person['Feb'],
                        3 : person['Mar'],
                        4 : person['Apr'],
                        5 : person['May'],
                        6 : person['Jun'],
                        7 : person['Jul'],
                        8 : person['Aug'],
                        9 : person['Sep'],
                        10 : person['Oct'],
                        11 : person['Nov'],
                        12 : person['Dec'],
                    };
                    this.$set(person, 'targetValueMap', JSON.parse(JSON.stringify(obj)));
                    this.$set(person, 'operateUserId', this.userId);
                    this.$set(person, 'operateUser', this.userName);
                    this.$set(person, 'updateUser', this.userName);
                    this.$set(person, 'updateUserId', this.userId);
                    this.$set(person, 'targetType', this.dataType);
                    this.$set(person, 'year', new Date().getFullYear());
                });
                // 调用 接口
                const data = await saveTargetSetting({
                    list: this.tableData_person
                });
                if (data.code === '1') {
                    this.getTargetSetting();
                } else {
                    this.getTargetSetting();
                    this.$Message.warning('保存业绩目标失败请重试');
                }
                // 退出编辑模式
                this.isEdit = false;
            },
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    this.getTargetSetting();
                }
            },
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                this.getTargetSetting();
            },
            toggleEditMode(val) {
                this.isEdit = val;
                // 重新请求之前的数据
                this.getTargetSetting();
            },
            computedValue(index, key) {
                return this.tableData_person[index][key];
            },
            focusInput(index, key) {
                this.tableData_person[index][key] = this.inputData;
            },
            handleSelectChange() {
                this.getTargetSetting();
            },
            filterNumber(val) {
                val = val.replace(/[^0-9]/gi, '');
                return Number(val);
            },
            getSymbolCount(str, char='-') {
                const regx = new RegExp(char, 'g');
                const result = str.match(regx);
                const count = !result ? 0 : result.length;
                let temp = '';
                if (count) {
                    for (let i = 0; i < count; i++) {
                        temp = temp + '-- '
                    }
                };
                return temp;
            }
        },
        created() {
            this.init();
        },
        watch: {
            tableData_person: {
                handler(val) {
                    if (val.length > 0) {
                        val.forEach(item => {
                            this.$set(item, 'Q1', item['Jan'] + item['Feb'] + item['Mar']);
                            this.$set(item, 'Q2', item['Apr'] + item['May'] + item['Jun']);
                            this.$set(item, 'Q3', item['Jul'] + item['Aug'] + item['Sep']);
                            this.$set(item, 'Q4', item['Oct'] + item['Nov'] + item['Dec']);
                            this.$set(item, 'allYear', item['Q1']+item['Q2']+item['Q3']+item['Q4']);
                        });
                    }
                },
                deep: true,
                immediate: true
            }
        }
    };
</script>

<style scoped lang="less">
    .top_filter {
        display: flex;
        justify-content: space-between;
        margin: 21px 30px 9px 30px;
        &_left {
            display: flex;
            justify-content: space-between;
            &_title {
                margin-right: 30px;
                margin-top: 4px;
                font-size: 16px;
                color: rgba(0,0,0,0.80);
                white-space: nowrap;
            }
            .data_type_select {
                margin-right: 12px;
            }
            .edit_tip {
                display: block;
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0,0,0,0.80);
                text-align: center;
                line-height: 18px;
                align-self: center;
                margin-left: 13px;
                max-width: 700px;
            }
        }
        &_right {

        }
    }
    .main_container {
        display: flex;
        flex-direction: column;
        &_top {
            flex-basis: 50%;
            margin-left: 30px;
        }
        &_bottom {
            flex-basis: 50%;
            margin-left: 30px;
            margin-top: 30px;
            &_title {
                font-family: PingFangSC-Medium;
                font-size: 16px;
                color: rgba(0,0,0,0.80);
            }
        }
        .tabmain {
            /deep/ table {
                .cell {
                    white-space: nowrap !important;
                }
            }
        }
    }
    .goalTable {
        /deep/ table {
            .cell {
                padding-left: 1px !important;
            }
        }
    }
</style>
