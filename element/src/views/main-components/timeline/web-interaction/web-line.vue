<template>
    <div v-loading="isLoading"
         element-loading-spinner="ivu-icon ivu-icon-ios-loading">
        <div v-if="lineList.length == 0">
            <!--时间轴长度为0的时候，如果是聊天则显示轨迹-->
            <div v-if="type === 'chat' && trackList.length"
                 style="margin:5px 10px 0 -10px;background-color: #F9FBFD;padding: 0 20px"
                 class="visitor-detail-item" >
                <!--<div style="text-align: center">-->
                <!--<span class="visitor-date">2018-1-24</span>-->
                <!--<div class="bg-line"></div>-->
                <!--</div>-->

                <div v-for="(track,index) in trackList"
                     style="border-bottom: 1px dashed #dbdbdb;padding: 16px 0 10px;font-size: 12px" :key="index">
                    <!--<div v-if="track.flag" style="height: 30px;position: relative;margin-top: 10px;padding: 14px 0;">-->
                    <!--<div class="time-tips">{{ track.time | timeFormat() }}</div>-->
                    <!--<div style="border-top: 1px solid #d2d2d2;"></div>-->
                    <!--</div>-->
                    <div class="track-top">
                        <span :title='track.title'
                              class="track-title" >{{ track.title | lengthFilter(20) }}</span>
                        <span class="track-time">{{ track.time | timeFormat("DateTime") }}</span>
                    </div>
                    <!--<span v-if="track.urlFrom && track.urlTo">{{ $t('chat.from') }}</span>
                    <a class="track-url" v-if="track.urlFrom" :href='track.urlFrom' target="view_window">{{ track.urlFrom }}</a>
                    <span v-if="track.urlFrom && track.urlTo">{{ $t('chat.to') }}</span>
                    <a class="track-url" v-if="track.urlTo" :href='track.urlTo' target="view_window">{{ track.urlTo }}</a>-->

                    <div class="item-body">
                        <div v-if="track.urlFrom">
                            <span v-if="track.urlTo">{{ $t('visitor_history.from') }}&nbsp;</span>
                            <span v-else>{{ $t('visitor_history.to') }}&nbsp;</span>
                            <a :href="track.urlFrom"
                               target="_blank"
                               style="padding-left:10px"
                               class="item-event">{{ track.urlFrom }}</a>
                        </div>
                        <div v-if="track.urlTo">
                            {{ $t('visitor_history.to') }}
                            <a :href="track.urlTo"
                               target="_blank"
                               style="padding-left:10px"
                               class="item-event">{{ track.urlTo }}</a>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else
                 style="margin-top: 60px;text-align: center;color: #999; ">{{ $t('timeLine.noData') }}</div>
        </div>
        <Timeline v-infinite-scroll="loadMore"
                  :infinite-scroll-distance="5"
                  class="big-icon-timeline">
            <!-- <TimelineItem v-if="lineList.length>0">
                <div slot="dot"
                     class="timeline-dot">
                    <Icon type="record"
                          size="12"
                          color="#F5F5F5"
                          style="vertical-align: top;top: 1px;"></Icon>
                </div>
                <div>
                    <br>
                </div>
            </TimelineItem> -->
            <TimelineItem v-for="(item,index) in showLineList"
                          :key="item.eventId">
                <template v-if="item.outLinkFlag != 0">
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/webVisit.svg"></img>
                    </div>
                    <div class="timeline-item">
                        <div class="item-header clearfloat">
                            <div class="item-title">{{ $t('timeLine.siteVisit') }}</div>
                            <!-- <div class="block-line"></div>-->
                            <!-- 聊天logo -->
                            <template v-if="item.visitorChatMessage && item.visitorChatMessage.length > 0">
                                <Icon custom="custom-chat"
                                      size='14'
                                      style="color:#ccc;line-height: 20px"></Icon>
                            </template>
                            <!-- 留言logo -->
                            <template v-if="item.formList && item.formList.length > 0">
                                <Icon custom="custom-leave-message"
                                      size='14'
                                      style="color:#ccc;line-height: 20px; padding-left:10px"></Icon>
                            </template>
                            <div v-if="currSessionName && type !== 'chat'"
                                 class="header-source">{{ $t('timeLine.fromVisitors') }}{{currSessionName }}</div>
                            <div class="item-time">
                                <span style="margin-right: 10px">{{ item.eventTime | timeFormat("DateTime") }}</span>
                                <span v-if="flag === index && showItem"
                                      @click="showItem=false"
                                      style="cursor: pointer">
                                    <Icon custom="custom-collapse"
                                          size="12"></Icon>
                                </span>
                                <span v-else
                                      @click="getVisitorAllInfoByEvent(item,index)"
                                      style="cursor: pointer">
                                    <Icon custom="custom-show-more"></Icon>
                                </span>
                            </div>
                        </div>
                        <div class="item-body">
                            <div>
                                <!--<span>【{{ item.contactsName | filterName }}】</span>-->
                                <!-- <Poptip width="600" placement="bottom-start" :transfer="true">-->
                                <div v-if="item.eventContent"
                                     style="padding-bottom:20px;">
                                    {{ $t('timeLine.accessToThe') }}
                                    <a :href="item.eventContent"
                                       target="_blank"
                                       class="item-event">【{{ item.eventContent }}】</a>
                                </div>
                                <div v-else-if="item.visitorTrace != undefined && item.visitorTrace[0].currentActionType !== 2"
                                     style="padding-bottom:20px;">
                                    <span v-if="item.visitorInfo.visitorName">【{{ item.visitorInfo.visitorName }}】</span>
                                    <span>-> {{ item.visitorTrace[0].preActionName }} - {{ item.visitorTrace[0].middleActionName }} - {{ item.visitorTrace[0].title }}</span>
                                    <a :href="item.visitorTrace[0].toAddress"
                                       target="_blank"
                                       class="item-event">【{{ item.visitorTrace[0].toAddress }}】</a>
                                </div>
                                <div v-show="flag === index && showItem"
                                     style="max-height: 600px;overflow-y: auto"
                                     class="api" >
                                    <!-- <div v-if="JSON.stringify(item.visitorInfo) !== '{}' "> -->
                                    <div v-if="item.visitorInfo != undefined">
                                        <!-- <div>blabla:{{ item.visitorInfo }}</div> -->
                                        <Row>
                                            <Col :span="24">
                                                <span class="web-tip">{{ $t('visitor_history.visitorID') }}:</span>
                                                {{ item.visitorInfo.visitorId }}
                                            </Col>
                                            <Col :span="24">
                                                <span class="web-tip">{{ $t('visitor_history.create_time') }}:</span>
                                                {{ item.visitorInfo.createTime|timeFormat("DateTime") }}
                                            </Col>
                                            <Col :span="24">
                                                <span class="web-tip">{{ $t('visitor_history.source') }}: </span>
                                                <span v-if="item.visitorInfo.visitSource"
                                                      :title="item.visitorInfo.visitSource.length >= 30 ? item.visitorInfo.visitSource : ''">
                                                    {{ item.visitorInfo.visitSource.length >= 30 ? item.visitorInfo.visitSource.slice(0, 31) + '...' : item.visitorInfo.visitSource }}</span>
                                                <span v-else>{{ item.visitorInfo.visitSource }}</span>
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.is_chatted') }}:</span>
                                                {{ item.visitorInfo.haveChat | filterTip }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.ip_location') }}:</span>
                                                {{ item.visitorInfo.ipLocation }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.customer_service') }}:</span>
                                                {{ item.visitorInfo.receptionServer }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.ip_addr') }}:</span>
                                                {{ item.visitorInfo.ipAddress }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.visitor_chat_count') }}:</span>
                                                {{ item.visitorInfo.visitorChatCount }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.service_chat_count') }}:</span>
                                                {{ item.visitorInfo.serverChatCount }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.browser_version') }}:</span>
                                                {{ item.visitorInfo.browserVersion }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.screen_resolution') }}:</span>
                                                {{ item.visitorInfo.screenResolution }}
                                            </Col>
                                            <Col :span="24">
                                                <span class="web-tip">{{ $t('visitor_history.first_visit_address') }}:</span>
                                                <span v-if="item.visitorInfo.firstVisitorAddress"
                                                      :title="item.visitorInfo.firstVisitorAddress.length >= 30 ? item.visitorInfo.firstVisitorAddress : ''">
                                                    {{ item.visitorInfo.firstVisitorAddress.length >= 30 ? item.visitorInfo.firstVisitorAddress.slice(0, 31) + '...' : item.visitorInfo.firstVisitorAddress }}</span>
                                                <span v-else>{{ item.visitorInfo.firstVisitorAddress }}</span>
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.browser') }}:</span>
                                                {{ item.visitorInfo.browser }}
                                            </Col>
                                            <!-- 广告类型，广告系列名称、广告组名称、广告名称、广告关键词 -->
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.traffic_source') }}:</span>
                                                {{ item.visitorInfo.trafficSource ? trafficSourceList[item.visitorInfo.trafficSource - 1]['label'] : '' }}
                                            </Col>
                                            <template v-if="item.visitorInfo.trafficSource === '1' && item.visitorInfo.showBtn">
                                                 <Col :span="24"><span style="color:#3b78de;font-size:14px;margin-top: .5em;font-weight:500;cursor: pointer;" @click.stop="getGoogleInfoDetails(item.visitorInfo, item)">{{$t('timeLine.googleAdBtn')}}</span></Col>
                                            </template>
                                            <template v-if="item.visitorInfo.trafficSource === '1' && !item.visitorInfo.showBtn">
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleAd')}}</span>
                                                    {{item.visitorInfo['ad_name']}}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleGroup')}}</span>
                                                    {{item.visitorInfo['group_name']}}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleKeyWord')}}</span>
                                                    {{item.visitorInfo['utm_keyword']}}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleMatchType')}}</span>
                                                    {{item.visitorInfo['utm_matchtype']}}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleDevice')}}</span>
                                                    {{item.visitorInfo['utm_device']}}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleCampaign')}}</span>
                                                    {{item.visitorInfo['campaign_name']}}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleNetwork')}}</span>
                                                    {{item.visitorInfo['utm_network']}}
                                                </Col>
                                            </template>
                                            <template v-if="item.visitorInfo.trafficSource === '2' || item.visitorInfo.trafficSource === '3'">
                                                <Col :span="12">
                                                    <span class="web-tip">{{ $t('visitor_history.ad_type') }}:</span>
                                                    {{ item.visitorInfo.adType }}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{ $t('visitor_history.ad_campaign_name') }}:</span>
                                                    {{ item.visitorInfo.adCampaignName }}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{ $t('visitor_history.ad_group_name') }}:</span>
                                                    {{ item.visitorInfo.adGroupName }}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{ $t('visitor_history.ad_name') }}:</span>
                                                    {{ item.visitorInfo.adName }}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{ $t('visitor_history.ad_keyword') }}:</span>
                                                    {{ item.visitorInfo.adKeyword }}
                                                </Col>
                                            </template>
                                        </Row>
                                    </div>
                                    <div>
                                        <div v-for="(item, index) in item.mergeList"
                                             style="margin: 5px 0 0" :key="index">
                                            <div v-if="item.type === 'trace'"
                                                 class="info-item">
                                                <div class="item-header clearfloat">
                                                    <template v-if="item.currentActionType === 3">
                                                        <span class="trace-web-title">{{ $t('visitor_history.fileDownload') }}:</span>
                                                        <a :href="item.currentActionName"
                                                           target="_blank"
                                                           style="padding-left:10px"
                                                           class="item-event">{{ item.currentActionName }}</a>
                                                    </template>
                                                    <span v-else-if="item.currentActionType === 10"
                                                          class="trace-web-title">-> {{ item.preActionName }} - {{ item.middleActionName }} - {{ item.title }}</span>
                                                    <span v-else-if="item.currentPageType === 8"
                                                          class="trace-web-title">{{ $t('visitor_history.SearchkeywordsWithinSite') }}: {{ item.title }}</span>
                                                    <span v-else-if="item.currentActionType === 2"
                                                          class="trace-web-title"></span>
                                                    <span v-else
                                                          class="trace-web-title">{{ item.title }}</span>
                                                    <div class="info-time">{{ item.createTime | timeFormat("DateTime") }}</div>
                                                </div>

                                                <div v-if="item.currentActionType == 1 || item.currentActionType == undefined"
                                                     class="item-body">
                                                    <div v-if="item.fromAddress">
                                                        {{ $t('visitor_history.from') }}&nbsp;
                                                        <a :href="item.fromAddress"
                                                           target="_blank"
                                                           style="padding-left:10px"
                                                           class="item-event">{{ item.fromAddress }}</a>
                                                    </div>
                                                    <div v-if="item.toAddress">
                                                        {{ $t('visitor_history.to') }}&nbsp;
                                                        <a :href="item.toAddress"
                                                           target="_blank"
                                                           style="padding-left:10px"
                                                           class="item-event">{{ item.toAddress }}</a>
                                                    </div>
                                                </div>
                                                <div v-else-if="item.currentActionType === 2"
                                                     class="item-body" ></div>
                                                <div v-else
                                                     class="item-body" >
                                                    <div v-if="item.fromAddress || item.toAddress">
                                                        {{ $t('visitor_history.on') }}&nbsp;
                                                        <a :href="item.fromAddress || item.toAddress"
                                                           target="_blank"
                                                           style="padding-left:10px"
                                                           class="item-event">{{ item.fromAddress || item.toAddress }}</a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-else-if="item.type === 'chat'"
                                                 class="info-item">
                                                <div class="item-header clearfloat">
                                                    <div class="info-title">{{ item.fromNick }}</div>
                                                    <div class="info-time">{{ item.createTime | timeFormat("DateTime") }}</div>
                                                </div>
                                                <div v-if="item.msgType === 'text'"
                                                     class="item-body">{{ item.body }}</div>
                                                <div v-else-if="item.msgType === 'image'"
                                                     class="item-body">
                                                    <img :src="$stm.dealImgName(item.attach, item.body)">
                                                </div>
                                                <div v-else-if="item.msgType === 'file'">
                                                    <a :href="`${item.attach}&download=${item.body}`"
                                                       target="_blank">
                                                        <i class="u-icon icon-file"></i>{{ item.body }}
                                                    </a>
                                                </div>
                                            </div>
                                            <div v-else-if="item.type === 'msg'"
                                                 class="info-item">
                                                <div class="item-header clearfloat">
                                                    <div class="info-title">{{ item.title }}</div>
                                                    <div class="info-time">{{ item.time | timeFormat("DateTime") }}</div>
                                                </div>
                                                <div class="item-body">
                                                    <div v-for="(item1, index1) in item.fields" :key="index1">
                                                        <span class="form-item">{{ item1.label }}</span>
                                                        <span>{{ item1.value }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!--</Poptip>-->
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else-if="item.outLinkFlag == 0 && item.visitorTrace.length > 1">
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/webVisit.svg"></img>
                    </div>
                    <div class="timeline-item">
                        <div class="item-header clearfloat">
                            <div class="item-title">{{ $t('timeLine.siteVisit') }}</div>
                            <!-- <div class="block-line"></div>-->
                            <!-- 是否聊天logo -->
                            <template v-if="item.visitorChatMessage && item.visitorChatMessage.length > 0">
                                <Icon custom="custom-chat"
                                      size='14'
                                      style="color:#ccc;line-height: 20px"></Icon>
                            </template>
                            <!-- 是否留言logo -->
                            <template v-if="item.formList && item.formList.length > 0">
                                <Icon custom="custom-leave-message"
                                      size='14'
                                      style="color:#ccc;line-height: 20px; padding-left:10px"></Icon>
                            </template>
                            <div v-if="currSessionName && type !== 'chat'"
                                 class="header-source">{{$t('timeLine.fromVisitors') }}{{currSessionName }}</div>
                            <div class="item-time">
                                <span style="margin-right: 10px">{{ item.eventTime | timeFormat("DateTime") }}</span>
                                <span v-if="flag === index && showItem"
                                      @click="showItem = false"
                                      style="cursor: pointer">
                                    <Icon custom="custom-collapse"
                                          size="12"></Icon>
                                </span>
                                <span v-else
                                      @click="getVisitorAllInfoByEvent(item,index)"
                                      style="cursor: pointer">
                                    <Icon custom="custom-show-more"></Icon>
                                </span>
                            </div>
                        </div>
                        <div class="item-body">
                            <div>
                                <!--<span>【{{ item.contactsName | filterName }}】</span>-->
                                <!-- <Poptip width="600" placement="bottom-start" :transfer="true">-->
                                <div v-if="item.eventContent"
                                     style="padding-bottom:20px;">
                                    {{ $t('timeLine.accessToThe') }}
                                    <a :href="item.eventContent"
                                       target="_blank"
                                       class="item-event">【{{ item.eventContent }}】</a>
                                </div>
                                <div v-else-if="item.visitorTrace != undefined && item.visitorTrace[1].currentActionType !== 2"
                                     style="padding-bottom:20px;">
                                    <span v-if="item.visitorInfo.visitorName">【{{ item.visitorInfo.visitorName }}】</span>
                                    <span>-> {{ item.visitorTrace[1].preActionName }} - {{ item.visitorTrace[1].middleActionName }} - {{ item.visitorTrace[1].title }}</span>
                                    <a :href="item.visitorTrace[1].toAddress"
                                       target="_blank"
                                       class="item-event">【{{ item.visitorTrace[1].toAddress }}】</a>
                                </div>
                                <div v-show="flag === index && showItem"
                                     style="max-height: 600px;overflow-y: auto"
                                     class="api">
                                    <!-- <div v-if="JSON.stringify(item.visitorInfo) !== '{}' "> -->
                                    <div v-if="item.visitorInfo != undefined">
                                        <!-- <div>blabla:{{ item.visitorInfo }}</div> -->
                                        <Row>
                                            <Col :span="24">
                                                <span class="web-tip">{{ $t('visitor_history.create_time') }}:</span>
                                                {{ item.visitorInfo.createTime|timeFormat("DateTime") }}
                                            </Col>
                                            <Col :span="24">
                                                <span class="web-tip">{{ $t('visitor_history.source') }}:</span>
                                                <span v-if="item.visitorInfo.visitSource"
                                                      :title="item.visitorInfo.visitSource.length >= 30 ? item.visitorInfo.visitSource : ''">
                                                    {{ item.visitorInfo.visitSource.length >= 30 ? item.visitorInfo.visitSource.slice(0, 31) + '...' : item.visitorInfo.visitSource }}</span>
                                                <span v-else>{{ item.visitorInfo.visitSource }}</span>
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.is_chatted') }}:</span>
                                                {{ item.visitorInfo.haveChat | filterTip }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.ip_location') }}:</span>
                                                {{ item.visitorInfo.ipLocation }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.customer_service') }}:</span>
                                                {{ item.visitorInfo.receptionServer }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.ip_addr') }}:</span>
                                                {{ item.visitorInfo.ipAddress }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.visitor_chat_count') }}:</span>
                                                {{ item.visitorInfo.visitorChatCount }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.service_chat_count') }}:</span>
                                                {{ item.visitorInfo.serverChatCount }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.browser_version') }}:</span>
                                                {{ item.visitorInfo.browserVersion }}
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.screen_resolution') }}:</span>
                                                {{ item.visitorInfo.screenResolution }}
                                            </Col>
                                            <Col :span="24">
                                                <span class="web-tip">{{ $t('visitor_history.first_visit_address') }}:</span>
                                                <span v-if="item.visitorInfo.firstVisitorAddress"
                                                      :title="item.visitorInfo.firstVisitorAddress.length >= 30 ? item.visitorInfo.firstVisitorAddress : ''">
                                                    {{ item.visitorInfo.firstVisitorAddress.length >= 30 ? item.visitorInfo.firstVisitorAddress.slice(0, 31) + '...' : item.visitorInfo.firstVisitorAddress }}</span>
                                                <span v-else>{{ item.visitorInfo.firstVisitorAddress }}</span>
                                            </Col>
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.browser') }}:</span>
                                                {{ item.visitorInfo.browser }}
                                            </Col>
                                            <!-- 广告类型，广告系列名称、广告组名称、广告名称、广告关键词 -->
                                            <Col :span="12">
                                                <span class="web-tip">{{ $t('visitor_history.traffic_source') }}:</span>
                                                {{item.visitorInfo.trafficSource ? trafficSourceList[item.visitorInfo.trafficSource - 1]['label'] : '' }}
                                            </Col>
                                            <template v-if="item.visitorInfo.trafficSource === '1' && item.visitorInfo.showBtn">
                                                 <Col :span="24"><span style="color:#3b78de;font-size:14px;margin-top: .5em;font-weight:500;cursor: pointer;" @click.stop="getGoogleInfoDetails(item.visitorInfo, item)">{{$t('timeLine.googleAdBtn')}}</span></Col>
                                            </template>
                                            <template v-if="item.visitorInfo.trafficSource === '1' && !item.visitorInfo.showBtn">
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleAd')}}</span>
                                                    {{item.visitorInfo['ad_name']}}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleGroup')}}</span>
                                                    {{item.visitorInfo['group_name']}}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleKeyWord')}}</span>
                                                    {{item.visitorInfo['utm_keyword']}}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleMatchType')}}</span>
                                                    {{item.visitorInfo['utm_matchtype']}}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleDevice')}}</span>
                                                    {{item.visitorInfo['utm_device']}}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleCampaign')}}</span>
                                                    {{item.visitorInfo['campaign_name']}}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{$t('timeLine.googleNetwork')}}</span>
                                                    {{item.visitorInfo['utm_network']}}
                                                </Col>
                                            </template>
                                            <template v-if="item.visitorInfo.trafficSource === '2' || item.visitorInfo.trafficSource === '3'">
                                                <Col :span="12">
                                                    <span class="web-tip">{{ $t('visitor_history.ad_type') }}:</span>
                                                    {{ item.visitorInfo.adType }}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{ $t('visitor_history.ad_campaign_name') }}:</span>
                                                    {{ item.visitorInfo.adCampaignName }}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{ $t('visitor_history.ad_group_name') }}:</span>
                                                    {{ item.visitorInfo.adGroupName }}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{ $t('visitor_history.ad_name') }}:</span>
                                                    {{ item.visitorInfo.adName }}
                                                </Col>
                                                <Col :span="12">
                                                    <span class="web-tip">{{ $t('visitor_history.ad_keyword') }}:</span>
                                                    {{ item.visitorInfo.adKeyword }}
                                                </Col>
                                            </template>
                                        </Row>
                                    </div>
                                    <div>
                                        <div v-for="(item, idx) in item.mergeList"
                                             style="margin: 5px 0 0" :key="idx">
                                            <div v-if="item.type === 'trace'"
                                                 class="info-item">
                                                <div class="item-header clearfloat">
                                                    <template v-if="item.currentActionType === 3">
                                                        <span class="trace-web-title">{{ $t('visitor_history.fileDownload') }}:</span>
                                                        <a :href="item.currentActionName"
                                                           target="_blank"
                                                           style="padding-left:10px"
                                                           class="item-event">{{ item.currentActionName }}</a>
                                                    </template>
                                                    <span v-else-if="item.currentActionType === 10"
                                                          class="trace-web-title">-> {{ item.preActionName }} - {{ item.middleActionName }} - {{ item.title }}</span>
                                                    <span v-else-if="item.currentPageType === 8"
                                                          class="trace-web-title">{{ $t('visitor_history.SearchkeywordsWithinSite') }}: {{ item.title }}</span>
                                                    <span v-else-if="item.currentActionType === 2"
                                                          class="trace-web-title"></span>
                                                    <span v-else
                                                          class="trace-web-title">{{ item.title }}</span>
                                                    <div class="info-time">{{ item.createTime | timeFormat("DateTime") }}</div>
                                                </div>
                                                <div v-if="item.currentActionType == 1 || item.currentActionType == undefined"
                                                     class="item-body">
                                                    <div v-if="item.fromAddress">
                                                        {{ $t('visitor_history.from') }}&nbsp;
                                                        <a :href="item.fromAddress"
                                                           target="_blank"
                                                           style="padding-left:10px"
                                                           class="item-event">{{ item.fromAddress }}</a>
                                                    </div>
                                                    <div v-if="item.toAddress">
                                                        {{ $t('visitor_history.to') }}&nbsp;
                                                        <a :href="item.toAddress"
                                                           target="_blank"
                                                           class="item-event"
                                                           style="padding-left:10px">{{ item.toAddress }}</a>
                                                    </div>
                                                </div>
                                                <div v-else-if="item.currentActionType === 2"
                                                     class="item-body"></div>
                                                <div v-else
                                                     class="item-body">
                                                    <div v-if="item.fromAddress || item.toAddress">
                                                        {{ $t('visitor_history.on') }}&nbsp;
                                                        <a :href="item.fromAddress || item.toAddress"
                                                           target="_blank"
                                                           style="padding-left:10px"
                                                           class="item-event">{{ item.fromAddress || item.toAddress }}</a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-else-if="item.type === 'chat'"
                                                 class="info-item">
                                                <div class="item-header clearfloat">
                                                    <div class="info-title">{{ item.fromNick }}</div>
                                                    <div class="info-time">{{ item.createTime | timeFormat("DateTime") }}</div>
                                                </div>
                                                <div v-if="item.msgType === 'text'"
                                                     class="item-body">{{ item.body }}</div>
                                                <div v-else-if="item.msgType === 'image'"
                                                     class="item-body">
                                                    <img :src="$stm.dealImgName(item.attach, item.body)">
                                                </div>
                                                <div v-else-if="item.msgType === 'file'">
                                                    <a :href="item.attach+'&download='+item.body"
                                                       target="_blank">
                                                        <i class="u-icon icon-file"></i>{{ item.body }}
                                                    </a>
                                                </div>
                                            </div>
                                            <div v-else-if="item.type === 'msg'"
                                                 class="info-item">
                                                <div class="item-header clearfloat">
                                                    <div class="info-title">{{ item.title }}</div>
                                                    <div class="info-time">{{ item.time | timeFormat("DateTime") }}</div>
                                                </div>
                                                <div class="item-body">
                                                    <div v-for="(item1, idx1) in item.fields" :key="idx1">
                                                        <span class="form-item">{{ item1.label }}</span>
                                                        <span>{{ item1.value }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!--</Poptip>-->
                            </div>
                        </div>
                    </div>
                </template>
            </TimelineItem>
        </Timeline>
        <!-- 加载完成提示语 -->
        <p v-if="(lineList.length > 0) && (showItemCount >= lineList.length)"
           style="text-align: center;margin-bottom: 10px;">{{ $t('visitor_history.load_finished') }}</p>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import Utils from '@/utils/index';
    import i18n from '@/locale';
    import { mapState } from 'vuex';
    import {
        getTimeLinePiwik,
        getLeaveMessagePiwik
    } from '@/views/visitor-history/api/visitor_piwik';
    import { getTimeLineOld } from '@/views/visitor-history/api/visitor_old';
    import { getGoogleAdBtn, getGoogleAdInfo } from '@/api/reusableApi/common';

    export default {
        props: ['date', 'currentTab', 'visitorId', 'fieldObj', 'type'],
        filters: {
            filterName(value) {
                return value || i18n.t('timeLine.unknown');
            },
            filterTip(tip) {
                return tip === '1' ? i18n.t('yes') : i18n.t('no');
            }
        },
        data() {
            return {
                isLoading: false,
                showDetail: false,
                lineList: [], // 时间轴列表
                visitorInfo: {}, // 访客信息
                mergeInfoList: [], // 按时间合并后的列表
                //                fieldObj:{},//自定义自段对应的信息
                chatList: [],
                traceList: [],
                webMsgList: [], // 网站留言
                list: [],
                flag: -1,
                showItem: false,

                onLineTime: '2019-06-01 00:00:00', // 上线时间--早
                timeLine: '',
                trafficSourceList: [
                    {
                        value: 1,
                        label: this.$t('visitor_history.ad_google')
                    },
                    {
                        value: 2,
                        label: this.$t('visitor_history.ad_facebook')
                    },
                    {
                        value: 3,
                        label: this.$t('visitor_history.ad_other')
                    },
                    {
                        value: 4,
                        label: this.$t('visitor_history.email_marketing')
                    },
                    {
                        value: 5,
                        label: this.$t('visitor_history.search_engine')
                    },
                    {
                        value: 6,
                        label: this.$t('visitor_history.social_network')
                    },
                    {
                        value: 7,
                        label: this.$t('visitor_history.other_referrals')
                    },
                    {
                        value: 8,
                        label: this.$t('visitor_history.direct_access')
                    }
                ],

                /**
                 * @Description: 分段加载, 避免发送过多请求(详情)导致页面卡死
                 * @author 汤一飞
                 * @date 2020/5/27
                */
                showItemCount: 0, // 当前显示的条目数
                showItemSize: 10, // 每次加载xx条

                historyTrackList: [] // currVisitorId 最近一次对话后端保存的历史轨迹
            };
        },
        created() {
            this.timeLine = new Date(this.onLineTime).getTime();
            // this.getList();
        },
        watch: {
            currentTab: {
                handler(value) {
                    if (value == 'web-line') {
                        this.getList();
                    }
                },
                immediate: true
            },
            date() {
                this.getList();
            },
            visitorId: {
                handler(value) {
                    if (value) {
                        this.getList();
                    }
                }
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                currSessionName: 'currSessionName',
                currVisitorId: 'currVisitorId'
            }),
            trackList() {
                if (this.$store.state.currPersonTrackList) {
                    const content = this.$store.state.currPersonTrackList.content;
                    if (content) {
                        const list = [];
                        const contentJson = JSON.parse(content);
                        const trackList = contentJson.xUserInfo.track;
                        if (trackList) {
                            for (let i = 0; i < trackList.length; i++) {
                                const obj = {
                                    title: trackList[i].title,
                                    urlFrom: trackList[i].url,
                                    urlTo: '',
                                    time: trackList[i].time,
                                    flag: this.$options.filters.timeFormat(trackList[i].time)
                                };
                                list.push(obj);
                            }
                        }
                        // 拼接历史访问轨迹
                        if (Array.isArray(this.historyTrackList) && this.historyTrackList.length) {
                            // 格式化历史访问轨迹
                            const historyList = this.historyTrackList.map(item => {
                                return {
                                    title: item.title,
                                    urlFrom: item.currentActionName,
                                    urlTo: '',
                                    time: item.enterTime,
                                    flag: this.$options.filters.timeFormat(item.enterTime)
                                };
                            });

                            let startTime = historyList[0].time;
                            startTime = (new Date(startTime)).getTime();

                            // 过滤掉早于历史轨迹最早一条消息的云信轨迹(认为该轨迹不是"最近一次会话"的轨迹)
                            list = list.filter(item => startTime - (new Date(item.time)).getTime() > 0);
                            // 过滤掉云信轨迹中与历史轨迹重复项, 同一秒内
                            list = list.filter(item => {
                                this.historyTrackList.some(track => Math.abs((new Date(track.time)).getTime() - (new Date(item.time)).getTime()) < 1000);
                            });
                            // 拼接并排序
                            list = list.concat(historyList).sort((a, b) => new Date(a.time).getTime() - (new Date(b.time)).getTime());
                        }
                        console.log(list);
                        return list;
                    } else {
                        return [];
                    }
                } else {
                    const trackListTemp = this.$store.state.currPersonTrackListTemp;
                    const listTemp = [];
                    for (let i = 0; i < trackListTemp.length; i++) {
                        const time = new Date(trackListTemp[i].enterTime);
                        const obj = {
                            title: trackListTemp[i].title,
                            urlFrom: trackListTemp[i].fromAddress,
                            urlTo: trackListTemp[i].toAddress,
                            time: time,
                            flag: this.$options.filters.timeFormat(time)
                        };
                        listTemp.push(obj);
                    }
                    return listTemp;
                }
            },
            // mergeInfoList() {
            //     let temp = [];
            //     if (this.chatList.length || this.traceList.length || this.webMsgList.length) {
            //         this.chatList.forEach(item => {
            //             temp.push({
            //                 type: 'chat',
            //                 time: item.msgTimestamp,
            //                 body: item.body,
            //                 attach: item.attach,
            //                 flow: item.flow,
            //                 fromAccount: item.fromAccount,
            //                 fromNick: item.fromNick,
            //                 idClient: item.idClient,
            //                 msgType: item.msgType,
            //                 toAccount: item.toAccount,
            //             });
            //         });
            //         this.traceList.forEach(item => {
            //             temp.push({
            //                 type: 'trace',
            //                 time: item.enterTime,
            //                 title: item.title,
            //                 fromAddress: item.fromAddress,
            //                 toAddress: item.toAddress,
            //                 visitorId: item.visitorId
            //             });
            //         });
            //         this.webMsgList.forEach(item => {
            //             let fields = [];
            //             Object.keys(item).forEach(key => {
            //                 console.log('key1= '+key)
            //                 console.log(this.fieldObj)
            //                 if (key.startsWith('a1') && this.fieldObj[key]) {
            //                     console.log('key2= '+key+'   '+this.fieldObj[key]);
            //                     fields.push({
            //                         name: this.fieldObj[key].name || key,
            //                         value: item[key]
            //                     });
            //                 }
            //             });
            //             temp.push({
            //                 type: 'msg',
            //                 title: '',
            //                 time: item.createTime,
            //                 fields: fields
            //             });
            //         });
            //     }
            //     return temp.sort((a, b) => a.time - b.time);
            // }
            /**
             * @Description: 分段显示 linelist
             * @author 汤一飞
             * @date 2020/5/27
            */
            showLineList() {
                return this.lineList.slice(0, this.showItemCount);
            }
        },
        methods: {
            closeItem(index) {
                console.log(index);
                this.list[index] = false;
                this.list = this.list.concat();
            },
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            // ======================================================================== 修改
            // 获取列表数据
            async getList() {
                console.log(`this.visitorId= ${this.visitorId}`);
                this.lineList = [];
                this.flag = -1;
                this.showItem = false;
                // 把分段显示条数置为初始值
                this.showItemCount = this.showItemSize;
                if (this.visitorId) {
                    this.isLoading = true;
                    let reO = [];
                    let reP = [];
                    // 旧接口，筛选掉上线之后的数据
                    const resDataO = await getTimeLineOld(this.visitorId);
                    if (resDataO.code === '1' && resDataO.data.length > 0) {
                        reO = resDataO.data.filter(item => item.eventTime < this.timeLine);
                    } else {
                        reO = [];
                    }
                    // piwik接口，筛选掉上线之前的数据
                    const resDataP = await getTimeLinePiwik(this.visitorId, this.enterpriseId);
                    if (resDataP.code === '1' && resDataP.data.length > 0) {
                        reP = resDataP.data.filter(item => new Date(item.eventTime).getTime() > this.timeLine);
                    } else if (resDataP.data.length === 0) {
                        reP = [];
                    }

                    console.log('获取时间轴1111', resDataP.data, resDataO.data, reP, reO);
                    const temp = reP.concat(reO);
                    if (temp.length == 0) {
                        this.$emit('getVisitTimes', this.lineList.length);

                        /**
                         * @Description: 因为看到 linelist.length 为 0 且 type === 'chat' 时, 页面显示的是 trackList , 为和聊天界面右侧"实时轨迹"保持一致, 此处也和实时轨迹一样请求历史轨迹并拼接到 trackList
                         * @author 汤一飞
                         * @date 2020/5/29
                         */
                        this.mergeTrackList();

                        this.isLoading = false;
                    } else {
                        temp.forEach(item => {
                            item.eventId = item.eventId.toString().startsWith('piwik') ? item.eventId.substring(6) : item.eventId;
                            /**
                             * @Description: 改为分段加载后, 因为没有请求所有详情, mergeList 不存在, 页面报错, 所以现在直接赋值 mergeList 为空
                             * @author 汤一飞
                             * @date 2020/5/27
                            */
                            item.mergeList = [];
                        });
                        this.lineList = temp;
                        for (let i = 0; i < this.lineList.length; i++) {
                            this.list[i] = false;
                        }

                        /**
                         * @Description: 请求完成后只显示当前需要显示的数据, 其他的在滚动到底部时 loadMore 再请求
                         * @author 汤一飞
                         * @date 2020/5/27
                        */
                        for (let i = 0; i < this.showItemCount; i++) {
                            if (this.lineList[i] && !this.lineList[i].requested) {
                                this.lineList[i].requested = true;
                                this.getVisitorAllInfoByEvent(this.lineList[i], i);
                                this.getFormByVisitorId(this.lineList[i], i);
                            }
                        }
                        // this.lineList.forEach((item, index) => {
                        //     this.getVisitorAllInfoByEvent(item, index);
                        //     this.getFormByVisitorId(item, index);
                        // });

                        // 获取历史轨迹拼接显示
                        this.mergeTrackList();

                        this.isLoading = false;
                    }
                } else {
                    // 获取历史轨迹拼接显示
                    this.mergeTrackList();

                    this.isLoading = false;
                }
            },

            // getDetile(id, index) {
            //     this.getVisitorAllInfoByEvent(id, index)
            //     this.getFormByVisitorId(id, index)
            // },
            // 这里面只有游客info、trace、chat不包含form表单--原来的方法
            getVisitorAllInfoByEvent_Old(id, index) {
                console.log('id', id);
                // piwik接口
                this.flag = index;
                this.visitorInfo = {};
                this.chatList = [];
                this.traceList = [];
                if (this.lineList[index].piwikFlag) {
                    util.ajaxInternationalJson({
                        url: '/piwikRead/visitorHistory/getVisitorHistoryDetail',
                        method: 'POST',
                        params: {
                            idvisit: id,
                            visitorId: this.visitorId
                        }
                    }).then(ret => {
                        this.showItem = true;
                        if (ret.data.code === '1') {
                            this.visitorInfo = ret.data.data.visitorInfo || {};
                            this.chatList = ret.data.data.visitorChatMessage;
                            this.traceList = ret.data.data.visitorTrace;
                            this.mergeInfoList = this.mergeList(this.chatList, this.traceList);
                        }
                    });
                    this.list[index] = true;
                } else {
                    this.flag = index;
                    this.visitorInfo = {};
                    this.chatList = [];
                    this.traceList = [];
                    util.ajaxInternational({
                        url: '/server/getVisitorAllInfoByEventId',
                        method: 'post',
                        data: {
                            eventId: id
                        }
                    }).then(ret => {
                        this.showItem = true;
                        if (ret.data.code === '1') {
                            this.visitorInfo = ret.data.data.visitorInfo || {};
                            this.chatList = ret.data.data.visitorChatMessage;
                            this.traceList = ret.data.data.visitorTrace;
                            this.mergeInfoList = this.mergeList(this.chatList, this.traceList);
                        }
                    });
                    this.list[index] = true;
                }
            },
            async formatGoogleDatas(item, all) {
                try {
                    const data = await getGoogleAdBtn(item.idvisit);
                    item.showBtn = data !== 1;
                    if (data === 1) {
                        item = await this.getGoogleInfoDetails(item, all, 'init');
                    }
                    return item;
                } catch (error) {
                    console.error(error);
                    return item;
                }
            },
            async getGoogleInfoDetails(item, all, type) {
                const info = await getGoogleAdInfo({
                    idvisit: item.idvisit,
                    orgId: this.enterpriseId,
                    url: all.eventContent
                });
                if (info && typeof info === 'object' && !(info instanceof Error)) {
                    for (const key in info) {
                        // eslint-disable-next-line no-prototype-builtins
                        if (info.hasOwnProperty(key)) {
                            const value = info[key] || '';
                            if (key && value && typeof value === 'string' && key === 'utm_device') {
                                item[key] = value.replace(/\#.*/, '');
                            } else {
                                item[key] = value;
                            }
                        }
                    }
                    item.showBtn = false;
                    this.$nextTick(function() {
                        this.$forceUpdate();
                    });
                } else {
                    this.$Message.error(this.$t('timeLine.codeErrorGoogleAd'));
                }
                return item;
            },
            getVisitorAllInfoByEvent(item, index) {
                console.log('id', item.eventId);
                // piwik接口
                this.flag = index;
                // this.visitorInfo={};
                // this.chatList=[];
                // this.traceList=[];
                if (item.piwikFlag) {
                    util.ajaxInternationalJson({
                        url: '/piwikRead/visitorHistory/getVisitorHistoryDetail',
                        method: 'POST',
                        params: {
                            idvisit: item.eventId,
                            visitorId: this.visitorId
                        }
                    }).then(async (ret) => {
                        this.showItem = true;
                        if (ret.data.code === '1') {
                            // item.visitorInfo = ret.data.data.visitorInfo;
                            const ingore = ret.data.data.visitorInfo;
                            item.visitorInfo = ingore.trafficSource === '1' ? await this.formatGoogleDatas(ingore, item) : ingore;
                            if (ret.data.data.visitorChatMessage && ret.data.data.visitorChatMessage.length > 0) {
                                item.visitorChatMessage = ret.data.data.visitorChatMessage.map(element => {
                                    return {
                                        attach: element.attach,
                                        body: element.body,
                                        flow: element.flow,
                                        fromAccount: element.fromAccount,
                                        fromNick: element.fromNick,
                                        idClient: element.idClient,
                                        createTime: element.msgTimestamp,
                                        msgType: element.msgType,
                                        toAccount: element.toAccount,
                                        type: 'chat'
                                    };
                                });
                            } else {
                                item.visitorChatMessage = [];
                            }

                            item.visitorTrace = ret.data.data.visitorTrace.map(element => {
                                return {
                                    createTime: element.enterTime,
                                    fromAddress: element.fromAddress,
                                    title: element.title,
                                    toAddress: element.toAddress,
                                    type: 'trace',
                                    currentActionType: element.currentActionType,
                                    preActionName: element.preActionName,
                                    middleActionName: element.middleActionName,
                                    currentActionName: element.currentActionName,
                                    currentPageType: element.currentPageType
                                };
                            });

                            // item.chatList=ret.data.data.visitorChatMessage
                            // item.traceList=ret.data.data.visitorTrace
                            // item.mergeInfoList=this.mergeList(this.chatList,this.traceList)
                            this.handleInfo(item);
                        }
                    });
                    this.list[index] = true;
                } else {
                    this.flag = index;
                    // this.visitorInfo={};
                    // this.chatList=[];
                    // this.traceList=[];
                    util.ajaxInternational({
                        url: '/server/getVisitorAllInfoByEventId',
                        method: 'post',
                        data: {
                            eventId: item.eventId
                        }
                    }).then(async (ret) => {
                        this.showItem = true;
                        if (ret.data.code === '1') {
                            // item.visitorInfo = ret.data.data.visitorInfo || {};
                            const ingore = ret.data.data.visitorInfo || {};
                            item.visitorInfo = ingore.trafficSource === '1' ? await this.formatGoogleDatas(ingore, item) : ingore;
                            if (ret.data.data.visitorChatMessage && ret.data.data.visitorChatMessage.length > 0) {
                                item.visitorChatMessage = ret.data.data.visitorChatMessage.map(element => {
                                    return {
                                        attach: element.attach,
                                        body: element.body,
                                        flow: element.flow,
                                        fromAccount: element.fromAccount,
                                        fromNick: element.fromNick,
                                        idClient: element.idClient,
                                        createTime: element.msgTimestamp,
                                        msgType: element.msgType,
                                        toAccount: element.toAccount,
                                        type: 'chat'
                                    };
                                });
                            } else {
                                item.visitorChatMessage = [];
                            }

                            item.visitorTrace = ret.data.data.visitorTrace.map(element => {
                                return {
                                    createTime: element.enterTime,
                                    fromAddress: element.fromAddress,
                                    title: element.title,
                                    toAddress: element.toAddress,
                                    type: 'trace',
                                    currentActionName: element.currentActionName,
                                    currentActionType: element.currentActionType,
                                    currentPageType: element.currentPageType,
                                    preActionName: element.preActionName,
                                    middleActionName: element.middleActionName
                                };
                            });
                            item.outLinkFlag = item.visitorTrace.findIndex(item => {
                                return item.currentActionType == 2;
                            });
                            // this.chatList=ret.data.data.visitorChatMessage
                            // this.traceList=ret.data.data.visitorTrace
                            // this.mergeInfoList=this.mergeList(this.chatList,this.traceList)
                            this.handleInfo(item);
                        }
                    });
                    this.list[index] = true;
                }
            },


            handleInfo(item) {
                let list = [];
                list = item.visitorChatMessage.concat(item.visitorTrace, item.formList);
                list = list.sort((a, b) => {
                    return new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
                });
                console.log('list', list);
                this.$set(item, 'mergeList', list);
            },
            // mergeList(arr1,arr2){
            //     console.log("mergeList",arr1,arr2);
            //     let temp=[];
            //     let flag=0;
            //     let L1=arr1.length;
            //     let L2=arr2.length;
            //     for(let i=0;i<L1;i++){
            //         let obj={
            //             type:'chat',
            //             time:arr1[i].msgTimestamp,
            //             body:arr1[i].body,
            //             attach:arr1[i].attach,
            //             flow:arr1[i].flow,
            //             fromAccount:arr1[i].fromAccount,
            //             fromNick:arr1[i].fromNick,
            //             idClient:arr1[i].idClient,
            //             msgType:arr1[i].msgType,
            //             toAccount:arr1[i].toAccount,
            //         }
            //         temp.push(obj)
            //     }
            //     for(let i=0;i<L2;i++){
            //         let obj={
            //             type:'trace',
            //             time:arr2[i].enterTime,
            //             title:arr2[i].title,
            //             fromAddress:arr2[i].fromAddress,
            //             toAddress:arr2[i].toAddress,
            //             visitorId:arr2[i].visitorId,
            //             currentActionType:arr2[i].currentActionType,
            // 			preActionName:arr2[i].preActionName,
            // 			middleActionName:arr2[i].middleActionName,
            //         }
            //         temp.push(obj);
            //     }
            //     if(this.webMsgList.length>0){
            //         for(let i=0;i<this.webMsgList.length;i++){
            //             let fields=[];
            //             for(var key in this.webMsgList[i]){
            //                 if(key.indexOf('a1') === 0 && this.fieldObj[key]){
            //                     let tempObj={
            //                         name:this.fieldObj[key].name || key,
            //                         value:this.webMsgList[i][key],
            //                     }
            //                     fields.push(tempObj);
            //                 }
            //             }
            //             let obj={
            //                 type:'msg',
            //                 title:'',
            //                 time:this.webMsgList[i].createTime,
            //                 fields:fields
            //             }
            //             temp.push(obj);
            //         }
            //     }
            //     console.log('temp',temp);

            //     return temp.sort(function(a,b){
            //         return a.time-b.time
            //     })
            // },


            async getFormByVisitorId(item, index) {
                console.log('jibenxinxi ', item, index, this.$store.state.visitorBaseInfo, this.lineList.eventId);
                const emailReg = Utils.regExp.fullEmail;
                const telReg = Utils.regExp.fullPhone;
                const idvisit = item.eventId;
                const visitorId = this.visitorId;
                if (item.piwikFlag) {
                    item.formList = [];
                    const resData = await getLeaveMessagePiwik({ idvisit, visitorId });
                    if (resData.code === '1' && resData.data.length) {
                        resData.data.forEach(id => {
                            util.ajaxJson({
                                url: 'form-cust/form/getColumnValue',
                                method: 'post',
                                params: {
                                    id
                                }
                            }).then(res => {
                                if (res.data.code === '1') {
                                    const fields = {};
                                    const element = res.data.data;
                                    element.type = 'msg';
                                    for (const key in element) {
                                        console.log('根据id获取留言', key);
                                        if (key.indexOf('a100') !== -1 && this.fieldObj[key]) {
                                            let formData = element[key];
                                            if (formData.indexOf('@') != -1 && formData.length < 40 && emailReg.test(formData)) { /* 检测是邮箱格式 */
                                                const emailArr = formData.split('@');
                                                emailArr[0] = '****';
                                                formData = emailArr.join('@');
                                            } else if (key !== 'a10010' && telReg.test(formData.replace(/\s/g, ''))) { /* 去掉字符串中空格 检测是电话 */
                                                formData = `${formData.slice(0, -4)}****`;
                                            }
                                            fields[key] = {
                                                label: this.fieldObj[key].name,
                                                value: formData
                                            };
                                        }
                                    }
                                    element.fields = fields;
                                    item.formList.push(element);
                                    if (item.visitorTrace) {
                                        this.handleInfo(item);
                                    }
                                }
                            });
                        });
                    }
                } else {
                    item.formList = [];
                    util.ajax({
                        url: '/form-cust/form/getColumnValueListByVisitorId',
                        method: 'post',
                        data: {
                            visitorId: this.visitorId
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            const fields = {};
                            const element = res.data.data;
                            element.type = 'msg';
                            for (const key in element) {
                                if (key.indexOf('a100') !== -1 && this.fieldObj[key]) {
                                    let formData = element[key];
                                    if (formData.indexOf('@') != -1 && formData.length < 40 && emailReg.test(formData)) { /* 检测是邮箱格式 */
                                        const emailArr = formData.split('@');
                                        emailArr[0] = '****';
                                        formData = emailArr.join('@');
                                    } else if (key !== 'a10010' && telReg.test(formData.replace(/\s/g, ''))) { /* 去掉字符串中空格 检测是电话 */
                                        formData = `${formData.slice(0, -4)}****`;
                                    }
                                    fields[key] = {
                                        label: this.fieldObj[key].name,
                                        value: formData
                                    };
                                }
                            }
                            element.fields = fields;
                            item.formList.push(element);
                            if (item.visitorTrace) {
                                this.handleInfo(item);
                            }
                        }
                    });
                }
            },
            // 弹出联系人详情
            viewContact(item) {
                this.$emit('viewContact', item);
            },

            // 加载更多
            loadMore() {
                if (this.showItemCount >= this.lineList.length) {
                    return;
                }
                this.showItemCount += this.showItemSize;
                for (let i = 0; i < this.showItemCount; i++) {
                    if (this.lineList[i] && !this.lineList[i].requested) {
                        this.lineList[i].requested = true;
                        this.getVisitorAllInfoByEvent(this.lineList[i], i);
                        this.getFormByVisitorId(this.lineList[i], i);
                    }
                }
            },

            // 获取最新一次对话的历史轨迹
            getHistoryTrackList() {
                /**
                 * @Description: 接口要求必填visitorId，此处若没有值，则中断请求，避免报错
                 * @author 杨娣
                 * @date 2021/3/22
                */
                if (!this.currVisitorId) {
                    return false;
                }
                this.historyTrackList = [];
                util.ajaxInternationalJson({
                    url: '/piwikRead/visitorHistory/getCussLastEventTrace',
                    method: 'get',
                    params: {
                        visitorId: this.currVisitorId,
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (response.data.data && Array.isArray(response.data.data.visitorTraces)) {
                            this.historyTrackList = response.data.data.visitorTraces;
                        }
                    } else {
                        this.$Message.error(this.$t('visitor_history.error_getHistoryTrackList'));
                    }
                }).catch(error => {
                    this.$Message.error(this.$t('visitor_history.error_getHistoryTrackList'));
                });
            },
            // 判断是否要调用 getHistoryTrackList
            mergeTrackList() {
                if (this.type === 'chat' && this.lineList.length === 0) {
                    this.getHistoryTrackList();
                }
            }
        }
    };
</script>

<style>
    .trace-web-title {
        color: #FF8355;
        background: #FFECE2;
        padding: 0 5px;
    }

    .info-item {
        background-color: #F9FBFD;
        /*padding: 10px 10px 0;*/
        border-top: 1px dashed #E6E6E6;
        word-break: break-word;
    }

    .info-item .item-header {
        margin-bottom: 10px;
    }

    .info-time {
        /*margin-right: 10px;*/
        float: right;
        color: #b8b8b8;
        display: inline-block;
    }

    .info-title {
        display: inline-block;
    }

    .web-tip {
        font-weight: bolder;
        line-height: 20px;
    }

    .web-link a {
        cursor: pointer;
        color: #3b78de;
    }

    .web-link:hover a {
        text-decoration: underline;
        color: #2d63bc;
    }
</style>

<!-- 时间轴 -->
<style lang="less">
    @import '~@/views/main-components/timeline/timeline.less';
</style>

<style lang="less" scoped>
    .timeline-dot-icon {
        color: white;
        line-height: 40px;
    }

    .time {
        font-size: 14px;
        font-weight: bold;
    }

    .content {
        padding-left: 5px;
    }
</style>
