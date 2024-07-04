<template>
    <div ref="container" style="position: relative;">
        <div @click.stop="showDropdown = true"
             class="enterInput">
            <Tooltip :content="searchDepartmentPeople" placement="top" max-width="600" transfer :disabled="disable_tooltip">
                <Input v-model="searchDepartmentPeople" class="rounded-input" ref="input" @focus="isExpand(true)"
                       @keyup.enter.native="searchPerson" @change="controlTooltip">
                    <Icon @click="isExpand(true)" style="cursor:pointer;margin-top: 12px;" slot="suffix"
                          custom="custom custom-floating-window-arrow" size="12">
                    </Icon>
                </Input>
            </Tooltip>
            <span v-show="false"
                  ref="textWidth" style="color: #333">{{searchDepartmentPeople}}</span>
        </div>
        <div v-show="showDropdown"
             @click.stop
             class="selectBox">
            <ul class="ivu-select-dropdown-list">
                <li class="ivu-select-item myEmailclick" style="overflow: hidden;" v-for="(item,index) in accountList"
                    :value="item.id"
                    :key="index" @mousedown="lookEmail(item,index)">
                    <span style="vertical-align: middle;">{{item.account}}</span>
                    <Icon custom="custom custom-custom-check" size="12"
                          style="margin-left: 10px;vertical-align: middle;color: #4285F4;"
                          v-show="searchDepartmentPeopleArr.length == 0"/>
                </li>
            </ul>
            <div class="treePart" v-show="isTreePart">
                <div class="treeTab" v-show="treeTabShow">
                    <Tree :data="orgTree" :render-content="renderContent" :default-expand-all="true">
                    </Tree>
                    <!-- <div class="footer-button">
                        <span class="t1" @click="cleanSelect">清除</span>
                        <div class="functionBtn" style="text-align: right;padding-top: 3px;padding-right: 16px;">
                            <Button class="cancelallbox" type="minor" size="small">{{ $t('cancel') }}</Button>
                            <Button class="submitSelect" type="primary" size="small" @click="submitSelect"
                                    style="margin-left: 12px;">{{ $t('confirm') }}
                            </Button>
                        </div>
                    </div> -->
                </div>
                <div class="searchTab" v-show="searchTabShow" style="height: 100%;">
                    <div class="searchTextpart">
                        没有"<span>{{recordContent}}</span>"相关的搜索结果
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    import $ from 'jquery';
    // import { HANDLE_HIGHLIGHT } from '@/api/mail.js';

    export default {
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                fullname: state => state.fullName,
                // currentInputInfo: state => state.mail.currentInputInfo,
                // currentSelectedIndex: state => state.mail.currentSelectedIndex,
                // currentAccount: state => state.mail.currentAccount,
                // beforeCheckInfo: state => state.mail.beforeCheckInfo,
                currentAccountIds: state => state.mail.currentAccountIds,
                isFixed: state => state.isFixed
            })
        },
        props: {
            accountList: {
                type: Array,
                default: function() {
                    return [];
                }
            }
        },
        data() {
            return {
                radioValue: '', // 控制单选框

                isSpinShow: true,
                recordContent: '',
                treeTabShow: true,
                searchTabShow: false,
                isTreePart: false,
                disable_tooltip: true,
                selectMail: false,
                selectMailIndex: 0,
                controlSelected: false,
                selectedPersonId: '',
                searchDepartmentPeople: this.$t('mail.accountPlhNew'),
                searchDepartmentPeopleArr: [],
                searchDepartmentPeopleIdArr: [],
                showDropdown: false,
                orgTree: [],
                selectedPersonInfo: [],
                controlDepartment: [],
                departmentPeople: [],

                // 仪表盘带 personId 跳转到邮件系统
                // 暂存 personId
                mailBelongUserId: null
            };
        },
        created() {
            // 处理仪表盘带 userId 筛选条件跳转到邮件系统
            // if (localStorage.getItem('dashboard_mail_filters')) {
            //     // 提取筛选条件 Map 数组
            //     const filterConsObj = this.$options.filters.parseObject(localStorage.getItem('dashboard_mail_filters'));
            //     if (filterConsObj && filterConsObj.personId) {
            //         // 存储要筛选的 userId
            //         this.mailBelongUserId = filterConsObj.personId;
            //         // 修改 Input 框文本
            //         this.$store.commit('set_currentInputInfo', filterConsObj.personName);
            //     }
            // }

            // if (this.currentInputInfo) {
            //     this.searchDepartmentPeople = this.currentInputInfo;
            //     // 进入组件时选中对应的下属
            //     this.radioValue = this.currentInputInfo.indexOf('-') !== -1 ? this.currentInputInfo.slice((this.currentInputInfo.indexOf('-') + 2)) : this.currentInputInfo;
            // }
            // this.selectMailIndex = this.currentSelectedIndex;

            // // 如果是查看下属情况下
            // if (this.currentInputInfo.indexOf('-') !== -1 || localStorage.getItem('dashboard_mail_filters')) {
            //     // 置空index
            //     this.selectMailIndex = null;
            // }
        },
        mounted() {
            document.addEventListener('click', this.onClickFunc);
            // 判断当前input中文字的宽度 如果大于220 则tooltip显示
            this.$nextTick(() => {
                this.disable_tooltip = (this.$refs.textWidth && $(this.$refs.textWidth).width()) < 220;
            });
        },
        methods: {
            /* 获取当前企业的人员数据 */
            get_user_manage() {
                util.ajaxJson({
                    url: '/new-privilege/manage/getusers',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        userId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        const managePeople = res.data.data;
                        const changeString = managePeople.join();
                        if (changeString === this.userId) {
                            this.isTreePart = false;
                        } else {
                            this.isTreePart = true;
                            this.get_department_info();
                        }
                    } else {
                        this.isTreePart = false;
                        this.$Message.error('获取企业部门数据失败，请刷新后重试');
                    }
                }).catch(() => {
                    this.isTreePart = false;
                    this.$Message.error('获取企业部门数据失败，请刷新后重试');
                });
            },
            /* 浮层显示控制 */
            controlTooltip() {
                this.disable_tooltip = true;
                if (this.searchDepartmentPeople === '') {
                    this.getDepartmentTree();
                    this.treeTabShow = true;
                    this.searchTabShow = false;
                }
            },
            /* 获取企业部门数据 */
            get_department_info() {
                util.ajaxJson({
                    url: '/new-privilege/department/getCrmManageDepartments',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        userId: this.userId
                    }
                }).then(res => {
                    this.isSpinShow = false;
                    if (res.data.code === '1') {
                        this.controlDepartment = res.data.data;
                        util.ajaxJson({
                            url: 'new-privilege/deptContact/getSubContactNoEmail',
                            method: 'post',
                            data: {
                                orgId: this.orgId,
                                userId: this.userId
                            }
                        }).then(res => {
                            if (res.data.code === '1') {
                                this.departmentPeople = res.data.data;
                                this.$nextTick(() => {
                                    this.getDepartmentTree();
                                });
                            } else {
                                this.$Message.error('获取企业部门数据失败，请刷新后重试');
                            }
                        }).catch(() => {
                            this.$Message.error('获取企业部门数据失败，请刷新后重试');
                        });
                    } else {
                        this.$Message.error('获取企业部门数据失败，请刷新后重试');
                    }
                }).catch(() => {
                    this.isSpinShow = false;
                    this.$Message.error('获取企业部门数据失败，请刷新后重试');
                });
            },
            /* 过滤出input框中的相关角色的邮件 */
            submitSelect() {
                // const accountIds = [];
                // this.recursiveSelectTree(this.orgTree);
                // this.$store.commit('set_beforeCheckInfo', this.selectedPersonInfo);
                // if (!this.selectedPersonInfo.length) {
                //     this.$Message.info('请勾选下属后点击确定');
                //     return;
                // }

                // const nameAndEmail = `${this.selectedPersonInfo[0].department} - ${this.selectedPersonInfo[0].name}`;

                // const emailName = this.selectedPersonInfo[0].emailAddress.split(',');
                // accountIds.push(this.selectedPersonInfo[0].userId);
                // this.$store.commit('setCurrentAccount', emailName);
                // this.$store.commit('setCurrentAccountIds', accountIds);

                // this.$store.commit('set_currentInputInfo', nameAndEmail);

                // this.searchDepartmentPeople = this.currentInputInfo;
                // this.showDropdown = false;
                this.$emit('SelectedPerson', this.searchDepartmentPeopleIdArr);
                // this.selectMailIndex = null;
                // this.selectedPersonInfo = [];
                // this.showDropdown = false;
            },
            /* 查看邮件 */
            lookEmail(item, index) {
                this.searchDepartmentPeople = this.$t('mail.accountPlhNew');
                this.searchDepartmentPeopleArr = [];
                this.searchDepartmentPeopleIdArr = [];
                this.$emit('SelectedPerson', this.searchDepartmentPeopleIdArr);
                this.get_user_manage();
                // 重置单选框
                // this.radioValue = '';

                // this.$store.commit('set_beforeCheckInfo', []);
                // this.$store.commit('set_currentInputInfo', item.account);
                // this.$store.commit('set_currentSelectedIndex', index);
                // this.$store.commit('set_currentPersonId', this.userId);
                // this.$store.commit('setCurrentAccountIds', []);
                // const emailName = [];
                // emailName.push(item.account);
                // this.$store.commit('setCurrentAccount', emailName);
                // this.searchDepartmentPeople = item.account;
                // this.selectMailIndex = index;
                // this.showDropdown = false;
                // const mailObject = {
                //     account: item.account
                // };
                // this.$emit('EmailFlag', mailObject);
                // this.searchTabShow = false;
                // this.treeTabShow = true;

                // this.getDepartmentTree();
            },
            recursiveSelectTree(tree) {
                tree.forEach(item => {
                    if (item.children.length) {
                        this.recursiveSelectTree(item.children);
                    } else {
                        if (item.checked) {
                            const personObj = {
                                id: item.targetUserId,
                                userId: item.id,
                                emailAddress: item.emailAddress,
                                name: item.title,
                                department: item.parent_name
                            };
                            this.selectedPersonInfo.push(personObj);
                        }
                    }
                });
            },
            recursiveTree(tree, id, email) {
                tree.forEach(item => {
                    if (item.children.length) {
                        this.recursiveTree(item.children, id, email);
                    } else {
                        if (id === item.targetUserId) {
                            // item.disabled = false;
                            if (email === item.emailAddress) {
                                this.$set(item, 'checked', !item.checked);
                                if (item.checked) {
                                    if (!this.searchDepartmentPeopleArr.find((items) => items === item.title)) {
                                        this.searchDepartmentPeopleArr.push(item.title);
                                        this.searchDepartmentPeopleIdArr.push(item.targetUserId.toString());
                                        this.searchDepartmentPeople = this.searchDepartmentPeopleArr.join(',');
                                    }
                                } else {
                                    const targetItem = this.searchDepartmentPeopleIdArr.findIndex((items) => {
                                        return items / 1 === item.targetUserId / 1;
                                    });
                                    this.searchDepartmentPeopleArr.splice(this.searchDepartmentPeopleArr.findIndex((items) => items === item.title), 1);
                                    this.searchDepartmentPeopleIdArr.splice(targetItem, 1);
                                    this.searchDepartmentPeople = this.searchDepartmentPeopleArr.join(',');
                                }
                                if (this.searchDepartmentPeopleArr.length === 0) {
                                    this.searchDepartmentPeople = this.$t('mail.accountPlhNew');
                                }
                            }
                        } else {
                            // item.checked = false;
                            // item.disabled = true;
                        }
                    }
                });
            },
            /* 点击取消的事件回调 */
            cancelCheckbox(tree, id, email) {
                return tree.map(item => {
                    if (item.children.length) {
                        const temp = this.cancelCheckbox(item.children, id, email);
                        if (temp.every(item => !item.checked)) {
                            item.checked = false;
                        }
                        item.children = temp;
                    } else {
                        if (id === item.targetUserId && email === item.emailAddress) {
                            item.checked = false;
                        } else {
                            item.disabled = false;
                        }
                    }
                    return item;
                });
            },
            /* 清空树结构勾选状态 */
            recursiveclearTree(tree) {
                tree.forEach(item => {
                    if (item.children.length) {
                        item.checked = false;
                        item.disabled = false;
                        this.recursiveclearTree(item.children);
                    } else {
                        item.checked = false;
                        item.disabled = false;
                    }
                });
            },
            /* 人员搜索 */
            searchPerson() {
                this.showDropdown = true;
                const strSearched = this.searchDepartmentPeople || ''; // 要搜索的文字
                const tempTreeData = this.get_tree(this.controlDepartment, this.departmentPeople, []); // 全量 tree_data
                function searchTitleRecursively(nodes, strSearched) {
                    return nodes.map(node => {
                        if (node.searchKey.includes(strSearched)) {
                            node.isSearch = 1;
                            return node;
                        } else if (node.children.length) {
                            node.children = searchTitleRecursively(node.children, strSearched);
                            if (node.children.length) {
                                return node;
                            } else {
                                return undefined;
                            }
                        } else {
                            return undefined;
                        }
                    }).filter(item => item);
                }

                this.recordContent = this.searchDepartmentPeople;
                const treeData = searchTitleRecursively(tempTreeData, strSearched);
                if (!treeData.length) {
                    this.treeTabShow = false;
                    this.searchTabShow = true;
                } else {
                    this.treeTabShow = true;
                    this.searchTabShow = false;
                }
                this.orgTree = treeData;
            },
            /* 生成部门书结构数据 */
            get_tree(paramArr, userList, checkArr) {
                // 去重 重复的用户名 + 将重复的用户的邮箱地址合并到一起
                for (let i = 0; i < userList.length; i++) {
                    for (let j = i + 1; j < userList.length; j++) {
                        if (userList[i].parentId === userList[j].parentId && userList[i].targetUserId === userList[j].targetUserId) { // 第一个等同于第二个，splice方法删除第二个
                            // 邮箱地址合并到一起
                            userList[i].emailAddress += `,${userList[j].emailAddress}`;
                            userList.splice(j, 1);
                            j--;
                        }
                    }
                }

                // 处理人员 增加power、type、check字段
                userList = userList.map(item => {
                    const obj = {};
                    obj.parentId = item.deptId;
                    obj.name = item.fullname;
                    obj.power = item.manageName;
                    obj.id = item.id;
                    obj.targetUserId = item.targetUserId;
                    obj.check = false;
                    obj.emailAddress = item.emailAddress;
                    obj.type = 'person';
                    return obj;
                });

                // 如果有选中的,则需要把选中项的check变为true
                if (checkArr) {
                    for (const checkItem of checkArr) {
                        for (const userItem of userList) {
                            if (checkItem.userId === userItem.id) {
                                userItem.check = true;
                            }
                        }
                    }
                }

                // 处理部门列表 提取原数据的参数,放入新的数组  存非一级列表的数据
                const arr = paramArr.map(item => {
                    const obj = {};
                    obj.parentId = item.parentId;
                    obj.name = item.name;
                    obj.id = item.id;
                    obj.targetUserId = item.targetUserId;
                    return obj;
                });

                // 储存一级列表
                let parentArr = [];
                // 处理二级部门用的
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].parentId === 0) {
                        // 在新建的数组中添加一级列表
                        parentArr.push(arr[i]);
                        // 删除arr数组中的一级列表
                        arr.splice(i, 1);
                        i = i - 1;
                    }
                }

                // 传入一级列表 做相应处理,增加字段(children、展开expand、searchKey等)
                function structureParentArr(arr) {
                    return arr.map(item => {
                        const obj = {};
                        obj.title = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        // obj.checked = item.check;
                        obj.expand = true;
                        obj.children = [];
                        obj.searchKey = '';
                        obj.isSearch = 0;
                        return obj;
                    });
                }

                parentArr = structureParentArr(parentArr);

                function buildChild(parentArr, arr) {
                    for (let j = 0; j < parentArr.length; j++) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].parentId === parentArr[j].id) {
                                parentArr[j].checked = false;
                                const obj = {};
                                obj.show_info = arr;
                                obj.title = arr[i].name;
                                obj.id = arr[i].id;
                                obj.targetUserId = arr[i].targetUserId;
                                obj.emailAddress = arr[i].emailAddress;
                                obj.power = arr[i].power;
                                obj.parentId = arr[i].parentId;
                                obj.grandpa_id = parentArr[j].parentId;
                                obj.parent_name = parentArr[j].title;
                                if (arr[i].category === 1) {
                                    obj.menu = 'department';
                                } else {
                                    obj.menu = 'person';
                                }
                                obj.type = arr[i].type;
                                obj.disabled = false;
                                obj.expand = true;
                                obj.checked = arr[i].check;
                                obj.children = [];
                                obj.searchKey = arr[i].name + arr[i].emailAddress;
                                obj.isSearch = 0;
                                parentArr[j].children.push(obj);
                                arr.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }
                    if (arr.length) {
                        for (const childItem of parentArr) {
                            if (childItem.children.length) {
                                buildChild(childItem.children, arr);
                            }
                        }
                    }

                    return parentArr;
                }

                // 将非一级列表和用户列表合并
                const newArr = arr.concat(userList);
                return buildChild(parentArr, newArr);
            },
            /**
             * 防抖函数
             * @param {function} func 需要防抖的函数
             * @param {number} wait 等待时间
             * @param {immediate} immediate 立即执行
             * @return {function}   返回客户调用函数
             */
            debounce(func, wait, immediate) {
                let timeout;
                return function() {
                    const context = this;
                    const args = arguments;

                    if (timeout) clearTimeout(timeout);
                    if (immediate) {
                        const callNow = !timeout;
                        timeout = setTimeout(function() {
                            timeout = null;
                        }, wait);
                        if (callNow) func.apply(context, args);
                    } else {
                        timeout = setTimeout(function() {
                            func.apply(context, args);
                        }, wait);
                    }
                };
            },
            /* 展开树节点 */
            isExpand(type) {
                if (this.showDropdown) return;
                this.$nextTick(() => {
                    // this.get_department_info();
                    this.get_user_manage();
                    this.showDropdown = type;
                    // if (type) {
                    //     this.$emit('closeOtherPoptip');
                    // }
                    // if(!type){
                    //   this.showDropdown = type;
                    // }else if(this.keyword){
                    //   this.showDropdown = type;
                    // }
                });
            },
            /* 部门树渲染函数 */
            renderContent(h, { data }) {
                if (data.type) {
                    // 如果在input中搜索了关键字,则走上面
                    if (data.isSearch === 1) {
                        // const HighLightResult = HANDLE_HIGHLIGHT(`${data.title}`, this.searchDepartmentPeople, true);
                        return h('span', {
                            // class: 'piwik_mail_subordinate_list_item' // 埋点class
                        }, [
                            h('Checkbox', {
                                props: {
                                    label: data.title,
                                    value: data.checked
                                },
                                on: {
                                    change: (bool) => {
                                        // 选中当前的下属
                                        this.radioValue = data.title;
                                        // bool = data.title;
                                        // if (bool) {
                                        this.recursiveTree(this.orgTree, data.targetUserId, data.emailAddress);

                                        // 过滤出input框中的相关角色的邮件
                                        this.submitSelect();
                                        // } else {
                                        //     this.orgTree = this.cancelCheckbox(this.orgTree, data.createUserId, data.emailAddress);
                                        // }
                                    }
                                },
                                style: {}
                            })
                        ]);
                    } else {
                        return h('span', {
                            // class: 'piwik_mail_subordinate_list_item' // 埋点class
                        }, [
                            h('Checkbox', {
                                props: {
                                    label: data.title,
                                    value: data.checked
                                },
                                on: {
                                    change: (bool) => {
                                        // 选中当前的下属
                                        this.radioValue = data.title;
                                        // bool = data.checked;
                                        // if (bool) {
                                        this.recursiveTree(this.orgTree, data.targetUserId, data.emailAddress);
                                        // 过滤出input框中的相关角色的邮件
                                        this.submitSelect();
                                        // } else {
                                        //     this.orgTree = this.cancelCheckbox(this.orgTree, data.createUserId, data.emailAddress);
                                        // }
                                    }
                                }
                            })
                        ]);
                    }
                } else {
                    return h('span', {}, [
                        h('Icon', {
                            props: {
                                size: '16',
                                custom: 'custom custom-fp-paper-file'
                            },
                            style: {
                                color: 'rgb(250, 130, 65)',
                                marginRight: '5px',
                                marginLeft: '5px',
                                paddingBottom: '1px'
                            }
                        }),
                        h('span', {
                            style: {
                                display: 'inline-block',
                                verticalAlign: 'middle'
                            }
                        }, data.title)

                    ]);
                }
            },
            getDepartmentTree() {
                // this.controlDepartment  可以查看的部门
                // this.departmentPeople   所有部门的人员
                // this.orgTree  最后要返回的树

                // 仪表盘带 userId 筛选跳转到邮件系统, 默认勾选此 userId 关联的所有邮箱
                // if (this.mailBelongUserId) {
                //     this.$store.commit('setCurrentAccountIds', this.departmentPeople.filter(item => `${item.createUserId}` === `${this.mailBelongUserId}`).map(item => item.id));
                //     // 清空 userId 数据
                //     this.mailBelongUserId = null;
                // }
                // const checkedArr = this.currentAccountIds.map(item => {
                //     const obj = {};
                //     obj.userId = item;
                //     return obj;
                // });
                this.orgTree = this.get_tree(this.controlDepartment, this.departmentPeople);
                if (this.searchDepartmentPeopleIdArr.length) {
                    this.beforeCheckTree(this.orgTree, this.searchDepartmentPeopleIdArr);
                }
            },
            beforeCheckTree(tree, beforecheck) {
                tree.forEach(item => {
                    if (item.children.length) {
                        this.beforeCheckTree(item.children, beforecheck);
                    } else {
                        beforecheck.forEach(obj => {
                            // creatId不同的先抛出  一定disabled 存在creatId相同但email不同的情况 只让俩两者全符合才true
                            if (item.targetUserId / 1 === obj / 1) {
                                item.checked = true;
                            } else {
                                item.disabled = true;
                            }
                        });
                    }
                });
            },

            // 监听 document 点击, 确保点击此组件外部时, 弹框关闭
            onClickFunc(e) {
                if (!this.$refs.container) {
                    return;
                }
                if (!this.$refs.container.contains(e.target)) {
                    this.showDropdown = false;
                }
            }
        },
        updated() {
            // 判断当前input中文字的宽度 如果大于220 则tooltip显示
            this.$nextTick(() => {
                this.disable_tooltip = !(this.$refs.textWidth && $(this.$refs.textWidth).width() >= 220);
            });
        },
        beforeDestroy() {
            document.removeEventListener('click', this.onClickFunc);
        }

    };
</script>

<style lang="less" scoped>
    .enterInput {
        width: 151px;
        float: right;
        margin-left: 20px;
        margin-right: 13px;
    }
    .selectBox {
        width: 350px;
        background-color: #fff;
        box-sizing: border-box;
        border-radius: 4px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, .2);
        z-index: 9999 !important;
        position: absolute;
        right: 0px;
        top: 41px;

        /deep/ .ivu-select-dropdown-list {
            border-bottom: 1px solid #EAEAEA;
            padding: 6px 0;
            max-height: 165px;
            overflow-y: scroll;
            .ivu-select-item {
                font-size: 12px !important;
            }
        }

        .treePart {
            height: 280px;
            overflow: auto;
            box-sizing: border-box;
            font-size: 12px;

            /deep/ .el-tree {
                height: 280px;
                overflow-y: scroll;

                .el-tree-node {
                    padding-left: 16px;
                    .el-checkbox {
                        margin-right: 6px;
                    }
                }
            }

            .footer-button {
                position: relative;

                .t1 {
                    font-family: PingFangSC-Regular;
                    font-size: 12px;
                    color: #3B78DE;
                    letter-spacing: 0;
                    position: absolute;
                    left: 16px;
                    top: 7px;
                    cursor: pointer;
                }

                .t2 {
                    color: #3B78DE;
                }
            }
        }

    }

    /deep/ .rounded-input input {
        border-radius: 4px;
        width: 160px;
        height:35px;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        -webkit-text-overflow: ellipsis;
        -moz-text-overflow: ellipsis;
        white-space: nowrap;
    }

    /deep/ .rounded-input-small input {
        border-radius: 4px;
        width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        -webkit-text-overflow: ellipsis;
        -moz-text-overflow: ellipsis;
        white-space: nowrap;
    }

    .searchContentHight {
        height: 320px;
    }

    /deep/ .el-button {
        font-size: 12px;
    }
    /deep/ .el-button--primary {
        background-color: #7b98b6;
        border-color: #7b98b6;
        &:hover {
            background-color: #95adc5;
            border-color: #95adc5;
        }
    }

    .keyword {
        color: red;
    }

    /deep/ .ivu-tree-empty {
        padding: 7px 16px;
        font-size: 12px;
        color: rgba(0, 0, 0, .8);
    }

    .searchTextpart {
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.28);
        letter-spacing: 0;
        text-align: center;
        line-height: 280px;
    }

</style>
