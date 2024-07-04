<template>
    <div>
        <div class="webUrlList" :style="{position: 'relative', height: autoHeight+'px', 'overflow-y': 'auto'}">
            <div class="webUrlList-title">
                <div>全部营销站</div>
                <div class="table_time_picker">
                    <span class="time_picker_time">{{$t('seo.list.indicatorTime')}}</span>
                    <DatePicker v-model="selectedDate"
                        type="daterange"
                        range-separator="-"
                        :default-value="new Date().getTime()"
                        value-format="yyyy-MM-dd"
                        format="yyyy-MM-dd"
                        @change="change_filter_tag"
                        size="small"
                        :clearable="false"
                        class="change-subject-time"></DatePicker>
                </div>
            </div>
            <div class="table" style="margin-top: 8px">
                <Table
                    :data="webDate"
                    :height="table_height"
                    size="medium"
                    highlight-current-row
                    ref="table"
                    stripe
                    class="tabmain">
                    <TableColumn align="center" class-name="no-padding-cell" prop="weburl" :label="$t('administerAMP.wordPress.domainText')" width="270"></TableColumn>
                    <TableColumn align="center" class-name="no-padding-cell" prop="webname" :label="$t('administerAMP.wordPress.netNameText')" width="270"></TableColumn>
                    <TableColumn align="center" class-name="no-padding-cell" prop="status" :label="$t('administerAMP.wordPress.stateText')" min-width="100">
                        <template slot-scope="scope">
                            <!-- overflow: 'initial' -->
                            <el-switch v-model="scope.row.status"  active-value="on"
                                       inactive-value="off" @change="switchStatus($event,scope.row.site_id)"></el-switch>
                        </template>
                    </TableColumn>
                    <TableColumn align="center" class-name="no-padding-cell" prop="creatime" :label="$t('administerAMP.wordPress.openTimeText')" min-width="200">
                        <template slot-scope="scope">
                            <div style="color:#fa8241">{{scope.row.creatime}}</div>
                        </template>
                    </TableColumn>
                    <TableColumn align="center" class-name="no-padding-cell" prop="web_endtime" :label="$t('administerAMP.wordPress.stopTimeText')" min-width="200">
                        <template slot-scope="scope">
                            <div style="color:#fa8241">{{scope.row.web_endtime}}</div>
                        </template>
                    </TableColumn>
                    <TableColumn align="center" prop="operate" :label="$t('administerAMP.wordPress.adminText')">
                        <template slot-scope="{row}">
                            <Icon class="operate_ico" custom="custom custom-admin-view" style="font-size: 18px;color: #677F99;cursor: pointer" @click="login(row, '/admin')"></Icon>
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
            <!-- 加载图标 -->
            <!-- <Spin fix v-show="spinShow" size="large"></Spin> -->
            <!-- 暂无数据 -->
            <!-- <div v-if="hasResult" style="text-align: center;padding-top: 300px;height:750px;">暂无数据</div> -->
            <div v-if="hasResult" style="text-align: center;padding-top: 300px;height:750px;">{{$t('crm.Table.noData')}}</div>
        </div>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import md5 from 'js-md5';
    import Utils from '@/utils/index';
    export default {
        name: 'website_manager',
        data() {
            return {
                webDate: [
                    //  {
                    // data:[{
                    //     webname:'111',
                    //     weburl:'http://web.xhlleadscloud.com',
                    // }]
                    // },
                    {
                        webname:'111',
                        weburl:'2222'
                    },
                    {
                        webname:'111',
                        weburl:'2222'
                    },
                    {
                        webname:'111',
                        weburl:'2222'
                    }
                ],
                spinShow: true, // 改
                hasResult: false, // 控制删除弹窗
                selectedDate: [],
                pageSize: null,
                pageSizeOpts: [20, 50, 100],
                totalNum: null,
                curPage: 1
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
                return document.documentElement.clientHeight - 130;
            },
            table_height() {
                let temp = this.window_height ? this.window_height - 204 : document.body.clientHeight - 204;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            }
        },
        methods: {
            // filterTags 组件内部修改筛选条件后触发的方法
            change_filter_tag(key) {
                // this.$store.commit('setSubjectDate', this.selectedDate);
                // this.getAllSubjects();
            },
            // 获取wordPress网站列表
            getWebUrl() {
                this.hasResult = false;
                util.ajaxWebSite2({
                    url: `/wp-json/wp/v2/getweburl/${this.enterpriseId}`,
                    method: 'get'
                }).then(response => {
                    this.webDate = [];
                    if (response.data.code === '1') {
                        const result = response.data.result;
                        this.$store.state.WPStationNum = result.length;
                        // localStorage.setItem('WPStationNum', result.length);
                        if (result.length === 0) {
                            this.hasResult = true;
                        }
                        result.map(async item => {
                            const obj = {
                                data: []
                            };
                            const count = await util.ajaxJson({
                                url: '/report/visitorReport/getCountByDomainName',
                                method: 'post',
                                data: {
                                    orgId: this.enterpriseId,
                                    domainName: item.weburl.split('//')[1],
                                    endDate: this.getNowFormatDate(0),
                                    startDate: this.getNowFormatDate(7)
                                }
                            });
                            //                            item.scanCount = count.data.scanCount;
                            //                            item.visitorCount = count.data.visitorCount;
                            const temp = count.data;
                            if (temp.code === '1') {
                                item.scanCount = temp.data.scanCount;
                                item.visitorCount = temp.data.visitorCount;
                            }
                            obj.data.push(item);
                            this.webDate.push(obj);
                        });
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
            changePage() {},
            pageSizeChange() {}
        },
        mounted() {

        },
        created() {
            this.getWebUrl();
        }
    };
</script>
<style lang="less">
    .webUrlList{
        .webUrlList-title {
            background: #fff;
            display: flex;
            justify-content: space-between;
            padding: 18px 20px;
        }
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

</style>
