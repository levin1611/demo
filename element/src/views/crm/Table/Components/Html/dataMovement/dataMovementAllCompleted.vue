<template>
    <div class="data-movement-complete">
        <div class="data-movement-progress-top">
            <!--            <Icon custom="custom custom-qianyichenggongdaxiaoxiangsusezhiBB" class="complete-icon"></Icon>-->
            <svg class="custom complete-icon" aria-hidden="true">
                <use xlink:href="#custom-qianyichenggongdaxiaoxiangsusezhiBB"></use>
            </svg>
            <span style="text-align: center;display: block;position: relative;left: 50%;transform:translateX(-50%);bottom: 30px;padding-top: 20px">{{ resultTitle }}</span>
        </div>
        <div class="data-movement-progress-table">
            <Table class="noborder-table progress-table"
                   :data="data"
                   :border="false"
                   :loading="loading">
                <TableColumn v-for="item in column"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             :width="item.width"
                             :show-overflow-tooltip="true">
                    <template slot-scope="scope">
                        <template v-if="item.key !== 'link'">
                            {{scope.row[item.key]}}
                        </template>
                        <template v-else>
                            <span class="download_text" @click="handleDownload(scope.row.link, scope.row.fileName)" v-if="scope.row.link">下载失败记录</span>
                        </template>
                    </template>
                </TableColumn>
            </Table>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    import { dataMovement } from '@/api/crm';

    export default {
        components: {},
        props: {
            isDMAborted: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                column: [
                    {
                        title: this.$t('data_movement.fileName'),
                        key: 'fileName'
                    },
                    {
                        title: this.$t('data_movement.status'),
                        key: 'status'
                    },
                    {
                        title: this.$t('data_movement.fileSucceeded'),
                        key: 'fileSucceeded'
                    },
                    {
                        title: this.$t('data_movement.fileFailed'),
                        key: 'fileFailed'
                    },
                    {
                        title: this.$t('data_movement.totalFiles'),
                        key: 'totalFiles'
                    },
                    {
                        title: '',
                        key: 'link'
                    }
                ],
                data: [],
                mappingData: [], // 映射数据
                failedData: {}, // 映射失败的数据
                loading: true,
                showFailedTitle: false
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                enterpriseId: state => state.enterpriseId,
                fieldMappingData: state => state.crm.fieldMappingData,
                fileToMods: state => state.crm.fileToMods,
                filesSucc: state => state.crm.filesSucc
            }),
            // 迁移结果
            resultTitle() {
                if (this.isDMAborted) {
                    // 取消(中止)
                    return this.$t('data_movement.data_movement_aborted');
                } else {
                    if (this.showFailedTitle) {
                        // 失败
                        return this.$t('data_movement.data_movement_failed');
                    } else {
                        // 成功
                        return this.$t('data_movement.data_movement_succeed');
                    }
                }
            }
        },
        methods: {
            // 初始迁移结果
            async initTable() {
                await dataMovement.dataResult({
                    orgId: this.enterpriseId,
                    userId: this.userId
                }).then(res => {
                    localStorage.setItem('returnFlag', 0);
                    this.$store.commit('setFilesSucc', res.data);
                    if (res.data != null) {
                        localStorage.setItem('filesSucc', JSON.stringify(res.data));
                        this.showFailedTitle = false;
                    } else {
                        this.showFailedTitle = true;
                    }
                    console.log(this.filesSucc, '*************');
                });
                // 此处不需要做接口异常处理 如果接口出现异常，则下面的逻辑会修改this.showFailedTitle会变化并提示用户
                this.mappingData = this.filesSucc == null ? JSON.parse(localStorage.getItem('filesSucc')) : this.filesSucc;
                console.log('k', this.mappingData);
                this.showFailedTitle = this.mappingData == null;
                this.loading = false;
                this.failedData = {};
                if (this.mappingData) {
                    this.mappingData.forEach(item => {
                        let status;
                        if (this.isDMAborted) {
                            status = this.$t('data_movement.migrationCancelled');
                        } else if (item.success === item.total) {
                            status = this.$t('data_movement.allSucceeded');
                        } else if (item.fail === item.total) {
                            status = this.$t('data_movement.allFailed');
                        } else {
                            status = this.$t('data_movement.partiallySucceeded');
                        }
                        this.data.push({
                            fileName: item.name,
                            status: status,
                            fileSucceeded: this.isDMAborted ? '-' : item.success,
                            fileFailed: this.isDMAborted ? '-' : item.fail,
                            totalFiles: this.isDMAborted ? '-' : item.total,
                            link: this.isDMAborted ? undefined : item.link
                        });
                    });
                }
            },
            // 下载失败记录
            handleDownload(link, filename) {
                util.ajax({
                    url: '/crm-transfer/inquiryImportLog/downLoadResultFile',
                    method: 'get',
                    responseType: 'blob',
                    params: {
                        id: link
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
                            a.download = filename;
                            a.click();
                            URL.revokeObjectURL(a.href); // 释放通过 URL.createObjectURL() 创建的 URL
                        }
                    };
                    fileReader.readAsText(data);
                });
            }
        },
        created() {
            this.initTable();
        }
    };
</script>

<style scoped lang="less">
    .data-movement-progress-top {
        .complete-icon {
            display: block;
            width: 50px;
            height: 50px;
            margin: 30px auto;
        }

        text-align: center;

        .data-movement-progress {
            width: 500px;
            top: 150px;

        }
    }

    .download_text{
        color: #2D63BC;
        &:hover {
            cursor: pointer;
            text-decoration: underline;
        }
    }

</style>
<style lang="less">
    .data-movement-progress-table {
        .progress-table {
            /*top: 180px;*/
            width: 100%;
            .cell {
                padding-left: 30px !important;
            }
        }
    }
</style>
