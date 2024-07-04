<template>
  <div class="main-breadcrumb-nav">
    <div v-if="!isSystem" class="_f _r _a_c">
      <div v-if="currentTab" :class="breadcrumbNavClass" >{{ itemTitle(currentTab) }}</div>
      <Breadcrumb separator=">">
        <!-- 限时免费面包屑 -->
        <!-- <BreadcrumbItem v-for="item in currentPath" :key="item.name" :class="{special:item.title&&item.title.tag }">
          {{ itemTitle(item,item.title&&item.title.tag || undefined) }}
        </BreadcrumbItem> -->
        <BreadcrumbItem v-for="item in currentPath" :key="item.name" >
          {{ itemTitle(item) }}
        </BreadcrumbItem>
      </Breadcrumb>
      <!-- 使用指南 -->
      <template v-if="isShowUserGuidance">
        <div class="user-guide">
            <div v-for="item in currentPath[0].title.tag" :key="item.id" @click="jumpToNewTab(item.genre ,item.type)">
                {{ itemTitle(item) }}
            </div>
        </div>
      </template>
      <!-- 引导页 -->
      <stepsImage :ref="modeRef" :imgSteps="imgSteps" v-if="imgSteps.length" type="crmSteps" >
        <!-- <HelpTip style="position: absolute;top: 9px;margin-left: 8px;" :class="piwikBind" title=""></HelpTip> -->
        <i class="custom custom custom-tip" :class="piwikBind" style="margin-left: 8px;cursor: pointer;"></i>
      </stepsImage>
        <span v-else-if="toHelpCenter && toHelpCenter.length" @click="jumpToHelpCenter">
            <i class="custom custom custom-tip" :class="piwikBind" style="cursor: pointer;"></i>
        </span>
    </div>
    <div v-else>
      <div class="current-tab-name">{{ $t('menu.system_settings') }}</div>
    </div>
  </div>
</template>

<script>
    import { mapState } from 'vuex';
    // import crmSteps from '@/steps/img-steps/crm-mixins';
    import breadcrumbNav from '@/steps/img-steps/breadcrumb-nav-mixins';

    export default {
        name: 'breadcrumbNav',
        mixins: [breadcrumbNav],
        props: ['isSystem'],
        computed: {
            ...mapState({
                usedGuidanceObj: (state) => state.app.usedGuidanceObj,
                currentPath: (state) => state.app.currentPath
            }),
            currentTab() {
                if (this.currentPath.length) {
                    return this.currentPath[this.currentPath.length - 1];
                } else {
                    return '';
                }
            },
            breadcrumbNavClass() {
                if (this.$route.path === '/global-search') {
                    return 'current-tab-name breadcrumbNav-globalSearch';
                } else {
                    return 'current-tab-name';
                }
            },
            isShowUserGuidance() {
              return this.currentPath[0]?.title?.name ?? this.currentPath[0]?.title;
            }
        },
        watch: {
            stepModeName(val) { // 此为$route.name 驼峰写法
                this.checkModeIsRead();
            }
        },
        mounted() {
            this.checkModeIsRead();
            this.checkModeIsRead();
        },
        methods: {
            // 跳转到新页面
            jumpToNewTab(genre, type) {
                window.open(this.usedGuidanceObj[genre][type]);
            },
            // 点击问号icon新页面跳转至帮助中心
            jumpToHelpCenter() {
                if (this.toHelpCenter.length) {
                    window.open(`${this.toHelpCenter}`, '_blank');
                }
            },
            itemTitle(item, tag) {
                if (tag) {
                    return this.$t(item.title.tag);
                }
                if (typeof item.title === 'object') {
                    return this.$t(item.title.i18n);
                } else {
                    return item.title;
                }
            }
        }
    };
</script>
<style lang="less">
.main-breadcrumb-nav {
  // 使用指南
  .user-guide {
    display: flex;
    margin-left: 30px;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    color: #333333;
    cursor: pointer;

    &:hover {
      color: #4285F2;
    }
  }

  .current-tab-name {
    display: inline-block;
    margin-right: 10px;
    /*字体大小由20px改为18px,不加粗*/
    font-size: 18px;
    font-weight: 500;
    color: #2d2f2e;
  }

  .el-breadcrumb {
    display: inline-block;

    & > span {
      font-size: 12px;
      color: rgba(0, 6, 15, 0.4);

      &:last-child {
        font-size: 12px;
        font-weight: 500;
        color: rgba(0, 6, 15, 0.4);
      }
      
    }

    .el-breadcrumb__separator {
      color: rgba(0, 6, 15, 0.4);
      margin: 0 5px;
    }
    .special{
        span {
      font-size: 12px;
      color: #EA4335 !important;
        font-weight: 600  !important;
    }
      }
  }
}
</style>

