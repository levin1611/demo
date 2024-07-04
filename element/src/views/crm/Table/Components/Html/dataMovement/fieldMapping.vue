<template>
    <div class="field-mapping-layout">
        <Container>
            <Aside hide-trigger class="ivu-layout-sider">
                <div class="files-uploaded-titles">
                    <span class="file-title">{{$t('data_movement.fileList')}}</span>
                    <span class="file-amount">{{filesUploaded.length}}</span>
                </div>

                <ul style="list-style: none">
                    <li v-for="(item,index) in filesUploaded" class="uploadedFiles" @click="handleFileModules(index)"
                        :class="{active:currentIndex==index}">

                            <span style="margin: 11px 50px 11px 30px;white-space: nowrap">
                                {{(index+1)+'、'+item.name | miniWordsLength}}
                            </span>

                    </li>
                </ul>
            </Aside>
            <Container>
                <Header>
                    <Menu mode="horizontal" active-name="1">
                        <div class="layout-nav">
                            <MenuItem name="1" v-if="dataMock[currentIndex] !== undefined" style="font-size: 13px">
                                {{$t('data_movement.allFields')}}({{dataMock[currentIndex].length}})
                            </MenuItem>
                            <!--                            <MenuItem name="2">映射的字段(20)</MenuItem>-->
                            <!--                            <MenuItem name="3">未映射的字段(10)</MenuItem>-->
                        </div>
                    </Menu>
                    <template v-for="(item, index) in filesUploaded">
                        <Table class="noborder-table field-mapping-table"
                               v-show="currentIndex === index"
                               v-if="isReset"
                               :height="tableHeight"
                               ref="table"
                               :data="dataMock[index] || []">
                            <TableColumn v-for="(item1, index1) in column[index]"
                                         :key="item1.key"
                                         :prop="item1.key"
                                         :label="item1.title"
                                         :width="item1.width"
                                         :show-overflow-tooltip="true">
                                <template slot-scope="scope">
                                    <template v-if="item1.key === 'fieldsInFiles' ">
                                        <span>{{scope.row[item1.key]}}</span>
                                    </template>
                                    <template v-if="item1.key === 'fieldsInCRM'">
                                        <div>
                                            <fieldMappingTable :fieldListInCustomer="fieldListInCustomer"
                                                               :fieldListInContact="fieldListInContact"
                                                               :fieldListInMyInquiry="fieldListInMyInquiry"
                                                               :fieldIndex="scope.row.fieldIndex"
                                                               :fileName="filesUploaded[index].name"
                                                               :fileCName="filesUploaded[index].cname"
                                                               :fieldsInFiles="scope.row.fieldsInFiles"
                                                               :autoFiles="automaticMapping(scope.row.fieldsInFiles, index)"
                                                               ref="fieldMapping">
                                            </fieldMappingTable>
                                        </div>
                                    </template>
                                </template>
                            </TableColumn>
                        </Table>
                    </template>
                </Header>
<!--                <el-main>-->
<!--                    -->
<!--                </el-main>-->
            </Container>
        </Container>
    </div>
</template>

<script>
    import fieldMappingTable from './fieldMapping/fieldMappingTable';
    import XLSX from 'xlsx';
    import { mapState, mapGetters } from 'vuex';
    import { dataMovement } from '@/api/crm';

    export default {
        name: 'fieldMapping',
        components: {
            fieldMappingTable
        },
        data() {
            return {
                dataMock: [],
                column: [],
                filesUploaded: [],
                filesOutput: [], // 文件表头内容
                excelData: {
                    header: null,
                    results: null
                },
                currentIndex: 0, // 当前文件
                temp: '',
                fieldListInCustomer: [],
                fieldListInContact: [],
                fieldListInMyInquiry: [],
                isReset: true,
                resetFlag: false,
                // 文件对应的模块
                isShowCustomer: [],
                isShowContact: [],
                isShowInquiry: [],
                mods: '',
                modSelected: ''
            };
        },
        filters: {
            miniWordsLength(str) {
                let len = 0;
                let temp = 0;
                for (let i = 0; i < str.length; i++) {
                    const c = str.charCodeAt(i);
                    // 单字节加1
                    if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
                        len++;
                    } else {
                        len += 2;
                    }
                    if (len <= 26) {
                        temp++;
                    }
                }
                if (len > 26) {
                    str = `${str.substring(0, temp)}...`;
                }
                return str;
            }
        },
        computed: {
            reset() {
                return this.$store.state.crm.clearSelected;
            },
            ...mapGetters(['getClearSelected']),
            ...mapState({
                user_id: state => state.userId,
                enterpriseId: state => state.enterpriseId,
                fieldMappingData: state => state.crm.fieldMappingData,
                fileToMods: state => state.crm.fileToMods,
                window_height: state => state.window_height,
                clearSelected: state => state.crm.clearSelected
            }),
            tableHeight() {
                return this.window_height - 280;
            },
            automaticMapping: function() {
                return function(fieldsInFiles, index) {
                    // 如果是重置映射，则直接返回''
                    // console.log('this.$store.state.crm.resetAutoMapping', this.$store.state.crm.resetAutoMapping);
                    // if (this.$store.state.crm.resetAutoMapping) {
                    //     return '';
                    // }
                    // 自动映射
                    // 若该映射的模块下仍有多个相同名称的字段，则优先取当前选择字段下拉列表中第一个相同名称的字段
                    let flag = true;
                    if (this.isShowCustomer[index]) {
                        for (let i = 0; i < this.fieldListInCustomer.length; i++) {
                            if (this.fieldListInCustomer[i].trim().toLowerCase() === fieldsInFiles.trim().toLowerCase()) {
                                flag = false;
                                return this.fieldListInCustomer[i];
                            }
                        }
                    }
                    if (this.isShowContact[index] && flag) {
                        for (let i = 0; i < this.fieldListInContact.length; i++) {
                            if (this.fieldListInContact[i].trim().toLowerCase() === fieldsInFiles.trim().toLowerCase()) {
                                flag = false;
                                return this.fieldListInContact[i];
                            }
                        }
                    }
                    if (this.isShowInquiry[index] && flag) {
                        for (let i = 0; i < this.fieldListInMyInquiry.length; i++) {
                            if (this.fieldListInMyInquiry[i].trim().toLowerCase() === fieldsInFiles.trim().toLowerCase()) {
                                flag = false;
                                return this.fieldListInMyInquiry[i];
                            }
                        }
                    }
                    return '';
                };
            }
        },
        methods: {
            // 自动映射
            resetMapping() {
                for (let i = 0; i < this.$refs.fieldMapping.length; i++) {
                    this.$refs.fieldMapping[i].autoMapping();
                }
                if (!this.$store.state.crm.resetAutoMapping) {
                    this.$Message.info('自动映射完毕');
                }
            },
            async handleTableHead(index, flag = false) {
                // 文件对应的表格已渲染, 代码停止执行
                if (!flag) {
                    if (this.column[index]) {
                        return undefined;
                    }
                }
                this.$set(this.column, index, [
                    { title: this.$t('data_movement.fieldsInFiles'), key: 'fieldsInFiles', width: 330 },
                    {
                        title: this.$t('data_movement.fieldsInCRM'),
                        key: 'fieldsInCRM',
                        width: 330
                    }
                ]);
                const arr = await this.getFieldsFromLocal(index);
                this.$set(this.dataMock, index, arr.map((item, fieldIndex) => {
                    return {
                        fieldsInFiles: item,
                        fieldIndex
                    };
                }));
                this.$Message.info('自动映射完毕');
            },
            getFieldsFromLocal(index) {
                this.filesUploaded = this.$store.state.crm.files;
                const name = this.filesUploaded[index].name;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key === `${name}header`) {
                        return JSON.parse(localStorage.getItem(key));
                    }
                }
            },
            handleFileModules(index) {
                this.currentIndex = index;
                this.getMods();

                // 如果重置映射后切换文件，则再次初始化
                if (this.column[index] && this.$store.state.crm.resetAutoMapping) {
                    this.$store.state.crm.resetAutoMapping = false;
                    this.resetMapping();
                } else {
                    this.handleTableHead(index);
                }
            },
            /** 展示excel文件 */
            readerData(rawFile) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => {
                        const data = e.target.result;
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const header = this.getHeaderRow(worksheet);
                        const results = XLSX.utils.sheet_to_json(worksheet);
                        this.generateData({ header, results });
                        resolve();
                    };

                    reader.readAsArrayBuffer(rawFile);
                });
            },
            getHeaderRow(sheet) {
                const headers = [];
                const range = XLSX.utils.decode_range(sheet['!ref']);
                let C;
                const R = range.s.r;
                /* start in the first row */
                for (C = range.s.c; C <= range.e.c; ++C) { /* walk every column in the range */
                    const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
                    /* find the cell in the first row */
                    let hdr = `UNKNOWN ${C}`; // <-- replace with your desired default
                    if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
                    headers.push(hdr);
                }
                return headers;
            },
            generateData({ header, results }) {
                this.excelData.header = header;
                this.excelData.results = results;
            },
            initTable() {
                this.$store.state.crm.resetAutoMapping = false;
                this.handleTableHead(0);
                this.getAllFields();
                this.resetFlag = this.$store.state.crm.clearSelected;
            },
            // 获取crm默认字段
            getAllFields() {
                this.$commonApi.columnConfigGetList({
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === '1') {
                        res.data.forEach(item => {
                            if (`${item.parentId}` === '1') {
                                this.fieldListInCustomer.push(item.cname);
                            } else if (`${item.parentId}` === '2' && item.cname !== '社交平台') {
                                this.fieldListInContact.push(item.cname);
                            } else if (`${item.parentId}` === '3') {
                                this.fieldListInMyInquiry.push(item.cname);
                            }
                        });
                        const str = '负责人';
                        const str1 = '公司名称';
                        const str2 = '创建时间';
                        const str3 = '创建人';
                        if (this.fieldListInCustomer.indexOf(str) === -1) {
                            this.fieldListInCustomer.push(str);
                        }
                        if (this.fieldListInCustomer.indexOf(str1) === -1) {
                            this.fieldListInCustomer.push(str1);
                        }
                        if (this.fieldListInCustomer.indexOf(str2) === -1) {
                            this.fieldListInCustomer.push(str2);
                        }
                        if (this.fieldListInCustomer.indexOf(str3) === -1) {
                            this.fieldListInCustomer.push(str3);
                        }
                        if (this.fieldListInContact.indexOf(str) === -1) {
                            this.fieldListInContact.push(str);
                        }
                        if (this.fieldListInContact.indexOf(str1) === -1) {
                            this.fieldListInContact.push(str1);
                        }
                        if (this.fieldListInContact.indexOf(str2) === -1) {
                            this.fieldListInContact.push(str2);
                        }
                        if (this.fieldListInContact.indexOf(str3) === -1) {
                            this.fieldListInContact.push(str3);
                        }
                        if (this.fieldListInMyInquiry.indexOf(str) === -1) {
                            this.fieldListInMyInquiry.push(str);
                        }
                        if (this.fieldListInMyInquiry.indexOf(str1) === -1) {
                            this.fieldListInMyInquiry.push(str1);
                        }
                        if (this.fieldListInMyInquiry.indexOf(str2) === -1) {
                            this.fieldListInMyInquiry.push(str2);
                        }
                        if (this.fieldListInMyInquiry.indexOf(str3) === -1) {
                            this.fieldListInMyInquiry.push(str3);
                        }
                    }
                }).then(() => {
                    this.getAllSocialMedia();
                }).then(() => {
                    this.getCustomFields1();
                }).then(() => {
                    this.getCustomFields2();
                }).then(() => {
                    this.getCustomFields3();
                });
            },
            getAllSocialMedia() {
                const orgId = this.enterpriseId;
                const typeId = 3;
                dataMovement.getFollowUpList({
                    orgId,
                    typeId
                }).then(res => {
                    if (res.code === '1') {
                        res.data.forEach(item => {
                            this.fieldListInContact.push(`社交平台-${item.attrName}`);
                        });
                    }
                });
            },
            // 获取crm用户设置字段
            getCustomFields1() {
                this.$commonApi.getColumnsShow({
                    orgId: this.enterpriseId,
                    parentId: 1
                }).then(res => {
                    if (res.code === '1') {
                        Object.values(res.data.show).forEach(item => {
                            this.fieldListInCustomer.push(item.cname);
                        });
                    }
                });
            },
            // 获取crm用户设置字段
            getCustomFields2() {
                this.$commonApi.getColumnsShow({
                    orgId: this.enterpriseId,
                    parentId: 2
                }).then(res => {
                    if (res.code === '1') {
                        Object.values(res.data.show).forEach(item => {
                            this.fieldListInContact.push(item.cname);
                        });
                    }
                });
            },
            // 获取crm用户设置字段
            getCustomFields3() {
                this.$commonApi.getColumnsShow({
                    orgId: this.enterpriseId,
                    parentId: 3
                }).then(res => {
                    if (res.code === '1') {
                        Object.values(res.data.show).forEach(item => {
                            this.fieldListInMyInquiry.push(item.cname);
                        });
                    }
                });
            },
            // 文件是否有对应的模块
            getMods() {
                const fileName = this.filesUploaded[this.currentIndex].name;
                if (fileName in this.modSelected) {
                    this.isShowCustomer[this.currentIndex] = this.modSelected[fileName].indexOf('1') !== -1;
                    this.isShowContact[this.currentIndex] = this.modSelected[fileName].indexOf('2') !== -1;
                    this.isShowInquiry[this.currentIndex] = this.modSelected[fileName].indexOf('3') !== -1;
                }
            }
        },
        created() {
            this.initTable();
            const mods = localStorage.getItem('fileToMods') ? JSON.parse(localStorage.getItem('fileToMods')) : this.$store.state.crm.fileToMods;
            this.modSelected = JSON.parse(JSON.stringify(mods));
            this.getMods();
        },
        mounted() {

        },
        watch: {
            getClearSelected(state) {
                // debugger
                if (state) {
                    // debugger
                    this.isReset = false;
                    this.$nextTick(function() {
                        this.isReset = true;
                        this.$store.state.crm.clearSelected = false;
                    });
                }
            }

        }
    };
</script>

<style scoped lang="less">
    .field-mapping-layout {
        .el-container {
            height: 100%;
        }
        .el-menu-item {
            cursor: default !important;
            &:hover {
                background-color: #FFF !important;
            }
            &:focus {
                background-color: #FFF !important;
            }
        }
        .is-active {
            color: #303133 !important;
        }
        .ivu-layout-sider {
            height: 100%;
            width: 280px;
            background-color: #fff;
            flex: 0 0 280px !important;
            max-width: 300px !important;
            border-right: 1px solid #EAEAEA;

            .uploadedFiles {
                width: 280px;
                height: 44px;
                font-family: PingFangSC-Regular;
                font-size: 14px;
                cursor: pointer;
                color: rgba(0, 0, 0, 0.80);
                letter-spacing: 0;
                line-height: 44px;
                /*margin: 11px 50px 11px 30px;*/
            }
        }
        .files-uploaded-titles {
            height: 50px;

            /*background-color: #EAEAEA;*/

            .file-title {
                font-family: PingFangSC-Regular;
                display: inline-block;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.80);
                letter-spacing: 0;
                line-height: 22px;
                margin: 14px 188.5px 14px 30px
            }

            .file-amount {
                display: block;
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.40);
                letter-spacing: 0;
                text-align: right;
                line-height: 18px;
                margin: -32px 12px 15px 259px;
            }
        }
        height: 100%;
        .field-mapping-table {
            margin-top: 20px;
            margin-left: 20px;
            height: 699px;
            .el-select-dropdown {
                max-width: 313px !important;
            }

        }

    }

    .active {
        background-color: #FFFAF8;
    }
</style>
<style lang="less">
    .field-mapping-table {
        .el-tab-pane {
            max-width: 313px !important;
        }
        .el-select-dropdown {
            max-width: 313px !important;
            .el-tabs {
                max-width: 313px !important;
                #tab-1 {
                    padding-left: 20px !important;
                }
            }
        }
    }
</style>
