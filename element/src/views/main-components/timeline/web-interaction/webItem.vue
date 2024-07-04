<template>
    <div class="timeline-item">
        <div class="item-header clearfloat">
            <div class="item-title">{{ $t('timeLine.siteVisit') }}</div>
            <div v-if="type === 'clue'">
                <div class="block-line"></div>
                <div @click="viewClue(item.clueId)"
                     :class="(type === 'clue' && $route.path.startsWith('/clue_manage')) ? 'header-source-current' : 'header-source'">
                    {{ $t('timeLine.fromClue') }}{{ clue_short_info.a1009 }}</div>
            </div>
            <!-- 产品提出联系人详情页，在网站交互/FB交互/邮件时间轴后不需要显示“来自联系人xxx”的字样 -->
            <!-- 杨娣 2020/05/27 -->
            <div v-else-if="type !== 'contact' && type !=='journeyDetail'">
                <div class="block-line"></div>
                <div @click="viewContact(item)"
                     :class="type === 'contact' ? 'header-source-current' : 'header-source'">
                    {{ $t('timeLine.fromContacts') }}
                    {{ item.contactsName | filterName }}
                </div>
            </div>
            <!-- 聊天logo -->
            <template v-if="item.visitorChatMessage && item.visitorChatMessage.length > 0">
                <Icon custom="custom-chat"
                      size='14'
                      style="color:#ccc;line-height: 20px;padding-left:10px;"></Icon>
            </template>
            <!-- 留言logo -->
            <template v-if="item.formList && item.formList.length > 0">
                <Icon custom="custom-leave-message"
                      size='14'
                      style="color:#ccc;line-height: 20px; padding-left:10px"></Icon>
            </template>
            <template v-if="item.outLinkFlag != 0">
                <template v-if="item.showOrderIconOrder">
                    <i class="custom custom-normal" size='14' style="color:#ccc;line-height: 20px; padding-left:10px"></i>
                </template>
                <template v-if="item.showOrderIconCart">
                    <i class="custom custom-shengchengdingdan" size='14' style="color:#ccc;line-height: 20px; padding-left:10px"></i>
                </template>
            </template>
            <div class="item-time">{{ item.eventTime | timeFormat("DateTime") }}</div>
        </div>
        <div class="item-body">
            <!-- TYPE= 1: 页面url
                TYPE= 2: 外链
                TYPE= 3: 下载
                TYPE= 4:  页面标题
                TYPE= 10: 事件类别
                TYPE= 11: 事件动作
                TYPE= 12: 事件名称 -->
            <template v-if="item.eventContent">
                <span v-if="item.contactsName">【{{ item.contactsName | filterName }}】</span>
                {{ $t('timeLine.accessToThe') }}
                <span @click="$emit('getVisitorAllInfoByEvent', item)"
                      class="web-link">【{{ item.eventContent }}】</span>
            </template>
            <template v-else-if="Number.isInteger(traceBeginIndex) && item.visitorTrace != undefined && item.visitorTrace[traceBeginIndex].currentActionType !== 2">
                <span v-if="item.contactsName">【{{ item.contactsName | filterName }}】</span>
                <span>-> {{ item.visitorTrace[traceBeginIndex].preActionName }} - {{ item.visitorTrace[traceBeginIndex].middleActionName }} - {{ item.visitorTrace[traceBeginIndex].title }}</span>
                <span @click="$emit('getVisitorAllInfoByEvent', item)"
                      class="web-link">【{{ item.visitorTrace[traceBeginIndex].toAddress }}】</span>
            </template>
            <!-- <div>
                <span>【{{ item.contactsName | filterName }}】</span>{{ $t('timeLine.accessToThe') }}
                <span class="web-link" @click="$emit('getVisitorAllInfoByEvent', item)">【{{ item.eventContent }}】</span>
            </div> -->
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import i18n from '@/locale';

    export default {
        name: 'webItem',
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
            }
        },
        computed: {
            ...mapState({
                clue_short_info: 'clue_short_info'
            }),
            traceBeginIndex() {
                // 外链：访问既有外链又有轨迹
                if (this.item.outLinkFlag != 0) {
                    // 第一条不是外链，则隐藏外链，其它正常显示
                    return 0;
                } else if (this.item.outLinkFlag == 0 && this.item.visitorTrace.length > 1) {
                    // 如果是第一，则直接显示第一条轨迹，隐藏外链(访问轨迹长度大于 1)
                    return 1;
                }

                return null;
            }
        },
        filters: {
            filterName(value) {
                return value || i18n.t('timeLine.unknown');
            }
        },
        methods: {
            viewClue(clueId) {
                if (this.$route.path.startsWith('/clue_manage')) {
                    return;
                }
                this.$emit('viewClue', clueId);
            },
            // 弹出联系人详情
            viewContact(item) {
                this.$emit('viewContact', item);
            },
        }
    };
</script>
