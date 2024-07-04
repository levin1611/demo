<template>
    <div class="seas-set">
        <Tabs v-model="view" class="heighSeas-set-tab"
              :before-leave="beforeLeave">
            <TabPane
                    v-for="(item,index) in viewList"
                    :key="index"
                    :label="item.label"
                    :name="item.name"
            ></TabPane>
        </Tabs>
            <!-- 退入公海原因需要用到type 'throwReason' -->
            <component
                    v-bind:is="view"
                    :ref="settingDom"
                    type="throwReason"
                    @isEditSelfMotion="isEditSelfMotion">
            </component>
        <!--当用户开启规则后，未保存就想离开公海设置-->
        <Modal
                class="modal-footer-margin"
                :visible.sync="leaveTipModel"
                :modal-append-to-body="false"
                width="360px">
            <p slot="title">
                <span>{{$t('mail.leaveConfirm')}}</span>
            </p>
            <div>
                <p>{{$t('highSeasSetting.leaveMotionTip')}}</p>
            </div>
            <div slot="footer">
                <Button @click="handleCancel">{{$t('cancel')}}</Button>
                <Button type="primary" @click="handleDraftSave">{{$t('confirm')}}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import selfMotion from './self-motion/selfMotion';
    import highSeasGrouping from './high-seas-grouping/highSeasGrouping';
    import commonSet from '../../crm/UniversalSetting/commonSet';
    import upperLimit from './upper-limit';
    // import businessRules from './business-rules/businessRules';

    export default {
        name: 'highSeasSetting',
        components: { selfMotion, commonSet, upperLimit, highSeasGrouping },
        data() {
            return {
                fromType: '',
                isEdit: false, // 是否编辑过
                isForceTrue: false, // 强制置为true，避免点击确定按钮初始化自动流入规则时再次触发编辑事件
                leaveTipModel: false,
                toRouterObj: null,
                activeName: '',
                view: 'selfMotion',
                viewList: [
                    {
                        label: this.$t('highSeasSetting.selfMotionRuler'),
                        name: 'selfMotion'
                    },
                    {
                        label: this.$t('highSeasSetting.poolGrouping'),
                        name: 'highSeasGrouping'
                    },
                    {
                        label: this.$t('highSeasSetting.inquriry.title'),
                        name: 'upperLimit'
                    },
                    {
                        label: this.$t('highSeasSetting.backIntoHighSeas'),
                        name: 'commonSet'
                    }
                ]
            };
        },
        computed: {
            settingDom() {
                return this.view === 'selfMotion' ? 'selfMotionDom' : '';
            }
        },
        methods: {
            beforeLeave(activeName, oldActiveName) {
                if (!this.isForceTrue && activeName !== 'selfMotion' && this.isEdit) {
                    this.activeName = activeName;
                    this.leaveTipModel = true;
                    this.fromType = 'view';
                    return false;
                } else {
                    this.isForceTrue = false;
                    this.isEdit = false;
                }
            },
            isEditSelfMotion(val) {
                this.isEdit = val;
            },
            handleCancel() {
                this.leaveTipModel = false;
                this.isForceTrue = false;
                this.activeName = '';
                this.toRouterObj = null;
                // 如果是取消跳转路由，将菜单当前active-name重置为当前页面
                if (this.fromType === 'router') {
                    this.$store.state.app.currentPageName = 'highSeasSetting';
                }
            },
            handleDraftSave() {
                this.leaveTipModel = false;
                // 如果点击确定按钮前是切换tab标签，则需初始化
                if (this.fromType === 'view') {
                    this.$refs.selfMotionDom.initHighSeas();
                    this.view = this.activeName;
                } else {
                    if (this.toRouterObj) {
                        this.$router.push(this.toRouterObj);
                    }
                }
                this.isForceTrue = true;
                this.isEdit = false;
            }
        },
        beforeRouteLeave(to, from, next) {
            if (this.view !== 'selfMotion') {
                next();
            } else if (this.toRouterObj && to.name === this.toRouterObj.name && !this.leaveTipModel) {
                next();
            } else if (to.name === 'login') {
                next();
            } else {
                // 点击了离开提醒的确认按钮后，可以跳转
                if (this.isForceTrue) {
                    next();
                    this.isEdit = false;
                    this.isForceTrue = false;
                    return;
                }
                // 跳转到其它路由时，如果编辑过规则未保存则弹出提示
                if (this.isEdit) {
                    this.fromType = 'router';
                    const { name, params } = to;
                    this.toRouterObj = { name, params };
                    this.leaveTipModel = true;
                    // 先将菜单当前active-name置为空
                    this.$store.state.app.currentPageName = '';
                } else {
                    next();
                }
            }
        }
    };
</script>

<style lang="less">
    @import "highSeasSetting";
    .heighSeas-set-tab{
        .el-tabs__nav-wrap:after{
            height: 1px;
        }
        // .el-tabs__nav-scroll{
        //     padding: 7px 30px 0;
        // }
    }
</style>
