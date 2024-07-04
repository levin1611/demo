<template>
    <Modal
           :visible.sync="detailVisible"
           :modal-append-to-body="false"
           :before-close="handleClose">
        <div slot="title" class="dialog-title">
            <span class="cloud-detail-title">{{title}}</span>
            <span class="cloud-detail-title-text">{{$t('material.details.showAll')}}</span>
        </div>
    <div class="cloud-push-details">
        <div class="cloud-push-head">
<!--            <span class="cloud-push-title">{{title}}</span>-->
            <div class="cloud-push-title-right" v-if="dataList.length !== 0">
                <span>{{$t('material.details.shareDocs')}}</span>
                <!-- <svg class="svg-icon custom" aria-hidden="true" v-if="suffix === 'pdf'" style="display: inline-block;font-size:30px;">
                    <use xlink:href="#custom-PDF"></use>
                </svg>
                <svg class="svg-icon custom" aria-hidden="true" v-else-if="suffix === 'ppt' || suffix === 'pptx'" style="display: inline-block;font-size:30px;">
                    <use xlink:href="#custom-PPT"></use>
                </svg>
                <svg class="svg-icon custom" aria-hidden="true" v-else-if="suffix === 'xlsx' || suffix === 'xls'" style="display: inline-block;font-size:30px;">
                    <use xlink:href="#custom-Excel"></use>
                </svg>
                <svg class="svg-icon custom" aria-hidden="true" v-else-if="suffix === 'doc' || suffix === 'docx'" style="display: inline-block;font-size:30px;">
                    <use xlink:href="#custom-Word"></use>
                </svg>
                <svg class="svg-icon custom" aria-hidden="true" v-else-if="suffix === 'csv'" style="display: inline-block;font-size:30px;">
                    <use xlink:href="#custom-CSV"></use>
                </svg>
                <svg class="svg-icon custom" aria-hidden="true" v-else-if="suffix === 'jpg'" style="display: inline-block;font-size:30px;">
                    <use xlink:href="#custom-JPG"></use>
                </svg>
                <svg class="svg-icon custom" aria-hidden="true" v-else-if="suffix === 'png'" style="display: inline-block;font-size:30px;">
                    <use xlink:href="#custom-PNG"></use>
                </svg>
                <svg class="svg-icon custom" aria-hidden="true" v-else-if="suffix === 'gif'" style="display: inline-block;font-size:30px;">
                    <use xlink:href="#custom-GIF"></use>
                </svg>
                <svg class="svg-icon custom" aria-hidden="true" v-else style="display: inline-block;font-size:30px;">
                    <use xlink:href="#custom-rect"></use>
                </svg> -->
                <fileNameIcon :iconName="suffix" :styles="{fontSize:'30px'}"></fileNameIcon>
                <span>{{filename}} </span>
                <span>{{fileSize | formatFileSize}} </span>
                <span>{{$t('material.details.createTime')}}：{{createTime}} </span>
                <span>{{$t('material.details.shares')}}：{{shareCount}}</span>
<!--                <Button type="primary" class="cloud-push-head-return" @click="goBack">返回</Button>-->
            </div>
        </div>
        <div>
            <Table
                    :data="tableData"
                    :height="table_height"
                    v-loading="loading"
                    >
                <TableColumn
                        type="index"
                        :label="$t('material.details.index')"
                        width="50">
                </TableColumn>
                <TableColumn
                        v-for="item in columns"
                        :key="item.key"
                        :prop="item.key"
                        :label="item.title"
                        :width="item.width"
                        :min-width="item.width || 64"
                        :formatter="item.formatter"
                        :show-overflow-tooltip="true"></TableColumn>
            </Table>
<!--            <div class="main-footer-page">-->
<!--                <Page :page-sizes="pagesizeopts" ref="pages" :total="totalpage" :current-page="curpage"-->
<!--                      :page-size="pagesize"-->
<!--                      @current-change="changePage" @size-change="sizeChange"-->
<!--                      layout='total, prev, pager, next, sizes, jumper, ->'></Page>-->
<!--            </div>-->
        </div>
    </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    export default {
        name: 'cloudPushDetails',
        props: [
            'id',
            'detailVisible'
        ],
        data() {
            return {
                tableData: [],
                columns: [
                    { title: this.$t('material.details.shareTime'), key: 'createTime', width: 150 },
                    { title: this.$t('material.details.shareMethod'), key: 'type', width: 100 },
                    { title: this.$t('material.details.shareAddress'), key: 'url' },
                    { title: this.$t('material.Data.shares'), key: 'shareCount', width: 100 },
                    { title: this.$t('material.Data.views'), key: 'pv', width: 100 },
                    { title: this.$t('material.Data.visitors'), key: 'uv', width: 100 }
                ],
                pagesizeopts: [10, 20, 30, 50],
                curpage: 1,
                pagesize: 10,
                pagenum: 1,
                perpagenum: '20条/页',
                totalpage: 0,
                loading: false, // 加载图标
                title: '',
                suffix: '',
                filename: '',
                fileSize: '',
                createTime: '',
                shareCount: 0,
                dataList: []
            };
        },
        computed: {
            ...mapState({
                window_height: state => state.window_height
            }), // 从 vuex 中获取属性
            table_height() {
                const temp = this.window_height ? this.window_height - 400 : document.body.clientHeight - 400;
                return temp > 200 ? temp : 200;
            }
        },
        filters: {
            formatFileSize(size) {
                if (size < 1024) {
                    return `${size}B`;
                } else if (size < (1024 * 1024)) {
                    let temp = size / 1024;
                    temp = temp.toFixed(2);
                    return `${temp}KB`;
                } else if (size < (1024 * 1024 * 1024)) {
                    let temp1 = size / (1024 * 1024);
                    temp1 = temp1.toFixed(2);
                    return `${temp1}MB`;
                } else {
                    let temp2 = size / (1024 * 1024 * 1024);
                    temp2 = temp2.toFixed(2);
                    return `${temp2}GB`;
                }
            }
        },
        methods: {
            // 获取文件信息
            getPush() {
                console.log('!!!!!', this.id);
                if (this.id === '') {
                    return;
                }
                const data = {
                    id: this.id
                };
                util.ajax233({
                    url: '/push/getPush',
                    method: 'post',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        this.dataList = res.data.data;
                        this.title = this.dataList.title;
                        this.suffix = this.dataList.suffix;
                        this.filename = this.dataList.filename;
                        this.createTime = `${new Date(this.dataList.createTime).format('yyyy-MM-dd hh:mm')}`;
                        this.shareCount = this.dataList.shareCount;
                        this.fileSize = this.dataList.fileSize;
                    } else {
                        this.$Message.error(res.data.message);
                    }
                });
            },
            // 获取分享详情
            shareRecord() {
                this.loading = true;
                const data = {
                    shareId: this.id,
                    page: this.curpage,
                    pageNumber: this.pagesize
                };
                util.ajax233({
                    url: '/shareRecord/getList',
                    method: 'post',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        if (res.data.data !== null) {
                            this.tableData = res.data.data.list;
                            this.totalpage = res.data.data.total;
                        } else {
                            this.tableData = [];
                            this.totalpage = 0;
                        }
                    } else {
                        this.$Message.error(res.data.message);
                    }
                    this.loading = false;
                });
            },
            /* 改变页码 */
            changePage(page) {
                this.data1 = [];
                this.loading = true;
                this.curpage = page;
                this.shareRecord();
            },
            /* 改变每页条数 */
            sizeChange(size) {
                this.pagesize = size;
                /* 如果当前不是第一页 重置为第一页 会自动触发 changepage */
                if (this.curpage !== 1) {
                    this.curpage = 1;
                } else {
                    this.loading = true;
                    this.shareRecord();
                }
            },
            goBack() {
                this.$emit('update:showField', 0);
            },
            handleClose() {
                this.$emit('changeDetailModel', false);
            }
        },
        watch: {
            detailVisible: {
                handler(val) {
                    console.log(val);
                    if (val === true) {
                        this.getPush();
                        this.shareRecord();
                    } else {
                        this.tableData = [];
                        this.dataList = [];
                    }
                }
            }
        }

    };
</script>

<style scoped lang="less">
    .dialog-title{
        display: flex;
        align-items: center;
        .cloud-detail-title{
            color: #303133;
            font-size: 18px;
            line-height: 24px;
        }
        .cloud-detail-title-text{
            font-size: 14px;
        }
    }
    .cloud-push-details{
        .cloud-push-head{
            margin: 20px 0;
            color: #000000;
            font-size: 16px;
            line-height: 24px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            .cloud-push-title{
                font-family: PingFangSC-Regular;
                font-size: 16px;
                color: rgba(0,0,0,0.80);
                letter-spacing: 0;
                width: 45%;
            }
            .cloud-push-title-right{
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0,0,0,0.80);
                letter-spacing: 0;
                line-height: 18px;
            }
            .cloud-push-head-return{
                margin-left: 20px;
                height: 39px;
            }
        }
    }
</style>
