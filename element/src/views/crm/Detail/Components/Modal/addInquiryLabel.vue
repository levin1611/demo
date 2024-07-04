<template>
    <div>
        <Modal :title="$t('crm.Modal.title_addLabel')"
               :visible="visible"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               width="520px"
               class="modal">
            <!-- loading -->
            <Spin fix v-if="loading"></Spin>

            <p class="layermain" style="margin:20px 0 10px 0;">
                {{ $t('crm.Modal.labelType') }}：
                <Select v-model="selectedLabels" filterable multiple style="width:300px;text-align: left">
                    <Option v-for="item in computed_selectOptions.tag" :value="item.attrName" :key="item.attrId"
                            :label="item.attrName"></Option>
                </Select>
            </p>
            <p class="addmark" @click="customShow === true ? customShow = false : customShow = true"
               v-text="customShow === true ? $t('crm.Modal.fold') : $t('crm.Modal.customLabel')"></p>
            <div v-if="customShow">
                <p class="layermain" style="margin:10px 0 10px 10px;">
                    {{ $t('crm.Modal.custom') }}：
                    <Input v-model="customLabelName" :placeholder="$t('crm.Modal.tip_select')"
                           style="width: 300px;margin-top:2px;"></Input>
                </p>

                <div class="color">
                    <ul>
                        <li v-for="(item, index) in colors"
                            :key="item.color"
                            @click="colorClick(index)"
                            :style="{background: item.color}">
                            <i v-if="item.show"
                               class="el-icon-check"></i>
                        </li>
                    </ul>
                    <div @click="submitCustomLabel"
                         id="submitCustomLabel">{{ $t('crm.Modal.add') }}</div>
                </div>
            </div>

            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button type="primary" :loading="saveLoading"
                        @click="ok"
                        class="piwik_add_inquiry_label">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmInquiry } from '@/api/crm/index';

    export default {
        name: 'addInquiryLabel',
        props: [
            'visible',
            'inquiryId',
            'flag_update_detail'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                selectOptions: state => state.crm.selectOptions
            }),

            computed_selectOptions() {
                const result = {};
                Object.entries(this.$deepClone(this.selectOptions)).forEach(([key, value]) => {
                    result[key] = value.filter(item => item.isAvailable === 1);
                });
                return result;
            } // 获取使用中(未停用)的通用设置下拉选项
        },
        data() {
            return {
                customShow: false,
                selectedLabels: [],
                customLabelName: '', // 自定义标签的文本
                colors: [
                    {
                        show: true,
                        color: '#4285F4'
                    },
                    {
                        show: false,
                        color: '#00CC99'
                    },
                    {
                        show: false,
                        color: '#15C5D4'
                    },
                    {
                        show: false,
                        color: '#7B66EE'
                    },
                    {
                        show: false,
                        color: '#FA8241'
                    }
                ], // 自定义标签颜色选框的选中状态，和颜色选框的颜色
                saveLoading: false,
                loading: false,
                inquiryDetail: {}
            };
        },
        methods: {
            colorClick(index) {
                this.colors.map((item, key) => {
                    if (key === index) {
                        item.show = true;
                    } else {
                        item.show = false;
                    }
                });
            }, // 点击颜色选框
            submitCustomLabel() {
                let flag = true;
                if (!this.customLabelName.trim()) {
                    this.$Message.error(this.$t('crm.Modal.error_emptyLabelName'));
                    flag = false;
                } else {
                    this.selectOptions.tag.some(item => {
                        if (item.attrName === this.customLabelName) {
                            flag = false;
                            this.$Message.error(this.$t('crm.Modal.error_duplicateLabelName'));
                            return true;
                        }
                    });
                }
                if (flag) {
                    this.$commonApi.attrSave({
                        orgId: this.enterpriseId,
                        typeId: 8,
                        attrName: this.customLabelName,
                        attrValue: this.colors.filter(item => {
                            return item.show === true;
                        })[0].color
                    }).then(response => {
                        if (response.code === '1') {
                            // 更新下拉数据
                            this.$store.dispatch('getSelectOptions');
                            this.$Message.success(this.$t('crm.Modal.success_newCustomLabel'));
                            this.customShow = false;
                            this.colorClick(0);
                            this.customLabelName = '';
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_newCustomLabel'));
                        }
                    });
                }
            }, // 提交自定义标签
            formatSelectedLabels(selectedArr, allArr) {
                const selectedLabels = [];
                for (const item of selectedArr) {
                    allArr.some(i => {
                        if (i.attrName === item) {
                            selectedLabels.push({
                                attrId: i.attrId - 0,
                                attrName: i.attrName,
                                attrValue: i.attrValue,
                                belongId: this.inquiryDetail.id - 0,
                                belongTable: 3,
                                orgId: this.enterpriseId - 0,
                                typeId: 8
                            });
                            return true;
                        }
                    });
                }
                return selectedLabels;
            }, // 通过 Select 绑定的被选中标签名称数组获取其他数据并格式化
            ok() {
                if (this.saveLoading) return;
                const sendLabels = this.formatSelectedLabels(this.selectedLabels, this.selectOptions.tag);
                // 防止多次点击提交
                this.saveLoading = true;
                crmInquiry.saveList({
                    listStr: JSON.stringify(sendLabels),
                    inquiryId: this.inquiryDetail.id
                }).then(response => {
                    if (response.code === '1') {
                        this.$saveLog({
                            operateType: 2,
                            operateModule: 3,
                            enterpriseId: this.enterpriseId,
                            inquiryId: this.inquiryDetail.id,
                            targetId: this.inquiryDetail.id,
                            userId: this.userId,
                            fullName: this.fullName,
                            prevObj: {
                                label: this.inquiryDetail.label.map(item => {
                                    const temp = Object.assign({}, item);
                                    delete temp.id;
                                    return temp;
                                })
                            },
                            currentObj: {
                                label: JSON.parse(response.data).map(item => {
                                    delete item.id;
                                    return item;
                                })
                            }
                        }, 'label');
                        const temp = Object.assign({}, this.inquiryDetail);
                        temp.label = JSON.parse(response.data);
                        this.$emit('update:flag_update_detail', !this.flag_update_detail);
                        this.$Message.success(this.$t('crm.Modal.success_addLabel'));
                        this.$emit('update:visible', false);
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_addLabel'));
                    }
                    // 使用延时防止可以再次提交
                    setTimeout(() => {
                        this.saveLoading = false;
                    }, 100);
                });
            }, // 添加
            cancel() {
                this.colorClick(0);
                this.$emit('update:visible', false);
            }, // 取消
            getInquiryInfo() {
                this.loading = true;
                crmInquiry.getInquiry({
                    id: this.inquiryId
                }).then(response => {
                    if (response.code === '1') {
                        this.inquiryDetail = response.data;
                        this.inquiryDetail.label = this.inquiryDetail.label ? JSON.parse(this.inquiryDetail.label) : [];
                        this.selectedLabels = this.inquiryDetail.label.map(item => {
                            return item.attrName;
                        });
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_getInquiryInfo'));
                    }
                    this.loading = false;
                }, error => {
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            } // 获取询盘信息和询盘所属公司信息
        },
        watch: {
            visible(val) {
                if (val) {
                    this.getInquiryInfo();
                } else {
                    this.selectedLabels = [];
                }
            }
        }
    };
</script>

<style scoped lang="less">

    .color {
        margin-top: 10px;
        margin-left: 125px;
        margin-bottom: 10px;
        position: relative;

        > ul {
            overflow: hidden;

            > li {
                width: 16px;
                height: 16px;
                line-height: 16px;
                text-align: center;
                color: #fff;
                float: left;
                cursor: pointer;
                margin-right: 25px;
            }
        }
    }

    #submitCustomLabel {
        /*完善为文字链样式*/
        /*color: #fc8b2f;*/
        color: #3b78de;
        cursor: pointer;
        position: absolute;
        top: 0;
        right: 65px;

        &:after {
            clear: both;
        }

        &:hover {
            color: #2d63bc;
            text-decoration: underline;
        }
    }

    .addmark {
        color: #3b78de;
    }

    .addmark:hover {
        color: #2d63bc;
        text-decoration: underline;
    }
</style>
