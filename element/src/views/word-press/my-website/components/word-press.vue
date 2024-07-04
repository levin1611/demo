<template>
    <div>
        <div  v-if="hasCustomStationService === 0" class="webUrlList" :style="{position: 'relative', height: autoHeight+'px', 'overflow-y': 'auto'}">
            <form method="post" id="websiteForm" ref="websiteForm" :action="actionForm.actionUrl" target="_blank" style="display: none;">
                <label title="321">
                    <input name="log" v-model="actionForm.log" hidden>
                </label>
                <br>
                <label>
                    <input name="pwd" v-model="actionForm.pwd" hidden>
                </label>
                <br>
                <label>
                    <input name="wp-submit" value="登录" hidden>
                </label>
                <br>
                <label>
                    <input name="redirect_to" v-model="actionForm.redirect_to" hidden>
                </label>
            </form>
            <div class="webUrlList-title">
                <span class="all-marketing-website">{{$t('administerAMP.wordPress.allMarketingWebsite')}}</span>
                <div class="table_time_picker">
                    <span class="time_picker_time">{{$t('seo.list.indicatorTime')}}</span>
                    <!-- <DatePicker v-model="selectedDate"
                                type="daterange"
                                @change="change_filter_tag"
                                style="width: 230px;"></DatePicker> -->
                    <!-- <DatePicker v-model="selectedDate"
                        type="daterange" 
                        range-separator="-"
                        value-format="yyyy-MM-dd"
                        format="yyyy-MM-dd"
                        @change="change_filter_tag"
                        size="small"
                        :clearable="false"
                        class="change-subject-time"></DatePicker> -->
                        <DatePicker
                            v-model="selectedDate"
                            type="daterange"
                            :picker-options="pickerOptions"
                            @change="change_filter_tag"
                            placement="bottom-end"
                            size="small"
                            :placeholder="$t('filter_box.select_time')"
                            style="width: 230px;"></DatePicker>
                </div>
            </div>
            <div>
                <!-- <div v-for="(item,index) in webDate" :key="index" class="web-block">
                    <div  style="margin:0 0 20px;display: flex;justify-content: space-between;">
                        <div class="btn-ui">
                            <Button style="margin-right: 16px;"  @click="openPage(item.data[0], 1)">{{$t('administerAMP.wordPress.productBtnText')}}</Button>
                            <Button style="margin-right: 16px"  @click="openPage(item.data[0], 3)">{{$t('administerAMP.wordPress.pageBtnText')}}</Button>
                            <Button  @click="openPage(item.data[0], 4)">{{$t('administerAMP.wordPress.mediaBtnText')}}</Button>
                        </div>
                        <div style="color: #3B78DE;">{{$t('administerAMP.wordPress.netText')}}<span class="url-hover" style="cursor: pointer" @click="login(item.data[0], '/admin')">{{item.data[0].weburl}}</span></div>
                    </div>
                </div> -->
                <div class="table" style="margin-top: 8px">
                    <Table
                        :data="webDate"
                        :height="table_height"
                        size="medium"
                        highlight-current-row
                        ref="table"
                        :row-class-name="getRowClassName"
                        header-row-class-name="headerClassName"
                        @row-click="rowClick"
                        class="tabmain">
                        <!-- 加载图标 -->
                        <Spin fix v-show="spinShow" size="large"></Spin>
                        <TableColumn class-name="no-padding-cell" :label="$t('administerAMP.wordPress.website')" width="400">
                            <template slot-scope="scope">
                                <div class="website-title" @click.stop="jumpUrl(scope.row)">
                                    <p>{{scope.row.title}}</p>
                                    <p>{{scope.row.domain}}</p>
                                </div>
                            </template>
                        </TableColumn>
                        <TableColumn class-name="no-padding-cell" prop="status" :label="$t('administerAMP.wordPress.state')" width="120">
                            <template slot-scope="scope">
                                <p v-if="scope.row.status === 0">{{$t('administerAMP.wordPress.invalid')}}</p>
                                <p v-if="scope.row.status === 1">{{$t('administerAMP.wordPress.unpublished')}}</p>
                                <p v-if="scope.row.status === 2">{{$t('administerAMP.wordPress.published')}}</p>
                            </template>
                        </TableColumn>

                        <TableColumn class-name="no-padding-cell" :label="$t('administerAMP.wordPress.sessions')" width="120" align="center">
                            <template slot-scope="scope">
                                {{scope.row.totalSessions}}
                            </template>
                        </TableColumn>
                        <TableColumn class-name="no-padding-cell" :label="$t('administerAMP.wordPress.averageSessionDuration')" width="120" align="center">
                            <template slot-scope="scope">
                                {{scope.row.avarageSessionDuration}}
                            </template>
                        </TableColumn>
                        <TableColumn class-name="no-padding-cell" :label="$t('administerAMP.wordPress.pagesViewedPerSession')" width="120" align="center">
                            <template slot-scope="scope">
                                {{scope.row.pagesViewedPerSession}}
                            </template>
                        </TableColumn>
                        <TableColumn class-name="no-padding-cell" :label="$t('administerAMP.wordPress.bounceRate')" width="120" align="center">
                            <template slot-scope="scope">
                                {{scope.row.boundRate + '%'}}
                            </template>
                        </TableColumn>
                        <TableColumn class-name="no-padding-cell" :label="$t('administerAMP.wordPress.conversations')" width="120" align="center">
                            <template slot-scope="scope">
                                {{scope.row.numberOfConversations}}
                            </template>
                        </TableColumn>
                        <TableColumn class-name="no-padding-cell" :label="$t('administerAMP.wordPress.message')" width="120" align="center">
                            <template slot-scope="scope">
                                {{scope.row.numberOfMessages}}
                            </template>
                        </TableColumn>
                        <TableColumn class-name="no-padding-cell" :label="$t('administerAMP.wordPress.leads')" width="120" align="center">
                            <template slot-scope="scope">
                                {{scope.row.numberOfClue}}
                            </template>
                        </TableColumn>

                        <TableColumn class-name="no-padding-cell" :label="$t('administerAMP.wordPress.lastUpdatedTime')" width="250">
                            <template slot-scope="scope">
                                {{scope.row.updateTime | timeFormat('DateTime')}}
                            </template>
                        </TableColumn>
                        <TableColumn class-name="no-padding-cell" :label="$t('administerAMP.wordPress.createTime')" width="250">
                            <template slot-scope="scope">
                               {{scope.row.createTime | timeFormat('DateTime')}}
                            </template>
                        </TableColumn>
                        
                        <TableColumn :label="$t('administerAMP.wordPress.operate')"
                            width="300"
                            class-name="no-padding-cell"
                            fixed="right">
                            <template slot-scope="scope">
                                <Dropdown
                                    trigger="hover"
                                    @command="jumpWordPress($event, scope.row)">
                                    <span class="switch-title" style="cursor: pointer;font-size: 14px;" @click.stop="aa()">
                                        {{$t('administerAMP.wordPress.editContent')}}<i class="custom custom-icon_next_e"></i>
                                    </span>
                                    <DropdownMenu slot="dropdown">
                                        <DropdownItem v-for="(item, index) in scope.row.contentEditList" :key="index" :command="item">
                                            <Button
                                                class="mail-preview"
                                                type="text"
                                                style="font-size: 14px;">{{item.title}}</Button>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                                <Dropdown trigger="hover" @command="jumpWordPress($event, scope.row)">
                                    <span class="switch-title" style="cursor: pointer;font-size: 14px;" @click.stop="aa()">
                                        {{$t('administerAMP.wordPress.create')}}<i class="custom custom-icon_next_e"></i>
                                    </span>
                                    <DropdownMenu slot="dropdown">
                                        <DropdownItem v-for="(item, index) in scope.row.newCreateList" :key="index" :command="item">
                                            <Button
                                                class="mail-preview"
                                                type="text"
                                                style="font-size: 14px;">{{item.title}}</Button>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                                <Dropdown
                                    v-if="scope.row.hasSiteAdminRole"
                                    trigger="hover"
                                    @command="userSetting(scope.row)">
                                    <span class="switch-title">
                                        <Icon
                                        custom="custom custom-address-more"
                                        color="#3B78DE"
                                        style="cursor: pointer;"
                                        size="10"
                                        @click.stop="aa()"
                                        ></Icon>
                                    </span>
                                    <DropdownMenu slot="dropdown">
                                        <!-- 编辑 -->
                                        <DropdownItem command="1"
                                        ><Button
                                            class="mail-preview"
                                            type="text"
                                            style="font-size: 14px;"
                                            >{{$t('administerAMP.wordPress.userSettings')}}</Button
                                        ></DropdownItem
                                        >
                                    </DropdownMenu>
                                </Dropdown>
                            </template>
                        </TableColumn>
                    </Table>
                    <div style="margin-right: 30px;overflow: hidden;background-color: #fff;">
                        <Page :page-size="pageSize"
                            :page-sizes="pageSizeOpts"
                            :total="totalNum"
                            :current-page="curPage"
                            layout="total, prev, pager, next, sizes, jumper"
                            @current-change="changePage"
                            @size-change="pageSizeChange"
                            class="pageWrap-right"></Page>
                    </div>
                </div>
                <!-- 暂无数据 -->
                <!-- <div v-if="hasResult" style="text-align: center;padding-top: 300px;height:750px;">暂无数据</div> -->
                <!-- <div v-if="hasResult" style="text-align: center;padding-top: 300px;height:750px;">{{$t('crm.Table.noData')}}</div> -->
            </div>
        </div>
        <div v-else-if="hasCustomStationService === 1"
            :style="{position: 'relative', height: autoHeight+'px', background: '#fff',overflow: 'hidden'}">
            <h1 class="word-press-Leaflet-title">
                {{$t('administerAMP.wordPress.wordPressTitle1')}}<span>{{$t('administerAMP.wordPress.wordPressTitle2')}}</span>
                <Icon custom="custom" class="custom-zengchangicon" color="#FF752A" style="margin-left:12px"></Icon>
            </h1>
            <Row type="flex" class="word-press-Leaflet">
                <Col :span="12">
                    <img style="display:block; width:526px;height:365px; margin:0 auto;" :src="require('@/assets/images/wordpress.png')">
                </Col>
                <Col :span="12">
                    <div class="word-press-Leaflet-subtitle">{{$t('administerAMP.wordPress.wordPressText1')}}</div>
                    <div class="word-press-Leaflet-text" v-html="$t('administerAMP.wordPress.wordPressHtml1')"></div>
                    <div class="word-press-Leaflet-subtitle">{{$t('administerAMP.wordPress.wordPressText2')}}</div>
                    <div class="word-press-Leaflet-text" v-html="$t('administerAMP.wordPress.wordPressHtml2')"></div>
                    <div class="word-press-Leaflet-subtitle" style="font-size: 14px">
                        <Icon custom="custom-dianhua4" style="font-size: 18px;"></Icon>
                        {{$t('administerAMP.wordPress.wordPressText3')}}
                    </div>
                </Col>
            </Row>
        </div>
        <div></div>
        <customSetting
        :visible.sync="visible"
        :rowDate="selectRow"
        :id="selectRow.id"></customSetting>
        <websiteDetail
        :visible.sync="visibleDetail"
        :rowDate="selectRow"
        :id="selectRow.id"></websiteDetail>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import md5 from 'js-md5';
    import Utils from '@/utils/index';
    import customSetting from './customSetting';
    import websiteDetail from './website-detail';
    import {
        getSiteList,
        getJumpParam,
        hasSite
    } from '@/api/website';
    export default {
        name: 'website_manager',
        components: {
            customSetting,
            websiteDetail
        },
        data() {
            return {
                webDate: [],
                spinShow: true, // 改
                hasResult: false, // 控制删除弹窗
                selectedDate: [new Date() - (1000 * 60 * 60 * 24 * 30), new Date().getTime()],
                pageSize: 20,
                pageSizeOpts: [20, 50, 100],
                totalNum: null,
                curPage: 1,
                totalPageCount: 1,
                visible: false,
                visibleDetail: false,
                actionForm: {},
                selectRow: {},
                hasCustomStationService: null,
                pickerOptions: {
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
                                let dayNo = start.getDay();
                                dayNo = dayNo ? dayNo - 1 : 6;
                                start.setTime(start.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltwk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo || 7;
                                end.setTime(end.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                start.setTime(end.getTime() - 6 * 24 * 60 * 60 * 1000);
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
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            range: 'thisSeason',
                            text: this.$t('crm.Table.thisSeason'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                const monthNo = start.getMonth();
                                const season = Math.floor(monthNo / 3);

                                start.setTime(new Date(start.getFullYear(), season * 3, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            range: 'lastSeason',
                            text: this.$t('crm.Table.lastSeason'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                const monthNo = start.getMonth();
                                const season = Math.floor(monthNo / 3);
                                const year = start.getFullYear();

                                start.setTime(new Date(year, (season - 1) * 3, 1).getTime());
                                end.setTime(new Date(year, season * 3, 1).getTime() - 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            range: 'all',
                            text: this.$t('all'),
                            onClick(picker) {
                                picker.$emit('pick', []);
                            }
                        }
                    ]
                }
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                window_height: state => state.window_height,
                fullName: state => state.fullName
            }),
            autoHeight() {
                return document.documentElement.clientHeight - 110;
            },
            table_height() {
                let temp = this.window_height ? this.window_height - 214 : document.body.clientHeight - 214;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            }
        },
        methods: {
            userSetting(row) {
                this.visible = true;
                this.selectRow = row;
            },
            aa() {},
            jumpUrl(item) {
                window.open(`https://${item.domain}`);
            },
            jumpWordPress(item, row) {
                getJumpParam({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    siteId: row.id,
                    domain: row.domain,
                    adminUrl: row.adminUrl,
                    jumpUrl: item.url
                }).then(res => {
                    if (res.code === '1') {
                        this.actionForm = {
                            actionUrl: `https://${row.domain}${row.loginUrl}`,
                            log: res.data.userName,
                            pwd: res.data.passWord,
                            redirect_to: res.data.url
                        };
                        setTimeout(res => {
                            $('#websiteForm').submit();
                        }, 400);
                    }
                });
            },
            // filterTags 组件内部修改筛选条件后触发的方法
            change_filter_tag(key) {
                // this.$store.commit('setSubjectDate', this.selectedDate);
                this.curPage = 1;
                this.getSiteList();
            },
            // 指定表格行 class name
            getRowClassName({ row, rowIndex }) {
                row.index = rowIndex;
                if (rowIndex % 2 === 0) {
                    return 'one_row_background';
                } else if (rowIndex % 2 === 1) {
                    return 'pair_row_background';
                }
                return '';
            },
            // 获取企业是否存在站点
            getHasSite() {
                hasSite({
                    orgId: this.enterpriseId
                    // orgId: 10110
                }).then(res => {
                    if (res.code === '1' && res.data) {
                        this.hasCustomStationService = 0;
                        this.getSiteList();
                    } else {
                        this.hasCustomStationService = 1;
                    }
                });
            },
            // 获取wordPress网站列表
            getSiteList() {
                this.hasResult = false;
                getSiteList({
                    userId: this.userId,
                    orgId: this.enterpriseId,
                    // userId: 1,
                    // orgId: 10110,
                    pageNo: this.curPage,
                    pageSize: this.pageSize,
                    startDate: this.selectedDate[0] ? new Date(this.selectedDate[0]).format('yyyy-MM-dd') : '',
                    endDate: this.selectedDate[1] ? new Date(this.selectedDate[1]).format('yyyy-MM-dd') : ''
                }).then(response => {
                    this.webDate = [];
                    if (response.code === '1') {
                        const result = response.data.list || [];
                        this.$store.state.WPStationNum = result.length;
                        this.totalNum = response.data.total;
                        this.totalPageCount = response.data.totalPageCount;
                        // localStorage.setItem('WPStationNum', result.length);
                        this.webDate = result;
                        if (result.length === 0) {
                            this.hasResult = true;
                        }
                    } else {
                        this.hasResult = true;
                        this.$store.state.WPStationNum = 0;
                    }
                    this.spinShow = false;
                });
            },
            async getCountByDomainName(item) {
                const count = await util.ajaxJson({
                    url: '/report/visitorReport/getCountByDomainName',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        domainName: 'sdwt.xhlinbound.com',
                        endDate: '2019-10-15',
                        startDate: '2019-10-18'
                    }
                });
            },
            login(data, page) {
                if (data.status === 'off') {
                    this.$Message.info(this.$t('administerAMP.wordPress.infoText'));
                    return;
                }
                const weburl = data.weburl;
                // const weburl1 = data.weburl.split(':')[1];
                const webname = data.webname;
                const apiHost = `${weburl}/wp-login.php`;
                const passTemp = `${this.userName}123456`;
                const pass = Utils.encrypt(passTemp, '');
                const log = this.userName;
                const email = `${new Date().getTime()}@qq.com`;
                const time = this.getNowFormatDate(0);
                const token = this.userName + webname + time + this.enterpriseId;
                util.ajax({
                    url: `${weburl}/wp-json/wp/v2/register/1`,
                    method: 'post',
                    data: {
                        pass: pass,
                        log: log,
                        url: weburl,
                        email: email,
                        _token: md5(token)
                    }
                }).then(response => {
                    if (response.data.code == 1) {
                        util.ajax({
                            url: apiHost,
                            method: 'post',
                            data: {
                                log: log,
                                pwd: pass,
                                'wp-submit': '登录',
                                redirect_to: `${weburl}/wp-admin/`,
                                testcookie: '1'
                            }
                        }).then(res => {
                            const tempwindow = window.open('_blank');
                            tempwindow.location = weburl + page;
                        });
                    } else {
                        if (response.data.code == 3) {
                            var uname = response.data.result[0].uname;
                            var upass = response.data.result[0].upass;
                        } else if (response.data.code == 4) {
                            var uname = response.data.result.uname;
                            var upass = response.data.result.upass;
                        }
                        util.ajax({
                            url: apiHost,
                            method: 'post',
                            data: {
                                log: uname,
                                pwd: upass,
                                'wp-submit': '登录',
                                redirect_to: `${weburl}/wp-admin/`,
                                testcookie: '1'
                            }
                        }).then(res => {
                            const tempwindow = window.open('_blank');
                            tempwindow.location = weburl + page;
                        });
                    }
                });
            },
            // url:当前域名，type:按钮
            openPage(data, type) {
                let page = '';
                switch (type) {
                    case 1:
                    case 2:
                        page = '/wp-admin/edit.php';
                        break;
                    case 3:
                        page = '/wp-admin/edit.php?post_type=page';
                        break;
                    case 4:
                        page = '/wp-admin/upload.php';
                        break;
                }
                this.login(data, page);
            },
            switchStatus(val, site_id) {
                console.log(val, site_id, '切换开关');
                util.ajaxWebSite2({
                    url: '/wp-json/wp/v2/stopweb',
                    method: 'post',
                    data: {
                        status: val,
                        site_id: site_id
                    }
                }).then(response => {
                    this.$Message.info(response.data.message);
                });
            },
            getNowFormatDate(index) {
                const D1 = Date.parse(new Date());
                const D2 = D1 - index * 24 * 60 * 60 * 1000;
                const date = new Date(D2);
                const seperator1 = '-';
                const year = date.getFullYear();
                let month = date.getMonth() + 1;
                let strDate = date.getDate();
                if (month >= 1 && month <= 9) {
                    month = `0${month}`;
                }
                if (strDate >= 0 && strDate <= 9) {
                    strDate = `0${strDate}`;
                }
                const currentdate = year + seperator1 + month + seperator1 + strDate;
                return currentdate;
            },
            rowClick(row) {
                this.selectRow = row;
                // debugger
                this.visibleDetail = true;
            },
            changePage(page) {
                if (page <= this.totalPageCount) {
                    this.curPage = page;
                    this.getSiteList();
                }
            },
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                this.getSiteList();
            }
        },
        mounted() {
        },
        created() {
            // this.getWebUrl();
            // this.getSiteList();
            this.getHasSite();
        }
    };
</script>
<style lang="less">
    .webUrlList{
        .all-marketing-website{
            color: #333;
            font-weight: 500;
            font-size: 16px;
        }
        .webUrlList-title {
            background: #fff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 20px;
        }
        .custom-icon_next_e {
            font-size: 20px;
        }
        .headerClassName {
            color: #333;
        }
        .no-padding-cell {
            padding-left: 20px;
            font-size: 14px;
            color: #333;
        }
        .pair_row_background{
            background: #fff;
        }

        .one_row_background{
            background: #F7F8F9;
        }
        .mail-preview {
            font-size: 14px;
            margin-right: 20px;
        }
        .switch-title {
            color: #3b78de;
            font-size: 12px;
            margin-right: 20px;
        }
    }
    .jump-wordPress-btn{
        color: #333333;
        padding: 8px 10px;
        margin-right: 20px;
        border: 1px solid #ABBFD5;
        border-radius: 4px;
    }
    .jump-wordPress-btn-down {
        margin-left: 11px
    }
    .jump-wordPress-btn:hover{
        color: #333333;
        border-color: #ABBFD5;
    }
    .btn-ui{
        .ivu-btn {
            font-size: 12px;
            height: 33px;
            padding: 1px 20px;
            vertical-align: middle;
            text-align: center;
        }
        .ivu-btn:hover {
            background-color: #ebf0f7;
            color: rgba(0,0,0,.8);
            border: 1px solid #cbd6e2;
        }
        .ivu-btn:active {
            background-color: #dce6ef;
            color: rgba(0,0,0,.8);
            border: 1px solid #cbd6e2;
            outline:#dce6ef;
            box-shadow:2px 2px #dce6ef;
        }
        .ivu-btn:focus {
            box-shadow:0 0 0 2px #dce6ef;
        }
    }
    .table-title-ui{
        border: 0;
        border-left: 1px solid #cbd6e2;
        .ivu-table-header th {
            background-color: #ffffff !important;
            border-top: 1px solid #cbd6e2;
        }
    }
    .customSetting{
        .customSetting-header {
            padding: 20px 40px 10px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            & > div {
                display: flex;
                align-items: center;
            }
        }
        .headerClassName {
            color: #333;
        }
        .website-detail-logo {
            // width: 36px;
            height: 36px;
        }
        .custom-yonghushezhixiangqingye {
            font-size: 36px;
        }
        .custom-wangzhanxiangqingye {
            font-size: 36px;
        }
        .customSetting-header-title {
            font-size: 18px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.8);
            margin-left: 8px;
            // position: relative;
            // top: 2px;
        }
        .no-padding-cell {
            padding: 17px 20px;
            font-size: 14px;
        }
        .one_row_background{
            background: #F7F8F9;
        }
        .customSetting-edit {
            color: #3B78DE;
        }
        .customSetting-delete {
            color: #EA4335;
        }
        .save-ok, .save-cancel {
            font-size: 13px;
        }
        .save-ok {
            margin-right: 21px;
        }
        .customSetting-superAdmin {
            margin-left: 9px;
        }
        .pair_row_editing{
            padding: 13px 20px 12px;
        }
    }
    .website-detail-info {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.8);
        line-height: 22px;
        padding: 10px 20px 16px;
        .website-detail-title {
            color: rgba(0, 0, 0, 0.6);
            font-size: 12px;
            line-height: 18px;
            margin-bottom: 4px;
        }
    }
    .website-detail-line {
        background: #F5F6F9;
        height: 10px;
    }
    .website-detail-info-title {
        color: #FF752A;
        font-size: 14px;
        line-height: 22px;
        font-weight: 600;
        box-shadow: 0px 1px 0px #EAEAEA;
        margin: 12px 0 20px 20px;
        padding-bottom: 8px;
        span {
            border-bottom: 2px solid #FF752A;
            padding-bottom: 9px;
        }
    }
    .website-detail-bottom {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.8);
        padding-left: 20px;
        .website-detail-title {
            color: rgba(0, 0, 0, 0.6);
            font-size: 12px;
            margin-bottom: 4px;
        }
        .website-detail-item {
            margin-bottom: 16px;
            p {
                line-height: 22px;
            }
        }
    }
    .word-press-Leaflet-title{
        margin: 45px 0 50px;
        line-height: 52px;
        font-size: 26px;
        text-align: center;
        color: #333;
        background: url('~@/assets/images/wordpressTitlebj.png') no-repeat center center;
        background-size: 100%;
        span {
            color: #FF752A;
        }
    }
    .word-press-Leaflet {
        padding: 65px 0 85px;
        background: url('~@/assets/images/wordpressBj.png') no-repeat 0 0;
        background-size: cover;
        .word-press-Leaflet-subtitle {
            margin-bottom: 16px;
            line-height: 22px;
            font-size: 20px;
            color: #FF752A;
        }
        .word-press-Leaflet-text{
            line-height: 24px;
            font-size: 14px;
            color: #333;
            margin-bottom: 32px;
        }
    }
</style>
<style lang="less" scoped>
    .operate_ico:hover{
        color: #3B78DE;
    }
    .web-block{
        padding: 20px 30px 35px 30px;
        margin-bottom: 30px;
        box-shadow: 0 2px 4px 0 rgba(186, 186, 186, 0.5);
        border-radius: 4px;
        border-radius: 4px;
        background-color: #fff;
        /deep/ .ivu-table th {
            border-bottom: 1px solid #dde1e6;
        }
        /deep/ .ivu-table-border th {
            border-right: 1px solid #dde1e6;
        }
        /deep/ .ivu-table-border td {
            border-right: 1px solid #dde1e6;
        }
        /deep/ .table-title-ui .ivu-table-header th {
            border-top: 1px solid #dde1e6;
        }
        /deep/ .table-title-ui {
            border-left: 1px solid #dde1e6;
        }
        /deep/ .ivu-table-border:after {
            background-color: #dde1e6;
        }
        /deep/ .ivu-table:before {
            background-color: #dde1e6;
        }
    }
    .url-hover{
        color:#3b78de;
    }
    .url-hover:hover{
        color: #2d63bc;
    }

    .website-title {
        cursor: pointer;
        color: #3B78DE;
        font-size: 14px;
        overflow:hidden;
        text-overflow:ellipsis;
        display:-webkit-box;
        -webkit-box-orient:vertical;
        -webkit-line-clamp:2;
        p{
            line-height: 18px; 
        }
    }

</style>
