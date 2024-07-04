<template>
    <div class="global-search-container breadcrumbNav-globalSearch">
        <Tabs v-model="currentComp" class="global-search-header">
            <template v-for="item in compoList">
                <TabPane :key="item.label" :name="item.label" v-if="item.count > 0">
                    <div slot="label" class="search-tabpane">
                        <span class="search-tabpane-title">{{item.title}}</span>
                        <span class="search-tabpane-count">{{item.count > 9999 ? '9999+' : item.count}}</span>
                    </div>
                </TabPane>
            </template>
        </Tabs>
        <div class="global-search-content">
            <Spin v-if="searching" size="large" fix></Spin>
            <ul class="search-content-list" v-if="searchResults.length" ref="globalSearchResultList">
                <li class="search-content-item" v-for="(item, index) in searchResults" :key="index">

                    <template v-if="currentComp === 'mail'">
                        <div class="ellipsis" @click="handleSearchJump(item)">{{`[${getMailBox(item.mailBoxTypeId)}]`}}{{item.title}}
                            <Icon v-if="item.attachment === '1'"
                                size="14"
                                color="#A9B9C9"
                                custom="custom custom-mail-annex"/>
                        </div>
                        <div class="ellipsis" v-html="handleMailContent(item.contentShow)"></div>
                        <div>
                            <span class="ellipsis">{{$t('crm.Html.recipient')}}：{{item.recipient && item.recipient[0] === '[' && item.recipient[item.recipient.length-1] === ']' ? JSON.parse(item.recipient).join(',') : item.recipient}}</span>
                            <span class="ellipsis" style="color: rgba(0,0,0, .8);cursor:default;text-decoration: none;">{{$t('crm.Html.sender')}}：{{item.sender}}</span>
                            <span>{{$t('letters.createTime')}}：{{item.mailSendDate}}</span>
                        </div>
                    </template>
                    <template v-else-if="currentComp === 'WhatsApp'">
                        <div class="ellipsis" @click="handleSearchJump(item)" v-text="item.contactName || `+${item.contactAccount}`"></div>
                        <div class="ellipsis" v-html="handleMailContent(item.matchContent)"></div>
                        <div>
                            <span class="ellipsis" style="max-width: 90%;">{{$t('authority.remark')}}：{{item.remark}}</span>
                        </div>
                    </template>
                    <template v-else-if="currentComp === 'clue'">
                        <div class="ellipsis" @click="handleSearchJump(item)" >{{item.nickName || $t('timeLine.unknown')}}</div>
                        <div class="ellipsis" v-if="item.companyName && item.status == '询盘'" @click="handleSearchJump(item, 'customer')"> <span>公司名称：</span><span>{{item.companyName}}</span></div>
                        <div class="ellipsis" v-html="handleMailContent(item.matchContent)"></div>
                        <div>
                            <span class="ellipsis" style="max-width: 70%;">{{$t('crm.Detail.inquiryManagers')}}：{{item.rightUser}}</span>
                            <div class="ellipsis" style="max-width: 70%;margin-right: 40px;">{{$t('crm.Detail.inquiryStatus')}}：{{item.status}}</div>
                            <span>{{$t('crm.Html.createTime')}}：{{new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss')}}</span>
                        </div>
                    </template>
                    <template v-else-if="currentComp === 'inquiry'">
                        <div class="ellipsis" @click="handleSearchJump(item)">{{item.seqNumber|| $t('timeLine.unknown')}}</div>
                        <div class="ellipsis" v-if="item.companyName" @click="handleSearchJump(item, 'customer')"> <span>公司名称：</span><span>{{item.companyName}}</span></div>
                        <div class="ellipsis" v-html="handleMailContent(item.matchContent)"></div>
                        <div>
                            <!-- <span class="ellipsis">{{$t('crm.UniSet.companyName')}}：{{item.companyName}}</span> -->
                            <span class="ellipsis">{{$t('crm.Detail.inquiryManagers')}}：{{item.rightUser}}</span>
                            <span>{{$t('crm.Html.createTime')}}：{{new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss')}}</span>
                        </div>
                    </template>
                    <template v-else-if="currentComp === 'contact'">
                        <div class="ellipsis" @click="handleSearchJump(item)">{{item.nickName || $t('timeLine.unknown')}}</div>
                        <div class="ellipsis" @click="handleSearchJump(item, 'customer')" v-if="item.companyName"> <span>公司名称：</span><span>{{item.companyName}}</span></div>
                        <div class="ellipsis" v-if="item.seqNumber"> <span>询盘信息：</span><span @click="handleSearchJump(item, 'inquiry')">{{item.seqNumber}}</span></div>
                        <div class="ellipsis" v-html="handleMailContent(item.matchContent)"></div>
                        <div>
                            <span class="ellipsis">{{$t('crm.Detail.inquiryManagers')}}：{{item.rightUser}}</span>
                            <span class="ellipsis">{{$t('crm.fieldLimit.email')}}：{{item.email}}</span>
                            <span>{{$t('crm.Html.createTime')}}：{{new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss')}}</span>
                        </div>
                    </template>
                     <template v-else-if="currentComp === 'customer'">
                        <div class="ellipsis" @click="handleSearchJump(item)">{{item.companyName|| $t('timeLine.unknown')}}</div>
                        <div class="ellipsis" v-html="handleMailContent(item.matchContent)"></div>
                        <div>
                            <span class="ellipsis">{{$t('crm.Detail.inquiryManagers')}}：{{item.companyManager}}</span>
                            <span style="color: rgba(0,0,0, .8);cursor:default;text-decoration: none;">{{$t('crm.Html.createTime')}}：{{new Date(Number(item.createTime)).format('yyyy-MM-dd hh:mm:ss')}}</span>
                        </div>
                    </template>
                </li>
            </ul>
            <div class="search-content-nodata" v-else>
                <div>
                    <img src="../../svg/no-data.svg" alt="">
                    <span class="search-nodata-tip">
                        <span>{{$t('globalSearch.noSearchResultTip1')}}"</span>
                        <span class="ellipsis search-nodata-keyWords">{{globalSearchKeyWords}}</span>
                        <span>"{{$t('globalSearch.noSearchResultTip2')}}</span>
                    </span>
                </div>
            </div>
            <div class="pageWrap-right">
                <Page :page-size="pageSize"
                      :page-sizes="pageSizeOpts"
                      :total="total >= 10000 ? 10000 : total"
                      :current-page="currentPage"
                      layout="total, prev, pager, next, sizes, jumper"
                      @current-change="changePage"
                      @size-change="sizeChange"></Page>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    export default {
        name: 'GlobalSearchResults',
        data() {
            return {
                compoList: [
                    {
                        title: this.$t('globalSearch.customer'),
                        label: 'customer',
                        count: 0
                    },
                    {
                        title: this.$t('globalSearch.inquiry'),
                        label: 'inquiry',
                        count: 0
                    },
                    {
                        title: this.$t('crm.Html.contact'),
                        label: 'contact',
                        count: 0
                    },
                    {
                        title: this.$t('globalSearch.clue'),
                        label: 'clue',
                        count: 0
                    },
                    {
                        title: this.$t('timeLine.mail'),
                        label: 'mail',
                        count: 0
                    },
                    {
                        title: this.$t('timeLine.whatsApp'),
                        label: 'WhatsApp',
                        count: 0
                    }
                ], // 全局搜素结果页的所有tabs
                currentComp: 'mail', // 当前选中的tab
                searching: false, // 正在搜索
                searchResults: [], // 搜索结果
                pageSize: 20,
                pageSizeOpts: [20, 50, 100],
                total: 0,
                currentPage: 1,
                allFields: [], // 当前系统所有字段信息
                lastSearchKeyWords: '', // 上一次搜索的关键词
                customFolderList: [], // 该用户的邮件自定义文件夹列表
                isFirstComing: true,
                countryAreaMap: new Map() // 存放国家地区 code: 翻译
            };
        },
        props: {
            globalSearchKeyWords: {
                type: String,
                default: ''
            }
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            }),
            ...mapGetters([
                'isContainsMenu'
            ])
        },
        created() {
            this.getAllFields();
            this.getCustomFolders();
        },
        mounted() {
            window.addEventListener('beforeunload', this.saveKeyWords);
            if (!this.globalSearchKeyWords) {
                const keyWords = JSON.parse(localStorage.getItem('leadsCloud-globalSearchKeyWords'));
                if (keyWords) {
                    this.getSearchCount(keyWords.curr);
                    this.lastSearchKeyWords = keyWords.prev;
                }
            } else {
                this.getSearchCount();
                this.lastSearchKeyWords = this.globalSearchKeyWords;
            }
        },
        methods: {
            /* 保存当前页面的搜索关键词到localStorage */
            saveKeyWords() {
                /**
                 * @Description: 当用户强刷全局搜索结果页面时，保存的是当前搜索结果对应的搜索关键词。倘若用户刷新前重新输入了关键词，
                 *              但未执行搜索操作(回车或者点击搜索图标，或者点击下拉中的查看更多按钮)，则刷新后仍显示最后一次有搜索结果的关键词
                 * @author 杨娣
                 * @date 2020/8/25
                */
                localStorage.setItem('leadsCloud-globalSearchKeyWords', JSON.stringify({ curr: this.lastSearchKeyWords, prev: this.lastSearchKeyWords }));
            },
            /* 获取当前系统所有字段信息，保存至vuex。应用场景1：全局搜索 */
            getAllFields() {
                util.ajax({
                    url: '/crm/column/getAllField',
                    method: 'GET',
                    params: {}
                }).then(res => {
                    if (res.data.code === '1') {
                        res.data.data.forEach(item => {
                            item.storageNameCustom = `${item.storageName}_${item.parentId}`;
                            return item;
                        });
                        /* 此处手动增加WhatsApp的相关字段信息 */
                        // 补充客户编号
                        const tempArr = [
                            {
                                parentId: '1',
                                storageName: 'autoSeq',
                                storageNameCustom: 'autoSeq_1',
                                cname: '客户编号'
                            },
                            {
                                parentId: '5',
                                storageName: 'content',
                                storageNameCustom: 'content_5',
                                cname: '消息'
                            },
                            {
                                parentId: '5',
                                storageName: 'remark',
                                storageNameCustom: 'remark_5',
                                cname: '备注'
                            },
                            {
                                parentId: '5',
                                storageName: 'contactName',
                                storageNameCustom: 'contactName_5',
                                cname: '姓名'
                            },
                            {
                                parentId: '5',
                                storageName: 'contactAccount',
                                storageNameCustom: 'contactAccount_5',
                                cname: '账号'
                            }
                        ];
                        this.allFields = res.data.data.concat(tempArr);
                    }
                });
            },
            /*  获取当前搜索关键词对应的搜索结果 */
            getSearchList(keyWords) {
                const searchType = this.getSearchType();
                if (!keyWords && !this.globalSearchKeyWords) {
                    this.searchResults = [];
                    this.searching = false;
                    return false;
                };
                const url = this.currentComp === 'customer' ? '/es2/api/esData/searchCompaniesList' : '/es/api/esData/searchList';
                util.ajax({
                    url: url,
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        pageNumber: this.currentPage - 1,
                        PageSize: this.pageSize,
                        searchContent: keyWords || this.globalSearchKeyWords,
                        searchType: searchType
                    }
                }).then(async res => {
                    // let countries = [];
                    // const match1 = /<span style='color:#EA4335'>/g;
                    // const match2 = /<\/span>/g;
                    this.searchResults = res.data.map(item => {
                        let temp = '';
                        if (item.highLight) {
                            for (const key in item.highLight) {
                                const field = this.allFields.find(subItem => this.currentComp === 'customer' ? key === subItem.storageName : key === subItem.storageNameCustom);
                                if (field && field.type === 'selectMultiple') {
                                    if (Array.isArray(item.highLight[key])) {
                                        item.highLight[key] = item.highLight[key].join(',');
                                    }
                                }
                                if (field && field.cname) {
                                    /* 英文语言环境下，系统默认字段名称显示英文，自定义字段仍显示其cname；另有几组特殊字段，英文翻译需单独处理 */
                                    if (Vue.config.lang === 'zh-CN' || field.storageName.includes('a100')) {
                                        temp = `${temp} ${field.cname}: ${item.highLight[key]}`;
                                    } else {
                                        if (['seqNumber', 'dynamic', 'giveupReason', 'status'].some(item => item === field.storageName)) {
                                            /* 特殊字段的英文翻译处理 */
                                            switch (field.storageName) {
                                                case 'seqNumber':
                                                    temp = `${temp} ${this.$t('clue.inquiry_num')}: ${item.highLight[key]}`;
                                                    break;
                                                case 'dynamic':
                                                    temp = `${temp} ${this.$t('crm.Table.col_lastFollowup')}: ${item.highLight[key]}`;
                                                    break;
                                                case 'giveupReason':
                                                    temp = `${temp} ${this.$t('crm.Table.col_reason')}: ${item.highLight[key]}`;
                                                    break;
                                                case 'status':
                                                    temp = `${temp} ${this.$t('crm.InqSet.inq_followUp')}: ${item.highLight[key]}`;
                                                    break;
                                            }
                                        } else {
                                            switch (field.parentId) {
                                                case '1':
                                                    // temp = this.currentComp === 'customer' && key ==='countryArea' ? `${temp} ${this.$t(`crm.InqSet.corp_${field.storageName}`)}: customerCountryArea` : `${temp} ${this.$t(`crm.InqSet.corp_${field.storageName}`)}: ${item.highLight[key]}`;
                                                    temp = `${temp} ${this.$t(`crm.InqSet.corp_${field.storageName}`)}: ${item.highLight[key]}`;
                                                    break;
                                                case '2':
                                                    temp = `${temp} ${this.$t(`crm.InqSet.contact_${field.storageName}`)}: ${item.highLight[key]}`;
                                                    break;
                                                case '3':
                                                    temp = `${temp} ${this.$t(`crm.InqSet.inq_${field.storageName}`)}: ${item.highLight[key]}`;
                                                    break;
                                                case '5':
                                                    temp = `${temp} ${this.$t(`globalSearch.WA_${field.storageName}`)}: ${item.highLight[key]}`;
                                                    break;
                                            }
                                        }
                                    }
                                } else {
                                    temp = `${temp} ${key}: ${item.highLight[key]}`;
                                }
                            }
                        }
                        item.matchContent = temp || this.$t('globalSearch.noMatchContent');
                        return item;
                    });
                    this.searching = false;
                }).catch(err => {
                    this.searching = false;
                    this.searchResults = [];
                });
            },
            /* 获取各tab的搜索结果数量 */
            getSearchCount(keyWords) {
                this.searching = true;
                if (!keyWords && !this.globalSearchKeyWords) {
                    this.searchResults = [];
                    this.searching = false;
                    return false;
                };
                util.ajax({
                    url: '/es/api/esData/searchStat',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        pageNumber: this.currentPage - 1,
                        PageSize: this.pageSize,
                        searchContent: keyWords || this.globalSearchKeyWords
                    }
                }).then(res => {
                    let temp = '';
                    const searchStat = res.data;
                    // 第一次进来查询 显示有数据的那个tab
                    if (this.isFirstComing) {
                        const hasCustomer = searchStat.some(item => item.type === 1 && item.count > 0);
                        const hasWhatsApp = searchStat.some(item => item.type === 5 && item.count > 0);
                        const hasClue = searchStat.some(item => item.type === 4 && item.count > 0);
                        const hasInquiry = searchStat.some(item => item.type === 3 && item.count > 0);
                        const hasContact = searchStat.some(item => item.type === 2 && item.count > 0);
                        const hasMail = searchStat.some(item => item.type === 7 && item.count > 0);
                        // bug crm-全局搜索-搜索结果tab有数据，但是无列表数据
                        const hasObj = {
                            customer: hasCustomer,
                            inquiry: hasInquiry,
                            contact: hasContact,
                            clue: hasClue,
                            WhatsApp: hasWhatsApp,
                            mail: hasMail
                        };
                        this.isFirstComing = false;
                        if (!(this.currentComp && hasObj[this.currentComp])) {
                            if (hasCustomer) {
                                this.currentComp = 'customer';
                            } else if (hasInquiry) {
                                this.currentComp = 'inquiry';
                            } else if (hasContact) {
                                this.currentComp = 'contact';
                            } else if (hasClue) {
                                this.currentComp = 'clue';
                            } else if (hasWhatsApp) {
                                this.currentComp = 'WhatsApp';
                            } else if (hasMail) {
                                this.currentComp = 'mail';
                            }
                        }
                    }
                    this.compoList = this.compoList.map(item => {
                        switch (item.label) {
                            case 'mail':
                                temp = res.data.find(subItem => subItem.type === 7);
                                if (temp && temp.count) {
                                    item.count = temp.count;
                                } else {
                                    item.count = 0;
                                }
                                if (this.currentComp === 'mail') {
                                    this.total = item.count;
                                }
                                break;
                            case 'WhatsApp':
                                temp = res.data.find(subItem => subItem.type === 5);
                                if (temp && temp.count) {
                                    item.count = temp.count;
                                } else {
                                    item.count = 0;
                                }
                                if (this.currentComp === 'WhatsApp') {
                                    this.total = item.count;
                                }
                                break;
                            case 'clue':
                                temp = res.data.find(subItem => subItem.type === 4);
                                if (temp && temp.count) {
                                    item.count = temp.count;
                                } else {
                                    item.count = 0;
                                }
                                if (this.currentComp === 'clue') {
                                    this.total = item.count;
                                }
                                break;
                            case 'inquiry':
                                temp = res.data.find(subItem => subItem.type === 3);
                                if (temp && temp.count) {
                                    item.count = temp.count;
                                } else {
                                    item.count = 0;
                                }
                                if (this.currentComp === 'inquiry') {
                                    this.total = item.count;
                                }
                                break;
                            case 'contact':
                                temp = res.data.find(subItem => subItem.type === 2);
                                if (temp && temp.count) {
                                    item.count = temp.count;
                                } else {
                                    item.count = 0;
                                }
                                if (this.currentComp === 'contact') {
                                    this.total = item.count;
                                }
                                break;
                            case 'customer':
                                temp = res.data.find(subItem => subItem.type === 1);
                                if (temp && temp.count) {
                                    item.count = temp.count;
                                } else {
                                    item.count = 0;
                                }
                                if (this.currentComp === 'customer') {
                                    this.total = item.count;
                                }
                                break;
                        }
                        return item;
                    });

                    if (this.currentComp !== 'mail') {
                        this.getSearchList(keyWords);
                    } else {
                        this.searchMailByKeywords(keyWords);
                    }
                }).catch(err => {
                    this.compoList = this.compoList.map(item => {
                        switch (item.label) {
                            case 'mail':
                                temp = res.data.find(subItem => subItem.type === 7);
                                if (temp && temp.count) {
                                    item.count = temp.count;
                                } else {
                                    item.count = 0;
                                }
                                if (this.currentComp === 'mail') {
                                    this.total = item.count;
                                }
                                break;
                            case 'WhatsApp':
                                item.count = 0;
                                if (this.currentComp === 'WhatsApp') {
                                    this.total = item.count;
                                }
                                break;
                            case 'clue':
                                item.count = 0;
                                if (this.currentComp === 'clue') {
                                    this.total = item.count;
                                }
                                break;
                            case 'inquiry':
                                item.count = 0;
                                if (this.currentComp === 'inquiry') {
                                    this.total = item.count;
                                }
                                break;
                            case 'contact':
                                item.count = 0;
                                if (this.currentComp === 'contact') {
                                    this.total = item.count;
                                }
                                break;
                            case 'customer':
                                item.count = 0;
                                if (this.currentComp === 'customer') {
                                    this.total = item.count;
                                }
                                break;
                        }
                        return item;
                    });
                });
            },
            /** 根据关键词查询邮件的搜索结果 */
            searchMailByKeywords(keyWords) {
                if (!keyWords && !this.globalSearchKeyWords) {
                    this.searchResults = [];
                    this.searching = false;
                    return false;
                };
                util.ajax({
                    url: '/es/api/mail/searchWithContent',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        accountId: [],
                        userId: this.userId,
                        pageNumber: this.currentPage - 1,
                        PageSize: this.pageSize,
                        searchType: '0',
                        searchContent: keyWords || this.globalSearchKeyWords
                    }
                }).then(({ data }) => {
                    if (this.currentComp === 'mail') {
                        this.total = data.totalElements;
                        this.searchResults = data.list;
                        this.searching = false;
                    }
                }).catch(err => {
                    if (this.currentComp === 'mail') {
                        this.total = 0;
                        this.searchResults = [];
                        this.searching = false;
                    }
                    console.log(err);
                });
            },
            /* 获取搜索类型 */
            getSearchType() {
                switch (this.currentComp) {
                    case 'customer':
                        return 1;
                    case 'contact':
                        return 2;
                    case 'inquiry':
                        return 3;
                    case 'clue':
                        return 4;
                    case 'WhatsApp':
                        return 5;
                }
            },
            handleMailContent(content) {
                const regex = /<.*?>/ig;
                if (content) {
                    content = content.replace(/\n/ig, '').replace(/↵/ig, '');
                    if (this.currentComp === 'mail') {
                        content = content.replace(regex, '');
                        const index = content.indexOf(this.lastSearchKeyWords);
                        if (content && index !== -1) {
                            content = content.substring(index);
                        } else if (!content) {
                            return `<span>${this.$t('globalSearch.MailContentEmpty')}</span>`;
                        }
                        return this.highLightKeyWords(content.trim());
                    } else {
                        return content.trim();
                    }
                } else {
                    return `<span>${this.$t('globalSearch.MailContentEmpty')}</span>`;
                }
            },
            /* 关键词高亮处理 */
            highLightKeyWords(content) {
                let result = content.split(this.lastSearchKeyWords);
                for (let i = 0; i < result.length; i++) {
                    let string = result[i];
                    string = string.replace(/&/g, '&amp;');
                    string = string.replace(/\"/g, '&quot;');
                    string = string.replace(/</g, '&lt;');
                    string = string.replace(/>/g, '&gt;');
                    result[i] = string;
                }
                result = result.join(`<span style="color: #EA4335;">${this.lastSearchKeyWords}</span>`);
                return result;
            },
            /* 点击搜索结果的跳转 */
            handleSearchJump(e, type = 'default') {
                if (type === 'customer') {
                    this.jumpToCustomerManage(e.companyId, e.companyManagerId);
                    return;
                }
                if (type === 'inquiry') {
                    this.jumpToInquiryManage(e.inquiryId, e.rightUserIds ? e.rightUserIds : '', e.companyId);
                    return;
                }
                switch (this.currentComp) {
                    case 'mail':
                        this.jumpToMail(e.idString);
                        break;
                    case 'WhatsApp':
                        this.jumpToWhatsApp(e.contactAccount, e.contactName, e.remark);
                        break;
                    case 'clue':
                        this.jumpToClueManage(e.id, e.rightUserIds ? e.rightUserIds : '');
                        break;
                    case 'inquiry':
                        this.jumpToInquiryManage(e.id, e.rightUserIds ? e.rightUserIds : '', e.companyId);
                        break;
                    case 'contact':
                        this.jumpToContactManage(e.id, e.rightUserIds ? e.rightUserIds : '', e.companyId, e.inquiryId);
                        break;
                    case 'customer':
                        this.jumpToCustomerManage(e.id, e.companyManagerId);
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
                        if (res.data.data.mailDraftFlag) {
                            const obj = {};
                            obj.mailEdit = true;
                            obj.mailId = mailId;
                            obj.selectedMailBoxType = 'draftBox';
                            localStorage.setItem('leadsCloud-writeMailData', JSON.stringify(obj));
                            const forwardMailDetail = Object.assign(res.data.data, { id: mailId, from: 'globalSearch' });
                            localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                        name: 'mail_home'
                                    }).href;
                            localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(forwardMailDetail));
                            window.open(href, '_blank');
                        } else {
                            const forwardMailDetail = Object.assign(res.data.data, { id: mailId, from: 'globalSearch' });
                            localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                name: 'mail_home'
                            }).href;
                            localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(forwardMailDetail));
                            window.open(href, '_blank');
                        }
                    } else {
                        this.$Message.error(this.$t('globalSearch.mailBeDeleted'));
                    }
                });
            },
            /* 跳转至WhatsApp，并进行跳转前校验 */
            jumpToWhatsApp(WAAccount, WAAccountName, remark) {
                if (this.isContainsMenu('whatsapp_chat')) {
                    const obj = {
                        WAAccount: WAAccount,
                        WAAccountName: WAAccountName,
                        remark: remark,
                        leadscloudStatus: 0
                    };
                    localStorage.setItem('leadsCloud-WA-WAAccount', JSON.stringify(obj));
                    const href = window.location.origin + window.location.pathname + this.$router.resolve({
                        name: 'whatsapp_chat'
                    }).href;
                    window.open(href, '_blank');
                } else {
                    this.$Message.warning(this.$t('globalSearch.haveNoPermissionWhatsApp'));
                }
            },
            /* 跳转至线索详情页，并进行跳转前校验 */
            jumpToClueManage(clueId, rightUserIds) {
                localStorage.setItem('leadsCloud-clueId', clueId);
                if (rightUserIds.includes('-1')) {
                    /* 公海线索功能权限校验 */
                    if (this.isContainsMenu('common_sea_customer')) {
                        const href = window.location.origin + window.location.pathname + this.$router.resolve({
                            name: 'common_sea_customer'
                        }).href;
                        window.open(href, '_blank');
                    } else {
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasClue'));
                    }
                } else {
                    if (this.isContainsMenu('my_clue')) {
                        // 针对线索录入人员做校验判断
                        if (rightUserIds.split(',').findIndex(item => item === this.userId) !== -1) {
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                name: 'my_clue'
                            }).href;
                            window.open(href, '_blank');
                        } else {
                            this.isHaveManageAuthority(rightUserIds, 'my_clue');
                        }
                    } else {
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyClue'));
                    }
                }
            },
            /* 跳转至询盘详情页，并进行跳转前校验 */
            jumpToInquiryManage(inquiryId, rightUserIds, relatedCompanyId) {
                localStorage.setItem('leadsCloud-inquiryId', inquiryId);
                if (rightUserIds.includes('-1')) {
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
                        if (rightUserIds.split(',').findIndex(item => item === this.userId) !== -1) {
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                name: 'myInquiry'
                            }).href;
                            window.open(href, '_blank');
                        } else {
                            this.isHaveManageAuthority(rightUserIds, 'myInquiry');
                        }
                    } else {
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyInquiry'));
                    }
                }
            },
            /* 跳转至联系人详情页，并进行跳转前校验 */
            jumpToContactManage(contactId, rightUserIds, relatedCompanyId) {
                localStorage.setItem('leadsCloud-contactId', contactId);
                if (rightUserIds.includes('-1')) {
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
                        if (rightUserIds.split(',').findIndex(item => item === this.userId) !== -1) {
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                name: 'myContact'
                            }).href;
                            window.open(href, '_blank');
                        } else {
                            this.isHaveManageAuthority(rightUserIds, 'myContact');
                        }
                    } else {
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyContact'));
                    }
                }
            },
            /* 跳转至联系人详情页，并进行跳转前校验 */
            jumpToCustomerManage(companyId, companyManagerId) {
                // 筛选时已加权限逻辑
                // if (this.isContainsMenu('myCustomer')) {
                //     this.$viewCustomer(companyId)
                // }else{
                //     this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyCustomer'));
                // }
                if (companyManagerId && companyManagerId.includes('oversea')) {
                    /* 公海管理功能权限校验 */
                    if (this.isContainsMenu('highseasCustomer')) {
                        this.$viewHighSeasCustomer(companyId);
                    } else {
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                    }
                } else {
                    if (this.isContainsMenu('myCustomer')) {
                        // 针对联系人负责人做校验判断
                        if (companyManagerId.findIndex(item => item === this.userId) !== -1) {
                            this.$viewCustomer(companyId);
                        } else {
                            this.isHaveManageAuthority(companyManagerId.join(','), 'myCustomer', companyId);
                        }
                    } else {
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyCustomer'));
                    }
                }
            },
            /* 当前用户是否拥有某些人员的管理权限的判断 */
            isHaveManageAuthority(userIds, targetRoute, companyId) {
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
                            let msg = '';
                            switch (targetRoute) {
                                case 'my_clue':
                                    msg = `${this.$t('globalSearch.noPermissionView')}${this.$t('clue.clue')}`;
                                    break;
                                case 'myInquiry':
                                    msg = `${this.$t('globalSearch.noPermissionView')}${this.$t('clue.inquiry')}`;
                                    break;
                                case 'myContact':
                                    msg = `${this.$t('globalSearch.noPermissionView')}${this.$t('crm.Html.contact')}`;
                                    break;
                                case 'myCustomer':
                                    msg = `${this.$t('globalSearch.noPermissionView')}${this.$t('globalSearch.customer')}`;
                                    break;
                            }
                            this.$Message.warning(msg);
                        } else {
                            if (targetRoute === 'myCustomer') {
                                this.isHaveAuthorityByCompanyId(companyId);
                            } else {
                                const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                    name: targetRoute
                                }).href;
                                window.open(href, '_blank');
                            }
                        }
                    }
                });
            },
            isHaveAuthorityByCompanyId(companyId) {
                // let memuList = JSON.parse(localStorage.getItem('roleMenu'));
                // let highseasCustomer = false;
                // memuList.forEach(item =>{
                //     if(item.children && item.children.length){
                //         let children = item.children;
                //         children.forEach(child => {
                //             if(child.path === 'highseasCustomer'){
                //                 highseasCustomer = true;
                //                 return;
                //             }
                //         })
                //     }
                // })
                // if(highseasCustomer){
                //     this.$viewCustomer(companyId)
                // }else{
                //     this.$Message.warning(this.$t('crm.Modal.error_JumpCustomerInHighseas'));
                // }
                util.ajax({
                    url: 'crm/mailbox/isHaveAuthorityByCompanyId',
                    method: 'get',
                    params: {
                        userId: this.userId || Cookies.get('userId'),
                        orgId: this.enterpriseId || Cookies.get('enterpriseId'),
                        companyId: companyId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        switch (`${res.data.data}`) {
                            case '1':
                                this.$viewCustomer(companyId);
                                break;
                            case '2':
                                const memuList = JSON.parse(localStorage.getItem('roleMenu'));
                                let highseasCustomer = false;
                                memuList.forEach(item => {
                                    if (item.children && item.children.length) {
                                        const children = item.children;
                                        children.forEach(child => {
                                            if (child.path === 'highseasCustomer') {
                                                highseasCustomer = true;
                                                return;
                                            }
                                        });
                                    }
                                });
                                if (highseasCustomer) {
                                    this.$viewCustomer(companyId);
                                } else {
                                    this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                                }
                                break;
                            case '3':
                                localStorage.removeItem('leadsCloud-companyId');
                                this.$Message.warning(this.$t('crm.Modal.error_JumpCustomerMerged'));
                                break;
                            // 该账号没有管理权限
                            default:
                                localStorage.removeItem('leadsCloud-companyId');
                                this.$Message.warning(this.$t('crm.Modal.error_JumpCustomerHaveNoPermission'));
                                return false;
                        }
                    }
                });
            },
            /* 切换页码 */
            changePage(pageNum) {
                this.currentPage = pageNum;
                // if (this.currentComp !== 'mail') {
                //     this.getSearchList(this.lastSearchKeyWords);
                // }
                this.getSearchCount(this.lastSearchKeyWords);
                if (this.$refs.globalSearchResultList) {
                    this.$refs.globalSearchResultList.scrollTop = 0;
                }
            },
            /* 调整pageSize */
            sizeChange(pageSize) {
                this.pageSize = pageSize;
                // if (this.currentComp !== 'mail') {
                //     this.getSearchList(this.lastSearchKeyWords);
                // }
                this.getSearchCount(this.lastSearchKeyWords);
            },
            /** 获取邮件是哪个箱 */
            getMailBox(boxId) {
                const boxTypeName = this.findBoxTypeName(this.customFolderList, boxId);
                switch (boxId) {
                    case 0:
                        return this.$t('mail.inbox');
                    case 3:
                        return this.$t('mail.dustbin');
                    case 2:
                        return this.$t('mail.trash');
                    case 4:
                        return this.$t('mail.sentBox');
                    case 5:
                        return this.$t('mail.draftBox');
                    case 7:
                        return this.$t('mail.groupBox');
                    default:
                        return boxTypeName || this.$t('mail.customizedFolder.name');
                }
            },
            // 返回对应id的name
            findBoxTypeName(treeData, id) {
                for (let i = 0; i < treeData.length; i++) {
                    const a = treeData[i];
                    if (a.id === id) {
                        return a.boxTypeName;
                    } else {
                        if (a.list && a.list.length > 0) {
                            const res = this.findBoxTypeName(a.list, id);
                            if (res) {
                                return res;
                            }
                        }
                    }
                }
            },
            /** 获取自定义文件夹列表 */
            getCustomFolders() {
                util.ajaxMail({
                    url: `/mail/mailBoxTypes/${this.userId}`,
                    method: 'GET'
                }).then(response => {
                    if (response.data.code === 1) {
                        this.customFolderList = response.data.data || [];
                    }
                });
            }
        },
        watch: {
            currentComp: {
                handler(val) {
                    this.searchResults = [];
                    this.currentPage = 1;
                    if (this.lastSearchKeyWords) {
                        this.getSearchCount(this.lastSearchKeyWords);
                    }
                }
            }
        },
        beforeDestroy() {
            window.removeEventListener('beforeunload', this.saveKeyWords);
        }
    };
</script>

<style lang="less" scoped>
    .global-search-container {
        height: 100%;
        padding: 27px 30px 30px 30px;
        .global-search-header {
            /deep/ .el-tabs__nav-wrap {
                &:after {
                    display: none;
                }
            }
            .search-tabpane {
                position: relative;
                .search-tabpane-title {
                    margin-right: 5px;
                }
                .search-tabpane-count {
                    position: absolute;
                    top: -10px;
                    font-size: 12px;
                }
            }
        }
        .global-search-content {
            height: calc(100% - 82px);
            .search-content-list {
                height: 100%;
                overflow: auto;
                .search-content-item {
                    display: block;
                    // height: 99px;
                    width: 100%;
                    border-bottom: 1px dashed  #EAEAEA;
                    color: rgba(0, 0, 0, .8);
                    div {
                        font-size: 12px;
                        height: 22px;
                        line-height: 22px;
                        &:nth-child(1){
                            margin-top: 12px;
                            margin-bottom: 8px;
                            font-size: 14px;
                            color: #3B78DE;
                            &:hover {
                                color: #2d63bc;
                                text-decoration: underline;
                                cursor: pointer;
                            }
                        }
                        &:nth-child(2), &:nth-child(3) {
                            // margin-bottom: 8px;
                            font-size: 12px;
                            // color: #3B78DE;
                            span:nth-child(2){
                                color: #3B78DE;
                            }
                            span:nth-child(2):hover {
                                color: #2d63bc;
                                text-decoration: underline;
                                cursor: pointer;
                            }
                        }
                        &:last-child {
                            // margin-top: 8px;
                            margin-bottom: 12px;
                            display: flex;
                            align-items: center;
                            span {
                                margin-right: 40px;
                                max-width: 30%;
                            }
                        }
                    }
                }
            }
            .search-content-nodata {
                position: relative;
                height: 100%;
                width: 100%;
                div {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 12px;
                    color: rgba(0, 0, 0, .4);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    img {
                        margin-bottom: 10px;
                    }
                    .search-nodata-tip {
                        display: flex;
                        align-items: center;
                        .search-nodata-keyWords {
                            display: inline-block;
                            max-width: 200px;
                        }
                    }
                }
            }
            .pageWrap-right {
                text-align: right;
                margin: 10px 0;
            }
        }
    }
</style>
