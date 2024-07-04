<template>
  <div class="main-box">
    <!-- 顶部切换 -->
    <div style="display: flex;justify-content: space-between;">
      <div
        style="display: inline-block;color: rgba(0,0,0,0.8);line-height: 34px;font-size: 16px; margin-left: -16px; "
      >
        <Tabs v-model="current_compo" type="card" class="compo-tab">
          <TabPane
              :label="$t('administerAMP.myWebsite.apmBoutiqueText') + '(' + TemplateStationNum + ')'"
              name="templateStation"
              v-if="authorized_button['template-station']"
          ></TabPane>
          <TabPane
              :label="$t('administerAMP.myWebsite.apmHighText') + '(' + WPStationNum + ')'"
              name="wordPress"
              v-if="authorized_button['custom-station']"
          ></TabPane>
        </Tabs>
      </div>
    </div>
    <!-- 网站状态切换 以及 网站搜索   -->
    <div style="display: flex;justify-content: space-between" v-if="current_compo === 'templateStation'">
      <!-- 网站分类     -->
      <Tabs v-model="site_category" @tab-click="handleTabClick">
        <TabPane name="all" :label="`${$t('administerAMP.myWebsite.allText')}(${totalNum})`"></TabPane>
        <TabPane name="unpublished" :label="`${$t('administerAMP.myWebsite.unpublishedText')}(${unpublishedNum})`" class="website_unpublish"></TabPane>
        <TabPane name="published"  :label="`${$t('administerAMP.myWebsite.publishedText')}(${publishedNum})`" class="website_publish"></TabPane>
      </Tabs>
      <div style="display: flex;justify-content: space-between;align-items: center" class="buttons_right">
        <!-- 搜索框     -->
        <Input v-model="searchVal"
               :placeholder="$t('administerAMP.myWebsite.pleaseText')">
          <i slot="suffix" class="custom custom-search website_search" @click="handleSiteSearch" style="position: relative;top: 3px"></i>
        </Input>
        <!--创建网站按钮      -->
        <Button
                type="primary"
                v-if="current_compo === 'templateStation'"
                style="padding:0;width: 92px;text-align: center;margin-left: 20px"
                class="site-create website_create"
                @click="toCreateSite"
        >{{$t('administerAMP.myWebsite.creatText')}}</Button
        >
      </div>

    </div>
    <!-- 显示组件 -->
    <component
      :is="current_compo"
      :openTemplateData.sync="openTemplateData"
      :category="category"
      :searchVal="searchValChild"
      :searchResult="searchResult"
      @getCategoryNum="getCategoryNum"
      @updateCategoryNum="updateCategoryNum"
    ></component>
  </div>
</template>
<script>
    import wordPress from './components/word-press.vue';
    import templateStation from './components/template-station.vue';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState } from 'vuex';
    import util from '../../../libs/util';
    export default {
        name: 'my_website',
        components: {
            wordPress,
            templateStation
        },
        props: ['openTemplate'],
        data() {
            return {
                current_compo: 'wordPress',
                openTemplateData: null,
                site_category: 'all',
                totalNum: 0, // 所有网站数量
                unpublishedNum: 0, // 所有未发布网站的数量
                publishedNum: 0, // 所有已发布网站的数量
                searchVal: '', // 网站搜索值
                category: 'all',
                searchResult: [],
                searchValChild: ''
            };
        },
        methods: {
            // 根据权限判断默认显示定制站还是精品站
            currentCompo() {
                // 处理从其他页面带参数跳转到本页面
                if (this.$route.params.siteType) {
                    const siteType = this.$route.params.siteType;
                    delete this.$route.params.siteType;
                    if (siteType === 'AMP' && this.authorized_button['template-station']) {
                        this.current_compo = 'templateStation';
                        return;
                    }
                }

                if (this.authorized_button['custom-station'] === true) {
                    this.current_compo = 'wordPress';
                } else {
                    this.current_compo = 'templateStation';
                }
                // this.current_compo = 'templateStation';
            },
            toCreateSite() {
                // this.$store.state.showWitchComponent = 'selectTemplate';
                // console.log('======',this.$router.resolve({name: 'select_template'}).href)
                window.open(this.$router.resolve({
                    name: 'website_manager',
                    query: {
                      select: 'selectTemplate'
                    }
                }).href, '_blank');
                // localStorage.setItem('currentSitePage', 'myWebsite');
                // localStorage.setItem('showWitchComponent', 'selectTemplate');
                // window.open(this.$router.resolve({
                //   name: 'website_manager'
                // }).href, '_blank');
            },
            getSiteCount() {
                // util.ajax({
                //     url: `${util.AutomaticSiteUrl}/trunk/site/count`,
                //     method: 'post'
                // })
              util.ajaxAMP({
                url: '/trunk/site/count',
                method: 'post'
              })
                      .then(res => {
                    console.log('123123123');
                    if (res.data.code === 0) {
                        console.log('123123123');
                        this.totalNum = res.data.data.total;
                        this.unpublishedNum = res.data.data.publish_ready;
                        this.publishedNum = res.data.data.publish_finish;
                    } else {
                    }
                });
            },
            handleTabClick() {
                this.category = this.site_category;
            },
            handleSiteSearch() {
                this.searchValChild = this.searchVal;
                // 判断并更新分类数量
                // 强制分类变成all
                this.site_category = 'all';


                // util
                //     .ajax({
                //         url: `${util.AutomaticSiteUrl}/trunk/site/list`,
                //         method: 'post',
                //         data: {
                //             title: this.searchVal
                //         }
                //     }).then(res => {
                //         if (res.data.code === 0) {
                //             this.totalNum = res.data.data.total;
                //             this.searchResult = res.data.data.items;
                //             this.category = 'all';
                //             this.site_category = 'all';
                //             let publishNum = 0;
                //             let unpublishNum = 0;
                //             if (this.searchResult.length) {
                //                 this.searchResult.forEach(item => {
                //                     if (item.publish_status === '1') {
                //                         unpublishNum++;
                //                     } else if (item.publish_status === '3') {
                //                         publishNum++;
                //                     }
                //                 });
                //             }
                //             this.unpublishedNum = unpublishNum;
                //             this.publishedNum = publishNum;
                //         }
                //     });
            },
            getCategoryNum(val) {
                if (val) {
                    this.getSiteCount();
                }
            },
            updateCategoryNum(obj) {
                this.totalNum = obj.all;
                this.unpublishedNum = obj.unpublishNum;
                this.publishedNum = obj.publishNum;
            }
        },
        computed: {
            ...mapState({
                TemplateStationNum: state => state.TemplateStationNum,
                // 获取权限按钮
                button_list: state => state.app.button_list,
                WPStationNum: state => state.WPStationNum
            }),
            // 保证刷新模板站tab时，定制站数量不清零
            // WPStationNum() {
            //     const WPStationNum = localStorage.getItem('WPStationNum');
            //     if (WPStationNum !== null) {
            //         return WPStationNum;
            //     } else {
            //         return this.$store.state.WPStationNum;
            //     }
            // },
            // 判断按钮权限
            authorized_button() {
              const buttonIds = BUTTON_IDS.website.myWebsite;
                return {
                    'template-station': !HANDLE_BUTTON(buttonIds.templateStation, this.button_list),
                    'custom-station': !HANDLE_BUTTON(buttonIds.customStation, this.button_list)
                };
            }
        },
        watch: {
            openTemplate: {
                handler(val) {
                    if (val) {
                        this.current_compo = 'templateStation';
                        this.openTemplateData = val;
                        this.$nextTick(() => {
                            this.$emit('update:openTemplate', null);
                        });
                    }
                },
                immediate: true,
                deep: true
            },
            authorized_button: {
                handler(val) {
                    if (val) {
                        this.currentCompo();
                    }
                },
                immediate: true,
                deep: true
            },
            searchVal: {
                handler(val) {
                    if (val === '') {
                        this.handleSiteSearch();
                        this.getSiteCount();
                    }
                }
            }
        },
        beforeDestroy() {
            this.$store.state.isCreateSite = false;
        },
        created() {
          // debugger
            this.getSiteCount();
            try {
              if (this.$route.query.select) {
                this.$store.state.showWitchComponent = 'selectTemplate';
              } else {
                this.$store.state.showWitchComponent = 'myWebsite';
              }
            } catch {
              this.$store.state.showWitchComponent = 'myWebsite';
            }

        },
        beforeRouteLeave(to, from, next) {
          console.log('>>>>>>>', to, from, next);
        }
    };
</script>

<style lang="less" scoped>
.main-box {
  padding: 12px 12px 0;
  background-color: #f5f6f9;
  height: 100%;
  /deep/ .el-tabs__nav-wrap:after {
    height: 0px;
  }
  /deep/ .el-tabs__item.is-active {
      font-weight: 700;
  }
  /deep/ .el-tabs__header {
    margin: 0 14px 25px;
    .el-tabs__nav {
      border: none;
    }
  }
  /deep/ .compo-tab {
    .el-tabs__header {
      .el-tabs__nav {
        border: none;
      }
    }
    .el-tabs__item.is-active {
      background: #7B98B6;
      font-size: 12px;
      color: #FFFFFF;
      text-align: center;
    }
    .el-tabs__item {
      font-size: 12px;
      color: rgba(0,0,0,0.80);
      text-align: center;
      height: 33px;
      line-height: 33px;
      background: #fff;
    }
    .is-top {
      height: 33px;
      /*border: none;*/
      margin-bottom: 8px;
      /*border-bottom: none;*/
      line-height: 33px;
    }
    #tab-wordPress {
      border: 1px solid #e4e7ed;
      border-radius: 0 4px 4px 0;
    }
    #tab-templateStation {
      border: 1px solid #e4e7ed;
      border-radius: 4px 0 0 4px;
    }
    #tab-wordPress.is-active {
      border-radius: 0 4px 4px 0;
      /*border-radius: 4px 0px 0px 4px;*/
    }
    #tab-templateStation.is-active {
      border-radius: 4px 0 0 4px;
      /*border-radius: 4px 0px 0px 4px;*/
    }
  }
}
.custom-search {
  &:hover {
    cursor: pointer;
  }
}
</style>
<style lang="less">
  .main-box {
    .buttons_right {
      .el-input {
        width: 300px;
        .el-input__inner {
          border-radius: 15px;
        }
      }
    }
  }
  .buttons_right {
    .el-input {
      .el-input__suffix {
        top: 3px !important;
      }
    }
  }
  .amp-custom-dropdown {
    padding: 0 !important;
    .el-dropdown-menu__item {
      &:hover {

      }
      &:focus {
        background-color: #F6F7FA !important;
        color: #4385F3 !important;
      }
    }
  }
</style>
