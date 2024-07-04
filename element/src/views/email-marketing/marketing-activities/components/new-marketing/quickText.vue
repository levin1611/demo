<template>
    <div style="overflow-y: auto;"
         :style="`height:${window_height-132}px;`">
        <ul class="linkman-list fast-text-title" style="margin-top:0;">
            <li style="cursor:auto;">
                <div>{{$t('mail.writeLetter.fastText')}}</div>
                <div>
                    <i @click.stop="toFastTextSet">
                        <Tooltip placement="top" transfer :content="$t('mailSetting.fastText.setting')">
                            <Icon size="14" custom="custom custom-custom-script-set" style="cursor:pointer;" />
                        </Tooltip>
                    </i>
                    <i><Icon size="14" @click.stop="closeFastText" custom="custom custom-modal-close" style="cursor:pointer;" /></i>
                </div>
            </li>
            <li>
                <Input class="verbal-search"
                       icon="ios-search-strong"
                       search
                       clearable
                       v-model="fastTextSearch"
                       @keyup.enter.native="searchFastTextList"
                       @input="searchFastTextList"
                       :placeholder="$t('mail.fastTextSearchHolder')" >
                <i slot="suffix" class="el-input__icon el-icon-search" @click.stop="searchFastTextList"></i>
                </Input>
            </li>
        </ul>
        <div class="fast-text-list">
            <!-- <p>暂无数据</p> -->
            <p v-if="!fastTextShowLag" class="noDataTip">{{$t('crm.Table.noData')}} </p>
            <ul>
                <li v-if="fastTextShowLag" @click.stop="handleQuickText(fastTextItem.quickContent,fastTextIndex)" v-for="(fastTextItem , fastTextIndex) in quickTexts" :key="fastTextIndex">
                    <h4>{{fastTextItem.quickName}}</h4>
                    <Tooltip placement="left" max-width="150">
                        <p class="paragraph overTwoLine" v-html="fastTextItem.quickContent" >
                        </p>
                        <div slot="content">
                            <p class="paragraph quickTextDom" v-html="fastTextItem.quickContent">
                            </p>
                        </div>
                    </Tooltip>
                </li>
            </ul>
            <p v-if="fastTextShowLag" class="load-more">
                <a class="hrefa" @click.stop="quickTextLoadMore" v-if="quickTexts.length < textTotalNumber ">{{$t('chat.loadMore')}}</a>
                <a v-else class="nohrefa">{{ $t('chat.noMore') }}</a>
            </p>
        </div>
    </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';
import util from '@/libs/util';
import Cookies from 'js-cookie';
export default{
    name: 'quickText',
    props: ['textModel', 'cursorType'],
    data () {
        return {
            quickTexts: [], // 快速文本列表
            fastTextSearch: '', // 搜索快速文本
            fastTextShowLag: true, // 快速文本默认显示
            textCurrentPage: 0, // 快速文本列表当前页码
            fastTextPageSize: 10, // 快速文本列表每页显示数量
            textTotalNumber: 0, // 快速文本数量总和
        }
    },
    components: {},
    computed: {
        ...mapState({
            enterpriseId: 'enterpriseId',
            userId: 'userId',
            fullName: 'fullName',
            window_width: 'window_width',
            window_height: 'window_height',
        }),
    },
    mounted () {
        this.getTextsByUserId();
        this.searchFastTextList();
    },
    methods: {
        /* 通过用户ID获取快速文本列表 */
        getTextsByUserId() {
            util.ajaxMailJson({
                url: `/mail/quickTexts/${this.$store.state.userId}`,
                method: 'get'
            }).then(response => {
                if (response.data.code === 1) {
                const flag = response.data.data.length === 0;
                this.fastTextShowLag = !flag;
            } else {
                this.$Message.error(this.$t('mail.writeLetter.quickTextErrorTip'));
            }
        });
        },
        /** 关闭快速文本列表 */
        closeFastText() {
            this.$emit('update:textModel', false)
            this.fastTextSearch = '';
            this.textCurrentPage = 0;
            this.searchFastTextList();
        },
        /** 点击加载更多 */
        quickTextLoadMore() {
            this.textCurrentPage += 1;
            this.getDataByQuickContent();
        },
        /** 跳转至邮箱设置-->快速文本 */
        toFastTextSet() {
            localStorage.setItem('updateAccountToQuickText', 'QuickText');
            window.open(this.$router.resolve('/systemSettings/mail_set').href, '_blank');
        },
        /** 搜索快速文本 */
        searchFastTextList() {
            this.textCurrentPage = 0;
            this.getDataByQuickContent();
        },
        /** 调用快速文本查询接口 */
        getDataByQuickContent() {
            util.ajaxMail({
                url: '/mail/quickTextsFind/findByQuickContent',
                method: 'get',
                params: {
                    userId: this.userId,
                    content: this.fastTextSearch,
                    page: this.textCurrentPage,
                    size: this.fastTextPageSize
                }
            }).then(res => {
                if (res.data.code === 1) {
                    this.textTotalNumber = res.data.data.totalElements;
                    if (this.textCurrentPage !== 0) {
                        this.quickTexts = this.quickTexts.concat(res.data.data.content);
                    } else {
                        this.quickTexts = res.data.data.content;
                    }
                    this.fastTextShowLag = !(this.textTotalNumber === 0);
                } else {
                    this.$Message.error(this.$t('mail.writeLetter.quickTextErrorTip'));
                }
            });
        },
        /** 插入快速文本 */
        handleQuickText(quickText, index) {
            this.$emit('handleQuickText', quickText, index)
        },
    },
    watch: {},
}
</script>
<style lang="less">
    @import url('quickText.less');
</style>