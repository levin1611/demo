<template>
   <div class="aliCRX" v-loading="loading">
        <!-- 字段匹配 -->
        <!-- 标题 -->
        <Row class="ali-field-match">
            <Col :span="11">
                <div class="ali-field-icon">
                    <Icon custom="custom custom-main-logo"
                            color="#FD7003"
                            size="30"></Icon>
                </div>
                <div class="ali-field-title">{{ $t('crm.aliImport.leadsCloudSales') }}</div>
            </Col>
            <Col :span="11" :offset="2">
                <div class="ali-field-icon">
                    <Icon custom="custom custom-alibaba-logo"
                            color="#FD7003"
                            size="40"></Icon>
                </div>
                <div class="ali-field-title">{{ $t('crm.aliImport.aliSales') }}</div>
            </Col>
        </Row>
        <!-- 字段遍历 -->
        <div :style="{height: fieldContainerHeight + 'px', 'margin-bottom': '24px', overflowX: 'hidden', overflowY: 'auto'}">
            <Row v-for="item in crmSalesList"
                :key="item.userId"
                class="ali-field-match">
                <Col :span="11">
                    <div>{{ item.showName }}</div>
                </Col>
                <Col :span="11" :offset="2">
                    <Input type="text" clearable v-model.trim="item.ownerName" maxlength="50" :placeholder="$t('crm.aliImport.aliSalesHolder')"></Input>
                </Col>
            </Row>
        </div>

        <!-- 保存按钮 -->
        <div class="text-center">
            <Button type="primary" :disabled="!authorized_button.changeMatchRel" @click="saveMatchRelation" :loading="loading">{{ $t('save') }}</Button>
        </div>
        <!-- 未保存字段映射关系就离开页面确认框 -->
        <Modal :visible.sync="visible_beforeLeave"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               @close="cancelLeave"
               width="360px">
            <p slot="title">
                <span style="font-size: 18px; color: rgba(0, 0, 0, .8)">{{ $t('crm.aliImport.leaveConfirm') }}</span>
            </p>
            <div>
                <p>{{ $t('crm.aliImport.leaveTip') }}</p>
            </div>
            <div slot="footer">
                <!-- 直接离开 -->
                <Button @click="leaveDirectly">{{ $t('crm.aliImport.leaveDirectly') }}</Button>
                <!-- 保存后离开 -->
                <Button type="primary"
                        @click="leaveAfterSave">{{ $t('crm.aliImport.leaveAfterSave') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { aliImport } from '@/api/crm/index';
    import { mapState } from 'vuex';
    export default {
        name: 'aliSales',
        props: [
            'fieldContainerHeight',
            'toRouterObj',
            'activeName'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                button_list: state => state.app.button_list
            }),
            authorized_button() {
                return {
                    // 保存关联关系
                    changeMatchRel: !HANDLE_BUTTON(BUTTON_IDS.CRM.aliImportCRX.changeMatchRel, this.button_list)
                };
            }
        },
        data() {
            return {
                /* 左侧字段匹配 */
                loading: true,
                // 初始请求得到的字段匹配关系
                originalRelations: '[]',
                // 当前线索模板字段
                crmSalesList: [],
                /* 离开前确认弹窗 */
                visible_beforeLeave: false
            };
        },
        methods: {
            // 获取crm员工列表
            getAliUserIdData() {
                this.crmSalesList = [];
                aliImport.getAliUserIdData({
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === '1') {
                        this.crmSalesList = res.data.map(item => {
                            item.ownerName = '';
                            return item;
                        });
                        this.getDataByOrgId();
                    }
                });
            },
            // 查询映射关系接口 参数  orgId   userId   type（1:客户字段映射 2：负责人字段映射）
            getDataByOrgId() {
                aliImport.getDataByOrgId({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    type: 2
                }).then((res) => {
                    if (res.code === '1' && res.data.relations) {
                        this.originalRelations = res.data.relations;
                        const relations = JSON.parse(res.data.relations);
                        relations.forEach(item => {
                            const index = this.crmSalesList.findIndex(info => info.userId === item.userId);
                            this.$set(this.crmSalesList[index], 'ownerName', item.ownerName);
                        });
                    }
                    this.loading = false;
                });
            },
            saveMatchRelation() {
                if (this.loading) return;
                this.loading = true;
                const crmSalesList = this.crmSalesList.filter(item => item.ownerName);
                const relations = JSON.stringify(crmSalesList);
                aliImport.saveData({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    relations: relations,
                    type: 2
                }).then((res) => {
                    if (res.code === '1') {
                        this.$Message.success(this.$t('crm.Table.success_save'));
                        // 如果之前有被中断的跳转动作, 继续跳转
                        if (this.toRouterObj) {
                            this.$router.push(this.toRouterObj);
                            return;
                        }
                        if (this.visible_beforeLeave) {
                            this.leaveDirectly();
                        }
                        this.getDataByOrgId();
                    } else {
                        this.$Message.error(res.message);
                    }
                    this.loading = false;
                });
            },
            /* 离开前确认弹窗 */
            // 检查字段匹配关系是否有变更, return true 代表有变更
            validateChanged() {
                // 如果没有修改权限, 不需要判断是否变更, 直接返回 false
                if (!this.authorized_button.changeMatchRel) {
                    return false;
                }
                // 否则判断新数据和历史数据是否有不一致之处
                const crmSalesList = this.crmSalesList.filter(item => item.ownerName);
                const relations = JSON.stringify(crmSalesList);
                return relations !== this.originalRelations;
                // return false;
            },
            // 放弃离开
            cancelLeave() {
                this.visible_beforeLeave = false;
            },
            // 直接离开
            leaveDirectly() {
                this.$emit('beforeLeave', this.activeName, 'aliSales', true);
            },
            // 保存后离开
            leaveAfterSave() {
                this.saveMatchRelation();
            }
        },
        created() {
            this.getAliUserIdData();
        }
    };
</script>

<style>

</style>
