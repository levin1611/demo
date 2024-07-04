<template>
  <Select
    v-model="status"
    v-loading="loading"
    :placeholder="$t('highSeasSetting.inquriry.choosePersons')"
    :openAnimation="false"
    :style="{width:width}"
    size="mini"
    class="_overY"
    multiple
    @remove-tag="selectChange"
  >
    <Option
      :value="statusValue"
      disabled
      style="height: auto;background-color:#ffffff;cursor: default;"
    >
       <input type="text" autocomplete="off" :placeholder="$t('tableFilter.tip_inputKeyWords')" class="el-input__inner" style="margin-bottom: 10px" v-model="filterText">
      <Tree
        :data="treeDatas"
        style="overflow-y:auto;max-height: 200px;"
        show-checkbox
        multiple
        :filter-node-method="filterNode"
        default-expand-all
        :render-content="renderContent"
        :ref="treeRef"
        node-key="nodeIdentifier"
        @check="changeSelectedUserIds"
      ></Tree>
    </Option>
  </Select>
</template>

<script>
    import { getUserDataList, getDepartmentList } from '@/api/reusableApi/common';
    import { Request } from '@/api/baseUtilAjax';
    import { mapState } from 'vuex';
    import { dataModule } from './datas';
    import renderTree from './mixins/renderTree'; // 树的构建 渲染 搜索
    import interaction from './mixins/interaction'; // select 、 tree 、 父级 数据流
    export default {
        name: 'elSelectedTree5211314',
        mixins: [renderTree, interaction],
        props: {
            width: String,
            loading: Boolean,
            search: {
                type: Boolean,
                default: () => true
            },
            filterFn: {
                type: Function,
                default: (item, index, list) => {
                    return item.canGetInquiry === 1 && item.isDelete === false;// 过滤人员 非离职与能获取询盘人
                }
            },
            resMsg: Function
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            })
        },
        data() {
            return { ...this.$_.cloneDeep(dataModule), treeRef: `treeRefs${this.$dym.Rnum()}` };
        },
        methods: {
            async init(forbiddenUserList = [], checkedList = [], buildTree = true) {
                // 获取disabled和checkList列表后构建树
                this.$emit('update:loading', true);
                this.resetData();
                const arr = await new Request().requestAll([getDepartmentList({
                    orgId: this.enterpriseId
                }), getUserDataList({
                    departmentId: 0,
                    orgId: this.enterpriseId,
                    pageNo: 1,
                    pageSize: 2000
                })]);
                const department = arr[0];
                const userList = arr[1];
                if (department.code === '1') {
                    this.storeDeparmentOriginList = department.data.list || [];
                } else {
                    this.$Message.error(`${this.$t('authority.userManagement.departmentErr')}`);
                }
                if (userList.code === '1') {
                    this.storeUserOriginList = (userList.data.list || []).filter(v => this.filterFn(v));
                } else {
                    this.$Message.error(`${this.$t('authority.userManagement.queryFailure')}`);
                }
                if (!arr.length) return false;
                // 均为一维数组 userId void Number
                if (!Array.isArray(checkedList) || !Array.isArray(forbiddenUserList)) {
                    return false;
                }
                if (buildTree) {
                    this.getTree({ forbiddenUserList, checkedList });
                    this.revertSelected(checkedList, this.storeUserOriginList);
                    this.$nextTick(function() {
                        // this.loading = false;
                        this.$emit('update:loading', false);
                    });
                }
            },
            resetData() {
                // 表单父级取消或成功后调用此函数
                const config = this.$_.cloneDeep(dataModule);
                for (const key in config) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (config.hasOwnProperty(key)) {
                        this[key] = config[key];
                    }
                }
            }
        }
    };
</script>
