<template>
    <div>
        <Drawer :visible.sync="visible"
                size="50%"
                :modal="false"
                :append-to-body="true"
                :with-header="false"
                ref="topDrawer"
                @scroll.native.capture="close_popper"
                class="drawer-show-main-header drawer-close-button-moveUp customSetting">
                <form method="post" id="websiteForm1" :action="actionForm.actionUrl" target="_blank" style="display: none;">
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
            <!-- 自定义关闭按钮 -->
            <a
               class="drawer-close-button" @click="visibleChange(false)">
                <Icon custom="custom-drawer-detail-close"></Icon>
            </a>
            <div class="customSetting-header">
                <div>
                    <!-- <span class="custom custom-wangzhanxiangqingye" style="color: #4285F2;"></span> -->
                    <img class="website-detail-logo" :src="rowDate.logoUrl" alt="">
                    <span class="customSetting-header-title">{{rowDate.title}}</span>
                </div>
                <div>
                    <Dropdown
                        placement="bottom-start"
                        @command="jumpWordPress"
                        trigger="hover">
                        <span class="jump-wordPress-btn" style="cursor: pointer;">
                            {{$t('administerAMP.wordPress.editContent')}}<i class="el-icon-arrow-down el-icon--right jump-wordPress-btn-down"></i>
                        </span>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem v-for="(item, index) in rowDate.contentEditList" :key="index" :command="item.id">
                                <Button
                                    class="mail-preview"
                                    type="text"
                                    style="font-size: 14px;">{{item.title}}</Button>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <Dropdown placement="bottom-start" trigger="hover" @command="jumpWordPress2">
                        <span class="jump-wordPress-btn" style="cursor: pointer;">
                            {{$t('administerAMP.wordPress.create')}}<i class="el-icon-arrow-down el-icon--right jump-wordPress-btn-down"></i>
                        </span>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem v-for="(item, index) in rowDate.newCreateList" :key="index" :command="item.id">
                                <Button
                                    class="mail-preview"
                                    type="text"
                                    style="font-size: 14px;">{{item.title}}</Button>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <!-- <Select v-model="condition" style="width: 110px;margin-right: 20px;" @change="jumpWordPress">
                        <Option v-for="item in rowDate.contentEditList"
                            :value="item.id"
                            :title="item.title"
                            :label="item.title"></Option>
                    </Select>
                    <Select v-model="condition2" style="width: 110px;" @change="jumpWordPress2">
                        <Option v-for="item in rowDate.newCreateList"
                            :value="item.id"
                            :title="item.title"
                            width="70"
                            :label="item.title"></Option>
                    </Select> -->
                </div>
                <!-- <Button class="new-custom" type="primary" @click="addUser()">新增用户</Button> -->
            </div>
            <div class="website-detail-info">
                <div>
                    <p class="website-detail-title">域名</p>
                    <p style="cursor: pointer;color: #3B78DE;" @click.stop="jumpUrl()">{{rowDate.domain}}</p>
                </div>
                <div>
                    <p class="website-detail-title">{{$t('administerAMP.wordPress.state')}}</p>
                    <p v-if="rowDate.status === 0">{{$t('administerAMP.wordPress.invalid')}}</p>
                    <p v-if="rowDate.status === 1">{{$t('administerAMP.wordPress.unpublished')}}</p>
                    <p v-if="rowDate.status === 2">{{$t('administerAMP.wordPress.published')}}</p>
                </div>
                <div>
                    <p class="website-detail-title">{{$t('administerAMP.wordPress.lastUpdatedTime')}}</p>
                    <p> {{rowDate.updateTime | timeFormat('DateTime')}}</p>
                </div>
                <div>
                    <p class="website-detail-title">{{$t('administerAMP.wordPress.createTime')}}</p>
                    <p> {{rowDate.createTime | timeFormat('DateTime')}}</p>
                </div>
            </div>
            <div class="website-detail-line"></div>
            <p class="website-detail-info-title">
                <span>{{$t('administerAMP.wordPress.details')}}</span>
            </p>
            <Row class="website-detail-bottom">
                <Col class="col" :span="12">
                    <div class="website-detail-item">
                        <p class="website-detail-title">{{$t('administerAMP.wordPress.websiteTitle')}}</p>
                        <p>{{rowDate.title}}</p>
                    </div>
                    <div class="website-detail-item">
                        <p class="website-detail-title">{{$t('administerAMP.wordPress.websiteAddress')}}</p>
                        <p>{{rowDate.domain}}</p>
                    </div>
                    <div class="website-detail-item">
                        <p class="website-detail-title">{{$t('administerAMP.wordPress.state')}}</p>
                        <p v-if="rowDate.status === 0">{{$t('administerAMP.wordPress.invalid')}}</p>
                        <p v-if="rowDate.status === 1">{{$t('administerAMP.wordPress.unpublished')}}</p>
                        <p v-if="rowDate.status === 2">{{$t('administerAMP.wordPress.published')}}</p>
                    </div>
                    <!-- <div class="website-detail-item">
                        <p class="website-detail-title">服务开始日期</p>
                        <p>{{(rowDate.serviceStartTime * 1000) | timeFormat('DateTime')}}</p>
                    </div> -->
                    <div class="website-detail-item">
                        <p class="website-detail-title">{{$t('administerAMP.wordPress.lastUpdatedTime')}}</p>
                        <p>{{rowDate.updateTime | timeFormat('DateTime')}}</p>
                    </div>
                </Col>
                <Col :span="12">
                    <div class="website-detail-item">
                        <p class="website-detail-title">{{$t('administerAMP.wordPress.websiteSubtitle')}}</p>
                        <p>{{rowDate.subtitle}}</p>
                    </div>
                    <!-- <div class="website-detail-item">
                        <p class="website-detail-title">{{$t('administerAMP.wordPress.websiteLanguage')}}</p>
                        <p>{{rowDate.language === 1 ? $t('administerAMP.wordPress.chinese') : $t('administerAMP.wordPress.english')}}</p>
                    </div> -->
                    <!-- <div class="website-detail-item">
                        <p class="website-detail-title">{{$t('administerAMP.wordPress.websiteType')}}</p>
                        <p>{{rowDate.type === 1 ? $t('administerAMP.wordPress.B2BMarketingWebsite') : '-'}}</p>
                    </div> -->
                    <!-- <div class="website-detail-item">
                        <p class="website-detail-title">服务截止日期</p>
                        <p>{{(rowDate.serviceEndTime * 1000) | timeFormat('DateTime')}}</p>
                    </div> -->
                    <div class="website-detail-item">
                        <p class="website-detail-title">{{$t('administerAMP.wordPress.createTime')}}</p>
                        <p>{{rowDate.createTime | timeFormat('DateTime')}}</p>
                    </div>
                </Col>
            </Row>
        </Drawer>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import {
        getJumpParam
    } from '@/api/website';

    export default {
        name: 'website-detail',
        props: [
            'visible',
            'id',
            'rowDate'
        ],
        computed: {
            ...mapState({
                userId: 'userId',
                enterpriseId: 'enterpriseId',
                button_list: state => state.app.button_list
            }),
            table_height() {
                let temp = this.window_height ? this.window_height - 174 : document.body.clientHeight - 174;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            }
        },
        data() {
            return {
                webDate: [],
                actionForm: {},
                pageSize: null,
                pageSizeOpts: [20, 50, 100],
                totalNum: null,
                curPage: 1,
                nameList: [],
                addForm: {
                    name: '',
                    role: ''
                },
                condition: '',
                condition2: '',
                operaType: '',
                close_popper: this.$debounce(e => {
                    if (e && e.target && e.target.parentElement && e.target.parentElement.classList.contains('el-drawer__body')) {
                        const selectEl = this.$refs.crmDetail[(this.$refs.crmDetail.length - 1)] || this.$refs.crmDetail;
                        if (selectEl && selectEl.$refs.followUp) {
                            const selectEl2 = selectEl.$refs.followUp;
                            if (selectEl2) {
                                const selectEl3 = selectEl2.$refs.crmDetailTimeLine;
                                const finalEl = selectEl3.$el.querySelector('.click-close-popper');
                                if (finalEl) {
                                    finalEl.click();
                                }
                            }
                        }
                    }
                }, 200, true)
            };
        },
        methods: {
            jumpUrl(item) {
                window.open(`https://${this.rowDate.domain}`);
            },
            jumpWordPress(val) {
                getJumpParam({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    siteId: this.rowDate.id,
                    domain: this.rowDate.domain,
                    adminUrl: this.rowDate.adminUrl,
                    jumpUrl: this.rowDate.contentEditList.find(item => item.id === val).url
                }).then(res => {
                    if (res.code === '1') {
                        this.actionForm = {
                            actionUrl: `https://${this.rowDate.domain}/${this.rowDate.loginUrl}`,
                            log: res.data.userName,
                            pwd: res.data.passWord,
                            redirect_to: res.data.url
                        };
                        setTimeout(res => {
                            $('#websiteForm1').submit();
                        }, 400);
                    }
                });
            },
            jumpWordPress2(val) {
                getJumpParam({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    siteId: this.rowDate.id,
                    domain: this.rowDate.domain,
                    adminUrl: this.rowDate.adminUrl,
                    jumpUrl: this.rowDate.newCreateList.find(item => item.id === val).url
                }).then(res => {
                    if (res.code === '1') {
                        this.actionForm = {
                            actionUrl: `https://${this.rowDate.domain}${this.rowDate.loginUrl}`,
                            log: res.data.userName,
                            pwd: res.data.passWord,
                            redirect_to: res.data.url
                        };
                        setTimeout(res => {
                            $('#websiteForm1').submit();
                        }, 400);
                    }
                });
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
            addUser() {
                this.operaType = 'add';
                this.webDate.unshift({
                    webname: '111',
                    weburl: '2222',
                    editing: true
                });
            },
            editData(row) {
                this.operaType = 'edit';
                row.editing = true;
            },
            deleteData(row) {

            },
            handleAdd_confirm(row) {
                row.editing = false;
            },
            handleAdd_cancel(row) {
                row.editing = false;
                if (this.operaType === 'add') {
                    this.webDate.shift({
                        webname: '111',
                        weburl: '2222',
                        editing: true
                    });
                } else if (this.operaType === 'edit') {
                    
                } else {}
            },
            visibleChange() {
                this.$emit('update:visible', false);
            },
            // 绑定给当前所处的 DOM (single-page) 的点击事件, 点击表格条目以外的操作将关闭最上一层 drawer
            click_blank(e) {
                if (this.visible) {
                    let boo = true;
                    let temp_el = e.target;
                    while (!temp_el.classList.contains('single-page')) {
                        if (temp_el.classList.contains('el-table__row')) {
                            boo = false;
                            break;
                        } else {
                            temp_el = temp_el.parentElement;
                        }
                    }
                    console.log('clue===>click_blank', e, boo);
                    if (boo) {
                        this.$emit('update:clueId', '');
                        this.$emit('update:visible', false);
                    }
                }
            }
        },
        mounted() {
            const parentView = document.getElementsByClassName('single-page')[0];
            if (parentView) {
                parentView.addEventListener('click', this.click_blank);
            }
        },
        beforeDestroy() {
            const parentView = document.getElementsByClassName('single-page')[0];
            if (parentView) {
                parentView.removeEventListener('click', this.click_blank);
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.condition = this.rowDate.contentEditList[0].id;
                    this.condition2 = this.rowDate.newCreateList[0].id;
                }
            }
        }
    };
</script>
<style lang="less">

</style>
