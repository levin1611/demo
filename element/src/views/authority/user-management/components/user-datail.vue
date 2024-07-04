<template>
    <div style="height: 100%; ">
      <div
        class="user-detail"
        v-loading="loading"
      >
        <!-- <Spin v-if="loading" size="large" fix></Spin> -->
        <template>
          <div class="user">
            <div class="user_top">
              <div class="user_name">
                <a class="user-head">
                  <svg class="chat-svg-avatar" aria-hidden="true">
                    <use xlink:href="#custom-visitor-avatar" />
                  </svg>
                </a>
                <Tooltip
                  placement="bottom-start"
                  :content="userData.name"
                  style="margin-left: 10px;"
                >
                  <span class="user_name_short">{{ userData.name || "" }} <i v-if="userData.superAdmin" class="custom custom-chaoguanzhanghao"></i></span>
                </Tooltip>
              </div>
              <div class="user_operate">
                <!-- 编辑用户 -->
                <Button
                  icon="custom custom-field-edit"
                  type="text"
                  @click="$emit('open_update_modal', userData)"
                  class="tree_icon"
                >
                  <span style="margin-left: 8px;">{{
                    $t("authority.userManagement.edit")
                  }}</span>
                </Button>
                <!-- 分配权限 -->
                <Button
                  icon="custom custom-authority-distribution"
                  type="text"
                  @click="$emit('set_permission', [userData])"
                  class="tree_icon"
                >
                  <span style="margin-left: 8px;">{{
                    $t("authority.userManagement.allocaPermis")
                  }}</span>
                </Button>
                <div v-if="userData.superAdmin" style="width:60px;display:inline-block"></div>
                <!-- 禁用/设置离职 -->
                <Poptip
                  trigger="hover"
                  placement="bottom-end"
                  popper-class="moreOperateGroup"
                  v-if="!userData.superAdmin"
                >
                  <Button slot="reference"
                          type="text"
                          icon="custom custom-more"
                          style="color: #7e7e7e;padding-top: 5px;margin-right: 30px"></Button>
                  <div>
                    <ul>
                      <li
                        @click="$emit('updateLockTargetAccount', [userData])"
                        v-if="!userData.isselect"
                      >
                        {{ $t("authority.userManagement.lock") }}
                      </li>
                      <li
                        @click="$emit('state_change', true, [userData])"
                        v-if="userData.isselect"
                      >
                        {{ $t("authority.userManagement.unlock") }}
                      </li>
                      <li @click="$emit('delete_account_batch', [userData])">
                        {{ $t("authority.userManagement.setTurnover") }}
                      </li>
                    </ul>
                  </div>
                </Poptip>
              </div>
            </div>
            <div class="user_bottom">
              <span
                >{{ $t("product.createTime") }}：{{
                  new Date(userData.createDate).format("yyyy/MM/dd hh:mm:ss")
                }}</span
              >
              <span style="margin-left: 7.6%;"
                >{{ $t("authority.userManagement.accountStatus") }}：{{
                  userData.isselect
                    ? $t("product.disabled")
                    : $t("product.active")
                }}</span
              >
            </div>
          </div>
          <div
            style="position: absolute; overflow-y: auto;height: 83%;width: 96%;"
          >
            <!--基本信息-->
            <div class="user_info">
              <div
                style="font-size: 14px;font-weight: 700;line-height: 22px;padding-top: 15px;"
              >
                {{ $t("authority.userManagement.userInfo") }}
              </div>
              <div>
                <Row>
                  <Col :span="12">
                    <div
                      class="web-tip"
                      v-for="(item, index) in leftInfo"
                      :key="item.__id"
                      v-show="index < 4 || showMore"
                    >
                      <span
                        style="color: rgba(0, 0, 0, 0.6);margin-right: 8px;"
                        >{{ item.title + "：" }}</span
                      >
                      <span>{{item.value}}</span>
                    </div>
                  </Col>
                  <Col :span="12">
                    <div
                      class="web-tip"
                      v-for="(item, index) in rightInfo"
                      :key="item.__id"
                      v-show="index < 4 || showMore"
                    >
                      <span
                        style="color: rgba(0, 0, 0, 0.6);margin-right: 8px;"
                        >{{ item.title + "：" }}</span
                      >
                      <span>{{item.value}}</span>
                    </div>
                  </Col>
                </Row>
              </div>
              <div
                class="showMoreStyle"
                @click="showMoreInfo">
                {{
                  showMore
                    ? `${$t("mail.collapse")}<<`
                    : `${$t("authority.userManagement.showMoreInfo")}>>`
                }}
              </div>
            </div>
            <!--授权角色-->
            <div class="autho_role">
              <div
                style="font-size: 14px;font-weight: 700;line-height: 22px;padding: 16px 0;"
              >
                {{ $t("authority.userManagement.authorityRole") }}
              </div>
              <Tabs v-model="current_tab">
                <TabPane
                  v-for="(item, index) in tabList"
                  :key="index"
                  :label="item.label"
                  :name="item.name"
                ></TabPane>
              </Tabs>
              <!-- 组件传递参数说明: -->
              <!--current_tab：组件名称、userInfo：用户信息详情-->
              <component
                :is="current_tab"
                :userInfo="userData"
                v-bind="$attrs"
                v-on="$listeners"
              ></component>
            </div>
          </div>
        </template>
      </div>
    </div>
</template>
<script>
    import UserRole from '@/views/authority/user-management/components/user_role.vue';
    import UserManage from '@/views/authority/user-management/components/user_manage.vue';
    import UserField from '@/views/authority/user-management/components/user_field.vue';

    export default {
        data() {
            return {
                visible: false,
                showMore: false, // 显示更多基本信息
                current_tab: 'UserRole', // 当前选中的tab
                tabList: [
                    {
                        label: this.$t('authority.userManagement.functionalPermis'),
                        name: 'UserRole'
                    },
                    {
                        label: this.$t('authority.userManagement.adminPermis'),
                        name: 'UserManage'
                    },
                    {
                        label: this.$t('authority.userManagement.fieldPermis'),
                        name: 'UserField'
                    }
                ]
            };
        },
        components: {
            UserRole,
            UserManage,
            UserField
        },
        props: {
            userData: {
                type: Object,
                default() {
                    return {};
                }
            },
            index: {
                type: Number,
                default: -1
            },
            loading: {
                type: Boolean,
                default: false
            },
            columns: {
                type: Array,
                default: []
            },
            user_id: {
                type: Number,
                default: 0
            }
        },
        computed: {
            /** 产品要求展示全部字段，处理数据 */
            allInfo() {
                const arr = [{
                    title: this.$t('product.enableStatus'),
                    value: this.userData.isselect
                        ? this.$t('product.disabled')
                        : this.$t('product.active')
                }];
                for (const key in this.userData) {
                    const obj = {};
                    if (key === 'id') {
                        obj.title = 'ID';
                    } else if (key === 'ename') {
                        obj.title = this.$t('authority.userManagement.ename');
                    } else if (key === 'email') {
                        obj.title = this.$t('authority.userManagement.email');
                    } else if (key === 'tel') {
                        obj.title = this.$t('authority.userManagement.tel');
                    } else if (key === 'lname') {
                        obj.title = this.$t('authority.userManagement.lname');
                    } else if (key === 'name') {
                        obj.title = this.$t('authority.userManagement.name');
                    } else if (key === 'state') {
                        obj.title = this.$t('authority.userManagement.state');
                    } else if (key === 'has_chat') {
                        obj.title = this.$t('authority.userManagement.hasChat');
                    } else if (key === 'has_inquiries') {
                        obj.title = this.$t('authority.userManagement.hasInquiries');
                    } else if (key === 'has_fb_service') {
                        obj.title = this.$t('authority.userManagement.isfbService');
                    } else if (key === 'has_WABA_service') {
                        obj.title = this.$t('authority.userManagement.isWABAService');
                    } else if (key === 'isDeptManager') {
                        obj.title = this.$t('authority.userManagement.isDeptManager');
                    } else if (key === 'functional_permissions') {
                        obj.title = this.$t('authority.userManagement.functionalPermis');
                    } else if (key === 'administrative_authority') {
                        obj.title = this.$t('authority.userManagement.adminPermis');
                    } else if (key === 'field_permissions') {
                        obj.title = this.$t('authority.userManagement.fieldPermis');
                    } else if (key === 'department') {
                        obj.title = this.$t('authority.userManagement.department');
                    } else if (key === 'sex') {
                        obj.title = this.$t('authority.userManagement.sex');
                    } else if (key === 'remark') {
                        obj.title = this.$t('authority.remark');
                    } else if (key === 'phoneNumber') {
                        obj.title = this.$t('per_setting.personalPhone');
                    }
                    obj.value = this.userData[key];
                    if (obj.title) {
                        arr.push(obj);
                    }
                }
                return arr;
            },
            leftInfo() {
                return this.allInfo.filter((item, index) => index % 2 === 0);
            },
            rightInfo() {
                return this.allInfo.filter((item, index) => index % 2 === 1);
            }
        },
        methods: {
            /* 点击查看更多 */
            showMoreInfo() {
                this.showMore = !this.showMore;
            }
        },
        beforeDestroy() {
            this.current_tab = 'UserRole';
        },
        watch: {
            userData() {
                this.current_tab = 'UserRole';
                this.showMore = false;
            }
        }
    };
</script>

<style scoped lang="less">
    @import "./user-detail.less";
    .custom-chaoguanzhanghao {
        color:#FBBC04;
        margin-left: 8px;
        font-size: 16px;
    }
</style>

<style lang="less">
    .moreOperateGroup {
        li {
            height: 30px;
            line-height: 30px;
            padding: 0 16px;
            cursor: pointer;

            &:hover {
                background-color: #f3f4f7;
            }
        }
    }
    .showMoreStyle{
        margin-top: 12px;
        display:inline-block;
        color: #3B78DE;
        font-size: 14px;
    }
</style>
