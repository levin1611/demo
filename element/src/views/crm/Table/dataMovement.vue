<template>
    <div class="data-movement">
        <template>
            <!--     步骤条       -->
            <div class="data-movement-top">
                <span class="data-movement-title">{{$t('data_movement.dataMovement')}}</span>
                <HelpTip :title="$t('helpTip.dataMovement')"></HelpTip>
                <div class="data-movement-steps">
                    <mySteps :currentVal="currentStep" :stepArray="stepArray"></mySteps>
                </div>
                <div class="data-movement-failed-data">
                    <Tooltip content="迁移失败记录" placement="top" v-if="stepView==='dataMoveUpload'">
                        <Icon custom="custom-shangchuanshibaijilusezhiABCdaxiao_xiangsu" @click="openFailedData" ></Icon>
                    </Tooltip>
                </div>
            </div>
        </template>
        <!--  组件切换 根据stepView切换组件 -->
        <template>
            <div class="data-movement-center"
                 :class="currentStep!=3&&currentStep!=4 ? 'data-movement-center-bgc-pre' : 'data-movement-center-bgc-next'">
                <component :is="stepView"
                           ref="dataMovement"
                           class="data-movement-components"
                           :isUploadFiles="isUploadFiles"
                           :isFinished="isFinished"
                           :isDMFinished="isDMFinished"
                           :isDMAborted.sync="isDMAborted"
                           @isUploadFinished="isUploadFinished"
                           @isNoFiles="isNoFiles">
                </component>
            </div>
        </template>

        <!--底部公共按钮区-->
        <div class="data-movement-bottom">
            <span v-show="currentStep!==0 && currentStep!==3&&currentStep!==4" class="cancel-data-movement"
                  @click="cancelModal=true">{{$t('data_movement.cancelDM')}}</span>
            <span v-show="currentStep == 2" class="reset-data-movement" @click="resetModal=true">{{$t('data_movement.resetMapping')}}</span>
            <span v-show="currentStep == 2" class="reset-data-movement" style="color: #4285f4" @click="automaticM">{{$t('data_movement.automaticMapping')}}</span>
            <Button type="primary" @click="nextStep" v-show="currentStep!==4 && currentStep!==3"
                    :disabled="$store.state.crm.files.length==0">{{$t('data_movement.next')}}
            </Button>
            <Button v-show="currentStep == 2" @click="redirectToModule" class="redirect-to-module">
                {{$t('data_movement.toModMapping')}}
            </Button>
            <Button type="primary" @click="backToIndex" v-show="currentStep == 4">{{$t('data_movement.toIndex')}}
            </Button>
        </div>
        <!--弹窗区域-->
        <!--取消数据迁移弹窗-->
        <Modal :visible.sync="cancelModal"
               :title="$t('data_movement.cancelDMTitle')"
               append-to-body
               width="520px">
            <span v-if="currentStep == 1">{{ $t('data_movement.cancelDMBody1') }}</span>
            <span v-if="currentStep == 2">{{ $t('data_movement.cancelDMBody2') }}</span>
            <span slot="footer"
                  class="dialog-footer">
                <Button @click="cancelModal = false">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        @click="ok">{{ $t('confirm') }}</Button>
            </span>
        </Modal>
        <!--重置字段映射弹窗-->
        <Modal :visible.sync="resetModal"
               :title="$t('data_movement.resetMapping')"
               append-to-body
               width="520px">
            <span>{{ $t('data_movement.resetMappingBody') }}</span>
            <span slot="footer"
                  class="dialog-footer">
                <Button @click="resetModal = false">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        @click="resetConfirm">{{ $t('confirm') }}</Button>
            </span>
        </Modal>
        <failedDataDrawer :visible.sync="visible"></failedDataDrawer>
        <Modal :visible.sync="leavePageModal"
               class="modal-footer-margin"
               :modal-append-to-body="false"
               @closed="$store.state.app.currentPageName='dataMovement'"
               width="360px">
            <p slot="title">
                <span>{{$t('mail.leaveConfirm')}}</span>
            </p>
            <div v-if="stepView==='fieldMapping'">
                <p>确定离开？当前您正在进行字段映射，如果离开，则会导致已经映射的字段信息丢失</p>
            </div>
            <div v-else>
                <p>确定离开？当前您正在进行数据迁移，建议保持在当前页面等待迁移结果</p>
            </div>
            <div slot="footer">
                <Button @click="handleLeaveConfirm">确认离开</Button>
                <Button type="primary" @click="handleLeaveCancel">留在此页</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import dataMoveUpload from './Components/Html/dataMovement/dataMoveUpload';
    import moduleFileMapping from './Components/Html/dataMovement/moduleFileMapping';
    import fieldMapping from './Components/Html/dataMovement/fieldMapping';
    import dataMovementComplete from './Components/Html/dataMovement/dataMovementComplete';
    import dataMovementAllCompleted from './Components/Html/dataMovement/dataMovementAllCompleted';
    import mySteps from './Components/Html/dataMovement/steps/steps';
    import { mapState } from 'vuex';
    import failedDataDrawer from './Components/Html/dataMovement/FailedDataDrawer';
    import { dataMovement } from '@/api/crm';

    export default {
        name: 'dataMovement',
        components: {
            dataMoveUpload,
            moduleFileMapping,
            fieldMapping,
            dataMovementComplete,
            dataMovementAllCompleted,
            mySteps,
            failedDataDrawer
        },
        data() {
            return {
                stepView: 'dataMoveUpload',
                currentStep: 0,
                isUploadFiles: false, // 是否上传文件
                cancelModal: false, // 是否启用弹窗
                resetModal: false, // 是否启用重置弹窗
                stepArray: [],
                isFinished: false, // 上传进度
                isDMFinished: false, // 数据迁移进度
                isDMAborted: false, // 数据迁移是否已中止
                visible: false,
                leavePageModal: false, // 控制离开页面的弹窗
                toRouterName: '', // 要跳转去的路由name
                toRouterObj: null, // fix bug ID1007772
                isBackToIndex: false
            };
        },
        computed: {
            ...mapState({
                user_id: state => state.userId,
                enterpriseId: state => state.enterpriseId,
                fieldMappingData: state => state.crm.fieldMappingData,
                fileToMods: state => state.crm.fileToMods,
                files: state => state.crm.files,
                percent: state => state.crm.percent
            })
        },
        created() {
            this.$store.state.crm.resetAutoMapping = false;
            this.stepArray = [this.$t('crm.Table.csv_upload'), this.$t('crm.Table.module_file_mapping'), this.$t('crm.Table.field_mapping'), this.$t('crm.Table.csv_upload_completed')];
            const step = parseInt(localStorage.getItem('currentStep')) || 0;
            this.currentStep = step;
            const flag = localStorage.getItem('returnFlag');
            // 初始步骤 currentStep 为0 并且不是返回首页的操作
            if (this.currentStep === 0 && !flag) {
                // 判断是否之前有进度
                this.checkProcess();
            }
        },
        methods: {
            // 自动映射
            automaticM() {
                this.$store.state.crm.resetAutoMapping = false;
                this.$refs.dataMovement.resetMapping();
            },
            /** 步骤条下一步 */
            nextStep() {
                this.isUploadFiles = true;
                // 上传步骤
                if (this.currentStep === 0) {
                    if (this.$store.state.crm.files.length === 0) {
                        this.$Message.warning('请先上传文件');
                        return;
                    }
                    if (!this.isFinished) {
                        this.$Message.warning('文件尚未上传完成');
                        return;
                    }
                }
                // 模块-文件映射步骤
                if (this.currentStep === 1) {
                    if (this.$store.state.crm.contactNum === 0 || this.$store.state.crm.customerNum === 0 || this.$store.state.crm.inquiryNum === 0) {
                        this.$Message.warning('请确保每个模块都有文件映射');
                        return;
                    }
                    if (this.$store.state.crm.customerNum > 1) {
                        this.$Message.warning('客户管理模块只能映射一个文件');
                        return;
                    }
                    const temp = this.$store.state.crm.fileToMods;
                    const file = this.$store.state.crm.files;
                    const flag1 = Object.entries(temp).some(([fileName, modsObj]) => {
                        return modsObj.length === 0;
                    });
                    const flag2 = Object.keys(temp).length !== file.length;
                    if (flag1 || flag2) {
                        this.$Message.warning('请确保每个文件至少映射一个模块');
                        return;
                    }
                }
                // 字段映射步骤
                if (this.currentStep === 2) {
                    // debugger
                    const orgId = this.enterpriseId;
                    const userId = this.user_id;
                    // 格式化数据, 并进行校验
                    const data = this.format_fieldMappingData();
                    localStorage.setItem('DMdata', JSON.stringify(data));
                    // 校验未通过, 程序停止执行
                    if (!data) {
                        return undefined;
                    }
                    const sheet = {};
                    this.files.forEach(item => {
                        this.$set(sheet, item.cname, item.sheets);
                    });
                    const tempData = {};
                    tempData.orgId = orgId;
                    tempData.userId = userId;
                    tempData.data = data;
                    tempData.sheet = sheet;
                    // 导入excel文件
                    dataMovement.transfer(JSON.parse(JSON.stringify(tempData)));
                }
                if (this.currentStep !== '4') {
                    this.currentStep++;
                }
            },
            backToIndex() {
                this.$store.state.crm.files = [];
                this.stepView = 0;
                this.currentStep = 0;
                this.$store.state.crm.isClear = true;
                this.isFinished = false;
                this.isDMAborted = false;
                this.isBackToIndex = true;
                /** 清除所有的vuex */
                this.clearAllVueX();
                localStorage.removeItem('currentStep');
                this.removeLocalItems();
                localStorage.removeItem('files');
                localStorage.removeItem('fileToMods');
                localStorage.removeItem('contactNum');
                localStorage.removeItem('customerNum');
                localStorage.removeItem('inquiryNum');
                localStorage.removeItem('percent');
                localStorage.removeItem('DMdata');
                localStorage.setItem('returnFlag', 1);
            },
            redirectToModule() {
                this.currentStep = 1;
                this.$store.state.crm.fieldMappingData = {};
                this.$store.state.crm.fieldsSelected = [];
            },
            isUploadFinished(isUploadFinished) {
                this.isFinished = isUploadFinished;
            },
            isNoFiles(val) {
                this.isFinished = false;
            },
            /** 放弃迁移弹窗 */
            /** 取消迁移 */
            ok() {
                this.cancelModal = true;
                this.$store.state.crm.files = [];
                this.cancelModal = false;
                this.$store.state.crm.isClear = true;
                this.isFinished = false;
                this.isDMAborted = false;
                /** 清除所有的vuex todo */
                this.clearAllVueX();
                this.removeLocalItems();
                this.currentStep = 0;
            },
            removeLocalItems() {
                const arr = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.indexOf('.xls') !== -1) {
                        arr.push(key);
                    }
                }
                for (let j = 0; j < arr.length; j++) {
                    localStorage.removeItem(arr[j]);
                }
                localStorage.removeItem('currentStep');
                localStorage.removeItem('files');
                localStorage.removeItem('fileToMods');
                localStorage.removeItem('contactNum');
                localStorage.removeItem('customerNum');
                localStorage.removeItem('inquiryNum');
                localStorage.removeItem('percent');
                localStorage.removeItem('DMdata');
                localStorage.removeItem('filesSucc');
                localStorage.removeItem('fileFlag');
            },
            /** 重置映射 */
            resetConfirm() {
                this.$store.state.crm.fieldMappingData = [];
                this.$store.state.crm.resetAutoMapping = true;
                this.$refs.dataMovement.resetMapping();
                this.$store.state.crm.fieldsSelected = [];
                this.resetModal = false;
            },
            /** 清除所有的vuex */
            clearAllVueX() {
                this.$store.state.crm.files = [];
                this.$store.state.crm.filesSucc = [];
                this.$store.state.crm.filesFailed = [];
                this.$store.state.crm.customerNum = 0;
                this.$store.state.crm.inquiryNum = 0;
                this.$store.state.crm.contactNum = 0;
                this.$store.state.crm.fileToMods = {};
                this.$store.state.crm.fieldsInFiles = [];
                this.$store.state.crm.fieldMappingData = {};
                this.$store.commit('setPercent', 0);
                this.$store.state.crm.fieldsSelected = [];
            },
            format_fieldMappingData() {
                if (Object.keys(this.fieldMappingData).length === 0) {
                    this.$Message.error('未选择字段, 无法进行下一步, 请重试!');
                    return undefined;
                }
                if (Object.keys(this.fieldMappingData).length < this.$store.state.crm.files.length) {
                    this.$Message.error('请确保每个文件进行字段映射');
                    return undefined;
                }
                const result = {};
                const temp = this.fieldMappingData;
                const existed_relatedField = [];
                // let have_no_email = 0;
                let have_no_name = 0;
                let flag = Object.entries(temp).some(([fileName, mappingObj]) => {
                    // debugger
                    const moduleObj = {};
                    // 格式化当前 file 的 mappingObj 并存入 moduleObj
                    const duplicated = Object.entries(mappingObj).some(([fieldIndex, relatedField]) => {
                        const module = Object.keys(relatedField)[0];
                        const storageName = Object.values(relatedField)[0];
                        if (existed_relatedField.includes(storageName) && !['国家地区', '公司名称', '电话', '负责人', '创建时间', '创建人', undefined, ''].includes(storageName)) {
                            this.$resetMessage.error('字段重复, 每个模块下的字段只能映射一次');
                            return true;
                        } else {
                            existed_relatedField.push(storageName);
                        }
                        if (!Object.prototype.hasOwnProperty.call(moduleObj, module)) {
                            moduleObj[module] = {};
                        }
                        moduleObj[module][fieldIndex] = storageName;
                    });

                    if (duplicated) {
                        return true;
                    }
                    /* 检验 moduleObj */
                    // 判断是否有文件未勾选对应字段
                    if (Object.keys(moduleObj).length === 0) {
                        this.$resetMessage.error(`${this.formatName(fileName)}未选择字段, 无法进行下一步, 请重试!`);
                        return true;
                    }
                    let have_no_companyName = true;
                    let have_no_manager = true;
                    const failed = Object.entries(moduleObj).some(([module, mappingObj]) => {
                        // debugger
                        let storageNames = Object.values(mappingObj);
                        storageNames = storageNames.filter(item => item !== '');
                        // 检查必填项
                        if (module === '3') {
                            storageNames = storageNames.filter(item => item !== undefined);
                        }
                        if (module === '1') {
                            // "国家地区"字段允许重复, 先把它去掉
                            storageNames = storageNames.filter(item => item !== '国家地区');
                            storageNames = storageNames.filter(item => item !== undefined);
                        }
                        if (module === '2') {
                            // "电话"字段允许重复, 先把它去掉
                            // "社交平台"字段允许重复, 先把它去掉
                            storageNames = storageNames.filter(item => item !== '电话');
                            storageNames = storageNames.filter(item => item !== undefined);
                            storageNames = storageNames.filter(item => item.indexOf('社交平台') === -1);
                        }

                        // 通过上述三个必填项的校验, 检查剩下两个特殊必填项
                        if (storageNames.includes('公司名称')) {
                            if (have_no_companyName) {
                                have_no_companyName = false;
                            } else {
                                this.$resetMessage.error(`${this.formatName(fileName)} 勾选【公司名称】重复, 无法进行下一步, 请重试!`);
                                return true;
                            }
                        }
                        if (storageNames.includes('负责人')) {
                            if (have_no_manager) {
                                have_no_manager = false;
                            } else {
                                this.$resetMessage.error(`${this.formatName(fileName)} 勾选【负责人】重复, 无法进行下一步, 请重试!`);
                                return true;
                            }
                        }

                        // 校验重复勾选
                        const duplicate_keys = [];
                        const uniq_storageNames = [...new Set(storageNames)];
                        // '国家地区', '公司名称', '电话', '负责人', '创建时间', '创建人'
                        const arr = ['国家地区', '公司名称', '电话', '负责人', '创建时间', '创建人'];
                        uniq_storageNames.filter(item => { return !arr.includes(item); }).forEach(item => {
                            if (storageNames.indexOf(item) !== storageNames.lastIndexOf(item)) {
                                duplicate_keys.push(item);
                            }
                        });
                        if (duplicate_keys.length) {
                            this.$resetMessage.error(`${this.formatName(fileName)} 勾选 ${duplicate_keys.map(item => `【${item}】`).join(', ')} 重复, 无法进行下一步, 请重试!`);
                            return true;
                        }
                    });

                    if (failed) {
                        return true;
                    }
                    if (have_no_companyName) {
                        this.$resetMessage.error(`${this.formatName(fileName)}未勾选必填项【公司名称】, 无法进行下一步, 请重试!`);
                        return true;
                    }
                    if (have_no_manager) {
                        this.$resetMessage.error(`${this.formatName(fileName)}未勾选必填项【负责人】, 无法进行下一步, 请重试!`);
                        return true;
                    }

                    // 校验完毕, 没有问题
                    result[fileName] = this.$deepClone(moduleObj);
                });
                console.log(result);
                Object.entries(temp).forEach(([fileName, mappingObj]) => {
                    const moduleObj = {};
                    // 格式化当前 file 的 mappingObj 并存入 moduleObj
                    const duplicated = Object.entries(mappingObj).some(([fieldIndex, relatedField]) => {
                        const module = Object.keys(relatedField)[0];
                        const storageName = Object.values(relatedField)[0];
                        if (!Object.prototype.hasOwnProperty.call(moduleObj, module)) {
                            moduleObj[module] = {};
                        }
                        moduleObj[module][fieldIndex] = storageName;
                    });
                    Object.entries(moduleObj).forEach(([module, mappingObj]) => {
                        // debugger
                        const storageNames = Object.values(mappingObj);
                        // 检查必填项
                        // debugger
                        if (storageNames.includes('姓名')) {
                            // debugger
                            have_no_name++;
                        }
                        // if (storageNames.includes('邮箱')) {
                        //     have_no_email++;
                        // }
                    });
                });
                // debugger
                if (have_no_name === 0) {
                    // debugger
                    flag = true;
                    this.$resetMessage.error('必填项【姓名】字段未被勾选, 无法进行下一步，请重试！');
                }
                // 放开邮箱必填 22-04-12
                // if (have_no_email === 0) {
                //     flag = true;
                //     this.$resetMessage.error('必填项【邮箱】字段未被勾选, 无法进行下一步，请重试！');
                // }
                if (!flag) {
                    // 校验通过, 返回格式化后的数据
                    return result;
                }
            },
            openFailedData() {
                this.visible = true;
            },
            handleLeaveCancel() {
                this.leavePageModal = false;
                this.toRouterName = '';
                this.toRouterObj = null;
                this.$store.state.app.currentPageName = 'dataMovement';
            },
            handleLeaveConfirm() {
                this.leavePageModal = false;
                if (this.toRouterObj) {
                    this.$router.push(this.toRouterObj);
                }
            },
            // 获取导入文件的进度条
            checkProcess() {
                const userId = this.user_id;
                const orgId = this.enterpriseId;
                dataMovement.percent({
                    userId,
                    orgId
                }).then(res => {
                    const percent = parseInt(res.data.percent * 100);
                    /**
                     * @description: 每次进入数据迁移页面 都要 请求一次percent接口来保证用户掉线还能回到之前迁移的页面
                     * percent： 100 -- 迁移完成页面 ， 0----什么也不用做，0~100---进度条页面 */
                    if (percent === 100 || percent > 100) {
                        // 表示数据迁移已经完成 需要调到最后一页
                        this.isDMFinished = true;
                        this.currentStep = 4;
                    } else if (percent > 0 && percent < 100) {
                        // 需要跳转到进度条页面
                        // 获取文件名
                        // 跳转到进度条页面
                        this.currentStep = 3;
                    }
                });
            },
            formatName(val) {
                const head = val.slice(0, val.lastIndexOf('_'));
                const tail = val.slice(val.lastIndexOf('.'));
                return head + tail;
            }
        },
        watch: {
            currentStep(val) {
                localStorage.setItem('currentStep', val);
                switch (val) {
                    case 0:
                        this.stepView = 'dataMoveUpload';
                        break;
                    case 1:
                        this.stepView = 'moduleFileMapping';
                        break;
                    case 2:
                        this.stepView = 'fieldMapping';
                        break;
                    case 3:
                        this.stepView = 'dataMovementComplete';
                        break;
                    case 4:
                        this.stepView = 'dataMovementAllCompleted';
                        break;
                }
            },
            percent(val) {
                if (val === 100 && this.currentStep !== 4) {
                    this.currentStep = 4;
                }
            },
            files: {
                handler(val) {
                    if (val.length === 0) {
                        this.isFinished = false;
                    }
                },
                immediate: true,
                deep: true
            }

        },
        beforeRouteLeave(to, from, next) {
            if (to.name === 'login') {
                next();
            } else if (this.toRouterObj && to.name === this.toRouterObj.name && !this.leavePageModal) {
                next();
            } else if (this.stepView === 'fieldMapping' || this.stepView === 'dataMovementComplete') {
                const { name, params } = to;
                this.toRouterObj = { name, params };
                this.leavePageModal = true;
            } else {
                const { name, params } = to;
                this.toRouterObj = { name, params };
                next();
            }
        }
    };
</script>

<style scoped lang="less">
    .data-movement {
        height: 100%;
        width: 100%;

        .data-movement-top {
            background-color: #FFFFFF;
            box-shadow: inset 0 -1px 0 0 #EAEAEA;
            height: 76px;
            width: 100%;
            top: 0;
            position: absolute;

            .data-movement-title {
                font-family: PingFangSC-Regular;
                display: inline-block;
                font-size: 16px;
                /*color:  rgba(0,6,15,0.40);*/
                color: rgba(0, 0, 0, 0.80);
                letter-spacing: 0;
                line-height: 18px;
                margin-left: 30px;
                margin-top: 27px;
                margin-bottom: 27px;
                margin-right: 5px;
            }
            .data-movement-steps {
                position: absolute;
                top: 0;
                //居中
                left: 50%;
                width: 500px;
                margin-left: -250px;
            }
            .data-movement-failed-data {
                position: absolute;
                top: 16px;
                //居中
                left: 96%;
                /*margin-left: -250px;*/
            }
        }
        .data-movement-center {
            /*height: calc(100% - 138px);*/
            position: absolute;
            overflow: hidden;
            top: 76px;
            bottom: 60px;
            width: 100%;
            height: calc(100% - 138px);
            /*height: calc(100% - 138px);*/
            .data-movement-upload {
                margin: 50px 120px;
                width: auto;
                height: 83%;
            }
        }
        .data-movement-center-bgc-pre {
            background-color: #f5f6f9;
        }
        .data-movement-center-bgc-next {
            background-color: #FFFFFF;
        }
        .data-movement-bottom {
            height: 63px;
            width: 100%;
            bottom: 0;
            position: absolute;
            border-top: 1px solid #EAEAEA;
            padding-right: 97px;
            .el-button {
                float: right;
                margin-right: 23px;
                margin-top: 11px;
                margin-bottom: 11px;
            }
            .cancel-data-movement {
                font-family: PingFangSC-Regular;
                font-size: 14px;
                color: #EA4335;
                letter-spacing: 0;
                cursor: pointer;
                margin-left: 30px;
                /*margin-top: 11px;*/
                /*margin-bottom: 11px;*/
                position: relative;
                top: 35%;
            }
            .reset-data-movement {
                font-family: PingFangSC-Regular;
                font-size: 14px;
                color: #EA4335;
                letter-spacing: 0;
                cursor: pointer;
                margin-left: 20px;
                position: relative;
                top: 35%;
            }
            .redirect-to-module {
                color: #fa8241 !important;
                background: #FFF !important;
                border-color: #fa8241 !important;
                &:hover {
                    background-color: #fff4ea !important;
                }
                &:focus {
                    background-color: #fff4ea !important;
                }
                &:active {
                    background: #FFE1D1 !important;
                }
            }
        }
    }
</style>
