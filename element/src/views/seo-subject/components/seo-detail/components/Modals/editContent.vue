<template>
    <Modal :visible="visible_modal"
           width="578px"
           :close-on-click-modal="false"
           :append-to-body="true"
           :close-on-press-escape="false"
           @close="handleClose">
        <div slot="title">
            <h3 class="modal_title" v-if="id === subjectId">{{$t('seo.detailEdit.additionalText')}}</h3>
            <h3 class="modal_title" v-else>{{$t('seo.detailEdit.additionalChildText')}}</h3>
        </div>
        <div class="content_body">
            <div class="body_top">
                <p class="content_title" v-if="id === subjectId">{{$t('seo.detailEdit.keywordText')}}<HelpTip :title="$t('helpTip.keyword')" class="edit_content_helpTip"></HelpTip></p>
                <p class="content_title" v-else>{{$t('seo.detailEdit.keywordChildText')}}<HelpTip :title="$t('helpTip.subjectKeyword')" class="edit_content_helpTip"></HelpTip></p>
                <Card class="keyword_container">
                    <div style="width: 100%;height: 100%">
                        <p class="keyword_name">
                            <span v-if="!isEditting" class="keyword_title">{{detailsObj['name']}}</span>
                            <Input v-else v-model="edittingName" @blur="changeName" class="edit_name_input" ref="changeNameInput" v-fo></Input>
                            <Icon custom="custom-field-edit" size="12" @click="handleNameChange" class="edit_name_icon edit-name cursorBtn" v-if="!isEditting"></Icon>
                        </p>
                        <p class="search_container">
                            <span class="search_name">{{$t('seo.detailEdit.monthlyText')}}</span>
                            <HelpTip :title="$t('helpTip.searchs')"></HelpTip>
                            <span v-loading="searchLoading" class="search_amount">{{searchs}}</span>
                        </p>
                    </div>
                </Card>
            </div>
            <div class="body_bottom">
                <div class="body_header">
                    <p class="content_title" v-if="id === subjectId">{{$t('seo.detailEdit.contentText')}}<HelpTip :title="$t('helpTip.content')"></HelpTip></p>
                    <p class="content_title" v-else>{{$t('seo.detailEdit.contentChildText')}}<HelpTip :title="$t('helpTip.subjectContent')"></HelpTip></p>

                    <!-- 右侧按钮 -->
                    <div>
                        <!-- 移除附加内容 -->
                        <Button v-if="detailsObj['url']" @click="removeContent()">{{$t('seo.detailEdit.contentRemoveText')}}</Button>
                        <!-- 新建文章 -->
                        <Button type="primary"
                                @click="genSEOContent">{{$t('seo.detailEdit.createArticle')}}</Button>
                    </div>
                </div>
                <!-- 子主题内容为空时 -->
                <div v-if="!detailsObj['url']" class="add_links">
                    <div class="add_outer_link add-outer-link cursorBtn" @click="addOuterLink">
                        <div class="circle_outer">
                            <svg class="svg-icon display_in_Mid" aria-hidden="true" style="font-size: 30px">
                                <use xlink:href="#custom-wailian"></use>
                            </svg>
                        </div>
                        <span>{{$t('seo.detailEdit.addHrefText')}}</span>
                    </div>
                    <div class="add_inside_link cursorBtn" @click="handleAddInsideLink">
                        <div class="circle_inside">
                            <svg class="svg-icon display_in_Mid" aria-hidden="true" style="font-size: 30px">
                                <use xlink:href="#custom-neilian"></use>
                            </svg>
                        </div>
                        <span>{{$t('seo.detailEdit.selectHrefText')}}</span>
                    </div>
                </div>
                <!--子主题不为空时-->
                <div v-else>
                    <p class="detail_url">{{detailsObj['url']}}</p>
                    <div class="detail_container">
                        <div class="thumbnail_icons">
                            <div class="display_in_Mid" v-if="!hasThumbNail">
                                <svg class="svg-icon" aria-hidden="true" style="width: 60px;height: 74px">
                                    <use xlink:href="#custom-tupiansuolve"></use>
                                </svg>
                                <p style="font-size: 12px;color: rgba(0,0,0,0.4)">{{$t('seo.detailEdit.pageImgText')}}</p>
                            </div>
                            <div v-else>
                            <!-- 子主题附加内容缩略图 -->
                            </div>
                        </div>
                        <div class="content_details">
                            <p class="details" style="margin-bottom: 20px">Type:&nbsp;&nbsp;{{['1', '3'].includes(`${detailsObj['type']}`) ? $t('seo.detailEdit.inHrefText') : $t('seo.detailEdit.outHrefText')}}</p>
                            <p class="details" v-if="subjectId !== id">{{$t('seo.detailEdit.hrefToPageText')}}&nbsp;&nbsp;
                                <span v-if="detailsObj['linked_status'] === 1">{{$t('seo.detailEdit.isHrefText')}}</span>
                                <span v-else @click="checkLink(detailsObj['url'])" class="link_check">{{$t('seo.detailEdit.inspectHrefText')}}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div slot="footer">
            <Button @click="deleteSubject" v-if="id !== subjectId" class="delete-keyword">{{$t('seo.detailEdit.deleteText')}}</Button>
        </div>
        <selectLink :visible.sync="visible_select_link"
                    v-if="visible_select_link"
                    :detailsObj="detailsObj"
                    :id="id"
                    @updateContent="updateContent"></selectLink>
        <Modal :visible.sync="visible_outer_link"
               width="578px"
               :close-on-click-modal="false"
               :append-to-body="true"
               :close-on-press-escape="false"
               top="35vh" >
            <div slot="title">
                <h3>{{$t('seo.detailEdit.addOutHrefText')}}</h3>
            </div>
            <div class="modal_body">
                <div class="input_text">{{$t('seo.detailEdit.inputPageText')}}</div>
                <Input v-model="outerLink" placeholder="https://" @input="debounce_check_url"></Input>
                <div>
                    <span v-if="isPassUrlCheck">{{$t('seo.detailEdit.urlNowText')}}</span>
                </div>
            </div>
            <div slot="footer" class="out_link_footer">
                <Button type="primary" :disabled="!outerLink || !isPassUrlCheck" @click="saveEditedData(2, 'link')" class="add-outer-link-save">{{$t('seo.detailEdit.saveText')}}</Button>
            </div>
        </Modal>
    </Modal>
</template>

<script>
    import selectLink from './selectLink';
    import { mapState } from 'vuex';
    import util from '../../../../../../libs/util';
    import $ from 'jquery';
    export default {
        name: 'editContent',
        props: ['visible', 'id', 'countrySelected', 'langSelected'],
        computed: {
            ...mapState({
                subSubjectId: state => state.seo.subSubjectId,
                subjectId: state => state.seo.subjectId,
                switchComponent: state => state.seo.switchComponent
            })
        },
        components: {
            selectLink
        },
        data() {
            return {
                // 脱离 prop , 单独控制弹框显隐
                visible_modal: '',

                hasContent: false, // 判断子主题是否有附加内容
                hasThumbNail: false, // 判断子主题附加内容是否有缩略图
                visible_select_link: false, // 控制
                detailsObj: {}, // 主题或子主题内容
                searchLoading: true,
                visible_outer_link: false,
                outerLink: '',
                isPassUrlCheck: false,
                searchs: null, // 搜索量
                isEditting: false, // 主题名称是否处于编辑状态
                edittingName: '',
                debounce_check_url: this.$debounce(() => {
                    // 判断url是否满足验证
                    this.isPassUrlCheck = this.checkUrl(this.outerLink);
                }, 1)
            };
        },
        methods: {
            handleClose() {
                // 如果是因为要显示"新建文章"组件才自动关闭弹框, 则应该保留弹框状态, 否则直接整个关闭弹框
                if (this.switchComponent !== 'seo-gen') {
                    this.detailsObj = Object.assign({});
                    this.$emit('update:visible', false);
                }
            },
            handleAddInsideLink() {
                this.visible_select_link = true;
            },
            init() {
                this.getInfo();
            },
            /* 获取主题 or 子主题详情 */
            getInfo() {
                util.ajaxAMP({
                    url: '/seotopic/detail',
                    method: 'post',
                    data: {
                        id: this.id
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        this.detailsObj = res.data.data;
                        this.getSearchs(this.detailsObj);
                        // this.checkLink();
                    }
                });
            },
            // 新建文章
            genSEOContent() {
                // 之前是直接关闭当前弹框打开"新建文章"框, 产品还是想保留弹框, 所以去掉直接关闭弹框, 改为 visible_modal 相关逻辑控制弹框显隐
                // this.handleClose();
                this.$emit('toggleSEOGen', true);
            },
            addOuterLink() {
                this.visible_outer_link = true;
            },
            saveEditedData(num, type) {
                let data = {};
                switch (type) {
                    case 'link':
                        data = {
                            name: this.detailsObj['name'],
                            topic_id: this.id,
                            parent_id: this.subjectId,
                            type: num,
                            object: this.outerLink
                        };
                        break;
                    case 'name':
                        data = {
                            name: this.edittingName.trim(),
                            topic_id: this.id,
                            parent_id: this.subjectId,
                            type: num,
                            object: num === 2 ? this.detailsObj['url'] : this.detailsObj['page_id']
                        };
                        break;
                    case 'remove':
                        data = {
                            name: this.detailsObj['name'],
                            topic_id: this.id,
                            parent_id: this.id === this.subjectId ? -1 : this.subjectId,
                            type: num,
                            object: null
                        };
                        break;
                }
                if (!this.edittingName.trim() && type === 'name') {
                    this.$Message.warning(this.$t('seo.detailEdit.warning1'));
                    return false;
                }
                util.ajaxAMP({
                    url: type === 'remove' ? '/seotopic/remove' : '/seotopic/edit',
                    method: 'post',
                    data: data
                }).then(res => {
                    if (res.data.code === 0) {
                        // 更新弹窗数据
                        this.getInfo();
                        // 更新detail组件数据
                        this.$emit('updateDetail');
                        this.outerLink = '';
                        this.visible_outer_link = false;
                    } else {
                        this.$Message.warning(res.data.msg);
                    }
                });
            },
            checkLink(url) {
                // 调用check接口
                util.ajaxAMP({
                    url: '/seotopic/check',
                    method: 'post',
                    data: {
                        id: this.id
                    }
                }).then(async res => {
                    if (res.data.code === 0) {
                        let data = res.data.data;
                        let status = data['linked_status'];
                        if (status === 1) {
                            this.detailsObj['linked_status'] = 1;
                            await this.updateDetailPage();
                        } else {
                            this.$Message.warning(this.$t('seo.detailEdit.warning2'));
                        }

                    } else {
                        this.$Message.error(res.data.msg)
                    }
                })
            },
            deleteSubject() {
                util.ajaxAMP({
                    url: '/seotopic/delete',
                    method: 'post',
                    data: {
                        id: this.id
                    }
                }).then(async res => {
                    if (res.data.code === 0) {
                        // 关闭弹窗
                        // 更新detail页面数据
                        await this.updateDetailPage();
                        this.handleClose();
                    }
                });
            },
            updateDetailPage() {
                return new Promise(resolve => {
                    this.$emit('updateDetail');
                    resolve(true);
                });
            },
            checkUrl(url) {
                const strRegex = '^((https|http|ftp)?://)' +// (https或http或ftp):// 可有可无
                    '(([\\w_!~*\'()\\.&=+$%-]+: )?[\\w_!~*\'()\\.&=+$%-]+@)?' + // ftp的user@  可有可无
                    '(([0-9]{1,3}\\.){3}[0-9]{1,3}' + // IP形式的URL- 3位数字.3位数字.3位数字.3位数字
                    '|' + // 允许IP和DOMAIN（域名）
                    '(localhost)|' + // 匹配localhost
                    '([\\w_!~*\'()-]+\\.)*' + // 域名- 至少一个[英文或数字_!~*\'()-]加上.
                    '\\w(-?\\w+)*\\.' + // 一级域名 -英文或数字  加上.
                    '[a-zA-Z]{1,6})' + // 顶级域名- 1-6位英文
                    '(:[0-9]{1,5})?' + // 端口- :80 ,1-5位数字
                    '((/?)|' + // url无参数结尾 - 斜杆或这没有
                    '(/[\\w_!~*\'()\\.;?:@&=+$,%#-]+)+/?)$';// 请求参数结尾- 英文或数字和[]内的各种字符

                const strRegex1 = '^(?=^.{3,255}$)((http|https|ftp)?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/)?(?:\/(.+)\/?$)?(\/\w+\.\w+)*([\?&]\w+=\w*|[\u4e00-\u9fa5]+)*$';
                const re = new RegExp(strRegex, 'i');// i不区分大小写
                console.log(re);
                // 将url做uri转码后再匹配，解除请求参数中的中文和空字符影响
                if (re.test(encodeURI(url))) {
                    return (true);
                } else {
                    return (false);
                }
            },
            checkUrlAccess() {
                let flag = null;
                util.ajaxAMP({
                    url: '/seotopic/checkUrl',
                    method: 'post',
                    data: {
                        url: this.outerLink
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        this.isPassUrlCheck = res.data.data;
                    }
                })
            },
            getSearchs(obj) {
                // util.ajaxInternational({
                //     url: '/oversea/openAds/keywordPlanner',
                //     method: 'post',
                //     data: {
                //         language_id: this.langSelected,
                //         location_id: this.countrySelected,
                //         keyword: obj['name'],
                //         page_size: 1
                //     }
                // })
                util.ajaxAMP({
                    url: '/seotopic/keywordPlanner',
                    method: 'post',
                    data: {
                        language_id: this.langSelected,
                        location_id: this.countrySelected,
                        keyword: obj['name'],
                        page_size: 1
                    }
                })
                .then(res => {
                    this.searchLoading = false
                    if (res.data.code === 0) {
                        this.searchs = res.data.data[0].searchs;
                    }
                }).catch(err => {
                    this.searchLoading = false;
                })
            },
            handleNameChange() {
                this.edittingName = this.detailsObj['name'];
                // this.$nextTick(() => {
                //     this.$refs.changeNameInput.focus();
                // });
                this.isEditting = true;
            },
            changeName() {
                if (!this.edittingName.trim()) {
                    this.$Message.warning(this.$t('seo.detailEdit.warning1'));
                    return false;
                }
                if(this.edittingName.trim().length > 60) {
                    this.$Message.warning(this.$t('seo.detailEdit.warning3'));
                    return false;
                }
                // 保存信息
                let num = this.detailsObj['type'];
                let type = 'name';
                this.searchLoading = true;
                this.saveEditedData(num, type);
                // 更新detail页面
                // 重新查询搜索量
                this.isEditting = false;
            },
            removeContent() {
                let num = this.detailsObj['type'];
                let type = 'remove';
                this.saveEditedData(num, type)
            },
            updateContent() {
                this.getInfo();
                this.$emit('updateDetail');
            }
        },
        created() {
            this.init();
        },
        watch: {
            // 弹框显隐始终根据外部 visible 变化而变化
            visible: {
                handler(val) {
                    this.visible_modal = val;
                },
                immediate: true
            },
            // 当点击"新建文章"显示相应组件时, 隐藏弹框, 但不触发外部 visible 变动彻底删除弹框, 而是等新建文章完毕后, 再显示当前弹框
            // 需依赖于外部的 v-if="visible" , 不然会有问题
            switchComponent: {
                handler(val) {
                    const isShow = (val !== 'seo-gen');
                    if (isShow) {
                        // 退出"新建文章"弹框的遮罩层小时, 和本弹框的遮罩层显示, 会有一个闪烁效果, 所以这里在遮罩层显示时加上一个延时
                        setTimeout(() => {
                            this.visible_modal = isShow;
                        }, 200);
                    } else {
                        this.visible_modal = isShow;
                    }
                }
            }
        },
        beforeDestroy() {
            // this.$destroy('editContent');
        }
    };
</script>

<style scoped lang="less">
    .content_body {
        /deep/ .el-card {
            width: 518px;
            height: 100%;
            background-color: #f5f6f9;
            min-height: 100px;
            max-height: 150px;
            box-shadow: none;
        }
        .edit_content_helpTip {
            position: relative;
            left: 5px;
            bottom: 1px;
        }
    }
    .keyword_container {
        position: relative;
        margin: 10px auto 30px;
        .keyword_name {
            text-align: center;
            margin-bottom: 10px;
            .keyword_title {
                font-family: PingFangSC-Medium;
                font-size: 16px;
                color: rgba(0,0,0,0.80);
                letter-spacing: 0;
                line-height: 24px;
            }
        }
    }
    .add_links {
        display: flex;
        justify-content: space-evenly;
        margin-top: 20px;
        margin-bottom: 121px;
    }
    .circle_outer {
        width: 78px;
        height: 78px;
        border-radius: 50%;
        background-color: #F0F5FF;
        position: relative;
    }
    .circle_inside {
        position: relative;
        width: 78px;
        height: 78px;
        border-radius: 50%;
        background-color: #FFF2EB;
    }
    .display_in_Mid {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .add_outer_link,
    .add_inside_link {
        display: flex;
        flex-direction: column;
        align-items: center;
        span {
            display: block;
            font-family: PingFangSC-Medium;
            font-size: 14px;
            color: rgba(0,0,0,0.80);
            text-align: center;
            line-height: 18px;
            margin-top: 12px;
        }
    }
    .modal_title {
        font-family: PingFangSC-Medium;
        font-size: 18px;
        color: rgba(0,0,0,0.80);
        letter-spacing: 0;
        line-height: 26px;
    }
    .content_title {
        font-family: PingFangSC-Medium;
        font-size: 16px;
        color: rgba(0,0,0,0.80);
        letter-spacing: 0;
        line-height: 24px;
        margin-left: 8px;
    }
    .body_header {
        display: flex;
        justify-content: space-between;
    }
    .thumbnail_icons {
        width: 200px;
        height: 200px;
        background: #f5f6f9;
        position: relative;
    }
    .content_details {
        display: flex;
        flex-direction: column;
        margin-left: 20px;
        .details {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 18px;
        }
    }
    .detail_container {
        display: flex;
        align-items: center;
        margin-left: 8px;
    }
    .modal_body {
        /deep/ .el-input {
            width: 524px;
            margin-top: 12px;
        }
        .input_text {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 18px;
        }
    }
    .edit_name_icon {
        margin-left: 8px;
    }
    .search_container {
        text-align: center;
        .search_name {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 18px;
            display: inline-block;
            margin-right: 8px;
        }
        .search_amount {
            display: inline-block;
            margin-left: 8px;
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 18px;
        }
    }
    .detail_url {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: #3B78DE;
        letter-spacing: 0;
        line-height: 18px;
        margin-bottom: 20px;
        margin-left: 8px;
    }
    .link_check {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: #FA8241;
        letter-spacing: 0;
        line-height: 18px;
        cursor: pointer;
    }
    .out_link_footer {
        /deep/ .is-disabled {
            background: #E7ECF2 !important;
            border-color: #e7ecf2 !important;
            span {
                font-family: PingFangSC-Regular;
                font-size: 12px !important;
                color: rgba(110,129,154,0.40) !important;
            }
        }
    }
    .cursorBtn {
        &:hover {
            cursor: pointer;
        }
    }
</style>
