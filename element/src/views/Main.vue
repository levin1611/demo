<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-08 10:02:58
 * @LastEditTime: 2020-08-05 16:22:43
 * @LastEditors: niumkiki
 -->
<style lang="less">
@import "./main.less";
@import './main-components/photoGallery.css';
</style>

<template>
  <div class="main" ref="main" :class="{'main-hide-text': shrink}">
    <!-- 左侧目录 -->
    <div class="sidebar-menu-con" :style="{width: sidebarMenuWidth}" @mouseenter="handleMouseenter" @mouseleave="handleMouseleave">
      <!-- 普通左侧目录 -->
      <sidebar-menu v-if="!isSystem" :menu-list="mainMenuList" :menu-expand="menuExpand" :theme="menuTheme" :before-push="beforePush" :forbidden="menuForbidden" @subMenuOpen="subMenuOpen" @subMenuClose="subMenuClose" :forbiddenClick="forbiddenMenuMouseover" id="v-step-menu" @clearGlobalSearch="clearGlobalSearch" ref="sidebarMenu">
        <div slot="top" class="logo-con" :class="{'logo-12200' : ['customFor_12200'].includes(isCustomEdition)}">
          <div v-if="menuExpand" style="display: flex;align-items: center;padding-top:11px;justify-content: space-between;padding-right: 20px;">
            <Tooltip :content="$t('jumpToHomePage')" placement="right" :open-delay="1000">
                <!-- 定制版 logo -->
                <Button v-if="isCustomEdition"
                        id="v-step-menu-logo"
                        type="text"
                        @click="jumpToHomePage"
                        class="home-page-btn">
                    <!-- icon -->
                    <img :src="customEditionConfig[isCustomEdition].logoUrl_icon"
                         :height="['customFor_12200'].includes(isCustomEdition) ? '48px' : '32px'"/>
                    <!-- text -->
                    <img :src="customEditionConfig[isCustomEdition].logoUrl_text" 
                         height="20px"
                         :style="{'margin-left': '10px', 'vertical-align': isCustomEdition === 'customFor_11802' ? 'super' : 'baseline'}" />
                </Button>
                <!-- 非定制版 logo -->
              <Button id="v-step-menu-logo" v-else-if="getLang" type="text" @click="jumpToHomePage" class="home-page-btn">
                <Icon custom="custom custom-main-logo" size="32" />
                <Icon custom="custom custom-logo-text" size="20" style="margin-left: 10px;" />
              </Button>
              <Button id="v-step-menu-logo" v-else type="text" @click="jumpToHomePage" class="home-page-btn">
                <Icon custom="custom custom-logo-en" size="32" />
              </Button>
            </Tooltip>

            <!-- <div v-if="getLang" style="margin-right: 21px;">
                            <Icon custom="custom custom-main-logo" size="32"/>
                            <Icon custom="custom custom-logo-text" size="20" style="margin-left: 10px;"/>
                        </div> -->
            <!-- <div v-else>
                            <Icon custom="custom custom-logo-en" size="32"/>
                        </div> -->
            <Icon id="v-step-menu-logo-nav" custom="custom custom-fold-menu" size="15" v-if="!shrink" style="cursor:pointer;" @click.stop="toggleClick" />
            <Icon id="v-step-menu-logo-nav" custom="custom custom-fixed-menu" size="15" style="cursor:pointer;" v-else @click.stop="toggleClick" />
          </div>
          <div v-else class="home-page-btn" id="v-step-menu-logo" style="padding-left: 1px;">
              <!-- 定制版 logo -->
              <img v-if="isCustomEdition"
                   :src="customEditionConfig[isCustomEdition].logoUrl_icon" :height="['customFor_12200'].includes(isCustomEdition) ? '48px' : '32px'" style="margin-top: 12px;" />
              <!-- 非定制版 logo -->
              <Icon v-else
                    custom="custom custom-main-logo"
                    size="32" />
          </div>
        </div>
      </sidebar-menu>
      <!-- 系统设置左侧目录 -->
      <sidebarMenuSystem v-else :menu-list="systemMenuList" :menu-expand="menuExpand" :theme="menuTheme" :before-push="beforePush" @subMenuOpen="subMenuOpen" @subMenuClose="subMenuClose" :forbidden="menuForbidden">
        <div slot="top" class="logo-con" :class="{'logo-12200' : ['customFor_12200'].includes(isCustomEdition)}">
          <div v-if="menuExpand" style="display: flex;align-items: center;padding-top:10px;justify-content: space-between;padding-right: 20px;">
            <Tooltip :content="$t('jumpToHomePage')" placement="right" :open-delay="1000">
                <!-- 定制版 logo -->
                <Button v-if="isCustomEdition"
                        type="text"
                        @click="jumpToHomePage"
                        class="home-page-btn">
                    <!-- icon -->
                    <img :src="customEditionConfig[isCustomEdition].logoUrl_icon"
                         :height="['customFor_12200'].includes(isCustomEdition) ? '48px' : '32px'"/>
                    <!-- text -->
                    <img :src="customEditionConfig[isCustomEdition].logoUrl_text" 
                         height="20px"
                         :style="{'margin-left': '10px', 'vertical-align': isCustomEdition === 'customFor_11802' ? 'super' : 'baseline'}" />
                </Button>
                <!-- 非定制版 logo -->
              <Button v-else-if="getLang" type="text" @click="jumpToHomePage" class="home-page-btn">
                <Icon custom="custom custom-main-logo" size="32" />
                <Icon custom="custom custom-logo-text" size="20" style="margin-left: 10px;" />
              </Button>
              <Button v-else type="text" @click="jumpToHomePage" class="home-page-btn">
                <Icon custom="custom custom-logo-en" size="32" />
              </Button>
            </Tooltip>
            <Icon custom="custom custom-fold-menu" id="v-step-1" size="15" v-if="!shrink" style="cursor:pointer;" @click.stop="toggleClick" />
            <Icon custom="custom custom-fixed-menu" size="15" style="cursor:pointer;" v-else @click.stop="toggleClick" />
          </div>
          <div v-else class="home-page-btn" style="padding-left: 1px;">
              <!-- 定制版 logo -->
              <img v-if="isCustomEdition"
                   :src="customEditionConfig[isCustomEdition].logoUrl_icon" :height="['customFor_12200'].includes(isCustomEdition) ? '48px' : '32px'" style="margin-top: 11px;" />
              <!-- 非定制版 logo -->
              <Icon v-else
                    custom="custom custom-main-logo"
                    size="32" />
          </div>
        </div>
      </sidebarMenuSystem>
    </div>

    <!-- 顶部 bar -->
    <div class="main-header-con" :style="{paddingLeft: shrink?'70px':'190px'}" :class="{'chang_zindex': changeNavZIndex}">
      <div class="main-header">
        <div class="header-middle-con">
          <div class="main-breadcrumb">
            <breadcrumb-nav :isSystem="isSystem"></breadcrumb-nav>
          </div>
        </div>
        <!-- 全局搜索 -->
        <div class="header-middle-con" v-if="isShowGlobalSearch && !isWAPersonalEdition && !is_marketing_station">
          <div :class="{'main-global-search': true, 'notOnlyGlobalSearch': notOnlyGlobalSearch}">
            <GlobalSearch ref="globalSearch" :parentValue="globalSearchKeyWords" :holderText="$t('globalSearch.searchInputPlaceholder')" :width="300" :delayTime="100" btnClass="global-search" :maxlength="50" @change-keyword="changeKeyword" @press-enter="globalSearch('follDoseSearch')">
              <!-- <template> -->
                <!-- <ul class="ivu-select-dropdown-list" slot="searchDropdown">
                  <li v-if="mockSearchData.length" class="search-list-header ellipsis">
                    <span>{{$t('globalSearch.quickSearch')}}</span>
                    <span class="keyword">"{{globalSearchKeyWords}}"</span>
                    <span>{{$t('globalSearch.relatedData')}}</span>
                  </li>
                  <li v-else class="search-list-nodata ivu-select-item">
                    <span>{{$t('globalSearch.noQuickSearchResultTip')}}</span>
                  </li>
                  <li @mousedown="handleSearchJump(item)" class="ivu-select-item global-search-item" v-for="(item, index) in mockSearchData" :key="index">
                    <div class="search-item-icon" style="width: 10%;">
                      <Icon :class="`custom ${item.IconName}`" size="22"></Icon>
                    </div>
                    <div class="search-item-content" style="width: 90%;">
                      <div class="ellipsis" v-html="highLightKeyWords(item.content)"></div>
                      <div>
                        <span class="ellipsis">{{item.simpleName}} | </span>
                        <span class="search-item-keyInfo ellipsis" v-html="highLightKeyWords(item.keyInfo)"></span>
                      </div>
                    </div>
                  </li>
                  <li v-if="mockSearchData.length > 5" @mousedown="globalSearch('follDoseSearch')" class="search-list-footer ivu-select-item">
                    {{$t('globalSearch.loadMore')}}
                  </li>
                </ul> -->
              <!-- </template> -->
            </GlobalSearch>
          </div>
        </div>
        <!-- 顶部各类强提醒 -->
        <div class="header-tip-con">
          <!-- Google / Facebook / 邮箱 绑定失效提示 -->
          <div v-if="showInvalidMsg && invalidMsg" class="header-tip">
            <!-- 提示图标 -->
            <Icon size="16" color="#FF9803" class="el-icon-warning"></Icon>
            <!-- 提示语 -->
            <div v-html="invalidMsg" class="header-tip-message"></div>
            <!-- 关闭提醒按钮 -->
            <Icon type="md-close"
                  size="16"
                  color="rgba(0,0,0,0.20)"
                  @click="closeInvalidTip"
                  class="header-tip-close piwik_remind_close"></Icon>
          </div>
          <!-- 系统升级提示语 -->
          <div v-if="showUpgradeTip" class="header-tip">
            <!-- 提示图标 -->
            <Icon size="16" color="#FF9803" class="el-icon-warning"></Icon>
            <!-- 提示语 -->
            <div class="header-tip-message">{{ translatedUpgradeTip }}</div>
            <!-- 关闭提醒按钮 -->
            <Icon type="md-close" size="16" color="rgba(0,0,0,0.20)" class="header-tip-close" @click="closeUpgradeTip"></Icon>
          </div>
        </div>
        <div class="header-avator-con">
          <Poptip trigger="hover"
                placement="top-end"
                popper-class="abbr-popper"
                width="314"
                ref="newPoptip"
                v-model="showQuickEnter"
                v-if="!is_marketing_station && (add_clue_btn || authorized_button['newCompany'] || authorized_button['newContact'] || authorized_button['newInquiry'] || authorized_button['newFolloUp'])"
                @show="isShowQuickEnter = true"
                @hide="isShowQuickEnter = false"
            >
                <Icon v-if="!isShowQuickEnter" slot="reference" custom="custom custom-xinjian1" style="color: #FF752A;cursor: pointer;" size="18" />
                <Icon v-if="isShowQuickEnter" slot="reference" custom="custom custom-xinjianzhankai" style="color: #FF752A;cursor: pointer;" size="18" />
                <div class="new-popover-div">
                    <div @click="enterClueModel" v-if="add_clue_btn">
                        <img :src="require('@/assets/images/newClue.png')" alt="" srcset="" width="32px" height="32px">
                        <p>{{$t('main.Leads')}}</p>
                    </div>
                    <div @click="newCreateCustomer" v-if="!is_marketing_station && authorized_button['newCompany']">
                        <img :src="require('@/assets/images/newCostome.png')" alt="" srcset="" width="32px" height="32px">
                        <p>{{$t('main.Customer')}}</p>
                    </div>
                    <div @click="newContact"  v-if="!is_marketing_station && authorized_button['newContact']">
                        <img :src="require('@/assets/images/newConcat.png')" alt="" srcset="" width="32px" height="32px">
                        <p>{{$t('main.Contacts')}}</p>
                    </div>
                    <div @click="newCreateCompany" v-if="!is_marketing_station && authorized_button['newInquiry']">
                        <img :src="require('@/assets/images/newInq.png')" alt="" srcset="" width="32px" height="32px">
                        <p>{{$t('main.Inquiry')}}</p>
                    </div>
                    <div @click="addFollowup" v-if="!is_marketing_station && authorized_button['newFolloUp']">
                        <img :src="require('@/assets/images/newFollowUp.png')" alt="" srcset="" width="32px" height="32px">
                        <p>{{$t('main.followUp')}}</p>
                    </div>
                    <!-- <div @click="addAi">
                        <img :src="require('@/assets/images/ai-logo.png')" alt="" srcset="" width="32px" height="32px">
                        <p>{{$t('addAi.title')}}</p>
                    </div> -->
                </div>
            </Poptip>
            
            <!-- <Tooltip transfer :content="$t('addAi.titleTootips')">
                <span style="position: relative;margin-top: 6px;">
                    <img :src="require('@/assets/images/free.svg')" alt="" srcset=""  @click="addAi" style="position: absolute;right:-29px;bottom: 20px" width="50px" height="18px" />
                    <img :src="require('@/assets/images/AI-top-logo.png')" alt="" srcset=""  @click="addAi" style="margin-left:20px;cursor: pointer;" width="20px" height="20px" />
                </span>
            </Tooltip>
            <div style="width:1px;height:20px;background: #E8E8E8;margin-left: 20px;margin-right: 5px;"></div> -->
          <Button v-if="enterpriseId + '' === '1000'" onclick="window.open('https://analysis.leadscloud.com')">analysis
          </Button>
        <Poptip trigger="hover" width="200" placement="bottom-start" :show-arrow="false">
            <div class="float-window-button" slot="reference">
                <Badge :value="allUnreadCount" :max="99" :hidden="isWAPersonalEdition || allUnreadCount <= 0">
                    <Icon custom="custom-chudianweiduxiaoxi" style="color: rgba(0, 0, 0, 0.6);cursor: pointer;" size="22" />
                </Badge>
            </div>
            <div v-for="(item, index) in noticeList" :key="index" class="noticeList" @click="jumpPage(item)">
                <Icon :custom="item.icon" size="16"/> <span>{{$t(item.label)}}</span>
                <template v-if="item.count > 0">
                    <span class="noticeListCount" v-if="item.count > 0 && item.count < 100">{{item.count}}</span>
                    <span class="noticeListCount" v-else>99</span>
                </template>
            </div>
        </Poptip>
        <div class="float-window-button" slot="reference">
            <Tooltip transfer :content="$t('noticeWindow.systemNotice')">
                <Badge :value="systemNoticeUnreadCount" :max="99" :hidden="systemNoticeUnreadCount <= 0">
                    <Icon custom="custom-top-notice" style="color: rgba(0, 0, 0, 0.6);cursor: pointer;" size="20" @click="openNoticeScreen('systemNotice')" />
                </Badge>
            </Tooltip>
        </div>
        <div v-if="!isWAPersonalEdition"
            id="v-step-menu-breadcrumb"
            :class="{'click-forbidden-modal-common': forbiddenMenuMouseover}">
            <!-- <div class="float-window-button" v-if="isContainsMenu('xhl_chat')" @click="handleFloatWindowChange('xhl_chat')" :style="{cursor:isWindowEffective('xhl_chat')?'pointer':'auto'}">
              <Tooltip transfer :content="$t('menu.xhl_chat')">
                <Badge :max="99" :hidden="totalChatCount <= 0" :value="totalChatCount">
                  <Icon custom="custom custom-top-chat" color="rgba(0,0,0,0.6)" size="20" />
                </Badge>
              </Tooltip>
            </div> -->
            <!-- Facebook 私信 -->
            <!-- <div class="float-window-button" v-if="isContainsMenu('inbox')" @click="handleFloatWindowChange('inbox')" :style="{cursor:isWindowEffective('inbox')?'pointer':'auto'}">
              <Tooltip transfer :content="$t('FB_message')">
                <Badge :max="99" :hidden="fbChatUnread <= 0" :value="fbChatUnread">
                  <Icon custom="custom custom-top-facebook" color="rgba(0,0,0,0.6)" size="20" />
                </Badge>
              </Tooltip>
            </div> -->
            <!-- 邮件 -->
            <!-- <div v-if="!is_marketing_station" class="float-window-button" @click="handleFloatWindowChange('mail_home')">
              <Tooltip transfer :content="$t('menu.inbox')">
                <Badge :max="99" :hidden="allUnreadMails <= 0" :value="allUnreadMails">
                  <Icon custom="custom custom-top-mail" color="rgba(0,0,0,0.6)" size="21" />
                </Badge>
              </Tooltip>
            </div> -->
            <!-- 技术支持 -->
            <div id="triggerIconsTop"
                 v-if="!['customFor_12200'].includes(isCustomEdition)"
                :style="{cursor: 'pointer'}"
                class="float-window-button">
                <div id="leadscloudAdvisory" style="position: relative;">
                    <img :src="require('@/assets/images/asked.svg')" alt="" srcset="" style="position: absolute;right:-29px;bottom: 13px;z-index:100" width="50px" height="18px" />
                    <Tooltip transfer :content="$t('advisory')">
                        <Icon class="whatsapp-manage-floatWindow" custom="custom custom-jishuzhichi" color="#FF752A" size="20" />
                    </Tooltip>
                </div>
            </div>
            <div v-if="forbiddenMenuMouseover" class="click-forbidden-modal-common-child"></div>
          </div>
          <div class="float-window-button" slot="reference">
            <Tooltip transfer :content="$t('menu.system_settings')">
                <Icon custom="custom-app-center" size="20" color="rgba(0,0,0,0.6)" @click="openSystemSettings()" />
            </Tooltip>
        </div>
          <!-- 应用中心 -->
          <!-- <div id="v-step-menu-breadcrumb-appcenter">
            <div @mouseenter="toggleAppCenter(true)" @mouseleave="toggleAppCenter(false)" class="float-window-button">
                <Icon custom="custom custom-app-center" color="rgba(0,0,0,0.6)" size="20" />
            </div>
          </div> -->
          <!--<div class="float-window-button">
                    <Button size="small" @click="advisory()">咨询</Button>
                </div>-->
          <!-- 分割线 -->
          <div class="avatar-divider"></div>
          <!-- 头像 -->
          <div id="v-step-5"
               class="user-dropdown-menu-con">
            <personal-dropdown :forcedDisplay="forcedDisplayStep" :forbiddenClick="forbiddenMenuMouseover" ref="personDropdown" @seeUserOnline="seeUserOnline" @showPrivateSettings="showPrivateSettings" @clickHelpIcon="handleFloatWindowChange('help')"></personal-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- content -->
    <div class="single-page-con" :style="{left: shrink?'70px':'190px'}">
      <!-- router-view -->
      <!-- ,minWidth:'1170px' -->
      <div class="single-page" :style="{minHeight:content_height,width:isFixed?foldWidth:'100%'}">

        <!-- 提示手动更新fbleads的icon图标 -->
        <div v-if="this.$route.name === 'fb_message' || this.$route.name === 'form_bind'"
            style="line-height: 40px;background-color: #FDF6ED;font-size: 12px;padding-left: 30px;padding-right: 30px;">
            <Icon size="16" color="#E7A23B" class="el-icon-warning"></Icon>
            <span v-if="this.$route.name === 'fb_message'" style="margin-left: 8px;font-weight: 400;color: rgba(0, 0, 0, .8);">{{$t('facebook.bindForm.afterTheFacebookForm2')}}</span>
            <span v-if="this.$route.name === 'form_bind'" style="margin-left: 8px;font-weight: 400;color: rgba(0, 0, 0, .8);">{{$t('facebook.bindForm.afterTheFacebookForm1')}}</span>
        </div>

        <router-view v-if="update" ref="routerView" :singlePageNodeWidth.sync="singlePageNodeWidth" :content_height="content_height" :globalSearchKeyWords="globalSearchKeyWords" @changeCurrentServiceOffline="changeCurrentServiceOffline"></router-view>
        <!-- 子应用嵌套容器 -->
        <div id="appContainer"></div>
        <!-- </keep-alive> -->
      </div>

      <!-- 小屏 -->
      <floating-window :is-drawer-show="isDrawerShow"
                       :is-fixed="isFixed"
                       :float-window-type="floatWindowType"
                       @isFixed="val => isFixed = val"
                       @changeDrawerShow="val => isDrawerShow = val"></floating-window>
    </div>

    <!--退出系统，如果当前账号客服在线时，弹出提醒-->
    <Modal :visible.sync="logoutService" :title="$t('main.logoutTip')">
      <div style="text-align:center">
        <div v-if="serviceList.length !== 0">
          <p>
            <template v-if="myChatStatus.mobileOnline === '1'">{{ $t('main.listTipMiniProgram') }}</template>
            <template v-else>{{ $t('main.listTip') }}</template>
          </p>
          <p>{{ $t('main.listTitle') }}</p>
          <ul>
            <li v-for="service in serviceList" :key="service.acctid" style="list-style:none;">
              <Icon type="person" :size="16" color="#2d8cf0" style="margin:0 4px;"></Icon>
              {{ service.serverName }}({{ service.visitorCount }})
              <span style="margin-left: 10px">
                <Icon v-if="service.mobileOnline === '1'" custom="custom-mini-program-online" />
                <Icon v-if="service.isOnline === '1'" custom="custom-web-online" />
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div slot="footer">
        <Button @click="logoutService = false">{{ $t('cancel') }}</Button>
        <Button type="primary" @click="logout_chat">{{ $t('confirm') }}</Button>
      </div>
    </Modal>

    <!--全局图片预览-->
    <photogallery v-if="isFullscreenImgShow" :imgEvent="fullscreenImgSrc" @img_open_close="img_open_close"></photogallery>

    <!--全局图片预览-->
      <Modal v-if="isFullCarouselShow"
             :visible="true"
             fullscreen
             :modal="false"
             :append-to-body="true"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             custom-class="multiTypeCarouselModal">
          <div slot="title"></div>
          <MultiTypeCarousel
              :options="fullCarouselProps"
              v-bind="fullCarouselProps"></MultiTypeCarousel>
          <div slot="footer"></div>
      </Modal>

      <!-- 全局时间轴快速回复 -->
      <WhatsAppReplyModal v-if="visibleReplyModal"
                          :visibleReplyModal.sync="visibleReplyModal"
                          :allowReply="true"
                          :isGlobal="true"
                          v-bind="globalWaReplyModalProps"></WhatsAppReplyModal>

    <!-- 预览资料库文件组件 -->
    <filePreview></filePreview>

    <!-- 自动建站模板全屏预览模态框 -->
    <templateModal></templateModal>

    <!-- 新增线索 -->
    <ClueModal
        v-model="clueModal"
        :title="$t('clue.add_clue')"
        class="modal companydata"
        :delLoading="delLoading"
        :json_data="json_data"
        :saveClueClass="'my-clue-enter-clue'"
        :saveClueAndInquiryClass="'my-clue-save-clue-and-inquiry'"
        :okEnterInquiryClass="'my-clue-enter-inquiry'"
        @on_cancle_clue="on_cancle_clue"
        @open_close="open_close">
    </ClueModal>

    <!-- 新建客户 -->
    <NewCompany :visible.sync="newCustomerShow"
                type="customer"
                @refreshData="refreshData"></NewCompany>
    <!-- 新建询盘 -->
    <NewInquiry :visible.sync="newInquiryShow"
                    modelType="quickEntrance"
                    :flag_update_inquiry.sync="flag_update_inquiry"></NewInquiry>
    <!--新增跟进记录  -->
    <followUpRecordModal
                v-if="add_followup_modal"
                ref="addFollowUpModal"
                :visible.sync="add_followup_modal"
                :detail="editDetail">
            </followUpRecordModal>
    <!-- 新增联系人 -->
    <NewContact :visible.sync="visible_new_contact"
                modelType="quickEntrance"
                ></NewContact>
    <addAi :visible.sync="showAddAi"></addAi>
    <!--引导-->
    <!-- <v-tour name="myTour" :steps="steps" :callbacks="callbacks_tour" :options="options_tour">
      <template slot-scope="tour">
        <transition name="fade">
          <v-step v-if="tour.currentStep === index" v-for="(step, index) of tour.steps" :key="index" :step="step" :previous-step="tour.previousStep" :next-step="tour.nextStep" :stop="tour.stop" :is-first="tour.isFirst" :is-last="tour.isLast" :labels="tour.labels">
            <div slot="actions">
              <Button v-if="!tour.isLast" @click="tour.stop" class="v-step__button">{{$t('guide.skip')}}
              </Button>
              <Button @click="tour.previousStep" class="v-step__button">{{$t('guide.lastStep')}}</Button>
              <Button @click="tour.nextStep" class="v-step__button">{{$t('guide.nextStep')}}</Button>
              <Button v-if="tour.isLast" @click="tour.stop" class="v-step__button">
                {{$t('guide.finish')}}
              </Button>
            </div>
          </v-step>
        </transition>
      </template>
    </v-tour> -->
    <div v-if="vue_tour_start" class="tourBox">
      <div style="position: absolute;top: 50%;left: 50%;margin-top: -275px;margin-left: -414px; width: 828px;height: 560px;background-color: #ffffff;border-radius: 8px">
        <span @click="closeTourStart" style="cursor: pointer;position: absolute;top: 15px;right: 15px">
          <Icon size="16" custom="custom custom-delete1" /></span>
        <div style="padding: 98px 50px 98px 80px" class="_f _r">
          <div class="title__update-text" style="width:234px;height:325px;display:flex;flex-direction: column;justify-content: space-between;">
              <div style="width: 200%;margin-top: 20px">
                  <span style="color:rgba(0,0,0,0.8);font-size:24px;font-weight:600">{{$t('guide.title')}}</span>
              </div>
              <div style="margin-top:-10px">
                  <ul>
                      <li>{{$t('guide.t1')}}</li>
                      <li>{{$t('guide.t2')}}</li>
                      <li>{{$t('guide.t3')}}</li>
                      <li>{{$t('guide.t4')}}</li>
                      <li>{{$t('guide.t5')}}</li>
                  </ul>
              </div>
              <div style="width:100%;">
                  <span class="title__update-text-btn" @click="closeTourStart">{{$t('guide.btn')}}</span>
              </div>
          </div>
          <div>
            <img :src="require('@/assets/images/update.svg')" alt="" srcset="" width="477px" height="366px">
          </div>
        </div>
      </div>
      <div class="gallery">
      </div>
    </div>

    <!-- 应用中心 drawer -->
    <AppCenter @openNoticeScreen="openNoticeScreen" :forbiddenmousever="forbiddenMenuMouseover"></AppCenter>
    <stepVtour :ref="tourRef" :callbacksTour="callbacksTourMenu" :steps="menuTourSteps" :name="tourName"></stepVtour>
    <!--点击邮箱发送邮件-->
    <div v-if="quickSendMailModalVisible">
        <replyMailModal
            :visible.sync="quickSendMailModalVisible"
            ref="quickSendMailModal"></replyMailModal>
    </div>

    <!-- 初始化编辑器 -->
    <div id="mainvEditor" v-show="false"></div>
    <!-- cinnox 来电通话悬浮弹窗 -->
    <callingDetail></callingDetail>
    <!-- // 通话详情 录音详情预览弹窗 -->
    <CalldetailDialog v-if="showCallAudioDetail" :detailForQuery="detailForQuery" @openCalldetailIng="openCalldetailIng"></CalldetailDialog>
    <whatsAppGroupSendModal :visible="wAGroupSendVisible"></whatsAppGroupSendModal>
  </div>
</template>

<script>
    const FloatingWindow = () => import('./main-components/floating-window/floating-window.vue');
    import sidebarMenu from './main-components/sidebar-menu/sidebar-menu.vue';
    import sidebarMenuSystem from './main-components/sidebar-menu/sidebar-menu-system.vue';
    const breadcrumbNav = () => import('./main-components/breadcrumb-nav.vue');
    const GlobalSearch = () => import('@/views/main-components/search-input/search-input');
    const templateModal = () => import('./word-press/select-template/components/templateModal.vue');
    const AppCenter = () => import('./main-components/app-center/app-center');
    const photogallery = () => import('./main-components/photogallery.vue');

    const MultiTypeCarousel = () => import('@/views/main-components/multiTypeCarousel/multiTypeCarousel');
    const replyMailModal = () => import('@/views/main-components/timeline/Components/replyMailModal');
    const WhatsAppReplyModal = () => import('@/views/main-components/timeline/WhatsApp/modal/WhatsAppReplyModal');
    const ClueModal = () => import('@/views/main-components/enter-clue/enter-clue');
    const NewCompany = () => import('@/views/crm/Detail/Components/Modal/fixed-modal-form/create-company');
    const NewInquiry = () => import('@/views/crm/Detail/Components/Modal/newInquiry');
    const followUpRecordModal = () => import('@/views/crm/Table/Components/Modal/followUpRecord/followUpRecordModal');
    const NewContact = () => import('@/views/crm/Detail/Components/Modal/newContact');
    const callingDetail = () => import('@/views/calling_sms/callingDetail.vue');
    // 通话短信-通话详情组件
    const CalldetailDialog = () => import('@/views/calling_sms/CalldetailDialog.vue');
    const addAi = () => import('@/views/main-components/add-ai');
    import { startQiankunServe } from '@/micros';
    import Cookies from 'js-cookie';
    import util from '@/libs/util';
    import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
    import mixinsStepVtour from '@/steps/menu/mixins';
    import { clearAllInfo } from '@/utils/safe';
    import { updateOpenedWindowList, removeOpenedWindowList } from '@/utils/storage';
    import { HANDLE_BUTTON, BUTTON_IDS, DIRECT_CREATE } from '@/api/config';

    import { insertScript } from '@/utils/staticDatas';
    import Vue from 'vue';
    import '@/directives';
    import VueTour from 'vue-tour';
    import base from '@/utils/base';
    import VueClipboard from 'vue-clipboard2';
    import VueCropper from 'vue-cropper';
    import tinymce from 'tinymce/tinymce';
    import { parseArray } from '@/utils/dataProcessing';

    import { queryToolbarTriggerConfig } from './ai-toolbar/api'

    const personalDropdown = () => import(/* webpackChunkName: "personalDropdown" */ "./main-components/personal-dropdown.vue"); // 文件预览
    const filePreview = () => import(/* webpackChunkName: "filePreview" */ "@/views/main-components/dataBase/filePreview"); // 文件预览
    const whatsAppGroupSendModal = () => import(/* webpackChunkName: "whatsAppGroupSendModal" */ "@/views/whatsapp-manage/whatsAppGroupSendModal/index"); // whatsapp群组消息发送modal
    export default {
        name: 'customRootRoomMainView',
        mixins: [mixinsStepVtour],
        components: {
            whatsAppGroupSendModal,
            filePreview, // 文件预览组件
            sidebarMenu,
            sidebarMenuSystem,
            breadcrumbNav,
            GlobalSearch,
            photogallery,
            templateModal,
            FloatingWindow,
            personalDropdown,
            AppCenter,
            MultiTypeCarousel,
            replyMailModal,
            WhatsAppReplyModal,
            ClueModal,
            NewCompany,
            NewInquiry,
            followUpRecordModal,
            NewContact,
            addAi,
            callingDetail,
            CalldetailDialog
        },
        data() {
            return {
                publicPath: process.env.BASE_URL,
                allFields: [], // 当前系统内所有字段信息
                menuForbidden: false, // 键盘操作菜单行为
                vue_tour_start: false,
                isDrawerShow: false,
                isFixed: false, // 悬浮窗是否占位
                floatWindowType: '',
                sidebarMenuWidth: '190px',
                menuExpand: true, // 目录是否是展开状态

                shrink: false,
                window_height: document.documentElement.clientHeight,
                update: true,
                logoutService: false,
                tour_read: 1,
                timer_mail: null,
                timer_upgradeTip: null,

                // 是否允许显示 invalidMsg
                showInvalidMsg: false,

                /* 全局搜索相关 */
                globalSearchKeyWords: '', // 全局搜索关键词
                // mockSearchData: [], // 模拟快速搜索结果数据，全局搜索的快速搜索前端页面已完成，后端接口暂时未做，与此变量相关的逻辑不可删除
                singlePageNodeWidth: 0,

                // 监听 DOM 变化
                observer: null,

                quickSendMailModalVisible: false,

                // 全局 wa 回复框
                visibleReplyModal: false,
                clueModal: false,
                delLoading: false, // 弹出框loading
                json_data: {},
                /* 新建公司 */
                newCustomerShow: false,
                newInquiryShow: false,

                // 新建跟进记录
                add_followup_modal: false,
                editDetail: null,
                // 新增联系人
                visible_new_contact: false,
                showAddAi: false,
                isShowQuickEnter: false,
                showQuickEnter: false,
                flag_update_inquiry: false,
                showCallAudioDetail: false,
                detailForQuery: null,
                // 人工客服 script 标签是否加载完成, 加载完成后再显示图标
                scriptLoaded: false,
            };
        },
        computed: {
            ...mapState({
                wAGroupSendVisible: state => state.wAGroupSendVisible, // whatsapp群组消息发送
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                serviceList: state => state.serviceList,
                lang: state => state.app.lang,
                menu_list: state => state.app.menu_list,
                fbChatUnread: state => state.facebook.fbChatUnread, // FB 私信未读数
                isFbService: state => state.isFbService,
                mailUnread: state => state.mailUnread,
                allUnreadMails: state => state.mail.allUnreadMails,
                ws_receive_mail: state => state.mail.ws_receive_mail,
                biHttp: 'biHttp',
                bi_report_menu: 'bi_report_menu',
                assosiatedInquiryId: state => state.facebook.assosiatedInquiryId,
                sourceDocumentTitle: state => state.sourceDocumentTitle,
                homeName: state => state.homeName,
                showUpgradeTip: state => state.app.showUpgradeTip,
                upgradeTip: state => state.app.upgradeTip,
                // allUnreadCount: state => state.app.allUnreadCount,
                router_map: state => state.app.router_map,
                isFBInvalid: state => state.facebook.isFBInvalid,
                isGoogleInvalid: state => state.google.isGoogleInvalid,
                isFullscreenImgShow: state => state.isFullscreenImgShow,
                fullscreenImgSrc: state => state.fullscreenImgSrc,
                isFullCarouselShow: state => state.isFullCarouselShow,
                fullCarouselProps: state => state.fullCarouselProps,
                globalWaReplyModalProps: 'globalWaReplyModalProps',
                totalChatCount: state => state.totalChatCount,
                pageOpenedList: state => state.app.pageOpenedList,
                menuTheme: state => state.app.menuTheme,
                isMailInvalid: state => state.mail.isMailInvalid,
                relatedAccounts: state => state.relatedAccounts,
                WS: state => state.socket.WS,
                websocketMsgMain: state => state.socket.websocketMsgMain,
                windowOpenTimeStamp: state => state.app.windowOpenTimeStamp,
                quickSendMailVisible: state => state.mail.quickSendMailVisible,
                is_marketing_station: state => state.app.is_marketing_station,
                salesList: state => state.crm.salesList,
                // leads 未读数
                fbLeadsUnentry: state => state.facebook.fbLeadsUnentry,
                // 所有留言表单
                formList: state => state.website_msg.formList,
                // whatsapp未读数
                waUnreadObj: state => state.whatsapp.waUnreadObj,
                // 系统通知未读数
                systemNoticeUnreadCount: state => state.app.systemNoticeUnreadCount,
                // 站内信未读数
                letterUnreadCount: state => state.app.letterUnreadCount,
                // 按钮权限 
                button_list: state => state.app.button_list,
                listType: state => state.clue.listType,
                customEditionConfig: 'customEditionConfig'
            }),
            ...mapGetters([
                'isContainsMenu',
                'isWAPersonalEdition',
                'isCustomEdition'
            ]),
            isSystem() {
                const curentRoutesName = this.$route.name;
                const list = (this.router_map || []).filter(item => item.name === 'systemSettings');
                const isSystemNames = list.length ? this.$dym.treeDataToList(list).map(v => v.name).some(v => v === curentRoutesName) : false;
                if (!isSystemNames) return false;
                return isSystemNames;
            },
            getLang() {
                if (this.lang === '') {
                    return (localStorage.getItem('LANG') || Cookies.get('LANG')) !== 'en-US';
                } else {
                    return this.lang !== 'en-US';
                }
            },
            mainMenuList() {
                return this.router_map.filter(item => item.name !== 'systemSettings').map(v => ({
                    ...v,
                    components: null
                }));
            },
            systemMenuList() {
                const routerMap = this.router_map || [];
                const f = routerMap.filter(item => item.name === 'systemSettings');
                return (f.length ? f[0].children : f).map(v => ({
                    ...v,
                    components: null,
                    children: v.children || []
                }));
            },
            content_height() {
                return `${this.window_height - 56}px`;
            },
            foldWidth() {
                if (this.shrink) {
                    return `${document.documentElement.clientWidth - 70 - 400}px`;
                } else {
                    return `${document.documentElement.clientWidth - 190 - 400}px`;
                }
            },
            myChatStatus() {
                const accId = Cookies.get('accId');
                const mine = this.serviceList.find(item => item.acctid === accId);
                return mine || {};
            },
            translatedUpgradeTip() {
                const arr = this.upgradeTip.split(/\s*\n---+\s*\n/);
                return this.lang === 'zh-CN' ? arr[0] : (arr[1] || arr[0]);
            },
            // "Google / Facebook 绑定已失效" Message 提示语
            invalidMsg() {
                // 未全部请求完成, 直接返回空, 暂不显示提示语
                if (!this.showInvalidMsg) {
                    return '';
                }

                const result = [];
                // Facebook 已失效
                if (this.isFBInvalid) {
                    let temp = this.$t('facebook.accountBinding.invalidBinding');
                    if (this.isContainsMenu('account_binding')) {
                        temp += `<a href="#/systemSettings/facebookBinding/account_binding" target="_blank" class="piwik_remind_fb_rebind">${this.$t('rebind')}</a>`;
                    } else {
                        temp += `${this.$t('rebind')} (${this.$t('haveNoAuthorityFBBinding')})`;
                    }
                    result.push(temp);
                }
                // Google 已失效
                if (this.isGoogleInvalid) {
                    let temp = this.$t('googleAdsBinding.accountBinding.invalidBinding');
                    temp += `<a href="#/systemSettings/google_binding/google_ads_binding" target="_blank" class="piwik_remind_google_rebind">${this.$t('rebind')}</a>`;

                    // 如果 menu_list 中有 google_ads_binding , 则显示
                    if (this.isContainsMenu('google_ads_binding')) {
                        result.push(temp);
                    }
                }
                // 邮箱 已失效
                if (this.isMailInvalid) {
                    let temp = this.$t('mailSetting.accountSetting.mailInvalidTip');
                    temp += `<a href="#/systemSettings/mail_set" target="_blank" class="piwik_remind_mail_reset">${this.$t('rebind')}</a>`;

                    result.push(temp);
                }

                return result.join('<br/>');
            },

            /* 是否显示全局搜索 */
            isShowGlobalSearch() {
                /* 系统设置及个人设置页面不支持全局搜索 */
                const hideRouters = ['/systemSettings', '/personal-set', '/mail_set'];
                const isShow = hideRouters.some(item => this.$route.path === item || this.$route.path.indexOf(item) !== -1);
                return !isShow;
            },
            // 顶部是否不只有全局搜索(还可能有系统升级提醒和失效提醒, 如果它们同时存在, 全局搜索会覆盖在提醒之上, 根据产品要求, 此属性让全局搜索框 z-index 为 -1 , 让它被提醒覆盖)
            notOnlyGlobalSearch() {
                // 有系统升级强提醒, return true
                if (this.showUpgradeTip) {
                    return true;
                }
                // 有失效强提醒, return true
                if (this.showInvalidMsg && this.invalidMsg) {
                    return true;
                }

                // 顶部只有全局搜索框, return false
                return false;
            },
            add_clue_btn() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.add_clue, this.button_list);
            },
            authorized_button() {
                return {
                    newCompany: !HANDLE_BUTTON(BUTTON_IDS.CRM.customer.newCompany, this.button_list),
                    newFolloUp: !HANDLE_BUTTON(BUTTON_IDS.followUpRecord.newFollowUp, this.button_list),
                    newContact: !HANDLE_BUTTON(BUTTON_IDS.CRM.inquiry.edit.newContact, this.button_list),
                    newInquiry: !HANDLE_BUTTON(BUTTON_IDS.CRM.inquiry.newCompany, this.button_list)
                };
            },
            noticeList() {
                let unProcessMsgCount = 0;
                this.formList.forEach(item => {
                    unProcessMsgCount += item.count;
                });
                let result = 0;
                Object.values(this.waUnreadObj).forEach(item => {
                    result += item;
                });
                return [
                    { icon: 'custom-youjian3', label: 'timeLine.mail', count: this.allUnreadMails, path: 'mail_home'},
                    { icon: 'custom-WhatsApp4', label: 'menu.whatsapp_manage', count: result, path: 'whatsapp_chat'},
                    { icon: 'custom-wangzhanliaotian', label: 'menu.xhl_chat', count: this.totalChatCount, path: 'xhl_chat'},
                    { icon: 'custom-wangzhanliuyan1', label: 'menu.web_message', count: unProcessMsgCount, path: 'website_message'},
                    { icon: 'custom-Facebook2', label: 'menu.inbox', count: this.fbChatUnread, path: 'inbox'},
                    { icon: 'custom-a-FacebookLeads', label: 'menu.FB_leads', count: this.fbLeadsUnentry, path: 'fb_message'}
                ]
            },
            // 所有触点消息总数
            allUnreadCount() {
                let result = 0; // this.systemNoticeUnreadCount + this.letterUnreadCount;
                if (this.isContainsMenu('whatsapp_chat')) {
                    Object.values(this.waUnreadObj).forEach(item => {
                        result += item;
                    });
                }
                if (this.isContainsMenu('xhl_chat')) {
                    result += this.totalChatCount;
                }
                if (this.isContainsMenu('inbox')) {
                    result += this.fbChatUnread;
                }
                if (this.isContainsMenu('fb_message')) {
                    result += this.fbLeadsUnentry;
                }
                if (this.isContainsMenu('website_message')) {
                    this.formList.forEach(item => {
                        result += item.count;
                    });
                }
                if (this.isContainsMenu('mail')) {
                    result += this.allUnreadMails;
                }
                return result;
            }
            // 未处理留言总数
            // unProcessMsgCount() {
            //     let count = 0;
            //     this.formList.forEach(item => {
            //         count += item.count;
            //     });
            //     return count;
            // }
        },
        methods: {
            ...mapActions([
                'updateUpgradeTip',
                'closeUpgradeTip'
            ]),
            ...mapMutations(['setautoTranslateStatusRecive', 'setautoTranslateStatusSend', 'setautoTranslatetargetLang', 'setautoTranslateNoTArr']),
        
            saveUserIdInStorage: function() {
                const userId = Cookies.get('userId');
                // const accId = Cookies.get('accId');
                // const userName = Cookies.get('userName');
                // const fullName = decodeURI(Cookies.get('fullName'));
                const enterpriseId = Cookies.get('enterpriseId');
                // let relatedAccounts = Cookies.get('relatedAccounts');
                // this.$store.commit('setUserName', userName);
                // this.$store.commit('setFullName', fullName);
                this.$store.commit('setUserId', {
                    userId: userId
                });
                this.$store.commit('setEnterpriseId', enterpriseId);
                if (localStorage.getItem('current_tenant')) {
                    const currentTenant = JSON.parse(localStorage.getItem('current_tenant'));
                    this.$store.commit('setUserName', currentTenant.nickName);
                    this.$store.commit('setFullName', currentTenant.nickName);
                }
                // if (relatedAccounts) {
                //     relatedAccounts = parseArray(relatedAccounts);
                //     if (Array.isArray(relatedAccounts)) {
                //         this.$store.commit('setRelatedAccounts', relatedAccounts);
                //     }
                // }
                // 如果要设置特殊值，务必在自己的模块里设置局部变量，以免污染全局
            },
            jumpPage(item) {
                this.$router.push({
                    name: item.path
                });
            },
            enterClueModel() {
                this.json_data = {
                    // templateId: this.templateId,
                    source: DIRECT_CREATE,
                    enterpriseId: this.enterpriseId,
                    userId: this.userId,
                    userName: this.userName
                };
                this.clueModal = true;
                this.newCustomerShow = false;
                this.newInquiryShow = false;
                this.add_followup_modal = false;
                this.visible_new_contact = false;
                this.showQuickEnter = false;
            },
            // 取消录入线索
            on_cancle_clue(data) {
                this.clueModal = data.close;
            },
            // 关掉新建线索模态框
            open_close(data) {
                this.clueModal = data.close;
            },

            /* 新建客户 */
            newCreateCustomer() {
                !this.salesList.length && this.$store.dispatch('getSalesList');
                this.$store.dispatch('getSelectOptions');
                this.newCustomerShow = true;
                this.clueModal = false;
                this.newInquiryShow = false;
                this.add_followup_modal = false;
                this.visible_new_contact = false;
                this.showQuickEnter = false;
            },
            /* 新建询盘 */
            newCreateCompany() {
                this.newInquiryShow = true;
                this.newCustomerShow = false;
                this.clueModal = false;
                this.add_followup_modal = false;
                this.visible_new_contact = false;
                // 获取全部销售人员
                !this.salesList.length && this.$store.dispatch('getSalesList');
            },
            // 新建跟进记录
            addFollowup() {
                this.add_followup_modal = true;
                this.showQuickEnter = false;
            },

            // 新增联系人
            newContact() {
                this.visible_new_contact = true;
                this.newInquiryShow = false;
                this.newCustomerShow = false;
                this.clueModal = false;
                this.add_followup_modal = false;
            },
            addAi() {
                this.showAddAi = true;
                this.showQuickEnter = false;
            },
            // 点击左上角图标跳转到系统首页
            async jumpToHomePage() {
                // 其他页面跳转进入
                // await this.get_home_page();
                // 如果当前页是首页，刷新页面
                if (this.homeName === this.$route.name) {
                    // this.$router.go(0);
                    if (this.homeName === 'mail_home' && this.$refs.routerView.view === 'WriteMail') {
                        this.$refs.routerView.WriteMailModel = true;
                        this.$refs.routerView.jumpToHomePageFlag = true;
                    } else if (this.homeName === 'one_key_release' && this.$refs.routerView.view === 'Creatcontent') {
                        const res = this.$refs.routerView.handlejumpToHomePage();
                        if (!res) {
                            this.update = false;
                            this.$nextTick(() => {
                                this.update = true;
                            });
                        }
                        this.$refs.routerView.jumpToHomePageFlag = true;
                    } else {
                        this.update = false;
                        this.$nextTick(() => {
                            this.update = true;
                        });
                    }
                } else { // 如果不是，则跳转到首页
                    let name = this.homeName;
                    if (!name) {
                        name = this.$dym.getDefalutRouteName(this.mainMenuList).name;
                    }
                    this.$router.push({
                        name
                    });
                }
            },
            handleMouseenter() {
                if (this.shrink) {
                    this.sidebarMenuWidth = '190px';
                    this.menuExpand = true;
                }
            },
            handleMouseleave() {
                if (this.shrink) {
                    this.sidebarMenuWidth = '70px';
                    this.menuExpand = false;
                }
            },
            // 子目录 menuItem mouseenter
            subMenuOpen() {
                if (this.shrink) {
                    this.sidebarMenuWidth = '190px';
                    this.menuExpand = true;
                }
            },
            // 子目录 menuItem mouseleave
            subMenuClose() {
                if (this.shrink) {
                    this.sidebarMenuWidth = '70px';
                    this.menuExpand = false;
                }
            },
            img_open_close(data) {
                this.$store.commit('setIsFullScreenImgShow', data);
            },
            init() {
                this.checkTag(this.$route.name);
            },
            // 合并后接口
            getConfigEvery() {
                util.ajaxLeadscloud({
                    url: '/v2-privilege/polymerization/getConfigEvery',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        serviceFlag: 'save_inquiry'
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        // 获取是否是营销站后台
                        // if (data.data.marketingStationVersion.code === '1') {
                        //     this.$store.commit('set_marketing_station', data.data.marketingStationVersion.data);
                        // }

                        // 设置消息通知总未读数
                        this.$store.commit('setNoticeUnread', {
                            type: 'systemNoticeUnreadCount',
                            count: data.data.noRead
                        });

                        // 设置crm输入上限
                        // this.$store.commit('setFieldLimit', {
                        //     crmCompany: data.data.getListForClient.crm_company || {},
                        //     crmContacts: data.data.getListForClient.crm_contacts || {},
                        //     crmInquiry: Object.assign({
                        //         transactionMoney: {
                        //             fieldKey: 'transactionMoney',
                        //             usableLength: 200
                        //         },
                        //         transactionInfo: {
                        //             fieldKey: 'transactionInfo',
                        //             usableLength: 4000
                        //         }
                        //     }, data.data.getListForClient.crm_inquiry || {})
                        // });

                        // 获取用户当前各类权限(FB 公司主页客服, 超管权限等)
                        /* FB 相关 */
                        // FB 公司主页客服
                        // 此处就算接口请求失败, 也要 setIsFBService 保证 hadSetIsFBService 被设置, 其他地方知道已经请求过"是否是 FB 主页客服"了
                        // this.$store.commit('setIsFbService', data.data.getuser.canFbManage === 1);
                        /* WABA客服 相关 */
                        // WABA 客服
                        this.$store.commit('setIsWabaService', data.data.getuser.canWabaService === 1);
                        /* 超管相关 */
                        // 设置"是否是超管"
                        this.$store.commit('setIsSuperAdmin', Boolean(data.data.getuser.superAdmin));
                        // 设置"是否开启'超管查看下属'功能"
                        this.$store.commit('setAbleViewSub', `${data.data.getuser.isToView}` !== '1');
                        // 是否有聊天权限
                        // this.$store.commit('setHasChatAuthority', data.data.getuser.canChat === 1);
                    } else {
                        // 请求crm输入上限 
                        // this.$store.commit('setFieldLimit', {
                        //     crmCompany: {},
                        //     crmContacts: {},
                        //     crmInquiry: {
                        //         transactionMoney: {
                        //             fieldKey: 'transactionMoney',
                        //             usableLength: 200
                        //         },
                        //         transactionInfo: {
                        //             fieldKey: 'transactionInfo',
                        //             usableLength: 4000
                        //         }
                        //     }
                        // });
                    }// 获取 FB 私信未读数
                    this.getUnReadCountByIds();
                }).catch(e => {
                    /* FB 相关 */
                    // 此处就算接口请求失败, 也要 setIsFBService 保证 hadSetIsFBService 被设置, 其他地方知道已经请求过"是否是 FB 主页客服"了
                    // this.$store.commit('setIsFbService', false);
                    // 获取 FB 私信未读数
                    this.getUnReadCountByIds();

                    // 请求crm输入上限
                    // this.$store.commit('setFieldLimit', {
                    //     crmCompany: {},
                    //     crmContacts: {},
                    //     crmInquiry: {
                    //         transactionMoney: {
                    //             fieldKey: 'transactionMoney',
                    //             usableLength: 200
                    //         },
                    //         transactionInfo: {
                    //             fieldKey: 'transactionInfo',
                    //             usableLength: 4000
                    //         }
                    //     }
                    // });
                });
            },
            // 合并后接口
            getChinaEveMsg() {
                util.ajaxLeadscloud({
                    url: '/v2-privilege/polymerization/getChinaEveMsg',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        username: this.userName
                    }
                }).then(({ data }) => {
                    if (data.code === 10000) {
                        // 设置站内信的未读数
                        this.$store.commit('setNoticeUnread', {
                            type: 'letterUnreadCount',
                            count: data.data.msgNoReadTotal
                        });
                        
                        // 是否开启访客提醒
                        this.$store.commit('setIsNoticeNewVisitor', data.data.remindStatus === 1);
                        this.$store.commit('setAutoLogoutChat', data.data.offlineSettings === 1);

                        // 检查用户绑定的邮箱是否有失效
                        this.$store.commit('setMailInvalid', Boolean(data.data.pwdWrongFlag));

                        // 更新邮件未读邮件数
                        this.$store.commit('set_allUnreadMails', data.data.totalElements);

                        // 设置企微未读消息的数量
                        this.$store.commit('setUnReadMsgCountAll', data.data.qywxUnreadCount);

                        // 查询是否已阅
                        // if (!['12200'].includes(this.enterpriseId)) {
                        //     this.tour_read = data.data.sysguideState;
                        //     this.$store.commit('updateIsModeRead', !data.data.sysguideState); // 先校验全局提示 检验时阻止全局请求
                        //     if (!this.tour_read) {
                        //         this.vue_tour_start = true;
                        //     } else {
                        //         this.$nextTick(function() {
                        //             this.$dym.findComponentDownward(this, 'breadcrumbNav').checkModeIsRead();
                        //         });
                        //     }
                        // }
                        
                    } else {
                        this.$store.commit('setIsNoticeNewVisitor', false);
                        this.$store.commit('setAutoLogoutChat', false);
                    }
                });
                util.ajaxJson({
                    url: `/visitor-chat/newTenant/server/getAccInfoByUserId?userId=${this.userId}&enterpriseId=${this.enterpriseId}`,
                    method: 'GET'
                }).then(res => {
                    if (res.data.code == '1' && res.data.data?.accId) {
                        Cookies.set('accId', res.data.data?.accId);
                        Cookies.set('yxToken', res.data.data?.token);
                        this.$store.commit('setAccId', res.data.data?.accId);
                        this.$store.commit('setHasChatAuthority', true);
                        this.$store.commit('setIsNoticeNewVisitor', true);
                        this.$store.commit('setAutoLogoutChat', true);
                    } else {
                        Cookies.remove('accId')
                        Cookies.remove('yxToken')
                        this.$store.commit('setAccId', null);
                        this.$store.commit('setHasChatAuthority', false);
                        this.$store.commit('setIsNoticeNewVisitor', false);
                        this.$store.commit('setAutoLogoutChat', false);
                    }
                });
            },
            // 获取菜单和首屏页面设置  合并后接口
            getMenu() {
                this.$commonApi.getMenuTree({
                    orgId: this.enterpriseId,
                    userId: this.userId 
                }).then(res => {
                    if (res.code === 10000) {
                        const frontMenuList = res.data && res.data[0] ? res.data[0].children : [];
                        const backMenuList = res.data && res.data[1] ? res.data[1] : [];
                        backMenuList.children.push({
                            "id": "100046",
                            "title": "通知设置",
                            "path": "noticeSetting",
                            "parentId": "12",
                            "orderNo": "3",
                            "children": []
                        });
                        localStorage.setItem('menuList', JSON.stringify(res.data));
                        // const frontMenuList =  [
                        //     {
                        //         "id": "12",
                        //         "title": "",
                        //         "path": "crm",
                        //         "parentId": "12",
                        //         "orderNo": "12",
                        //         "children": [
                        //             {
                        //                 "id": "100046",
                        //                 "title": "线索管理",
                        //                 "path": "clueManage",
                        //                 "parentId": "12",
                        //                 "orderNo": "3",
                        //                 "children": []
                        //             },
                        //             {
                        //                 "id": "100047",
                        //                 "title": "客户管理",
                        //                 "path": "customerManage",
                        //                 "parentId": "12",
                        //                 "orderNo": "3",
                        //                 "children": []
                        //             }
                        //         ]
                        //     },
                        //     {
                        //         "path": "mail",
                        //         "icon": "",
                        //         "id": 10600,
                        //         "title": "邮件"
                        //     },
                        //     {
                        //         "path": "communication",
                        //         "children": [
                        //             {
                        //                 "path": "whatsapp_chat",
                        //                 "children": [],
                        //                 "icon": "",
                        //                 "id": 11028,
                        //                 "title": "WhatsApp 对话"
                        //             },
                        //             {
                        //                 "path": "xhl_chat",
                        //                 "icon": "ios-chatboxes-outline",
                        //                 "id": 10625,
                        //                 "title": "网站聊天"
                        //             },
                        //             {
                        //                 "path": "inbox",
                        //                 "icon": "",
                        //                 "id": 10646,
                        //                 "title": "Facebook聊天"
                        //             }
                        //         ],
                        //         "icon": "",
                        //         "id": 10956,
                        //         "href": "communication",
                        //         "title": "沟通"
                        //     },
                        //     {
                        //         "path": "socialMedia",
                        //         "children": [
                        //             {
                        //                 "path": "whatsapp_management",
                        //                 "icon": "",
                        //                 "id": 11070,
                        //                 "title": "WhatsApp 管理"
                        //             },
                        //             {
                        //                 "path": "fb_message",
                        //                 "icon": "",
                        //                 "id": 10648,
                        //                 "title": "Leads 管理",
                        //             }
                        //         ],
                        //         "icon": "social-facebook-outline",
                        //         "id": 10630,
                        //         "title": "社媒营销"
                        //     },
                        //     {
                        //         "path": "websiteInteraction",
                        //         "children": [
                                    
                        //             {
                        //                 "path": "website_message",
                        //                 "icon": "ios-chatbubble-outline",
                        //                 "id": 10627,
                        //                 "title": "网站留言"
                        //             },
                        //             {
                        //                 "path": "visitor_history",
                        //                 "icon": "ios-clock-outline",
                        //                 "id": 10626,
                        //                 "title": "访客历史"
                        //             },
                        //             {
                        //                 "path": "google_search_console",
                        //                 "icon": "google-search-console",
                        //                 "id": 11103,
                        //                 "href": "",
                        //                 "title": "Search Console"
                        //             }
                        //         ],
                        //         "icon": "icon-web-mutual",
                        //         "id": 10882,
                        //         "href": "",
                        //         "title": "网站"
                        //     },
                        //     {
                        //         "path": "briefcase",
                        //         "children": [
                        //             {
                        //                 "path": "database",
                        //                 "icon": "",
                        //                 "id": 11070,
                        //                 "title": "资料库"
                        //             },
                        //             {
                        //                 "path": "script_set",
                        //                 "icon": "",
                        //                 "id": 10648,
                        //                 "title": "话术",
                        //             }
                        //         ],
                        //         "icon": "social-facebook-outline",
                        //         "id": 10630,
                        //         "title": "知识库"
                        //     }
                            
                        // ]
                        // backMenuList = [
                        //     {
                        //         "id": "10",
                        //         "title": "",
                        //         "path": "system_settings",
                        //         "parentId": "1",
                        //         "orderNo": "1",
                        //         "children": [
                        //             {
                        //                 "id": "1000",
                        //                 "title": "公司概况",
                        //                 "path": "company",
                        //                 "parentId": "10",
                        //                 "orderNo": "3",
                        //                 "children": []
                        //             },
                        //             {
                        //                 "id": "107",
                        //                 "title": "组织架构",
                        //                 "path": "organizational",
                        //                 "parentId": "10",
                        //                 "orderNo": "3",
                        //                 "children": [{
                        //                     "id": "1007",
                        //                     "title": "部门与成员",
                        //                     "path": "departmentAndMember",
                        //                     "parentId": "107",
                        //                     "orderNo": "3",
                        //                     "children": []
                        //                 },
                        //                 {
                        //                     "id": "1008",
                        //                     "title": "成员职级与职位",
                        //                     "path": "memberRanksAndPositions",
                        //                     "parentId": "107",
                        //                     "orderNo": "3",
                        //                     "children": []
                        //                 },
                        //                 {
                        //                     "id": "1008",
                        //                     "title": "角色权限",
                        //                     "path": "rolePermission",
                        //                     "parentId": "107",
                        //                     "orderNo": "3",
                        //                     "children": []
                        //                 },
                        //                 {
                        //                     "id": "1008",
                        //                     "title": "自定义权限规则",
                        //                     "path": "permissionRule",
                        //                     "parentId": "107",
                        //                     "orderNo": "3",
                        //                     "children": []
                        //                 }]
                        //             },
                        //             {
                        //                 "id": "1000q",
                        //                 "title": "业务对象和字段",
                        //                 "path": "businessObjectAndField",
                        //                 "parentId": "10",
                        //                 "orderNo": "3",
                        //                 "children": [{
                        //                     "id": "1000",
                        //                     "title": "业务对象设置",
                        //                     "path": "businessObject",
                        //                     "parentId": "10",
                        //                     "orderNo": "3",
                        //                     "children": []
                        //                 },{
                        //                     "id": "1001",
                        //                     "title": "关联关系",
                        //                     "path": "associationTable",
                        //                     "parentId": "11",
                        //                     "orderNo": "2",
                        //                     "children": []
                        //                 },{
                        //                     "id": "1002",
                        //                     "title": "通用选项集",
                        //                     "path": "generalOptionsSet",
                        //                     "parentId": "11",
                        //                     "orderNo": "2",
                        //                     "children": []
                        //                 }]
                        //             },
                        //             {
                        //                 "path": "mail_set",
                        //                 "icon": "",
                        //                 "id": 10607,
                        //                 "title": "邮箱设置",
                        //                 "children": []
                        //             },
                        //             {
                        //                 "path": "company_mail_magage",
                        //                 "icon": "",
                        //                 "id": 11014,
                        //                 "title": "企业邮箱",
                        //                 "children": []
                        //             },
                        //             {
                        //                 "path": "portal_set",
                        //                 "children": [
                        //                     {
                        //                         "path": "chat_code",
                        //                         "icon": "",
                        //                         "id": 10602,
                        //                         "title": "埋点设置"
                        //                     },
                        //                     {
                        //                         "path": "distribution",
                        //                         "icon": "",
                        //                         "id": 10651,
                        //                         "title": "客服分配规则"
                        //                     },
                        //                     {
                        //                         "path": "languages_set",
                        //                         "icon": "",
                        //                         "id": 10650,
                        //                         "title": "多语种设置"
                        //                     },
                        //                     {
                        //                         "path": "block_ip_address",
                        //                         "icon": "",
                        //                         "id": 11048,
                        //                         "title": "屏蔽IP地址"
                        //                     }
                        //                 ],
                        //                 "icon": "",
                        //                 "id": 10652,
                        //                 "title": "聊天设置"
                        //             },
                        //             {
                        //                 "path": "facebookBinding",
                        //                 "children": [
                        //                     {
                        //                         "path": "account_binding",
                        //                         "icon": "",
                        //                         "id": 10643,
                        //                         "title": "账号绑定",
                        //                     },
                        //                     {
                        //                         "path": "form_bind",
                        //                         "icon": "",
                        //                         "id": 10647,
                        //                         "title": "Leads绑定"
                        //                     },
                        //                     {
                        //                         "path": "fb_distribution",
                        //                         "icon": "",
                        //                         "id": 11036,
                        //                         "title": "客服自动分配规则"
                        //                     }
                        //                 ],
                        //                 "icon": "",
                        //                 "id": 10885,
                        //                 "title": "Facebook绑定"
                        //             },
                        //             {
                        //                 "path": "autoSettings",
                        //                 "children": [
                        //                     {
                        //                         "path": "automated_allocation",
                        //                         "icon": "",
                        //                         "id": 11135,
                        //                         "title": "自动化分配"
                        //                     },
                        //                     {
                        //                         "path": "notice_setting",
                        //                         "icon": "",
                        //                         "id": 10865,
                        //                         "title": "自动化规则"
                        //                     },
                        //                     {
                        //                         "path": "automated_mail",
                        //                         "icon": "",
                        //                         "id": 10873,
                        //                         "title": "自动化邮件"
                        //                     }
                        //                 ],
                        //                 "icon": "",
                        //                 "id": 10886,
                        //                 "title": "自动化"
                        //             },
                        //         ]
                        //     }
                        // ]
                        const menuList = [].concat(frontMenuList, backMenuList);
                        const BI_url_Obj = {};
                        this.get_url_List(menuList, BI_url_Obj);
                        this.$store.commit('set_BI_urlList', Object.assign(this.bi_report_menu, BI_url_Obj));
                        // 处理原始数据, 更新 vuex menuList (平铺数组), 更新 vuex roleMenu (原始数据)并存入 localStorage , 更新 vuex router_map (添加动态路由 + 给左侧目录使用)
                        this.$store.commit('set_menu_list', menuList);
                        
                        
                        // console.log(document.querySelector('#appContainer '), 'appContainerappContainerappContainer ');
                        const name = frontMenuList[0] && frontMenuList[0].children.length ? frontMenuList[0].children[0].path : frontMenuList[0].path;
                        this.$store.commit('setHomeName', name);
                        Cookies.set('HOMEPAGE', name);
                        if(this.$route.query && this.$route.query.url){
                            // 进入到mian之后按照地址栏的参数进行导航跳转 
                            // 主要是为了解决 微前端页面从login进入mian之后没有找到appcantainer的错误
                            this.$router.push({
                                name
                            });
                            // this.$router.push({
                            //     path: this.$route.query.url
                            // })
                        }
                    } else {
                        this.$Message.error(this.$t('main.getMenu'));
                    }
                });
                // util.ajax({
                //     url: 'new-privilege/merge/getMenuHomePage',
                //     method: 'GET',
                //     params: {
                //         userId: this.userId,
                //         orgId: this.enterpriseId
                //     }
                // }).then(({ data }) => {
                //     if (data.code === '1') {
                //         // 菜单设置
                //         /** 获取BI报表的 Path相对的url */
                //         const BI_url_Obj = {};
                //         this.get_url_List(data.data.getMenu.menuList, BI_url_Obj);
                //         this.$store.commit('set_BI_urlList', Object.assign(this.bi_report_menu, BI_url_Obj));
                //         // 处理原始数据, 更新 vuex menuList (平铺数组), 更新 vuex roleMenu (原始数据)并存入 localStorage , 更新 vuex router_map (添加动态路由 + 给左侧目录使用)
                //         this.$store.commit('set_menu_list', data.data.getMenu.menuList);

                //         /**
                //          *  首页设置
                //          *  如果是 wa 版本, 不允许设置首页, 直接设置为 wa 聊天
                //          * */
                //         let homeName = '';
                //         if (this.isWAPersonalEdition || (`${this.enterpriseId}` === '11471')) {
                //             homeName = 'whatsapp_chat';
                //         } else {
                //             homeName = data.data.getHomePage !== '' ? data.data.getHomePage : this.is_marketing_station ? 'home_index' : 'mail_home';
                //         }
                //         this.$store.commit('setHomeName', homeName);
                //         Cookies.set('HOMEPAGE', homeName);
                //     } else {
                //         this.$Message.error(this.$t('main.getMenu'));
                //     }
                // });
            },
            /** 递归遍历menulist,获取BI报表的 Path相对的url */
            get_url_List(menuList, urlObj) {
                menuList.forEach(menu => {
                    if (menu.path.includes('bi_report_')) {
                        urlObj[menu.path] = this.biHttp + menu.href;
                    }
                    // 网站管理那用 这期先不用
                    // if (menu.path === 'websiteInteraction' && menu.children.length && menu.children.some(item=> item.path === 'website_message')) {
                    //     this.getWebsiteManagerData();
                    // }
                    if (menu.children && menu.children.length > 0) {
                        this.get_url_List(menu.children, urlObj);
                    }
                });
            },
            get_buttons() {
                util.ajaxLeadscloudJson({
                    // url: 'new-privilege/resource/getButton',
                    url: '/v2-privilege/user/permission/getButtonPermissionInfo',
                    method: 'POST',
                    data: {
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }
                }).then(({ data }) => {
                    this.$store.commit('set_button_list', data.data);
                    localStorage.setItem('BUTTONS', JSON.stringify(data.data));
                });
            },
            toggleClick() {
                if (this.forbiddenMenuMouseover) return false;
                if (this.shrink) {
                    this.sidebarMenuWidth = '190px';
                    this.menuExpand = true;
                    this.singlePageNodeWidth = document.querySelector('.single-page').offsetWidth - 120;
                    this.$store.state.menuExpand = true;
                    localStorage.setItem('menuExpand', true);
                } else {
                    this.sidebarMenuWidth = '70px';
                    this.menuExpand = false;
                    this.$store.state.menuExpand = false;
                    this.singlePageNodeWidth = document.querySelector('.single-page').offsetWidth + 120;
                    localStorage.setItem('menuExpand', false);
                }
                this.shrink = !this.shrink;
            },
            showPrivateSettings() {
                this.$refs.settings.modal = true;
            },
            logout_chat() {
                if (this.$store.state.nim) {
                    this.$store.commit('resetChat');
                    this.logoutServiceOK();
                } else {
                    const accId = Cookies.get('accId');
                    if (accId) {
                        util.ajaxInternational({
                            url: '/ visitor-chat/server/updateEnterpriseidServiceOnlineStatusNew',
                            method: 'post',
                            data: {
                                accid: accId,
                                operateSource: 'front-end-logout',
                                onlineFlag: 0
                            }
                        }).then(response => {
                            this.logoutServiceOK();
                        }).catch(err => {
                            this.logoutServiceOK();
                        });
                    }
                }
            },

            seeUserOnline() {
                const accId = Cookies.get('accId');
                if (accId) {
                    util.ajaxInternational({
                        url: '/visitor-chat/server/isMyselfOnlineByAccid',
                        method: 'post',
                        data: {
                            accid: accId
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.getAllEnterpriseService();
                        } else {
                            this.logoutServiceOK();
                        }
                    });
                } else {
                    this.logoutServiceOK();
                }
            },
            logoutServiceOK() {
                const currentTenant = JSON.parse(localStorage.getItem('current_tenant'));

                if (currentTenant && currentTenant.larkId) {
                    this.$commonApi.logoutByLarkId({
                        larkId: currentTenant.larkId
                    }).then(response => {
                        if (response.code === 10000) {
                            // 移除localStorage的超管权限
                            localStorage.removeItem('isSuperAdmin');

                            this.$Message.closeAll();
                            this.$Notice.closeAll();
                            this.$store.commit('updateChatViewStatus', true);
                            this.$store.commit('resetChat');
                            this.$store.commit('confirmNotChatWithOther', false);
                            this.$store.commit('clearOpenedSubmenu');
                            this.$store.commit('clearAllTags');
                            // 重置数据迁移的变量
                            this.$store.commit('cleanDataMovement');
                            this.$store.commit('logout', this);
                            // 关闭 websocket 链接
                            this.$store.commit('closeWS');
                            this.$Message.success(this.$t('main.logoutSuccess'));
                            location.href = location.href.replace(/#.*$/, '');
                        } else {
                            this.$Message.warning(this.$t('main.logoutFail'));
                        }
                        clearAllInfo();
                    });
                } else {
                    this.$store.commit('resetChat');
                    // 关闭 websocket 链接
                    this.$store.commit('closeWS');
                    clearAllInfo();
                    this.$router.push({
                        name: 'login'
                    });
                }
            },
            getAllEnterpriseService() {
                util.ajaxInternational({
                    url: '/visitor-chat/server/getAllEnterpriseService',
                    method: 'POST',
                    data: {
                        enterpriseId: this.enterpriseId
                    }
                }).then(response => {
                    this.logoutService = true;
                    if (response.data) {
                        this.$store.commit('setServiceList', response.data);
                    }
                }).catch(error => {
                    this.logoutService = true;
                    this.$Message.error(this.$t('main.error_getServiceList'));
                });
            },
            checkTag(name) {
                let openpageHasTag = false;
                for (const item of this.pageOpenedList) {
                    if (item.name === name) {
                        openpageHasTag = true;
                        break;
                    }
                }
                if (!openpageHasTag) {
                    //  解决关闭当前标签后再点击回退按钮会退到当前页时没有标签的问题
                    util.openNewPage(this, name, this.$route.params || {}, this.$route.query || {});
                }
            },
            beforePush(name) {
                return true;
            },
            /** 定时调收件接口 */
            receiveMail() {
                this.timer_mail = setInterval(() => {
                    util.ajaxReceiveMail({
                        url: '/mail/receiveMail',
                        method: 'PUT',
                        timeout: 600000,
                        data: {
                            userId: this.userId,
                            userName: this.userName,
                            enterpriseId: this.enterpriseId
                        }
                    }).then(({ data }) => {
                        if (data.code === 1) {
                            if (data.data > 0) {
                                this.$store.dispatch('updateAllUnreadMails');
                                this.$store.commit('set_ws_receive_mail', this.ws_receive_mail + 1);
                            }
                        }
                    });
                }, 120000);
            },
            save_tour_read() {
                util.ajax({
                    url: '/report/sysguide/updateState',
                    method: 'GET',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        readStatus: 1
                    }
                }).then(res => {
                    if (res.data.code !== '1') {
                        console.error('保存引导已读状态失败');
                    } else {
                        this.$store.commit('updateIsModeRead', false);
                        this.$nextTick(function() {
                            this.$dym.findComponentDownward(this, 'breadcrumbNav').checkModeIsRead();
                        });
                    }
                });
            },
            closeTourStart() {
                this.vue_tour_start = false;
                this.tourMentStart(4);
            },
            // 跳转到系统设置页面
            openSystemSettings() {
                const routerMap = this.router_map || [];
                const f = routerMap.filter(item => item.name === 'systemSettings');
                // const f = routerMap.filter(item => item.name === 'permisssystem');
                const config = f.length ? f[0].children : f;
                const item = this.$dym.getDefalutRouteName(config);
                if (item) {
                    this.$nextTick(function() {
                        const targetUrl = this.$router.resolve({
                            name: item.name
                        });
                        window.open(targetUrl.href, '_blank');
                        // this.$stm.openNewWindow(targetUrl.href);
                    });
                }
            },
            // 应用中心显隐
            toggleAppCenter(visible) {
                if (this.forbiddenMenuMouseover) return false;
                this.$store.commit('changeAppCenterVisible', visible);
            },
            /** 分屏的切换 */
            handleFloatWindowChange(type) {
                if (this.isWindowEffective(type) || type === 'mail_home') {
                    switch (type) {
                        case 'xhl_chat':
                            /* //处于分屏列表时需要重置当前聊天的session id
                             this.$store.commit('updateCurrTarget', {}) */
                            // 显示聊天列表
                            this.$store.commit('updateCurrInterface', 'splitChatList');
                            this.$store.commit('setNotChattingWithUnreadCollect', []);
                            if (this.$store.state.nim) {
                                // 重置当前聊天的未读消息
                                this.$store.state.nim.setCurrSession('');
                            }
                            break;
                        case 'inbox':
                            this.$store.commit('setFacebookSplitShowList', true);
                            break;
                    }

                    if (this.floatWindowType === type) {
                        this.isDrawerShow = !this.isDrawerShow;
                        this.isFixed = false;
                    } else {
                        this.floatWindowType = type;
                        this.isDrawerShow = true;
                    }
                }
            },
            isWindowEffective(name) {
                return this.$route.name !== name;
            },
            // 应用中心打开通知分屏(任务提醒/系统通知/站内信)
            openNoticeScreen(type) {
                // 先关闭分屏, 避免分屏变动后依然被应用中心覆盖
                this.isDrawerShow = false;
                // 打开指定通知分屏
                this.$nextTick(() => {
                    this.handleFloatWindowChange(type);
                });
            },
            /* 根据当前路由路径决定是否使用页面滚动条 */
            singlePageScroll() {
                const singlePageNode = document.querySelector('.single-page');
                singlePageNode.style.overflowX = 'hidden';
                if (['home_index', 'fb_message', 'visitor_history', 'close_loop', 'languages_set'].includes(this.$route.name)) {
                    if (this.window_height > 510) {
                        singlePageNode.style.overflowY = 'hidden';
                    } else {
                        singlePageNode.style.overflowY = 'visible';
                    }
                } else {
                    singlePageNode.style.overflowY = 'visible';
                }
                this.singlePageNodeWidth = singlePageNode.offsetWidth
            },
            /* 当账号设置离职后将当前客服在线更改为离线状态 */
            changeCurrentServiceOffline(isOnline) {
                console.log(isOnline);
                console.error('触发上下线方法, 事件类型: changeCurrentServiceOffline', isOnline);
                this.$refs.personDropdown.isOnline(Boolean(isOnline), 1);
            },
            /* 获取leads管理未录入数 网站留言 合并后接口 */
            getLastedUnTreatedLeads() {
                util.ajax({
                    url: '/form-cust/form/getLastedUnTreatedLeads',
                    method: 'get',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        cateType: 1,
                        billType: 1,
                        status: -1
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        // 获取leads管理未录入数
                        this.$store.commit('setFbLeadsUnentry', data.data.unTreatedLeadsCount);
                        // 获取网站留言未处理数
                        const countToForm = data.data.dataMap;
                        const formList = data.data.sortedList.filter(item => {
                            if (item.cateType !== 1) {
                                item.count = countToForm[item.id] ? parseInt(countToForm[item.id]) : 0;
                                return item;
                            }
                        });
                        // 更新 vuex 中的 formList
                        this.$store.commit('website_msg/updateFormList', formList);
                    }
                });
            },
            // 点击顶部 wa 未读数
            clickWaUnread() {
                // 设定跳转条件, 指定忽略 wa 账号优先级排序逻辑, 优先显示带未读数的账号
                localStorage.setItem('toWaUnreadAccount', 'true');
                // 跳转到 wa 页面
                this.$refs.sidebarMenu.handleChange('whatsapp_chat');
            },
            // visibilitychange 事件监听
            onVisibilityChange() {
                // 不同浏览器 hidden 名称
                const hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null;
                if (!document[hiddenProperty]) {
                    // 标签页状态变为可见

                    // 重新获取 FB 私信未读数
                    !this.isWAPersonalEdition && this.getUnReadCountByIds();
                } else {
                    // 标签页状态变为不可见
                    /**
                     * @Date: 2020-05-12 14:48:27
                     * @LastEditors: niumkiki
                     * @description: 如果是聊天界面来回切换窗口,则正在输入标识需要做一下处理
                     * @param :
                     * @return:
                     */
                    this.$store.commit('setFlagToInput', true);
                }
                this.$store.commit('setIsHidden', document[hiddenProperty]);
            },
            // 初始化 storage 监听器相关
            onStorageChange() {
                // 设置当前 window 开启时间
                this.$store.commit('setWindowOpenTimeStamp', Date.now());

                // 初始化存入当前时间戳到 localStorage
                updateOpenedWindowList(this.windowOpenTimeStamp);

                // 每隔 1s 就把自己当前的时间戳放到数组最后一位, 避免其他标签页意外关闭后仍存在于 localStorage 中导致提醒失效
                this.$store.commit('clearTimerUpdateSeq');
                this.$store.commit('setTimerUpdateSeq', setInterval(() => {
                    updateOpenedWindowList(this.windowOpenTimeStamp);
                }, 1000));

                // 初始化 storage 监听器
                window.addEventListener('storage', this.onStorageFunc);
            },
            // storage 监听函数
            onStorageFunc(e) {

                // 页面个数变化
                if (e.key === 'openedWindowList') {
                    const newValue = e.newValue ? JSON.parse(e.newValue) : '';
                    const oldValue = e.oldValue ? JSON.parse(e.oldValue) : '';
                    // 如果有询盘云标签页关闭
                    if (newValue.length < oldValue.length) {
                        /* 用于因为关闭了其它tab页,导致触发多端登录状态改变时（onloginportschange）判断当前页面是否退出聊天 */
                        this.$store.commit('setIsAllowToOffLine', false);
                    }
                }
                // 当其它标签页主动切换聊天在线、离线状态时
                if (e.key === 'chatStampList') {
                    if (e.newValue) {
                        if (e.newValue.indexOf('on') > -1) {
                            /* 其它tab登录了聊天,让当前页面的聊天处于登录状态 */
                            console.error('触发上下线方法, 事件类型: onStorageFunc, chatStampList on', e.newValue);
                            this.$refs.personDropdown.isOnline(true, 0);
                        }
                        this.$store.commit('setIsAllowToOffLine', true);
                    }

                    return;
                }

                // 标签页退出
                if (e.key === 'XHLLogin') {
                    // 有一个标签页退出，所有都得退出
                    if (e.newValue === 'LOGOUT') {
                        /**
                         * @Description: 【ID1009310】乐达定制需求--跳转新标签页切换账户，账户会自动退出
                         * 乐达美业定制需求, 集团下有多个企业时可直接切换关联账号查看不同企业的数据
                         * 多个标签页时, 新标签页切换账号, 其他页面发现 cookie 和 vuex 状态不匹配, 会退回到登录页修改了 XHLLogin 值, 于是所有标签页都触发此处方法退出询盘云
                         * 为避免这种情况, 此处增加判断 --- 如果有关联账号 + 当前 Cookie 中的值和 vuex 中的值一致, 则不退出询盘云
                         * @author 汤一飞
                         * @date 2021/1/20
                        */
                        if (this.relatedAccounts) {
                            if (Cookies.get('enterpriseId') &&
                                `${Cookies.get('enterpriseId')}` === `${this.enterpriseId}` &&
                                Cookies.get('userId') &&
                                `${Cookies.get('userId')}` === `${this.userId}`) {
                                return;
                            }
                        }

                        this.seeUserOnline();
                    }

                    return;
                }

                // 发生点击事件, 停止标题闪动
                if (e.key === 'xhlWindowClick') {
                    if (e.newValue !== '0') {
                        // 停止页面标题闪动消息提示
                        window.parent.document.title = this.sourceDocumentTitle;
                        this.$store.commit('changeNewRemindFlag', false);
                    }

                    return;
                }
            },
            // 取消事件监听
            offStorageChange() {
                // 清除更新数组定时器
                this.$store.commit('clearTimerUpdateSeq');
                // 取消事件监听
                window.removeEventListener('storage', this.onStorageFunc);
                // 清除数据
                removeOpenedWindowList(this.windowOpenTimeStamp);
                // 设置当前 window 开启时间为 0 (默认值)
                this.$store.commit('setWindowOpenTimeStamp', 0);
            },
            async resetChildViewData() {
                // 更新视图
                this.update = false;
                await this.$nextTick();
                this.update = true;
            },
            // 定时获取系统升级提示配置信息
            getUpgradeTip() {
                // 清除定时
                if (this.timer_upgradeTip) {
                    clearInterval(this.timer_upgradeTip);
                }

                // 首先请求一次升级提示信息
                this.updateUpgradeTip();

                // 设置定时, 之后每 5 分钟请求一次
                this.timer_upgradeTip = setInterval(() => {
                    this.updateUpgradeTip();
                }, 300000);
            },
            // 关闭绑定失效提醒
            closeInvalidTip() {
                this.showInvalidMsg = false;
                localStorage.setItem('invalidMsgClosed', 'true');
            },
            // 注册菜单操作行为
            keyDown() {
                const key = event.key;
                if (key === 'Control' || key === 'Alt' || key === 'Meta') {
                    this.menuForbidden = true;
                }
            },
            keyUp() {
                const key = event.key;
                if (key === 'Control' || key === 'Alt' || key === 'Meta') {
                    this.menuForbidden = false;
                }
            },
            winBlur() {
                this.menuForbidden = false;
            },
            winMousedown() {
                this.$store.commit('toggleWinMouseDownFlag');
            },

            /* 全局搜索相关逻辑 */
            /** 搜索关键词改变 */
            changeKeyword(keyword) {
                this.globalSearchKeyWords = keyword.trim();
            },
            /* 搜索 */
            globalSearch(searchType) {
                /**
                 * @Description: 当用户执行了搜索操作(回车或者点击搜索图标，或者点击下拉中的查看更多按钮)，需要更新子组件能收到的lastSearchKeyWords
                 *              以保证在用户强刷全局搜索结果页面时，保存的关键词与页面显示的搜索结果是对应的
                 * @author 杨娣
                 * @date 2020/8/25
                 */
                // 根据关键词搜索
                if (searchType === 'follDoseSearch' && this.globalSearchKeyWords) {
                    const refComp = this.$refs.routerView;
                    if (this.$route.path !== '/global-search') {
                        localStorage.setItem('leadsCloud-globalSearchKeyWords', JSON.stringify({ prev: this.globalSearchKeyWords, curr: this.globalSearchKeyWords }));
                        const href = window.location.origin + window.location.pathname + this.$router.resolve({
                            name: 'global-search'
                        }).href;
                        window.open(href, '_blank');
                    } else {
                        refComp.currentPage = 1;
                        refComp.searchResults = [];
                        refComp.isFirstComing = true;
                        refComp.getSearchCount();
                        refComp.lastSearchKeyWords = this.globalSearchKeyWords;
                    }
                }
            },
            /* 关键词高亮处理 */
            highLightKeyWords(content) {
                let result = content.split(this.globalSearchKeyWords);
                for (let i = 0; i < result.length; i++) {
                    let string = result[i];
                    string = string.replace(/&/g, '&amp;');
                    string = string.replace(/\"/g, '&quot;');
                    string = string.replace(/</g, '&lt;');
                    string = string.replace(/>/g, '&gt;');
                    result[i] = string;
                }
                result = result.join(`<span class='keyword'>${this.globalSearchKeyWords}</span>`);
                return result;
            },
            /* 点击搜索结果的跳转 */
            handleSearchJump(e) {
                switch (e.moduleType) {
                    case 'mail':
                        this.jumpToMail(e.mailId);
                        break;
                    case 'whatsApp':
                        this.jumpToWhatsApp(e.whatsAppAccount);
                        break;
                    case 'clue':
                        this.jumpToClueManage(e.clueId, e.userIdsShow);
                        break;
                    case 'inquiry':
                        this.jumpToInquiryManage(e.inquiryId, e.userIdsShow, e.companyId);
                        break;
                    case 'contact':
                        this.jumpToContactManage(e.contactId, e.userIdsShow, e.companyId);
                        break;
                }
            },
            /* 跳转至邮件，并进行跳转前校验 */
            jumpToMail(mailId) {
                /* 跳转前要进行功能权限以及邮件是否被彻底删除的校验 */
                util.ajaxMailJson({
                    url: '/mail/mailDetail',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        id: mailId
                    },
                    timeout: 60000
                }).then(res => {
                    if (res.data.code === 1) {
                        const forwardMailDetail = Object.assign(res.data.data, { id: mailId });
                        localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);
                        const href = window.location.origin + window.location.pathname + this.$router.resolve({
                            name: 'mail_home'
                        }).href;
                        localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(forwardMailDetail));
                        window.open(href, '_blank');
                    } else {
                        this.$Message.error('回复邮件已被删除，无法查看！');
                    }
                });
            },
            /* 跳转至WhatsApp，并进行跳转前校验 */
            jumpToWhatsApp(WAAccount) {
                if (this.isContainsMenu('whatsapp_chat')) {
                    localStorage.setItem('leadsCloud-WA-WAAccount', WAAccount);
                    const href = window.location.origin + window.location.pathname + this.$router.resolve({
                        name: 'whatsapp_chat'
                    }).href;
                    window.open(href, '_blank');
                } else {
                    this.$Message.warning('您没有WhatsApp页面的查看权限，请联系您的管理员开通');
                }
            },
            /* 跳转至线索详情页，并进行跳转前校验 */
            jumpToClueManage(clueId, userIdsShow) {
                localStorage.setItem('leadsCloud-clueId', clueId);
                if (userIdsShow.includes('-1')) {
                    /* 公海线索功能权限校验 */
                    if (this.isContainsMenu('common_sea_customer')) {
                        const href = window.location.origin + window.location.pathname + this.$router.resolve({
                            name: 'common_sea_customer'
                        }).href;
                        window.open(href, '_blank');
                    } else {
                        this.$Message.warning('您没有公海线索页面的查看权限，请联系您的管理员开通');
                    }
                } else {
                    if (this.isContainsMenu('my_clue')) {
                        // 针对线索录入人员做校验判断
                        if (userIdsShow.includes(this.userId)) {
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                name: 'my_clue'
                            }).href;
                            window.open(href, '_blank');
                        } else {
                            this.isHaveManageAuthority(userIdsShow, 'my_clue');
                        }
                    } else {
                        this.$Message.warning('您没有线索页面的查看权限，请联系您的管理员开通');
                    }
                }
            },
            /* 跳转至询盘详情页，并进行跳转前校验 */
            jumpToInquiryManage(inquiryId, userIdsShow, relatedCompanyId) {
                localStorage.setItem('leadsCloud-inquiryId', inquiryId);
                if (userIdsShow.includes('-1')) {
                    /* 公海管理功能权限校验 */
                    if (this.isContainsMenu('highseasCustomer')) {
                        localStorage.setItem('leadsCloud-globalSearchViewType', 'highSeaInquiry');
                        this.$viewHighSeasCustomer(relatedCompanyId);
                    } else {
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                    }
                } else {
                    if (this.isContainsMenu('myInquiry')) {
                        // 针对询盘负责人做校验判断
                        if (userIdsShow.includes(this.userId)) {
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                name: 'myInquiry'
                            }).href;
                            window.open(href, '_blank');
                        } else {
                            this.isHaveManageAuthority(userIdsShow, 'myInquiry');
                        }
                    } else {
                        this.$Message.warning('您没有询盘页面的查看权限，请联系您的管理员开通');
                    }
                }
            },
            /* 跳转至联系人详情页，并进行跳转前校验 */
            jumpToContactManage(contactId, userIdsShow, relatedCompanyId) {
                localStorage.setItem('leadsCloud-contactId', contactId);
                if (userIdsShow.includes('-1')) {
                    /* 公海管理功能权限校验 */
                    if (this.isContainsMenu('highseasCustomer')) {
                        localStorage.setItem('leadsCloud-globalSearchViewType', 'highSeaContact');
                        this.$viewHighSeasCustomer(relatedCompanyId);
                    } else {
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                    }
                } else {
                    if (this.isContainsMenu('myContact')) {
                        // 针对联系人负责人做校验判断
                        if (userIdsShow.includes(this.userId)) {
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                name: 'myContact'
                            }).href;
                            window.open(href, '_blank');
                        } else {
                            this.isHaveManageAuthority(userIdsShow, 'myContact');
                        }
                    } else {
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyContact'));
                    }
                }
            },
            /* 当前用户是否拥有某些人员的管理权限的判断 */
            isHaveManageAuthority(userIds, targetRoute) {
                util.ajaxJson({
                    url: '/new-privilege/manage/getusers',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        // 该用户可管理的人员id集合
                        const arr1 = res.data.data;
                        // 询盘负责人的id集合
                        const arr2 = userIds.split(',').map(Number);
                        // 如果有重复，则可打开
                        const flag = arr2.filter((x) => {
                            return arr1.includes(x);
                        });

                        if (!flag.length) {
                            this.$Message.warning('您当前无权限查看此条数据');
                        } else {
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                name: targetRoute
                            }).href;
                            window.open(href, '_blank');
                        }
                    }
                });
            },
            /* 切换菜单时，清空搜索关键词 */
            clearGlobalSearch(name) {
                this.globalSearchKeyWords = '';
            },
            // crm 接口合并后
            mainHomePage() {
                util.ajaxJson({
                    url: '/crm/mainHomePage',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        // CRM 中是否允许重复录入和显示查重按钮的设置情况
                        data.data.attrList.map(i => {
                            switch (i.attrName) {
                                case 'companyName':
                                    // 保存 公司名去重方式
                                    this.$store.commit('setUniqTypeCompanyName', i.attrValue);
                                    break;
                                case 'phone':
                                case 'whatsapp':
                                case 'instagram':
                                case 'emailSuffix':
                                case 'socialPlatform':
                                    // 保存 是否需要显示去重按钮
                                    const temp = {};
                                    temp[i.attrName] = i.attrValue;
                                    this.$store.commit('setShowUniq', temp);
                                    break;
                                case 'mergeOperate':
                                    // 保存 是否允许重复录入
                                    this.$store.commit('setAllowMerge', i.attrValue);
                            }
                        });

                        // 获取社交平台下拉项以及每一项的查重情况
                        this.$store.commit('setSocialPlatformIds', data.data.socialList.filter((item) => item.isAvailable === 1));

                        // 记录工商联想数据的开启状态
                        this.$store.commit('set_business_state', data.data.businessState);

                        // 记录定位图标的显隐状态
                        this.$store.commit('set_show_location', data.data.showLocation);
                        
                        // 邮箱查重  true 查重，false 不查重
                        this.$store.commit('set_email_duplicate_check', data.data.checkEmailRepeat);

                        // 任务提醒未读数量
                        this.$store.commit('setNoticeUnread', {
                            type: 'taskUnreadCount',
                            count: data.data.unCompletedTotal
                        });
                    }
                });
            },
            /* 格式化日期 */
            dateformat() {
                // eslint-disable-next-line no-extend-native
                Date.prototype.format = function(fmt) {
                    const o = {
                        'M+': this.getMonth() + 1, // 月份
                        'd+': this.getDate(), // 日
                        'h+': this.getHours(), // 小时
                        'm+': this.getMinutes(), // 分
                        's+': this.getSeconds(), // 秒
                        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                        S: this.getMilliseconds() // 毫秒
                    };
                    if (/(y+)/.test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()
                        }`).substr(4 -
                            RegExp.$1.length));
                    }
                    for (const k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                                ? (o[k])
                                : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                        }
                    }
                    return fmt;
                };
            },
            openCalldetailIng(v,d) {
                this.showCallAudioDetail = v;
                this.detailForQuery = d;
             
            },
            // 页面加载完成后插入企点 script
            addQQScript() {
                // 生成 script 标签
                const QQScript = document.createElement('script');
                QQScript.id = 'qd235504272615586555061300a09212d6adec1afab5';
                QQScript.src = 'https://wp.qiye.qq.com/qidian/2355042726/15586555061300a09212d6adec1afab5';

                // 追加 script 标签
                const parentNode = document.getElementById('triggerIconsTop').parentNode;
                parentNode.append(QQScript);

                // script 标签加载完成后显示组件, 去掉 script 标签
                QQScript.onload = () => {
                    this.scriptLoaded = true;
                    parentNode.removeChild(QQScript);
                };
            },
            // 合并后接口  是否绑定 Google 账号  是否绑定 Facebook 账号  获取有关联跟进状态的转化操作列表
            mainHomePageOversea() {
                util.ajaxJson({
                    url: '/crm/mainHomePageOversea',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        // 判断是否绑定 Google 账号
                        this.$store.commit('setIsGoogleInvalid', data.data.bindGoogleCode === '0');

                        
                        // 判断是否绑定 Facebook 账号
                        // 账号
                        const accounts = data.data.accounts || [];
                        // 主页
                        const pages = data.data.pages || [];
                        // 暂存"FB 是否失效"状态
                        let invalid = false;
                        // 遍历主页, 确定 FB 失效则停止遍历
                        pages.some(item => {
                            // "当前主页是否失效"状态
                            const invalidStatus = item.accessStatus !== 1;
                            if (item.homePageType === 1) {
                                // 当前主页是公司主页, 则直接以主页状态为 FB 失效状态
                                invalid = invalidStatus;
                            } else {
                                // 当前是个人主页
                                if (invalidStatus && accounts.find(account => String(account.id) === String(item.accountId))) {
                                    // 如果当前主页已失效, 且当前主页有对应的账号, 则认为 FB 已失效
                                    invalid = true;
                                }
                            }
                            // 返回结果, 如果为 true , 则终止 some 循环
                            return invalid;
                        });
                        // 设置 vuex isFBInvalid 状态
                        this.$store.commit('setIsFBInvalid', invalid);
                        // Google / Facebook 账号绑定失效提示语
                        setTimeout(() => {
                            this.showInvalidMsg = true;
                        }, 0);

                        // 获取有关联跟进状态的转化操作列表
                        this.$store.commit('update_associated_followUpStatus_list', data.data.list || []);
                    } else {}
                });
            },
            // 合并后接口;获取所有 wa 账号, 取未读数;登录的WA账号和WA二维码版本
            getForeignEveMsg() {
                // 清空全部未读数
                this.$store.commit('setWAUnreadCount', null);
                util.ajaxLeadscloudJson({
                    url: '/v2-privilege/polymerization/getForeignEveMsg',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }
                }).then(({ data }) => {
                    if (data.code === 10000) {
                        // 获取 userId 登录的所有 WA 账号信息
                        if (Array.isArray(data.data.getOnlineWhatsapp) && data.data.getOnlineWhatsapp.length) {
                            // 暂存接口返回的, 该 userId 所有登录过的账号
                            const updateObj = {};
                            data.data.getOnlineWhatsapp.forEach(item => {
                                updateObj[item.whatsappAccount] = item.noRead;
                            });

                            // 更新未读数
                            this.$store.commit('setWAUnreadCount', updateObj);
                        }

                        // 获取 WA 二维码版本(企业相关信息)
                        if (data.data.getAccountConfig) {
                            this.$store.commit('setWaQrCodeType', data.data.getAccountConfig.qrConfig || 0);
                        }
                        if (data.data.getTranslationConfig) {
                            // 更新需要id
                            const {receivingTranslation, sendingTranslation, targetLanguage, noTranslationLanguage} = data.data.getTranslationConfig;
                            // this.id = res.data.data.id;
                            this.setautoTranslateStatusRecive(Boolean(receivingTranslation));
                            this.setautoTranslateStatusSend(Boolean(sendingTranslation));
                            this.setautoTranslatetargetLang(targetLanguage);
                            this.setautoTranslateNoTArr(noTranslationLanguage.split(','))
                        }
                        if (data.data.orgList && data.data.orgList.length) {
                            const orgList = data.data.orgList;
                            this.$store.commit('setautoTranslateCharactCount', orgList[0].characterCount || String(0));
                        }
                    } else {}
                });
            },
            // 合并后接口  获取F私信的未读数
            getUnReadCountByIds() {
                util.ajaxInternationalJson({
                    url: '/social/merge/getUnReadCountByIds',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }
                }).then(({ data }) => {
                    if (data.code === 1) {
                        // 计算得到 FB 私信未读数总和
                        let sum = 0;
                        data.data.forEach(item => {
                            sum += Number.isInteger(item.unreadCount) ? item.unreadCount : 0;
                        });
                        // 设置 FB 私信未读数
                        this.$store.commit('setFbChatUnread', sum);
                    } else {}
                });
            },
            // 从路由处拿过来的逻辑
            getWebsiteManagerData() {
                util.ajaxAMP({
                    url: "/trunk/site/count"
                }).then(response => {
                    if (response.data.data === null) {
                        return false;
                    }
                    this.$store.state.showWitchComponent = "myWebsite";
                    if (response.data.data.total > 0) {
                        this.$store.state.TemplateStationNum = response.data.data.total;
                    } 
                    // else {
                    //     // util.ajaxWebSite2({
                    //     //     url: '/wp-json/wp/v2/getweburl/' + store.state.enterpriseId,
                    //     //     method: "get"
                    //     // }).then(response => {
                    //     //         store.state.showWitchComponent = "myWebsite";
                    //     // });
                    // }
                });
            },

            // get ai tool bar config
            getAiToolBarConfig() {
                queryToolbarTriggerConfig({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                }).then((res) => {
                    if (res && res.code === 1) {
                        const { data } = res
                        const { inputBoxSelect, inputBoxSlash, pageSelect } = data
                        this.$store.dispatch('updateToolbarTriggerConfig', {
                            inputBoxSelect,
                            inputBoxSlash,
                            pageSelect,
                        })
                    }
                })
            }
        },
        watch: {
            '$route'(to) {
                // 更新当前路由 name 数组
                this.$store.commit('setActiveRouteNames', this.$route);
                this.$store.commit('setCurrentPageName', to.name);
                /**
                 * @Description: 公司详情页自己会在内部请求管理权限后调用 util.setCurrentPath
                 * @author 汤一飞
                 * @date 2021/1/5
                 */
                if (this.$route.name !== 'companyDetail') {
                    util.setCurrentPath(this, to.name);
                }
                this.checkTag(to.name);
                sessionStorage.currentPageName = to.name;
                // 当打开的路由和小窗口相同时，收起小窗口，取消悬浮窗是否占位
                if (this.floatWindowType === to.name) {
                    this.isDrawerShow = false;
                    this.isFixed = false;
                    if (to.name === 'xhl_chat') {
                        // 显示聊天列表
                        this.$store.commit('updateCurrInterface', 'splitChatList');
                        if (this.$store.state.nim) {
                            // 重置当前聊天的未读消息
                            this.$store.state.nim.setCurrSession('');
                        }
                    }
                    if (to.name === 'inbox') {
                        this.$store.commit('setFacebookSplitShowList', true);
                    }
                }
                this.$nextTick(() => {
                    this.singlePageScroll();
                });
                this.$store.commit('setAssosiatedInquiryId', '');
            },
            isDrawerShow: {
                handler(val) {
                    if (val) {
                        this.$store.commit('setTempFloatWindowType', this.floatWindowType);
                    } else {
                        this.floatWindowType = '';
                    }
                },
                immediate: true
            },
            floatWindowType: {
                handler(val) {
                    this.$store.commit('setFloatWindowType', val);
                    if (val) {
                        this.$store.commit('setTempFloatWindowType', val);
                    }
                },
                immediate: true
            },
            lang: {
                handler() {
                    /**
                     * @Description: 公司详情页自己会在内部请求管理权限后调用 util.setCurrentPath
                     * @author 汤一飞
                     * @date 2021/1/5
                    */
                    if (this.$route.name !== 'companyDetail') {
                        util.setCurrentPath(this, this.$route.name); // 在切换语言时用于刷新面包屑
                    }
                },
                immediate: true
            },
            isFixed: {
                handler() {
                    this.$store.commit('setIsFixed', this.isFixed);
                }
            },
            /* 全局搜索相关变量监听 */
            globalSearchKeyWords: {
                handler(val) {
                    if (val) {
                        /* 快速搜索，只搜索部分字段 */
                        this.globalSearch('quickSearch');
                    } else {
                        // empty
                    }
                }
            },
            websocketMsgMain: {
                handler(msgData) {
                    if (msgData) {
                        if (msgData.type === 'hasSameAccountLogin') {
                            // websocket 通知: 当前账号在其他标签页登录
                            if (!['10171', '1001', '10194', '11741', '11800', '12009', '11688'].includes(`${this.enterpriseId}`)) {
                                this.$Message.warning({
                                    message: this.$t('MultiterminalLoginTip'),
                                    duration: 10000,
                                    closable: true
                                });
                                // 追加错误信息到 localStorage , 跳转到登录页之后打印错误信息, 并清除此 localStorage
                                let quitReason = localStorage.getItem('quitUnexpectedlyReason') || '';
                                quitReason += 'hasSameAccountLogin;';
                                localStorage.setItem('quitUnexpectedlyReason', quitReason);

                                this.logoutServiceOK();
                            }
                        } else if (msgData.type === 'sameAccountRepeatLogin') {
                        }
                    }
                }
            },
            quickSendMailVisible: {
                handler(val) {
                    if (val) {
                        this.quickSendMailModalVisible = true;
                    }
                }
            },
            quickSendMailModalVisible: {
                handler(val) {
                    if (!val) {
                        this.$store.commit('setQuickSendMailVisible', false);
                    }
                }
            },
            // 控制全局 wa 回复框显隐
            globalWaReplyModalProps: {
                handler(val) {
                    if (Object.keys(val).length) {
                        this.visibleReplyModal = true;
                    }
                }
            },
            button_list: {
                handler: function() {
                    this.$store.commit('setListType', 2);
                },
                deep: true
            },
            // 产品要求添加 gtm 变量 user_id
            userId: {
                handler(val) {
                    if (val && Array.isArray(window.dataLayer)) {
                        window.dataLayer.push({
                            'user_id': val
                        });
                    }
                },
                immediate: true
            }
        },
        beforeDestroy() {
            // 清除 mutation observer
            this.observer.disconnect();
            this.observer = null;

            // 取消 storage 事件监听
            this.offStorageChange();

            // 销毁菜单按键行为操作
            document.removeEventListener('keydown', this.keyDown);
            document.removeEventListener('keyup', this.keyUp);
            window.removeEventListener('blur', this.winBlur);

            // 清除定时器
            [this.timer_mail, this.timer_upgradeTip].forEach(item => {
                if (item) {
                    clearInterval(item);
                }
            });

            // 去除监听浏览器 visibilitychange 事件
            // 不同浏览器 hidden 名称
            const hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null;
            // 不同浏览器的 visibilitychange 事件名
            const visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
            // 去除监听
            document.removeEventListener(visibilityChangeEvent, this.onVisibilityChange);

            window.onresize = null;
            // 清空网站留言列表未处理数
            this.$store.commit('website_msg/updateFormList', []);
            this.$store.commit('setFbLeadsUnentry', 0);

            // 清除 eventBus 监听
            this.bus.$off('shrinkMenu');

            // 恢复升级提示语相关数据为初始值
            this.$store.commit('initUpgradeTipData');
            this. $EVENTBUS.$off('openCalldetailIng',this.openCalldetailIng);

        },
        mounted() {
            // 启动 qiankun , 如果 App.vue 中已启动, 此方法不会重复启动
            setTimeout(() => {
                startQiankunServe('Main.vue');
            });

            this.dateformat();
             /** CRM 中是否允许重复录入和显示查重按钮的设置情况
                * 社交平台下拉项以及每一项的查重情况 
                * 记录工商联想数据的开启状态 
                * 记录定位图标的显隐状态 
                * 邮箱查重  true 查重，false 不查重
                * 任务提醒未读数量*/
            // !this.isWAPersonalEdition && this.mainHomePage();
            // 获取邮件下属人员 任务提醒与 系统消息提醒 跳转时用到
            // !this.isWAPersonalEdition && this.$store.dispatch('getMailLeaderAccount');
            // WA账号信息 和 WA 二维码账号版本
            this.getForeignEveMsg();
            !this.isWAPersonalEdition && this.receiveMail();
            !this.isWAPersonalEdition && this.getLastedUnTreatedLeads();
            // 检查 Google / Facebook 账号绑定状态
            // !this.isWAPersonalEdition && this.mainHomePageOversea();

            !this.isWAPersonalEdition && this.getConfigEvery();
            !this.isWAPersonalEdition && this.getChinaEveMsg();
            
            // 监听 storage 变化
            this.onStorageChange();
            // 初始化编辑器 解决子应用扩展插件不生效
            this. $EVENTBUS.$on('openCalldetailIng',this.openCalldetailIng);
            const vm = this;
            tinymce.remove('mainvEditor');
            tinymce.init({
                selector: '#mainvEditor',
                editorName: 'mainvEditor',
                theme: 'silver',
                language_url: `${process.env.BASE_URL}tinymce/langs/zh_CN.js`,
                skin_url: `${process.env.BASE_URL}tinymce/skins/ui/oxide`,
                skin: 'oxide',
                language: vm.$t('mail.editor_lauguage'),
                // 添加扩展插件
                external_plugins: {
                    powerpaste: `${process.env.BASE_URL}tinymce/powerpaste/plugin.min.js`
                },
                setup: function(editor) {
                    editor.on('init', function(e) {
                    });
                }
            });

            

            // 监听 DOM 变化, 变化时使用 twemoji 库转化 emoji 实体字符为 twemoji emoji
            this.observer = new MutationObserver(function(mutations, observe) {
                const domList = document.querySelectorAll('.twemoji-convert');
                for (let i = 0; i < domList.length; i++) {
                    twemoji.parse(domList[i]);
                }
            });
            this.observer.observe(document.body, {
                'childList': true,
                'characterData': true,
                'subtree': true
            });

            this.singlePageNodeWidth = document.querySelector('.single-page').offsetWidth;
            // 更新当前路由 name 数组
            this.$store.commit('setActiveRouteNames', this.$route);
            // 在新标签页打开如果已经连接过聊天，则直接连接
            localStorage.setItem('menuExpand', true);
            window.onresize = () => {
                this.window_height = document.documentElement.clientHeight;
                this.$store.commit('set_window_height', document.documentElement.clientHeight - 10);
                this.$store.commit('set_window_width', document.documentElement.clientWidth);
                if (document.getElementById('clueBody')) {
                    document.getElementById('clueBody').style.height = `${this.window_height - 300}px`;
                }
                this.singlePageScroll();
            };

            window.onresize();
            this.init();
            this.bus.$on('shrinkMenu', (val) => {
                const temp = localStorage.getItem('menuExpand');
                if (!val && temp === 'true') {
                    this.sidebarMenuWidth = '190px';
                    this.shrink = false;
                    this.menuExpand = true;
                    this.$store.state.menuExpand = true;
                } else {
                    this.sidebarMenuWidth = '70px';
                    this.shrink = true;
                    this.menuExpand = false;
                    this.$store.state.menuExpand = false;
                }
                setTimeout(() => {
                    this.singlePageNodeWidth = document.querySelector('.single-page').offsetWidth;
                }, 300);
            });

            this.$refs.main.onclick = (event) => {
                if (this.$router.currentRoute.name !== 'login') {
                    if (!Cookies.get('enterpriseId') || `${Cookies.get('enterpriseId')}` !== `${this.enterpriseId}`) {
                        util.jump_to_login(this.$t('tokenExpired'), () => {
                            // 追加错误信息到 localStorage , 跳转到登录页之后打印错误信息, 并清除此 localStorage
                            let quitReason = localStorage.getItem('quitUnexpectedlyReason') || '';
                            quitReason += `EnterpriseId(cookie): ${Cookies.get('enterpriseId')};EnterpriseId(this): ${this.enterpriseId};`;
                            localStorage.setItem('quitUnexpectedlyReason', quitReason);
                        });
                    } else if (!Cookies.get('userId') || `${Cookies.get('userId')}` !== `${this.userId}`) {
                        util.jump_to_login(this.$t('tokenExpired'), () => {
                            // 追加错误信息到 localStorage , 跳转到登录页之后打印错误信息, 并清除此 localStorage
                            let quitReason = localStorage.getItem('quitUnexpectedlyReason') || '';
                            quitReason += `UserId(cookie): ${Cookies.get('userId')};UserId(this): ${this.userId};`;
                            localStorage.setItem('quitUnexpectedlyReason', quitReason);
                        });
                    }
                }
            };

            /* 全局搜索关键词的localStorage处理 */
            const keyWords = JSON.parse(localStorage.getItem('leadsCloud-globalSearchKeyWords'));
            if (keyWords && keyWords.curr) {
                this.globalSearchKeyWords = keyWords.curr;
                localStorage.removeItem('leadsCloud-globalSearchKeyWords');
                if (this.$refs.globalSearch && this.$refs.globalSearch.$refs.input) {
                    this.$refs.globalSearch.$refs.input.focus();
                    this.$refs.globalSearch.$refs.input.blur();
                }
            }

            // 清空"新收邮件未读数统计数据"
            !this.isWAPersonalEdition && this.$store.commit('updateNewReceiveMails', {
                type: 'restore'
            });

            // 监听浏览器 visibilitychange 事件, 当前标签页可见状态变更时触发相应代码
            // 不同浏览器 hidden 名称
            const hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null;
            // 不同浏览器的 visibilitychange 事件名
            const visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
            // 开始监听
            document.addEventListener(visibilityChangeEvent, this.onVisibilityChange);

            // 菜单按键行为操作
            window.addEventListener('blur', this.winBlur);
            window.addEventListener('mousedown', this.winMousedown);
            document.addEventListener('keydown', this.keyDown);
            document.addEventListener('keyup', this.keyUp);
            setTimeout(() => {
                !this.isWAPersonalEdition && !['customFor_12200'].includes(this.isCustomEdition) && this.addQQScript();
            }, 800)

            // aiToolBar config
            // this.getAiToolBarConfig()
        },
        created() {
            this.saveUserIdInStorage();
            // 动态插入 script
            // 不阻塞的放上面
            insertScript(`${this.publicPath}iconfont.js`, true, false, 'low');
            // 阻塞的放下面
            insertScript(`${this.publicPath}twemoji.min.js`, true, true, 'high');

            Vue.use(VueCropper);
            Vue.use(VueClipboard);
            Vue.use(VueTour);

            Vue.use(base);
            // 取 cookie 判断是否是 wa 个人版
            // if ((Cookies.get('leadsCloudVersion') === 'WAPersonalEdition') || (`${this.enterpriseId}` === '11471')) {
            //     this.$store.commit('setVersion', 'WAPersonalEdition');
            // }
            // 定时获取系统升级提示配置信息
            // this.getUpgradeTip();
            /* 初始化时为空，切换聊天时改变，以便其它tab页能监听到变化 */
            localStorage.setItem('chatStampList', '');
            this.getMenu();
            // if (Cookies.get('initMenu') !== '0') {
            //     this.getMenu();
            // } else {
            //     Cookies.remove('initMenu');
            // }
            this.get_buttons();
            // 连接 websocket
            if (!this.WS) {
                this.$store.dispatch('initSocket');
            }
        }
    };
</script>

<style lang="less" scoped>
.notOnlyGlobalSearch {
  z-index: -1;
}
.new-popover-div {
    padding: 13px 0px 3px;
    overflow: hidden;
    >div {
        float: left;
        text-align: center;
        margin: 0px 0px 10px;
        width: 72px;
        height: 68px;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        p{
            color: #333;
            margin-top: 8px;
        }
        &:hover{
            background: #F5F6F9;
            border-radius: 4px;
        }
    }
}
.transformCls {
    transform: rotate(-45deg);
}
</style>

<style lang="less">
    .el-dialog.multiTypeCarouselModal {
        background: transparent;

        .el-dialog__header, .el-dialog__footer {
            display: none;
        }
    }
    .noticeList {
        display: flex;
        align-items: center;
        line-height: 22px;
        margin-bottom: 16px;
        cursor: pointer;
        span {
            margin-left: 8px;
            color: #303133;
        }
        .noticeListCount {
            font-size: 12px;
            margin-left: 8px;
            // display: inline-block;
            // vertical-align: middle;
            line-height: 16px;
            min-width: 16px;
            text-align: center;
            color: #fff;
            background: #F56C6C;
            border-radius: 50%;
        }
    }
</style>
