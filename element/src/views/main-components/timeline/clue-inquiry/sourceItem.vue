<template>
    <div class="timeline-item">
        <div class="item-header clearfloat">
            <div class="item-title">{{ translateOperateType(item) }}</div>
            <div class="block-line"></div>

            <!-- 来自 xxx -->
            <!-- 当前时间轴所在详情页为线索类型, 全部显示"来自线索" -->
            <div v-if="type === 'clue'"
                 @click="viewClue(item.clueId)"
                 :class="['clue', 'highseasClue'].includes(originalType) ? 'header-source-current' : 'header-source'">
                {{ $t('timeLine.fromClue') }}
                {{ (clue_short_info && clue_short_info.a1009) ? clue_short_info.a1009 : item.eventCustomVar.seqNumber }}
            </div>
            <!-- 事件类型为"录入线索", "创建线索"时, 显示"来自线索" -->
            <!-- eventAction 为事件类型，1-录入线索，2-创建线索-，3-录入询盘，4-新增询盘 -->
            <div v-else-if="['1', '2'].includes(item.eventAction)"
                 @click="viewClue(item.clueId)"
                 :class="['clue'].includes(originalType) ? 'header-source-current': 'header-source'">
                {{ $t('timeLine.fromClue') }}
                {{ item.eventCustomVar.seqNumber }}
            </div>
            <!-- 如果不是从联系人详情页打开时间轴, 则显示"来自联系人" -->
            <div v-else-if="type !== 'contact'"
                 @click="viewContact(item)"
                 :class="type === 'contact' ? 'header-source-current' : 'header-source'">
                {{ $t('timeLine.fromContacts') }}
                {{ item.contactsName | filterName }}
            </div>
            <!-- 否则如果不是从询盘详情页打开时间轴, 则显示"来自询盘" -->
            <div v-else-if="type !== 'inquiry'"
                 @click="viewInquiry(item.eventCustomVar.inquiryId)"
                 class="header-source">
                {{ $t('timeLine.fromInquiry') }}{{ item.eventCustomVar.seqNumber }}
            </div>

            <div class="item-time">{{ item.eventTime | timeFormat("DateTime") }}</div>
        </div>
        <!-- eventAction为事件类型，1-录入线索，2-创建线索-，3-录入询盘，4-新增询盘 -->
        <div v-if="item.eventAction === '1'"
             class="item-body">
            【{{ item.eventUser }}】{{ $t('clueInquiry.through') }}【{{ item.eventCustomVar.source }}】{{
            $t('clueInquiry.enteredClue') }}
            <span @click="viewClue(item.eventCustomVar.clueId)"
                  :class="['clue'].includes(originalType) ? 'item-event-current': 'item-event'">
                【{{ item.eventCustomVar.seqNumber }}】
            </span>
        </div>
        <div v-else-if="item.eventAction === '2'"
             class="item-body">
            【{{ item.eventUser }}】{{ $t('clueInquiry.createClue') }}
            <span @click="viewClue(item.eventCustomVar.clueId)"
                  :class="['clue'].includes(originalType) ? 'item-event-current': 'item-event'">
                【{{ item.eventCustomVar.seqNumber }}】
            </span>
        </div>
        <div v-else-if="item.eventAction === '3'"
             class="item-body">
            【{{ item.eventUser }}】{{ $t('clueInquiry.enterClueInto') }}
            <span @click="viewClue(item.eventCustomVar.clueId)"
                  :class="['clue'].includes(originalType) ? 'item-event-current': 'item-event'">
                【{{ item.eventCustomVar.clueNumber }}】
            </span>
            {{ $t('clueInquiry.enterInquiry') }}
            <span @click="viewInquiry(item.eventCustomVar.inquiryId)"
                  :class="type === 'inquiry' && !['xhl_chat', 'visitorHistory',  'Fb-chat', 'Fb-comment'].includes(originalType) ? 'item-event-current': 'item-event'">
                【{{ item.eventCustomVar.seqNumber }}】
            </span>
        </div>
        <div v-else-if="item.eventAction === '4'"
             class="item-body">
            【{{ item.eventUser }}】{{ $t('clueInquiry.createInquiry') }}
            <span @click="viewInquiry(item.eventCustomVar.inquiryId)"
                  :class="type === 'inquiry' && !['xhl_chat', 'visitorHistory', 'Fb-chat', 'Fb-comment'].includes(originalType) ? 'item-event-current': 'item-event'">
                【{{ item.eventCustomVar.seqNumber }}】
            </span>
        </div>
    </div>
</template>

<script>
    import i18n from '@/locale';
    import { mapState } from 'vuex';

    export default {
        name: 'sourceItem',
        props: {
            item: {
                type: Object,
                default() {
                    return {};
                }
            },
            type: {
                type: String,
                default: ''
            },
            originalType: {
                type: String,
                default: ''
            }
        },
        filters: {
            filterName(value) {
                return value || i18n.t('timeLine.unknown');
            }
        },
        computed: {
            ...mapState({
                clue_short_info: 'clue_short_info'
            })
        },
        methods: {
            // 弹出询盘详情
            viewInquiry(inquiryId) {
                this.$emit('viewInquiry', inquiryId);
            },
            // 弹出联系人详情
            viewContact(item) {
                this.$emit('viewContact', item);
            },
            // 弹出线索详情
            viewClue(clueId) {
                if (this.$route.path.startsWith('/clue_manage')) {
                    return;
                }
                this.$emit('viewClue', clueId);
            },

            // 翻译来源类型
            translateOperateType(item) {
                const type = `${item.eventAction}`;
                switch (type) {
                    case '1':
                        // 录入线索
                        return this.$t('timeLine.enterClue');
                    case '2':
                        // 创建线索
                        return this.$t('timeLine.newClue');
                    case '3':
                        // 录入询盘
                        return this.$t('timeLine.enterInquiry');
                    case '4':
                        // 创建询盘
                        return this.$t('timeLine.newInquiry');
                    default:
                        return item.eventContent;
                }
            }
        }
    };
</script>
