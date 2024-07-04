<!-- 通用时间轴组件 -->
<template>
    <div class="timeLine-container index-timeLine-container">
        <template>
            <!-- Tab 切换时间轴 -->
            <Tabs v-model="currentTab">
                <!-- 全部 -->
                <TabPane name="all"
                        :label="$t('timeLine.All')"
                        class="pane">
                    <span slot="label">
                        <span>{{ $t('timeLine.All') }}</span>
                        <Poptip>
                            <Icon slot="reference"
                                custom="custom-menu-arrow"
                                color="#7B98B6"
                                size="10"
                                style="cursor: pointer;margin: 0 3px;"></Icon>
                            <div>
                                <!-- 全选 -->
                                <Checkbox :value="allChecked_all"
                                        :indeterminate="indeterminate_all"
                                        @change="checkAll_all($event, true)"
                                        style="padding: 6px 8px">{{ $t('timeLine.All') }}</Checkbox>
                                <!-- 各时间轴 -->
                                <CheckboxGroup :value="group_all"
                                            @input="changeGroup_all($event, true)"
                                            style="padding: 2px">
                                    <template v-for="item in all_category">
                                        <Checkbox :key="item.label"
                                                :label="item.eventCategory"
                                                style="padding: 6px">{{ item.label }}</Checkbox><br>
                                    </template>
                                </CheckboxGroup>
                            </div>
                        </Poptip>
                    </span>
                </TabPane>

                <!-- 各轴 -->
                <template v-if="all_category.length">
                    <TabPane v-for="item in all_category"
                            :key="item.name"
                            :name="item.name"
                            :label="item.label"
                            class="pane">
                        <span slot="label">
                            <!-- 跟进 -->
                            <template v-if="`${item.eventCategory}` === '1'">
                                <span>{{`${item.label}    ${item.totalCount}`}}</span>
                                <!-- 线索时间轴没有跟进记录类型筛选, 其他时间轴有 -->
                                <Poptip v-if="type !== 'clue'">
                                    <Icon slot="reference"
                                        custom="custom-menu-arrow"
                                        color="#7B98B6"
                                        size="10"
                                        style="cursor: pointer;margin: 0 3px;"></Icon>
                                    <div>
                                        <!-- 全选 -->
                                        <Checkbox :value="allChecked_followup"
                                                :indeterminate="indeterminate_followup"
                                                @change="checkAll_followup($event, true)"
                                                style="padding: 6px 8px;margin: 0;">{{ $t('timeLine.All') }}</Checkbox>
                                        <!-- 总数 -->
                                        <span style="position: absolute;right: 0;display: inline-block;padding-top: 6px;margin-right: 15px;font-size: 14px;">{{item.totalCount}}</span><br>

                                        <!-- 各跟进类型 -->
                                        <CheckboxGroup :value="group_followup"
                                                    @input="changeGroup_followup($event, true)"
                                                    style="position: relative;padding: 2px">
                                            <template v-if="countObj_followup">
                                                <template v-for="item in arr_followupType">
                                                    <template v-if="countObj_followup.hasOwnProperty(Number(item.value))">
                                                        <Checkbox :key="Number(item.value)"
                                                                :label="`${Number(item.value)}`"
                                                                style="padding: 6px">{{ item.label }}</Checkbox>
                                                        <span style="position: absolute;right: 0;display: inline-block;padding-top: 6px;margin-right: 3px;font-size: 14px;">{{ countObj_followup[Number(item.value)] }}</span><br>
                                                    </template>
                                                </template>
                                            </template>
                                        </CheckboxGroup>
                                    </div>
                                </Poptip>
                            </template>
                            <!-- 邮件 -->
                            <template v-else-if="`${item.eventCategory}` === '2'">
                                <!-- 后端说线索时间轴还有问题, 让先去掉收发件数量和下拉筛选 -->
                                <span v-if="type === 'clue'">
                                    <span>{{ item ? `${item.label}    ${item.totalCount}` : $t('timeLine.mail') }}</span>
                                </span>
                                <!-- 非线索时间轴正常显示收发件数量和下拉筛选 -->
                                <span v-else>
                                    <span>{{ item ? `${item.label}(${$t('timeLine.received')}${item.receive}/${$t('timeLine.sent')}${item.send})` : $t('timeLine.mail') }}</span>
                                    <Poptip>
                                        <Icon slot="reference"
                                            custom="custom-menu-arrow"
                                            color="#7B98B6"
                                            size="10"
                                            style="cursor: pointer;margin: 0 3px;"></Icon>
                                        <div style="font-size:12px">
                                            <RadioGroup v-model="group_mail"
                                                        @change="changeGroup_mail"
                                                        class="mail-radioGroup">
                                                <!-- 全选 -->
                                                <Radio label="all">{{ $t('all') }}</Radio>
                                                <br>
                                                <!-- 各联系人 -->
                                                <template v-for="[key, value] in Object.entries(countObj_mail)">
                                                    <Radio :key="key"
                                                        :label="key"> {{ `${value.name ? value.name : $t('timeLine.unknown')}  (${$t('timeLine.received')}${value.receive}/${$t('timeLine.sent')}${value.send})` }}</Radio>
                                                    <br />
                                                </template>
                                            </RadioGroup>
                                        </div>
                                    </Poptip>
                                </span>
                            </template>
                            <!-- EDM -->
                            <!-- <template v-else-if="`${item.eventCategory}` === EDMEventCategory">
                                <span>{{`${item.label}    ${item.totalCount}`}}</span>
                                <Poptip >
                                        <Icon slot="reference"
                                            custom="custom-menu-arrow"
                                            color="#7B98B6"
                                            size="10"
                                            style="cursor: pointer;margin: 0 3px;"></Icon>
                                        <div style="font-size:12px">
                                            <RadioGroup v-model="group_edm"
                                                        @change="changeGroup_edm"
                                                        class="mail-radioGroup">
                                                <Radio label="all">{{ $t('all') }}</Radio>
                                                <br />
                                                <template v-for="[key, value] in Object.entries(countObjEDM)">
                                                    <Radio :key="key"
                                                        :label="key">{{ `${value.name}    ${value.totalCount}`}}</Radio>
                                                    <br />
                                                </template>
                                            </RadioGroup>
                                        </div>
                                    </Poptip>
                            </template> -->
                            <!-- 网站交互 -->
                            <!-- facebook -->
                            <!-- 来源 -->
                            <!-- WhatsApp -->
                            <!-- Instagram -->
                            <template v-else-if="['3', '4', '5', '6', '7', '8', '9'].includes(`${item.eventCategory}`)">
                                <span>{{`${item.label}    ${item.totalCount}`}}</span>
                            </template>
                            <template v-else-if="`${item.eventCategory}` === '10'">
                                <span>{{`${item.label}（${$t('timeLine.callIn')}${item.description[0].totalCount}/${$t('timeLine.callOut')}${item.description[1].totalCount}）`}}</span>
                            </template>
                            <!-- 其他/默认情况 -->
                            <template v-else>{{ item.label }}</template>
                        </span>
                    </TabPane>
                </template>
            </Tabs>
            <div class="timeline_filter" v-if="!fromType">
                <div>
                    <!-- 旅程重建 -->
                    <div v-if="type === 'customer' && authorized_button['rebuildTimeline'] && originalType !== 'highseasCustomer'"
                        @click="checkReconstruction"
                        class="_f _a_c"
                        :style="`font-size: 14px;width: ${['mail', 'mail_detail', 'whatsApp'].includes(from) ? '20px' : 'auto'};text-align: right;cursor: ${rebuilding ? 'not-allowed;' : 'pointer'};`">
                        <Icon size="14" custom="custom-icon_update" :style="`color: ${rebuilding ? 'rgba(0, 0, 0, 0.4);' : '#3B78DE'};`" />
                        <span :style="`color: ${rebuilding ? 'rgba(0, 0, 0, 0.4);' : '#3B78DE'};margin-left: 4px;`" v-if="!['mail', 'mail_detail', 'whatsApp'].includes(from)" :title="reconstructionTip">{{ $dym.characterOmitStr(reconstructionTip, 8) }}</span>
                    </div>
                </div>
                <!-- 相关筛选 -->
                <div class="_f _r _j_e _a_c">
                    <!-- WhatsApp正文提示的icon -->
                    <HelpTip
                        v-if="['clue', 'highseasCustomer', 'customer', 'inquiry', 'contact','customerColumns','customerDetail'].includes(originalType)&&currentTab === 'WhatsApp'"
                        :title="$t('helpTip.waTextTip')"
                        style="font-size: 14px;"
                        ></HelpTip>
                    <Search
                        v-if="currentTab === 'Remarks' || currentTab === 'Followup'"
                        ref="FollowupSearch"
                        type="timeline"
                        :parentValue="followUpContent"
                        :holderText="$t('crm.newDetail.tip_FollowUp')"
                        :showText="$t('traffic.search')"
                        :width="230"
                        :delayTime="100"
                        :maxlength="300"
                        :mini="true"
                        @change-keyword="changeFollowUpContent"
                        @press-enter="handleSearchFollowUpContent"
                        class="text-right">
                    </Search>
                    <Search
                        v-if="isShowEmailSearch"
                        ref="EmailSearch"
                        type="timeline"
                        :parentValue="keyword"
                        :holderText="$t('crm.newDetail.tip_timeLineSearch')"
                        :showText="$t('traffic.search')"
                        :width="230"
                        :delayTime="100"
                        :maxlength="300"
                        :mini="true"
                        @change-keyword="changeKeyword"
                        @press-enter="handleSearch"
                        class="text-right">
                    </Search>
                    <Poptip
                        placement="bottom-end"
                        width="320"
                        ref="timelinePoptip"
                        popper-class="timelinePoptipContent">
                        <span slot="reference" class="timelinePoptipIcon">
                            <Icon size="14" custom="custom-document-filter"/>{{$t('crm.newDetail.advanceFilter')}}
                        </span>
                        <div class="timelinePoptip">
                            <Form label-width="90px"
                                label-position="left">
                                <FormItem :label="$t('crm.Html.date')">
                                    <DatePicker
                                        v-model="date"
                                        type="daterange"
                                        :picker-options="options"
                                        value-format="yyyy-MM-dd"
                                        :start-placeholder="$t('startDate')"
                                        :end-placeholder="$t('endDate')"
                                        placement="bottom-start"
                                        style="width: 100%"
                                        class="timeline__filter_date"></DatePicker>
                                </FormItem>
                                <template v-if="['customer', 'inquiry', 'contact','customerColumns','customerDetail'].includes(originalType)">
                                    <FormItem :label="$t('crm.Table.publisher')"
                                        v-if="currentTab !== 'Instagram' && currentTab !== 'web-line' && currentTab !== 'FacebookInteraction'">
                                        <Select v-model="publisher" filterable clearable :placeholder="$t('crm.Table.publisher')">
                                            <Option v-for="(item,index) in publisherList"
                                                    :key="`${item} + ${index}`"
                                                    :label="item"
                                                    :value="item"></Option>

                                        </Select>
                                    </FormItem>
                                    <FormItem :label="$t('crm.Table.contactsName')"
                                        v-if="currentTab !== 'Followup'">
                                        <Select v-model="contactsName" filterable clearable :placeholder="$t('crm.Table.contactsName')">
                                            <Option v-for="(item,index) in contactsNameList"
                                                    :key="`${item} + ${index}`"
                                                    :label="item"
                                                    :value="item"></Option>
                                        </Select>
                                    </FormItem>
                                </template>
                                <template v-if="currentTab === 'Mail'">
                                    <FormItem :label="$t('crm.newDetail.module_inOutGoingMail')" style="margin-bottom: 0">
                                        <CheckboxGroup v-model="mailType" class="_remove_active_color timeline__filter__mailType">
                                            <Checkbox :label="2">{{ $t('mail.receiveLetter') }}</Checkbox>
                                            <Checkbox :label="1">{{ $t('mail.sendLetter') }}</Checkbox>
                                        </CheckboxGroup>
                                    </FormItem>
                                </template>
                                <!-- 通话呼入呼出类型筛选 -->
                                <template v-if="currentTab === 'call'">
                                    <FormItem :label="$t('crm.newDetail.module_callRecords')" style="margin-bottom: 0">
                                        <CheckboxGroup v-model="callType"
                                                    class="_remove_active_color timeline__filter__mailType">
                                            <Checkbox :label="0">{{$t('timeLine.callIn')}}</Checkbox>
                                            <Checkbox :label="1">{{$t('timeLine.callOut')}}</Checkbox>
                                        </CheckboxGroup>
                                    </FormItem>
                                </template>
                            </Form>
                            <div class="timelinePoptipBottom">
                                <Button @click="timelineClear" type="minor" size="small">{{$t('crm.Table.clear')}}</Button>
                                <Button type="success" size="small" @click="timelineSearch">{{ $t('globalSearch.quickSearch') }}</Button>
                            </div>
                        </div>
                    </Poptip>
                </div>
            </div>
        </template>

        <!-- 时间轴 -->
        <CompleteTimeLine :id="id"
                          ref="CompleteTimeLine"
                          :disabled="disabled"
                          :type="type"
                          :currentTab="currentTab"
                          :visitorId="visitorId"
                          :fromType="fromType"
                          :originalType="originalType"
                          :keyword="keyword"
                          :followUpContent="followUpContent"
                          :date="date"
                          :publisher="publisher"
                          :contactsName="contactsName"
                          :fieldObj="fieldObj"
                          :group="group_all"
                          :group_followup="group_followup"
                          :group_mail="group_mail"
                          :group_edm="group_edm"
                          :countObj_mail.sync="countObj_mail"
                          :countObjEDM.sync="countObjEDM"
                          :EDMEventCategory="EDMEventCategory"
                          :mailType.sync="mailType"
                          :callType.sync="callType"
                          :allChecked="allChecked"
                          :flag="flag"
                          :isScroll="isScroll"
                          :refreshFlag="refreshFlag"
                          :clearFlag="clearFlag"
                          :isMailSearching="isMailSearching"
                          @editFollowup="editFollowup"
                          @viewContact="viewContact"
                          @viewInquiry="viewInquiry"
                          @viewClue="viewClue"
                          @updateMailCount="updateMailCount"
                          @updateEDMCount="updateEDMCount"
                          @updateCategoryList="updateCategoryList"
                          :style="timeLineStyleObj"></CompleteTimeLine>

        <!--  隐藏的元素，用于crm详情页滚动时，关闭页面中已经打开的popper -->
        <span style="visibility: hidden;" class="click-close-popper"></span>

        <Modal
                :visible.sync="reconstructionVisible"
                :modal-append-to-body="false"
                width="488px"
                :close-on-click-modal="false">
            <p slot="title" style="font-weight:bold;">
                {{ $t('crm.newDetail.sureRebuildJourney') }}
            </p>
            <div style="color: rgba(0, 0, 0, 0.8);">
                <p>{{ $t('crm.newDetail.journeyRebuildTip') }}</p>
                <p>{{ $t('crm.newDetail.journeyRebuildTipContent') }}</p>
            </div>
            <div slot="footer">
                <Button @click="reconstructionVisible = false">{{$t('cancel')}}</Button>
                <Button type="primary" @click="journeyReconstruction">{{$t('confirm')}}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import Search from '@/views/main-components/search-input/search-input';
    import CompleteTimeLine from '@/views/main-components/timeline/completeTimeLine.vue';
    import timeline from '@/api/timeline';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    const { getContactsAndPublisher } = timeline;

    export default {
        name: 'time_line',
        components: {
            Search,
            CompleteTimeLine
        },
        props: [
            'visitorId',
            'id',
            'flag', // 父组件刷新子组件的标志
            'type', // 从哪进入详情: inquiry：询盘；customer & highseasCustomer：客户；contact：联系人
            'fromType',
            'originalType', // 原始 type , 标识是从哪个模块进入时间轴的, 也有可能不会传值进来
            'disabled', // CRM 跟进记录传入, 表示是否显示跟进记录评论框
            'visible_full_panel', // 是否展开跟进记录框
            'isScroll', // 客户旅程滚动后通知下
            'from'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                followUpType: (state) => state.crm.followUpType, // 跟进方式
                window_height: 'window_height',
                button_list: state => state.app.button_list,
                rebuild_timeline_flag: (state) => state.crm.rebuild_timeline_flag
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            allChecked() {
                switch (this.currentTab) {
                    case 'all':
                        return this.allChecked_all;
                    case 'Followup':
                        return this.allChecked_followup;
                }
                return true;
            },
            isShowEmailSearch() {
                let _show = false;
                switch (this.currentTab) {
                    case 'all':
                        if (this.all_category.find((item) => item.eventCategory === '2')) {
                            _show = true;
                        } else {
                            _show = false;
                        }
                        break;
                    case 'Mail':
                        _show = true;
                        break;
                    case 'EDM':
                        _show = true;
                        break;
                    default:
                        _show = false;
                        break;
                }
                return _show;
                // return ['all', 'Mail', 'EDM'].includes(currentTab);
            },
            timelineSearchGTMClasses() {
                switch (this.type) {
                    case 'inquiry':
                        return 'piwik_timeline_search_inquiry';
                    case 'customer':
                    case 'highseasCustomer':
                        return 'piwik_timeline_search_customer';
                    case 'contact':
                        return 'piwik_timeline_search_contact';
                    case 'clue':
                        return 'piwik_timeline_search_clue';
                    default:
                        return 'piwik_timeline_search-unknown';
                }
            },
            // 时间轴样式对象
            // 主要是 height , 时间轴因为滚动加载, 必须显示指定 height (ps: 也可以通过样式来调整, 之前就用 flex 调过)
            timeLineStyleObj() {
                // 时间轴距离视口顶部的高度, 单位:px
                let topHeight = 0;
                // 根据侧滑页类型的不同, 估算其时间轴距离顶部的距离
                switch (this.type) {
                    case 'customer':
                        if (this.originalType === 'customerColumns') {
                            topHeight = this.isScroll ? 355 : 520;
                            // topHeight = this.isScroll ? 335 : 500;
                        } else if (this.originalType === 'customerDetail') {
                            topHeight = this.isScroll ? 245 : 410;
                            // topHeight = this.isScroll ? 215 : 380;
                        } else if (this.originalType === 'clue') {
                            topHeight = 300;
                        } else {
                            topHeight = 350;
                        }
                        break;
                    case 'highseasCustomer':
                        // topHeight = this.isScroll ? 172 : 336;
                        topHeight = this.isScroll ? 200 : 350;
                        break;
                    case 'inquiry':
                        if (['xhl-chat', 'visitorHistory'].includes(this.originalType)) {
                            topHeight = 370;
                        } else {
                            topHeight = 430;
                        }
                        break;
                    case 'clue':
                        if (this.originalType === 'highseasClue') {
                            topHeight = 300;
                        } else {
                            topHeight = 350;
                        }
                        break;
                    default:
                        topHeight = 370;
                        break;
                }
                // 如果展开了跟进记录框, 还要减去跟进记录框新增的高度
                if (this.visible_full_panel) {
                    if (this.type === 'clue') {
                        topHeight += 120;
                    } else {
                        topHeight += 220;
                    }
                }
                const height = this.window_height - 46 - topHeight;
                // 返回结果
                return {
                    height: `${height}px`
                };
            },
            authorized_button() {
                const ids = BUTTON_IDS.CRM.customer;
                return {
                    rebuildTimeline: !HANDLE_BUTTON(ids.edit.rebuildTimeline, this.button_list)
                };
            }
        },
        data() {
            return {
                /* 全局 */
                fieldObj: {},

                // 日期
                date: [],
                options: {
                    shortcuts: [
                        {
                            text: this.$t('datepicker.today'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tswk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() -
                                    (start.getDay() - 1) * 24 * 60 *
                                    60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltwk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(end.getTime() - end.getDay() * 24 *
                                    60 * 60 * 1000);
                                start.setTime(start.getTime() -
                                    (start.getDay() + 6) * 24 * 60 *
                                    60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tsmt'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltmt'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() -
                                    24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() -
                                    1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ],
                    disabledDate(date) {
                        return date.valueOf() > Date.now();
                    }
                },

                /* Tab */
                // Tab 相关
                all_category: [],
                currentTab: 'all',
                // label 渲染
                allChecked_all: false,
                indeterminate_all: false,
                group_all: [], // 全部下拉中选中模块的 eventCategory
                countObj_followup: null, // 存放跟进记录分类 + 对应数量, typeId: count
                allChecked_followup: false,
                indeterminate_followup: false,
                group_followup: [], // 勾选中的跟进记录分类
                countObj_mail: {}, // {contactId: {name, receive, send}}
                countObjEDM: {}, // edm 下拉窗数据
                group_mail: 'all', // [contactId...]
                group_edm: 'all',
                EDMEventCategory: '-1',
                mailType: [1, 2], // 1 发件 2 收件
                callType: [0, 1], // 1 呼出 0 呼入
                keyword: '', // 单客户搜索关键词
                // 邮件搜索中
                isMailSearching: false,

                /* 时间轴 */
                // 控制时间轴是否刷新
                refreshFlag: false,
                // 控制时间轴清空
                clearFlag: false,
                publisher: '', // 发布人筛选
                contactsName: '', // 联系人筛选
                followUpContent: '',
                // 发布人列表
                publisherList: [],
                // 联系人列表
                contactsNameList: [],
                arr_followupType: [],
                reconstructionTip: this.$t('crm.newDetail.JourneyRebuild'),
                rebuilding: false,
                reconstructionVisible: false
            };
        },
        methods: {
            // 旅程重建
            checkReconstruction() {
                if (this.rebuilding) {
                    return;
                }
                this.$commonApi.journeyIsRebuild({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    userName: this.fullName,
                    companyId: this.id
                }).then((res) => {
                    if (res.code === '1') {
                        this.reconstructionVisible = true;
                    } else {
                        this.$Message.warning(this.$t('crm.newDetail.journeyRebuildingTip'));
                        this.reconstructionTip = this.$t('crm.newDetail.rebuilding');
                        this.rebuilding = true;
                    }
                }).catch(() => {
                    this.$message.error('请求失败！');
                });
            },
            journeyReconstruction() {
                this.reconstructionTip = this.$t('crm.newDetail.rebuilding');
                this.rebuilding = true;
                this.reconstructionVisible = false;
                this.$commonApi.journeyRebuild({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    userName: this.fullName,
                    companyId: this.id
                }).then((res) => {
                    if (res.code === '1') {
                        if (res.data.isRebuild === 2) {
                            this.$Message.warning('暂无需要重建的客户旅程');
                            this.rebuilding = false;
                            this.reconstructionTip = this.$t('crm.newDetail.JourneyRebuild');
                        }
                    } else {
                        this.rebuilding = false;
                        this.reconstructionTip = this.$t('crm.newDetail.JourneyRebuild');
                        this.$message.error('请求失败');
                    }
                }).catch(() => {
                    this.rebuilding = false;
                    this.reconstructionTip = this.$t('crm.newDetail.JourneyRebuild');
                    this.$message.error('请求失败！');
                });
            },
            // 清空筛选
            clearFilter() {
                this.keyword = ''; // 单客户搜索关键词
                this.date = null;
                this.mailType = [1, 2]; // 1 发件 2 收件
                this.callType = [0, 1]; // 1 呼出 0 呼入
                this.publisher = ''; // 发布人
                this.contactsName = ''; // 联系人
            },
            /* 全局 */
            // 请求获得字段对应的信息
            getXSShow() {
                // this.$commonApi.getXSShow
                // util.ajax({
                //     url: '/form-cust/form/getXSShow',
                //     method: 'post',
                //     data: {
                //         orgId: this.enterpriseId
                //     }
                // }).then(ret => {
                //     if (ret.data.code === '1') {
                //         this.fieldObj = ret.data.data.show;
                //     }
                // });
                this.$commonApi.getXSShow({
                    orgId: this.enterpriseId
                }).then(ret => {
                    if (ret.code === '1') {
                        this.fieldObj = ret.data.show;
                    }
                });
            },
            // 弹出询盘详情
            viewInquiry(inquiryId) {
                this.$emit('viewInquiry', inquiryId);
            },
            // 弹出联系人详情
            async viewContact(item) {
                // 无"我的联系人"页面权限, 退出流程
                if (!this.isContainsMenu('myContact')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noContactsMenuAuthority'));
                    return;
                }

                // 无 contactsId , 退出流程
                if (!item.contactsId || item.contactsId === -1 || item.contactsId === '-1') {
                    this.$Message.warning(this.$t('crm.Modal.error_noneUserInfo'));
                    return false;
                }

                // 查询该联系人 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Contact',
                    id: item.contactsId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海联系人
                if (authorized === 'highseas') {
                    if (this.isContainsMenu('highseasCustomer')) {
                        // 如果有公海目录权限

                        /**
                         * @Description: 注释掉所有打开侧滑页的操作, 改为新窗口打开客户详情页
                         * @author 汤一飞
                         * @date 2021/1/4
                         */
                        // // 获取联系人关联的询盘 Id
                        // const inquiryId = item.inquiryId || ((item.eventCustomVar && item.eventCustomVar.inquiryId) ? item.eventCustomVar.inquiryId : undefined);
                        // if (inquiryId) {
                        //     // 如果有询盘 id , 则按照全局搜索功能的逻辑来 --- "先跳转到公海, 打开公海询盘详情, 再打开公海询盘详情下的联系人详情"
                        //     localStorage.setItem('leadsCloud-inquiryId', inquiryId);
                        //     localStorage.setItem('leadsCloud-contactId', item.contactsId);
                        //     localStorage.setItem('leadsCloud-globalSearchViewType', 'highSeaContact');
                        //     const href = window.location.origin + window.location.pathname + this.$rootRouter.resolve({
                        //         name: 'highseasCustomer'
                        //     }).href;
                        //     window.open(href, '_blank');
                        //     return;
                        // }
                        // // 没有询盘 Id , 还是正常打开联系人页面吧, 至少保证用户能看到联系人详情页

                        if (item.companyId) {
                            this.$viewHighSeasCustomer(item.companyId);
                        } else {
                            this.$Message.error(this.$t('crm.WorkBench.error_companyId'));
                        }
                    } else {
                        // 没有"公海客户"页面权限, 弹出提示
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                        return;
                    }
                }

                // 新窗口打开联系人详情页
                localStorage.setItem('leadsCloud-contactId', item.contactsId);
                window.open(this.$rootRouter.resolve({
                    name: 'myContact'
                }).href, '_blank');
            },
            // 弹出线索详情
            async viewClue(clueId) {
                // 校验是否有线索目录权限
                if (!this.isContainsMenu('my_clue')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noMenuAuthority'));
                    return;
                }
                // 关联来的 可能没有线索id
                if (!clueId) {
                    this.$Message.warning(this.$t('crm.Modal.error_noneUserInfo'));
                    return;
                }
                // 校验是否有该条线索管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Clue',
                    id: clueId
                });
                if (!authorized) return;
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpClueInHighseas'));
                    return;
                }

                // 校验通过, 新标签页打开线索详情
                localStorage.setItem('leadsCloud-clueId', clueId);
                window.open(this.$rootRouter.resolve({
                    name: 'my_clue'
                }).href, '_blank');
            },
            // 编辑跟进记录
            editFollowup(data) {
                this.$emit('editFollowup', data);
            },

            /* Tabs */
            // 更新顶部标签
            updateCategoryList(arr = []) {
                // 更新跟进记录统计数据
                this.updateFollowupCount(arr);
                // 否则正常更新邮件分组
                const countObj = {};
                const edmCountObj = {};
                const mailLine = arr.find(item => item.type === '2');
                // 获取edm Tab
                // const edmLine = arr.find(item => item.type === this.EDMEventCategory);
                if (mailLine && mailLine.detail) {
                    mailLine.detail.map(i => {
                        const obj = {};
                        // 修改邮件名字为“手动归档邮件”
                        obj.name = i.typeName === '手动归并邮件' ? this.$t('mail.title_mailArchive') : i.typeName;
                        if (i.description && Array.isArray(i.description)) {
                            i.description.map(i => {
                                if (i.type === '2') {
                                    obj.receive = i.totalCount;
                                }
                                if (i.type === '1') {
                                    obj.send = i.totalCount;
                                }
                            });
                            countObj[i.type] = obj;
                        }
                    });
                }
                // 更新邮件分组
                if (JSON.stringify(this.countObj_mail) !== JSON.stringify(countObj)) {
                    this.countObj_mail = countObj;
                }

                // if (edmLine && edmLine.detail) {
                //     edmLine.detail.forEach(item =>{
                //         const obj = {};
                //         obj.name = item.typeName;
                //         obj.totalCount = item.totalCount;
                //         edmCountObj[item.type] = obj;
                //     })
                // }
                // // 更新EDM分组
                // if (JSON.stringify(this.countObjEDM) !== JSON.stringify(edmCountObj)) {
                //     this.countObjEDM = edmCountObj;
                // }
                // 存储更新之前的时间轴分类数组
                const prevEventCategories = this.all_category.map(item => item.eventCategory);
                // 存储更新之前的邮件时间轴的顶部收发总数
                const mailCate = this.all_category.find(item => item.name === 'Mail') || { receive: '', send: '', totalCount: '' };
                const { receive, send, totalCount } = mailCate;
                // 更新时间轴分类和统计数字
                this.all_category = arr.map(item => {
                    switch (item.type) {
                        case '1':
                            if (this.type === 'clue' || item.eventAction == 4) {
                                item.label = this.$t('clue.clueRemark');
                                item.name = 'Remarks';
                            } else {
                                item.label = this.$t('timeLine.followUp');
                                item.name = 'Followup';
                            }
                            break;
                        case '2':
                            // case this.EDMEventCategory:
                            // item.label = item.type===this.EDMEventCategory ? 'EDM' : this.$t('timeLine.mail');
                            // item.name = item.type===this.EDMEventCategory ? 'EDM' : 'Mail';
                            item.label = this.$t('timeLine.mail');
                            item.name = 'Mail';
                            if (this.isMailSearching) {
                                // 如果是邮件筛选状态, 则不能更新顶部邮件收发总数, 因为邮件关键词筛选不是用的正常的筛选接口, 当前接口返回的数据并不准确, 由 all-line 和 mail-line 执行 updateMailCount 即可
                                item.receive = receive;
                                item.send = send;
                                item.totalCount = totalCount;
                            } else {
                                // if (item.type ==='2') {
                                // 否则以接口返回数据正常更新顶部邮件收发总数
                                item.description.map(i => {
                                    if (i.type === '2') {
                                        item.receive = i.totalCount;
                                    }
                                    if (i.type === '1') {
                                        item.send = i.totalCount;
                                    }
                                });
                                // }
                            }
                            break;
                        case '3':
                            item.label = this.$t('timeLine.webLine');
                            item.name = 'web-line';
                            break;
                        case '4':
                            item.label = this.$t('timeLine.interaction');
                            item.name = 'FacebookInteraction';
                            break;
                        case '5':
                            item.label = this.$t('timeLine.source');
                            item.name = 'ClueInquiry';
                            break;
                        case '6':
                            item.label = this.$t('timeLine.whatsApp');
                            item.name = 'WhatsApp';
                            break;
                        case '8':
                            item.label = '企微';
                            item.name = 'weChat';
                            break;
                        case '7':
                            item.label = this.$t('timeLine.instagram');
                            item.name = 'Instagram';
                            break;
                        case '9':
                            item.label = this.$t('timeLine.message');
                            item.name = 'message';
                            break;
                        case '10':
                            item.label = this.$t('timeLine.call');
                            item.name = 'call';
                            break;
                    }
                    item.eventCategory = item.type; // 为了尽量少改动就延续之前eventCategory的使用
                    return item;
                }).filter(item => !(!item || item === ''));

                // 存储更新之后的时间轴分类数组
                const nowEventCategories = this.all_category.map(item => item.eventCategory);

                // 如果时间轴分类不为空, 且是可筛选分类时间轴, 则需要更新 group_all
                if (nowEventCategories.length) {
                    // 获取 group_all 和当前分类重合的部分
                    const checked_category = this.group_all.filter(item => nowEventCategories.includes(item));

                    if (!checked_category.length) {
                        // 如果没有重合的分类, 直接全选
                        this.allChecked_all = true;
                        this.indeterminate_all = false;
                        this.changeGroup_all(nowEventCategories);
                    } else {
                        // 如果有重合部分

                        // 暂存新增分类
                        const new_category = nowEventCategories.filter(item => !prevEventCategories.includes(item));

                        // 去掉 group_all 中已不存在的分类, 并追加新增的分类
                        // 这里先置空再选中, 是因为筛选时间刷新时间轴时, 如果把本来有的模块筛没了, 勾选会显示出错---数据是对的, 但是多个选项情况下, 最后一个选项不显示选中(实际是选中的, 只是不显示对勾符号)
                        this.group_all = [];
                        this.$nextTick(() => {
                            // 重合分类和新增分类合并后选中
                            this.changeGroup_all([...new Set(checked_category.concat(new_category))]);
                        });
                    }
                }

                // 检查 currentTab 是否已经没有值, 若无值则自动切到 currentTab
                if (this.currentTab !== 'all' && !this.all_category.find(item => item.name === this.currentTab)) {
                    this.currentTab = 'all';
                }
            },
            // 更新跟进记录统计数据
            updateFollowupCount(arr = []) {
                // 计算得到新的 countObj_followup
                const countObj = {};
                const followupLine = arr.find(item => item.type === '1');
                if (followupLine) {
                    followupLine.detail.forEach(item => {
                        countObj[item.type] = item.totalCount;
                    });
                }
                // 更新 countObj_followup , 更新 group_followup
                if (JSON.stringify(this.countObj_followup) !== JSON.stringify(countObj)) {
                    // 暂存更新之前的跟进记录统计数据
                    const oldTypes = this.countObj_followup ? Object.keys(this.countObj_followup) : [];

                    // 更新跟进记录统计数据
                    this.countObj_followup = countObj;

                    // 暂存更新之后的跟进记录统计数据
                    const newTypes = Object.keys(this.countObj_followup);

                    // 新增的 followupType
                    const type_new = newTypes.filter(item => !oldTypes.find(key => item === key));
                    // 去除已经不在 followupTypes 数组中的项
                    const temp = this.group_followup.filter(item => newTypes.find(key => item === key));

                    if (!this.group_followup.length) {
                        // 之前跟进类型下拉列表为空, 则选中更新后的跟进记录数组
                        // 更新数组, 可能有数据也可能为空, 目前后端有问题, 偶尔返回空数组, 导致初始加载时间轴时筛选项为空 + 全选未选中, 所以此处哪怕为空也要 change 选择一下, 确保此情况下全选框初始状态为选中
                        if (oldTypes.length === 0) {
                            this.group_followup = [];
                            this.$nextTick(() => {
                                this.changeGroup_followup(newTypes);
                            });
                        }
                    } else if (type_new.length) {
                        // 之前不为空, 现在有新增类型, 默认勾选上
                        this.group_followup = [];
                        this.$nextTick(() => {
                            this.changeGroup_followup(temp.concat(type_new));
                        });
                    } else if (temp.length !== this.group_followup.length) {
                        // 之前不为空, 也没有新增类型, 筛选前后 length 不等, 说明有类型不再存在, 重新赋值筛选后的数据, 若筛选后为空, 则全选更新后的数据
                        this.group_followup = [];
                        this.$nextTick(() => {
                            this.changeGroup_followup(temp.length ? temp : newTypes);
                        });
                    }
                }
            },
            // 关键词搜索时, 更新邮件数量
            updateMailCount(obj) {
                const mailCate = this.all_category.find(item => item.name === 'Mail');
                if (mailCate) {
                    mailCate.receive = obj.receiveCount;
                    mailCate.send = obj.sendCount;
                    mailCate.totalCount = obj.totalCount;
                }
            },
            // 关键词搜索时, 更新邮件数量
            updateEDMCount(totalCount) {
                this.all_category.forEach(item => {
                    if (item.name === 'EDM') {
                        item.totalCount = totalCount;
                    }
                });
            },
            /* 顶部复选框相关操作 */
            // 全部轴下拉, 全选
            checkAll_all(val, needRefresh) {
                this.allChecked_all = val;
                this.indeterminate_all = false;
                this.group_all = this.allChecked_all ? this.all_category.map(item => item.eventCategory) : [];

                // 条件触发更新时间轴
                if (needRefresh) {
                    val ? (this.refreshFlag = !this.refreshFlag) : (this.clearFlag = !this.clearFlag);
                }
            },
            // 全部轴下拉, 选择/取消选择
            changeGroup_all(group, needRefresh) {
                this.group_all = group;
                if (group.length === this.all_category.length) {
                    this.indeterminate_all = false;
                    this.allChecked_all = true;
                } else if (group.length > 0) {
                    this.indeterminate_all = true;
                    this.allChecked_all = false;
                } else {
                    this.indeterminate_all = false;
                    this.allChecked_all = false;
                }

                // 条件触发更新时间轴
                if (needRefresh) {
                    this.group_all.length ? (this.refreshFlag = !this.refreshFlag) : (this.clearFlag = !this.clearFlag);
                }
            },
            // 跟进记录轴下拉, 全选
            checkAll_followup(val, needRefresh) {
                this.allChecked_followup = val;
                this.indeterminate_followup = false;
                this.group_followup = this.allChecked_followup && this.countObj_followup ? Object.keys(this.countObj_followup) : [];

                // 条件触发更新时间轴
                if (needRefresh) {
                    val ? (this.refreshFlag = !this.refreshFlag) : (this.clearFlag = !this.clearFlag);
                }
            },
            // 跟进记录轴下拉, 选择/取消选择
            changeGroup_followup(group, needRefresh) {
                this.group_followup = group;
                if (this.countObj_followup && group.length === Object.keys(this.countObj_followup).length) {
                    this.indeterminate_followup = false;
                    this.allChecked_followup = true;
                } else if (group.length > 0) {
                    this.indeterminate_followup = true;
                    this.allChecked_followup = false;
                } else {
                    this.indeterminate_followup = false;
                    this.allChecked_followup = false;
                }

                // 条件触发更新时间轴
                if (needRefresh) {
                    this.group_followup.length ? (this.refreshFlag = !this.refreshFlag) : (this.clearFlag = !this.clearFlag);
                }
            },
            // 邮件轴下拉, 选择
            changeGroup_mail() {
                // 条件触发更新时间轴
                this.refreshFlag = !this.refreshFlag;
            },
            // edm轴下拉，选择
            changeGroup_edm() {
                // 条件触发更新时间轴
                this.refreshFlag = !this.refreshFlag;
            },
            /* 时间轴单客户搜索  注：当前仅支持邮件搜索  2020/11/26 */
            handleKeyUpEnter() {
                /* 为了统计邮件搜索的用户使用情况，需要追踪标识加于搜索图标，所以此处为了统计准确，采用模拟搜索图标的点击操作的方式实现回车搜索 */
                this.$refs.timelineKeyWordSearch.click();
            },
            handleFollowUpEnter() {
                /* 为了统计邮件搜索的用户使用情况，需要追踪标识加于搜索图标，所以此处为了统计准确，采用模拟搜索图标的点击操作的方式实现回车搜索 */
                this.$refs.timelineFollowUpSearch.click();
            },
            handleSearch() {
                if (this.keyword) {
                    this.isMailSearching = true;
                    this.refreshFlag = !this.refreshFlag;
                } else {
                    this.$Message.warning('搜索关键词不可为空');
                }
            },
            handleSearchFollowUpContent() {
                if (this.followUpContent) {
                    this.refreshFlag = !this.refreshFlag;
                } else {
                    this.$Message.warning('搜索关键词不可为空');
                }
            },
            handleClearFollowUpContent() {
                this.refreshFlag = !this.refreshFlag;
            },
            // 获取发布人、联系人接口
            getContactsAndPublisher() {
                // 拼装发送数据
                const seasFlag = this.originalType === 'highseasClue' || this.originalType === 'highseasCustomer' ? 1 : 0;
                const data = {
                    orgId: this.enterpriseId,
                    currentUserId: this.userId,
                    seasFlag
                };
                // 如果是客户参数data增加 companyId
                // 如果是询盘参数data增加 inquiryId
                // 如果是联系人参数data增加 contactsId
                this.type === 'customer' ? data.companyId = this.id : null;
                this.type === 'inquiry' ? data.inquiryId = this.id : null;
                this.type === 'contact' ? data.contactsId = this.id : null;
                // util.ajaxJson({
                getContactsAndPublisher(data).then(res => {
                    if (res.code === '1') {
                        this.contactsNameList = res.data.contactsNameList;
                        this.publisherList = res.data.publisherList;
                    }
                });
            },
            changeFollowUpContent(keyword) {
                this.followUpContent = keyword.trim();
            },
            changeKeyword(keyword) {
                this.keyword = keyword.trim();
            },
            timelineClear() {
                this.clearFilter();
                this.$nextTick(() => {
                    this.$refs.CompleteTimeLine.refreshData();
                });
            },
            timelineSearch() {
                if (this.mailType.length === 0) {
                    this.mailType = [1, 2];
                }
                this.$refs.CompleteTimeLine.refreshData();
                this.$refs.timelinePoptip.doClose();
            }
        },
        created() {
            // 获取跟进方式数据
            this.$store.dispatch('getFollowUpType');
        },
        watch: {
            rebuild_timeline_flag: {
                handler(val) {
                    if (Number(val.msgData.companyId) === Number(this.id)) {
                        this.$refs.CompleteTimeLine.refreshData();
                        this.$nextTick(() => {
                            this.$Message.success(this.$t('crm.newDetail.JourneyRebuildComplete'));
                            this.reconstructionTip = this.$t('crm.newDetail.JourneyRebuild');
                            this.rebuilding = false;
                        });
                    }
                },
                deep: true
            },
            followUpType: {
                handler(val) {
                    if (val) {
                        this.arr_followupType = val;
                    }
                }
            },
            currentTab(val) {
                // 切换 tab 清空 发布人、联系人
                this.publisher = '';
                this.contactsName = '';

                // 如果当前显示轴不包括邮件, 则去掉邮件内容筛选
                if (!['all', 'Mail', 'EDM'].includes(val)) {
                    this.keyword = '';
                }

                if (val) {
                    // 恢复邮件轴 EDM下拉多选为全选中
                    this.group_mail = 'all';
                    this.group_edm = 'all';
                }
                // 客户分屏 客户详情页 要通知监听滚动事件
                if (this.type === 'customer') {
                    this.$emit('change_time_line');
                }
            },
            countObj_mail(val) {
                if (val && this.group_mail !== 'all' && !val.hasOwnProperty(this.group_mail)) {
                    // 如果当前筛选条件不在筛选列表中, 则重置筛选条件为"全部"
                    this.group_mail = 'all';

                    // 条件更新时间轴
                    this.refreshFlag = !this.refreshFlag;
                }
            },
            // countObjEDM(val) {
            //     if (val && this.group_edm !== 'all' && !val.hasOwnProperty(this.group_edm)) {
            //         // 如果当前筛选条件不在筛选列表中, 则重置筛选条件为"全部"
            //         this.group_edm = 'all';

            //         // 条件更新时间轴
            //         this.refreshFlag = !this.refreshFlag;
            //     }
            // },
            keyword: {
                handler(val) {
                    if (!val && this.isMailSearching) {
                        // 邮件搜索词清空, 退出邮件筛选状态
                        this.isMailSearching = false;
                        this.refreshFlag = !this.refreshFlag;
                    }
                }
            },
            followUpContent: {
                handler(val) {
                    if (!val) {
                        this.refreshFlag = !this.refreshFlag;
                    }
                }
            },
            // 客户分屏 切换客户 要清空上次的筛选项
            id: {
                handler(val) {
                    this.clearFilter();
                    if (val) {
                        this.getXSShow();
                        this.currentTab = 'all';
                        if (['customer', 'inquiry', 'contact', 'customerColumns', 'customerDetail'].includes(this.originalType)) {
                            this.getContactsAndPublisher();
                        }
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    .timeline_filter {
        height: 34px;
        margin: 2px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .rounded-input {
            width: auto;
        }
        .keyword-search-input .el-input__inner {
            border-radius: 4px;
        }
        .timelinePoptipIcon {
            margin-left: 15px;
            font-size: 14px;
            color: #333333;
            cursor: pointer;
            .custom-document-filter {
                color: #7B98B6;
                margin-right: 6px
            }
            &:hover {
                .custom-document-filter {
                    color: #4285F2;
                }
                color: #3B78DE;
            }
        }
    }
    .timeline__filter {
        margin: 12px 0 0px;

        &_date {
            &.el-date-editor--daterange {
                width: 100%;

                .el-range-input {
                    font-size: 12px;
                }

                .el-range__close-icon {
                    line-height: 24px;
                }
            }
        }

        &_keyword {
            display: inline-flex;
            align-items: center;
            margin-left: 16px;
            width: 150px;
        }

        &__mailType {
            display: inline-block;
            margin-left: 16px;

            .el-checkbox {
                height:32px;
                line-height:32px;

                &:not(:last-child) {
                    margin-right: 20px;
                }
            }
        }
    }
    .timelinePoptipContent {
        padding: 20px;
    }
    .timelinePoptip {
        .el-form-item {
            margin-bottom: 16px;
        }
        .el-form-item__label {
            font-size: 14px;
            color: #333;
        }
        .el-input__inner {
            height: 34px;
            line-height: 34px;
        }
        .timelinePoptipBottom {
            text-align: right;
        }
    }
</style>

<style scoped lang="less">
    .timeLine-container {
        position: relative;
        /deep/ .el-tabs__header {
            margin-bottom: 0;
            border-bottom: none;
        }

        /deep/ .el-tabs__nav-wrap {
            height: 32px;
            line-height: 32px;
            overflow: inherit;
        }

        /deep/ .el-tabs__nav .el-tabs__item {
            padding: 3px 15px;
            font-size: 13px;
            line-height: 40px;

            &:active {
                color: #4285F4 !important;
            }

            &:hover {
                color: #4285F4 !important;

                .custom-menu-arrow {
                    color: #4285F4 !important;
                }
            }

            &.is-active {
                color: #4285F4;

                i {
                    color: #4285F4 !important;
                }
            }
        }
        /deep/ .el-tabs__nav .el-tabs__item:nth-child(2) {
            padding-left: 0;
        }
        /deep/ .el-tabs__active-bar {
            display: none;
        }

        /deep/ .el-tabs__nav-wrap:after {
            display: none;
        }
    }

    .mail-radioGroup {
        padding: 2px;
        box-sizing: content-box;

        .el-radio {
            padding: 6px;
            margin: 0;
            line-height: inherit;
        }
    }

    .date-filter {
        &.el-input__inner {
            width: 20px;
            border: none;
            outline: none !important;
            box-shadow: none !important;
            border-color: #dcdfe6 !important;
            transition: width .4s linear;

            .el-icon-date {
                color: #A9B9C9;
            }

            .el-range-separator {
                display: none;
            }
        }

        &:hover.el-input__inner {
            width: 200px !important;
            border: 1px solid #dcdfe6;
            transition: width .4s linear;

            .el-range-separator {
                display: inline-block;
            }

            //transition-timing-function: linear
        }
    }

    .no-empty-date {
        width: 200px !important;
        border: 1px solid #dcdfe6 !important;

        .el-range-separator {
            display: inline-block !important;
        }
    }

    .timeline-search-input {
        .el-input__inner {
            width: 5px;
            height: 26px;
            line-height: 26px;
            outline: none !important;
            font-size: 13px;
            border-radius: 10px;
            border: none;
            padding: 0 28px 0 8px;
            transition: width .4s linear;
            box-shadow: none !important;
            border-color: #dcdfe6 !important;
            background-color: #fff;
            //display: none;

            &::-webkit-input-placeholder {
                color: #dcdfe6;
            }

            &::-moz-placeholder { /* Mozilla Firefox 4+ */
                color: #dcdfe6;
            }

            &:-ms-input-placeholder { /* Internet Explorer 10-11 */
                color: #dcdfe6;
            }

            &:focus {
                padding: 0 53px 0 8px;
            }
        }

        .el-input__suffix {
            .el-icon-search {
                color: #A9B9C9;
                margin-top: -3px !important;
                cursor: pointer;
            }

            .el-input__clear {
                margin-top: -3px !important;
                cursor: pointer;
            }
        }

        &:hover .el-input__inner {
            width: 200px !important;
            border: 1px solid #dcdfe6;
            transition: width .4s linear;
            //transition-timing-function: linear
        }
    }

    .no-empty-keyword {
        .el-input__inner {
            width: 200px !important;
            border: 1px solid #dcdfe6;
        }
    }
    // .timeline__filter_date {
    //     margin-right: 20px;
    //     margin-bottom: 10px;
    // }
    // .timeline__filter_keyword {
    //     margin-left: 0;
    //     margin-bottom: 10px;
    // }
    // .timeline__filter_publisher{
    //     margin-right:20px;
    //     margin-bottom: 10px;
    //     display: inline-block;
    // }
</style>
