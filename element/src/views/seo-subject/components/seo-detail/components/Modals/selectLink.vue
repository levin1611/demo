<template>
    <Modal :visible="visible"
           width="553px"
           :close-on-click-modal="false"
           :append-to-body="true"
           :close-on-press-escape="false"
           @close="handleClose" >
        <div slot="title">
            <div v-if="isHasSite"
                 class="selectLink_header">
                <h3>{{$t('seo.detailSelect.addCurrPage')}}</h3>
                <h5>{{$t('seo.detailSelect.addCurrPageTip')}}</h5>
            </div>
            <h3 v-else>{{$t('seo.detailSelect.tipsText')}}</h3>
        </div>
        <div v-if="isHasSite">
            <div class="site_selection">
                <span class="margin-right-10">{{ $t('seo.detailSelect.website') }}</span>
                <Select v-model="siteIdWithType"
                        filterable
                        :placeholder="$t('seo.detailSelect.pleaseText')"
                        popper-class="site_selection_popper"
                        @change="handleSiteChange">
                    <Option v-for="item in siteList"
                            :key="`${item.id}-${item.site_type}`"
                            :label="`[${$t(`seo.detailSelect.siteType_${item.site_type}`)}]${item.title}`"
                            :value="`${item.id}-${item.site_type}`">
                        <TooltipAuto :content="`[${$t(`seo.detailSelect.siteType_${item.site_type}`)}]${item.title}`"></TooltipAuto>
                    </Option>
                </Select>
            </div>
            <div class="selection_body" v-loading="loading">
                <Tabs v-model="kindId"
                      @tab-click="handleTabChange">
                    <TabPane v-for="item in kinds"
                             :key="item.id"
                             :name="item.id"
                             :label="kindLangObj[item.title] || item.title">
                        <!--搜索框-->
                        <Input v-model="searchVal"
                               :placeholder="$t('seo.detailSelect.pleaseSelectText')"
                               @keyup.enter.native="handleSearch"
                               style="margin-bottom: 10px">
                            <Icon slot="suffix"
                                  class="el-input__icon custom custom-search"
                                  style="cursor: pointer; color: #A9B9C9"
                                  @click="handleSearch">
                            </Icon>
                        </Input>
                        <ul style="padding-left: 0">
                            <li style="list-style: none" v-for="item in urls" class="entity_li">
                                <Row type="flex"
                                     align="middle"
                                     :gutter="20"
                                     @click.native="selectedUrl = item.id">
                                    <Col :span="22">
                                        <span><span v-if="item.kind_name">{{`[${item.kind_name}]`}}</span>{{item.title}}</span>
                                    </Col>
                                    <Col :span="2">
                                        <Radio v-model="selectedUrl" :label="item.id" @change="handleRadioChange(item)"></Radio>
                                    </Col>
                                </Row>
                            </li>
                        </ul>
                    </TabPane>
                </Tabs>
            </div>
        </div>
        <div v-else class="no_site_body">
            <span class="no_site_tip">{{$t('seo.detailSelect.noHaveText')}}<span @click="toCreateSite" class="hoverBtn">{{$t('seo.detailSelect.establishText')}}</span></span>
        </div>
        <div slot="footer" v-if="isHasSite">
            <Button @click="handleClose">{{$t('seo.detailSelect.cancel')}}</Button>
            <Button type="primary" @click="selectEntity" class="add-inner-link-save">{{$t('seo.detailSelect.define')}}</Button>
        </div>
    </Modal>
</template>

<script>
    import util from '../../../../../../libs/util';
    import { mapState, mapGetters } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    export default {
        name: 'selectLink',
        props: ['visible', 'detailsObj', 'id'],
        computed: {
            ...mapState({
                subjectId: state => state.seo.subjectId,
                // 获取权限按钮
                button_list: state => state.app.button_list
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            // 判断按钮权限
            authorized_button() {
                return {
                    'template-station': !HANDLE_BUTTON(BUTTON_IDS.website.SEO.templateStation, this.button_list)
                };
            },
            // 选择的网站
            siteId() {
                return this.siteIdWithType.split('-')[0] || '';
            }
        },
        data() {
            return {
                // 选中的网站 id + type
                siteIdWithType: '',
                // 选择的网站的类型, 1: AMP 网站, 2: 营销站
                siteType: '',
                // 分类的多语言
                kindLangObj: {
                    '文章': this.$t('seo.detailSelect.kind_Article'),
                    '产品': this.$t('seo.detailSelect.kind_Product'),
                    '新闻': this.$t('seo.detailSelect.kind_New'),
                    '应用案例': this.$t('seo.detailSelect.kind_ApplicationCare'),
                    '解决方案': this.$t('seo.detailSelect.kind_Solution')
                },
                kinds: [], // 模板所拥有的的实体页面
                searchVal: '', // 搜索值
                urls: [], // 所有的实体数据
                selectedUrl: null, // 选中的实体页面
                siteList: [],
                loading: false,
                kindId: 0,
                isHasSite: true
            };
        },
        methods: {
            handleClose() {
                this.$emit('update:visible', false);
            },
            init() {
                // 拉取所有的网站列表
                this.getAllSites();
            },
            getAllSites() {
                util.ajaxAMP({
                    url: '/trunk/site/allList',
                    method: 'post',
                    data: {
                        page: 1,
                        page_size: 9999
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        this.siteList = res.data.data.items;
                        /* 网站不为空的情况下默认选中第一个网站并获取所有实体 */
                        if (res.data.data.total) {
                            this.handleSiteChange(`${this.siteList[0].id}-${this.siteList[0].site_type}`);

                            this.isHasSite = true;
                        } else {
                            this.isHasSite = false;
                        }
                        /* 如果用户没有网站 跳转到网站管理页面 */
                    } else {
                        this.$Message.warning(res.data.msg);
                    }
                }).catch(e => {
                    this.$Message.error(this.$t('seo.detailSelect.errorMsg'));
                });
            },
            handleSiteChange(val) {
                // 相关数据赋值
                this.siteIdWithType = val;
                this.siteType = val.split('-')[1];
                // 拿到被选中站的数据
                const selectedSite = this.siteList.find(item => `${item.id}-${item.site_type}` === val);
                this.kinds = [{
                    id: '0',
                    name: 'all',
                    title: this.$t('seo.detailSelect.allText')
                }].concat(selectedSite.kinds);

                // 默认选中"全部"分类
                this.kindId = '0';
                this.handleTabChange();
            },
            // 获取页面列表
            getPages(siteId, kindId, siteType) {
                if (`${siteType}` === '1') {
                    // AMP 站
                    this.getUrls(this.siteId, kindId);
                } else if (`${siteType}` === '2') {
                    // 营销站
                    this.getMarketingUrls(this.siteId, kindId);
                }
            },
            // 获取 AMP 站页面列表
            getUrls(siteId, kindId) {
                this.loading = true;
                util.ajaxAMP({
                    url: '/page/getUrlSelector',
                    method: 'post',
                    data: {
                        kind_id: kindId,
                        page: 1,
                        page_size: 9999,
                        site_id: siteId,
                        show_topic: 1
                    }
                }).then(res => {
                    this.loading = false;
                    if (res.data.code === 0) {
                        this.urls = res.data.data;
                    }
                });
            },
            // 获取营销站页面列表
            getMarketingUrls(siteId, kindId) {
                this.loading = true;
                util.ajaxAMP({
                    url: '/page/getSitePage',
                    method: 'post',
                    data: {
                        kind_id: kindId,
                        page: 1,
                        page_size: 9999,
                        site_id: siteId,
                        show_topic: 1
                    }
                }).then(res => {
                    this.loading = false;
                    if (res.data.code === 0) {
                        this.urls = res.data.data.map(item => {
                            item.originalId = item.id;
                            item.id = item.page_id;
                            return item;
                        });
                    }
                });
            },
            // 切换页面分组
            handleTabChange() {
                this.searchVal = '';
                this.getPages(this.siteId, this.kindId, this.siteType);
            },
            // 点击搜索
            handleSearch() {
                // 基础数据
                const postData = {
                    method: 'post',
                    data: {
                        kind_id: this.kindId,
                        page: 1,
                        page_size: 9999,
                        site_id: this.siteId,
                        show_topic: 1,
                        keyword: this.searchVal
                    }
                };
                const type = `${this.siteType}`;
                // 根据站点类型不同加不同参数
                if (type === '1') {
                    // AMP 站

                    postData.url = '/page/getUrlSelector';
                } else if (type === '2') {
                    // 营销站

                    postData.url = '/page/getSitePage';
                }

                // 发送请求
                util.ajaxAMP(postData).then(res => {
                    if (res.data.code === 0) {
                        const resData = res.data.data;
                        if (type === '2') {
                            resData.forEach(item => {
                                item.originalId = item.id;
                                item.id = item.page_id;
                            });
                        }
                        this.urls = resData;
                    }
                });
            },
            selectEntity() {
                util.ajaxAMP({
                    url: '/seotopic/edit',
                    method: 'post',
                    data: {
                        name: this.detailsObj['name'],
                        topic_id: this.id,
                        site_id: this.siteId,
                        parent_id: this.id === this.subjectId ? -1 : this.subjectId,
                        type: `${this.siteType}` === '2' ? 3 : 1, // 1: AMP 站内链, 2: 外链, 3: 营销站内链
                        object: this.selectedUrl
                    }
                }).then(async res => {
                    if (res.data.code === 0) {
                        /* 更新editcontent的内容 */
                        await this.updateContent();
                        /* 更新detail页面的内容 */
                        /* 关闭弹窗 */
                        this.handleClose();
                    } else {
                        this.$Message.warning(res.data.msg);
                    }
                });
            },
            updateContent() {
                return new Promise((resolve, reject) => {
                    this.$emit('updateContent');
                    resolve(true);
                });
            },
            handleRadioChange(item) {
                this.selectedUrl = item.id;
            },
            toCreateSite() {
                // 判断是否具有 AMP 精品站权限
                if (!(this.isContainsMenu('website_manager') && this.authorized_button['template-station'])) {
                    this.$Message.error(this.$t('seo.detailSelect.haveNoPermissionTemplateStation'));
                    return;
                }

                this.$store.state.showWitchComponent = 'myWebsite';
                this.$router.push({
                    name: 'website_manager',
                    // 参数指定跳到"AMP 精品站"
                    params: {
                        siteType: 'AMP'
                    }
                });
            }
        },
        created() {
            this.init();
        }
    };
</script>

<style scoped lang="less">
    .selection_body {
        /deep/ .el-tabs__content {
            overflow-x: hidden;
            overflow-y: auto;
            min-height: 400px;
            height: 400px;
        }
        /deep/ .el-tabs {
            min-height: 400px;
        }
    }
    .entity_li {
        margin-bottom: 5px;
    }
    .hoverBtn {
        color: #3b78de;
        cursor: pointer;
    }
    .no_site_body {
        height: 130px;
        position: relative;
        .no_site_tip {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
        }
    }

    .selectLink_header {
        display: flex;
        align-items: baseline;
        margin-right: 25px;

        /deep/ * {
            line-height: 1;

            &:first-child {
                margin-right: 5px;
                white-space: nowrap;
            }
        }
    }
</style>

<style lang="less">
    .site_selection_popper {
        max-width: 553px;

        .el-select-dropdown__item {
            padding-right: 20px;
        }
    }
</style>
