<template>
    <keep-alive>
        <div class="module-mapping-layout">
            <Container>
                <Aside hide-trigger class="left-side-container">
                    <div class="files-uploaded-titles">
                        <span class="file-title">{{$t('data_movement.fileList')}}</span>
                        <span class="file-amount">{{filesUploaded.length}}</span>
                    </div>

                    <ul style="list-style: none">
                        <li v-for="(item,index) in filesUploaded" class="uploadedFiles"
                            @click="handleFileModules(index,item)" :class="{active:currentIndex==index}">

                            <span style="margin: 11px 50px 11px 30px;white-space: nowrap">{{(index+1)+'、'+item.name | miniWordsLength}}
                            </span>

                        </li>
                    </ul>
                </Aside>
                <Container>
                    <header class="main-content-header">
                        <Tabs @click="handleMods" :value="selectedTab">
                            <TabPane label="所有模块(3)" name=1>
                                <IviewCheckboxGroup v-model="moduleSelected" border>
                                    <div class="customer-module" @click.stop.prevent="handleCustomerClick">
                                        <IviewCheckbox class="module-checkbox" label="customer" v-model="customer" border>
                                            <Icon custom="custom custom-customer" size="36" class="module-icon"></Icon>
                                            <div style="position: absolute">
                                                <p class="p-1">{{$t('data_movement.customerManagement')}}</p>
                                                <p class="p-2">{{customerNum}}{{$t('data_movement.fileNum')}}</p>
                                            </div>
                                        </IviewCheckbox>
                                    </div>
                                    <div class="inquiry-module" @click.stop.prevent="handleInquiryClick" >
                                        <IviewCheckbox class="module-checkbox" label="inquiry" v-model="inquiry" border>
                                            <Icon custom="custom custom-inquiry" size="36" class="module-icon"></Icon>
                                            <div style="position: absolute">
                                                <p class="p-1">{{$t('data_movement.inquiryManagement')}}</p>
                                                <p class="p-2">{{inquiryNum}}{{$t('data_movement.fileNum')}}</p>
                                            </div>
                                        </IviewCheckbox>
                                    </div>
                                    <div class="contact-module" @click.stop.prevent="handleContactClick">
                                        <IviewCheckbox class="module-checkbox" label="contact" v-model="contact" border>
                                            <Icon custom="custom custom-contact" size="36" class="module-icon"></Icon>
                                            <div style="position: absolute">
                                                <p class="p-1">{{$t('data_movement.contactManagement')}}</p>
                                                <p class="p-2">{{contactNum}}{{$t('data_movement.fileNum')}}</p>
                                            </div>
                                        </IviewCheckbox>
                                    </div>
                                </IviewCheckboxGroup>
                            </TabPane>
                            <TabPane :label="`映射的模块(${num})`" name=2>
                                <IviewCheckboxGroup v-model="Selected">
                                    <div class="customer-module" v-show="customer===true" @click.stop.prevent="handleCustomerClick">
                                        <IviewCheckbox class="module-checkbox" label="customer" v-model="customer" :checked="customer">
                                            <Icon custom="custom custom-customer" size="36" class="module-icon"></Icon>
                                            <div style="position: absolute">
                                                <p class="p-1" style="top:9px">{{$t('data_movement.customerManagement')}}</p>
                                                <p class="p-2" style="top:9px">{{customerNum}}{{$t('data_movement.fileNum')}}</p>
                                            </div>
                                        </IviewCheckbox>
                                    </div>
                                    <div class="inquiry-module"  v-show="inquiry===true" @click.stop.prevent="handleInquiryClick">
                                        <IviewCheckbox class="module-checkbox" label="inquiry" v-model="inquiry">
                                            <Icon custom="custom custom-inquiry" size="36" class="module-icon"></Icon>
                                            <div style="position: absolute">
                                                <p class="p-1" style="top: 9px">{{$t('data_movement.inquiryManagement')}}</p>
                                                <p class="p-2" style="top:9px">{{inquiryNum}}{{$t('data_movement.fileNum')}}</p>
                                            </div>
                                        </IviewCheckbox>
                                    </div>
                                    <div class="contact-module" v-show="contact===true" @click.stop.prevent="handleContactClick">
                                        <IviewCheckbox class="module-checkbox" label="contact" v-model="contact">
                                            <Icon custom="custom custom-contact" size="36" class="module-icon"></Icon>
                                            <div style="position: absolute">
                                                <p class="p-1" style="top: 9px">{{$t('data_movement.contactManagement')}}</p>
                                                <p class="p-2" style="top:9px">{{contactNum}}{{$t('data_movement.fileNum')}}</p>
                                            </div>
                                        </IviewCheckbox>
                                    </div>
                                </IviewCheckboxGroup>
                            </TabPane>
                            <TabPane :label="`未映射的模块(${3 - num})`" name=3>
                                <IviewCheckboxGroup v-model="moduleSelected">
                                    <div class="customer-module" @click.stop.prevent="handleCustomerClick" v-if="customer==false">
                                        <IviewCheckbox class="module-checkbox" label="customer" v-model="customer">
                                            <Icon custom="custom custom-customer" size="36" class="module-icon"></Icon>
                                            <div style="position: absolute">
                                                <p class="p-1" style="top:9px">{{$t('data_movement.customerManagement')}}</p>
                                                <p class="p-2" style="top:9px">{{customerNum}}{{$t('data_movement.fileNum')}}</p>
                                            </div>
                                        </IviewCheckbox>
                                    </div>
                                    <div class="inquiry-module" @click.stop.prevent="handleInquiryClick" v-if="inquiry==false">
                                        <IviewCheckbox class="module-checkbox" label="inquiry" v-model="inquiry">
                                            <Icon custom="custom custom-inquiry" size="36" class="module-icon"></Icon>
                                            <div style="position: absolute">
                                                <p class="p-1" style="top:9px">{{$t('data_movement.inquiryManagement')}}</p>
                                                <p class="p-2" style="top:9px">{{inquiryNum}}{{$t('data_movement.fileNum')}}</p>
                                            </div>
                                        </IviewCheckbox>
                                    </div>
                                    <div class="contact-module" @click.stop.prevent="handleContactClick" v-if="contact==false">
                                        <IviewCheckbox class="module-checkbox" label="contact" v-model="contact">
                                            <Icon custom="custom custom-contact" size="36" class="module-icon"></Icon>
                                            <div style="position: absolute">
                                                <p class="p-1" style="top:9px">{{$t('data_movement.contactManagement')}}</p>
                                                <p class="p-2" style="top:9px">{{contactNum}}{{$t('data_movement.fileNum')}}</p>
                                            </div>
                                        </IviewCheckbox>
                                    </div>
                                </IviewCheckboxGroup>
                            </TabPane>
                        </Tabs>
                    </header>

                </Container>
            </Container>
        </div>
    </keep-alive>
</template>

<script>
    export default {
        name: 'moduleFileMapping',
        data() {
            return {
                checked: false,
                filesUploaded: [], // 用户所上传的文件
                currentIndex: 0, // 当前文件
                moduleSelected: [], // 选中的模块
                selectedTab: '1', // 选中的标签页,默认为1
                showCheckbox: true, // 是否展示模块选项
                customer: false,
                inquiry: false,
                contact: false,
                isSelected: false,
                fileToMods: {}, // 文件与模块的映射关系
                num: 0,
                Selected: [],
                texts: '',
                customerNum: 0, // 选中客户模块的文件数量
                inquiryNum: 0, // 选中询盘模块的文件数量
                contactNum: 0 // 选中联系人模块的文件数量
            };
        },
        filters: {
            miniWordsLength(str) {
                let len = 0;
                let temp = 0;
                for (let i = 0; i < str.length; i++) {
                    let c = str.charCodeAt(i);
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
        methods: {
            // 点击未选中模块的客户管理 
            handleCustomerClick() {
                console.log('clicked!!!!')
                let obj = Object.assign({}, this.fileToMods);
                let files = this.filesUploaded;
                let index = this.currentIndex;
                let name = files[index].name;
                if (!(name in obj)) {
                    obj[name] = [];
                }
                this.customer = !this.customer;
                if (this.customer) {
                    obj[name].push('1'); // 公司或客户为1
                    this.customerNum++;
                    this.$store.state.crm.customerNum = this.customerNum;
                    localStorage.setItem('customerNum', this.customerNum);
                } else {
                    for (let i = 0; i < obj[name].length; i++) {
                        if (obj[name][i] === '1') {
                            obj[name].splice(i, 1);
                            this.customerNum--;
                            this.$store.state.crm.customerNum = this.customerNum;
                            localStorage.setItem('customerNum', this.customerNum);
                        }
                    }
                }
                let arr = this.uniqArr(obj[name]);
                this.num = arr.length;
                this.fileToMods = Object.assign(this.fileToMods, obj);
                this.$store.state.crm.fileToMods = Object.assign(this.$store.state.crm.fileToMods, this.fileToMods);
                localStorage.setItem('fileToMods', JSON.stringify(this.$store.state.crm.fileToMods));
            },
            // 点击未选中模块的询盘管理
            handleInquiryClick() {
                this.inquiry = !this.inquiry;
                let obj = Object.assign({}, this.fileToMods);
                let files = this.filesUploaded;
                let index = this.currentIndex;
                let name = files[index].name;
                if (!(name in obj)) {
                    obj[name] = [];
                }
                if (this.inquiry) {
                    obj[name].push('3'); // 询盘为3
                    this.inquiryNum++;
                    this.$store.state.crm.inquiryNum = this.inquiryNum;
                    localStorage.setItem('inquiryNum', this.inquiryNum);
                } else {
                    for (let i = 0; i < obj[name].length; i++) {
                        if (obj[name][i] === '3') {
                            obj[name].splice(i, 1);
                            this.inquiryNum--;
                            this.$store.state.crm.inquiryNum = this.inquiryNum;
                            localStorage.setItem('inquiryNum', this.inquiryNum);
                        }
                    }
                }
                let arr = this.uniqArr(obj[name]);
                this.num = arr.length;
                this.fileToMods = Object.assign(this.fileToMods, obj);
                this.$store.state.crm.fileToMods = Object.assign(this.$store.state.crm.fileToMods, this.fileToMods);
                localStorage.setItem('fileToMods', JSON.stringify(this.$store.state.crm.fileToMods));
            },
            // 点击未选中模块的联系人管理
            handleContactClick() {
                this.contact = !this.contact;
                let obj = Object.assign({}, this.fileToMods);
                let files = this.filesUploaded;
                let index = this.currentIndex;
                let name = files[index].name;
                if (!(name in obj)) {
                    obj[name] = [];
                }
                if (this.contact) {
                    obj[name].push('2'); // 联系人为2
                    this.contactNum++;
                    this.$store.state.crm.contactNum = this.contactNum;
                    localStorage.setItem('contactNum', this.contactNum);
                } else {
                    for (let i = 0; i < obj[name].length; i++) {
                        if (obj[name][i] === '2') {
                            obj[name].splice(i, 1);
                            this.contactNum--;
                            this.$store.state.crm.contactNum = this.contactNum;
                            localStorage.setItem('contactNum', this.contactNum);
                        }
                    }
                }
                let arr = this.uniqArr(obj[name]);
                this.num = arr.length;
                this.fileToMods = Object.assign(this.fileToMods, obj);
                this.$store.state.crm.fileToMods = Object.assign(this.$store.state.crm.fileToMods, this.fileToMods);
                localStorage.setItem('fileToMods', JSON.stringify(this.$store.state.crm.fileToMods));
            },
            // 切换用户选中的文件
            handleFileModules(index, item) {
                this.currentIndex = index;
                let files = this.filesUploaded;
                let name = files[index].name;
                let mods = this.fileToMods;
                if (name in mods) {
                    this.customer = (mods[name].indexOf('1') !== -1);
                    this.contact = (mods[name].indexOf('2') !== -1);
                    this.inquiry = (mods[name].indexOf('3') !== -1);
                } else {
                    this.customer = false;
                    this.contact = false;
                    this.inquiry = false;
                    this.num = 0;
                }
                let arr = this.uniqArr(mods[name]);
                this.num = arr.length;
            },
            /** 去重 */
            uniqArr(arr) {
                let newArr = [];
                if (typeof arr === 'undefined') {
                    return newArr;
                }
                for (let i = 0; i < arr.length; i++) {
                    if (newArr.indexOf(arr[i]) === -1) {
                        newArr.push(arr[i]);
                    }
                }
                return newArr;
            },
            /** 初始化Table */
            initTable() {
                this.contactNum = localStorage.getItem('contactNum') ? localStorage.getItem('contactNum') : 0;
                this.$store.state.crm.contactNum = this.contactNum;
                this.customerNum = localStorage.getItem('customerNum') ? localStorage.getItem('customerNum') : 0;
                this.$store.state.crm.customerNum = this.customerNum;
                this.inquiryNum = localStorage.getItem('inquiryNum') ? localStorage.getItem('inquiryNum') : 0;
                this.$store.state.crm.inquiryNum = this.inquiryNum;
                if (JSON.stringify(this.fileToMods) === '{}') {
                    if (localStorage.getItem('fileToMods')) {
                        this.fileToMods = JSON.parse(localStorage.getItem('fileToMods'));
                        this.$store.state.crm.fileToMods = this.fileToMods;
                    } else {
                        this.fileToMods = {};
                        this.$store.state.crm.fileToMods = this.fileToMods;
                    }
                }
                let temp = this.$store.state.crm.files;
                this.filesUploaded = temp.filter(item => {
                    return item !== null;
                })
            },
            // 切换模块
            handleMods(name) {
                this.selectedTab = name;
            }
        },
        created() {
            this.initTable();
        },
        mounted() {
            this.handleFileModules(0);
        }

    };
</script>

<style scoped lang="less">
    .module-mapping-layout {
        .left-side-container {
            background-color: #FFFFFF;
            width: 279px !important;
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

        .el-container {
            height: 100%;

            .el-aside {
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

                /*&:hover{*/
                /*    background-color: #FFFAF8;*/
                /*}*/
            }
            .main-content-header {
                padding-left: 30px !important;
            }
            .el-tabs__header {
                background-color: #fff;
                height: 50px;
                padding: 0 30px !important;
                border-bottom: 1px solid #EAEAEA;
                .el-tabs__nav-wrap:after {
                    height: 1px !important;
                }
                .ivu-menu-item :first-child {
                    margin-left: 280px;
                }

                .ivu-menu-horizontal {
                    height: 50px;

                    .layout-nav {
                        .ivu-menu-item-selected, .ivu-menu-item:hover {
                            border: none !important;
                            color: #4285F2 !important;
                        }

                        .ivu-menu-item {
                            border: none !important;
                        }

                    }
                }
            }

            .customer-module {
                display: inline-block;
                padding: 30px 0px;
                margin-right: 20px;
                .module-checkbox {
                    width: 120px;
                    height: 120px;
                    background: #FFFFFF;
                    box-shadow: 0 1px 3px 0 #CBD6E2;

                    &:hover {
                        background-color: #F3F4F7;
                        box-shadow: 0 1px 3px 0 #CBD6E2;
                    }
                    /*p {*/
                    /*    position: relative;*/
                    /*    height: 20px;*/
                    /*    width: 80px;*/
                    /*    left: 8px;*/
                    /*    top: 27px;*/
                    /*    text-align: center;*/
                    /*    font-size: 12px;*/
                    /*    font-family: PingFangSC-Regular;*/
                    /*}*/
                }

            }

            .contact-module {
                display: inline-block;
                padding: 30px 0px;
                /*margin-left: 10px;*/

                .module-checkbox {
                    width: 120px;
                    height: 120px;
                    background: #FFFFFF;
                    box-shadow: 0 1px 3px 0 #CBD6E2;

                    &:hover {
                        background-color: #F3F4F7;
                        box-shadow: 0 1px 3px 0 #CBD6E2;
                    }
                    /*p {*/
                    /*    position: relative;*/
                    /*    height: 20px;*/
                    /*    width: 80px;*/
                    /*    left: 8px;*/
                    /*    top: 27px;*/
                    /*    text-align: center;*/
                    /*    font-size: 12px;*/
                    /*    font-family: PingFangSC-Regular;*/
                    /*}*/
                }
            }

            .inquiry-module {
                display: inline-block;
                padding: 30px 0px;
                /*margin-left: 20px;*/
                margin-right: 20px;

                .module-checkbox {
                    width: 120px;
                    height: 120px;
                    background: #FFFFFF;
                    box-shadow: 0 1px 3px 0 #CBD6E2;

                    &:hover {
                        background-color: #F3F4F7;
                        box-shadow: 0 1px 3px 0 #CBD6E2;
                    }
                    /*p {*/
                    /*    position: relative;*/
                    /*    height: 20px;*/
                    /*    width: 80px;*/
                    /*    left: 8px;*/
                    /*    top: 27px;*/
                    /*    text-align: center;*/
                    /*    font-size: 12px;*/
                    /*    font-family: PingFangSC-Regular;*/
                    /*}*/
                }
            }

            .active {
                background-color: #FFFAF8;
            }
        }

    }


    .picked-file-cover {
        border: 1px solid #4285f2;

        > i {
            display: inline;
        }

        &:hover {
            background-color: rgb(243, 244, 247);

            > .ivu-icon {
                opacity: 1;
            }

            > i {
                display: inline;
            }
        }
    }

    .module-mapping-layout {
        .el-tabs__header {
            margin: 0 !important;
        }
        .el-checkbox__inner {
            /*top: -17px !important;*/
        }
        .module-checkbox {
            background: #FFFFFF;
            box-shadow: 0 1px 3px 0 #CBD6E2;
            border-radius: 4px;
            padding: 0 30px 20px 6px;
            border: 1px solid transparent;
            p {
                position: relative;
                height: 20px;
                width: 80px;
                left: 13px;
                top: 6px;
                text-align: center;
                font-size: 12px;
                font-family: PingFangSC-Regular;
            }
        }

        .ivu-checkbox-wrapper-checked {
            border: 1px solid #4285F2;
        }
    }

    p {
        position: relative;
        height: 20px;
        width: 80px;
        left: 13px;
        top: 6px;
        text-align: center;
        font-size: 12px;
        font-family: PingFangSC-Regular;
    }

    .p-1 {
        color: rgba(0, 0, 0, .8);
        /*position: relative;*/
        /*height: 20px;*/
        /*width: 80px;*/
        /*left: 8px;*/
        /*top: 25px;*/
        /*text-align: center;*/
        /*font-size: 12px;*/
        /*font-family: PingFangSC-Regular;*/
    }

    .p-2 {
        color: rgba(0, 0, 0, .4);
        /*position: relative;*/
        /*height: 20px;*/
        /*width: 80px;*/
        /*left: 8px;*/
        /*top: 25px;*/
        /*text-align: center;*/
        /*font-size: 12px;*/
        /*font-family: PingFangSC-Regular;*/
    }

    .module-icon {
        width: 36px;
        height: 36px;
        margin-top: 27px;
        margin-left: 19px
    }
</style>
<style lang="less">
    .module-mapping-layout {
        .el-tabs__header {
            margin: 0 !important;
            .el-tabs__nav-wrap:after {
                height: 1px !important;
            }
        }
        .el-checkbox__inner {
            /*top: -17px !important;*/
        }
        .ivu-checkbox {
            .ivu-checkbox-inner {
                top: -17px;
                border-radius: 50px !important;
                /*border-color:#ffffff;*/
                /*background-color: #4285F2;*/
            }

            .ivu-checkbox-checked {
                /*border-color:#4285F2;*/
            }
        }

        .ivu-tooltip-inner {
            max-width: 350px;
        }

        .ivu-tabs-bar {
            border-width: 0;
            margin-bottom: 0;
            height: 50px;
        }

        .ivu-tabs-tab {
            height: 50px;
            padding: 16px 30px 16px 0 !important;
            margin-right: 0 !important;
        }

        .ivu-tabs-ink-bar {
            height: 0 !important;
            background-color: rgba(0, 0, 0, 0) !important;
        }

        .ivu-tabs-nav,
        .ivu-tabs-tab-active {
            color: #4285F2;
        }

        .ivu-tabs-tab:hover {
            color: #4285F2;
        }

    }
</style>
