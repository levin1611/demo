<template>
  <div class="onekey-release-main">
    <Row>
    <!-- 左侧菜单栏 -->
      <Col :span="4">
        <div class="onekey-release-sider" :style="{'background': '#fafcff','box-shadow': 'inset -1px 0 0 0 #f5f5f5','height':content_height}">
          <!-- <Sider hide-trigger class="onekey-release-sider"> -->
          <Button
            type="primary"
            style="width:140px;margin:20px 30px;font-size: 16px;"
            @click="onSelectMenu('Creatcontent')"
          >{{$t('facebook.onekeyRelease.creatContent.name')}}</Button>
          <Menu :default-active="view"
              @select="onSelectMenu"
              width="200px"
              ref="releaseMenu"
              active-text-color="#fa8241">
            <MenuItem index="Releasedsuccessfully">
              <Icon custom="custom custom-facebook-release-success" size="16"></Icon>
              {{$t('facebook.onekeyRelease.releaseSuccess.title')}}
            </MenuItem>
            <MenuItem index="Draftbox">
              <Icon custom="custom custom-facebook-draft-box" size="16"></Icon>
              {{$t('facebook.onekeyRelease.DraftBox.title')}}
            </MenuItem>
            <MenuItem index="Releasefailed">
              <Icon custom="custom custom-facebook-release-failed" size="16"></Icon>
              {{$t('facebook.onekeyRelease.releaseFail.title')}}
            </MenuItem>
            <MenuItem index="Delayedrelease">
              <Icon custom="custom custom-facebook-delay-release" size="16"></Icon>
              {{$t('facebook.onekeyRelease.delayRelease.title')}}
            </MenuItem>
          </Menu>
        </div>
        <!-- </Sider> -->
      </Col>
      <!-- 右侧组件 -->
      <Col :span="20">
        <div>
            <component
              v-if="reset"
              :is="view"
              :ref="view"
              :page-list="pageList"
              :lastView="lastView"
              :content-height="content_height"
              :toRouterObj="toRouterObj"
              :toViewName="toViewName"
              :tempView="tempView"
              @updateView="updateView"
              @updateLastView="updateLastView"
              @hasSavedDraft="hasSavedDraft"
            ></component>
        </div>
      </Col>
    </Row>
    <!-- 离开确认模态框 -->
    <Modal
      class="modal-footer-margin"
      :modal-append-to-body="false"
      :visible.sync="createContentModel"
      width="360px">
        <p slot="title">
          <span>{{$t('mail.leaveConfirm')}}</span>
        </p>
        <div>
          <p>{{$t('mail.leaveTip')}}</p>
        </div>
        <div slot="footer">
          <Button
            @click="cancelJump">
              {{$t('cancel')}}
          </Button>
          <Button @click="handleDraftSave(0)">{{$t('mail.noSave')}}</Button>
          <Button
            type="primary"
            @click="handleDraftSave(1)"
            :loading="draftLoading">
              {{$t('mail.saveDraft')}}
          </Button>
        </div>
    </Modal>
  </div>
</template>
<script>
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';
    import Creatcontent from './components/creat-content/CreatContent.vue';
    import Draftbox from './components/draft-box/DraftBox.vue';
    import Releasedsuccessfully from './components/released-successfully/ReleasedSuccessfully.vue';
    import Releasefailed from './components/release-failed/Releasefailed.vue';
    import Delayedrelease from './components/delayed-release/Delayedrelease.vue';

    export default {
        components: {
            Creatcontent,
            Draftbox,
            Releasedsuccessfully,
            Releasefailed,
            Delayedrelease
        },
        name: 'one_key_release',
        props: {
            content_height: {
                type: String,
                default: '800px'
            }
        },
        data() {
            return {
                jumpToHomePageFlag: false,
                view: 'Releasedsuccessfully',
                reset: true,
                pageList: [],
                lastView: '',
                // 新增一个临时标识，修复bug-----发帖管理：编辑草稿箱/发送失败/延时发布中的推文，点击“取消”按钮，均返回发布成功页面。
                tempView: 'Releasedsuccessfully',
                createContentModel: false, // 是否保存草稿的弹窗,
                toRouterObj: null, // 要跳转去的路由name
                toViewName: '', // 要切换的视图name
                draftLoading: false, // 保存时的loading状态
                canSwitchPage: '' // 是否可以切换页面 true--可以 false--不可以
            };
        },
        methods: {
            handlejumpToHomePage() {
                if (this.$refs[this.view].hasAnyContent()) {
                    this.createContentModel = true;
                    return true;
                } else {
                    return false;
                }
            },
            onSelectMenu(name) {
                this.lastView = this.view;
                // 保存左侧menu的name
                if (name !== 'Creatcontent') {
                    this.tempView = name;
                }
                if (this.lastView === 'Creatcontent') {
                    this.toViewName = name;
                    // this.tempView = name;
                    this.createContentModel = this.$refs[this.view].hasAnyContent();
                    if (!this.createContentModel) {
                        this.view = name;
                        // this.tempView = this.view;
                        // this.$store.commit('setPostDetail', '');
                    } else {
                        this.view = 'Creatcontent';
                        this.$refs.releaseMenu.activeIndex = this.view;
                        // this.$store.commit('setPostDetail', '');
                    }
                } else {
                    this.view = name;

                    // this.$store.commit('setPostDetail', '');
                }
            },
            cancelJump() {
                this.createContentModel = false;
                this.toRouterObj = null;
            },
            updateView(name) {
                console.log('updateView', name);
                this.reset = false;
                this.$nextTick(() => {
                    this.view = name;
                    this.reset = true;
                });
            },
            updateLastView(lastView) {
                this.lastView = lastView;
            },
            getPageList() {
                util
                    .ajaxInternational({
                        url: '/social/getBrandPage',
                        method: 'post',
                        data: {
                            userId: this.userId,
                            orgId: this.enterpriseId
                        }
                    })
                    .then(response => {
                        if (response.data.code === '1') {
                            this.pageList = response.data.data;
                        }
                    });
            },
            /** 是否存草稿
             * 1-保存  0-不保存
             */
            handleDraftSave(key) {
                if (key === 1) {
                    const currentComponent = this.$refs[this.view];
                    if (currentComponent.releaseAndDraftAjax) {
                        currentComponent.releaseAndDraftAjax('draft', key);
                        this.createContentModel = false;
                    }
                    this.$store.commit('setPostDetail', '');
                } else {
                    this.createContentModel = false;
                    this.canSwitchPage = true;
                    if (this.jumpToHomePageFlag) {
                        this.tempView = 'Releasedsuccessfully';
                        this.updateView('Releasedsuccessfully');
                    } else {
                        if (this.toRouterObj) {
                            this.$router.push(this.toRouterObj);
                        } else if (this.toViewName) {
                            this.updateView(this.toViewName);
                        }
                    }

                    this.$store.commit('setPostDetail', '');
                }
            },
            hasSavedDraft(flag) {
                this.canSwitchPage = flag;
                if (flag) {
                    if (this.jumpToHomePageFlag) {
                        setTimeout(() => {
                            this.tempView = 'Releasedsuccessfully';
                            this.updateView('Releasedsuccessfully');
                            this.createContentModel = false;
                            this.jumpToHomePageFlag = false;
                        }, 0);
                    }
                }
            }
        },
        computed: {
            ...mapState(['enterpriseId', 'userId'])
        },
        beforeDestroy() {
            this.$store.commit('setPostDetail', '');
        },
        beforeRouteLeave(to, from, next) {
            if (this.view !== 'Creatcontent') {
                next();
            } else if (!this.$refs[this.view].hasAnyContent()) {
                next();
            } else if (this.toRouterObj && to.name === this.toRouterObj.name && this.canSwitchPage && !this.createContentModel) {
                next();
            } else if (to.name === 'login') {
                next();
            } else {
                this.createContentModel = true;
                const { name, params } = to;
                this.toRouterObj = { name, params };
            }
        }
    };
</script>
<style lang="less">
.onekey-release-main {
  height: 100%;
  .el-table td, .el-table th {
    padding: 0;
    height: 60px;
  }
}
.fb-onekey-release-header {
  .el-button {
    padding: 8px 18px;
    color: rgba(0, 0, 0, 0.8);
    background-color: #fff;
    &:hover {
      background-color: #ebf0f7;
      color: rgba(0, 0, 0, 0.8);
    }
  }
}

.onekey-release-sider .el-menu {
  border: none;
}
.onekey-release-sider .el-menu-item {
  box-shadow: inset -1px 0 0 0 #f5f5f5;
  background: #fafcff;
  height:44px;
  line-height:44px;
  &>i {
    opacity: 0.28;
  }
  .custom {
    margin-right: 5px;
    color:inherit;
  }
  &.is-active {
    font-weight: 700;
    padding: 0 17px;
    background-color: #fff8f0;
    border-left: 3px solid #fa8241;
    & > i {
      opacity: 1;
    }
  }
  &:hover {
    color: rgba(0, 0, 0, 0.8);
    background-color: #f3f6fb !important;
  }
}
</style>
