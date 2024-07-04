<template>
  <Modal :visible.sync="upperModalDialog" :title="modalTitle" width="600px" append-to-body :before-close="resetData" :close-on-click-modal='false'>
    <div style="padding: 0 20px;max-height: 435px">
      <Form ref="upperForm" class="_dataFormMB-10" :model="dataForm" :rules="rules" label-position="left" label-width="120px">
        <!-- :label="$t('highSeasSetting.inquriry.persons')" -->
        <FormItem prop="userIds">
          <span slot="label" :title="per" class="_form-item_label _text__overflow-com">{{per}}</span>
          <div>
            <selectTree ref="upperLimitSelectedTree" v-bind:loading.sync="childrenLoading" :width="inputWidth" :resMsg="updateUserIds"></selectTree>
          </div>
        </FormItem>
        <FormItem :label="$t('highSeasSetting.inquriry.maxCount')" prop="maxCount">
          <span slot="label" :title="lim" class="_form-item_label _text__overflow-com">{{lim}}</span>
          <ElInput v-model="dataForm.maxCount" :placeholder="$t('highSeasSetting.inquriry.pleaseWrite')" :style="{width:inputWidth}" @change="handleChange"></ElInput>
        </FormItem>
        <FormItem prop="containOwn">
          <Checkbox style="margin-left:-120px" v-model="dataForm.containOwn" :label="$t('highSeasSetting.inquriry.containOwn')"></Checkbox>
        </FormItem>
        <FormItem prop="containDeal">
          <Checkbox style="margin-left:-120px" v-model="dataForm.containDeal" :label="$t('highSeasSetting.inquriry.containDeal')"></Checkbox>
        </FormItem>
      </Form>
    </div>
    <div slot="footer">
      <Button @click="close">{{$t('cancel')}}</Button>
      <Button type="primary" class="_upperLimitSave _upperLimitEdit" :loading="blockUpLoading || childrenLoading" @click="submitConfirm">{{$t('save')}}</Button>
      <Modal :title="$t('highSeasSetting.inquriry.confirmRule')" :visible.sync="dialogVisible" append-to-body :show-close="false" width="600px">
        <div style="min-height: 230px">
          <div>
            <span>{{$t('highSeasSetting.inquriry.confirmContent')}}</span>
          </div>
          <div style="margin-top: 20px">
            <span>{{$t('highSeasSetting.inquriry.overLimit')}}</span><span></span><b>{{limitUsers}}</b>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <Button @click="cancel">{{$t('cancel')}}</Button>
          <Button type="primary" class="_upperLimitSave _upperLimitEdit" :disabled="childrenLoading" @click="submit">{{$t('keepSaving')}}</Button>
        </span>
      </Modal>
    </div>
  </Modal>
</template>

<script>
    import {
        createUserLimit,
        editUserLimit,
        getForbiddenUserList,
        checkUserLimit
    } from '@/api/systemSettings/high-seas-setting/upperLimit';
    import { modalData } from '../baseDatas/datas';
    import selectTree from '@/views/main-components/el-select-tree';
    export default {
        name: 'upperLimitModal',
        components: { selectTree },
        computed: {
            modalTitle() {
                return this.dataForm.id
                    ? this.$t('highSeasSetting.inquriry.edit')
                    : this.$t('highSeasSetting.inquriry.add');
            },
            per() {
                return this.$t('highSeasSetting.inquriry.persons');
            },
            lim() {
                return this.$t('highSeasSetting.inquriry.maxCount');
            }
        },
        props: {
            modalType: {
                type: String,
                required: true,
                default: () => 'create'
            }
        },
        data() {
            return {
                ...this.$_.cloneDeep(modalData),
                rules: {
                    userIds: {
                        required: true,
                        message: this.$t('highSeasSetting.inquriry.errorRule1')
                    },
                    maxCount: {
                        required: true,
                        message: this.$t('highSeasSetting.inquriry.errorRule2')
                    }
                }
            };
        },
        methods: {
            updateUserIds({ ids, idNames }) {
                this.dataForm.userIds = ids.join(',');
            },
            init(data) {
                for (const item in this.dataForm) {
                    if (item === 'containOwn' || item === 'containDeal') {
                        this.dataForm[item] = Boolean(data[item]) || false;
                    } else if (item === 'maxCount') {
                        this.dataForm[item] = Number(data[item]) || 1;
                    } else if (item === 'id' || item === 'userIds') {
                        this.dataForm[item] = data[item] || '';
                    }
                }
            },
            close() {
                this.upperModalDialog = false;
                this.resetData();
            },
            cancel() {
                this.dialogVisible = false;
                this.blockUpLoading = false;
            },
            async submitConfirm(type = 'create') {
                this.$refs.upperForm.validate(async valid => {
                    if (valid) {
                        this.blockUpLoading = true;
                        const data = await checkUserLimit({
                            userIds: this.dataForm.userIds,
                            maxCount: this.dataForm.maxCount,
                            containOwn: Number(this.dataForm.containOwn),
                            containDeal: Number(this.dataForm.containDeal)
                        });
                        if (data.code === '1') {
                            const list = data.data || [];
                            if (list.length) {
                                this.limitUsers = list.map(v => `${v.userName}(${v.hasCount})`).join(',');
                                this.dialogVisible = true;
                            } else {
                                this.submit();
                            }
                        } else {
                            this.$Message.error(data.message);
                        }
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            async submit() {
                const fn = {
                    create: createUserLimit,
                    edit: editUserLimit
                };
                const msg = {
                    create: '创建',
                    edit: '编辑'
                };
                const data = await fn[this.modalType]({
                    id: this.dataForm.id,
                    userIds: this.dataForm.userIds,
                    maxCount: this.dataForm.maxCount,
                    containOwn: Number(this.dataForm.containOwn),
                    containDeal: Number(this.dataForm.containDeal)
                });
                if (data.code === '1') {
                    this.$Message.success(`${msg[this.modalType]}成功`);
                    this.$emit('success');
                    this.close();
                } else {
                    console.log(data.message);
                    this.$Message.error(data.message);
                }
                this.blockUpLoading = false;
            },
            resetData() {
                setTimeout(() => {
                    const setRestData = this.$_.cloneDeep(modalData);
                    for (const item in setRestData) {
                        this[item] = setRestData[item];
                    }
                    this.$refs.upperLimitSelectedTree.resetData();
                    this.$refs.upperForm.resetFields();
                }, 500);
            },
            handleChange(val) {
                this.dataForm.maxCount = this.$dym.strToNumRange(val);
            },
            stringToListNumber(str) {
                str = str || '';
                return str.split(',').map(v => Number(v));
            },
            filterListGarbageDatas(originList, { id, userIds }) {
                if (!id) return originList;
                return originList.filter(v => !this.stringToListNumber(userIds).some(m => m === v));
            },
            async show(row) {
                this.upperModalDialog = true;
                if (row && this.modalType === 'edit') {
                    this.init(row);
                }
                try {
                    const res = await getForbiddenUserList();
                    if (res.code === '1') {
                        this.$refs.upperLimitSelectedTree.init(
                            this.filterListGarbageDatas(
                                [...new Set((res.data || []).map(v => Number(v)))],
                                this.dataForm
                            ),
                            this.dataForm.id
                                ? this.stringToListNumber(this.dataForm.userIds)
                                : []
                        );
                    }
                } catch (error) {
                    console.error(error);
                    this.$refs.upperLimitSelectedTree.init(
                        this.filterListGarbageDatas([], this.dataForm),
                        this.dataForm.id ? this.stringToListNumber(this.dataForm.userIds) : []
                    );
                }
            }
        }
    };
</script>

<style scoped lang='scss'>
@import "~@/styles/moduleScss/upperLimit/modal";
</style>
