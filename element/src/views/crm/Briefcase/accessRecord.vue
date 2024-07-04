<template>
    <div class="access_record_container">
        <div class="cards_container" v-if="accessData">
            <div v-for="item in accessData">
                <Card class="access_record_card" shadow="never">
                    <div class="card_info_left">
                        <div>
<!--                            <img :src="item.fbAvatar" alt="" class="card_img" v-if="item.fbAvatar">-->
                            <Avatar v-if="item.fbAvatar" :src="item.fbAvatar" :size="44"/>
                            <svg v-else class="dropdown-avatar" aria-hidden="true">
                                <use xlink:href="#custom-service-avatar"></use>
                            </svg>
                            <span class="card_info_name">{{(item.fbNickname ? item.fbNickname : '未知')}} <span>({{(item.fbEmail != '未绑定邮箱' && item.fbEmail !='' ? item.fbEmail : '--')}})</span></span>
                            <span class="card_info_time">{{item.createTime}}</span>
                        </div>
                        <div>
                            <span style="position: relative;bottom: 48px;font-size: 12px">访问了你的文件
                                <Tooltip :content="item.shareFilename" placement="top"><span>”{{item.shareFilename | ellipsis}}“</span></Tooltip>
                                ，来自{{item.logType}}分享</span>
                        </div>
                    </div>
                    <div class="card_button_right">
<!--                        <div class="card_button_ding send_ding" @click="Ding(item.accId)" :style="{visibility:(item.onlineStatus?'visible':'hidden')}">钉一下</div>-->
                        <div class="send_ding ding_buttons">
                            <Button @click="Ding(item.accId)"
                                    :loading="item.loadingStatus"
                                    class="card_button_ding"
                                    v-if="item.loadingStatus">
                                钉一下
                            </Button>
                            <Button @click="Ding(item.accId)"
                                    class="card_button_ding"
                                    :disabled="!item.onlineStatus"
                                    v-else>
                                钉一下
                            </Button>
                        </div>
                        <div>
                            <span class="card_button_block visitor_block" style="display: block" v-if="item.isBlock === 0" @click="setBlock(item.visitorId)">屏蔽</span>
                            <span class="card_button_block visitor_unblock" style="display: block;left: 27px" v-else @click="setUnblock(item.visitorId)">解除屏蔽</span>
                        </div>
                    </div>
                </Card>
            </div>


<!--            <Card class="access_record_card">-->
<!--                <div class="card_info_left">-->
<!--                  <div>-->
<!--                      <img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587730602101&di=7cc399633dfdae084651da4df15e8b21&imgtype=0&src=http%3A%2F%2Fimg.bqatj.com%2Fimg%2F2251fa31092b747f.jpg" alt="" class="card_img">-->
<!--                      <span class="card_info_name">香蕉君 <span>(banana@163.com)</span></span>-->
<!--                      <span class="card_info_time">2020-04-01 11:50</span>-->
<!--                  </div>-->
<!--                  <div>-->
<!--                      <span>访问了你的文件”出海企业-应对疫情沟通指南.pdf“，来自Facebook分享</span>-->
<!--                  </div>-->
<!--                </div>-->
<!--                <div class="card_button_right">-->
<!--                    <div class="card_button_ding">钉一下</div>-->
<!--                    <span class="card_button_block" style="display: block">屏蔽</span>-->
<!--                </div>-->
<!--            </Card>-->
<!--            <Card class="access_record_card">-->
<!--                <div class="card_info_left">-->
<!--                    <div>-->
<!--                        <img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587730602101&di=7cc399633dfdae084651da4df15e8b21&imgtype=0&src=http%3A%2F%2Fimg.bqatj.com%2Fimg%2F2251fa31092b747f.jpg" alt="" class="card_img">-->
<!--                        <span class="card_info_name">香蕉君 <span>(banana@163.com)</span></span>-->
<!--                        <span class="card_info_time">2020-04-01 11:50</span>-->
<!--                    </div>-->
<!--                    <div>-->
<!--                        <span>访问了你的文件”出海企业-应对疫情沟通指南.pdf“，来自Facebook分享</span>-->
<!--                    </div>-->
<!--                </div>-->
<!--                <div class="card_button_right">-->
<!--                    <div class="card_button_ding">钉一下</div>-->
<!--                    <span class="card_button_block" style="display: block">屏蔽</span>-->
<!--                </div>-->
<!--            </Card>-->
<!--            <Card class="access_record_card">-->
<!--                <div class="card_info_left">-->
<!--                    <div>-->
<!--                        <img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587730602101&di=7cc399633dfdae084651da4df15e8b21&imgtype=0&src=http%3A%2F%2Fimg.bqatj.com%2Fimg%2F2251fa31092b747f.jpg" alt="" class="card_img">-->
<!--                        <span class="card_info_name">香蕉君 <span>(banana@163.com)</span></span>-->
<!--                        <span class="card_info_time">2020-04-01 11:50</span>-->
<!--                    </div>-->
<!--                    <div>-->
<!--                        <span>访问了你的文件”出海企业-应对疫情沟通指南.pdf“，来自Facebook分享</span>-->
<!--                    </div>-->
<!--                </div>-->
<!--                <div class="card_button_right">-->
<!--                    <div class="card_button_ding">钉一下</div>-->
<!--                    <span class="card_button_block" style="display: block">屏蔽</span>-->
<!--                </div>-->
<!--            </Card>-->
<!--            <Card class="access_record_card">-->
<!--                <div class="card_info_left">-->
<!--                    <div>-->
<!--                        <img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587730602101&di=7cc399633dfdae084651da4df15e8b21&imgtype=0&src=http%3A%2F%2Fimg.bqatj.com%2Fimg%2F2251fa31092b747f.jpg" alt="" class="card_img">-->
<!--                        <span class="card_info_name">香蕉君 <span>(banana@163.com)</span></span>-->
<!--                        <span class="card_info_time">2020-04-01 11:50</span>-->
<!--                    </div>-->
<!--                    <div>-->
<!--                        <span>访问了你的文件”出海企业-应对疫情沟通指南.pdf“，来自Facebook分享</span>-->
<!--                    </div>-->
<!--                </div>-->
<!--                <div class="card_button_right">-->
<!--                    <div class="card_button_ding">钉一下</div>-->
<!--                    <span class="card_button_block" style="display: block">屏蔽</span>-->
<!--                </div>-->
<!--            </Card>-->
<!--            <Card class="access_record_card">-->
<!--                <div class="card_info_left">-->
<!--                    <div>-->
<!--                        <img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587730602101&di=7cc399633dfdae084651da4df15e8b21&imgtype=0&src=http%3A%2F%2Fimg.bqatj.com%2Fimg%2F2251fa31092b747f.jpg" alt="" class="card_img">-->
<!--                        <span class="card_info_name">香蕉君 <span>(banana@163.com)</span></span>-->
<!--                        <span class="card_info_time">2020-04-01 11:50</span>-->
<!--                    </div>-->
<!--                    <div>-->
<!--                        <span>访问了你的文件”出海企业-应对疫情沟通指南.pdf“，来自Facebook分享</span>-->
<!--                    </div>-->
<!--                </div>-->
<!--                <div class="card_button_right">-->
<!--                    <div class="card_button_ding">钉一下</div>-->
<!--                    <span class="card_button_block" style="display: block">屏蔽</span>-->
<!--                </div>-->
<!--            </Card>-->
<!--            <Card class="access_record_card">-->
<!--                <div class="card_info_left">-->
<!--                    <div>-->
<!--                        <img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587730602101&di=7cc399633dfdae084651da4df15e8b21&imgtype=0&src=http%3A%2F%2Fimg.bqatj.com%2Fimg%2F2251fa31092b747f.jpg" alt="" class="card_img">-->
<!--                        <span class="card_info_name">香蕉君 <span>(banana@163.com)</span></span>-->
<!--                        <span class="card_info_time">2020-04-01 11:50</span>-->
<!--                    </div>-->
<!--                    <div>-->
<!--                        <span>访问了你的文件”出海企业-应对疫情沟通指南.pdf“，来自Facebook分享</span>-->
<!--                    </div>-->
<!--                </div>-->
<!--                <div class="card_button_right">-->
<!--                    <div class="card_button_ding">钉一下</div>-->
<!--                    <span class="card_button_block" style="display: block">屏蔽</span>-->
<!--                </div>-->
<!--            </Card>-->
<!--            <Card class="access_record_card">-->
<!--                <div class="card_info_left">-->
<!--                    <div>-->
<!--                        <img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587730602101&di=7cc399633dfdae084651da4df15e8b21&imgtype=0&src=http%3A%2F%2Fimg.bqatj.com%2Fimg%2F2251fa31092b747f.jpg" alt="" class="card_img">-->
<!--                        <span class="card_info_name">香蕉君 <span>(banana@163.com)</span></span>-->
<!--                        <span class="card_info_time">2020-04-01 11:50</span>-->
<!--                    </div>-->
<!--                    <div>-->
<!--                        <span>访问了你的文件”出海企业-应对疫情沟通指南.pdf“，来自Facebook分享</span>-->
<!--                    </div>-->
<!--                </div>-->
<!--                <div class="card_button_right">-->
<!--                    <div class="card_button_ding">钉一下</div>-->
<!--                    <span class="card_button_block" style="display: block">屏蔽</span>-->
<!--                </div>-->
<!--            </Card>-->
        </div>
        <div class="cards_container" v-else>
            <div class="empty-content">
                <img src="../../../svg/no-data.svg" alt="">
                <p style="font-size:12px;color:rgb(0,0,0,.4);margin-top:12px;">{{$t('facebook.homepagedynamic.noData')}}</p>
            </div>
        </div>
        <div style="overflow: hidden" class="card_bottom">
            <Page :page-size="pageSize"
                  :page-sizes="pageSizeOpts"
                  :total="totalNum"
                  :current-page="curPage"
                  layout="total, prev, pager, next, sizes, jumper"
                  class="pageWrap-right"
                  @current-change="changePage"
                  @size-change="pageSizeChange">
            </Page>
        </div>
        <Modal :visible.sync="visible_block"
               :modal="false"
               title="系统提示"
               width="540px">
            <span>确认屏蔽该用户的互动提醒？</span>
            <div slot="footer">
                <Button @click="visible_block = false">取消</Button>
                <Button type="primary" @click="handleBlock(0, id)">确定</Button>
            </div>
        </Modal>
        <Modal :visible.sync="visible_unblock"
               :modal="false"
               title="系统提示"
               width="540px">
            <span>确认收取该用户的互动提醒？</span>
            <div slot="footer">
                <Button @click="visible_unblock=false">取消</Button>
                <Button type="primary" @click="handleBlock(1, id)">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '../../../libs/util';
    import { mapState } from 'vuex';
    export default {
        name: 'accessRecord',
        components: {},
        data() {
            return {
                loading: false, // 加载
                curPage: 1,
                pageSize: 10,
                maxPageNum: 1,
                pageSizeOpts: [10, 20, 50],
                totalNum: 0,
                accessData: [],
                visitorIds: [], // 访客id集合
                piwikIds: [], // piwikID集合
                visible_block: false, // 控制屏蔽弹窗的显示
                visible_unblock: false,
                id: null, // 控制屏蔽
                accountIds: [],
                loadingTimer: null
            };
        },
        computed: {
            ...mapState({
                visitorOnlineStatus: state => state.visitorOnlineStatus,
                nim: state => state.isServerOnlineChecked
            })
        },
        methods: {
            // 获取访问记录数据
            initNIM() {
                this.visitorIds = [];
                this.piwikIds = [];
                this.accountIds = [];
                util.ajax233({
                    url: '/history/pageByParam',
                    method: 'post',
                    data: {
                        pageNo: this.curPage,
                        pageSize: this.pageSize
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.accessData = res.data.data.list;
                        this.totalNum = res.data.data.total;
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);
                        if (this.accessData) {
                            this.accessData.forEach(item => {
                                this.visitorIds.push(item.visitorId);
                                this.piwikIds.push(item.pkId);
                                this.$set(item, 'onlineStatus', false);
                                if (this.nim) {
                                    this.$set(item, 'loadingStatus', true);
                                } else {
                                    this.$set(item, 'loadingStatus', false);
                                }
                                // 查询accId 并将对应的accID作为属性分配给accessData
                                // 设置为已读
                            });
                        }
                        this.getAccIDs();
                    }
                });
            },
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    this.initNIM();
                    this.loadingTimer = setTimeout(this.loadButton, 30000);
                }
            },
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                this.initNIM();
                this.loadingTimer = setTimeout(this.loadButton, 30000);
            },
            // 获取账号id
            getAccIDs() {
                console.log(this.visitorIds);
                this.accountIds = [];
                const temp = JSON.parse(JSON.stringify(this.visitorIds));
                return new Promise(resolve => {
                    util.ajaxInternationalJson({
                        url: '/visitor/getAccidFromVisitorIds',
                        method: 'post',
                        data: temp
                    }).then(res => {
                        if (res.data.code === '1') {
                            const data = res.data.data;
                            const keys = Object.keys(data);
                            console.log('the data is', data);
                            console.log('the keys are', keys);
                            if (this.accessData) {
                                this.accessData.forEach((item, index) => {
                                    const id = item.visitorId;
                                    if (keys.includes(id)) {
                                        console.log('----', data[id]);
                                        this.$set(item, 'accId', data[id]);
                                        if (data[id]) {
                                            this.accountIds.push(data[id]);
                                        }
                                    }
                                });
                                this.$store.commit('subscribeEvent', this.accountIds);
                                if (this.visitorOnlineStatus.length && this.nim) {
                                    if (this.accessData) {
                                        this.accessData.forEach((data, i) => {
                                            this.visitorOnlineStatus.forEach((item, index) => {
                                                if (item.account === data.accId) {
                                                    const temp = JSON.parse(item.serverConfig);
                                                    const key = Object.keys(temp);
                                                    const value = Object.values(temp)[0][0];
                                                    console.log('?????', key, value);
                                                    if (key.indexOf('online') !== -1 && value !== 0) {
                                                        console.log('chengle!');
                                                        if (value) {
                                                            this.$set(data, 'onlineStatus', true);
                                                            this.$set(data, 'loadingStatus', false);
                                                        } else {
                                                            this.$set(data, 'onlineStatus', false);
                                                            this.$set(data, 'loadingStatus', false);
                                                        }
                                                    } else {
                                                        this.$set(data, 'loadingStatus', false);
                                                    }
                                                }
                                            });
                                        });
                                    }
                                }
                            }
                            resolve(true);
                        } else {
                            console.log('失败');
                        }
                    });
                });
            },
            handleBlock(flag, id) {
                // 0---屏蔽接口 1---解除屏蔽接口
                if (flag === 0) {
                    util.ajax233({
                        url: '/block/set',
                        method: 'post',
                        data: {
                            visitorId: id
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            this.visible_block = false;
                            this.accessData.forEach(item => {
                                if (item.visitorId === id) {
                                    this.$set(item, 'isBlock', 1);
                                }
                            });
                        }
                    });
                } else if (flag === 1) {
                    util.ajax233({
                        url: '/block/removeShield',
                        method: 'post',
                        data: {
                            visitorId: id
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            this.visible_unblock = false;
                            this.accessData.forEach(item => {
                                if (item.visitorId === id) {
                                    this.$set(item, 'isBlock', 0);
                                }
                            });
                        }
                    });
                }
            },
            setBlock(id) {
                this.id = id;
                this.visible_block = true;
            },
            setUnblock(id) {
                this.id = id;
                this.visible_unblock = true;
            },
            Ding(id) {
                this.$store.commit('sendCustomDing', id);
            },
            subscribe() {

            },
            loadButton() {
                if (this.accessData) {
                    this.accessData.forEach(item => {
                        if (!item.onlineStatus) {
                            this.$set(item, 'loadingStatus', false);
                        }
                    });
                }
            }
        },
        created() {
            console.log('created!');
            this.initNIM();
        },
        mounted() {
            setTimeout(() => {
                if (!this.nim) {
                    this.$Message.warning('您尚未上线');
                }
            }, 5000);
            this.loadingTimer = setTimeout(this.loadButton, 30000);
        },
        beforeDestroy() {
            clearTimeout(this.loadingTimer);
        },
        filters: {
            ellipsis(value) {
                if (!value) {
                    return '';
                }
                if (value.length > 30) {
                    return `${value.slice(0, 30)}...`;
                }
                return value;
            }
        },
        watch: {
            visitorOnlineStatus: {
                async handler(val) {
                    console.log('111111', val);
                    await this.getAccIDs().then(() => {
                        if (this.accessData) {
                            this.accessData.forEach((data, i) => {
                                val.forEach((item, index) => {
                                    console.log('onetime!!!!');
                                    console.log('2222222', item.account);
                                    console.log('2222222', data.accId);
                                    if (item.account === data.accId) {
                                        const temp = JSON.parse(item.serverConfig);
                                        const key = Object.keys(temp);
                                        const value = Object.values(temp)[0][0];
                                        console.log('?????', key, value);
                                        if (key.indexOf('online') !== -1 && value !== 0) {
                                            console.log('chengle!');
                                            if (value) {
                                                this.$set(data, 'onlineStatus', true);
                                                this.$set(data, 'loadingStatus', false);
                                            } else {
                                                this.$set(data, 'onlineStatus', false);
                                                this.$set(data, 'loadingStatus', false);
                                            }
                                        } else {
                                            this.$set(data, 'loadingStatus', false);
                                        }
                                    }
                                });
                            });
                        }
                    });
                },
                deep: true,
                immediate: true
            },
            nim: {
                handler(val) {
                    console.log('nim发生了变化', val);
                    if (!val) {
                        this.accessData.forEach(item => {
                            this.$set(item, 'onlineStatus', false);
                            this.$set(item, 'loadingStatus', false);
                        });
                    }
                },
                deep: true,
                immediate: true
            }
        }
    };
</script>

<style scoped lang="less">
    .access_record_container {
        background-color: #f4f5f8 !important;
        padding-top: 10px;
        height: 100%;
        .cards_container {
            height: calc(100% -53px);
            overflow: scroll;
            .access_record_card {
                width: 700px !important;
                height: 110px !important;
                margin-bottom: 20px;
                margin-left: 30px;
                margin-top: 20px;
                .card_info_left {
                    .dropdown-avatar {
                        width: 44px;
                        height: 44px;
                        fill: currentColor;
                        overflow: hidden;
                    }
                    .card_info_name {
                        display: block;
                        position: relative;
                        bottom: 48px;
                        left: 48px;
                        margin-left: 8px;
                    }
                    .card_info_time {
                        display: block;
                        position: relative;
                        bottom: 48px;
                        left: 48px;
                        font-size: 12px;
                        margin-left: 8px;
                    }
                }
                .card_button_right {
                    float: right;
                    position: relative;
                    bottom: 132px;
                    .is-loading{
                        border-color: #ffffff !important;
                        background-color: #000000 !important;
                        color: #ffffff;
                        border-radius: 5px;
                    }
                    .el-button--default {
                        background-color: #6e819a !important;
                        color: #ffffff;
                        border-radius: 5px;
                        border-color: #6e819a !important;
                        opacity: 0.7;
                    }
                    .card_button_ding:hover {
                    }
                    .ding_buttons {
                    }
                    .is-disabled {
                        background-color: #e7ecf2 !important;
                        color: #6E819A !important;
                        border-color: #ffffff !important;
                        font-size: 14px;
                        span {
                            opacity: 40%;
                            font-size: 14px;
                            color: #6E819A !important;
                            font-weight: 700;
                        }
                    }
                    .card_button_block {
                        font-size: 12px;
                        color: #3B78DE;
                        letter-spacing: 0;
                        line-height: 18px;
                        position: relative;
                        top: 22px;
                        left: 50px;
                        cursor: pointer;
                    }
                    .card_button_unblock {
                        font-size: 12px;
                        color: #3B78DE;
                        letter-spacing: 0;
                        line-height: 18px;
                        position: relative;
                        top: 22px;
                        left: 50px;
                        cursor: pointer;
                    }
                }
                .card_img {
                    width: 44px;
                    height: 44px;
                    border-radius: 50px;
                }
            }
        }
        .card_bottom {
            height: 53px;
            background-color: #ffffff;
        }
        .empty-content {
            text-align: center;
            margin-top: calc(~"50vh - 150px");
        }
    }
</style>
