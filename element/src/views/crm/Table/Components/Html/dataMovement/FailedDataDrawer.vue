<template>
    <Drawer size="75%"
            :modal="false"
            :show-close="false"
            :visible.sync="visible"
            :with-header="true"
            :wrapperClosable="true"
            :append-to-body="true"
            class="drawer-show-main-header drawer-close-button-moveUp failed-data-drawer"
            @close="handleClose">
        <div style="height: 50px">
            <h3 style="display: inline-block" class="data-movement-drawer-title">
                迁移失败记录
            </h3>
            <a @click="handleClose" class="drawer-close-button">
                <Icon custom="custom-drawer-detail-close"></Icon>
            </a>
        </div>
        <Table :height="table_height"
               :data="tableData"
               v-loading="loading"
               highlight-current-row
               ref="table"
               size="medium"
               class="tabmain noBoxShadow-right noborder-table" >
            <TableColumn prop="fileName"
                         label="文件名称"
                         width="450"
                         :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <span>
                        <span style="color: #FA8241;font-size: 12px" v-if="scope.row.isCompleted === 0">(迁移未完成)</span>
                        <span style="color: #FA8241;font-size: 12px" v-if="scope.row.isCompleted === 2">(导入中)</span>
                        {{scope.row.fileName}} </span>
                </template>
            </TableColumn>
            <TableColumn prop="failureNums"
                         label="迁移失败数量"
                         width="175">
                <template slot-scope="scope">
                    <span>{{scope.row.failCount}}</span>
                </template>
            </TableColumn>
            <TableColumn prop="importDate"
                         label="迁移时间"
                         width="175">
                <template slot-scope="scope">
                    <span>{{dateFormat('yyyy-MM-dd hh:mm:ss', scope.row.createTime)}}</span>
                </template>
            </TableColumn>
            <TableColumn label="操作"
                         width="100">
                <template slot-scope="scope">
                    <span class="download_text" @click="handleDownload(scope.row.id, scope.row.fileName)">下载</span>
                </template>
            </TableColumn>
        </Table>
        <div style="margin-right: 30px; overflow: hidden">
            <Page :page-size="pageSize"
                  :page-sizes="pageSizeOpts"
                  :total="totalNum"
                  :current-page="curPage"
                  layout="total, prev, pager, next, sizes, jumper"
                  class="pageWrap-right"
                  @current-change="changePage"
                  @size-change="pageSizeChange"  >
            </Page>
        </div>
    </Drawer>
</template>

<script>
    import { mapState } from 'vuex';
    import { dataMovement } from '@/api/crm';
    import util from '@/libs/util';
    export default {
        name: 'FailedDataDrawer',
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...mapState({
                'window_height': 'window_height'
            }),
            table_height() {
                let temp = this.window_height ? this.window_height - 175 : document.body.clientHeight - 175;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            }
        },
        data() {
            return {
                columns: [],
                tableData: [],
                pageSize: 20,
                pageTotal: 0,
                curPage: 1,
                loading: true, // 加载图标
                pageSizeOpts: [20, 50, 100],
                maxPageNum: 1,
                totalNum: 0
            };
        },
        methods: {
            handleClose() {
                this.$emit('update:visible', false);
            },
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    this.getFailedData();
                }
            },
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                this.getFailedData();
            },
            click_blank(e) {
                if (this.visible) {
                    let boo = true;
                    let temp_el = e.target;
                    while (temp_el && !temp_el.classList.contains('single-page')) {
                        if (temp_el.classList.contains('el-tooltip')) {
                            boo = false;
                            break;
                        } else {
                            temp_el = temp_el.parentElement;
                        }
                    }
                    if (boo) {
                        this.$emit('update:visible', false);
                    }
                }
            },
            // 获取迁移记录
            getFailedData() {
                this.loading = true;
                dataMovement.getInquiryImportLogList({
                    pageSize: this.pageSize,
                    pageNo: this.curPage
                }).then(res => {
                    if (res.code === '1') {
                        this.tableData = res.data.list;
                        this.totalNum = res.data.total;
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);
                        this.loading = false;
                    } else {
                        this.$Message.error('获取数据失败，请重试');
                        this.loading = false;
                    }
                });
            },
            // 下载失败记录
            handleDownload(id, fileName) {
                // todo 拼连接
                util.ajax({
                    url: '/crm-transfer/inquiryImportLog/downLoadResultFile',
                    method: 'get',
                    responseType: 'blob',
                    params: {
                        id: id
                    }
                }).then(res => {
                    console.log('<<<<<', res);
                    const data = res.data;
                    const fileReader = new FileReader();
                    const _this = this;
                    fileReader.onload = function() {
                        try {
                            const jsonData = JSON.parse(this.result);
                            if (jsonData.code) {
                                console.log('jsonData.code', jsonData.code);
                                console.log('jsonData.code', jsonData.message);
                                _this.$Message.warning(jsonData.message);
                            }
                        } catch (err) {
                            const data = res.data;
                            const blob = new Blob([data], { type: 'application/vnd.ms-excel' });

                            const a = document.createElement('a');
                            a.href = window.URL.createObjectURL(blob);
                            a.download = fileName;
                            a.click();
                            URL.revokeObjectURL(a.href); // 释放通过 URL.createObjectURL() 创建的 URL
                        }
                    };
                    fileReader.readAsText(data);
                });
            },
            dateFormat(fmt, timeStramp) {
                if (typeof (timeStramp) === 'string' && timeStramp.includes('-')) {
                    timeStramp = timeStramp.replace(/\-/g, '/');
                }
                const date = new Date(timeStramp);
                const o = {
                    'M+': date.getMonth() + 1, // 月份
                    'd+': date.getDate(), // 日
                    'h+': date.getHours(), // 小时
                    'm+': date.getMinutes(), // 分
                    's+': date.getSeconds(), // 秒
                    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
                    S: date.getMilliseconds() // 毫秒
                };
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length));
                }
                for (const k in o) {
                    if (new RegExp(`(${k})`).test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                    }
                }
                return fmt;
            }
        },
        created() {
            this.getFailedData();
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
            visible: {
                handler(val) {
                    if (val) {
                        this.getFailedData();
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .download_text{
        color: #2D63BC;
        &:hover {
            cursor: pointer;
            text-decoration: underline;
        }
    }
</style>
<style lang="less">
    .failed-data-drawer{
        .el-drawer__body {
            padding-left: 20px !important;
            padding-top: 20px !important;
        }
        .data-movement-drawer-title {
            font-family: PingFangSC-Medium;
            font-size: 18px;
            color: rgba(0, 0, 0, 0.80);
            letter-spacing: 0;
            line-height: 26px;
            padding-left: 8px !important;
        }
    }
</style>
