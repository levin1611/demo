<template>
<!-- 新建推文 -->
    <div class="onekey-release-creat-content" v-loading="creatLoading">
        <div style="font-size: 16px;font-weight:700;margin-bottom:10px;color:rgba(0, 0, 0, 0.8);">
            {{$t('facebook.onekeyRelease.creatContent.postContent')}}
        </div>
        <div style="height: calc(100% - 200px)">
            <!-- 推文内容 -->
            <Input
                    id="fbNewContent"
                    @mouseup.native="onIputSelect"
                    v-model="textareaCreatContent"
                    type="textarea"
                    :rows="4"
                    :placeholder="$t('facebook.onekeyRelease.creatContent.creatContentPlh') + $t('aiToolBar.orPlaceholder')"
                    :maxlength="1000"
            />
            <div style="position: relative;">
                <span v-show="!isCanPost" style="color:red;font-size: 12px;position: absolute;left: 0;top: 0;">{{$t('facebook.onekeyRelease.creatContent.contentLimitTip')}}</span>
                <p class="creat-content-edit-text">{{$t('facebook.onekeyRelease.creatContent.entered')}}
                    <span class="creat-content-edit-text-limit">
                      <span>{{textareaCreatContent.length}}</span>
                      <span>/</span>
                      <span>1000</span>
                  </span>
                </p>
            </div>

            <!-- 上传图片/视频 -->
            <div class="creat-content-edit-layout-div-out">
                <!-- 标题 -->
                <p class="creat-content-edit-layout-title">{{$t('facebook.onekeyRelease.creatContent.uploadImgOrVideo')}}</p>
                <!-- 切换: 图片 || 视频 -->
                <RadioGroup :value="mediaType"
                            class="margin-bottom-10">
                    <!-- 关联已有询盘 -->
                    <Radio label="img"
                           @click.native="toggleMediaType('img')">
                        <span>{{ $t('facebook.onekeyRelease.creatContent.img') }}</span>
                    </Radio>
                    <!-- 新增询盘 -->
                    <Radio label="video"
                           @click.native="toggleMediaType('video')">
                        <span>{{ $t('facebook.onekeyRelease.creatContent.video') }}</span>
                    </Radio>
                </RadioGroup>
                <!-- 上传图片 -->
                <div v-if="mediaType === 'img'">
                    <!-- 上传图片 -->
                    <input multiple style="display: none" ref="uploadFollowupImg"
                           type="file" @change="uploadImg">
                    <div class="demo-upload-list" v-for="(pic, index) in pictures"
                         style="border-radius: 3px;margin-left: 10px;" :key="index" @mouseenter="hover_index = index"
                         @mouseleave="hover_index = -1">
                        <img :src="pic" @click="imgPreview"
                             :style="{ 'filter': hover_index === index ? 'brightness(70%)' : 'brightness(100%)' }">
                        <div class="img-remove-icon" v-show="hover_index === index">
                            <Icon type="md-close" size="14" @click.native="imgRemove(index)"></Icon>
                        </div>
                    </div>
                    <Button class="upload-btn-right-small" color="#fb8b2f"
                            style="margin-left: 10px;vertical-align: top;"
                            @click="uploadImgTrigger" size="large" icon="el-icon-plus"></Button>
                    <p class="creat-content-edit-tip" v-if="allImgFilesSize <= 0">
                        {{$t('facebook.onekeyRelease.creatContent.uploadImgTip')}}</p>
                    <p class="creat-content-edit-tip" v-else>
                        {{$t('facebook.onekeyRelease.creatContent.uploadedImgTip1')}}{{(allImgFilesSize/1024/1024).toFixed(2)}}{{$t('facebook.onekeyRelease.creatContent.uploadedImgTip2')}}</p>
                </div>
                <!-- 上传视频 -->
                <div v-else-if="mediaType === 'video'">
                    <!-- 上传图片 -->
                    <input style="display: none"
                           ref="uploadVideoInput"
                           type="file"
                           @change="uploadVideo">
                    <div v-for="(videoItem, index) in videoList"
                         :key="index"
                         @mouseenter="hover_index = index"
                         @mouseleave="hover_index = -1"
                         class="demo-upload-list"
                         style="border-radius: 3px;margin-left: 10px;">
                        <Icon custom="custom-video"
                              size="24"
                              color="#677f99"
                              :style="{ 'filter': hover_index === index ? 'brightness(70%)' : 'brightness(100%)' }"></Icon>
                        <div v-show="hover_index === index"
                             class="img-remove-icon">
                            <Icon type="md-close"
                                  size="14"
                                  @click.native="removeMedia(index)"></Icon>
                        </div>
                    </div>
                    <Button color="#fb8b2f"
                            size="large"
                            icon="el-icon-plus"
                            @click="triggerUploadVideo"
                            class="upload-btn-right-small"
                            style="margin-left: 10px;vertical-align: top;"></Button>
                    <p class="creat-content-edit-tip" v-if="allMediaFilesSize <= 0">
                        {{$t('facebook.onekeyRelease.creatContent.uploadVideoTip')}}</p>
                    <p class="creat-content-edit-tip" v-else>
                        {{$t('facebook.onekeyRelease.creatContent.uploadedVideoTip1')}}{{(allMediaFilesSize/1024/1024).toFixed(2)}}{{$t('facebook.onekeyRelease.creatContent.uploadedVideoTip2')}}</p>
                </div>
            </div>

            <!-- 账号 -->
            <div class="creat-content-edit-layout-div-out release-account-tag">
                <p class="creat-content-edit-layout-title">{{$t('facebook.onekeyRelease.creatContent.account')}}</p>
                <span style="margin-bottom: 10px;display: inline-block;">
                    <Tag
                        v-for="releaseAccount in releaseAccountsList"
                        :key="releaseAccount.id"
                        closable
                        :class="releaseAccount.accessStatus!==1 ? 'invalid-btn': ''"
                        @close="releaseAccountTagClose(releaseAccount)">
                            {{releaseAccount.accountName}}
                            <span v-if="releaseAccount.accessStatus !== 1" class="invalid-tip">
                                {{$t('facebook.onekeyRelease.creatContent.invalid')}}
                            </span>
                    </Tag>
                </span>
                <Button type="success" style="color: white " @click="openAddAccountModal">
                    {{$t('facebook.onekeyRelease.creatContent.addPage')}}
                </Button>
            </div>
            <!-- 链接 -->
            <div class="creat-content-edit-layout-div-out">
                <p class="creat-content-edit-layout-title">{{$t('facebook.onekeyRelease.creatContent.link')}}</p>
                <div style="float: left;width: calc(100% - 204px);">
                    <Input v-model="sourceLink" :placeholder="$t('facebook.onekeyRelease.creatContent.sourceLinkPlh')">
                        <span slot="prepend"><Icon custom="custom custom-link" size='14' color="#7B98B6"></Icon></span>
                    </Input>
                </div>
                <Button type="success" @click="linkSourceToShort" :loading="loadingButtonAddsourceLink"
                        style="margin-left:8px;height:33px;width:60px;padding:0;line-height:33px;">
                    {{$t('add')}}
                </Button>
                <Button
                    @click="sourceLink=''"
                    type="minor"
                    style="margin-left:8px;height:33px;width:60px;padding:0;line-height:33px;"
                    class="btn-success-ghost">{{$t('clear')}}
                </Button>
                <Button
                    type="minor"
                    @click="openSelectSiteModal"
                    style="margin-left:8px;height:33px;width:60px;padding:0;line-height:33px;"
                    class="btn-success-ghost">{{$t('facebook.onekeyRelease.creatContent.select')}}
                </Button>
            </div>
            <!-- 主页标签 -->
            <div class="creat-content-edit-layout-div-out">
                <p class="creat-content-edit-layout-title">{{$t('facebook.onekeyRelease.creatContent.topic')}}</p>
                <Tag v-for="topic in releaseTopic"
                     :key="topic.id"
                     closable
                     @close="releaseTopicTagClose(topic)"
                >{{topic.tagName}}
                </Tag>
                <Button type="success" @click="openAddTopicModal" class="fb-add-brand">
                    {{$t('facebook.onekeyRelease.creatContent.addTopic')}}
                </Button>
            </div>
            <!-- 延时发布 -->
            <div class="creat-content-edit-layout-div-out">
                <p class="creat-content-edit-layout-title">{{$t('facebook.onekeyRelease.delayRelease.name')}}</p>
                <div class="creat-content-delay-release-box">
                    <Checkbox
                            :label="$t('facebook.onekeyRelease.delayRelease.name')"
                            v-model="delayReleaseAllow">
                        {{$t('facebook.onekeyRelease.delayRelease.name')}}
                    </Checkbox>
                    <DatePicker
                            v-model="delayDateValue"
                            type="datetime"
                            format="yyyy-MM-dd HH:mm:ss"
                            placeholder="Select date and time(Excluding seconds)"
                            style="width: 200px"
                            :disabled="!delayReleaseAllow"
                            @change="delayDateOnChange"
                            placement="top-start"
                            :picker-options="optionsDatePicker">
                    </DatePicker>
                    <Select
                            :disabled="!delayReleaseAllow"
                            style="display: inline-block;width: 200px;margin-left: 20px;"
                            v-model="openTimeZoneValue"
                            placement="top"
                            filterable
                    >
                        <Option
                                v-for="item in timeZoneList"
                                :value="item.value"
                                :key="item.value"
                                :label="item.label">
                        </Option>
                    </Select>
                </div>
                <p v-if="delayReleaseAllow" style="margin-top: 10px;font-size:12px;">
                    {{$t('facebook.onekeyRelease.creatContent.releaseTip')}}
                    <span style="color: #FF8A55;">{{openTimeZoneValue}}</span>
                    <span style="color: #FF8A55;padding: 0 10px;">{{delayDateAjaxValue}}</span>
                <p style="color:red;font-size:12px;margin:8px 0;" v-if="delayReleaseAllow&&!canDelay">
                    {{$t('facebook.onekeyRelease.creatContent.delayPostTip')}}</p>
                </p>
            </div>
        </div>
        <div class="save-release-button-group">
            <!-- 发布推文按钮 -->
            <Button type='primary'
                    style="line-height:36px;padding:0;text-align:center;width:90px;margin-right: 10px"
                    @click="releaseAndDraftAjax('release')" :disabled="!isCanPost" class="fb_send_article">
                {{$t('facebook.onekeyRelease.creatContent.post')}}
            </Button>
            <!-- 存入草稿箱按钮 -->
            <Button
                class="fb-save-draft"
                style="line-height:36px;padding:0;text-align:center;width:90px;margin-right: 10px;"
                @click="releaseAndDraftAjax('draft')"
                v-if="!delayReleaseAllow">{{$t('facebook.onekeyRelease.creatContent.toDraftBox')}}
            </Button>
            <!-- 取消按钮 -->
            <Button
                style="line-height:36px;padding:0;text-align:center;width:90px;"
                @click="backToLastView">{{$t('cancel')}}
            </Button>
        </div>
        <!-- 添加主页模态框 -->
        <Modal :visible.sync="modalAddAccount"
                :modal-append-to-body="false"
               width="400px"
               class="modal-add-account">
            <p slot="title">
                <span>{{$t('facebook.onekeyRelease.creatContent.addAccount')}}</span>
            </p>
            <Table ref="selectionADdAccount"
                   show-header
                   height="350"
                   :data="releasePageAllListUniq"
                   @selection-change="selectChangeTableModalAddAccount"
                   :header-cell-style="{color:'#909399;'}"
                   :cell-style="{color: 'rgba(0, 0, 0, .8)'}"
            >
                <TableColumn type="selection" width="44" class-name="checkbox" :selectable='checkboxDisabled'></TableColumn>
                <TableColumn :label="$t('menu.facebook')" style="color: red;" prop="accountName"></TableColumn>
                <TableColumn width="50">
                    <template slot-scope="scope">
                        <span class="invalid-tips">{{scope.row.accessStatus === 1? '': $t('facebook.onekeyRelease.creatContent.invalid')}}</span>
                    </template>
                </TableColumn>
            </Table>
            <div slot="footer">
                <Button @click='modalAddAccount=false'>{{$t('cancel')}}</Button>
                <Button type="primary" @click="clickButtonAddAccountModalAddAccount">{{$t('add')}}</Button>
            </div>
        </Modal>
        <!-- 添加话题模态框 -->
        <Modal :visible.sync="modalAddTopic" :modal-append-to-body="false" width="400px" class="modal-add-topic">
            <p slot="title">
                <span>{{$t('facebook.onekeyRelease.creatContent.addTopic')}}</span>
            </p>
            <Input v-model="inputAddTopic"
                   placeholder="Enter something..."
                   size="large"
                   class="inputAddTopic">
            <span slot="prepend">#</span>
            <span slot="append">
                <Button icon="el-icon-plus" @click="inputAddTopicAjax" :loading="loadingButtonInputAddTopic"></Button>
            </span>
            </Input>
            <Table
                   height="350"
                   ref="selectionAddTopic"
                   show-header
                   :data="tableDataModalAddTopic"
                   v-loading="loadingTableAddTopic"
                   :header-cell-style="{color:'#909399;'}"
                   :cell-style="{color: 'rgba(0, 0, 0, .8)'}"
                   @selection-change="selectChangeTableModalAddTopic">
                   <TableColumn type="selection" width="44" class-name="checkbox"></TableColumn>
                   <TableColumn :label="$t('facebook.onekeyRelease.creatContent.topic')" prop="tagName"></TableColumn>
                   <TableColumn :label="$t('distribution.opera')" width="64" prop="active">
                       <template slot-scope="scope">
                            <Icon custom="custom custom-delete" style="cursor: pointer;" size="12" @click="deleteTopic(scope)"></Icon>
                       </template>
                   </TableColumn>
                   </Table>
            <div slot="footer">
                <Button @click='modalAddTopic=false'>{{$t('cancel')}}</Button>
                <Button type="primary" @click="clickButtonAddTopicModalAddTopic">{{$t('add')}}</Button>
            </div>
        </Modal>
        <!-- 链接地址列表模态框 -->
        <Modal :visible.sync="modalSelectSite"
            :modal-append-to-body="false"
               width="600px"
               class="modal-select-site">
            <p slot="title">
                <span>{{$t('facebook.onekeyRelease.creatContent.previewLink')}}</span>
            </p>
            <!-- 替换框架过程中发现仍需要绑定@selection-change事件 -->
            <Table ref="tableSelectSite"
                   v-loading="loadingTableSelectSite"
                   highlight-current-row
                   height="350"
                   :data="tableDataReleasePageSelectSite"
                   @selection-change="onCurrentChangeSelectSiteTable"
                   class="tabmain noBoxShadow-right noborder-table noborder-table-normal-border"
            >
                <TableColumn type="selection" width="30"></TableColumn>
                <TableColumn prop="longUrl" :label="$t('facebook.onekeyRelease.creatContent.longUrl')"></TableColumn>
                <TableColumn prop="createTimeTraslate" :label="$t('facebook.onekeyRelease.creatContent.createTime')" :formatter="formatterdate"></TableColumn>
            </Table>
            <div class="clearfix">
                <Page :current="currentPage"
                      :total="totalSelectSiteTable"
                      simple
                      class="page-select-site-table"
                      @current-change="changePagetableSelectSite"></Page>
            </div>
            <div slot="footer">
                <Button @click='modalSelectSite=false;highlightRowDataSelectSiteTable = [];'>
                    {{$t('cancel')}}
                </Button>
                <Button type="primary" @click="clickButtonSelectSiteModalSelectSite">{{$t('add')}}</Button>
            </div>
        </Modal>
        <!-- 上传失败的弹窗 -->
        <Modal :visible.sync="uploadImgLimitModal"
            :modal-append-to-body="false"
            width="500px"
            height="800">
            <p slot="title">
                <span>{{$t('facebook.onekeyRelease.creatContent.imageUpload')}}</span>
            </p>
            <div v-if="overSizeSingleImageList.length > 0">
                <p class="upload-img-title">
                    {{$t('facebook.onekeyRelease.creatContent.oversizeSingleImgTip')}}
                </p>
                <Tooltip :content="overSizeSingleImageList.join(', ')" placement="top" max-width="600" transfer>
                    <p class="upload-img-body">{{overSizeSingleImageList.join(', ')}}</p>
                </Tooltip>
            </div>
            <div v-if="overSizeTotalImageList.length > 0">
                <p class="upload-img-title">
                    {{$t('facebook.onekeyRelease.creatContent.oversizeTotalImgTip')}}
                </p>
                <Tooltip :content="overSizeTotalImageList.join(', ')" placement="top" max-width="600" transfer>
                    <p class="upload-img-body">{{overSizeTotalImageList.join(', ')}}</p>
                </Tooltip>
            </div>
            <div slot="footer">
                <Button type="primary" size="large" @click.native="ok">{{$t('confirm')}}</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import * as qiniu from 'qiniu-js';
    import { mapState } from 'vuex';
    import { fbCommon } from '@/api/facebook/index';

    // ai tool bar facebook 发帖
    import { getInputSelectedText, coverText, insertText } from '@/views/ai-toolbar/utils/tools'

    const { gaOperate } = fbCommon;

    export default {
        created() {
            this.getConfigList();
            this.setTimeZoneList();
        },
        data() {
            return {
                /**
                 * 目前图片上传到fb时，如果同时上传多张，其中有一张无法上传到fb，那么我们不知道具体是哪张，
                 * 定义一个picArr属性，存一个图片的对应关系传给后台，让后台可以在图片上传失败后告诉前端
                 * 具体是哪张图片失败了
                 */
                picArr: {},
                imgUploadUrl: '', // Upload 组件上传 action
                targetFans: 0,
                stepCreatContent: 1,
                tabs: '1',
                loadingReleasePageAllList: false,
                tableDataReleasePageAllList: [],
                textareaCreatContent: '',
                releaseAccountsList: [],
                uploadSubscription: {},
                upLoadPicturesList: [],
                upLoadPicturesDefaultList: [],

                modalAddAccount: false,
                tableselectModalAddAccount: [],
                sourceLink: '',
                modalSelectSite: false,
                loadingTableSelectSite: true,
                tableColumnsModalSelectSite: [
                    {
                        title: this.$t('facebook.onekeyRelease.creatContent.longUrl'),
                        key: 'longUrl',
                        align: 'center'
                    },
                    /* 由于FB发帖接口限制，添加短地址会导致发帖失败，所以选择地址的表格中不再显示短地址 */
                    /* {
                title: this.$t('facebook.onekeyRelease.creatContent.shortUrl'),
                key: 'shortUrl',
                align: 'center'
              }, */
                    {
                        title: this.$t('facebook.onekeyRelease.creatContent.createTime'),
                        key: 'createTimeTraslate',
                        align: 'center',
                        render: (h, params) => {
                            return [
                                h('div', this.date2str(new Date(params.row.createTime), 'yyyy-MM-dd hh:mm:ss'))
                            ];
                        }
                    }
                ],
                tableDataReleasePageSelectSite: [],
                totalSelectSiteTable: 0,
                loadingButtonAddsourceLink: false,
                releaseTopic: [],
                delayReleaseAllow: false,
                modalAddTopic: false,
                inputAddTopic: '',
                tableColumnsModalAddTopic: [
                    {
                        type: 'selection',
                        align: 'center',
                        width: 80
                    },
                    {
                        title: this.$t('facebook.onekeyRelease.creatContent.tagName'),
                        key: 'tagName'
                    },
                    {
                        title: this.$t('facebook.onekeyRelease.creatContent.operate'),
                        key: 'active',
                        align: 'center',
                        render: (h, params) => {
                            return h('Button', {
                                class: {
                                },
                                style: {
                                    color: '#dddddd',
                                    backgroundColor: 'rgba(0,0,0,0)',
                                    borderWidth: '0'
                                },
                                attrs: {
                                    shape: 'circle',
                                    icon: 'close-round'
                                },
                                on: {
                                    click: () => {
                                        this.deleteTopic(params);
                                    }
                                }
                            });
                        }
                    }
                ],
                tableDataModalAddTopic: [],
                tableselectModalAddTopic: [],
                loadingButtonInputAddTopic: false,
                loadingTableAddTopic: true,

                previewInlineTime: this.date2str(new Date(), 'yyyy-MM-dd hh:mm:ss'),

                openTimeZoneValue: 'GMT+08:00',
                delayDateValue: new Date(),
                delayDateAjaxValue: this.date2str(new Date(), 'yyyy-MM-dd hh:mm:ss'),
                timeZoneList: [],
                modal3: false,
                indeterminate: false,
                checkAll: true,
                checkAllGroup: ['facebook', 'twitter'],
                releaseAndSaveAjaxData: {},
                highlightRowDataSelectSiteTable: [],
                optionsDatePicker: {
                    disabledDate(date) {
                        return date && date.valueOf() < Date.now() - 2 * 86400000;
                    }
                },
                /* 图片 */
                imgUploadingFlag: false, // 正在上传图片
                pictures: [], // 已上传图片列表
                hover_index: -1, // 当前 hover 的图片
                uploadImgLimitModal: false, // 是否显示上传失败的弹窗
                overSizeSingleImageList: [], // 单张图片大小超过上限
                overSizeTotalImageList: [], // 图片总大小超过上限
                allImgFiles: [], // 允许上传的图片
                allImgFilesSize: 0, // 上传图片总体积
                allPicturesUrlSize: [], // 上传的所有图片的url和对应的图片大小
                /* 发布推文 */
                isCanPost: true, /* 发布推文的按钮是否可用 */
                currentPage: 1,
                creatLoading: true, // 正在发布

                // 当前媒体文件类型
                mediaType: 'img',
                // 媒体文件格式限制
                imgFormatArr: ['png', 'jpeg', 'gif', 'jpg'],
                videoFormatArr: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv', 'mpg', 'mov', 'wmv', 'rm'],
                imgFormatReg: '',
                videoFormatReg: '',
                /* 视频数据 */
                // 正在上传媒体文件
                mediaUploadingFlag: false,
                // 已上传视频列表
                videoList: [],
                // 上传视频句柄
                videoUploadSubscription: null
            };
        },
        props: {
            tempView: {
                type: String,
                default: 'Releasedsuccessfully'
            },
            /* 跳转至新建推文页之前的视图，用于在新建推文页点击取消时返回跳转前的页面 */
            lastView: {
                type: String,
                default: 'Releasedsuccessfully'
            },
            toRouterObj: {
                type: Object,
                default: null
            },
            toViewName: {
                type: String,
                default: ''
            }
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                qiniuHttp: state => state.qiniuHttp,
                qiniuUrl: state => state.qiniuUrl,
                isFbService: state => state.isFbService,
                postDetail: state => state.onekeyrelease.postDetail
            }),
            canDelay: {
                get() {
                    const date = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
                    let time;
                    // 点击x号去掉发布时间时
                    if (this.delayDateValue) {
                        time = this.delayDateValue.getTime() - this.openTimeZoneValue.substr(3, 3) * 60 * 60 * 1000;
                    }
                    if (time - date > 10 * 60 * 1000 && time - date < 6 * 30 * 24 * 60 * 60 * 1000) return true;
                    return false;
                },
                set(val) {
                    return val;
                }
            },
            serializeReleaseTopic: function() {
                const releaseTopic = this.releaseTopic;
                const tem = [];
                for (let i = 0; i < releaseTopic.length; i++) {
                    tem.push(releaseTopic[i].tagName);
                }
                if (releaseTopic.length > 0) {
                    return ` ${tem.join(' ')}`;
                } else {
                    return '';
                }
            },
            allFans() {
                const list = this.tableDataReleasePageAllList;
                let all = 0;
                for (let i = 0; i < list.length; i++) {
                    all += list[i].likes;
                }
                return all;
            },
            // 对主页列表做去重处理
            releasePageAllListUniq() {
                const initTableData = this.tableDataReleasePageAllList;
                const pageIds = new Set(initTableData.map(({ pageId }) => pageId));
                return initTableData.filter(({ pageId }) => pageIds.delete(pageId));
            },
            // 所有已上传媒体文件总大小
            allMediaFilesSize() {
                return this.videoList.reduce((a, b) => a + b.size, 0);
            }
        },
        methods: {
            // fb埋点
            fbGaOperate() {
                gaOperate({
                    userId: this.userId,
                    orgId: this.enterpriseId,
                    operateType: 2
                }).catch(err => {
                    console.error(err);
                });
            },
            // 格式化时间
            formatterdate(row) {
                return this.date2str(new Date(row.createTime), 'yyyy-MM-dd hh:mm:ss');
            },
            /* 上传图片 */
            uploadImgTrigger() {
                const uploadedMb = (this.allImgFilesSize / 1024 / 1024).toFixed(2);
                if (uploadedMb > 150) {
                    this.$Message.error(this.$t('facebook.onekeyRelease.creatContent.uploadedImgTip1') + uploadedMb + this.$t('facebook.onekeyRelease.creatContent.uploadedImgTip2'));
                } else {
                    if (this.imgUploadingFlag) {
                        this.$Message.info(this.$t('crm.Modal.info_waitUpload'));
                    } else {
                        this.$refs.uploadFollowupImg.click();
                    }
                }
            },
            async uploadImg(event) {
                this.overSizeSingleImageList = [];
                this.overSizeTotalImageList = [];
                this.imgUploadingFlag = true;
                const config = {
                    useCdnDomain: true,
                    region: qiniu.region.z0,
                    forceDirect: true // 强制选择直传
                };
                const putExtra = {
                    fname: '',
                    params: {},
                    mimeType: ['image/png', 'image/jpeg', 'image/gif']
                };
                const initFiles = Array.from(event.target.files);
                const files = [];
                for (let i = 0; i < initFiles.length; i++) {
                    if (this.imgFormatReg.test(initFiles[i].name)) {
                        if (initFiles[i].size / 1024 / 1024 > 10) {
                            this.overSizeSingleImageList.push(initFiles[i].name);
                        } else if ((Math.ceil(this.allImgFilesSize + initFiles[i].size) / 1024 / 1024) <= 150) {
                            this.allImgFilesSize += initFiles[i].size;
                            files.push(initFiles[i]);
                        } else {
                            this.overSizeTotalImageList.push(initFiles[i].name);
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_formatUploadImage'));
                    }
                }
                // 总体大小超过 150M 或单个超过 10M，会出现提示
                if (this.overSizeTotalImageList.length > 0 || this.overSizeSingleImageList.length > 0) {
                    this.uploadImgLimitModal = true;
                }
                if (files.length > 0) {
                    this.allImgFiles.push(...files);
                } else {
                    this.imgUploadingFlag = false;
                    return;
                }
                // 添加上传dom面板
                const next = response => {
                };
                // 图片上传失败的回调
                const error = async response => {
                    console.error(response);
                    if (response.message === 'file type doesn\'t match with what you specify') {
                        this.$Message.error(this.$t('crm.Modal.error_formatUploadImage'));
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_uploadImage'));
                    }
                    /* 上传失败的图片从列表中删除 */
                    this.allImgFiles.splice(fileIndex, 1);
                    if (++fileIndex < files.length) {
                        const observable = await this.$qiniuUpload(files[fileIndex], null, putExtra, config);
                        observable.subscribe(next, error, complete);
                    } else {
                        this.imgUploadingFlag = false;
                        this.$refs.uploadFollowupImg.value = '';
                    }
                };
                // 图片上传成功的回调
                const complete = async response => {
                    this.picArr[response.key] = files[fileIndex].name;

                    this.pictures.push(`${this.qiniuHttp}${response.key}`);
                    if (++fileIndex < files.length) {
                        const observable = await this.$qiniuUpload(files[fileIndex], null, putExtra, config);
                        observable.subscribe(next, error, complete);
                    } else {
                        this.imgUploadingFlag = false;
                        this.$refs.uploadFollowupImg.value = '';
                    }
                    if (fileIndex === files.length) {
                        const newArr = files.map((item, index) => {
                            return { url: this.pictures[this.pictures.length - 1 - index], size: item.size };
                        });
                        if (newArr) {
                            this.allPicturesUrlSize.push(...newArr);
                        }
                    }
                };
                let fileIndex = 0;
                // 调用sdk上传接口获得相应的observable，控制上传和暂停
                const observable = await this.$qiniuUpload(files[fileIndex], null, putExtra, config);
                observable.subscribe(next, error, complete);
            },
            // 点击查看大图
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            // 删除图片
            imgRemove(index) {
                const picStr = this.pictures[index];
                const picStr1 = picStr.slice(31);
                delete this.picArr[picStr1];
                this.pictures.splice(index, 1);
                this.allImgFiles.splice(index, 1);
                this.allImgFilesSize = this.allImgFiles.reduce((prev, curr) => {
                    return prev + curr.size;
                }, 0);
            },
            async pasteImg(file) {
                if (this.imgUploadingFlag) {
                    this.$Message.info(this.$t('crm.Modal.info_waitUpload'));
                } else {
                    this.imgUploadingFlag = true;
                    const config = {
                        useCdnDomain: true,
                        region: qiniu.region.z0,
                        forceDirect: true // 强制选择直传
                    };
                    const putExtra = {
                        fname: '',
                        params: {},
                        mimeType: ['image/png', 'image/jpeg', 'image/gif']
                    };
                    // 添加上传dom面板
                    const next = response => {
                    };
                    const error = response => {
                        if (response.message === 'file type doesn\'t match with what you specify') {
                            this.$Message.error(this.$t('crm.Modal.error_formatUploadImage'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_uploadImage'));
                        }
                        this.imgUploadingFlag = false;
                    };
                    const complete = response => {
                        this.pictures.push(`${this.qiniuHttp}${response.key}`);
                        this.imgUploadingFlag = false;
                    };

                    // 调用sdk上传接口获得相应的observable，控制上传和暂停
                    const observable = await this.$qiniuUpload(file, null, putExtra, config);
                    observable.subscribe(next, error, complete);
                }
            },
            getConfigList() {
                //      获取绑定账号列表
                this.loadingReleasePageAllList = true;
                util.ajaxInternational({
                    url: '/oversea/oauth/getConfigList',
                    method: 'get',
                    params: {
                        userId: this.userId,
                        providerId: 'facebook',
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    this.creatLoading = false;
                    const data = response.data;
                    if (data.code === '1') {
                        const pages = data.data.pages;
                        for (var i = 0; i < pages.length; i++) {
                            pages[i].accountName = pages[i].name;
                        }
                        this.tableDataReleasePageAllList = this.tableDataReleasePageAllList.concat(pages);
                        for (var i = 0; i < this.tableDataReleasePageAllList.length; i++) {
                            this.$set(
                                this.tableDataReleasePageAllList[i], 'createTime',
                                this.date2str(new Date(this.tableDataReleasePageAllList[i].createTime), 'yyyy-MM-dd hh:mm:dd')
                            );
                            if (this.tableDataReleasePageAllList[i].accessStatus == 2) {
                                this.$set(this.tableDataReleasePageAllList[i], '_disabled', true);
                            }
                            if (!this.isFbService && this.tableDataReleasePageAllList[i].homePageType === 1) {
                                this.$set(this.tableDataReleasePageAllList[i], '_disabled', true);
                            }
                        }
                        // 编辑时回填数据
                        const routeParams = this.postDetail;
                        if (routeParams.id) {
                            this.textareaCreatContent = routeParams.content;
                            // 回填延时发布信息
                            if (routeParams.postType === 2) {
                                this.delayReleaseAllow = true;
                                this.delayDateValue = new Date(routeParams.scheduledPublishTime);
                                /**
                                 * @Date: 2020-06-05 19:08:02
                                 * @LastEditors: niumkiki
                                 * @description: fix bug: 延时发帖，编辑时时区都变成了东八区
                                 * @param :
                                 * @return:
                                 */

                                this.delayDateAjaxValue = this.date2str(new Date(routeParams.scheduledPublishTime), 'yyyy-MM-dd hh:mm:ss');
                                this.openTimeZoneValue = routeParams.timezoneType;
                            }
                            const accountIds = routeParams.accountIds.split(',');
                            const accounts = routeParams.accounts.split(',');
                            // 赋值入口数据对接 为了不影响其他的新增 postNameList 名称列表 解决【发帖管理：发布帖子的主页名称为“Beijing Junlin Lide Electronic Equipment Co., Ltd.”，复制帖子的时候，该主页名称被分为两个。】https://www.tapd.cn/51663361/bugtrace/bugs/view?bug_id=1151663361001006613

                            const postNames = routeParams.postNameList && Array.isArray(routeParams.postNameList) && routeParams.postNameList.length ? routeParams.postNameList : routeParams.postNames.split(',');// 赋值入口数据对接 为了不影响其他的新增 postNameList 名称列表 解决【发帖管理：发布帖子的主页名称为“Beijing Junlin Lide Electronic Equipment Co., Ltd.”，复制帖子的时候，该主页名称被分为两个。】https://www.tapd.cn/51663361/bugtrace/bugs/view?bug_id=1151663361001006613
                            const postAvatars = routeParams.postAvatars.split(',');
                            this.releaseAccountsList = [];
                            if (!this.isFbService) {
                                // 去掉里边的公司主页
                                accounts.forEach((item, index) => {
                                    for (const ele of this.tableDataReleasePageAllList) {
                                        if (item === ele.pageId && ele.homePageType === 1) {
                                            accountIds.splice(index, 1);
                                            accounts.splice(index, 1);
                                            postNames.splice(index, 1);
                                            postAvatars.splice(index, 1);
                                        }
                                        // 编辑：获取发布主页的accessToken
                                        if (item === ele.pageId) {
                                            if (this.releaseAccountsList[index]) {
                                                this.$set(this.releaseAccountsList[index], 'accessStatus', item.accessStatus);
                                            } else {
                                                this.$set(this.releaseAccountsList, index, { accessStatus: item.accessStatus });
                                            }
                                        }
                                    }
                                });
                            }
                            console.log('accounts ----> ', accounts);
                            for (let i = 0; i < accountIds.length; i++) {
                                this.$set(this.releaseAccountsList, i, {});
                                for (const ele of this.tableDataReleasePageAllList) {
                                    // 编辑：获取发布主页的accessToken
                                    if (accounts[i] === ele.pageId) {
                                        this.$set(this.releaseAccountsList[i], 'accessStatus', ele.accessStatus);
                                    }
                                }
                                this.releaseAccountsList[i].id = accountIds[i];
                                this.releaseAccountsList[i].accountName = postNames[i];
                                this.releaseAccountsList[i].headUrl = postAvatars[i];
                                this.releaseAccountsList[i].account = accounts[i];
                                this.releaseAccountsList[i].pageId = accounts[i];
                            }
                            // 媒体资源类型
                            if (routeParams.linkType) {
                                this.mediaType = routeParams.linkType === 2 ? 'video' : 'img';
                            } else {
                                this.mediaType = 'img';
                            }
                            // 根据媒体资源类型回填数据
                            if (this.mediaType === 'img') {
                                if (routeParams.link) {
                                    this.pictures = routeParams.link.split(',');
                                }
                                if (routeParams.picturesUrl) {
                                    this.allImgFiles = JSON.parse(routeParams.picturesUrl);
                                    this.allPicturesUrlSize = JSON.parse(routeParams.picturesUrl);
                                }
                            } else if (this.mediaType === 'video') {
                                if (routeParams.picturesUrl) {
                                    this.videoList = JSON.parse(routeParams.picturesUrl);
                                }
                            }
                        }

                        /* 更新 Vuex "Facebook 账号绑定已失效"状态值 */
                        // 账号
                        const accounts = data.data.accounts || [];
                        // 主页
                        // const pages = data.data.pages || [];
                        // 暂存"FB 是否失效"状态
                        let invalid = false;

                        // 遍历主页, 确定 FB 失效则停止遍历
                        pages.some(item => {
                            // "当前主页是否失效"状态
                            const invalidStatus = item.accessStatus !== 1;
                            if (item.homePageType === 1) {
                                // 当前主页是公司主页, 则直接以主页状态为 FB 失效状态
                                invalid = invalidStatus;
                            } else {
                                // 当前是个人主页
                                if (invalidStatus && accounts.find(account => account.id + '' === item.accountId + '')) {
                                    // 如果当前主页已失效, 且当前主页有对应的账号, 则认为 FB 已失效
                                    invalid = true;
                                }
                            }
                            // 返回结果, 如果为 true , 则终止 some 循环
                            return invalid;
                        });
                        // 设置 vuex isFBInvalid 状态
                        this.$store.commit('setIsFBInvalid', invalid);
                    }
                    this.loadingReleasePageAllList = false;
                });
            },
            date2str: function(x, y) {
                const z = {
                    M: x.getMonth() + 1,
                    d: x.getDate(),
                    h: x.getHours(),
                    m: x.getMinutes(),
                    s: x.getSeconds()
                };
                y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
                    return ((v.length > 1 ? '0' : '') +
                        eval(`z.${v.slice(-1)}`)).slice(-2);
                });

                return y.replace(/(y+)/g, function(v) {
                    return x.getFullYear().toString().slice(-v.length);
                });
            },
            releaseAccountTagClose(tag) {
                const list = this.releaseAccountsList;
                /* 用户选择完账号以后，若只有一个账号则不允许删除的逻辑不合理。
                  在发布推文或者存草稿时判断账号是否为空并给出提示即可 */
                /* if (list.length < 2) {
                    this.$Message.warning(this.$t('facebook.onekeyRelease.creatContent.lastAccountTip'))
                    return
                  } */
                for (let i = 0; i < list.length; i++) {
                    if (tag.id == list[i].id) {
                        list.splice(i, 1);
                        return;
                    }
                }
            },
            openAddAccountModal() {
                this.modalAddAccount = true;
                for (let i = 0; i < this.tableDataReleasePageAllList.length; i++) {
                    for (let j = 0; j < this.releaseAccountsList.length; j++) {
                        if (this.releaseAccountsList[j].id ==
                            this.tableDataReleasePageAllList[i].id) {
                            this.$nextTick(() => {
                                this.$refs.selectionADdAccount.toggleRowSelection(this.tableDataReleasePageAllList[i], true);
                            });
                        }
                    }
                }
                //        为了更新数据
                this.tableDataReleasePageAllList.push(1);
                this.tableDataReleasePageAllList.pop();
            },
            selectChangeTableModalAddAccount(list) {
                this.tableselectModalAddAccount = list;
            },
            // 复选框是否禁用
            checkboxDisabled(row, index) {
                if (row._disabled === true) {
                    return false; // 禁用
                } else {
                    return true; // 不禁用
                }
            },
            clickButtonAddAccountModalAddAccount() {
                if (this.tableselectModalAddAccount.length === 0) {
                    this.$Message.error(this.$t('facebook.onekeyRelease.creatContent.selectAccountTip'));
                    return;
                }
                this.releaseAccountsList = this.tableselectModalAddAccount;
                this.modalAddAccount = false;
            },
            isUrlHttpStart(str) {
                if (str.indexOf('.com') !== -1) {
                    const strRegex = '^((https|http)?://)';
                    const re = new RegExp(strRegex);
                    if (re.test(str)) {
                        return (true);
                    } else {
                        return (false);
                    }
                } else {
                    return false;
                }
            },
            linkSourceToShort() {
                this.sourceLink = this.sourceLink.trim();
                if (!this.isUrlHttpStart(this.sourceLink)) {
                    this.$Message.error(this.$t('facebook.onekeyRelease.creatContent.urlError'));
                    return;
                }
                this.textareaCreatContent += ` ${this.sourceLink}`;
                /* 由于FB发帖接口限制，添加短地址会导致发帖失败，
                  所以用户输入完网址点击添加时不再转换为短地址，而是直接将用户输入网址添加至正文 */
                this.loadingButtonAddsourceLink = true;
                util.ajaxInternational({
                    url: '/oversea/api/getShortUrl',
                    method: 'post',
                    data: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        longUrl: this.sourceLink
                    }
                }).then(response => {
                    const data = response.data;
                    if (data.code === '1') {
                        this.sourceLink = '';
                        this.loadingButtonAddsourceLink = false;
                    }
                });
            },
            openSelectSiteModal() {
                this.modalSelectSite = true;
                this.getShortSiteListAjax(1);
            },
            getShortSiteListAjax(pageNo) {
                this.currentPage = pageNo;
                // this.$refs.tableSelectSite.clearCurrentRow();
                this.loadingTableSelectSite = true;
                util.ajaxInternational({
                    url: '/oversea/api/getShortUrlList',
                    method: 'get',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        pageNo: pageNo,
                        pageSize: 10
                    }
                }).then(response => {
                    this.loadingTableSelectSite = false;
                    const data = response.data;
                    if (data.code === '1') {
                        this.totalSelectSiteTable = data.data.total;
                        this.tableDataReleasePageSelectSite = data.data.list;
                        this.loadingButtonAddsourceLink = false;
                    }
                });
            },
            releaseTopicTagClose(tag) {
                const list = this.releaseTopic;
                for (let i = 0; i < list.length; i++) {
                    if (tag.id == list[i].id) {
                        list.splice(i, 1);
                        /* return */
                    }
                }
            },
            inputAddTopicAjax() {
                this.loadingButtonInputAddTopic = true;
                util.ajaxInternational({
                    url: '/oversea/api/addTag',
                    method: 'post',
                    data: {
                        userId: this.userId,
                        tagName: `#${this.inputAddTopic}`,
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    const data = response.data;
                    if (data.code === '1') {
                        this.inputAddTopic = '';

                        this.tableDataModalAddTopic.unshift(data.data);
                    } else if (data.code === '0') {
                        this.$Message.info(data.message);
                    }
                    this.loadingButtonInputAddTopic = false;
                });
            },
            openAddTopicModal() {
                this.loadingTableAddTopic = true;
                this.modalAddTopic = true;
                this.tableDataModalAddTopic = [];

                util.ajaxInternational({
                    url: '/oversea/api/getTagList',
                    method: 'get',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }

                }).then(response => {
                    const data = response.data;
                    if (data.code === '1') {
                        this.tableDataModalAddTopic = data.data.reverse();
                        this.loadingTableAddTopic = false;

                        for (let i = 0; i < this.releaseTopic.length; i++) {
                            for (let j = 0; j < this.tableDataModalAddTopic.length; j++) {
                                if (this.releaseTopic[i].id ==
                                    this.tableDataModalAddTopic[j].id) {
                                    this.$nextTick(() => {
                                        this.$refs.selectionAddTopic.toggleRowSelection(this.tableDataModalAddTopic[j], true);
                                    });
                                    continue;
                                }
                            }
                        }
                    }
                });
            },
            selectChangeTableModalAddTopic(list) {
                this.tableselectModalAddTopic = list;
            },
            clickButtonAddTopicModalAddTopic() {
                if (this.tableselectModalAddTopic.length === 0) {
                    this.$Message.error(this.$t('facebook.onekeyRelease.creatContent.selectTopicTip'));
                    return;
                }
                this.releaseTopic = this.tableselectModalAddTopic;
                this.modalAddTopic = false;
            },
            // 删除话题
            deleteTopic(params) {
                this.$confirm(`<p>${this.$t('facebook.accountBinding.deleteContent')} <strong>'${params.row.tagName}'</strong></p>`, this.$t('facebook.accountBinding.deleteTitle'), {
                    confirmButtonText: this.$t('confirm'),
                    cancelButtonText: this.$t('cancel'),
                    dangerouslyUseHTMLString: true,
                    type: 'warning'
                }).then(() => {
                    this.deleteTopicAjax(params);
                });
            },
            deleteTopicAjax(params) {
                util.ajaxInternational({
                    url: '/oversea/api/deleteTag',
                    method: 'get',
                    params: {
                        id: params.row.id
                    }
                }).then(response => {
                    this.tableDataModalAddTopic.splice(params.index, 1);
                    const data = response.data;
                    if (data.code === '1') {
                        this.$Message.success(this.$t('deleteSuccess'));
                    }
                });
            },
            delayDateOnChange(date) {
                console.log('11111111delayDateOnChange');
                this.delayDateAjaxValue = this.date2str(new Date(date), 'yyyy-MM-dd hh:mm:ss');
            },
            mergeData(customData) {
                const theMergeData = [];
                const releaseAccountsList = this.releaseAccountsList;
                for (let i = 0; i < releaseAccountsList.length; i++) {
                    const releaseAccount = releaseAccountsList[i];
                    theMergeData[i] = {
                        isPage: '1', // 1代表公共主页
                        postAvatar: releaseAccount.headUrl,
                        postName: releaseAccount.accountName,
                        account: releaseAccount.pageId
                    };
                    Object.assign(theMergeData[i], customData);
                }
                return theMergeData;
            },
            linkType() {
                if (this.mediaType === 'img' && this.pictures.length > 0) {
                    return 1;
                } else if (this.mediaType === 'video' && this.videoList.length > 0) {
                    return 2;
                } else {
                    return 3;
                }
            },
            setCustomData(postType) {
                let link = '';
                let picturesUrl = '';
                if (this.mediaType === 'img') {
                    link = this.pictures.length ? this.pictures.join(',') : undefined;
                    picturesUrl = this.allPicturesUrlSize.length ? JSON.stringify(this.allPicturesUrlSize) : undefined;
                } else if (this.mediaType === 'video') {
                    link = this.videoList.length ? this.videoList.map(i => i.url).join(',') : undefined;
                    picturesUrl = this.videoList.length ? JSON.stringify(this.videoList) : undefined;
                }
                let customData = {};
                // id: this.postDetail.id,
                customData = {
                    userId: this.userId,
                    longurl: '',
                    linkType: this.linkType(), // 图片
                    apiType: '1', // facebook
                    /* 如果用户选择存入草稿箱，那么话题不作为正文内容显示 */
                    content: postType === 'draft' ? this.textareaCreatContent : this.textareaCreatContent + this.serializeReleaseTopic, // 内容
                    link, // 图片链接
                    picturesUrl // 发送的图片url及对应的size
                };
                if (this.delayReleaseAllow) {
                    customData.scheduledPublishTime = this.delayDateAjaxValue;
                    customData.timezoneType = this.openTimeZoneValue;
                    customData.postType = 2;
                } else {
                    customData.postType = 1;
                }
                return customData;
            },
            // 发布帖子
            releaseAndDraftAjax(postType, key) {
                // 文字内容为空校验
                if (!this.textareaCreatContent.trim().length > 0) {
                    this.$Message({
                        message: this.$t('facebook.onekeyRelease.creatContent.contentTip')
                    });
                    this.$emit('hasSavedDraft', false);
                    return;
                }
                // 延时发布时区为空校验
                if (this.delayReleaseAllow && this.openTimeZoneValue.trim().length < 1) {
                    this.$Message({
                        message: this.$t('facebook.onekeyRelease.creatContent.timeZoneTip')
                    });
                    this.$emit('hasSavedDraft', false);
                    return;
                }
                // 延时发布时间为空校验
                if (this.delayReleaseAllow && this.delayDateAjaxValue.trim().length < 1) {
                    this.$Message({
                        message: this.$t('facebook.onekeyRelease.creatContent.delayTip')
                    });
                    this.$emit('hasSavedDraft', false);
                    return;
                }
                // 延时发布时间过期校验
                if (this.delayReleaseAllow) {
                    if (this.canDelay) {
                        const date = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
                        const time = this.delayDateValue.getTime() - this.openTimeZoneValue.substr(3, 3) * 60 * 60 * 1000;
                        if (time - date < 10 * 60 * 1000 || time - date > 6 * 30 * 24 * 60 * 60 * 1000) {
                            this.canDelay = false;
                            return;
                        }
                    } else {
                        return;
                    }
                }
                if (this.releaseAccountsList.length) {
                    // 判断是否有失效主页
                    const invalidBrand = this.releaseAccountsList.filter(item => {
                        return item.accessStatus !== 1;
                    });
                    // 如果有失效主页
                    if (invalidBrand && invalidBrand.length > 0) {
                        this.$Message.info(this.$t('facebook.onekeyRelease.creatContent.invalidBrandTip'));
                        return;
                    }
                    const draftPostUrl = '/oversea/api/addFeedDraft';
                    const releasePostUrl = '/oversea/api/feed';
                    let url;
                    switch (postType) {
                        case 'draft':
                            url = draftPostUrl;
                            break;
                        case 'release':
                            url = releasePostUrl;
                            break;
                    }
                    this.releaseAndSaveAjaxData = this.mergeData(this.setCustomData(postType));
                    this.creatLoading = true;
                    /* 这下面的data参数就是存了一份上传图片的对应关系,让后端判断哪张图片出错了,目前还没有上线 */
                    util.ajaxInternationalJson({
                        url: url,
                        method: 'post',
                        data: {
                            postList: this.releaseAndSaveAjaxData,
                            data: this.picArr
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.$store.commit('setPostDetail', '');
                            if (postType === 'draft') {
                                this.$emit('hasSavedDraft', true);
                                /* 如果用户在新建推文时选择跳转其他路由，提示用户保存草稿成功后跳转至目标路由 */
                                if (this.toRouterObj) {
                                    this.$router.push(this.toRouterObj);
                                } else if (this.toViewName && key === 1) {
                                    /* 如果用户在新建推文时选择切换当前路由下其他页面，提示用户保存草稿成功后跳转至目标视图 */
                                    /* 此处key用于判断用户点击的是新建推文的存草稿按钮 or 提示弹窗中的存草稿按钮 */
                                    this.$emit('updateView', this.toViewName);
                                } else {
                                    /* 正常的存草稿操作，保存成功后跳转至草稿箱视图 */
                                    this.$emit('updateView', 'Draftbox');
                                }
                                this.$Message.success(this.$t('mail.writeLetter.saveSuccTitle'));
                            } else if (postType === 'release') {
                                if (this.delayReleaseAllow) {
                                    this.$Message.success(this.$t('facebook.onekeyRelease.releaseSuccess.publishingSuccessful'));
                                    this.$emit('updateView', 'Delayedrelease');
                                } else {
                                    this.$Message.success(this.$t('facebook.onekeyRelease.releaseSuccess.publishingSuccessful'));
                                    this.$emit('updateView', 'Releasedsuccessfully');
                                }

                                // fb埋点
                                this.fbGaOperate();
                            }
                        } else {
                            if (response.data.message) {
                                this.$Message.error(response.data.message);
                            } else {
                                this.$Message.error(this.$t('facebook.onekeyRelease.creatContent.operateFail'));
                            }
                            this.$emit('hasSavedDraft', false);
                        }
                        this.creatLoading = false;
                    }).catch(() => {
                        this.creatLoading = false;
                        this.$Message.error(this.$t('facebook.onekeyRelease.creatContent.operateFail'));
                        this.$emit('hasSavedDraft', false);
                    });
                } else {
                    this.$Message.info(this.$t('facebook.onekeyRelease.creatContent.selectAccountTip'));
                    this.$emit('hasSavedDraft', false);
                }
            },
            onCurrentChangeSelectSiteTable(currentRow) {
                this.highlightRowDataSelectSiteTable = currentRow;
            },
            clickButtonSelectSiteModalSelectSite() {
                if (!this.highlightRowDataSelectSiteTable.length) {
                    this.$Message.info(this.$t('facebook.onekeyRelease.creatContent.linkTip'));
                    return;
                }
                const shortUrls = this.highlightRowDataSelectSiteTable.reduce((prev, curr) => {
                    return `${prev} ${curr.shortUrl}`;
                }, '');
                /* 由于FB发帖接口限制，添加短地址会导致发帖失败，所以此处改为直接将原地址添加至正文 */
                const longUrls = this.highlightRowDataSelectSiteTable.reduce((prev, curr) => {
                    return `${prev} ${curr.longUrl}`;
                }, '');
                this.textareaCreatContent += ` ${longUrls}`;
                this.modalSelectSite = false;
                this.highlightRowDataSelectSiteTable = [];
            },
            changePagetableSelectSite(index) {
                this.getShortSiteListAjax(index);
            },
            setTimeZoneList() {
                for (let i = -12; i <= +12; i++) {
                    const valueAndLabel = `GMT${i < 0 ? '-' : '+'
                    }${i > -10 && i < 10 ? '0' : ''}${Math.abs(i)}:00`;

                    const timeZone = {
                        value: valueAndLabel,
                        label: valueAndLabel
                    };
                    this.timeZoneList.push(timeZone);
                }
            },
            /* 点击取消按钮返回至上一个页面 --- 清空页面 */
            backToLastView() {
                // if (this.lastView === 'Creatcontent') {
                //     this.$emit('updateView', 'Releasedsuccessfully');
                // } else {
                //     this.$emit('updateView', this.lastView);
                // }
                console.log('backToLastView');
                this.$store.commit('setPostDetail', '');
                this.$emit('updateView', this.tempView);
            },
            /* 判断新建推文是否有数据 */
            hasAnyContent() {
                if (!this.textareaCreatContent &&
                    !this.pictures.length &&
                    !this.releaseAccountsList.length &&
                    !this.releaseTopic.length &&
                    !this.delayReleaseAllow &&
                    !this.postDetail) {
                    return false;
                } else {
                    return true;
                }
            },
            ok() {
                this.uploadImgLimitModal = false;
            },

            // 切换上传媒体文件类型
            toggleMediaType(mediaType) {
                // 类型不变, 不处理
                if (this.mediaType === mediaType) {
                    return;
                }

                // 切换媒体类型, 清空原数据
                this.mediaType = mediaType;
                this.pictures = [];
                this.videoList = [];
                this.imgUploadingFlag = false;
                this.pictures = [];
                this.hover_index = -1;
                this.uploadImgLimitModal = false;
                this.allImgFiles = [];
                this.allImgFilesSize = 0;
                this.allPicturesUrlSize = [];
                this.mediaUploadingFlag = false;
                this.videoList = [];
                this.overSizeSingleImageList = [];
                this.overSizeTotalImageList = [];
                // 取消上传
                if (this.videoUploadSubscription) {
                    this.videoUploadSubscription.unsubscribe();
                    this.videoUploadSubscription = null;
                }
            },

            /* 上传视频 */
            triggerUploadVideo() {
                // 文件上传中校验
                if (this.mediaUploadingFlag) {
                    this.$Message.info(this.$t('crm.Modal.info_waitUploadDocument'));
                    return;
                }
                // 文件数量校验
                if (this.videoList.length > 0) {
                    this.$Message.error(this.$t('facebook.onekeyRelease.creatContent.overcountVideo'));
                    return;
                }

                // 触发上传文件 input
                this.$refs.uploadVideoInput.click();
            },
            async uploadVideo(event) {
                const originalFile = event.target.files[0];
                // 文件格式校验
                if (!this.videoFormatReg.test(originalFile.name)) {
                    this.$Message.error(this.$t('facebook.onekeyRelease.creatContent.errorFileFormatVideo'));
                    return;
                }
                // 文件大小校验
                if (originalFile.size / 1024 / 1024 / 1024 > 4) {
                    this.$Message.error(this.$t('facebook.onekeyRelease.creatContent.uploadVideoTip'));
                    return;
                }

                // 进入上传流程
                this.mediaUploadingFlag = true;
                const files = [originalFile];
                const config = {
                    useCdnDomain: true,
                    region: qiniu.region.z0
                };
                const putExtra = {
                    fname: '',
                    params: {}
                };
                // 添加上传dom面板
                const next = response => {
                };
                // 上传失败回调
                const error = async response => {
                    console.error(response);
                    if (response.message === 'file type doesn\'t match with what you specify') {
                        this.$Message.error(this.$t('facebook.onekeyRelease.creatContent.errorFileFormatVideo'));
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_uploadImage'));
                    }
                    if (++fileIndex < files.length) {
                        const observable = await this.$qiniuUpload(files[fileIndex], null, putExtra, config);
                        this.videoUploadSubscription = observable.subscribe(next, error, complete);
                    } else {
                        this.mediaUploadingFlag = false;
                        this.$refs.uploadVideoInput.value = '';
                        this.videoUploadSubscription = null;
                    }
                };
                // 图片上传成功的回调
                const complete = async response => {
                    this.picArr[response.key] = files[fileIndex].name;

                    this.videoList.push({
                        url: `${this.qiniuHttp}${response.key}`,
                        size: files[fileIndex].size
                    });
                    if (++fileIndex < files.length) {
                        const observable = await this.$qiniuUpload(files[fileIndex], null, putExtra, config);
                        this.videoUploadSubscription = observable.subscribe(next, error, complete);
                    } else {
                        this.mediaUploadingFlag = false;
                        this.$refs.uploadVideoInput.value = '';
                        this.videoUploadSubscription = null;
                    }
                };
                let fileIndex = 0;
                // 调用sdk上传接口获得相应的observable，控制上传和暂停
                const observable = await this.$qiniuUpload(files[fileIndex], null, putExtra, config);
                this.videoUploadSubscription = observable.subscribe(next, error, complete);
            },
            // 删除视频
            removeMedia(index) {
                if (this.mediaType === 'video') {
                    this.videoList.splice(index, 1);
                }
            },

            // ai tool bar
            onIputSelect(e) {
                const result = getInputSelectedText()
                if (result.text) {

                    const insert = (newText, insertStart, insertEnd) => {
                        this.textareaCreatContent = newText
                        const subInput = document.getElementById("fbNewContent")
                        subInput.focus()
                        this.$nextTick(() => {
                            subInput.setSelectionRange(insertStart, insertEnd)
                        })
                        this.$aiToolBar.destroy();
                    }

                    this.$aiToolBar.init({
                        type: 'inputBoxSelect',
                        value: result.text,
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                        onCover: (v) => {
                            const newText = coverText(this.textareaCreatContent, v, result)
                            insert(newText, result.start, result.start + v.length)
                        },
                        onInsert: (v) => {
                            const newText = insertText(this.textareaCreatContent, v, result)
                            insert(newText, result.end, result.end + v.length)
                        }
                    })
                } else {
                    this.$aiToolBar.destroy()
                }
            },
        },
        watch: {
            textareaCreatContent() {
                if (this.textareaCreatContent.length > 1000) {
                    this.isCanPost = false;
                } else {
                    this.isCanPost = true;
                }
            },
            lastView: {
                handler: function() {
                    console.log(this.lastView);
                },
                immediate: true
            },
            allImgFiles() {
                this.allImgFilesSize = this.allImgFiles.reduce((prev, curr) => {
                    return prev + curr.size;
                }, 0);
            },

            // ai tool bar
            textareaCreatContent(val) {
                if (val.toLowerCase() === '/ai') {
                    this.$aiToolBar.init({
                        type: 'inputBoxSlash',
                        onConfirm: v => {
                            this.$aiToolBar.destroy()
                            this.textareaCreatContent = v

                            const subInput = document.getElementById("fbNewContent")
                            subInput.focus()
                            this.$nextTick(() => {
                                subInput.setSelectionRange(0, v.length)
                            })
                        },
                        onAbort: () => {
                            this.textareaCreatContent = ''
                        }
                    })
                }else {
                    this.$aiToolBar.destroy()
                }
            } 
        },
        mounted() {
            // 初始化文件类型后缀正则
            this.imgFormatReg = new RegExp(`\\.(${this.imgFormatArr.join('|')})$`, 'i');
            this.videoFormatReg = new RegExp(`\\.(${this.videoFormatArr.join('|')})$`, 'i');
        },
        beforeDestroy() {
            this.allImgFilesSize = 0;
            this.allImgFiles = [];
        }
    };
</script>
<style lang="less">
    .onekey-release-creat-content {
        padding: 60px;
        width: 70%;

        .el-tag {
            margin-right: 5px;
        }

        .img-remove-icon {
            line-height: 1;
            position: absolute;
            top: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.8);

            i {
                color: #FFF;
                font-size: 15px;
                cursor: pointer;
            }
        }

        .ivu-input-group-prepend {
            background: #7B98B6;
            opacity: .4;
        }

        .creat-content-edit-text {
            text-align: right;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.40);
            margin: 10px 0;
        }

        .creat-content-edit-text-limit {
            color: #FA8241;
        }

        .demo-upload-list {
            display: inline-block;
            width: 40px;
            height: 40px;
            text-align: center;
            line-height: 40px;
            border: 1px solid transparent;
            border-radius: 4px;
            background: #fff;
            position: relative;
            box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
            margin-left: 4px;
            box-sizing: border-box;

            img {
                cursor: pointer;
                max-width: 100%;
                max-height: 100%;
                vertical-align: middle;
            }
        }
        .upload-btn-right-small {
            width: 40px;
            height: 40px;
            border: 1px dashed #ccc;

            > i {
                color: gainsboro;
                font-size: 16px;
                position: relative;
                font-weight: 700;
                left: -8px;
            }
        }
        .upload-btn-right-small:hover {
            border: 1px dashed #4285F4;
            > i {
                color: #4285F4;
            }
        }
        .creat-content-edit-layout-div-out {
            margin: 20px 0px;

            .creat-content-edit-layout-title {
                font-size: 16px;
                color: rgba(0, 0, 0, 0.80);
                font-weight: 700;
                margin: 10px 0;
            }

            .creat-content-edit-tip {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.40);
                margin: 10px 0;
            }
        }

        .creat-content-delay-release-box {
            margin-bottom: 5px;

            .ivu-picker-confirm-time {
                color: #3b78de;
                cursor: pointer;

                &:hover {
                    color: #2d63bc;
                    text-decoration: underline;
                }
            }

            & .ivu-btn-default {
                color: rgba(0, 0, 0, 0.8);
                border: 1px solid #ABBFD5;

                &:hover {
                    opacity: 0.8;
                }

                &:active {
                    background: #DCE6EF;
                }
            }
        }

        .inputAddTopic {
            margin: 12px 0;
        }

        .upload-img-title {
            color: rgba(0, 0, 0, 0.8);
        }

        .upload-img-body {
            text-align: center;
            color: red;
            margin: 10px 0;
            width: 440px;
            overflow: hidden;
            text-overflow: ellipsis;
            -o-text-overflow: ellipsis;
            -webkit-text-overflow: ellipsis;
            -moz-text-overflow: ellipsis;
            white-space: nowrap;
        }

        // .release-account-tag {
        //     margin-bottom: 30px !important;
        // }

        .invalid-btn {
            background: #E7ECF2;
            border-color: #E7ECF2;
            color: #6E819A;
            position: relative;
            // cursor: not-allowed;
            // pointer-events:none;
            margin-bottom: 15px;

            .el-tag__close {
                color: #6E819A;
                &:hover {
                    background-color:#6E819A;
                    color: #fff;
                }
            }
        }

        .invalid-tip {
            font-size: 12px;
            color: red;
            cursor: pointer;
            position: absolute;
            top:28px;
            left:0
        }
    }

    .onekey-release-creat-content .ivu-btn-success:hover {
        opacity: 0.8;
    }

    .onekey-release-creat-content .ivu-btn-success:active {
        background-color: #6E819A;
        border-color: #6E819A;
    }

    .btn-success-ghost {
        margin-left: 8px;
        height: 33px;
        width: 60px;
        padding: 0;
        line-height: 33px;
    }

    .btn-success-ghost:active {
        background: #DCE6EF !important;
        border: 1px solid #ABBFD5 !important;
    }

    .page-select-site-table {
        margin-top: 15px;
    }

    .page-select-site-table .ivu-page-prev, .page-select-site-table .ivu-page-next {
        background-color: #fff;
    }
    .save-release-button-group {
        margin-top: 10px;
    }


    .modal-add-account {
        .checkbox {
            padding: 10px;
        }
        .invalid-tips {
            font-size: 12px;
            color: red;
            cursor: pointer;
        }
    }
</style>
