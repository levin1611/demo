<!-- 仪表盘 tableCard 组件通用的筛选组件 -->
<template>
    <Poptip width="320"
            placement="bottom-end"
            popper-class="card-filter"
            ref="poptip">
        <!-- 按钮, Poptip 触发器 -->
        <div slot="reference" class="card-filter__trigger">
            <!-- 标题 -->
            <Tooltip :content="title" effect="dark" placement="top">
                <span class="card-filter__title googleState-filter-title">{{ title }}</span>
            </Tooltip>
            <!-- 下拉按钮 -->
            <template >
                <span class="el-select">
                    <span class="el-input">
                        <i class="el-select__caret el-input__icon el-icon-arrow-up"></i>
                    </span>
                </span>
                <!-- <Icon custom="custom custom-menu-arrow"
                      color="#7B98B6"
                      size="10"></Icon> -->
            </template>
        </div>

        <!-- Poptip 内容 -->
        <div class="card-filter__popper">
            <!-- 用户型 -->
            <div class="filter-content">
                <div class="title">
                    <Icon custom="custom-table-filter"></Icon>
                    <span>{{ $t("tableFilter.contentFilter") }}</span>
                </div>
                <template>
                    <!-- <Input v-model="keywords"
                        :placeholder="$t('tableFilter.tip_inputKeyWords')"
                        @input="generate_child_tree(keywords)">
                        <Icon
                            slot="suffix"
                            type="ios-search"
                            :size="16"
                            @click.native="generate_child_tree(keywords)"
                            style="line-height: 32px; cursor: pointer"
                        ></Icon>
                    </Input> -->
                    <div class="filter-items filter-tree"
                        style="max-height: 280px;height: 280px">
                        <Tree ref="googleTree"
                            node-key="campaignId"
                            :props="props"
                            :data="tree_data"
                            show-checkbox
                            :render-content="renderContent"
                            :filter-node-method="filterNode"
                            :default-expand-all="true">
                        </Tree>
                    </div>
                </template>
            </div>
            <!-- 底部按钮 -->
            <div class="card-filter-btns">
                <Button @click="cancel"
                        type="minor"
                        size="small">{{ $t('cancel') }}</Button>
                <Button type="success"
                        size="small"
                        @click="confirm"
                        :class="`piwik-${cardType}-person-filter`">{{ $t('confirm') }}</Button>
            </div>
        </div>
    </Poptip>
</template>

<script>
    import { mapState } from 'vuex';
    import { getGoogleState } from '@/api/dashBoard/dashBoardV2';
    export default {
        name: 'campaignFilter-filter',
        props: [
            // 所属 card 类型
            'cardType',
            // 筛选值
            'filterValue',
            'googleState_list',
            'user_list'
        ],
        computed: {
            ...mapState({
                userId: state => state.userId,
                fullName: state => state.fullName,
                userName: state => state.userName,
                orgId: state => state.enterpriseId
            })
        },
        data() {
            return {
                /* 全局 */
                // 筛选标题,
                title: this.$t('allGoogleState'),
                props: {
                    label: 'customerName',
                    children: 'googleAdsCampaigns',
                    multiple: true,
                    value: 'campaignId'
                },
                tree_data: [],
                keywords: '', // 搜索词，
                treeItemClass: ''
            };
        },
        methods: {
            /* 全局 */
            confirm() {
                const allChecked = this.$refs.googleTree.getCheckedNodes();
                const selectedCampaignId = [];
                const title = [];
                if (allChecked.length) {
                    allChecked.forEach(item => {
                        if(!item.parentId) {
                            selectedCampaignId.push(item.campaignId);
                            title.push(item.customerName);
                        }
                    });
                    console.log(this.tree_data)
                    this.title = title.join(',');
                } else {
                    this.title = this.$t('allDepartment');
                }
                this.$emit('handleFilter', 'campaignId', selectedCampaignId.join(','));
                this.closePoptip();
            },
            cancel() {
                // if (this.filterValue) {
                //     this.$refs.googleTree.setCheckedKeys(this.filterValue);
                // } else {
                //     this.$refs.googleTree.setCheckedKeys([]);
                // }
                this.$refs.googleTree.setCheckedKeys([]);
                // 关闭弹窗
                this.closePoptip();
            },
            // get_tree(param_arr) {
            //     return parent_arr;
            // },
            filterNode(value, data) {
                if (!value) return true;
                return data.title.indexOf(value) !== -1;
            },
            generate_child_tree(title) {
                this.$refs.googleTree.filter(title);
            }, // 根据 id 在页面中定位常用检索, 返回值为"定位是否成功"
            closePoptip() {
                this.$refs.poptip.doClose();
            },
            renderContent(h, { node, data, store }) {
                return (
                    <Tooltip content={data.customerName} effect="dark" placement="top">
                        <span>{data.customerName}</span>
                    </Tooltip>);
            }
        },
        created() {
            if (this.cardType === 'googleMarketing') {
                getGoogleState({
                    orgId: this.orgId
                }).then(res => {
                    const title = [];
                    // this.$refs.googleTree.setCheckedKeys(this.filterValue);
                    if (this.filterValue.length > 0) {
                        res.forEach(item => {
                            item.googleAdsCampaigns.forEach(v => {
                                if (this.filterValue.includes(v.campaignId)) {
                                    title.push(v.customerName);
                                }
                            });
                            // title.push(item.googleAdsCampaigns.find(v => this.filterValue.includes(v.campaignId)).customerName);
                        });
                        this.title = title.join(',');
                        this.$nextTick(() => {
                            this.$refs.googleTree.setCheckedKeys(this.filterValue.split(','));
                        })
                    } else {
                        this.title = this.$t('allGoogleState');
                    }
                    this.tree_data = [
                        {
                            customerName: this.$t('allGoogleState'),
                            campaignId: 0,
                            parentId: -1,
                            checked: true,
                            expand: true,
                            googleAdsCampaigns: res
                        }
                    ];
                });
            }
        },
        mounted() {
        },
        watch: {
        }
    };
</script>

<style lang="less">
   @import './filter.less';
</style>
