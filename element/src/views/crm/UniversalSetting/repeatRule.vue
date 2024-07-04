<template>
    <div style="padding: 40px 14%;">
        <Table :data="tableData"
               :row-class-name="rowClassName"
               :border="true"
               :show-header="false"
               :empty-text="$t('crm.UniSet.requestError')"
               v-loading="tableLoading || socialListLoading">
            <!-- 属性名 -->
            <TableColumn width="200" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    {{ attrNameToCn.get(scope.row.attrName) }}
                </template>
            </TableColumn>
            <!-- 操作栏 -->
            <TableColumn :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <!-- 邮箱 -->
                    <template v-if="scope.row.attrName === 'email'">
                        <Radio :value="true"
                               :label="true"
                               v-if="email_duplicate_check"
                               :disabled="true">{{ $t('crm.UniSet.uniq') }}</Radio>
                        <Radio :value="true"
                               :label="true"
                               v-else
                               :disabled="true">{{ $t('crm.UniSet.notUniq') }}</Radio>
                    </template>
                    <!-- 公司名称 -->
                    <template v-else-if="scope.row.attrName === 'companyName'">
                        <RadioGroup :value="attrValue.companyName">
                            <Radio label="1"
                                   @change="change_uniq_companyName('1')">{{ $t('crm.UniSet.uniqFuzzy') }}</Radio>
                            <Radio label="0"
                                   @change="change_uniq_companyName('0')">{{ $t('crm.UniSet.uniqPrecise') }}</Radio>
                        </RadioGroup>
                    </template>
                    <!-- 是否允许重复 -->
                    <template v-else-if="scope.row.attrName === 'mergeOperate'">
                        <RadioGroup :value="attrValue.mergeOperate">
                            <Radio label="0"
                                   @change="change_allow_merge('0')">{{ $t('crm.UniSet.notAllowed') }}</Radio>
                            <Radio label="1"
                                   @change="change_allow_merge('1')">{{ $t('crm.UniSet.allowed') }}</Radio>
                        </RadioGroup>
                    </template>
                    <template v-else>
                        <!-- 查重单选 -->
                        <RadioGroup :value="attrValue[scope.row.attrName]">
                            <Radio label="0"
                                    @change="change_uniq('0', scope.row)">{{ $t('crm.UniSet.notUniq') }}</Radio>
                            <Radio label="1"
                                    @change="change_uniq('1', scope.row)">{{ $t('crm.UniSet.uniq') }}</Radio>
                        </RadioGroup>

                        <!-- 电话查重文案提示 -->
                        <HelpTip v-if="scope.row.attrName === 'phone'"
                                 :title="$t('helpTip.phoneUniqRule')"
                                 style="margin-left: 5px;"></HelpTip>

                        <!-- 社交平台 -->
                        <Select v-model="selectedIds"
                                multiple
                                clearable
                                v-if="scope.row.attrName === 'socialPlatform' && attrValue.socialPlatform === '1'"
                                @change="(val) => { slectChange(val, scope.row) }"
                                style="margin-left:20px;width:300px;">
                            <Option :value="item.attrId"
                                :key="item.attrId"
                                :label="item.attrName"
                                v-for="item in socialPlatformOptions"></Option>
                        </Select>

                        <!-- 邮箱后缀查重弹框 -->
                        <span v-if="scope.row.attrName === 'emailSuffix' && attrValue.emailSuffix === '1'"
                              @click="toggleEmailSuffixModal"
                              class="excludeEmailSuffix__trigger">{{ $t('crm.UniSet.excludeEmailSuffix') }}</span>
                    </template>
                </template>
            </TableColumn>
        </Table>

        <!-- 排除邮箱后缀弹框 -->
        <ExcludeEmailSuffix :visible.sync="visible_excludeEmailSuffix"></ExcludeEmailSuffix>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import ExcludeEmailSuffix from '@/views/crm/UniversalSetting/Components/Modal/excludeEmailSuffix';

    export default {
        name: 'repeatRule',
        components: {
            ExcludeEmailSuffix
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                email_duplicate_check: (state) => state.crm.email_duplicate_check
            })
        },
        data() {
            return {
                typeId: 11,
                tableData: [],
                tableLoading: false,
                socialListLoading: false,
                attrValue: {},
                attrId: {},
                // 多语言
                attrNameToCn: new Map([
                    ['emailSuffix', this.$t('crm.UniSet.emailSuffix')],
                    ['email', this.$t('crm.UniSet.email')],
                    ['phone', this.$t('crm.UniSet.phone')],
                    ['whatsapp', 'WhatsApp'],
                    ['instagram', 'Instagram'],
                    ['weChat', this.$t('crm.UniSet.weChat')],
                    ['companyName', this.$t('crm.UniSet.companyName')],
                    ['mergeOperate', this.$t('crm.UniSet.mergeOperate')],
                    ['socialPlatform', this.$t('crm.UniSet.socialPlatform')]
                ]),
                // 邮件后缀弹框
                visible_excludeEmailSuffix: false,
                socialPlatformOptions: [],
                selectedIds: []
            };
        },
        methods: {
            getSocialList() {
                util.ajax({
                    url: '/crm/attr/getSocialList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        typeId: 3
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.socialPlatformOptions = response.data.data.filter((item) => item.isAvailable === 1);
                        this.socialPlatformOptions.forEach((item) => {
                            if (item.socialValue === '1') {
                                this.selectedIds.push(item.attrId);
                            }
                        });
                        this.$store.commit('setSocialPlatformIds', response.data.data);
                    }
                    this.socialListLoading = false;
                });
            },
            // 获取查重字段列表
            getRepeatSettings() {
                util.ajax({
                    url: '/crm/attr/getList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        typeId: this.typeId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // 前端模拟"邮箱后缀"查重设置
                        if (!response.data.data.find(item => item.attrName === 'emailSuffix')) {
                            response.data.data.unshift({
                                attrId: 0,
                                attrValue: '0',
                                attrName: 'emailSuffix'
                            });
                        }

                        this.tableData = response.data.data.map(i => {
                            const { attrId, attrName, attrValue } = i;
                            // 统一保存到 this.attrValue 和 this.attrId 中, 这样在修改时不会直接修改 tableData , 就不会造成表格闪动
                            this.$set(this.attrValue, attrName, attrValue);
                            this.$set(this.attrId, attrName, attrId);

                            // 保存请求到的值到 vuex
                            switch (attrName) {
                                case 'companyName':
                                    // 保存 公司查重方式
                                    this.$store.commit('setUniqTypeCompanyName', attrValue);
                                    break;
                                case 'emailSuffix':
                                case 'phone':
                                case 'whatsapp':
                                case 'instagram':
                                case 'socialPlatform':
                                    // 保存 是否需要显示去重按钮
                                    const temp = {};
                                    temp[attrName] = attrValue;
                                    this.$store.commit('setShowUniq', temp);
                                    break;
                                case 'email':
                                    break;
                                default:
                                    // 其余类型不显示
                                    return undefined;
                            }
                            return { attrId, attrName, attrValue };
                        }).filter(item => {
                            return !(!item || item === '');
                        });
                    }
                    this.tableLoading = false;
                });
            },
            rowClassName({ row }) {
                if (row.attrName === 'mergeOperate') {
                    return 'mergeOperate';
                }
                return '';
            },

            change_uniq_companyName(val) {
                if (val !== this.attrValue.companyName) {
                    util.ajax({
                        url: '/crm/attr/save',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            typeId: this.typeId,
                            attrName: 'companyName',
                            attrValue: val,
                            attrId: this.attrId.companyName
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.attrValue.companyName = val;
                            this.$store.commit('setUniqTypeCompanyName', this.attrValue.companyName);
                            this.$Message.success(`[${this.attrNameToCn.get('companyName')}] ${this.$t('crm.UniSet.success_editUniqRule')}`);
                        } else {
                            this.$Message.error(`[${this.attrNameToCn.get('companyName')}] ${this.$t('crm.UniSet.error_editUniqRule')}`);
                        }
                    });
                }
            },
            change_allow_merge(val) {
                if (val !== this.attrValue.mergeOperate) {
                    util.ajax({
                        url: '/crm/attr/save',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            typeId: this.typeId,
                            attrName: 'mergeOperate',
                            attrValue: val,
                            attrId: this.attrId.mergeOperate
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.attrValue.mergeOperate = val;
                            this.$store.commit('setAllowMerge', this.attrValue.mergeOperate);
                            this.$Message.success(this.$t('crm.UniSet.success_editRepeatRule'));
                        } else {
                            this.$Message.error(this.$t('crm.UniSet.error_editRepeatRule'));
                        }
                    });
                }
            },
            change_uniq(val, row) {
                // 社交平台切换到不查重，清空选项的查重设置
                if (row.attrName === 'socialPlatform' && val === '0' && val !== this.attrValue[row.attrName]) {
                    this.selectedIds = [];
                    this.slectChange([]);
                }
                if (val !== this.attrValue[row.attrName]) {
                    util.ajax({
                        url: '/crm/attr/save',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            typeId: this.typeId,
                            attrName: row.attrName,
                            attrValue: val,
                            attrId: row.attrId
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.attrValue[row.attrName] = val;

                            const temp = {};
                            temp[row.attrName] = val;
                            this.$store.commit('setShowUniq', temp);
                            this.$Message.success(`[${this.attrNameToCn.get(row.attrName)}] ${this.$t('crm.UniSet.success_editUniqRule')}`);
                        } else {
                            this.$Message.error(`[${this.attrNameToCn.get(row.attrName)}] ${this.$t('crm.UniSet.error_editUniqRule')}`);
                        }
                    });
                }
            },

            // 保存社交平台下拉选项的查重字段
            saveSocial(selectIdList) {
                const arr = (selectIdList || []).map((item) => {
                    return {
                        typeId: 3,
                        attrId: item,
                        socialValue: 1
                    };
                });
                util.ajaxJson({
                    url: `/crm/attr/saveSocial?orgId=${this.enterpriseId}`,
                    method: 'post',
                    data: {
                        attrSocial: arr
                    }
                }).then(response => {
                });
            },

            // 切换邮件后缀规则框显隐状态
            toggleEmailSuffixModal() {
                this.visible_excludeEmailSuffix = !this.visible_excludeEmailSuffix;
            },
            slectChange(val) {
                if (val.length) {
                    this.saveSocial(val);
                } else {
                    this.saveSocial(val);
                }
            }
        },
        created() {
            this.tableLoading = true;
            this.socialListLoading = true;
            this.getSocialList();
            this.getRepeatSettings();
        }
    };
</script>

<style scoped lang="less">
    * /deep/ .mergeOperate td {
        background-color: dimgray;
        color: #FFF;
    }
</style>

<style lang="less">
    .excludeEmailSuffix__trigger {
        margin-left: 20px;
        color: #3B78DE;
        cursor: pointer;

        &:hover {
            color: #2D63BC;
        }
    }
</style>
