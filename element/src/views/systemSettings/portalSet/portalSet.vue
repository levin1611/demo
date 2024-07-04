<template>
    <div>
        qqqq
        <Menu mode="horizontal" class="portal-set-menu" :default-active="activeName" @select="handleVie">
            <MenuItem index="ChatCode">
                <span class="active-text">{{$t('portal_set.chat_set')}}</span>
            </MenuItem>
            <MenuItem index="ServiceOnline">
                <span class="active-text">{{$t('portal_set.service_online')}}</span>
            </MenuItem>
            <MenuItem index="ServiceOffline">
                <span class="active-text">{{$t('portal_set.service_offline')}}</span>
            </MenuItem>
            <MenuItem index="Verbal">
                <span class="active-text">{{$t('portal_set.script_set')}}</span>
            </MenuItem>
        </Menu>
        <keep-alive>
            <component
                    v-bind:is="view"
                    @proForm="proForm">
            </component>
        </keep-alive>
    </div>
</template>
<script>
    import ChatCode from './chatCode/chatCode';
    import ServiceOnline from './serviceOnline/serviceOnline';
    import ServiceOffline from './serviceOffline/serviceOffline';
    import Verbal from './verbal/verbal';

    export default {
        name: 'portal_set',
        components: {
            ChatCode,
            ServiceOnline,
            ServiceOffline,
            // Script,
            Verbal
        },
        created() {

        },
        data() {
            return {
                activeName: 'ChatCode',
                view: 'ChatCode',
                viewList: [
                    {
                        label: this.$t('portal_set.chat_code'),
                        name: 'ChatCode'
                    },
                    {
                        label: this.$t('portal_set.service_online'),
                        name: 'ServiceOnline'
                    },
                    {
                        label: this.$t('portal_set.service_offline'),
                        name: 'ServiceOffline'
                    },
                    {
                        label: this.$t('portal_set.script_set'),
                        name: 'Verbal'
                    }
                ]
            };
        },
        mounted() {
            if (this.$route.params.contacts) {
                this.view = 'Verbal';
                this.activeName = 'Verbal';
            }
        },
        activated() {

        },
        methods: {
            handleVie(v) {
                this.view = v;
            },
            proForm(params) {
                // this.view = params[0];
                // this.productionEditing = params[1];
                // this.productionEditingId = params[2];
            }

        }
    };
</script>
<style>
    @import "portalSet.css";

    .portal-set-menu {
        padding: 0 10px;
        border-bottom: 1px solid #EAEAEA;
        color: rgba(0, 0, 0, 0.6);
    }

    /* 分页标题 */
    .portal-set .title {
        font-size: 18px;
        font-weight: bold;
        margin-left: 26px;
        margin-top: 34px;
    }

    .portal-set .content {
        margin-left: 60px;
        margin-top: 38px;
        font-size: 14px;
        line-height: 36px;
    }

    .portal-set .item {
        margin-bottom: 12px;
        vertical-align: baseline;
    }

    .portal-set .middle {
        vertical-align: middle;
    }

    /* 分页 颜色选择部分 */
    .color-circle-out {
        margin-left: 12px;
        display: inline-block;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        position: relative;
        cursor: pointer;
        /* display: flex; */
    }

    .boxshadow {
        box-shadow: 0 0 2px #000;
    }

    .portal-set .color-circle-in {
        display: inline-block;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background-color: #000;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .portal-set .hide {
        display: none;
    }

    .portal-set .ivu-card-body {
        background-color: #fff;
    }
</style>
<style lang="less" scoped>
    .portal-set-menu {

        .el-menu-item {
            border-bottom: none;
        }
        .is-active {
            padding-top:1px;
            color: #fa8241 !important;
            border-bottom: none;

            .active-text {
                border-bottom: 2px solid #fa8241;
                display: inline-block;
                transition: border-color .3s,color .3s;
            }

        }
    }
</style>
