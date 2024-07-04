<template>
    <transition name="slide-fade">
        <div class="main-shortcuts">
            <div class="main-shortcuts-top">
                <div style="display: inline-block; width: 95%">
                    <div style="display: inline-block"><span style="font-weight: bold;font-size: 16px;color: #495060;">{{$t('chat.verbal')}}</span>
                    </div>
                    <div style="display: inline-block">
                        <span v-if="!isShowSearch" @click="switchView"><Icon size="20" type="ios-search-strong"></Icon></span>
                        <Input class="verbal-search" icon="ios-search-strong" v-model="verbalSearch"
                               @on-change="searchTxt" v-else :placeholder="$t('chat.serchHolder')"></Input>
                    </div>
                </div>
                <span style="position: absolute;right: 15px;cursor: pointer" @click="closeVerbal"><Icon size="20"
                                                                                                        type="close-round"></Icon></span>
            </div>
            <div style="margin:20px;">
                {{$t('chat.sortTxt')}}
                <Select v-model="verbalSort" size="small" @on-change="sortChange" style="width:90px;margin-left:12px;">
                    <Option v-for="item in verbalSortListTemp" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
            </div>
            <div class="main-shortcuts-block">
                <Spin fix v-if="refreshVerbal">
                    <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                    <div>{{$t('chat.verbalLoading')}}</div>
                </Spin>
                <div
                        class="main-shortcuts-list"
                        v-for="(item,index) in verbalListTemp"
                        :key="index"
                        :class="{'main-shortcuts-list-active': currIndex==index}"
                        @click="selectVerbal(item,index)">
                    <div style="font-weight: bold;font-size: 14px;margin-bottom:4px;">{{item.abbr}}</div>
                    <div style="font-size: 12px;">{{item.name}}</div>
                </div>
            </div>
        </div>
    </transition>
</template>
<script>
    import util from '@/libs/util';
    import {mapState} from 'vuex';

    export default {
        name: 'Shortcuts',
        props: {
            isShortcutsShow: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                refreshVerbal: false,
                verbalSort: 0, // 话术分类
                verbalSortListTemp: [],
                verbalSortList: [
                    {
                        id: 0,
                        name: '全部'
                    }
                ], // 话术分类列表
                currIndex: -1,
                verbalSearch: '', // 搜素话术
                isShowSearch: false,
                verbalList: [],
                verbalListTemp: [],
                verbalListTemp2: []
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            })
        },
        methods: {
            // 获取话术
            getVerbal() {
                this.refreshVerbal = true;
                util.ajax({
                    url: '/cuss-login/config/getReply',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    this.refreshVerbal = false;
                    if (response.data.code === '1') {
                        let sortList = [];
                        let List = [];
                        let data = response.data.data;
                        let L = data.length;
                        for (let i = 0; i < L; i++) {
                            let obj = {
                                id: data[i].id,
                                name: data[i].name
                            };
                            sortList.push(obj);
                            for (let j = 0; j < data[i].list.length; j++) {
                                List.push(data[i].list[j]);
                            }
                        }
                        this.verbalSortListTemp = this.verbalSortList.concat(sortList);
                        this.verbalListTemp = List;
                        this.verbalListTemp2 = List;
                        this.verbalList = data;
                    }
                });
            },
            searchTxt() {
                this.searchVerbal();
            },
            sortChange() {
                this.searchVerbal();
            },
            searchVerbal() {
                console.log(this.verbalSearch);
                console.log(this.verbalSort);
                let list = [];
                if (this.verbalSort == 0) {
                    let temp = this.verbalListTemp2.concat();
                    for (let i = 0; i < temp.length; i++) {
                        if ((temp[i].abbr.indexOf(this.verbalSearch) !== -1) || (temp[i].name.indexOf(this.verbalSearch) != -1)) {
                            list.push(temp[i]);
                        }
                    }
                } else {
                    for (let i = 0; i < this.verbalList.length; i++) {
                        if (this.verbalList[i].id == this.verbalSort) {
                            for (let j = 0; j < this.verbalList[i].list.length; j++) {
                                if ((this.verbalList[i].list[j].abbr.indexOf(this.verbalSearch) !== -1) || (this.verbalList[i].list[j].name.indexOf(this.verbalSearch) !== -1)) {
                                    list.push(this.verbalList[i].list[j]);
                                }
                            }
                        }
                    }
                }
                this.verbalListTemp = list;
            },
            // 选中话术
            selectVerbal(item, index) {
                this.$emit('verbalSelected', item);
                this.$emit('letShortcutsShow', false);
            },
            closeVerbal() {
                this.$emit('letShortcutsShow', false);
            },
            switchView() {
                this.isShowSearch = true;
            },
            // 跳转到话术管理
            toProtalSet() {
                this.$router.push({
                    name: 'script_set',
                    params: {
                        contacts: 'verbal'
                    }
                });
            }
        },
        created() {
            this.getVerbal();
        }
    };
</script>
<style lang="less">
    /* 可以设置不同的进入和离开动画 */
    /* 设置持续时间和动画函数 */
    .slide-fade-enter-active {
        transition: all .5s ease;
    }

    .slide-fade-leave-active {
        transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }

    .slide-fade-enter, .slide-fade-leave-to
        /* .slide-fade-leave-active for below version 2.1.8 */ {
        transform: translateX(10px);
        opacity: 0;
    }

    .main-shortcuts {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 99;
        background-color: #ffffff;

        &-top {
            height: 30px;
            line-height: 30px;
            margin: 20px;
        }

        &-block {
            position: absolute;
            top: 120px;
            left: 0;
            right: 0;
            bottom: 0;
            overflow-y: auto;
        }

        &-list {
            cursor: pointer;
            color: rgba(0, 0, 0, 0.80);
            padding: 10px 20px;
            box-shadow: inset 0 -1px 0 0 #F5F5F5;

            &:hover {
                color: #FA8241;
            }
        }

        &-list-active {
            color: #FA8241;
        }
    }
</style>
