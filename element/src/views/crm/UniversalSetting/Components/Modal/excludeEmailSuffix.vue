<template>
    <Modal :visible="visible"
           :title="$t('crm.UniSet.title_excludeEmailSuffix')"
           width="800px"
           append-to-body
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :modal-append-to-body="false"
           @close="cancel"
           class="excludeEmailSuffix vertical-center-modal">
        <!-- loading -->
        <Spin v-if="isLoading"
              fix>
            <Icon type="ios-loading"
                  size=18
                  class="demo-spin-icon-load"></Icon>
        </Spin>

        <!-- 系统自动排除 -->
        <div class="excludeEmailSuffix__system__title">{{ $t('crm.UniSet.systemAutoExclude') }}</div>
        <div class="excludeEmailSuffix__system__content">{{ systemSuffixArr.join(';') }}</div>

        <!-- 手动排除 -->
        <div class="excludeEmailSuffix__custom__title">{{ $t('crm.UniSet.manualExclude') }}</div>
        <div class="excludeEmailSuffix__custom__input__group">
            <Input v-model="addedSuffix"
                   @keydown.enter.native="handleAddSuffix"
                   class="excludeEmailSuffix__custom__input__ipt">
                <template slot="prepend">@</template>
            </Input>
            <Button type="success"
                    size="small"
                    @click="handleAddSuffix"
                    class="excludeEmailSuffix__custom__input__btn">{{ $t('crm.Modal.operate_add') }}</Button>
        </div>
        <div class="excludeEmailSuffix__custom__content">
            <div v-for="item in newCustomSuffixArr"
                 :key="item"
                 class="excludeEmailSuffix__custom__item">
                <span class="excludeEmailSuffix__custom__item__content">{{ item }}</span>
                <span class="excludeEmailSuffix__custom__item__operate">
                    <Tooltip transfer
                             :content="$t('delete')">
                        <Icon custom="custom-modal-close"
                              @click.native="handleRemoveSuffix(item)"></Icon>
                    </Tooltip>
                </span>
            </div>
        </div>

        <div slot="footer">
            <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
            <Button type="primary"
                    @click="ok">{{ $t('crm.Modal.modal_ok') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import Utils from '@/utils/index';
    import { getSystemExcludeSuffixes, getCustomExcludeSuffixes } from '@/api/reusableApi/common';

    export default {
        name: 'excludeEmailSuffix',
        props: [
            'visible'
        ],
        computed: {
            ...mapState([
                'enterpriseId'
            ])
        },
        data() {
            return {
                /* 全局 */
                isLoading: true,

                /* 系统自动排除 */
                systemSuffixArr: [],

                /* 手动排除 */
                // 接口请求得到的排除后缀数组, 赋值保持不变
                customSuffixArr: [],
                // 页面操作的排除后缀数组, 与页面 显示/新增/删除 动作关联
                newCustomSuffixArr: [],
                // 新增后缀输入框 model
                addedSuffix: ''
            };
        },
        methods: {
            // 获取邮件后缀
            getSuffixes() {
                this.isLoading = true;

                util.axios.all([getSystemExcludeSuffixes(), getCustomExcludeSuffixes({ orgId: this.enterpriseId })]).then(util.axios.spread((...responses) => {
                    if (responses.some(item => item.code !== '1')) {
                        this.isLoading = false;
                        // 未请求到数据
                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));

                        return;
                    }

                    let res = responses[0];
                    if (res.code === '1') {
                        this.systemSuffixArr = res.data;
                    }

                    res = responses[1];
                    if (res.code === '1') {
                        this.customSuffixArr = res.data;
                        this.newCustomSuffixArr = this.customSuffixArr.slice();
                    }

                    this.isLoading = false;
                })).catch(e => {
                    this.isLoading = false;
                    // 未请求到数据
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                });
            },
            // 新增邮件后缀
            handleAddSuffix() {
                // 所有邮箱后缀
                const allSuffixes = this.systemSuffixArr.concat(this.newCustomSuffixArr);
                // 新增邮箱后缀
                const addedSuffix = `@${this.addedSuffix}`;

                // 正则校验
                const emailSuffixReg = Utils.regExp.emailSuffix;
                if (!emailSuffixReg.test(addedSuffix)) {
                    // 邮箱后缀正则校验未通过, 新增失败
                    this.$Message.warning(this.$t('crm.UniSet.info_illegalEmailSuffix'));

                    return;
                }

                if (allSuffixes.find(item => item === addedSuffix)) {
                    // 邮箱后缀已存在, 新增失败

                    this.$Message.warning(this.$t('crm.UniSet.info_repeatEmailSuffix'));
                    return;
                }

                // 新增成功
                this.newCustomSuffixArr.unshift(addedSuffix);
                this.addedSuffix = '';
            },
            // 删除邮件后缀
            handleRemoveSuffix(suffix) {
                this.newCustomSuffixArr = this.newCustomSuffixArr.filter(item => item !== suffix);
            },
            ok() {
                this.isLoading = true;

                // 筛选新增邮箱后缀
                let addList = this.newCustomSuffixArr.filter(item => !this.customSuffixArr.find(i => i === item));
                addList = [...new Set(addList)];
                // 筛选被删除邮箱后缀
                let deleteList = this.customSuffixArr.filter(item => !this.newCustomSuffixArr.find(i => i === item));
                deleteList = [...new Set(deleteList)];

                // 没有要保存的数据, 直接提示"保存成功"并退出流程
                if (!(addList.length || deleteList.length)) {
                    this.$Message.success(this.$t('crm.Table.success_save'));

                    this.cancel();
                    this.isLoading = false;

                    return;
                }

                util.ajaxJson({
                    url: '/crm/contactsEmailSuffix/addEmailSuffix',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        deleteList,
                        addList
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.$Message.success(this.$t('crm.Table.success_save'));

                        this.cancel();
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_save'));
                    }
                    this.isLoading = false;
                }).catch(e => {
                    this.isLoading = false;
                    this.$Message.error(this.$t('crm.Table.error_save'));
                });
            },
            cancel() {
                this.$emit('update:visible', false);
            },
            clearData() {
                this.isLoading = true;
                this.systemSuffixArr = [];
                this.customSuffixArr = [];
                this.newCustomSuffixArr = [];
                this.addedSuffix = '';
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.getSuffixes();
                    } else {
                        this.clearData();
                    }
                }
            }
        }
    };
</script>

<style lang="less">
    .excludeEmailSuffix {
        .el-dialog {
            padding: 30px 24px;
        }

        .el-dialog__header {
            padding: 0;
        }

        .el-dialog__headerbtn {
            position: absolute;
            top: 30px;
            right: 24px;
        }

        .el-dialog__body {
            padding: 0;
        }

        .el-dialog__footer {
            padding: 0;
        }

        .excludeEmailSuffix__system__title {
            margin-top: 20px;
            font-size: 16px;
            font-weight: 500;
        }

        .excludeEmailSuffix__system__content {
            margin-top: 20px;
            padding: 12px 20px;
            max-height: 197px;
            overflow-y: auto;
            border: 1px solid #C9C9C9;
            border-radius: 5px;
            word-wrap: break-word;
            word-break: break-all;
        }

        .excludeEmailSuffix__custom__title {
            margin-top: 20px;
            font-size: 16px;
            font-weight: 500;
        }

        .excludeEmailSuffix__custom__input__group {
            margin-top: 20px;

        }

        .excludeEmailSuffix__custom__input__ipt {
            width: 40%;
            margin-right: 12px;
        }

        .excludeEmailSuffix__custom__input__btn {

        }

        .excludeEmailSuffix__custom__content {
            margin-top: 20px;
            max-height: 177px;
            overflow-y: auto;

            .excludeEmailSuffix__custom__item {
                display: inline-flex;
                justify-content: space-between;
                align-items: center;
                margin: 0 5px;
                padding: 0 15px;
                border-radius: 20px;
                min-width: 30%;
                height: 25px;
                line-height: 25px;

                .excludeEmailSuffix__custom__item__content {
                    margin-right: 22px;
                }

                .excludeEmailSuffix__custom__item__operate {
                    visibility: hidden;

                    i {
                        cursor: pointer;
                    }
                }

                &:hover {
                    background: #F4F5F8;

                    .excludeEmailSuffix__custom__item__operate {
                        visibility: visible;
                    }
                }
            }
        }
    }
</style>
