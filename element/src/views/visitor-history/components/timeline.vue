<template>
    <div :style="{overflow: 'auto', 'max-height': `${timeLineMaxHeight}px`}"
         class="time-line">
        <Timeline v-infinite-scroll="getTimelineNew"
                  :infinite-scroll-immediate="false"
                  :infinite-scroll-disabled="noMore || (lineDataType !== 'trace')"
                  style="padding:0px 20px 0"
                  class="big-icon-timeline">
            <!-- loading -->
            <Spin v-if="isLoading"
                  fix>
                <Icon type="ios-loading"
                      size=18
                      class="demo-spin-icon-load"></Icon>
                <div>Loading</div>
            </Spin>

            <!-- 时间轴起始点 -->
            <!-- <TimelineItem v-if="lineList.length > 0">
                <div slot="dot"
                     class="timeline-dot">
                    <Icon type="record"
                          size="12"
                          color="#e9eaec"
                          style="vertical-align: top;"></Icon>
                </div>
                <div><br></div>
            </TimelineItem> -->

            <!-- 时间轴数据 -->
            <TimelineItem v-for="(item, index) in lineList"
                          :key="index">
                <!-- 如果该条对话 visitorTrace 数组第一条不是外链，则隐藏外链，其它正常显示 -->
                <!--<template v-if="item.outLinkFlag !== 0">-->
                <!-- 如果该条对话 visitorTrace 数组第一条是外链，则直接显示第一条轨迹，隐藏外链 -->
                <!--<template v-else-if="item.outLinkFlag === 0 && item.visitorTrace.length > 1">-->
                <!-- 这两种情况代码大致相同, 合并代码, 只在代码不同处加上上面的逻辑判断 -->

                <template v-if="(lineDataType === 'form') || (item.outLinkFlag !== 0) || (item.outLinkFlag === 0 && Array.isArray(item.visitorTrace) && item.visitorTrace.length > 1)">
                    <!-- 时间轴条目图标: 网站访问 -->
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/webVisit.svg" />
                    </div>

                    <!-- 时间轴条目内容 -->
                    <div class="timeline-item">
                        <!-- 头部信息 -->
                        <div class="item-header clearfloat">
                            <!-- 标题 -->
                            <div class="item-title">{{ $t('timeLine.siteVisit') }}</div>

                            <!-- 聊天 logo -->
                            <template v-if="item.visitorChatMessage && item.visitorChatMessage.length > 0">
                                <Icon custom="custom custom-chat"
                                      size="14"
                                      style="color:#ccc;line-height: 20px"></Icon>
                            </template>

                            <!-- 留言 logo -->
                            <template v-if="(lineDataType === 'form') || (item.formList && item.formList.length > 0)">
                                <Icon custom="custom custom-leave-message"
                                      size="14"
                                      style="color:#ccc;line-height: 20px; padding-left:10px"></Icon>
                            </template>

                            <!-- 订单相关 logo -->
                            <template v-if="item.outLinkFlag !== 0">
                                <Icon v-if="item.showOrderIconOrder"
                                      custom="custom custom-normal"
                                      size="14"
                                      style="color:#ccc;line-height: 20px; padding-left:10px"></Icon>
                                <Icon v-if="item.showOrderIconCart"
                                      custom="custom custom-shengchengdingdan"
                                      size="14"
                                      style="color:#ccc;line-height: 20px; padding-left:10px"></Icon>
                            </template>

                            <!-- 显示更多/收起 -->
                            <div @click.stop="toggleDetail(!item.showDetail, index)"
                                 class="item-time">
                                <Icon :custom="`custom ${item.showDetail ? 'custom-collapse' : 'custom-show-more'}`"></Icon>
                            </div>

                            <!-- 时间 -->
                            <div class="item-time">{{ item.eventTime | timeFormat('DateTime') }}</div>
                        </div>

                        <!-- 内容 -->
                        <div class="item-body">
                            <!-- 如果有 eventContent , 显示用户访问了 xxx 网址链接 -->
                            <template v-if="item.eventContent">
                                <span v-if="simpleInfo.visitorName">【{{simpleInfo.visitorName}}】</span>{{ $t('timeLine.accessToThe') }}
                                <a target="_blank"
                                   :href="item.eventContent"
                                   class="item-event">【{{item.eventContent}}】</a>
                            </template>
                            <!-- 如果没有 eventContent , 显示 visitorTrace 数组中第一条非外链信息 -->
                            <template v-else-if="Array.isArray(item.visitorTrace)">
                                <template v-if="item.outLinkFlag !== 0">
                                    <template v-if="item.visitorTrace.length && item.visitorTrace[0].currentActionType !== 2">
                                        <span v-if="simpleInfo.visitorName">【{{simpleInfo.visitorName}}】</span>
                                        <span>-> {{item.visitorTrace[0].preActionName}} - {{item.visitorTrace[0].middleActionName}} - {{item.visitorTrace[0].title}}</span>
                                        <a target="_blank"
                                           :href="item.visitorTrace[0].toAddress"
                                           class="item-event">【{{item.visitorTrace[0].toAddress}}】</a>
                                    </template>
                                </template>
                                <template v-else-if="item.outLinkFlag === 0 && item.visitorTrace.length > 1">
                                    <template v-if="item.visitorTrace[1].currentActionType !== 2">
                                        <span v-if="simpleInfo.visitorName">【{{simpleInfo.visitorName}}】</span>
                                        <span>-> {{item.visitorTrace[1].preActionName}} - {{item.visitorTrace[1].middleActionName}} - {{item.visitorTrace[1].title}}</span>
                                        <a target="_blank"
                                           :href="item.visitorTrace[1].toAddress"
                                           class="item-event">【{{item.visitorTrace[1].toAddress}}】</a>
                                    </template>
                                </template>
                            </template>

                            <!-- 展开显示详细信息 -->
                            <div v-show="item.showDetail"
                                 class="api">
                                <!-- 来源信息 -->
                                <div v-if="lineDataType === 'trace'"
                                     style="padding-bottom: 8px;">
                                    <Row>
                                        <Col :span="12">
                                            <Row class="web-tip">
                                                <!-- visitorId -->
                                                <template v-if="item.outLinkFlag !== 0">
                                                    <Col :span="8">{{ $t('visitor_history.visitorID') }}</Col>
                                                    <Col :span="16">{{ item.visitorInfo.visitorId }}</Col>
                                                </template>
                                                <!-- 创建时间 -->
                                                <template v-else-if="item.outLinkFlag === 0 && item.visitorTrace.length > 1">
                                                    <Col :span="8">{{ $t('visitor_history.create_time') }}</Col>
                                                    <Col :span="16">{{ item.visitorInfo.createTime ? item.visitorInfo.createTime : '' | timeFormat('DateTime') }}</Col>
                                                </template>
                                            </Row>
                                            <!-- 是否聊过天 -->
                                            <Row class="web-tip">
                                                <Col :span="8">{{$t('visitor_history.is_chatted')}}</Col>
                                                <Col :span="16">{{ item.visitorInfo.haveChat != null ? item.visitorInfo.haveChat: '' | filterTip }}</Col>
                                            </Row>
                                            <!-- 接待客服 -->
                                            <Row class="web-tip">
                                                <Col :span="8"> {{$t('visitor_history.customer_service')}}</Col>
                                                <Col :span="16">{{ item.visitorInfo.receptionServer ? item.visitorInfo.receptionServer : '' }}</Col>
                                            </Row>
                                            <!-- 访客讯息总数 -->
                                            <Row class="web-tip">
                                                <Col :span="8"> {{$t('visitor_history.visitor_chat_count')}}</Col>
                                                <Col :span="16">{{item.visitorInfo.visitorChatCount}}</Col>
                                            </Row>
                                            <!-- 浏览器版本 -->
                                            <Row class="web-tip">
                                                <Col :span="8"> {{$t('visitor_history.browser_version')}}</Col>
                                                <Col :span="16">{{item.visitorInfo.browserVersion}}</Col>
                                            </Row>
                                            <!-- 初次访问网址 -->
                                            <Row class="web-tip">
                                                <Col :span="8"> {{$t('visitor_history.first_visit_address')}}</Col>
                                                <Col v-if="item.visitorInfo.firstVisitorAddress"
                                                     :span="16"
                                                     :title="item.visitorInfo.firstVisitorAddress.length >= 30 ? item.visitorInfo.firstVisitorAddress : ''">
                                                    {{ item.visitorInfo.firstVisitorAddress.length >= 30 ? item.visitorInfo.firstVisitorAddress.slice(0, 31) + '...' : item.visitorInfo.firstVisitorAddress }}
                                                </Col>
                                                <Col v-else
                                                     :span="16">{{item.visitorInfo.firstVisitorAddress}}</Col>
                                            </Row>
                                            <!-- 广告类型，广告系列名称、广告组名称、广告名称、广告关键词 -->
                                            <Row class="web-tip">
                                                <Col :span="8"> {{$t('visitor_history.traffic_source')}}</Col>
                                                <Col v-if="item.visitorInfo.trafficSource"
                                                     :span="16">
                                                    {{ handleTrafficSourceVal(item.visitorInfo.trafficSource) }}
                                                </Col>
                                            </Row>
                                            <!-- 查询广告信息 -->
                                            <template v-if="item.visitorInfo.trafficSource === '1' && item.visitorInfo.showBtn">
                                                <Row class="web-tip">
                                                    <Col :span="24">
                                                        <span @click.stop="hiddenItem(item.visitorInfo, item)"
                                                              style="color:#3b78de;font-size:14px;margin-top: .5em;font-weight:500;cursor: pointer;">{{$t('timeLine.googleAdBtn')}}</span>
                                                    </Col>
                                                </Row>
                                            </template>
                                            <!-- google 广告信息 -->
                                            <template v-if="item.visitorInfo.trafficSource === '1' && !item.visitorInfo.showBtn">
                                                <Row class="web-tip">
                                                    <Col :span="8">{{$t('timeLine.googleAd')}}</Col>
                                                    <Col :span="16">{{item.visitorInfo['ad_name'] || item.visitorInfo['ad_id']}}</Col>
                                                </Row>
                                                <Row class="web-tip">
                                                    <Col :span="8">{{$t('timeLine.googleGroup')}}</Col>
                                                    <Col :span="16">{{item.visitorInfo['group_name']}}</Col>
                                                </Row>
                                                <Row class="web-tip">
                                                    <Col :span="8">{{$t('timeLine.googleKeyWord')}}</Col>
                                                    <Col :span="16">{{item.visitorInfo['utm_keyword']}}</Col>
                                                </Row>
                                                <Row class="web-tip">
                                                    <Col :span="8">{{$t('timeLine.googleMatchType')}}</Col>
                                                    <Col :span="16">{{item.visitorInfo['utm_matchtype']}}</Col>
                                                </Row>
                                            </template>
                                            <!-- 其他广告信息 -->
                                            <template v-if="item.visitorInfo.trafficSource === '2' || item.visitorInfo.trafficSource === '3'">
                                                <Row class="web-tip">
                                                    <Col :span="8"> {{$t('visitor_history.ad_campaign_name')}}</Col>
                                                    <Col :span="16">{{item.visitorInfo.adCampaignName}}</Col>
                                                </Row>
                                                <Row class="web-tip">
                                                    <Col :span="8"> {{$t('visitor_history.ad_name')}}</Col>
                                                    <Col :span="16">{{item.visitorInfo.adName}}</Col>
                                                </Row>
                                            </template>
                                        </Col>
                                        <Col :span="12">
                                            <!-- 创建时间 -->
                                            <Row v-if="item.outLinkFlag !== 0"
                                                 class="web-tip">
                                                <Col :span="8">{{ $t('visitor_history.create_time') }}</Col>
                                                <Col :span="16">{{ item.visitorInfo.createTime ? item.visitorInfo.createTime : '' | timeFormat('DateTime') }}</Col>
                                            </Row>
                                            <!-- 访问来源 -->
                                            <Row class="web-tip">
                                                <Col :span="8"> {{$t('visitor_history.source')}}</Col>
                                                <Col v-if="item.visitorInfo.visitSource"
                                                     :span="16"
                                                     :title="item.visitorInfo.visitSource.length >= 30 ? item.visitorInfo.visitSource : ''">
                                                    {{ item.visitorInfo.visitSource.length >= 30 ? item.visitorInfo.visitSource.slice(0, 31) + '...' : item.visitorInfo.visitSource }}
                                                </Col>
                                                <Col v-else
                                                     :span="16">{{item.visitorInfo.visitSource}}</Col>
                                            </Row>
                                            <!-- IP 定位 -->
                                            <Row class="web-tip">
                                                <Col :span="8"> {{$t('visitor_history.ip_location')}}</Col>
                                                <Col :span="16">{{item.visitorInfo.ipLocation}}</Col>
                                            </Row>
                                            <!-- IP 地址 -->
                                            <Row class="web-tip">
                                                <Col :span="8"> {{$t('visitor_history.ip_addr')}}</Col>
                                                <Col :span="16">{{item.visitorInfo.ipAddress}}</Col>
                                            </Row>
                                            <!-- 客服讯息总数 -->
                                            <Row class="web-tip">
                                                <Col :span="8"> {{$t('visitor_history.service_chat_count')}}</Col>
                                                <Col :span="16">{{item.visitorInfo.serverChatCount}}</Col>
                                            </Row>
                                            <!-- 屏幕分辨率 -->
                                            <Row class="web-tip">
                                                <Col :span="8"> {{$t('visitor_history.screen_resolution')}}</Col>
                                                <Col :span="16">{{item.visitorInfo.screenResolution}}</Col>
                                            </Row>
                                            <!-- 浏览器 -->
                                            <Row class="web-tip">
                                                <Col :span="8"> {{$t('visitor_history.browser')}}</Col>
                                                <Col :span="16">{{item.visitorInfo.browser}}</Col>
                                            </Row>
                                            <!-- google 广告信息 -->
                                            <template v-if="item.visitorInfo.trafficSource === '1' && !item.visitorInfo.showBtn">
                                                <Row class="web-tip">
                                                    <Col :span="8">{{$t('timeLine.googleDevice')}}</Col>
                                                    <Col :span="16">{{item.visitorInfo['utm_device']}}</Col>
                                                </Row>
                                                <Row class="web-tip">
                                                    <Col :span="8">{{$t('timeLine.googleCampaign')}}</Col>
                                                    <Col :span="16">{{item.visitorInfo['campaign_name']}}</Col>
                                                </Row>
                                                <Row class="web-tip">
                                                    <Col :span="8">{{$t('timeLine.googleNetwork')}}</Col>
                                                    <Col :span="16">{{item.visitorInfo['utm_network']}}</Col>
                                                </Row>
                                            </template>
                                            <!-- FB / 其他广告信息 -->
                                            <template v-if="item.visitorInfo.trafficSource === '2' ||item.visitorInfo.trafficSource === '3'">
                                                <Row class="web-tip">
                                                    <Col :span="8"> {{$t('visitor_history.ad_type')}}</Col>
                                                    <Col :span="16">{{item.visitorInfo.adType}}</Col>
                                                </Row>
                                                <Row class="web-tip">
                                                    <Col :span="8"> {{$t('visitor_history.ad_group_name')}}</Col>
                                                    <Col :span="16">{{item.visitorInfo.adGroupName}}</Col>
                                                </Row>
                                                <Row class="web-tip">
                                                    <Col :span="8"> {{$t('visitor_history.ad_keyword')}}</Col>
                                                    <Col :span="16">{{item.visitorInfo.adKeyword}}</Col>
                                                </Row>
                                            </template>
                                        </Col>
                                    </Row>
                                </div>

                                <!-- 其他信息 -->
                                <div style="margin-top: 5px">
                                    <div v-for="(info, index) in item.mergeList"
                                         :key="index">
                                        <!-- 购物车信息 -->
                                        <div v-if="info.type === 'traceOrder'"
                                             class="info-item">
                                            <div class="item-header clearfloat">
                                                <span class="info-time">{{ info.createTime | timeFormat('DateTime') }}</span>
                                                <span class="trace-web-title">{{`-> ${info.title}`}}</span>
                                            </div>
                                            <div class="item-body">
                                                <div>
                                                    {{info.idorder ? 'Revenue: ' : 'Revenue lest in cart: '}}<span>{{info.revenue}}</span>,Quantity:
                                                    <span>{{info.items}}</span>
                                                </div>
                                                <template v-if="info.data">
                                                    <div v-for="(v,i) in info.data"
                                                         :key="i"
                                                         style="box-sizing:border-box;padding-left: 20px">
                                                        <span>{{v.sku_name}}</span>:<span>{{v.product_name}}</span>,Quantity:
                                                        <span>{{v.quantity}}</span>,Price: <span>{{v.price}}</span>
                                                    </div>
                                                </template>
                                                <div v-if="info.targetUrl">
                                                    {{$t('visitor_history.to')}}&nbsp;
                                                    <a class="item-event"
                                                       style="padding-left:10px"
                                                       target="_blank"
                                                       :href="info.targetUrl">{{info.targetUrl}}</a>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- 轨迹信息 -->
                                        <div v-if="info.type === 'trace' && info.currentActionType !== 2 && (info.fromAddress || info.toAddress) "
                                             class="info-item">
                                            <div class="item-header clearfloat">
                                                <!-- <div class="info-time">{{info.createTime | timeFormat('DateTime')}}</div> -->
                                                <!-- <div class="info-title">{{info.title}}</div> -->
                                                <span class="info-time">{{ info.createTime | timeFormat('DateTime') }}</span>
                                                <!-- TYPE= 1: 页面url
                                                TYPE= 2: 外链
                                                TYPE= 3: 下载
                                                TYPE= 4:  页面标题
                                                TYPE= 10: 事件类别
                                                TYPE= 11: 事件动作
                                                TYPE= 12: 事件名称 -->
                                                <template v-if="info.currentActionType === 3">
                                                    <span class="trace-web-title">{{$t('visitor_history.fileDownload')}}:</span>
                                                    <a target="_blank"
                                                       :href="info.currentActionName"
                                                       style="padding-left:10px"
                                                       class="item-event"> {{info.currentActionName}}</a>
                                                </template>
                                                <span v-else-if="info.currentActionType === 10"
                                                      class="trace-web-title">-> {{info.preActionName}} - {{info.middleActionName}} - {{info.title}}</span>
                                                <span v-else-if="info.currentPageType === 8"
                                                      class="trace-web-title">{{$t('visitor_history.SearchkeywordsWithinSite')}}: {{info.title}}</span>
                                                <!--<span v-else-if="info.currentActionType === 1 && !info.title"> {{info.title}} </span>-->
                                                <span v-else
                                                      class="trace-web-title">{{info.title}}</span>
                                            </div>
                                            <div v-if="info.currentActionType == 1 || info.currentActionType == undefined"
                                                 class="item-body">
                                                <div v-if="info.fromAddress">
                                                    {{$t('visitor_history.from')}}&nbsp;
                                                    <a class="item-event"
                                                       style="padding-left:10px"
                                                       target="_blank"
                                                       :href="info.fromAddress">{{info.fromAddress}}</a>
                                                </div>
                                                <div v-if="info.toAddress">
                                                    {{$t('visitor_history.to')}}&nbsp;
                                                    <a class="item-event"
                                                       style="padding-left:10px"
                                                       target="_blank"
                                                       :href="info.toAddress">{{info.toAddress}}</a>
                                                </div>
                                            </div>
                                            <div v-else-if="info.currentActionType === 2"
                                                 class="item-body"></div>
                                            <div v-else
                                                 class="item-body">
                                                <div v-if="info.fromAddress || info.toAddress">
                                                    {{$t('visitor_history.on')}}&nbsp;
                                                    <a class="item-event"
                                                       style="padding-left:10px"
                                                       target="_blank"
                                                       :href="info.fromAddress || info.toAddress">{{info.fromAddress || info.toAddress}}</a>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- 聊天信息 -->
                                        <div v-else-if="info.type === 'chat'"
                                             class="info-item">
                                            <div class="item-header clearfloat">
                                                <!-- <div class="info-title" style="margin-left:">{{info.fromNick}}</div> -->
                                                <div class="info-title">{{ info.fromNick }}&emsp;{{ info.createTime | timeFormat('DateTime') }}</div>
                                                <Button v-if="info.msgType === 'text'"
                                                        type="primary"
                                                        size="small"
                                                        @click="translate(info)"
                                                        style="width: 50px;box-sizing: border-box;padding: 5px;margin-left:10px">
                                                    {{$t('visitor_history.translate')}}
                                                </Button>
                                            </div>
                                            <div v-if="info.msgType === 'text'"
                                                 v-html="info.body"
                                                 class="item-body"></div>
                                            <div v-else-if="info.msgType === 'image'"
                                                 class="item-body">
                                                <img :src="$stm.dealImgName(info.attach,info.body)"
                                                     @click="imgPreview" />
                                            </div>
                                            <div v-else-if="info.msgType === 'file'">
                                                <a :href="info.attach+'&download='+info.body"
                                                   target="_blank">
                                                    <i class="u-icon icon-file"></i>{{info.body}}
                                                </a>
                                            </div>
                                            <div v-if="info.translateBody"
                                                 v-html="info.translateBody"
                                                 class="item-translate-body"></div>
                                        </div>
                                        <!-- 留言信息 -->
                                        <div v-else-if="info.type === 'form'"
                                             class="info-item">
                                            <div class="item-header clearfloat">
                                                <div class="info-time">{{ info.createTime | timeFormat('DateTime') }}</div>
                                                <div class="info-title">{{ info.templateName }}</div>
                                            </div>
                                            <div class="item-body">
                                                <div v-for="(item1, index) in info.fields"
                                                     :key="index">
                                                    <span class="form-item">{{item1.label}}</span>
                                                    <span>{{item1.value}}</span>
                                                </div>

                                                <!-- 附加字段 -->
                                                <template v-if="Array.isArray(item.externalDataList) && item.externalDataList.length">
                                                    <div v-for="item1 in item.externalDataList"
                                                         :key="item1.key">
                                                        <!-- checkbox 框型字段 -->
                                                        <template v-if="item1.type === 'checkbox'">
                                                            <Checkbox :value="item1.value">{{ item1.label || item1.keyLabel }}</Checkbox>
                                                        </template>
                                                        <!-- 其他正常字段 -->
                                                        <template v-else>
                                                            <span class="form-item">{{ item1.label }}</span>
                                                            <span>{{ item1.value }}</span>
                                                        </template>
                                                    </div>
                                                </template>

                                                <!-- 产品列表 -->
                                                <div v-if="item.showTable"
                                                     class="item-table">
                                                    <Table :data="item.tableData"
                                                           size="medium">
                                                        <TableColumn v-for="col in chartColumns.filter(col => item.tableData.some(dataItem => !['', null, undefined].includes(dataItem[col.key])))"
                                                                     :key="col.key"
                                                                     :prop="col.key"
                                                                     :label="col.title"
                                                                     :align="col.align"
                                                                     :width="col.width"
                                                                     :min-width="col.width || 64"
                                                                     :show-overflow-tooltip="true">
                                                            <template slot-scope="scope">
                                                                <!-- 产品图片 -->
                                                                <template v-if="col.key === 'productImg' && scope.row.productImg">
                                                                    <img :src="scope.row.productImg"
                                                                         alt=""
                                                                         height="40px"
                                                                         width="40px"
                                                                         style="vertical-align:middle" />
                                                                </template>
                                                                <!-- 产品链接 -->
                                                                <template v-else-if="col.key === 'productLink' && scope.row.productLink">
                                                                    <a :href="scope.row.productLink"
                                                                       target="_blank">{{ scope.row.productLink }}</a>
                                                                </template>
                                                                <!-- 含 formatter 的 column 的处理 -->
                                                                <template v-else-if="col.formatter">{{ (col.formatter)(scope.row) }}</template>
                                                                <!-- 其他 -->
                                                                <template v-else>{{ scope.row[col.key] }}</template>
                                                            </template>
                                                        </TableColumn>
                                                    </Table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </TimelineItem>

            <!-- 提示: 没有更多 -->
            <p v-if="noMore"
               class="timeline-no-more-tip">{{ $t('noticeWindow.noMore') }}</p>
        </Timeline>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import Utils from '@/utils/index';
    import { mapState } from 'vuex';
    import { getGoogleAdInfo } from '@/api/reusableApi/common';
    import { getTimeLineNew } from '../api/visitor_old';

    export default {
        name: 'webInteractLine',
        props: {
            row: {
                type: Object,
                default() {
                    return {};
                }
            },
            simpleInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
            fieldObj: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        computed: {
            ...mapState({
                nim: state => state.nim,
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                window_height: 'window_height'
            }), // 从 vuex 中获取属性
            // 时间轴容器 max-height
            timeLineMaxHeight() {
                let temp = this.window_height ? this.window_height - 352 : document.body.clientHeight - 352;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            }
        },
        filters: {
            filterTip: function(tip) {
                if (tip == '') {
                    return '';
                } else {
                    return tip === '0' ? '否' : '是';
                }
            }
        },
        data() {
            return {
                isLoading: true,
                lineList: [],
                chartColumns: [
                    {
                        title: this.$t('visitor_history.productImage'),
                        key: 'productImg',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productName'),
                        key: 'productName',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productPage'),
                        key: 'productLink',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productQuantity'),
                        key: 'productQuantity',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productDescription'),
                        key: 'productDescription',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productRadial'),
                        key: 'productRadial',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productDiameter'),
                        key: 'productDiameter',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productSize'),
                        key: 'productSize',
                        align: 'left',
                        formatter: ({ productSize = '' }) => {
                            return productSize.replace(/\\/g, '');
                        }
                    },
                    {
                        title: this.$t('visitor_history.productItem'),
                        key: 'productItem',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productColor'),
                        key: 'productColor',
                        align: 'left'
                    }
                ],

                // 分页加载
                pageNo: 1,
                pageSize: 20,
                noMore: false,
                // 时间轴数据类型, trace 代表接口返回的 list 和 total , 分页数据; form 代表 list2 , 一次性返回数据
                lineDataType: ''
            };
        },
        methods: {
            handleTrafficSourceVal(key) {
                switch (key - 0) {
                    case 1:
                        return this.$t('visitor_history.ad_google');
                    case 2:
                        return this.$t('visitor_history.ad_facebook');
                    case 3:
                        return this.$t('visitor_history.ad_other');
                    case 4:
                        return this.$t('visitor_history.email_marketing');
                    case 5:
                        return this.$t('visitor_history.search_engine');
                    case 6:
                        return this.$t('visitor_history.social_network');
                    case 7:
                        return this.$t('visitor_history.other_referrals');
                    case 8:
                        return this.$t('visitor_history.direct_access');
                    case 9:
                        return this.$t('visitor_history.ad_yandex');
                    case 10:
                        return this.$t('visitor_history.ad_cloudshare');
                    case 101:
                        return this.$t('visitor_history.ad_cloudshare_facebook');
                    case 102:
                        return this.$t('visitor_history.ad_cloudshare_messenger');
                    case 103:
                        return this.$t('visitor_history.ad_cloudshare_whatsApp');
                    case 104:
                        return this.$t('visitor_history.ad_cloudshare_email');
                    case 105:
                        return this.$t('visitor_history.ad_cloudshare_other');
                    default:
                        return key;
                }
            },

            // 获取该条会话详情
            async hiddenItem(item, all) {
                await this.getGoogleInfoDetails(item, all);
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
                            item[key] = info[key];
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

            // 切换显示详情
            toggleDetail(visible, index) {
                this.$set(this.lineList, index, Object.assign(this.lineList[index], { showDetail: visible }));
            },
            translate(info) {
                // this.translateLoading=true
                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: info.body,
                        targetLang: 'zh'
                    }
                }).then(response => {
                    // this.translateLoading=false
                    // this.inputMessage=response.data.data.translations[0].translatedText
                    this.$set(info, 'translateBody', response.data.data.translations[0].translatedText);
                });
            },
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },

            // 请求数据
            async getTimelineNew(isInit) {
                // 初始化时, 清空原数据
                if (isInit) {
                    this.lineList = [];
                    this.pageNo = 1;
                    this.lineDataType = '';
                    this.noMore = false;
                }

                // 显示 loading
                this.isLoading = true;

                // 暂存数据
                let dataArr = [];

                // 请求接口获取数据
                if (!this.row.visitorId) return false;
                const resData = await getTimeLineNew({
                    visitorId: this.row.visitorId,
                    orgId: this.enterpriseId,
                    currentPage: this.pageNo,
                    size: this.pageSize
                });

                // 根据接口返回, 判断显示数据的类型, 以及加载方式(分页 || 全部加载)
                const prevType = this.lineDataType;
                if (resData.data && resData.data.total) {
                    // 走分页
                    this.lineDataType = 'trace';
                    if (resData.data.list.length < this.pageSize) {
                        this.noMore = true;
                    }
                    dataArr = this.handleTraceLineData(resData.data.list || []);
                    this.pageNo++;
                } else {
                    // 全部请求显示, 不滚动加载
                    this.lineDataType = 'form';
                    dataArr = this.handleFormLineData(resData.data.list2 || []);
                }
                // 如果接口返回导致 lineDataType 变化了, 说明家在方式也变化了, 因此清空原数据, 改用新的加载方式
                if (prevType && prevType !== this.lineDataType) {
                    // 如果加载方式变化, 清空原数据
                    this.lineList = [];
                    this.pageNo = this.lineDataType === 'trace' ? 2 : 1;
                }

                if (dataArr.length) {
                    // 拼接返回数据, 查重并倒序排序
                    const temp = new Map();
                    const showDetailSet = new Set();
                    this.lineList.concat(dataArr).forEach(item => {
                        temp.set(item.eventId, item);
                        if (item.showDetail) {
                            showDetailSet.add(item.eventId);
                        }
                    });
                    this.lineList = Array.from(temp.values()).map(item => {
                        if (showDetailSet.has(item.eventId)) {
                            item.showDetail = true;
                        }
                        return item;
                    }).sort((a, b) => b.eventTime - a.eventTime);

                    // 向上返回相关数据
                    this.$emit('getVisitTimes', resData.data.total || this.lineList.length);
                    this.$emit('getFirstVisitTime', resData.data.total ? resData.data.firstVisitTime : undefined);

                    // 当前是初次请求, 展开第一条数据的详情
                    if (isInit) {
                        this.lineList[0].showDetail = true;
                    }
                }

                // 取消 loading
                this.isLoading = false;
            },
            // 处理接口数据
            // 处理表单数据
            formatFormValue(element) {
                // 加上 type
                element.type = 'form';

                // 处理留言数据
                const emailReg = Utils.regExp.fullEmail;
                const telReg = Utils.regExp.fullPhone;
                const fields = {};
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

                // 返回结果
                return element;
            },
            handleTraceLineData(data) {
                return data.map(item => {
                    // 处理 google 广告与其他信息
                    item.visitorInfo = item.visitorInfo.trafficSource === '1' ? Object.assign(item.visitorInfo, item.adsGoogleDetailInfo || {}) : item.visitorInfo;
                    item.showBtn = !item.adsGoogleDetailInfo;

                    if (Array.isArray(item.visitorChatMessage) && item.visitorChatMessage.length > 0) {
                        item.visitorChatMessage = item.visitorChatMessage.map(element => {
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

                    if (item.visitorLeaveMessage && item.visitorLeaveMessage.fcolumnValue) {
                        item.formList = [this.formatFormValue(item.visitorLeaveMessage.fcolumnValue)];
                        item.productList = [];
                        item.externalDataList = [];

                        // 处理产品数据
                        try {
                            if (item.visitorLeaveMessage.productList) {
                                const productRes = JSON.parse(item.visitorLeaveMessage.productList);
                                if (productRes.code === '1') {
                                    if (Array.isArray(productRes.data.list) && productRes.data.list.length) {
                                        item.productList = productRes.data.list;
                                    }
                                    if (Array.isArray(productRes.data.formOptionsDtoList) && productRes.data.formOptionsDtoList.length) {
                                        item.externalDataList = productRes.data.formOptionsDtoList;
                                    }
                                }
                            }
                        } catch (e) {
                        }
                        item.showTable = item.productList.length;
                        item.tableData = item.productList;
                    } else {
                        item.formList = [];
                    }

                    if (Array.isArray(item.visitorTrace) && item.visitorTrace.length > 0) {
                        item.visitorTrace = item.visitorTrace.map(element => {
                            let temp = {
                                createTime: element.enterTime,
                                fromAddress: element.fromAddress,
                                title: element.title,
                                toAddress: element.toAddress,
                                type: 'trace'
                            };
                            if (item.piwikFlag) {
                                temp = Object.assign(temp, {
                                    currentActionName: element.currentActionName,
                                    currentActionType: element.currentActionType,
                                    currentPageType: element.currentPageType,
                                    preActionName: element.preActionName,
                                    middleActionName: element.middleActionName
                                });
                            }

                            return temp;
                        });
                    } else {
                        item.visitorTrace = [];
                    }

                    if (item.piwikFlag) {
                        const f = item.orders && Array.isArray(item.orders) && item.orders.length;
                        item.showOrderIconOrder = f && item.orders.some(v => v.idorder);
                        item.showOrderIconCart = f && item.orders.some(v => !v.idorder);
                        if (item.orders && Array.isArray(item.orders)) {
                            item.visitorTrace = item.visitorTrace.concat((item.orders || []).map(v => ({
                                ...v,
                                createTime: v.enterTime,
                                title: v.idorder ? `订单(${v.idorder})` : '购物车',
                                targetUrl: decodeURIComponent(item.visitorInfo.firstVisitorAddress),
                                type: 'traceOrder'
                            })));
                        }
                        item.outLinkFlag = item.visitorTrace.findIndex(item => {
                            return item.currentActionType == 2;
                        });
                    }

                    // 拼接 mergeList
                    let list = [];
                    list = item.visitorChatMessage.concat(item.visitorTrace, item.formList);
                    item.mergeList = list.sort((a, b) => {
                        return new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
                    });

                    return item;
                });
            },
            handleFormLineData(data) {
                return data.map(item => {
                    const temp = this.formatFormValue(item);
                    // 处理产品数据
                    temp.productList = Array.isArray(temp.list) ? temp.list : [];
                    temp.showTable = temp.productList.length;
                    temp.tableData = temp.productList;

                    return {
                        eventId: temp.id || 0,
                        eventTime: temp.createTime || 0,
                        eventContent: temp.currentUrl || ' ',
                        mergeList: [temp],
                        showDetail: false
                    };
                });
            }
        },
        watch: {
            row: {
                handler: function() {
                    this.getTimelineNew(true);
                },
                deep: true,
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    @import './visitor-detail.less';

    .item-table {
        border-top: 1px dashed #e6e6e6;

        .ivu-table-wrapper {
            border: none;
            padding-top: 10px;

            .ivu-table:before {
                height: 0px;
                color: #cbd6e2;
                background-color: #ffffff;
            }

            .ivu-table:after {
                width: 0px;
            }

            .ivu-table {
                th {
                    background-color: #ffffff;
                }

                a {
                    color: #3b78de;
                }

                a:hover {
                    color: #2d63bc;
                    text-decoration: underline;
                }
            }
        }
    }

    .timeline-no-more-tip {
        text-align: center;
        font-size: 12px;
    }
</style>
